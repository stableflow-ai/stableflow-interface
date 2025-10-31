import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chains from "@/config/chains";
import useWalletStore from "@/stores/use-wallet";
import { usdtChains } from "@/config/tokens/usdt";
import { usdcChains } from "@/config/tokens/usdc";
import { BridgeDefaultWallets, SCAN_PAY_SOURCE_CHAIN } from "@/config";
import oneClickService from "@/services/oneclick";
import { useConfigStore } from "@/stores/use-config";
import { validateAddress } from "@/utils/address-validation";
import Big from "big.js";
import useToast from "@/hooks/use-toast";
import { useHistoryStore } from "@/stores/use-history";
import { useAddressBookStore } from "@/stores/use-address-book";

export default function useScan() {
  const navigate = useNavigate();
  const walletStore = useWalletStore();
  const configStore = useConfigStore();
  const toast = useToast();
  const historyStore = useHistoryStore();
  const addressBookStore = useAddressBookStore();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("eth");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addressError, setAddressError] = useState<string>("");
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // Get source wallet name from chain
  const sourceWalletName = useMemo(() => {
    const sourceChain = chains[SCAN_PAY_SOURCE_CHAIN as keyof typeof chains];
    return sourceChain?.chainName || "TRON";
  }, []);

  // Get supported chains based on selected token
  const supportedChains = useMemo(() => {
    const tokenChains = walletStore.selectedToken === "USDT" ? usdtChains : usdcChains;
    return Object.entries(tokenChains).map(([key, chain]) => ({
      key,
      ...chain,
    }));
  }, [walletStore.selectedToken]);

  // Define priority order for primary networks (first 3 will be shown primarily)
  const priorityOrder = ["eth", "bsc", "tron", "pol", "arb", "avax", "base", "op", "near", "sol"];

  // Sort networks by priority, then get primary (first 3) and all networks
  const sortedNetworks = useMemo(() => {
    return [...supportedChains].sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.key);
      const bIndex = priorityOrder.indexOf(b.key);
      const aPriority = aIndex === -1 ? 999 : aIndex;
      const bPriority = bIndex === -1 ? 999 : bIndex;
      return aPriority - bPriority;
    });
  }, [supportedChains]);

  const primaryNetworks = useMemo(() => {
    return sortedNetworks.slice(0, 3);
  }, [sortedNetworks]);

  const allNetworks = sortedNetworks;

  // Update selected network when token changes, ensure it's in supported list
  useEffect(() => {
    if (supportedChains.length > 0) {
      const isCurrentSelectedSupported = supportedChains.some(
        (chain) => chain.key === selectedNetwork
      );
      if (!isCurrentSelectedSupported) {
        // Default to first available chain
        setSelectedNetwork(supportedChains[0].key);
      }
    }
  }, [walletStore.selectedToken, supportedChains, selectedNetwork]);

  const selectedChain = chains[selectedNetwork as keyof typeof chains];

  // Get the selected token chain configuration
  const selectedTokenChain = useMemo(() => {
    const tokenChains = walletStore.selectedToken === "USDT" ? usdtChains : usdcChains;
    return tokenChains[selectedNetwork as keyof typeof tokenChains];
  }, [walletStore.selectedToken, selectedNetwork]);

  // Validate recipient address
  useEffect(() => {
    if (recipientAddress && selectedChain) {
      const validation = validateAddress(recipientAddress, selectedChain.chainType);
      if (!validation.isValid) {
        setAddressError(validation.error || "Invalid address");
      } else {
        setAddressError("");
      }
    } else {
      setAddressError("");
    }
  }, [recipientAddress, selectedChain]);

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, "");
    // Prevent multiple decimal points
    const parts = sanitizedValue.split(".");
    if (parts.length <= 2) {
      setAmount(sanitizedValue);
    }
  };

  const handleContinue = async () => {
    if (!selectedTokenChain || !recipientAddress.trim() || !amount.trim()) {
      return;
    }

    // Validate address
    if (addressError) {
      toast.fail({
        title: addressError
      });
      return;
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      toast.fail({
        title: "Amount is too low, at least 1"
      });
      return;
    }

    try {
      setIsLoading(true);

      // Convert amount to token units
      // Use token decimals as default, some chains may override it (e.g., BSC USDT uses 18)
      const tokenDecimals = walletStore.selectedToken === "USDT" ? 6 : 6;
      const chainDecimals = (selectedTokenChain as any).decimals || tokenDecimals;
      const _amount = Big(amount)
        .times(10 ** chainDecimals)
        .toFixed(0);

      // Get refund address (from source chain)
      // A default wallet address is used for quote API
      const refundTo = BridgeDefaultWallets[SCAN_PAY_SOURCE_CHAIN];

      // Get origin asset (source chain token)
      const originTokenChains = walletStore.selectedToken === "USDT" ? usdtChains : usdcChains;
      const originTokenChain = originTokenChains[SCAN_PAY_SOURCE_CHAIN as keyof typeof originTokenChains];

      if (!originTokenChain) {
        throw new Error("Source chain token not found");
      }

      // Call quote API
      const quoteRes = await oneClickService.quote({
        dry: false,
        slippageTolerance: configStore.slippage * 100,
        originAsset: originTokenChain.assetId,
        destinationAsset: selectedTokenChain.assetId,
        amount: _amount,
        refundTo: refundTo,
        refundType: "ORIGIN_CHAIN",
        recipient: recipientAddress.trim()
      });

      console.log("Quote result:", JSON.stringify(quoteRes.data));

      // Navigate to payment page with chain name and deposit address
      const depositAddress = quoteRes.data?.quote?.depositAddress;
      if (depositAddress) {
        // Build token objects for history record
        const tokenSymbol = walletStore.selectedToken;
        const tokenIcon = tokenSymbol === "USDT" ? "/usdt.png" : "/usdc.png";
        
        const fromToken = {
          ...originTokenChain,
          symbol: tokenSymbol,
          icon: tokenIcon,
        };
        
        const toToken = {
          ...selectedTokenChain,
          symbol: tokenSymbol,
          icon: tokenIcon,
        };

        // Add history record before navigation
        historyStore.addHistory({
          despoitAddress: depositAddress,
          amount: amount,
          fromToken: fromToken,
          toToken: toToken,
          fromAddress: "-",
          toAddress: recipientAddress.trim(),
          time: Date.now(),
          txHash: "",
          timeEstimate: quoteRes.data?.quote?.timeEstimate || 0,
          isScan: true,
          scanChainName: selectedNetwork, // Save chain name for navigation
        });

        // Update status to PENDING_DEPOSIT to add to pending list
        historyStore.updateStatus(depositAddress, "PENDING_DEPOSIT");

        // Save address to address book
        addressBookStore.addAddress(recipientAddress.trim(), selectedNetwork);

        // Store quote data in sessionStorage for the payment page
        sessionStorage.setItem(`scan_quote_${depositAddress}`, JSON.stringify(quoteRes.data));
        navigate(`/scan/${selectedNetwork}/${depositAddress}`);
      } else {
        throw new Error("Deposit address not found in quote response");
      }
    } catch (error: any) {
      console.error("Quote error:", error);
      const errorMessage = error?.response?.data?.message || "Failed to get quote, please try again later";
      toast.fail({
        title: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get filtered addresses for dropdown
  const filteredAddresses = useMemo(() => {
    if (!recipientAddress.trim()) {
      return addressBookStore.getAddressesByChain(selectedNetwork).slice(0, 5);
    }
    return addressBookStore.searchAddresses(recipientAddress, selectedNetwork).slice(0, 5);
  }, [recipientAddress, selectedNetwork, addressBookStore]);

  const handleAddressSelect = (address: string, chain: string) => {
    setRecipientAddress(address);
    setShowAddressDropdown(false);
    // Update selected network if chain is different
    if (chain !== selectedNetwork) {
      setSelectedNetwork(chain);
    }
  };

  const isContinueDisabled = !recipientAddress.trim() || !amount.trim() || !!addressError || isLoading;

  return {
    // State
    selectedNetwork,
    recipientAddress,
    amount,
    showMoreOptions,
    isLoading,
    addressError,
    
    // Setters
    setSelectedNetwork,
    setRecipientAddress,
    setShowMoreOptions,
    handleAmountChange,
    setShowAddressBook,
    setShowAddressDropdown,
    
    // Computed values
    sourceWalletName,
    primaryNetworks,
    allNetworks,
    selectedChain,
    selectedTokenChain,
    isContinueDisabled,
    filteredAddresses,
    
    // Handlers
    handleContinue,
    handleAddressSelect,
    
    // Store values
    selectedToken: walletStore.selectedToken,
    
    // UI state
    showAddressBook,
    showAddressDropdown,
  };
}

