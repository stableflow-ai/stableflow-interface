import { useState, useEffect, useMemo } from "react";
import oneClickService from "@/services/oneclick";
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
import useBridgeStore from "@/stores/use-bridge";
import useTokenBalance from "@/hooks/use-token-balance";
import useToast from "@/hooks/use-toast";
import useBalancesStore, { type BalancesState } from "@/stores/use-balances";
import { BridgeDefaultWallets } from "../config";
import axios from "axios";
import { formatNumber } from "@/utils/format/number";

export default function useBridge(props?: any) {
  const { liquidityError } = props ?? {};

  const wallets = useWalletsStore();
  const historyStore = useHistoryStore();
  const configStore = useConfigStore();
  const walletStore = useWalletStore();
  const bridgeStore = useBridgeStore();
  const { getBalance } = useTokenBalance(walletStore.fromToken, false);
  const balancesStore = useBalancesStore();
  const [errorChain, setErrorChain] = useState<number>(0);
  const toast = useToast();
  const [liquidityErrorMssage, setLiquidityErrorMessage] = useState<boolean>();

  const [fromWalletAddress, toWalletAddress] = useMemo(() => {
    const _fromChainType: WalletType = walletStore.fromToken?.chainType;
    const _toChainType: WalletType = walletStore.toToken?.chainType;
    if (!_fromChainType || !_toChainType) return [];
    const _fromWallet = wallets[_fromChainType];
    const _toWallet = wallets[_toChainType];
    const _fromWalletAddress =
      _fromWallet?.account || BridgeDefaultWallets[_fromChainType];
    const _toWalletAddress =
      _toWallet?.account || BridgeDefaultWallets[_toChainType];
    return [_fromWalletAddress, _toWalletAddress];
  }, [wallets, walletStore]);

  // Recipient address state
  const [addressValidation, setAddressValidation] =
    useState<AddressValidationResult>({
      isValid: false
    });

  // Amount state
  const [amountError, setAmountError] = useState<string>("");

  const quote = async (dry: boolean) => {
    if (
      !walletStore.toToken ||
      !walletStore.fromToken ||
      !fromWalletAddress ||
      !(bridgeStore.recipientAddress || toWalletAddress) ||
      Number(bridgeStore.amount) < 1
    ) {
      bridgeStore.set({ quoteData: null });
      return;
    }

    try {
      bridgeStore.set({ quoting: true });
      setLiquidityErrorMessage(liquidityError);

      const _amount = Big(bridgeStore.amount)
        .times(10 ** walletStore.fromToken.decimals)
        .toFixed(0);

      const quoteRes = await oneClickService.quote({
        dry: dry,
        slippageTolerance: configStore.slippage * 100,
        originAsset: walletStore.fromToken.assetId,
        destinationAsset: walletStore.toToken.assetId,
        amount: _amount,
        refundTo: fromWalletAddress,
        refundType: "ORIGIN_CHAIN",
        recipient: bridgeStore.recipientAddress || toWalletAddress || ""
      });

      if (quoteRes.data?.quote) {
        if (Big(quoteRes.data.quote.timeEstimate || 0).gt(60)) {
          quoteRes.data.quote.timeEstimate = Math.floor(Math.random() * 6) + 40;
        }
      }

      bridgeStore.set({ quoteData: quoteRes.data, quoting: false });
      setLiquidityErrorMessage(false);
      return quoteRes.data;
    } catch (error: any) {
      const getQuoteErrorMessage = () => {
        if (
          error?.response?.data?.message &&
          error?.response?.data?.message !== "Internal server error"
        ) {
          // quote failed, maybe out of liquidity
          if (error?.response?.data?.message === "Failed to get quote") {
            return "Amount exceeds max";
          }
          // Amount is too low for bridge
          if (error?.response?.data?.message?.includes("Amount is too low for bridge, try at least")) {
            const match = error.response.data.message.match(/try at least\s+(\d+(?:\.\d+)?)/i);
            let minimumAmount = match ? match[1] : Big(1).times(10 ** walletStore.fromToken.decimals).toFixed(0);
            minimumAmount = Big(minimumAmount).div(10 ** walletStore.fromToken.decimals);
            return `Amount is too low, at least ${formatNumber(minimumAmount, walletStore.fromToken.decimals, true)}`;
          }
          return error?.response?.data?.message;
        }
        // Unknown error
        return "Failed to get quote, please try again later";
      };

      bridgeStore.set({
        quoting: false,
        quoteData: {
          errMsg: getQuoteErrorMessage(),
        }
      });
      setLiquidityErrorMessage(false);
    }
  };

  const { runAsync: report } = useRequest(async (params: any) => {
    try {
      await axios.post("https://api.db3.app/api/stableflow/trade", params);
    } catch (error) {
      console.log("report failed: %o", error);
    }
  }, {
    manual: true,
  });

  const transfer = async () => {
    if (!walletStore.fromToken) return;
    try {
      bridgeStore.set({ transferring: true });
      const _quote = await quote(false);

      // @ts-ignore
      const wallet = wallets[walletStore.fromToken.chainType];
      const _amount = Big(bridgeStore.amount)
        .times(10 ** walletStore.fromToken.decimals)
        .toFixed(0);

      const hash = await wallet.wallet.transfer({
        originAsset: walletStore.fromToken.contractAddress,
        depositAddress: _quote.quote.depositAddress,
        amount: _amount
      });

      historyStore.addHistory({
        despoitAddress: _quote.quote.depositAddress,
        amount: bridgeStore.amount,
        fromToken: walletStore.fromToken,
        toToken: walletStore.toToken,
        fromAddress: wallet.account,
        toAddress: _quote.quoteRequest.recipient,
        time: Date.now(),
        txHash: hash,
        timeEstimate: _quote.quote.timeEstimate,
      });
      report({
        address: wallet.account,
        receive_address: _quote.quoteRequest.recipient,
        deposit_address: _quote.quote.depositAddress,
      });

      historyStore.updateStatus(_quote.quote.depositAddress, "PENDING_DEPOSIT");
      bridgeStore.set({ transferring: false });
      getBalance();
      toast.success({
        title: "Transfer submitted"
      });
    } catch (error) {
      console.error(error);
      bridgeStore.set({ transferring: false });
      toast.fail({
        title: "Transfer failed"
      });
    }
  };

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

    if (numValue < 1) {
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

  const { run: debouncedQuote } = useDebounceFn(quote, {
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
    debouncedQuote(true);
  }, [
    walletStore.fromToken,
    walletStore.toToken,
    bridgeStore.amount,
    amountError,
    addressValidation,
    fromWalletAddress,
    toWalletAddress
  ]);

  useEffect(() => {
    const check = () => {
      if (!walletStore.fromToken?.contractAddress) {
        return "Please select from chain";
      }
      if (!walletStore.toToken?.contractAddress) {
        return "Please select to chain";
      }
      if (!bridgeStore.amount) {
        return "Please enter amount";
      }
      if (bridgeStore.quoteData?.errMsg) {
        return bridgeStore.quoteData.errMsg;
      }
      if (liquidityErrorMssage) {
        return "Amount exceeds max";
      }
      if (
        walletStore.fromToken.chainType === "evm" &&
        walletStore.fromToken.chainId !== walletStore.fromToken.chainId
      ) {
        return "Please select from chain";
      }
      if (
        walletStore.fromToken?.chainType === "evm" &&
        walletStore.fromToken?.chainId !== wallets.evm?.chainId
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
        return "Recipient wallet not connected";
      }
      if (!addressValidation.isValid) {
        return addressValidation.error;
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
    bridgeStore.quoteData,
    fromWalletAddress,
    toWalletAddress,
    wallets.evm?.chainId,
    liquidityErrorMssage
  ]);

  return {
    quote,
    transfer,
    errorChain,
    addressValidation
  };
}
