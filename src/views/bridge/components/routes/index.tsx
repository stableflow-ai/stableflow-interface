import QuoteRoute from "./route";
import useBridgeStore from "@/stores/use-bridge";
import { useMemo } from "react";
import { sortQuoteData } from "../../utils";
import useWalletStore from "@/stores/use-wallet";
import Big from "big.js";

const QuoteRoutes = (props: any) => {
  const { } = props;

  const {
    quotingMap,
    getQuoting,
    quoteDataMap,
    quoteDataService,
    set,
    showRoutes,
    amount,
  } = useBridgeStore();
  const {
    fromToken,
    toToken,
  } = useWalletStore();

  const isQuoting = useMemo(() => {
    return getQuoting();
  }, [quotingMap]);

  const quoteDataList = useMemo(() => {
    const sortedQuoteData = sortQuoteData(quoteDataMap);
    const list = sortedQuoteData.map(([service, data]) => ({
      service,
      ...data,
    }));
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
    <div className="w-full pl-5 pr-5.5 mt-2.5 flex flex-col gap-1.5 overflow-hidden">
      {
        displayedList?.length > 0
          ? displayedList.map((data) => (
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
          ))
          : (
            isQuoting ? (
              <div className="text-center text-[12px]">
                Quoting...
              </div>
            )
              : (
                <div className="text-center text-[12px]">
                  {
                    (!!fromToken?.symbol && !!toToken?.symbol && !!amount && Big(amount).gt(0))
                      ? "No routes found"
                      : ""
                  }
                </div>
              )
          )
      }
    </div>
  );
};

export default QuoteRoutes;
