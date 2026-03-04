import { Service } from "@/services/constants";
import Big from "big.js";

export const sortQuoteData = (quoteDataMap: Map<string, any>) => {
  const validQuoteList = Array.from(quoteDataMap.entries()).filter(([_, data]) => !data.errMsg);

  const sortedQuoteData = validQuoteList.sort((a: any, b: any) => {
    const [_serviceA, dataA] = a;
    const [_serviceB, dataB] = b;

    let netA = Big(dataA.outputAmount || 0);
    let netB = Big(dataB.outputAmount || 0);

    // Usdt0 should minus message fee
    if ([Service.Usdt0, Service.Usdt0OneClick].includes(_serviceA)) {
      netA = netA.minus(dataA.fees?.nativeFeeUsd || 0);
    }
    if ([Service.Usdt0, Service.Usdt0OneClick].includes(_serviceB)) {
      netB = netB.minus(dataB.fees?.nativeFeeUsd || 0);
    }

    if ([Service.OneClickUsdt0].includes(_serviceA)) {
      netA = netA.minus(dataA.fees?.destinationGasFeeUsd || 0);
    }
    if ([Service.OneClickUsdt0].includes(_serviceB)) {
      netB = netB.minus(dataB.fees?.destinationGasFeeUsd || 0);
    }

    // csl("QuoteRoutes", "green-500", "%s data: %o, output amount: %o", _serviceA, dataA, netA.toFixed(6, 0));
    // csl("QuoteRoutes", "green-500", "%s data: %o,  output amount: %o", _serviceB, dataB, netB.toFixed(6, 0));

    if (netB.gt(netA)) return 1;
    if (netA.gt(netB)) return -1;

    if (netA.eq(netB)) return 0;

    return 0;
  });

  return sortedQuoteData;
};
