import Loading from "@/components/loading/icon";
import { useHistoryStore } from "@/stores/use-history";
import { formatNumber } from "@/utils/format/number";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

const PendingTransfer = (props: any) => {
  const { className: _className } = props;

  const { pendingStatus, history } = useHistoryStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const [hasPending] = useMemo(() => {
    return [
      pendingStatus?.length > 0,
    ];
  }, [pendingStatus]);

  if (!hasPending) return null;

  return (
    <div className="w-full">
      <Swiper
        style={{
          width: "100%",
          paddingBottom: 10,
          paddingLeft: 10,
          paddingRight: 10,
        }}
        spaceBetween={0}
        slidesPerView={pendingStatus.length > 1 ? 1.1 : 1}
        onSlideChange={(slide) => {
          setCurrentIndex(slide.activeIndex);
        }}
        loop={false}
        breakpoints={{
          640: {
            slidesPerView: pendingStatus.length > 1 ? 1.2 : 1,
          },
        }}
      >
        {
          pendingStatus.map((pending, index) => (
            <SwiperSlide key={index}>
              <PendingItem
                className=""
                data={history[pending]}
                isCurrent={index === currentIndex}
                isLastSlide={index === pendingStatus.length - 1}
              />
            </SwiperSlide>
          ))
        }
      </Swiper>
    </div>
  );
};

export default PendingTransfer;

const PendingItem = (props: any) => {
  const { className, data, isCurrent, isLastSlide } = props;

  return (
    <div className={clsx(
      "h-[46px] flex justify-between items-center gap-[10px] pl-[9px] pr-[16px] bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,_0,_0,_0.10)] text-[16px] text-black font-[500] leading-[100%] transition-all duration-300",
      isLastSlide && isCurrent ? "mr-0" : "mr-2",
      className
    )}>
      <div className="flex items-center gap-[11px]">
        <div className="flex items-center gap-[8px]">
          <img
            src={data.fromToken.chainIcon}
            alt=""
            className="w-[26px] h-[26px] rounded-[4px] object-center object-contain shrink-0"
          />
          <img
            src="/icon-arrow-right.svg"
            alt=""
            className="w-[5px] h-[8px] object-center object-contain shrink-0"
          />
          <img
            src={data.toToken.chainIcon}
            alt=""
            className="w-[26px] h-[26px] rounded-[4px] object-center object-contain shrink-0"
          />
        </div>
        <div className="flex items-center gap-[5px]">
          <div className="font-[700]">
            {formatNumber(data.amount, 2, true)}
          </div>
          <div className="text-[12px] text-[#444C59]">
            {data.fromToken.symbol}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-[8px]">
        <Loading size={12} className="text-[#FFBF19]" />
        <div className="text-[#FFBF19]">
          Pending
        </div>
      </div>
    </div>
  );
};
