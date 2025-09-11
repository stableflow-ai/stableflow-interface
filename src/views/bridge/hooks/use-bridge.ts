import { useState, useEffect } from "react";
import oneClickService from "@/services/oneclick";
import {
  validateAddress,
  type AddressValidationResult
} from "@/utils/address-validation";
import useWalletsStore from "@/stores/use-wallets";
import Big from "big.js";
import { useDebounceFn } from "ahooks";
import { useHistoryStore } from "@/stores/use-history";

interface Chain {
  name: string;
  icon: string;
  key: string;
  type?: string;
}

interface Token {
  assetId: string;
  decimals: number;
  blockchain: string;
  symbol: string;
  price: number;
  priceUpdatedAt: string;
  contractAddress: string;
}

export default function useBridge() {
  const [quoting, setQuoting] = useState(false);
  const [transfering, setTransfering] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const wallets = useWalletsStore();
  const historyStore = useHistoryStore();

  // Chain selection state
  const [fromChain, setFromChain] = useState<Chain | null>(null);
  const [toChain, setToChain] = useState<Chain | null>(null);

  // Token selection state
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);

  // Recipient address state
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [addressValidation, setAddressValidation] =
    useState<AddressValidationResult>({
      isValid: false
    });

  // Amount state
  const [amount, setAmount] = useState<string>("");
  const [amountError, setAmountError] = useState<string>("");

  const quote = async (dry: boolean) => {
    // @ts-ignore
    const wallet = wallets[fromChain.type === "evm" ? "evm" : fromChain.key];

    if (!toToken || !fromToken || !fromChain || !toChain || !wallet) return;
    try {
      setQuoting(true);

      const _amount = Big(amount)
        .times(10 ** fromToken.decimals)
        .toFixed(0);

      const quoteRes = await oneClickService.quote({
        dry: dry,
        slippageTolerance: 100,
        originAsset: fromToken.assetId,
        destinationAsset: toToken.assetId,
        amount: _amount,
        refundTo: wallet.account,
        refundType: "ORIGIN_CHAIN",
        recipient: recipientAddress
      });

      setQuoteData(quoteRes.data);
      return quoteRes.data;
    } catch (error) {
      console.error(error);
    } finally {
      setQuoting(false);
    }
  };

  const transfer = async () => {
    if (!fromToken || !fromChain) return;
    try {
      setTransfering(true);
      const _quote = await quote(false);

      // @ts-ignore
      const wallet = wallets[fromChain.type === "evm" ? "evm" : fromChain.key];
      const _amount = Big(amount)
        .times(10 ** fromToken.decimals)
        .toFixed(0);

      await wallet.wallet.transfer({
        originAsset: fromToken.contractAddress,
        depositAddress: _quote.quote.depositAddress,
        amount: _amount
      });
      historyStore.addHistory(_quote);

      setTransfering(false);
      let timer: any = null;
      const getStatus = async () => {
        const result = await oneClickService.getStatus({
          depositAddress: _quote.quote.despoitAddress
        });
        historyStore.updateStatus(
          _quote.quote.despoitAddress,
          result.data.status
        );
        if (
          result.data.status !== "SUCCESS" &&
          result.data.status !== "FAILED"
        ) {
          timer = setTimeout(() => {
            getStatus();
          }, 5000);
        } else {
          clearTimeout(timer);
        }
      };
    } catch (error) {
      console.error(error);
      setTransfering(false);
    }
  };

  // Chain selection handlers
  const handleFromChainSelect = (chain: Chain) => {
    setFromChain(chain);
    // Clear source token selection when source chain changes
    setFromToken(null);
  };

  const handleToChainSelect = (chain: Chain) => {
    setToChain(chain);
    // Clear target token selection when target chain changes
    setToToken(null);
  };

  // Token selection handlers
  const handleFromTokenSelect = (token: Token) => {
    setFromToken(token);
  };

  const handleToTokenSelect = (token: Token) => {
    setToToken(token);
  };

  // Validate address when recipient address or target chain changes
  useEffect(() => {
    if (recipientAddress && toChain) {
      const validation = validateAddress(recipientAddress, toChain.key);

      setAddressValidation(validation);
    } else {
      setAddressValidation({ isValid: false });
    }
  }, [recipientAddress, toChain]);

  // Recipient address handler
  const handleRecipientAddressChange = (address: string) => {
    setRecipientAddress(address);
  };

  // Amount validation and handler
  const validateAmount = async (value: string): Promise<string> => {
    if (!value.trim()) {
      return "Amount is required";
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }

    if (numValue <= 0) {
      return "Amount must be greater than 0";
    }

    // Check for too many decimal places (max 6 for most tokens)
    const decimalPlaces = (value.split(".")[1] || "").length;
    if (decimalPlaces > 6) {
      return "Maximum 6 decimal places allowed";
    }

    // Check balance if wallet and token are available
    if (fromToken && fromChain && wallets) {
      try {
        const walletKey = fromChain.type === "evm" ? "evm" : fromChain.key;
        const wallet = (wallets as any)[walletKey];
        if (wallet?.wallet?.balanceOf && wallet?.account) {
          const balance = await wallet.wallet.balanceOf(
            fromToken.contractAddress,
            wallet.account
          );

          // Convert balance to the same unit as amount (considering decimals)
          const balanceInTokenUnit = Big(balance).div(10 ** fromToken.decimals);
          const amountBig = Big(value);

          if (amountBig.gt(balanceInTokenUnit)) {
            return `Insufficient balance. Available: ${balanceInTokenUnit.toFixed(
              6
            )} ${fromToken.symbol}`;
          }
        }
      } catch (error) {
        console.error("Error checking balance:", error);
        return "Failed to check balance";
      }
    }

    return "";
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = sanitizedValue.split(".");
    if (parts.length > 2) {
      return;
    }

    setAmount(sanitizedValue);

    // Use debounced validation for balance checking
    debouncedValidateAmount(sanitizedValue);
  };

  const { run: debouncedQuote } = useDebounceFn(quote, {
    wait: 500
  });

  const { run: debouncedValidateAmount } = useDebounceFn(
    async (value: string) => {
      const error = await validateAmount(value);
      setAmountError(error);
    },
    {
      wait: 300
    }
  );

  // Re-validate amount when token or chain changes
  useEffect(() => {
    if (amount && fromToken && fromChain) {
      debouncedValidateAmount(amount);
    }
  }, [fromToken, fromChain, amount]);

  useEffect(() => {
    if (
      !fromToken ||
      !toToken ||
      !amount ||
      !recipientAddress ||
      amountError ||
      !addressValidation?.isValid
    )
      return;
    debouncedQuote(true);
  }, [
    fromToken,
    toToken,
    recipientAddress,
    amount,
    amountError,
    addressValidation
  ]);

  return {
    quoting,
    quoteData,
    quote,
    // Chain selection state and methods
    fromChain,
    toChain,
    handleFromChainSelect,
    handleToChainSelect,
    // Token selection state and methods
    fromToken,
    toToken,
    handleFromTokenSelect,
    handleToTokenSelect,
    // Recipient address state and methods
    recipientAddress,
    handleRecipientAddressChange,
    addressValidation,
    // Amount state and methods
    amount,
    amountError,
    handleAmountChange,
    transfering,
    transfer
  };
}
