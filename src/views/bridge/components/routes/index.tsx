import QuoteRoute from "./route";
import useBridgeStore from "@/stores/use-bridge";
import { useMemo } from "react";

const QuoteRoutes = (props: any) => {
  const { } = props;

  const {
    quotingMap,
    quoteDataMap,
    quoteDataService,
    set,
    showRoutes,
  } = useBridgeStore();

  const isQuoting = useMemo(() => {
    return Array.from(quotingMap.values()).some(Boolean);
  }, [quotingMap]);

  const quoteDataList = useMemo(() => {
    quoteDataMap.forEach((data, service) => {
      data.service = service;
    });
    const list = Array.from(quoteDataMap.values()).filter((data) => !data.errMsg);
    // Sort selected item to the first position
    // return list.sort((a, b) => {
    //   const aSelected = quoteDataService === a.service;
    //   const bSelected = quoteDataService === b.service;
    //   if (aSelected && !bSelected) return -1;
    //   if (!aSelected && bSelected) return 1;
    //   return 0;
    // });
    return list;
  }, [quoteDataMap, quoteDataService]);

  const displayedList = showRoutes ? quoteDataList : quoteDataList.slice(0, 1);

  return (
    <div className="w-full px-[5px] mt-[15px] flex flex-col gap-[6px] overflow-hidden">
      {
        displayedList?.length > 0 ? displayedList.map((data) => (
          <QuoteRoute
            key={data.service}
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
          <div className="text-center text-[12px]">
            {isQuoting ? "Quoting..." : "No routes found"}
          </div>
        )
      }
    </div>
  );
};

export default QuoteRoutes;
