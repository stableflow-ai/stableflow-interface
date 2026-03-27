export function getPrice(prices: Record<string, string>, symbol: string) {
  let price = "1";
  let _symbol = symbol;
  if (symbol === "USDT0" || symbol === "USD₮0" || symbol === "USD₮") {
    _symbol = "USDT";
  }
  if (prices?.[_symbol]) {
    price = prices[_symbol];
    if (price !== "0") {
      return price;
    }
  }
  if (prices?.[_symbol.toLowerCase()]) {
    price = prices[_symbol.toLowerCase()];
    if (price !== "0") {
      return price;
    }
  }
  if (prices?.[_symbol.toUpperCase()]) {
    price = prices[_symbol.toUpperCase()];
    if (price !== "0") {
      return price;
    }
  }
  return "1";
}
