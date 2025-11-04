import { Service } from "@/services";
import { useHistoryStore } from "@/stores/use-history";
import { formatAddress } from "@/utils/format/address";
import { formatNumber } from "@/utils/format/number";
import Big from "big.js";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

const PendingTransfer = (props: any) => {
  const { className } = props;

  const {
    history,
    status,
    latestHistories,
    closeLatestHistory,
  } = useHistoryStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (
      !latestHistories
      || !latestHistories.length
      || ["PENDING_DEPOSIT", "PROCESSING"].includes(status[latestHistories[0]])
    ) {
      return;
    }
    closeLatestHistory();
  }, []);

  if (!latestHistories || !latestHistories.length) return null;

  return (
    <div className={clsx("w-[calc(100%_+_10px)] px-[5px] pb-[5px] pt-0 md:pt-[20px] -translate-x-[5px] rounded-[12px] overflow-hidden", className)}>
      <Swiper
        style={{
          width: "100%",
          overflow: "visible",
        }}
        spaceBetween={10}
        // slidesPerView={latestHistories.length > 1 ? 1.1 : 1}
        slidesPerView={1}
        onSlideChange={(slide) => {
          setCurrentIndex(slide.activeIndex);
        }}
        loop={false}
        breakpoints={{
          // 640: {
          //   slidesPerView: latestHistories.length > 1 ? 1.2 : 1,
          // },
        }}
      >
        {
          latestHistories.slice(0, 1).map((pending, index) => !!history[pending] ? (
            <SwiperSlide key={index} style={{ width: "100%" }}>
              <PendingItem
                className=""
                data={history[pending]}
                status={status[pending]}
                close={closeLatestHistory}
                isCurrent={index === currentIndex}
                isLastSlide={index === latestHistories.length - 1}
              />
            </SwiperSlide>
          ) : null)
        }
      </Swiper>
    </div>
  );
};

export default PendingTransfer;

const PendingItem = (props: any) => {
  const { className, data, status, close } = props;

  const isPending = ["PENDING_DEPOSIT", "PROCESSING"].includes(status);
  const isSuccess = ["SUCCESS"].includes(status);
  const MaxPendingProgress = 90;
  const [progress, setProgress] = useState(0);

  const toTokenExplorerUrl = useMemo(() => {
   if (data.type === Service.Usdt0) {
    return "https://layerzeroscan.com/tx";
   }
   return data.toToken.blockExplorerUrl;
  }, [data.txHash, data.type, data.toToken]);

  useEffect(() => {
    if (!isPending) {
      setProgress(100);
      return;
    }

    let timer: any;
    const calcProgress = () => {
      const now = Date.now();
      const timeEstimate = data.timeEstimate || 1;
      let _progress = Big(now).minus(data.time).div(Big(timeEstimate).times(1000)).times(100);
      if (_progress.gt(MaxPendingProgress)) {
        _progress = Big(MaxPendingProgress);
        clearInterval(timer);
      }
      setProgress(+_progress.toFixed(2));
    };
    calcProgress();

    timer = setInterval(calcProgress, 2000);

    return () => {
      clearInterval(timer);
    };
  }, [data, status]);

  return (
    <div className={clsx(
      "relative w-full h-[70px] flex flex-col justify-center items-stretch gap-[10px] px-[10px] md:px-[16px] bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,_0,_0,_0.10)] text-[16px] text-black font-[500] leading-[100%] transition-all duration-300",
      className
    )}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-[5px]">
          <a
            className="w-[11px] h-[11px] shrink-0 button"
            target="_blank"
            href={`${data.fromToken.blockExplorerUrl}/${data.txHash}`}
            rel="noreferrer noopener nofollow"
          >
            <svg className="w-[11px] h-[11px] shrink-0" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 2H1V10H9V6" stroke="#9FA7BA" />
              <path d="M4 7L10 1M10 1H6.5M10 1V4" stroke="#9FA7BA" />
            </svg>
          </a>
          <div className="text-[#9FA7BA] text-[12px] font-[500] leading-[100%]">
            {data.fromToken.chainName}
          </div>
          <div className="text-[#444C59] text-[12px] font-[400] leading-[100%]">
            {formatAddress(data.fromAddress, 5, 4)}
          </div>
          <svg className="w-[5px] h-[8px] shrink-0" width="5" height="8" viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L4 4.10345L1 7" stroke="#9FA7BA" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {
            !!data.toChainTxHash && (
              <a
                className="w-[11px] h-[11px] shrink-0 button"
                target="_blank"
                href={`${toTokenExplorerUrl}/${data.toChainTxHash}`}
                rel="noreferrer noopener nofollow"
              >
                <svg className="w-[11px] h-[11px] shrink-0" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 2H1V10H9V6" stroke="#9FA7BA" />
                  <path d="M4 7L10 1M10 1H6.5M10 1V4" stroke="#9FA7BA" />
                </svg>
              </a>
            )
          }
          <div className="text-[#9FA7BA] text-[12px] font-[500] leading-[100%]">
            {data.toToken.chainName}
          </div>
          <div className="text-[#444C59] text-[12px] font-[400] leading-[100%]">
            {formatAddress(data.toAddress, 5, 4)}
          </div>
        </div>
        {
          !isPending && (
            <button
              type="button"
              className="w-[12px] h-[11px] shrink-0 button"
              onClick={() => {
                close();
              }}
            >
              <svg className="w-[12px] h-[11px] shrink-0" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="10.2324" y1="1.41421" x2="1.9498" y2="9.69684" stroke="#A1A699" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5.6867 5.15155L1.99707 1.46191M7.80788 7.27273L10.5351 9.99996" stroke="#A1A699" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          )
        }
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-[7px]">
          <img
            src={data.fromToken.icon}
            alt=""
            className="w-[28px] h-[28px] rounded-full object-center object-contain shrink-0"
          />
          <div className="flex items-center gap-[5px]">
            <div className="text-black text-[16px] font-[700] leading-[100%]">
              {formatNumber(data.amount, 2, true)}
            </div>
            <div className="text-[#444C59] text-[12px] font-[500] leading-[100%]">
              {data.fromToken.symbol}
            </div>
          </div>
        </div>
        <div
          className={clsx(
            "text-[14px] font-[400] leading-[100%] flex items-center gap-[5px] justify-end",
            isPending ? "text-[#6284F5]" : (isSuccess ? "text-[#2EA97C]" : "text-[#FF6A19]")
          )}
        >
          {
            (!isPending && isSuccess) && (
              <svg
                className="w-[14px] h-[10px] shrink-0"
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1.5 4L5.82143 8.49986L12.5 1" stroke="#2EA97C" stroke-width="1.5" />
              </svg>
            )
          }
          <div className="">
            {isPending ? "Pending" : (isSuccess ? "Complete" : "Failed")}
          </div>
        </div>
      </div>
      <div className="w-full h-[3px] absolute bottom-[1px] left-0 px-[12px]">
        <div className="w-full h-full overflow-hidden rounded-[2px]">
          <motion.div
            className={clsx(
              "w-full h-full rounded-[2px] ml-[-100%]",
              (isSuccess || isPending) ? "bg-[#2EA97C]" : "bg-[#FF6A19]"
            )}
            animate={{
              x: `${progress}%`,
            }}
            transition={{
              ease: "linear",
              duration: 2,
            }}
          />
        </div>
      </div>
    </div>
  );
};
