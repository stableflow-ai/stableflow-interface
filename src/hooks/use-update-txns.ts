import { useHistoryStore } from "@/stores/use-history";
import { useEffect } from "react";
import { ServiceMap } from "@/services";
import { Service } from "@/services/constants";
import useWalletsStore, { type WalletType } from "@/stores/use-wallets";

export default function useUpdateTxns() {
  const historyStore = useHistoryStore();
  const wallets = useWalletsStore();

  const updateTxns = async () => {
    const pendingStatus = JSON.parse(
      JSON.stringify(historyStore.pendingStatus)
    );
    while (pendingStatus.length > 0) {
      const address = pendingStatus.pop();
      const currentHistory = historyStore.history[address];
      const historyType: Service = currentHistory?.type ?? Service.OneClick;
      const wallet = wallets[currentHistory?.fromToken?.chainType as WalletType];

      let getStatusParams: any = {
        hash: currentHistory?.txHash,
        history: currentHistory,
        fromWallet: wallet?.wallet,
      };
      if (historyType === Service.OneClick) {
        getStatusParams = {
          depositAddress: address,
          history: currentHistory,
          fromWallet: wallet?.wallet,
        };
      }

      const result = await ServiceMap[historyType].getStatus(getStatusParams);

      historyStore.updateStatus(address, result.status);
      if (result.toTxHash) {
        historyStore.updateHistory(address, {
          toChainTxHash: result.toTxHash,
        });
      }
    }

    window.updateTxnTimer = setTimeout(() => {
      updateTxns();
    }, 5000);
  };
  useEffect(() => {
    updateTxns();

    // const sumbit = async () => {
    //   const result = await oneClickService.submitHash({
    //     txHash:
    //       "0x78b74dadb2ad4891bcd945fd19d96105a3c66723f1fdea3fd022afd963df009a",
    //     depositAddress:
    //       "0x03caab97eb4a7458be8168b75542030b489aa180568fcd84711efc3622c655ac"
    //   });
    //   console.log(result);
    // };
    // sumbit();

    return () => {
      clearTimeout(window.updateTxnTimer);
    };
  }, []);
}
