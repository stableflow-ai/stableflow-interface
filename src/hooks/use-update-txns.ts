import { useHistoryStore } from "@/stores/use-history";
import oneClickService from "@/services/oneclick";
import { useEffect } from "react";

export default function useUpdateTxns() {
  const historyStore = useHistoryStore();
  const updateTxns = async () => {
    const pendingStatus = JSON.parse(
      JSON.stringify(historyStore.pendingStatus)
    );
    while (pendingStatus.length > 0) {
      const address = pendingStatus.pop();
      const result = await oneClickService.getStatus({
        depositAddress: address
      });
      historyStore.updateStatus(address, result.data.status);
    }

    window.updateTxnTimer = setTimeout(() => {
      updateTxns();
    }, 5000);
  };
  useEffect(() => {
    updateTxns();

    return () => {
      clearTimeout(window.updateTxnTimer);
    };
  }, []);
}
