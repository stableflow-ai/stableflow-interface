import { useHistoryStore } from "@/stores/use-history";
import dayjs from "dayjs";
import { formatNumber } from "@/utils/format/number";
import { useMemo } from "react";

export default function CompleteTransfers() {
  const historyStore = useHistoryStore();
  const mergedHistory = useMemo(() => {
    return historyStore.completeStatus
      .map((item) => historyStore.history[item])
      .sort((a, b) => b.time - a.time);
  }, [historyStore.completeStatus]);

  return (
    <div className="mt-[12px] rounded-[12px] px-[30px] pt-[20px] pb-[30px] bg-white border border-[#F2F2F2] shadow-[0_0_6px_0_rgba(0,0,0,0.10)]">
      <div className="text-[16px] font-[500]">
        {historyStore.completeStatus.length} Completed transfers
      </div>
      <div className="mt-[14px]">
        {mergedHistory.map((item) => (
          <CompleteTransferItem key={item.despoitAddress} data={item} />
        ))}
      </div>
      {historyStore.completeStatus.length === 0 && (
        <div className="text-[14px] font-[300] h-[200px] flex items-center justify-center opacity-50 text-center">
          No Data.
        </div>
      )}
    </div>
  );
}

const CompleteTransferItem = ({ data }: any) => {
  return (
    <div className="flex items-center justify-between border-b border-[#EBF0F8] py-[10px]">
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
      <div className="flex items-center gap-[10px]">
        <img
          src={data.fromToken.chainIcon}
          alt="sol"
          className="w-[26px] h-[26px]"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="5"
          height="10"
          viewBox="0 0 5 10"
          fill="none"
        >
          <path
            d="M1 1L4 5.13793L1 9"
            stroke="#444C59"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <img
          src={data.toToken.chainIcon}
          alt="sol"
          className="w-[26px] h-[26px]"
        />
        <div className="text-[14px] font-[500]">
          {dayjs(data.time).format("MMM D, YYYY h:mm A")}
        </div>
        <button
          className="text-[14px] font-[500] underline ml-[10px] button"
          onClick={() => {
            window.open(
              `${data.fromToken.blockExplorerUrl}/${data.txHash}`,
              "_blank"
            );
          }}
        >
          Tx
        </button>
      </div>
    </div>
  );
};
