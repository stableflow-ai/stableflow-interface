import Drawer from "@/components/drawer";
import Pending from "./pending";
import CompleteTransfers from "./complete-transfers";
import { useHistoryStore } from "@/stores/use-history";
import clsx from "clsx";
import useIsMobile from "@/hooks/use-is-mobile";

const HistoryDrawer = (props: any) => {
  const { openDrawer, setOpenDrawer, pendingStatus } = useHistoryStore();
  const isMobile = useIsMobile();

  return (
    <Drawer
      title={`${pendingStatus?.length || 0} Pending transfers`}
      open={openDrawer && isMobile}
      onClose={() => {
        setOpenDrawer(false);
      }}
    >
      <HistoryContent {...props} />
    </Drawer>
  );
};

export default HistoryDrawer;

const HistoryContent = (props: any) => {
  const { className } = props;

  return (
    <div className={clsx("h-[calc(100%-60px)] overflow-y-auto", className)}>
      <Pending
        isTitle={false}
        className="!shadow-[unset] !mt-0 !border-[0] !pt-[0px] !pb-[20px] !px-[16px]"
        contentClassName="!mt-0"
      />
      <CompleteTransfers
        className="!shadow-[unset] !mt-0 !border-[0] !border-t !border-t-[#EBF0F8] !rounded-[0px] !pt-[20px] !px-[16px]"
        contentClassName="!mt-[9px]"
      />
    </div>
  );
};
