import usePricesStore from "@/stores/use-prices";
import { useRequest } from "ahooks";
import axios from "axios";

export function usePrices() {
  const pricesStore = usePricesStore();

  const { } = useRequest(async () => {
    try {
      const res = await axios.get("https://api.dapdap.net/get-token-price-by-dapdap");
      if (res.status !== 200 || res.data?.code !== 0) {
        return;
      }
      pricesStore.set({
        prices: res.data.data,
      });
    } catch (error) {
      console.log("get prices failed: %o", error);
    }
  }, {
    pollingInterval: 120000, // 2 minute
  });

  return {};
}
