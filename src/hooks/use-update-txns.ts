import { useHistoryStore } from "@/stores/use-history";
import oneClickService from "@/services/oneclick";
import { useEffect } from "react";
import { Service } from "@/services";

export default function useUpdateTxns() {
  const historyStore = useHistoryStore();
  const updateTxns = async () => {
    const pendingStatus = JSON.parse(
      JSON.stringify(historyStore.pendingStatus)
    );
    while (pendingStatus.length > 0) {
      const address = pendingStatus.pop();
      const historyType = historyStore.history[address]?.type;
      // 1click transfer
      if (historyType === Service.OneClick) {
        const result = await oneClickService.getStatus({
          depositAddress: address
        });
        let status = result.data.status;
        if (status === "PENDING_DEPOSIT") {
          if (result.data.quoteResponse?.quote?.deadline) {
            const isTimeout = Date.now() > new Date(result.data.quoteResponse?.quote?.deadline).getTime();
            if (isTimeout) {
              status = "FAILED";
            }
          }
        }
        historyStore.updateStatus(address, status);
        historyStore.updateHistory(address, {
          toChainTxHash: result.data.swapDetails?.destinationChainTxHashes?.[0]?.hash,
        });
      }

      // usdt0 transfer
      if (historyType === Service.Usdt0) {
        // TODO
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
