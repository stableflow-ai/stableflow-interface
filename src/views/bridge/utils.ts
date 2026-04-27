import { Service } from "@/services/constants";
import Big from "big.js";

export const sortQuoteData = (quoteDataMap: Map<string, any>) => {
  const validQuoteList = Array.from(quoteDataMap.entries()).filter(([_, data]) => !data.errMsg);

  const sortedQuoteData = validQuoteList.sort((a: any, b: any) => {
    const [_serviceA, dataA] = a;
    const [_serviceB, dataB] = b;

    const disabledA = !!dataA.routeDisabled;
    const disabledB = !!dataB.routeDisabled;
    if (disabledA !== disabledB) {
      if (disabledA) return 1;
      return -1;
    }

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

export const routeHybridPath = (quoteData: any, service: Service) => {
  if (!quoteData) return [];

  const p = quoteData.quoteParam;

  const buildPath = (
    steps: Array<{ from: any; to: any; svc: Service; skip?: boolean }>
  ) =>
    steps
      .filter((s) => !s.skip)
      .map(({ from, to, svc }) => ({ fromToken: from, toToken: to, service: svc }));

  switch (service) {
    case Service.OneClickUsdt0:
      return buildPath([
        { from: p?.fromToken, to: p?.middleToken, svc: Service.OneClick },
        { from: p?.middleToken, to: p?.toToken, svc: Service.Usdt0 },
      ]);
    case Service.Usdt0OneClick:
      return buildPath([
        { from: p?.fromToken, to: p?.middleToken, svc: Service.Usdt0 },
        { from: p?.middleToken, to: p?.toToken, svc: Service.OneClick },
      ]);
    case Service.OneClickFraxZero:
      return buildPath([
        { from: p?.fromToken, to: p?.middleToken, svc: Service.OneClick, skip: p?.isFromEthereumUSDC },
        { from: p?.middleToken, to: p?.middleToken2, svc: Service.FraxZero },
        { from: p?.middleToken2, to: p?.toToken, svc: Service.FraxZero, skip: p?.isToEthereumFrxUSD },
      ]);
    case Service.FraxZeroOneClick:
      return buildPath([
        { from: p?.fromToken, to: p?.middleToken2, svc: Service.FraxZero, skip: p?.isFromEthereumFrxUSD },
        { from: p?.middleToken2, to: p?.middleToken, svc: Service.FraxZero },
        { from: p?.middleToken, to: p?.toToken, svc: Service.OneClick, skip: p?.isToEthereumUSDC },
      ]);
    default:
      return [];
  }
};

export const routeFullPath = (quoteData: any, service: Service) => {
  if (!quoteData) return [];

  const p = quoteData.quoteParam;

  const hybridPath = routeHybridPath(quoteData, service);

  // not hybrid path
  if (!hybridPath.length) {
    return [
      { token: p?.fromToken },
      { token: p?.toToken },
    ];
  }

  return [
    { token: hybridPath[0].fromToken },
    { token: hybridPath[0].toToken },
    ...hybridPath.slice(1).map((item) => ({ token: item.toToken })),
  ];
};
