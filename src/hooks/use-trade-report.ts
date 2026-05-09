import { useEffect } from "react";
import { processAllPendingTradeReports } from "@/stores/use-trade-report";

export function useTradeReport() {
  useEffect(() => {
    processAllPendingTradeReports();
  }, []);
}

