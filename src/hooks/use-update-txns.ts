import { useHistoryStore } from "@/stores/use-history";
import oneClickService from "@/services/oneclick";
import { useEffect } from "react";
import { Service, ServiceMap } from "@/services";

export default function useUpdateTxns() {
  const historyStore = useHistoryStore();
  const updateTxns = async () => {
    const pendingStatus = JSON.parse(
      JSON.stringify(historyStore.pendingStatus)
    );
    while (pendingStatus.length > 0) {
      const address = pendingStatus.pop();
      const currentHistory = historyStore.history[address];
      const historyType = currentHistory?.type;
      // 1click transfer
      if (historyType === Service.OneClick || historyType === void 0) {
        const result = await ServiceMap[Service.OneClick].getStatus({
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
        try {
          const response = await ServiceMap[Service.Usdt0].getStatus({
            hash: currentHistory?.txHash,
          });
          const result = response.data.data[0];
          // INFLIGHT | CONFIRMING | DELIVERED | BLOCKED | FAILED
          const status = result.status.name;
          let finalStatus = "PENDING_DEPOSIT";
          if (status === "DELIVERED") {
            finalStatus = "SUCCESS";
          }
          if (status === "FAILED" || status === "BLOCKED") {
            finalStatus = "FAILED";
          }
          historyStore.updateStatus(address, finalStatus);
        } catch (error) {
        }
      }

      // cctp transfer
      if (historyType === Service.CCTP) {
        try {
          const response = await ServiceMap[Service.CCTP].getStatus({
            hash: currentHistory?.txHash,
          });
          const result = response.data.data;
          // status: 1 = minted, 3 = burned
          // to_tx_hash: minted tx hash
          historyStore.updateHistory(address, {
            toChainTxHash: result.to_tx_hash,
          });
          const status = result.status;
          // success
          if (status === 1) {
            historyStore.updateStatus(address, "SUCCESS");
          }
          // Expired
          if (status === 2) {
            historyStore.updateStatus(address, "FAILED");
          }
        } catch (error) {
        }
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
