import { formatAddress } from "@/utils/format/address";
import clsx from "clsx";
import dayjs from "dayjs";
import { useHistoryStore } from "@/stores/use-history";
import { formatNumber } from "@/utils/format/number";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useToast from "@/hooks/use-toast";

export default function Pending(props: any) {
  const { className, isTitle = true, contentClassName } = props;

  const historyStore = useHistoryStore();

  return (
    <div className={clsx("mt-[12px] rounded-[12px] px-[15px] md:px-[30px] pt-[20px] pb-[30px] bg-white border border-[#F2F2F2] shadow-[0_0_6px_0_rgba(0,0,0,0.10)]", className)}>
      {
        isTitle && (
          <div className="text-[16px] font-[500]">
            {historyStore.pendingStatus.length} Pending transfers
          </div>
        )
      }
      <div className={clsx("mt-[14px] grid grid-cols-1 md:grid-cols-2 gap-[18px]", contentClassName)}>
        {historyStore.pendingStatus.map((item) => (
          <PendingItem
            key={item}
            data={historyStore.history[item]}
          />
        ))}
      </div>
      {historyStore.pendingStatus.length === 0 && (
        <div className="text-[14px] font-[300] opacity-50 text-center">
          No Data.
        </div>
      )}
    </div>
  );
}

const PendingItem = ({ className, data }: any) => {
  const navigate = useNavigate();
  const historyStore = useHistoryStore();
  const toast = useToast();
  const [isCancelling, setIsCancelling] = useState(false);

  const duration = useMemo(() => {
    if (data.timeEstimate <= 60) {
      return `${data.timeEstimate} sec${data.timeEstimate > 1 ? "s" : ""}`;
    }
    if (data.timeEstimate <= 3600) {
      return `${Math.floor(data.timeEstimate / 60)} min${data.timeEstimate / 60 > 1 ? "s" : ""}`;
    }
    return `${Math.floor(data.timeEstimate / 3600)} hour${data.timeEstimate / 3600 > 1 ? "s" : ""}`;
  }, [data.timeEstimate]);

  const handleClick = () => {
    if (data.isScan && data.scanChainName && data.despoitAddress) {
      navigate(`/scan/${data.scanChainName}/${data.despoitAddress}`);
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.despoitAddress || isCancelling) return;

    setIsCancelling(true);
    try {
      // Remove the scan record completely from history
      historyStore.removeHistory(data.despoitAddress);
      toast.success({
        title: "Transfer cancelled"
      });
    } catch (error) {
      console.error("Failed to cancel transfer:", error);
      toast.fail({
        title: "Failed to cancel transfer"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div 
      className={clsx(
        "w-full md:w-[300px] bg-[#EDF0F7] rounded-[12px]",
        data.isScan && "cursor-pointer hover:bg-[#E0E5F0] transition-colors",
        className
      )}
      onClick={data.isScan ? handleClick : undefined}
    >
      <div className="rounded-[12px] bg-white border border-[#EDF0F7] p-[12px] relative">
        {data.isScan && (
          <div className="absolute top-[8px] right-[8px] flex items-center gap-[8px]">
            <div className="px-[6px] py-[2px] bg-[#7083ee] text-white text-[10px] font-medium rounded-[4px]">
              SCAN
            </div>
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="hidden button px-[12px] h-[24px] rounded-[6px] bg-[#E5E7EB] text-[#9FA7BA] text-[10px] font-medium hover:bg-[#D1D5DB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? "Cancelling..." : "Cancel"}
            </button>
          </div>
        )}
        <div className="flex items-center gap-[10px]">
          <img
            src={data.fromToken.icon}
            alt="usdt"
            className="w-[28px] h-[28px]"
          />
          <span>
            <span className="text-[16px] font-bold">
              {formatNumber(data.amount, 2, true)}
            </span>{" "}
            <span className="text-[12px] font-[500]">
              {data.fromToken.symbol}
            </span>
          </span>
        </div>
        <div className="mt-[10px] text-[12px] font-[400] text-[#999]">
          Estimated ~{duration} due to settlement/queue.
        </div>
        <div className="mt-[10px] flex items-center justify-between">
          <ChainAndAddress data={data.fromToken} address={data.fromAddress} />
          <img
            src="/icon-arrow-right.svg"
            alt=""
            className="w-[5px] h-[8px] object-center object-contain shrink-0"
          />
          <ChainAndAddress data={data.toToken} address={data.toAddress} />
        </div>
      </div>
      <div className="h-[30px] text-[12px] font-[400] text-center leading-[30px]">
        {dayjs(data.time).format("MMM D, YYYY h:mm A")}
      </div>
    </div>
  );
};

const ChainAndAddress = ({ className, data, address }: any) => {
  return (
    <div className={clsx("flex items-center gap-[6px]", className)}>
      <img src={data.chainIcon} alt="sol" className="w-[26px] h-[26px]" />
      <div>
        <div className="text-[12px] font-[500]">{data.chainName}</div>
        <div className="text-[12px] font-[400]">
          {formatAddress(address, 5, 4)}
        </div>
      </div>
    </div>
  );
};
