import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import chains from "@/config/chains";
import { SCAN_PAY_SOURCE_CHAIN } from "@/config";
import oneClickService from "@/services/oneclick";
import { useConfigStore } from "@/stores/use-config";
import useWalletStore from "@/stores/use-wallet";
import Big from "big.js";
import { usdtChains } from "@/config/tokens/usdt";
import { usdcChains } from "@/config/tokens/usdc";
import useToast from "@/hooks/use-toast";
import { useHistoryStore, isPendingStatus } from "@/stores/use-history";

type QuoteResponse = {
  quote: {
    depositAddress: string;
    timeEstimate: number;
    [key: string]: any;
  };
  quoteRequest: {
    recipient: string;
    [key: string]: any;
  };
  [key: string]: any;
};

export default function usePayment() {
  const { chainName, depositAddress } = useParams<{ chainName: string; depositAddress: string }>();
  const navigate = useNavigate();
  const configStore = useConfigStore();
  const walletStore = useWalletStore();
  const toast = useToast();
  const historyStore = useHistoryStore();
  
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quoteStartTime, setQuoteStartTime] = useState<number>(0);
  const [deadlineTime, setDeadlineTime] = useState<number>(0);
  const [paymentUri, setPaymentUri] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRefreshedRef = useRef<boolean>(false);
  const navigateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial quote data from sessionStorage
  useEffect(() => {
    if (depositAddress) {
      const stored = sessionStorage.getItem(`scan_quote_${depositAddress}`);
      if (stored) {
        try {
          setQuoteData(JSON.parse(stored));
        } catch (error) {
          console.error("Failed to parse quote data:", error);
          navigate("/scan");
        }
      } else {
        navigate("/scan");
      }
    }
  }, [depositAddress, navigate]);

  // Fetch status data when component mounts
  useEffect(() => {
    const fetchStatus = async () => {
      if (!depositAddress) return;

      try {
        setIsLoadingStatus(true);
        const result = await oneClickService.getStatus({
          depositAddress: depositAddress
        });
        setStatusData(result.data);

        // Set quote start time (timestamp) and deadline for countdown calculation
        if (result.data?.quoteResponse?.quote?.deadline && result.data?.quoteResponse?.timestamp) {
          const deadline = new Date(result.data.quoteResponse.quote.deadline).getTime();
          const startTime = new Date(result.data.quoteResponse.timestamp).getTime();
          const now = Date.now();
          setDeadlineTime(deadline);
          setQuoteStartTime(startTime);
          // Initialize timeRemaining with the actual remaining time
          setTimeRemaining(Math.max(0, deadline - now));
          hasRefreshedRef.current = false; // Reset refresh flag when new status is loaded
        }
      } catch (error) {
        console.error("Failed to fetch status:", error);
        toast.fail({
          title: "Transfer information request failed or does not exist"
        });
        // Navigate back to /scan page after showing the error message
        navigateTimeoutRef.current = setTimeout(() => {
          navigate("/scan");
          navigateTimeoutRef.current = null;
        }, 1500);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchStatus();

    // Cleanup function to clear timeout on unmount or dependency change
    return () => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
        navigateTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositAddress]);

  // Refresh quote when deadline expires
  const refreshQuote = useCallback(async () => {
    if (isRefreshing || hasRefreshedRef.current || !statusData?.quoteResponse?.quoteRequest) return;

    hasRefreshedRef.current = true;
    setIsRefreshing(true);
    try {
      const quoteRequest = statusData.quoteResponse.quoteRequest;

      const quoteRes = await oneClickService.quote({
        dry: false,
        slippageTolerance: quoteRequest.slippageTolerance || configStore.slippage * 100,
        originAsset: quoteRequest.originAsset,
        destinationAsset: quoteRequest.destinationAsset,
        amount: quoteRequest.amount,
        refundTo: quoteRequest.refundTo,
        refundType: quoteRequest.refundType,
        recipient: quoteRequest.recipient
      });

      const newDepositAddress = quoteRes.data?.quote?.depositAddress;
      if (newDepositAddress && chainName) {
        // Store new quote data
        sessionStorage.setItem(`scan_quote_${newDepositAddress}`, JSON.stringify(quoteRes.data));
        // Navigate to new deposit address with same chain name
        navigate(`/scan/${chainName}/${newDepositAddress}`, { replace: true });
      }
    } catch (error) {
      console.error("Failed to refresh quote:", error);
      hasRefreshedRef.current = false; // Reset on error so it can retry
      setIsRefreshing(false);
    }
  }, [statusData, isRefreshing, navigate, configStore.slippage, chainName]);

  // Countdown timer and auto-refresh logic
  useEffect(() => {
    if (!statusData?.quoteResponse?.quote?.deadline || !deadlineTime || !quoteStartTime) return;

    const deadline = deadlineTime;

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = Math.max(0, deadline - now);
      setTimeRemaining(remaining);

      // If deadline passed, refresh quote (only once)
      if (remaining === 0 && !isRefreshing && !hasRefreshedRef.current && statusData?.quoteResponse?.quoteRequest) {
        refreshQuote();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(interval);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [statusData, deadlineTime, quoteStartTime, isRefreshing, refreshQuote]);

  // Get source chain info
  const sourceChain = useMemo(() => {
    return chains[SCAN_PAY_SOURCE_CHAIN as keyof typeof chains];
  }, []);

  // Get destination chain info from URL chainName parameter
  const destinationChain = useMemo(() => {
    if (!chainName) return null;
    return chains[chainName as keyof typeof chains] || null;
  }, [chainName]);

  const recipientAddress = quoteData?.quoteRequest?.recipient || "";

  // Generate payment URI for wallet scanning (TokenPocket compatible)
  useEffect(() => {
    const buildPaymentUri = async () => {
      if (!depositAddress || !quoteData?.quoteRequest) {
        setPaymentUri(depositAddress || "");
        return;
      }

      const amount = quoteData.quoteRequest.amount || "";

      // Determine token type (USDT or USDC) from walletStore
      const isUSDT = walletStore.selectedToken === "USDT";
      const tokenChains = isUSDT ? usdtChains : usdcChains;

      // Get token info for source chain (currently TRON)
      const sourceTokenInfo = tokenChains[SCAN_PAY_SOURCE_CHAIN as keyof typeof tokenChains];
      if (!sourceTokenInfo || !sourceTokenInfo.contractAddress) {
        setPaymentUri(depositAddress);
        return;
      }

      // Generate payment URI based on source chain type
      if (SCAN_PAY_SOURCE_CHAIN === "tron") {
        try {
          const tokenAddress = sourceTokenInfo.contractAddress;
          const tokenDecimals = (sourceTokenInfo as any).decimals || 6;
          const amountReadable = Big(amount).div(10 ** tokenDecimals).toString();

          const receiptQrStr = `tron:${depositAddress}?amount=${amountReadable}&token=${tokenAddress}`;

          setPaymentUri(receiptQrStr);
        } catch (error) {
          console.error('Error building TRON transaction:', error);
          setPaymentUri(depositAddress);
        }
      } else if (chains[SCAN_PAY_SOURCE_CHAIN as keyof typeof chains]?.chainType === "evm") {
        // FIXME This part has not been verified yet
        // EVM chains use EIP-681 format
        const sourceChain = chains[SCAN_PAY_SOURCE_CHAIN as keyof typeof chains];
        const chainId = sourceChain?.chainId;
        const tokenAddress = sourceTokenInfo.contractAddress;

        if (!chainId || !tokenAddress) {
          setPaymentUri(depositAddress);
          return;
        }

        // EIP-681 format for token transfer
        setPaymentUri(`ethereum:${depositAddress}@${chainId}/transfer?address=${tokenAddress}&uint256=${amount}`);
      } else {
        // Fallback to plain address
        setPaymentUri(depositAddress);
      }
    };

    buildPaymentUri();
  }, [depositAddress, quoteData, walletStore.selectedToken]);

  // Get time estimate from status response, fallback to quote data
  const timeEstimate = useMemo(() => {
    const estimate = statusData?.quoteResponse?.quote?.timeEstimate || quoteData?.quote?.timeEstimate;
    return estimate || 0;
  }, [statusData, quoteData]);

  // Format time estimate (reference: result.tsx)
  const formatTimeEstimate = useMemo(() => {
    if (!timeEstimate) {
      return "-";
    }
    if (Big(timeEstimate).lte(60)) {
      return `${timeEstimate} s`;
    }
    if (Big(timeEstimate).lte(3600)) {
      return `${Big(timeEstimate).div(60).toFixed(2)} min`;
    }
    return `${Big(timeEstimate).div(3600).toFixed(2)} hour`;
  }, [timeEstimate]);

  // Calculate countdown percentage and display time
  const countdownInfo = useMemo(() => {
    if (!deadlineTime || !quoteStartTime || timeRemaining === 0) {
      return { percentage: 0, displayTime: "00:00:00" };
    }

    // Calculate total duration from quote timestamp to deadline
    const totalDuration = deadlineTime - quoteStartTime;
    // Percentage decreases as timeRemaining decreases
    const percentage = totalDuration > 0 ? Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100)) : 0;

    const hours = Math.floor(timeRemaining / 3600000);
    const minutes = Math.floor((timeRemaining % 3600000) / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);

    let displayTime: string;
    if (hours > 0) {
      displayTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      displayTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    return { percentage, displayTime };
  }, [timeRemaining, deadlineTime, quoteStartTime]);

  // Get status from history store
  const transferStatus = depositAddress ? historyStore.status[depositAddress] : null;

  // Calculate progress steps state based on status
  const progressSteps = useMemo(() => {
    const steps = [
      { label: "Waiting for Payment", index: 0 },
      { label: "Payment Detected", index: 1 },
      { label: "Bridging", index: 2 },
      { label: "Completed", index: 3 },
    ];

    if (!transferStatus) {
      // Default: first step active
      return steps.map((step) => ({
        ...step,
        active: step.index === 0,
        completed: false,
        failed: false,
      }));
    }

    const status = transferStatus;
    let activeIndex = 0;
    let isFailed = false;

    if (status === "PENDING_DEPOSIT") {
      activeIndex = 0; // Step 1: Waiting for Payment
    } else if (status === "KNOWN_DEPOSIT_TX" || status === "INCOMPLETE_DEPOSIT") {
      activeIndex = 1; // Step 2: Payment Detected
    } else if (status === "PROCESSING") {
      activeIndex = 2; // Step 3: Bridging
    } else if (status === "SUCCESS") {
      activeIndex = 3; // Step 4: Completed
    } else {
      // FAILED, REFUNDED, etc.
      activeIndex = 3;
      isFailed = true;
    }

    return steps.map((step) => ({
      ...step,
      active: step.index === activeIndex && !isFailed,
      completed: step.index < activeIndex,
      failed: step.index === activeIndex && isFailed,
    }));
  }, [transferStatus]);

  // Update status function for "I'm Done" button
  const updateStatusOnDone = useCallback(async () => {
    if (!depositAddress || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const result = await oneClickService.getStatus({
        depositAddress: depositAddress
      });
      let status = result.data.status;
      if (isPendingStatus(status)) {
        if (result.data.quoteResponse?.quote?.deadline) {
          const isTimeout = Date.now() > new Date(result.data.quoteResponse?.quote?.deadline).getTime();
          if (isTimeout) {
            status = "FAILED";
          }
        }
      }
      historyStore.updateStatus(depositAddress, status);
      historyStore.updateHistory(depositAddress, {
        toChainTxHash: result.data.swapDetails?.destinationChainTxHashes?.[0]?.hash,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [depositAddress, historyStore, isUpdatingStatus]);

  return {
    // Params
    chainName,
    depositAddress,
    
    // State
    quoteData,
    statusData,
    isLoadingStatus,
    timeRemaining,
    isRefreshing,
    deadlineTime,
    paymentUri,
    
    // Computed values
    sourceChain,
    destinationChain,
    recipientAddress,
    timeEstimate,
    formatTimeEstimate,
    countdownInfo,
    progressSteps,
    transferStatus,
    updateStatusOnDone,
    isUpdatingStatus,
    
    // Navigation
    navigate,
  };
}

