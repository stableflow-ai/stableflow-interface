import { motion } from "framer-motion";
import QuoteRoute from "./route";
import useBridgeStore from "@/stores/use-bridge";
import { useMemo } from "react";

const QuoteRoutes = (props: any) => {
  const { onQuote } = props;

  const {
    quotingMap,
    quoteDataMap,
    quoteDataService,
    set,
  } = useBridgeStore();

  const isQuoting = Array.from(quotingMap.values()).some(Boolean);
  const quoteDataList = useMemo(() => {
    quoteDataMap.forEach((data, service) => {
      data.service = service;
    });
    return Array.from(quoteDataMap.values()).filter((data) => !data.errMsg);
  }, [quoteDataMap]);

  return (
    <div className="hidden md:flex p-[10px] flex-col items-stretch gap-[20px] bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] w-[250px]">
      <div className="flex justify-between items-center shrink-0">
        <div className="text-[16px] font-[500] text-[#0E3616]">Routes</div>
        <button
          type="button"
          className="button w-[16px] h-[16px] shrink-0"
          disabled={isQuoting}
          onClick={() => {
            onQuote({ dry: true });
          }}
        >
          <motion.img
            src="/icon-refresh.svg"
            alt=""
            className="w-full h-full object-center object-contain shrink-0"
            animate={isQuoting ? {
              transform: ["rotate(0deg)", "rotate(360deg)"],
            } : { transform: "rotate(0deg)" }}
            transition={isQuoting ? {
              duration: 1,
              ease: "linear",
              repeat: Infinity,
            } : { duration: 0 }}
          />
        </button>
      </div>
      <div className="flex flex-col gap-[10px] h-0 flex-1 overflow-y-auto">
        {
          quoteDataList?.length > 0 ? quoteDataList.map((data, index) => (
            <QuoteRoute
              key={index}
              service={data.service}
              data={data}
              selected={quoteDataService === data.service}
              onSelect={() => {
                if (quoteDataService === data.service) {
                  return;
                }
                set({
                  quoteDataService: data.service,
                });
              }}
            />
          )) : (
            <div className="text-center text-[12px] pt-[50px]">
              {isQuoting ? "Quoting..." : "No routes found"}
            </div>
          )
        }
      </div>
    </div>
  );
};

export default QuoteRoutes;
