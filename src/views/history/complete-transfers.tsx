import { useHistoryStore } from "@/stores/use-history";
import dayjs from "dayjs";
import { formatNumber } from "@/utils/format/number";
import clsx from "clsx";
import useIsMobile from "@/hooks/use-is-mobile";

export default function CompleteTransfers(props: any) {
  const { className, contentClassName } = props;

  const historyStore = useHistoryStore();
  const isMobile = useIsMobile();

  return (
    <div className={clsx("mt-[12px] rounded-[12px] px-[30px] pt-[20px] pb-[30px] bg-white border border-[#F2F2F2] shadow-[0_0_6px_0_rgba(0,0,0,0.10)]", className)}>
      <div className="text-[16px] font-[500] text-[#444C59]">History transfers</div>
      <div className={clsx("mt-[14px] w-full overflow-x-auto", contentClassName)}>
        {historyStore.completeStatus.map((item) => (
          <CompleteTransferItem
            key={item}
            data={historyStore.history[item]}
            status={historyStore.status[item]}
            isMobile={isMobile}
          />
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

const CompleteTransferItem = ({ data, status, isMobile }: any) => {
  const isSuccess = status === "SUCCESS";

  return (
    <div className="flex items-center justify-between border-b border-[#EBF0F8] py-[10px] gap-[10px]">
      <div className="flex items-center gap-[10px] shrink-0">
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
      <div className="flex items-center gap-[10px] shrink-0">
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
        {
          isMobile ? (
            <div className="flex flex-col items-end gap-[0px] leading-[100%]">
              <div className="text-[10px] font-[500] text-[#444C59]">
                {dayjs(data.time).format("MMM D, YYYY h:mm A")}
              </div>
              <div className="flex justify-end items-center gap-[6px]">
                <div
                  className={clsx(
                    "text-[14px] font-[500px]",
                    isSuccess ? "text-[#4DCF5E]" : "text-[#FF6A19]"
                  )}
                >
                  {isSuccess ? "Success" : "Failed"}
                </div>
                <button
                  className="text-[14px] font-[500] underline button"
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
          ) : (
            <>
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
              <div
                className={clsx(
                  "text-[14px] font-[500px] ml-[20px] w-[60px]",
                  isSuccess ? "text-[#4DCF5E]" : "text-[#FF6A19]"
                )}
              >
                {isSuccess ? "Success" : "Failed"}
              </div>
            </>
          )
        }
      </div>
    </div>
  );
};
