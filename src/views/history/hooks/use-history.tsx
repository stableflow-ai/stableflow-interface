import { BASE_API_URL } from "@/config/api";
import chains from "@/config/chains";
import { stablecoinLogoMap } from "@/config/tokens";
import useWalletsStore from "@/stores/use-wallets";
import { useDebounceFn, useRequest } from "ahooks";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

export function useHistory() {
  const wallets = useWalletsStore();

  const [list, setList] = useState<any>([]);
  const [page, setPage] = useState<any>({
    current: 1,
    size: 10,
    total: 0,
    totaPage: 0,
  });

  const accounts = useMemo(() => {
    return Object.values(wallets ?? {}).map((wallet) => wallet.account).filter((account) => !!account);
  }, [wallets]);

  const { runAsync: getList, loading } = useRequest(async (params: any) => {
    try {
      const response = await axios({
        url: `${BASE_API_URL}/v1/trades`,
        params: {
          type: 0,
          status: "success",
          address: params.address,
          page: params.page,
          page_size: page.size,
        },
        method: "GET",
        timeout: 30000,
        headers: {
          "Content-Type": "application/json"
        },
      });

      if (response.status !== 200) {
        return;
      }

      if (response.data.code !== 200) {
        return;
      }

      const _list = response.data.data.data;
      _list.forEach((item: any) => {
        item.token_icon = stablecoinLogoMap[item.symbol];
        item.to_token_icon = stablecoinLogoMap[item.to_symbol];

        const currentFromChain = Object.values(chains).find((chain) => chain.blockchain === item.from_chain);
        const currentToChain = Object.values(chains).find((chain) => chain.blockchain === item.to_chain);

        item.source_chain = currentFromChain;
        item.destination_chain = currentToChain;
      });

      setList(() => {
        return _list;
      });
      setPage((prev: any) => {
        return {
          ...prev,
          current: params.page,
          total: response.data.data.total,
          totalPage: response.data.data.total_page,
        };
      });
    } catch (error) {
      console.error("get history failed: %o", error);
    }
  }, {
    manual: true,
  });

  const { run: debouncedGetList, cancel: cancelGetList } = useDebounceFn(getList, {
    wait: 1000,
  });

  useEffect(() => {
    cancelGetList();
    if (!accounts || accounts.length === 0) {
      setList([]);
      setPage(() => {
        return {
          current: 1,
          size: 10,
          total: 0,
          totaPage: 0,
        };
      });
      return;
    }
    debouncedGetList({
      address: accounts.join(","),
      page: 1,
    });
  }, [accounts]);

  const handleChangePage = (page: number) => {
    if (loading) return;
    getList({
      address: accounts.join(","),
      page,
    });
  };

  return {
    list,
    page,
    loading,
    handleChangePage,
    getList,
  };
}
