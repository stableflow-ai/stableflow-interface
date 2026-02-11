import Button from "@/components/button";
import { Service } from "@/services/constants";
import useBridgeStore from "@/stores/use-bridge";
import useWalletStore from "@/stores/use-wallet";
import useWalletsStore from "@/stores/use-wallets";
import { useDebounceFn } from "ahooks";
import { useMemo } from "react";
import { useSwitchChain } from "wagmi";

export default function BridgeButton({
  onClick,
  onQuote,
  errorChain
}: {
  onClick: () => void;
  onQuote: (params: { dry: boolean; }, isSync?: boolean) => void;
  errorChain: number;
}) {
  const { run: onQuoteDebounce } = useDebounceFn(onQuote, { wait: 2000 });
  const bridgeStore = useBridgeStore();
  const { switchChainAsync } = useSwitchChain();
  const wallets = useWalletsStore();
  const walletStore = useWalletStore();
  const solanaWallet = wallets["sol"];

  const quoteData = bridgeStore.quoteDataMap.get(bridgeStore.quoteDataService);
  const loading = Array.from(bridgeStore.quotingMap.values()).some((value) => value === true) || bridgeStore.transferring;

  const wallet = useMemo(() => {
    // @ts-ignore
    return wallets[walletStore.fromToken?.chainType];
  }, [wallets, walletStore.fromToken]);

  const errorConnect = useMemo(() => {
    return !!wallet && !wallet.account;
  }, [wallet]);

  const buttonText = useMemo(() => {
    if (errorConnect) {
      return `Connect to ${walletStore.fromToken?.chainName ?? "Wallet"}`;
    }
    if (bridgeStore.errorTips) {
      return bridgeStore.errorTips;
    }
    if (errorChain) {
      return "Switch Network";
    }
    const quoteData = bridgeStore.quoteDataMap.get(bridgeStore.quoteDataService);
    const isFromTron = quoteData?.quoteParam?.fromToken?.chainType === "tron";
    const isFromTronEnergy = isFromTron && bridgeStore.acceptTronEnergy && bridgeStore.quoteDataService === Service.OneClick;
    if (quoteData?.needApprove && !isFromTronEnergy) {
      return "Approve";
    }
    if (quoteData?.needCreateTokenAccount) {
      if (!solanaWallet?.account) {
        return "Connect to Solana";
      }
      if (bridgeStore.recipientAddress && bridgeStore.recipientAddress?.toLowerCase?.() !== solanaWallet?.account?.toLowerCase?.()) {
        return "Please connect to the same Solana wallet";
      }
      return "Initialize Solana USDC Account";
    }
    return "Transfer";
  }, [bridgeStore.errorTips, errorChain, bridgeStore.quoteDataService, bridgeStore.quoteDataMap, errorConnect, bridgeStore.acceptTronEnergy]);

  const buttonDisabled = useMemo(() => {
    if (errorConnect) {
      return false;
    }
    if (!!bridgeStore.errorTips || loading || !bridgeStore.quoteDataService || bridgeStore.quoteDataMap.size < 1) {
      return true;
    }
    return false;
  }, [errorConnect, bridgeStore.errorTips, loading, bridgeStore.quoteDataService, bridgeStore.quoteDataMap]);

  return (
    <>
      <Button
        disabled={buttonDisabled}
        loading={loading}
        className="w-full h-[50px] mt-[10px] rounded-[25px] bg-[#6284F5] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] text-white text-[16px]"
        onClick={() => {
          if (errorConnect) {
            wallet?.connect?.();
            return;
          }

          if (!!bridgeStore.errorTips) return;

          if (errorChain) {
            switchChainAsync({ chainId: errorChain }, {
              onSuccess: () => {
                onQuoteDebounce({ dry: true });
              },
            });
            return;
          }

          if (quoteData?.needCreateTokenAccount) {
            if (!solanaWallet?.account) {
              solanaWallet.connect();
              return;
            }
            if (bridgeStore.recipientAddress && bridgeStore.recipientAddress?.toLowerCase?.() !== solanaWallet?.account?.toLowerCase?.()) {
              return;
            }
          }

          onClick();
        }}
      >
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
          {buttonText}
        </span>
      </Button>
      {
        quoteData?.needCreateTokenAccount && (
          <div className="text-[12px] text-[70788A] py-2 text-center">
            The recipient address must have an active {quoteData?.quoteParam?.toToken?.symbol ?? "USDC"} account.
          </div>
        )
      }
    </>
  );
}
