import BackButton from "@/components/back-button";
import Pending from "./pending";
import CompleteTransfers from "./complete-transfers";
import { useHistory } from "./hooks/use-history";
import { usePendingHistory } from "./hooks/use-pending-history";
import { useTrack } from "@/hooks/use-track";
import { useEffect } from "react";
import { useMaintenanceStore } from "@/stores/use-maintenance";
import clsx from "clsx";

export default function History() {
  const history = useHistory();
  const pendingHistory = usePendingHistory(history);
  const { addHistory } = useTrack();
  const bannerVisible = useMaintenanceStore((s) => s.getBannerVisible());

  useEffect(() => {
    addHistory({ type: "view" });
  }, []);

  return (
    <div
      className={clsx(
        "w-full md:w-[680px] px-[10px] md:px-0 mx-auto relative pb-[150px]",
        bannerVisible ? "pt-30" : "pt-18",
      )}
    >
      <BackButton
        className={clsx(
          "absolute left-[10px] md:left-[0px] z-[10]",
          bannerVisible ? "top-30" : "top-18",
        )}
      />
      <div className="relative text-center text-[20px] font-[500]">
        Transaction History
      </div>
      <Pending history={pendingHistory} />
      <CompleteTransfers history={history} />
    </div>
  );
}
