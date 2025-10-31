import { useHistoryStore } from "@/stores/use-history";
import dayjs from "dayjs";
import { formatNumber } from "@/utils/format/number";
import clsx from "clsx";
import useIsMobile from "@/hooks/use-is-mobile";
import Pagination from "@/components/pagination";
import { useEffect, useMemo, useState } from "react";
import Big from "big.js";
import { useNavigate } from "react-router-dom";

export default function CompleteTransfers(props: any) {
  const { className, contentClassName } = props;

  const historyStore = useHistoryStore();
  const isMobile = useIsMobile();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPage, setTotalPage] = useState(10);

  useEffect(() => {
    if (!historyStore.completeStatus || !historyStore.completeStatus.length) {
      setTotalPage(0);
      setPage(1);
      return;
    }
    setTotalPage(+Big(historyStore.completeStatus.length).div(pageSize).toFixed(0, Big.roundUp));
  }, [historyStore.completeStatus]);

  return (
    <div className={clsx("mt-[12px] rounded-[12px] px-[30px] pt-[20px] pb-[30px] bg-white border border-[#F2F2F2] shadow-[0_0_6px_0_rgba(0,0,0,0.10)]", className)}>
      <div className="text-[16px] font-[500] text-[#444C59]">History transfers</div>
      <div className={clsx("mt-[14px] w-full overflow-x-auto", contentClassName)}>
        {historyStore.completeStatus.slice((page - 1) * pageSize, page * pageSize).map((item) => !!historyStore.history[item] ? (
          <CompleteTransferItem
            key={item}
            data={historyStore.history[item]}
            status={historyStore.status[item]}
            isMobile={isMobile}
          />
        ) : null)}
      </div>
      {historyStore.completeStatus.length === 0 && (
        <div className="text-[14px] font-[300] h-[200px] flex items-center justify-center opacity-50 text-center">
          No Data.
        </div>
      )}
      <Pagination
        className="py-[18px] justify-end"
        totalPage={totalPage}
        page={page}
        pageSize={pageSize}
        onPageChange={(page: number) => {
          setPage(page);
        }}
      />
    </div>
  );
}

const CompleteTransferItem = ({ data, status, isMobile }: any) => {
  const navigate = useNavigate();
  const isSuccess = status === "SUCCESS";
  const formatStatus = useMemo(() => {
    if (status === "SUCCESS") return "Success";
    if (status === "REFUNDED") return "Refunded";
    if (status === "FAILED") return "Failed";
    return "Pending";
  }, [status]);

  const handleClick = () => {
    if (data.isScan && data.scanChainName && data.despoitAddress) {
      navigate(`/scan/${data.scanChainName}/${data.despoitAddress}`);
    }
  };

  return (
    <div 
      className={clsx(
        "flex items-center justify-between border-b border-[#EBF0F8] py-[10px] gap-[10px] relative",
        data.isScan && "cursor-pointer hover:bg-[#F5F7FA] transition-colors"
      )}
      onClick={data.isScan ? handleClick : undefined}
    >
      <div className="flex items-center gap-[10px] shrink-0">
        <img
          src={data.fromToken.icon}
          alt="usdt"
          className="w-[28px] h-[28px]"
        />
        <span className="flex items-center gap-[6px]">
          <span className="text-[16px] font-bold">
            {formatNumber(data.amount, 2, true)}
          </span>{" "}
          <span className="text-[12px] font-[500]">
            {data.fromToken.symbol}
          </span>
          {data.isScan && (
            <div className="px-[6px] py-[2px] bg-[#7083ee] text-white text-[10px] font-medium rounded-[4px]">
              SCAN
            </div>
          )}
        </span>
      </div>
      <div className="flex items-center gap-[10px] shrink-0">
        <img
          src={data.fromToken.chainIcon}
          alt="sol"
          className="w-[26px] h-[26px]"
        />
        <button
          className="text-[14px] font-[500] underline button"
          onClick={(e) => {
            e.stopPropagation();
            window.open(
              `${data.fromToken.blockExplorerUrl}/${data.txHash}`,
              "_blank"
            );
          }}
        >
          Tx
        </button>
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
          !!data.toChainTxHash && (
            <button
              className="text-[14px] font-[500] underline button"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `${data.toToken.blockExplorerUrl}/${data.toChainTxHash}`,
                  "_blank"
                );
              }}
            >
              Tx
            </button>
          )
        }
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
                  {formatStatus}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-[14px] font-[500]">
                {dayjs(data.time).format("MMM D, YYYY h:mm A")}
              </div>
              <div
                className={clsx(
                  "text-[14px] font-[500px] w-[60px]",
                  isSuccess ? "text-[#4DCF5E]" : "text-[#FF6A19]"
                )}
              >
                {formatStatus}
              </div>
            </>
          )
        }
      </div>
    </div>
  );
};
