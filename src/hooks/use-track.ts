import { BridgeDefaultWallets } from "@/config";
import { BASE_API_URL } from "@/config/api";
import { ServiceBackend, type Service } from "@/services/constants";
import { useTrackStore } from "@/stores/use-track";
import useWalletStore from "@/stores/use-wallet";
import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import { csl } from "@/utils/log";
import { useDebounceFn } from "ahooks";
import axios from "axios";
import Big from "big.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const TrackAction = {
  Connect: "connect_wallet",
  Open: "page_view",
  Quote: "quote_request",
  Transfer: "trade_submit",
  EnterAmount: "enter_amount",
  SetSlippage: "set_slippage",
  ExternalLinkClick: "external_link_click",
  History: "history_page",
  CreateSolanaATA: "create_solana_ata",
} as const;
export type TrackAction = (typeof TrackAction)[keyof typeof TrackAction];

interface TrackParams {
  action: TrackAction;
  route?: string;
  content?: string;
  address?: string;
}

type JSONLeaf = string | number | boolean | null;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];
type JSONValue = JSONLeaf | JSONObject | JSONArray;
type JSONContainer = JSONObject | JSONArray;

export function useTrack(props?: { isRoot?: boolean; }) {
  const { isRoot } = props ?? {};

  const { sessionId, initSessionId } = useTrackStore();
  const wallets = useWalletsStore();
  const walletStore = useWalletStore();

  const [isReportedOpen, setIsReportedOpen] = useState(false);

  const [accounts, _accountAddresses, accountAddressesStr] = useMemo(() => {
    const _connectedWallets = Object.entries(wallets)
      .filter(([chainType]) => !["set"].includes(chainType));
    const __accounts = _connectedWallets
      .map(([chainType, wallet]) => ({
        chain_type: chainType,
        address: wallet.account,
        wallet_name: wallet.walletName,
      }))
      .filter((wallet) => !!wallet.address);
    const __accountAddresses = __accounts.map((account: any) => account.address);
    return [__accounts, __accountAddresses, __accountAddresses.join(",")];
  }, [wallets]);

  const init = () => {
    const _sessionId = uuidv4();
    initSessionId(_sessionId);
    csl("useTrack", "yellow-700", "init session id: %o", sessionId);
    return _sessionId;
  };

  const add = async (params: TrackParams) => {
    let _sessionId = sessionId;
    if (!_sessionId) {
      _sessionId = init();
    }

    const reportParams = {
      source: "stableflow",
      session_id: _sessionId,
      ...params,
    };

    try {
      await axios.post(`${BASE_API_URL}/v1/track`, reportParams);
    } catch (error) {
      csl("useTrack", "red-500", "report track failed: %o", error);
    }
  };

  const checkIsValidAddress = (addr?: string) => {
    if (!addr) return false;
    const defaultWalletAddress = Object.values(BridgeDefaultWallets);
    if (defaultWalletAddress.some((_addr) => _addr.toLowerCase() === addr.toLowerCase())) {
      return false;
    }
    return true;
  };

  const toSnakeCase = (str: string): string => {
    try {
      return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    } catch {
      return str;
    }
  };

  const transformObject = (obj: any): any => {
    try {
      if (obj === null || typeof obj !== 'object') {
        if (typeof obj === 'bigint') {
          return obj.toString();
        }
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(v => transformObject(v));
      }

      return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = toSnakeCase(key);
        const value = obj[key];

        acc[snakeKey] = transformObject(value);

        return acc;
      }, {} as Record<string, any>);
    } catch {
      return obj;
    }
  }

  const formatQuoteData = (quoteData: any) => {
    try {
      const {
        fromToken,
        toToken,
        amountWei,
        recipient,
        refundTo,
        slippageTolerance,
        dry,
      } = quoteData?.quoteParam ?? {};
      const { depositAddress } = quoteData?.quote ?? {};
      const { appFees } = quoteData?.quoteRequest ?? {};

      return {
        estimate_time: quoteData?.estimateTime ?? 0,
        output_amount: quoteData?.outputAmount ?? "0",
        input_amount: Big(amountWei || 0).div(10 ** (fromToken?.decimals || 6)).toFixed(fromToken?.decimals || 6, Big.roundDown),
        recipient: checkIsValidAddress(recipient) ? recipient : "",
        refund_to: checkIsValidAddress(refundTo) ? refundTo : "",
        slippage: slippageTolerance,
        from_chain: fromToken?.blockchain,
        from_token: {
          symbol: fromToken?.symbol,
          address: fromToken?.contractAddress,
          decimals: fromToken?.decimals,
          chain: fromToken?.blockchain,
          chain_type: fromToken?.chainType,
        },
        to_chain: toToken?.blockchain,
        to_token: {
          symbol: toToken?.symbol,
          address: toToken?.contractAddress,
          decimals: toToken?.decimals,
          chain: toToken?.blockchain,
          chain_type: toToken?.chainType,
        },
        estimate_from_gas: quoteData?.estimateSourceGas?.toString() ?? "0",
        // exclude estimate_from_gas
        total_fees_usd: quoteData?.totalFeesUsd ?? "0",
        fees: transformObject(quoteData?.fees ?? {}),
        deposit_address: depositAddress,
        dry,
        app_fees: appFees,
      };
    } catch {
      return {};
    }
  };

  const fromTokenAddress = useMemo(() => {
    return wallets?.[walletStore.fromToken?.chainType as WalletType]?.account ?? "";
  }, [walletStore.fromToken, wallets]);

  useEffect(() => {
    if (!isRoot) return;
    setIsReportedOpen(true);
    addOpen();
  }, [isRoot]);

  // Automatically report when the user connects different wallets
  useEffect(() => {
    if (!isRoot || !isReportedOpen || !accounts?.length) return;
    addConnect({
      content: accounts,
    });
  }, [accountAddressesStr, isRoot, isReportedOpen]);

  const addOpen = () => {
    return add({ action: TrackAction.Open });
  };

  const addConnect = (params: { content: JSONContainer; }) => {
    return add({
      action: TrackAction.Connect,
      content: JSON.stringify(params.content),
    });
  };

  const addQuote = (params: { quoteData: any; service: Service; }) => {
    const { quoteData, service } = params;

    const { errMsg } = quoteData ?? {};
    const { refundTo } = quoteData?.quoteParam ?? {};

    const reportContent: any = {
      route: ServiceBackend[service as Service],
      ...formatQuoteData(quoteData),
    };

    // quote failed
    if (errMsg) {
      reportContent.error_message = errMsg;
    }
    const reportParams: any = {
      action: TrackAction.Quote,
      content: JSON.stringify(reportContent),
    };
    if (checkIsValidAddress(refundTo)) {
      reportParams.addresss = refundTo;
    }
    return add(reportParams);
  };

  const addTransfer = (
    params: {
      type: "transfer_button" | "continue_button";
      quoteData?: any;
      service: Service;
      errMsg?: string;
      txHash?: string;
    }
  ) => {
    const { type, quoteData, service, errMsg, txHash } = params;

    const reportContent: any = {
      type,
      tx_hash: txHash,
      route: ServiceBackend[service as Service],
      ...formatQuoteData(quoteData),
    };
    if (errMsg) {
      reportContent.error_message = errMsg;
    }

    return add({
      action: TrackAction.Transfer,
      address: checkIsValidAddress(quoteData?.quoteParam?.refundTo) ? quoteData?.quoteParam?.refundTo : "",
      content: JSON.stringify(reportContent),
    });
  };

  const { run: addEnterAmount } = useDebounceFn((params: { amount?: string; }) => {
    const { amount } = params ?? {};
    return add({
      action: TrackAction.EnterAmount,
      address: fromTokenAddress,
      content: JSON.stringify({
        amount: amount ?? "",
      }),
    });
  }, { wait: 1000 });

  const addSetSlippage = (params: { value?: string; }) => {
    const { value } = params ?? {};
    return add({
      action: TrackAction.SetSlippage,
      address: fromTokenAddress,
      content: JSON.stringify({
        value: value ?? "",
      }),
    });
  };

  const addExternalLinkClick = (params: { link: string; }) => {
    const { link } = params ?? {};
    return add({
      action: TrackAction.ExternalLinkClick,
      address: fromTokenAddress,
      content: JSON.stringify({
        link: link,
      }),
    });
  };

  const addHistory = (params: { type: "click" | "view" }) => {
    const { type } = params ?? {};
    return add({
      action: TrackAction.History,
      address: fromTokenAddress,
      content: JSON.stringify({
        type,
      }),
    });
  };

  const addCreateSolanaATA = (params: {
    quoteData?: any;
    service: Service;
    errMsg?: string;
  }) => {
    const { quoteData, service, errMsg } = params;

    const reportContent: any = {
      route: ServiceBackend[service as Service],
      ...formatQuoteData(quoteData),
    };
    if (errMsg) {
      reportContent.error_message = errMsg;
    }

    return add({
      action: TrackAction.CreateSolanaATA,
      address: checkIsValidAddress(quoteData?.quoteParam?.refundTo) ? quoteData?.quoteParam?.refundTo : "",
      content: JSON.stringify(reportContent),
    });
  };

  return {
    sessionId,
    add,
    addConnect,
    addQuote,
    addTransfer,
    addEnterAmount,
    addSetSlippage,
    addExternalLinkClick,
    addHistory,
    addCreateSolanaATA,
  };
}
