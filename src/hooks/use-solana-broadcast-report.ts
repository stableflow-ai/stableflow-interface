import { useEffect } from "react";
import { processAllPendingSolanaBroadcastReports } from "@/stores/use-solana-broadcast-report";

export function useSolanaBroadcastReport() {
  useEffect(() => {
    processAllPendingSolanaBroadcastReports();
  }, []);
}
