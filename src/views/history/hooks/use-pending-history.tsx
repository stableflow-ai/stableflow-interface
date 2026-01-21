import { BASE_API_URL } from "@/config/api";
import chains from "@/config/chains";
import { stablecoinLogoMap } from "@/config/tokens";
import { useHistoryStore } from "@/stores/use-history";
import useWalletsStore from "@/stores/use-wallets";
import { useDebounceFn, useRequest } from "ahooks";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";

export function usePendingHistory(history?: any) {
  const wallets = useWalletsStore();
  const historyStore = useHistoryStore();

  const [list, setList] = useState<any>([]);
  const [page, setPage] = useState<any>({
    current: 1,
    size: 100,
    total: 0,
    totaPage: 0,
  });

  const accounts = useMemo(() => {
    const _accounts = Object.values(wallets ?? {}).map((wallet) => wallet.account).filter((account) => !!account);
    return _accounts;
  }, [wallets]);

  const { runAsync: getList, loading } = useRequest(async (params?: any) => {
    try {
      const response = await axios({
        url: `${BASE_API_URL}/v1/trades`,
        params: {
          type: 0,
          status: "pending",
          address: params?.address ?? accounts.join(","),
          page: params?.page ?? page.current,
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

      setList((prev: any) => {
        if (_list.length < prev.length) {
          history?.getList?.({
            address: params?.address ?? accounts.join(","),
            page: history.page.current,
          });
        }
        historyStore.updatePendingNumber(_list.length);
        return _list;
      });
      setPage((prev: any) => {
        return {
          ...prev,
          current: params?.page ?? page.current,
          total: response.data.data.total,
          totalPage: response.data.data.total_page,
        };
      });
    } catch (error) {
      console.error("get pending history failed: %o", error);
    }
  }, {
    manual: true,
  });

  const { run: debouncedGetList, cancel: cancelGetList } = useDebounceFn(getList, {
    wait: 1000,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    cancelGetList();

    // Stop polling function
    const stopPolling = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    // Start polling function
    const startPolling = () => {
      if (!accounts || accounts.length === 0) {
        return;
      }
      const address = accounts.join(",");

      // Clear existing timer
      stopPolling();

      // Start timer
      timerRef.current = setInterval(() => {
        getList({
          address,
          page: 1,
        });
      }, 10000);
    };

    if (!accounts || accounts.length === 0) {
      setList([]);
      historyStore.updatePendingNumber(0);
      setPage(() => {
        return {
          current: 1,
          size: 10,
          total: 0,
          totaPage: 0,
        };
      });
      stopPolling();
      return;
    }

    // Initial request (debounced)
    debouncedGetList({
      address: accounts.join(","),
      page: 1,
    });

    // Start polling based on page visibility
    if (document.visibilityState === 'visible') {
      startPolling();
    }

    // Listen to page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Start polling when page becomes visible
        startPolling();
      } else {
        // Stop polling when page becomes hidden
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [accounts]);

  return {
    list,
    page,
    loading,
    getList,
  };
}
