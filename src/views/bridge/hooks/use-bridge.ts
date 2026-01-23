import { useState, useEffect, useMemo, useRef } from "react";
import { ServiceMap, type ServiceType } from "@/services";
import {
  validateAddress,
  type AddressValidationResult
} from "@/utils/address-validation";
import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import Big from "big.js";
import { useDebounceFn, useRequest } from "ahooks";
import { useHistoryStore } from "@/stores/use-history";
import { useConfigStore } from "@/stores/use-config";
import useWalletStore from "@/stores/use-wallet";
import useBridgeStore, { type QuoteData } from "@/stores/use-bridge";
import useTokenBalance from "@/hooks/use-token-balance";
import useToast from "@/hooks/use-toast";
import useBalancesStore, { type BalancesState } from "@/stores/use-balances";
import { BridgeDefaultWallets, PRICE_IMPACT_THRESHOLD } from "@/config";
import axios from "axios";
import { formatNumber } from "@/utils/format/number";
import { Service } from "@/services";
import usePricesStore from "@/stores/use-prices";
import { v4 as uuidV4 } from "uuid";
import { BASE_API_URL } from "@/config/api";
import { useAccount } from "wagmi";
import { BridgeFees, TronTransferStepStatus } from "@/config/tron";
import { useTronEnergy } from "./use-tron";
import { BridgeFee } from "@/services/oneclick";

const TRANSFER_MIN_AMOUNT = 1;
const CCTP_AUTO_REQUOTE_DURATION = 20000; // 20s

export default function useBridge(props?: any) {
  const { liquidityError } = props ?? {};

  const {
    getEstimateNeedsEnergy,
    getEnergy,
  } = useTronEnergy();

  const prices = usePricesStore((state) => state.prices);
  const wallets = useWalletsStore();
  const historyStore = useHistoryStore();
  const configStore = useConfigStore();
  const walletStore = useWalletStore();
  const bridgeStore = useBridgeStore();
  const { getBalance } = useTokenBalance(walletStore.fromToken, false);
  const balancesStore = useBalancesStore();
  const evmAccount = useAccount();
  const [errorChain, setErrorChain] = useState<number>(0);
  const toast = useToast();
  const [liquidityErrorMssage, setLiquidityErrorMessage] = useState<boolean>();
  const prevToTokenRef = useRef<any>(null);

  const [fromWalletAddress, toWalletAddress] = useMemo(() => {
    const _fromChainType: WalletType = walletStore.fromToken?.chainType;
    const _toChainType: WalletType = walletStore.toToken?.chainType;
    if (!_fromChainType || !_toChainType) return [];
    const _fromWallet = wallets[_fromChainType];
    const _toWallet = wallets[_toChainType];
    const _fromWalletAddress =
      _fromWallet?.account || BridgeDefaultWallets[_fromChainType];
    const _toWalletAddress =
      bridgeStore.recipientAddress || _toWallet?.account || BridgeDefaultWallets[_toChainType];
    return [_fromWalletAddress, _toWalletAddress];
  }, [wallets, walletStore, bridgeStore.recipientAddress]);

  // Recipient address state
  const [addressValidation, setAddressValidation] =
    useState<AddressValidationResult>({
      isValid: false
    });

  // Amount state
  const [amountError, setAmountError] = useState<string>("");

  const { runAsync: onReportError } = useRequest(async (reportData: any) => {
    const params = {
      address: fromWalletAddress,
      api: "oneclick/quote",
      ...reportData,
    };

    // remove default wallet address
    if (Object.values(BridgeDefaultWallets).some((addr) => addr === params.address)) {
      params.address = "";
    }

    // truncate content if it's too long
    if (params.content.length >= 1000) {
      params.content = params.content.slice(0, 996) + "...";
    }

    try {
      await axios.post(`${BASE_API_URL}/v1/api/error`, params);
    } catch (error) {
      console.log("Report error failed: %o", error);
    }
  }, { manual: true });

  const quoteRoutes = async (service: ServiceType, params: any, requestId?: number): Promise<QuoteData> => {
    try {
      // Check request ID, skip setting loading state if not the latest request
      if (requestId !== undefined && requestId !== requestIdRef.current) {
        throw new Error("Request cancelled: outdated request");
      }
      bridgeStore.setQuoting(service, true);
      const isFromTron = walletStore.fromToken.chainType === "tron";

      if (service === Service.OneClick) {
        setLiquidityErrorMessage(liquidityError);
      }

      const formatQuoteParams = async () => {
        const _params: any = {
          amountWei: params.amountWei,
          refundTo: fromWalletAddress || "",
          recipient: bridgeStore.recipientAddress || toWalletAddress || "",
          wallet: params.wallet,
          fromToken: walletStore.fromToken,
          toToken: walletStore.toToken,
          prices,
          slippageTolerance: configStore.slippage,
        };
        if (service === Service.OneClick) {
          _params.dry = params.dry;
          _params.slippageTolerance = configStore.slippage * 100;
          _params.originAsset = walletStore.fromToken.assetId;
          _params.destinationAsset = walletStore.toToken.assetId;
          _params.amount = params.amountWei;
          _params.refundType = "ORIGIN_CHAIN";
          _params.acceptTronEnergy = bridgeStore.acceptTronEnergy;

          if (isFromTron && bridgeStore.acceptTronEnergy) {
            const { needsEnergy, needsBandwidth, needsBandwidthTRX, needsEnergyTRX } = await getEstimateNeedsEnergy({
              wallet: params.wallet,
              account: fromWalletAddress || "",
            });
            _params.needsEnergy = needsEnergy;
            _params.needsBandwidth = needsBandwidth;
            _params.needsBandwidthTRX = needsBandwidthTRX;
            
            if (needsEnergy) {
              _params.needsEnergyAmount = needsEnergyTRX;
            } else {
              const fixedFee = BridgeFees.Normal;
              const fixedFeePercentage = Number(Big(fixedFee).div(bridgeStore.amount).times(10000).toFixed(0, 0));
              _params.appFees = [
                {
                  recipient: BridgeFee[0].recipient,
                  fee: BridgeFee[0].fee + fixedFeePercentage,
                },
              ];
            }
          }

          if (params.appFees) {
            _params.appFees = params.appFees;
          }
        } else {
          _params.originChain = walletStore.fromToken.chainName;
          _params.destinationChain = walletStore.toToken.chainName;
        }

        return _params;
      };

      const quoteParams = await formatQuoteParams();
      const quoteRes = await ServiceMap[service].quote(quoteParams);

      // Check request ID again before setting result to ensure it's still the latest request
      if (requestId !== undefined && requestId !== requestIdRef.current) {
        bridgeStore.setQuoting(service, false);
        throw new Error("Request cancelled: outdated request");
      }

      bridgeStore.setQuoting(service, false);
      bridgeStore.setQuoteData(service, quoteRes);

      if (service === Service.OneClick) {
        setLiquidityErrorMessage(false);
      }

      return {
        type: service,
        data: quoteRes,
      };
    } catch (error: any) {
      // If it's a cancelled request error, return directly without setting error state
      if (error?.message === "Request cancelled: outdated request") {
        throw error;
      }

      // Check request ID, ignore error if not the latest request
      if (requestId !== undefined && requestId !== requestIdRef.current) {
        throw new Error("Request cancelled: outdated request");
      }

      const defaultErrorMessage = "Failed to get quote, please try again later";
      let _finalErrorMessage = error?.message || defaultErrorMessage;
      if (service === Service.OneClick) {
        const getQuoteErrorMessage = (): { message: string; sourceMessage: string; } => {
          const _messageResult = {
            message: defaultErrorMessage,
            sourceMessage: error?.response?.data?.message || defaultErrorMessage,
          };
          if (
            error?.response?.data?.message &&
            error?.response?.data?.message !== "Internal server error"
          ) {
            // quote failed, maybe out of liquidity
            if (error?.response?.data?.message === "Failed to get quote") {
              _messageResult.message = "Amount exceeds max";
              return _messageResult;
            }
            // Amount is too low for bridge
            if (error?.response?.data?.message?.includes("Amount is too low for bridge, try at least")) {
              const match = error.response.data.message.match(/try at least\s+(\d+(?:\.\d+)?)/i);
              let minimumAmount = match ? match[1] : Big(1).times(10 ** walletStore.fromToken.decimals).toFixed(0);
              minimumAmount = Big(minimumAmount).div(10 ** walletStore.fromToken.decimals);
              _messageResult.message = `Amount is too low, at least ${formatNumber(minimumAmount, walletStore.fromToken.decimals, true)}`;
              return _messageResult;
            }
            return _messageResult;
          }
          // Unknown error
          return _messageResult;
        };

        const _errorMessage = getQuoteErrorMessage();
        _finalErrorMessage = _errorMessage.message;

        // Report error
        onReportError({
          content: _errorMessage.sourceMessage,
          amount: bridgeStore.amount,
          from_chain: walletStore.fromToken.chainName,
          symbol: walletStore.fromToken.symbol,
          to_chain: walletStore.toToken.chainName,
          to_symbol: walletStore.toToken.symbol,
        });

        setLiquidityErrorMessage(false);
      }

      const _quoteData = {
        type: service,
        errMsg: _finalErrorMessage,
      };
      bridgeStore.setQuoting(service, false);
      bridgeStore.setQuoteData(service, _quoteData);

      return _quoteData;
    }
  };

  const [isAutoSelect, setAutoSelect] = useState(false);
  // Request ID counter to ensure only the latest request results are processed
  const requestIdRef = useRef(0);
  // Auto requote timer ref for CCTP from Solana USDC
  const autoRequoteTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track previous quoting state to detect when quote completes
  const prevQuotingRef = useRef<boolean>(false);

  const quote = async (params: { dry: boolean; }, isSync?: boolean, requestId?: number) => {
    if (!isSync) {
      bridgeStore.clearQuoteData();
    }

    if (
      !walletStore.toToken ||
      !walletStore.fromToken ||
      !fromWalletAddress ||
      !(bridgeStore.recipientAddress || toWalletAddress) ||
      Big(bridgeStore.amount || 0).lt(TRANSFER_MIN_AMOUNT)
    ) {
      bridgeStore.clearQuoteData();
      return;
    }

    // @ts-ignore
    const wallet = wallets[walletStore.fromToken.chainType];
    const amountWei = Big(bridgeStore.amount)
      .times(10 ** walletStore.fromToken.decimals)
      .toFixed(0);

    const quoteParams = {
      ...params,
      amountWei,
      wallet: wallet.wallet,
    };

    const quoteServices: any = [];
    for (const service of Object.values(Service)) {
      if (walletStore.fromToken.services.includes(service) && walletStore.toToken.services.includes(service)) {
        quoteServices.push({
          service,
          quote: (_requestId?: number) => {
            return quoteRoutes(service, quoteParams, _requestId);
          }
        });
      }
    }

    // Use request ID to ensure only the latest request results are processed
    const currentRequestId = requestId ?? requestIdRef.current;

    if (isSync) {
      const currentQuoteService = quoteServices.find((service: any) => service.service === bridgeStore.quoteDataService);
      // Sync calls don't need request ID check
      const _quoteRes = await currentQuoteService.quote();
      console.log("%c[%s]Sync Quote Result: %o", "background:#A3D78A;color:#0D4715;", bridgeStore.quoteDataService, _quoteRes);
      return _quoteRes;
    }

    for (let i = 0; i < quoteServices.length; i++) {
      const quoteService = quoteServices[i];
      // Pass request ID to service function
      quoteService.quote(currentRequestId).then((_quoteRes: any) => {
        // Check if it's the latest request, ignore result if not
        if (currentRequestId !== requestIdRef.current) {
          console.log(`%c[${quoteService.service}] Ignored outdated quote result, current requestId: ${requestIdRef.current}, result requestId: ${currentRequestId}`, "background:#423c27;color:#fdf4aa;");
          return;
        }

        console.log("%c[%s]Quote Result: %o", "background:#A3D78A;color:#0D4715;", quoteService.service, _quoteRes);
      }).catch((error: any) => {
        // Silently ignore if it's a cancelled request error
        if (error?.message === "Request cancelled: outdated request") {
          console.log(`%c[${quoteService.service}] Request cancelled: outdated request`, "background:#423c27;color:#fdf4aa;");
          return;
        }
        // Also check request ID to avoid old request errors overwriting new requests
        if (currentRequestId !== requestIdRef.current) {
          console.log(`%c[${quoteService.service}] Ignored outdated quote error, current requestId: ${requestIdRef.current}, error requestId: ${currentRequestId}`, "background:#423c27;color:#fdf4aa;");
          return;
        }
        // Re-throw other errors for the caller to handle
        console.error(`[${quoteService.service}] Quote error:`, error);
      }).finally(() => {
        if (i >= quoteServices.length - 1) {
          setAutoSelect(true);
        }
      });
    }
  };

  const { runAsync: report } = useRequest(async (params: any) => {
    try {
      await axios.post(`${BASE_API_URL}/v1/trade/add`, {
        type: 0,
        ...params,
      });
    } catch (error) {
      console.log("Report failed: %o", error);
    }
  }, {
    manual: true,
  });

  const estimateNativeTokenBalance = async (params?: { estimateGas?: number | string; }) => {
    const result = { isContinue: true };

    // @ts-ignore
    const wallet = wallets[walletStore.fromToken.chainType];

    if (!wallet) {
      return result;
    }

    // Estimate transfer gas and check native token balance
    try {
      const estimateGas = params?.estimateGas ?? bridgeStore.quoteDataMap.get(bridgeStore.quoteDataService)?.estimateSourceGas;
      // get native token balance
      const nativeBalance = await wallet.wallet.getBalance({ symbol: "native" }, wallet.account);
      const nativeTokenName = walletStore.fromToken.nativeToken.symbol;

      console.log(`%cEstimate ${nativeTokenName} balance. Required: ${estimateGas} ${nativeTokenName}, Available: ${nativeBalance} ${nativeTokenName}`, "background:#4D2FB2;color:#ffffff;");

      // Check if balance is sufficient
      if (Big(nativeBalance || 0).lt(estimateGas || 0)) {
        result.isContinue = false;
        return result;
      }
    } catch (error) {
      console.log("check estimate gas failed: %o", error);
    }
    return result;
  };

  const transfer = async () => {
    if (!walletStore.fromToken) return;
    try {
      bridgeStore.set({ transferring: true });
      const _quote = await quote({ dry: false }, true);

      // @ts-ignore
      const wallet = wallets[walletStore.fromToken.chainType];
      // @ts-ignore
      const toWallet = wallets[walletStore.toToken.chainType];
      const _amount = Big(bridgeStore.amount)
        .times(10 ** walletStore.fromToken.decimals)
        .toFixed(0);

      // approve
      if (_quote?.data?.needApprove) {
        // check is from ethereum erc20
        if (walletStore.fromToken.chainName === "Ethereum") {
          const allowance = await wallet.wallet.allowance({
            contractAddress: walletStore.fromToken.contractAddress,
            spender: _quote?.data?.approveSpender,
            address: fromWalletAddress,
            amountWei: _amount,
          });
          // if allowance is not enough, reset allowance first
          if (Big(allowance.allowance || 0).gt(0) && allowance.needApprove) {
            await wallet.wallet.approve({
              contractAddress: walletStore.fromToken.contractAddress,
              spender: _quote?.data?.approveSpender,
              amountWei: "0",
            });
          }
        }
        const approveResult = await wallet.wallet.approve({
          contractAddress: walletStore.fromToken.contractAddress,
          spender: _quote?.data?.approveSpender,
          amountWei: _amount,
        });
        bridgeStore.set({ transferring: false });
        if (!approveResult) {
          toast.fail({
            title: "Approve failed"
          });
          return;
        }
        toast.success({
          title: "Approve success"
        });
        bridgeStore.modifyQuoteData(bridgeStore.quoteDataService, {
          needApprove: false,
        });
        return;
      }

      // create solana usdc account for CCTP
      if (_quote?.data?.needCreateTokenAccount) {
        const createResult = await toWallet.wallet?.createAssociatedTokenAddress?.({
          tokenMint: walletStore.toToken.contractAddress,
        });
        bridgeStore.set({ transferring: false });
        if (!createResult) {
          toast.fail({
            title: `Initialize Solana ${walletStore.toToken.symbol} Account failed`,
          });
          return;
        }
        toast.success({
          title: `Initialize Solana ${walletStore.toToken.symbol} Account success`,
        });
        bridgeStore.modifyQuoteData(bridgeStore.quoteDataService, {
          needCreateTokenAccount: false,
        });
        return;
      }

      // 1click transfer
      if (bridgeStore.quoteDataService === Service.OneClick) {
        const isFromTron = walletStore.fromToken.chainType === "tron";
        const estNativeTokenParams: any = {};
        const fromTronParams = {
          wallet: wallet.wallet,
          account: wallet.account,
        };
        let needsEnergy = false;
        let needsBandwidth = false;
        if (isFromTron && bridgeStore.acceptTronEnergy) {
          const estimateNeeds = await getEstimateNeedsEnergy(fromTronParams);
          needsEnergy = estimateNeeds.needsEnergy;
          needsBandwidth = estimateNeeds.needsBandwidth;
          estNativeTokenParams.estimateGas = Big(estimateNeeds.needsEnergyTRX).plus(estimateNeeds.needsBandwidthTRX).times(10 ** walletStore.fromToken.nativeToken.decimals).toFixed(0);
        }
        const { isContinue } = await estimateNativeTokenBalance(estNativeTokenParams);
        if (!isContinue) {
          bridgeStore.set({ transferring: false });
          toast.fail({
            title: "Transfer failed",
            text: "Insufficient native token balance"
          });
          return;
        }

        if (!_quote?.data?.quote?.depositAddress) {
          throw new Error("Failed to get quote");
        }

        const localHistoryData = {
          type: Service.OneClick,
          despoitAddress: _quote.data.quote.depositAddress,
          amount: bridgeStore.amount,
          fromToken: walletStore.fromToken,
          toToken: walletStore.toToken,
          fromAddress: wallet.account,
          toAddress: _quote.data.quoteRequest.recipient,
          time: Date.now(),
          txHash: "",
          timeEstimate: _quote.data.quote.timeEstimate,
        };
        const reportData = {
          project: "nearintents",
          address: wallet.account,
          amount: bridgeStore.amount,
          out_amount: _quote.data.outputAmount,
          deposit_address: _quote.data.quote.depositAddress,
          receive_address: _quote.data.quoteRequest.recipient,
          from_chain: walletStore.fromToken.blockchain,
          symbol: walletStore.fromToken.symbol,
          to_chain: walletStore.toToken.blockchain,
          to_symbol: walletStore.toToken.symbol,
          tx_hash: "",
        };

        if (isFromTron && bridgeStore.acceptTronEnergy) {
          bridgeStore.setTronTransferVisible(true, { quoteData: _quote });
          if (needsEnergy) {
            await getEnergy(fromTronParams);
          } else {
            bridgeStore.setTronTransferStep(TronTransferStepStatus.EnergyReady);
          }
          bridgeStore.setTronTransferStep(TronTransferStepStatus.WalletPrompt);

          historyStore.addHistory(localHistoryData);
          historyStore.updateStatus(_quote.data.quote.depositAddress, "CONTINUE");
          report({
            ...reportData,
            status: 4, // continue
          });
        }

        if (_quote?.data?.sendParam?.param) {
          // proxyTransfer.recipient = depositAddress
          _quote.data.sendParam.param[1] = _quote.data.quote.depositAddress;
        }
        const hash = await ServiceMap[Service.OneClick].send({
          sendParam: _quote?.data?.sendParam,
          wallet: wallet.wallet,
          fromToken: walletStore.fromToken,
          depositAddress: _quote.data.quote.depositAddress,
          amountWei: _amount,
        });

        localHistoryData.txHash = hash;
        localHistoryData.time = Date.now();

        historyStore.addHistory(localHistoryData);
        historyStore.updateStatus(_quote.data.quote.depositAddress, "PENDING_DEPOSIT");

        reportData.tx_hash = hash;

        if (isFromTron && bridgeStore.acceptTronEnergy) {
          bridgeStore.setTronTransferStep(TronTransferStepStatus.Broadcasting);

          // polling transaction status
          let pollingResult = true;
          try {
            pollingResult = await wallet.wallet.pollingTransactionStatus(hash, {
              maxPolls: 120,
              pollInterval: 3000,
            });
          } catch (error) {
            console.log("polling transaction status failed: %o", error);
          }
          if (!pollingResult) {
            toast.fail({
              title: "Transfer failed",
              text: hash,
            });
          } else {
            report(reportData);
          }

          bridgeStore.setTronTransferVisible(false);
        } else {
          report(reportData);
        }
      }

      // usdt0 transfer
      if (bridgeStore.quoteDataService === Service.Usdt0) {
        const { isContinue } = await estimateNativeTokenBalance();
        if (!isContinue) {
          bridgeStore.set({ transferring: false });
          toast.fail({
            title: "Transfer failed",
            text: "Insufficient native token balance"
          });
          return;
        }

        const hash = await ServiceMap[Service.Usdt0].send({
          ..._quote?.data?.sendParam,
          wallet: wallet.wallet,
        });
        const uniqueId = uuidV4();
        historyStore.addHistory({
          type: Service.Usdt0,
          despoitAddress: hash,
          amount: bridgeStore.amount,
          fromToken: walletStore.fromToken,
          toToken: walletStore.toToken,
          fromAddress: wallet.account,
          toAddress: _quote.data.quoteParam.recipient,
          time: Date.now(),
          txHash: hash,
          toChainTxHash: hash,
          timeEstimate: _quote.data.estimateTime,
        });
        historyStore.updateStatus(hash, "PENDING_DEPOSIT");
        report({
          project: "layerzero",
          address: wallet.account,
          amount: bridgeStore.amount,
          out_amount: _quote.data.outputAmount,
          deposit_address: hash,
          receive_address: _quote.data.quoteParam.recipient,
          from_chain: walletStore.fromToken.blockchain,
          symbol: walletStore.fromToken.symbol,
          to_chain: walletStore.toToken.blockchain,
          to_symbol: walletStore.toToken.symbol,
          tx_hash: hash,
        });
      }

      // cctp transfer
      if (bridgeStore.quoteDataService === Service.CCTP) {
        const { isContinue } = await estimateNativeTokenBalance();
        if (!isContinue) {
          bridgeStore.set({ transferring: false });
          toast.fail({
            title: "Transfer failed",
            text: "Insufficient native token balance"
          });
          return;
        }

        const hash = await ServiceMap[Service.CCTP].send({
          ..._quote?.data?.sendParam,
          wallet: wallet.wallet,
        });
        const uniqueId = uuidV4();
        historyStore.addHistory({
          type: Service.CCTP,
          despoitAddress: hash,
          amount: bridgeStore.amount,
          fromToken: walletStore.fromToken,
          toToken: walletStore.toToken,
          fromAddress: wallet.account,
          toAddress: _quote.data.quoteParam.recipient,
          time: Date.now(),
          txHash: hash,
          toChainTxHash: hash,
          timeEstimate: _quote.data.estimateTime,
        });
        historyStore.updateStatus(hash, "PENDING_DEPOSIT");
        report({
          project: "cctp",
          address: wallet.account,
          amount: bridgeStore.amount,
          out_amount: _quote.data.outputAmount,
          deposit_address: hash,
          receive_address: _quote.data.quoteParam.recipient,
          fee: _quote.data.fees.estimateMintGasUsd,
          source_domain_id: _quote.data.quoteParam.sourceDomain,
          destination_domain_id: _quote.data.quoteParam.destinationDomain,
          from_chain: walletStore.fromToken.blockchain,
          symbol: walletStore.fromToken.symbol,
          to_chain: walletStore.toToken.blockchain,
          to_symbol: walletStore.toToken.symbol,
          tx_hash: hash,
        });
      }

      bridgeStore.set({ transferring: false });
      getBalance();
      toast.success({
        title: "Transfer submitted"
      });
      // reload quotes
      debouncedQuote({ dry: true });

    } catch (error: any) {
      console.error(error);
      bridgeStore.set({ transferring: false });
      bridgeStore.setTronTransferVisible(false);
      let _finalErrorMessage = error?.message || error?.toString?.() || "Transfer failed";
      if (
        // evm
        _finalErrorMessage.includes("user rejected action") ||
        // tron
        _finalErrorMessage.includes("Confirmation declined by user") ||
        _finalErrorMessage.includes("User denied request signature")
      ) {
        _finalErrorMessage = "User rejected transaction";
      }
      toast.fail({
        title: _finalErrorMessage,
      });
    }
  };

  // Clear recipient address when target chain changes
  useEffect(() => {
    if (prevToTokenRef.current && walletStore.toToken) {
      // Check if the target chain actually changed (compare by chainName or chainId)
      const prevChainId = prevToTokenRef.current?.chainId;
      const currentChainId = walletStore.toToken?.chainId;
      const prevChainName = prevToTokenRef.current?.chainName;
      const currentChainName = walletStore.toToken?.chainName;

      if (
        (prevChainId && currentChainId && prevChainId !== currentChainId) ||
        (prevChainName && currentChainName && prevChainName !== currentChainName)
      ) {
        // Target chain changed, clear recipient address
        bridgeStore.set({ recipientAddress: "" });
      }
    }
    // Update ref to current toToken
    prevToTokenRef.current = walletStore.toToken;
  }, [walletStore.toToken]);

  // Validate address when recipient address or target chain changes
  useEffect(() => {
    if (bridgeStore.recipientAddress && walletStore.toToken) {
      const validation = validateAddress(
        bridgeStore.recipientAddress,
        walletStore.toToken.chainType
      );
      setAddressValidation(validation);
    }
  }, [bridgeStore.recipientAddress, walletStore.toToken]);

  // Amount validation and handler
  const validateAmount = (value: string): string => {
    if (!value.trim()) {
      return "Amount is required";
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }

    if (Big(numValue).lt(TRANSFER_MIN_AMOUNT)) {
      return "Amount is too low, at least 1";
    }

    // Check for too many decimal places (max 6 for most tokens)
    const decimalPlaces = (value.split(".")[1] || "").length;
    if (decimalPlaces > walletStore.fromToken.decimals) {
      return `Maximum ${walletStore.fromToken.decimals} decimal places allowed`;
    }

    // Check balance if wallet and token are available
    if (walletStore.fromToken && walletStore.toToken && wallets) {
      try {
        const balance =
          balancesStore[
          `${walletStore.fromToken.chainType}Balances` as keyof BalancesState
          ]?.[walletStore.fromToken.contractAddress] || 0;

        if (Big(value).gt(balance)) {
          return `Insufficient balance`;
        }
      } catch (error) {
        console.error("Error checking balance:", error);
        return "Failed to check balance";
      }
    }

    return "";
  };

  // Wrap quote function to generate a new request ID on each call
  const quoteWithRequestId = async (params: { dry: boolean; }, isSync?: boolean) => {
    // Generate a new request ID
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;
    return quote(params, isSync, currentRequestId);
  };

  const { run: debouncedQuote, cancel: cancelQuote } = useDebounceFn(quoteWithRequestId, {
    wait: 1000
  });

  // Re-validate amount when token or chain changes
  useEffect(() => {
    if (bridgeStore.amount && walletStore.fromToken) {
      const error = validateAmount(bridgeStore.amount);
      setAmountError(error);
    }
  }, [walletStore.fromToken, bridgeStore.amount, balancesStore]);

  useEffect(() => {
    // Only trigger quote if both tokens have selected a specific chain (have chainType)
    // Don't trigger quote when just switching token type (USDT/USDC) without selecting a chain
    if (!walletStore.fromToken?.chainType || !walletStore.toToken?.chainType) {
      cancelQuote();
      bridgeStore.clearQuoteData();
      return;
    }
    cancelQuote();
    debouncedQuote({ dry: true });
  }, [
    walletStore.fromToken,
    walletStore.toToken,
    bridgeStore.amount,
    bridgeStore.recipientAddress,
    amountError,
    addressValidation,
    fromWalletAddress,
    toWalletAddress,
  ]);

  useEffect(() => {
    const check = () => {
      if (!walletStore.fromToken?.contractAddress) {
        return "Select the chain you are sending from";
      }
      if (!walletStore.toToken?.contractAddress) {
        return "Please select to chain";
      }
      if (!bridgeStore.amount) {
        return "Please enter amount";
      }
      if (bridgeStore.quoteDataMap?.get(bridgeStore.quoteDataService)?.errMsg) {
        return bridgeStore.quoteDataMap?.get(bridgeStore.quoteDataService)?.errMsg;
      }
      if (liquidityErrorMssage && bridgeStore.quoteDataService === Service.OneClick) {
        return "Amount exceeds max";
      }
      if (
        walletStore.fromToken.chainType === "evm" &&
        walletStore.fromToken.chainId !== walletStore.fromToken.chainId
      ) {
        return "Select the chain you are sending from";
      }
      if (
        walletStore.fromToken?.chainType === "evm" &&
        (
          walletStore.fromToken?.chainId !== wallets.evm?.chainId ||
          (evmAccount && walletStore.fromToken?.chainId !== evmAccount.chainId)
        )
      ) {
        setErrorChain(walletStore.fromToken.chainId);
      } else {
        setErrorChain(0);
      }
      if (amountError) {
        return amountError;
      }
      if (
        Object.values(BridgeDefaultWallets).includes(fromWalletAddress || "")
      ) {
        return "Refund wallet not connected";
      }
      if (Object.values(BridgeDefaultWallets).includes(toWalletAddress || "")) {
        return "Recipient address is empty";
      }
      if (!addressValidation.isValid && bridgeStore.recipientAddress && addressValidation.error) {
        return addressValidation.error;
      }

      const priceImpact = bridgeStore.quoteDataMap?.get(bridgeStore.quoteDataService)?.priceImpact;
      if (priceImpact) {
        if (Big(priceImpact || 0).gt(PRICE_IMPACT_THRESHOLD) && !bridgeStore.acceptPriceImpact) {
          return "Large Price Impact";
        }
      }

      return "";
    };
    const error = check();

    bridgeStore.set({ errorTips: error });
  }, [
    amountError,
    addressValidation,
    walletStore.fromToken,
    bridgeStore.amount,
    walletStore.toToken,
    bridgeStore.quoteDataMap,
    bridgeStore.quoteDataService,
    bridgeStore.acceptPriceImpact,
    fromWalletAddress,
    toWalletAddress,
    wallets.evm?.chainId,
    liquidityErrorMssage,
    evmAccount?.chainId,
  ]);

  useEffect(() => {
    const quoteList = Array.from(bridgeStore.quoteDataMap.entries()).filter(([_, data]) => !data.errMsg);
    const isQuoting = Array.from(bridgeStore.quotingMap.values()).some(Boolean);

    if (bridgeStore.transferring || isQuoting || !isAutoSelect) {
      return;
    }

    if (!quoteList.length) {
      return;
    }

    // Auto-select the best quote as soon as any quote is available
    // This allows immediate selection when first request completes, and updates when better quotes arrive
    if (quoteList.length === 1) {
      bridgeStore.set({ quoteDataService: quoteList[0][0] });
      setAutoSelect(false);
      return;
    }
    // sort and select the best one
    const sortedQuoteData = quoteList.sort((a: any, b: any) => {
      const [_serviceA, dataA] = a;
      const [_serviceB, dataB] = b;

      let netA = Big(dataA.outputAmount || 0);
      let netB = Big(dataB.outputAmount || 0);

      // Usdt0 should minus message fee
      if (_serviceA === Service.Usdt0) {
        netA = netA.minus(dataA.fees?.nativeFeeUsd || 0);
      }
      if (_serviceB === Service.Usdt0) {
        netB = netB.minus(dataB.fees?.nativeFeeUsd || 0);
      }

      // console.log("%s data: %o, output amount: %o", _serviceA, dataA, netA.toFixed(6, 0));
      // console.log("%s data: %o,  output amount: %o", _serviceB, dataB, netB.toFixed(6, 0));

      if (netB.gt(netA)) return 1;
      if (netA.gt(netB)) return -1;

      if (netA.eq(netB)) return 0;

      return 0;
    });
    console.log("%cQuote Sorted Result: %o", "background:#f00;color:#fff;", sortedQuoteData);
    bridgeStore.set({ quoteDataService: sortedQuoteData[0][0] });
    setAutoSelect(false);
  }, [
    bridgeStore.transferring,
    bridgeStore.quoteDataMap,
    bridgeStore.quotingMap,
    isAutoSelect,
  ]);

  // Auto requote for CCTP from Solana USDC to any chain USDC
  useEffect(() => {
    // Check conditions: from Solana USDC to any chain USDC
    const isFromSolanaUSDC =
      walletStore.fromToken?.chainType === "sol" &&
      walletStore.fromToken?.symbol === "USDC";
    const isToUSDC = walletStore.toToken?.symbol === "USDC";

    // Check if quote is completed (not quoting and has quote data)
    const isQuoting = Array.from(bridgeStore.quotingMap.values()).some(Boolean);
    const hasQuoteData = bridgeStore.quoteDataMap.size > 0;

    // Check if quote just completed (was quoting, now not quoting)
    const quoteJustCompleted = prevQuotingRef.current && !isQuoting;

    // Update previous quoting state
    prevQuotingRef.current = isQuoting;

    // Clear existing timer if conditions no longer met
    if (
      !isFromSolanaUSDC ||
      !isToUSDC ||
      bridgeStore.transferring ||
      isQuoting ||
      !hasQuoteData
    ) {
      if (autoRequoteTimerRef.current) {
        clearTimeout(autoRequoteTimerRef.current);
        autoRequoteTimerRef.current = null;
      }
      return;
    }

    // Only start timer when quote just completed (not on every render)
    if (quoteJustCompleted && !autoRequoteTimerRef.current) {
      // Start timer to auto requote after CCTP_AUTO_REQUOTE_DURATION
      autoRequoteTimerRef.current = setTimeout(() => {
        // Only requote if still not transferring and conditions still met
        if (
          !bridgeStore.transferring &&
          walletStore.fromToken?.chainType === "sol" &&
          walletStore.fromToken?.symbol === "USDC" &&
          walletStore.toToken?.symbol === "USDC"
        ) {
          console.log("Auto requoting after", CCTP_AUTO_REQUOTE_DURATION, "ms");
          debouncedQuote({ dry: true });
        }
        // Clear timer ref after execution
        autoRequoteTimerRef.current = null;
      }, CCTP_AUTO_REQUOTE_DURATION);
    }

    // Cleanup timer on unmount
    return () => {
      if (autoRequoteTimerRef.current) {
        clearTimeout(autoRequoteTimerRef.current);
        autoRequoteTimerRef.current = null;
      }
    };
  }, [
    bridgeStore.transferring,
    bridgeStore.quotingMap,
    bridgeStore.quoteDataMap,
    walletStore.fromToken?.chainType,
    walletStore.fromToken?.symbol,
    walletStore.toToken?.symbol,
    debouncedQuote,
  ]);

  return {
    quote,
    transfer,
    errorChain,
    addressValidation
  };
}
