import { Connection } from "@solana/web3.js";
import { v4 as uuidV4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getChainRpcUrl } from "@/config/chains";
import { TrackAction, trackEvent } from "@/hooks/use-track";
import { createSolanaFallbackConnection } from "@/libs/wallets/utils/solana";
import { csl } from "@/utils/log";

/** Master switch, so the telemetry can be turned off in production without a code change elsewhere. */
const SOLANA_BROADCAST_REPORT_ENABLED = true;

const SOLANA_BROADCAST_REPORT_STORAGE_KEY = "stableflow_solana_broadcast_report_queue";
const SOLANA_BROADCAST_REPORT_BASE_RETRY_MS = 5000;
/** A signature still unknown to the RPC after this long is treated as dropped and dequeued. */
const SOLANA_BROADCAST_REPORT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type SolanaBroadcastOutcome = "landed" | "dropped" | "failed";
export type SolanaBroadcastExitReason =
  | "confirmed"
  | "block_height_exceeded"
  | "max_duration"
  | "recovered_on_startup";

export interface SolanaBroadcastContext {
  route?: string;
  address?: string;
  fromTokenSymbol?: string;
  computeUnitLimit?: number;
  computeUnitPriceMicroLamports?: number;
  priorityFeeLamports?: number;
  feeSource?: string;
  unitsConsumed?: number;
  rpcEndpoint?: string;
}

interface SolanaBroadcastResult {
  outcome: SolanaBroadcastOutcome;
  exitReason: SolanaBroadcastExitReason;
  rebroadcastAttempts?: number;
  timeToLandMs?: number;
  actualUnitsConsumed?: number;
}

export interface SolanaBroadcastReportItem {
  id: string;
  signature: string;
  startedAt: number;
  context: SolanaBroadcastContext;
  result?: SolanaBroadcastResult;
}

interface SolanaBroadcastReportState {
  queue: SolanaBroadcastReportItem[];
  enqueue: (item: SolanaBroadcastReportItem) => void;
  settle: (signature: string, result: SolanaBroadcastResult) => void;
  remove: (id: string) => void;
}

interface TaskMeta {
  inFlight: boolean;
  timer?: ReturnType<typeof setTimeout>;
}

const taskMetaMap = new Map<string, TaskMeta>();

const getRetryDelay = (retryCount: number) => SOLANA_BROADCAST_REPORT_BASE_RETRY_MS * Math.pow(2, retryCount);

const clearTaskMeta = (id: string) => {
  const meta = taskMetaMap.get(id);
  if (meta?.timer) {
    clearTimeout(meta.timer);
  }
  taskMetaMap.delete(id);
};

export const useSolanaBroadcastReportStore = create(persist<SolanaBroadcastReportState>(
  (set) => ({
    queue: [],
    enqueue: (item) => {
      set((state) => ({
        queue: [...state.queue.filter((it) => it.signature !== item.signature), item],
      }));
    },
    settle: (signature, result) => {
      set((state) => ({
        queue: state.queue.map((item) => (item.signature === signature ? { ...item, result } : item)),
      }));
    },
    remove: (id) => {
      set((state) => ({
        queue: state.queue.filter((item) => item.id !== id),
      }));
    },
  }),
  {
    name: SOLANA_BROADCAST_REPORT_STORAGE_KEY,
    version: 0.1,
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ queue: state.queue }) as SolanaBroadcastReportState,
  },
));

const buildContent = (item: SolanaBroadcastReportItem) => {
  const { context, result } = item;
  return {
    signature: item.signature,
    outcome: result?.outcome,
    exit_reason: result?.exitReason,
    route: context.route,
    from_token: { symbol: context.fromTokenSymbol },
    compute_unit_limit: context.computeUnitLimit,
    compute_unit_price_micro_lamports: context.computeUnitPriceMicroLamports,
    priority_fee_lamports: context.priorityFeeLamports,
    fee_source: context.feeSource,
    units_consumed: result?.actualUnitsConsumed ?? context.unitsConsumed,
    simulated_units_consumed: context.unitsConsumed,
    rebroadcast_attempts: result?.rebroadcastAttempts,
    time_to_land_ms: result?.timeToLandMs,
    rpc_endpoint: context.rpcEndpoint,
  };
};

const scheduleRetry = (item: SolanaBroadcastReportItem, retryCount: number) => {
  const meta = taskMetaMap.get(item.id) ?? { inFlight: false };
  if (meta.timer) {
    clearTimeout(meta.timer);
  }
  meta.timer = setTimeout(() => {
    const currentMeta = taskMetaMap.get(item.id);
    if (currentMeta) {
      currentMeta.timer = undefined;
      taskMetaMap.set(item.id, currentMeta);
    }
    void processReport(item, retryCount + 1);
  }, getRetryDelay(retryCount));
  taskMetaMap.set(item.id, meta);
};

const processReport = async (item: SolanaBroadcastReportItem, retryCount = 0) => {
  if (!item.result) {
    return;
  }

  const meta = taskMetaMap.get(item.id);
  if (meta?.inFlight) {
    return;
  }
  taskMetaMap.set(item.id, { ...meta, inFlight: true });

  const succeed = await trackEvent({
    action: TrackAction.SolanaBroadcast,
    address: item.context.address,
    content: JSON.stringify(buildContent(item)),
  });

  if (succeed) {
    useSolanaBroadcastReportStore.getState().remove(item.id);
    clearTaskMeta(item.id);
    return;
  }

  taskMetaMap.set(item.id, { ...(taskMetaMap.get(item.id) ?? {}), inFlight: false });
  scheduleRetry(item, retryCount);
};

export const enqueueSolanaBroadcastReport = (params: {
  signature: string;
  startedAt: number;
  context: SolanaBroadcastContext;
}) => {
  if (!SOLANA_BROADCAST_REPORT_ENABLED) return;
  try {
    useSolanaBroadcastReportStore.getState().enqueue({
      id: uuidV4(),
      signature: params.signature,
      startedAt: params.startedAt,
      context: params.context,
    });
  } catch (error) {
    csl("solana broadcast report", "red-500", "enqueue failed: %o", error);
  }
};

/** Best effort: the real compute units are only known once the transaction is on chain. */
const fetchActualUnitsConsumed = async (connection: Connection, signature: string) => {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    return transaction?.meta?.computeUnitsConsumed;
  } catch {
    return void 0;
  }
};

export const settleSolanaBroadcastReport = async (params: {
  signature: string;
  outcome: SolanaBroadcastOutcome;
  exitReason: SolanaBroadcastExitReason;
  rebroadcastAttempts?: number;
  timeToLandMs?: number;
  connection?: Connection;
}) => {
  if (!SOLANA_BROADCAST_REPORT_ENABLED) return;

  try {
    const { signature, connection, outcome } = params;
    const actualUnitsConsumed = outcome === "landed" && connection
      ? await fetchActualUnitsConsumed(connection, signature)
      : void 0;

    const result: SolanaBroadcastResult = {
      outcome,
      exitReason: params.exitReason,
      rebroadcastAttempts: params.rebroadcastAttempts,
      timeToLandMs: params.timeToLandMs,
      actualUnitsConsumed,
    };

    useSolanaBroadcastReportStore.getState().settle(signature, result);

    const item = useSolanaBroadcastReportStore.getState().queue.find((it) => it.signature === signature);
    if (item) {
      void processReport(item, 0);
    }
  } catch (error) {
    csl("solana broadcast report", "red-500", "settle failed: %o", error);
  }
};

/**
 * A broadcast can outlive the page: the user often leaves right after the hash is returned.
 * On the next load, re-check every signature that never reached a verdict and report it then.
 */
const recoverPendingItem = async (connection: Connection, item: SolanaBroadcastReportItem) => {
  const { value } = await connection.getSignatureStatuses([item.signature]);
  const status = value?.[0];

  if (status) {
    await settleSolanaBroadcastReport({
      signature: item.signature,
      outcome: status.err ? "failed" : "landed",
      exitReason: "recovered_on_startup",
      connection,
    });
    return;
  }

  const transaction = await connection.getTransaction(item.signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  if (transaction) {
    await settleSolanaBroadcastReport({
      signature: item.signature,
      outcome: transaction.meta?.err ? "failed" : "landed",
      exitReason: "recovered_on_startup",
      connection,
    });
    return;
  }

  if (Date.now() - item.startedAt > SOLANA_BROADCAST_REPORT_MAX_AGE_MS) {
    await settleSolanaBroadcastReport({
      signature: item.signature,
      outcome: "dropped",
      exitReason: "recovered_on_startup",
    });
  }
};

export const processAllPendingSolanaBroadcastReports = () => {
  if (!SOLANA_BROADCAST_REPORT_ENABLED) return;

  const { queue } = useSolanaBroadcastReportStore.getState();
  if (!queue.length) return;

  const settledItems = queue.filter((item) => !!item.result);
  settledItems.forEach((item) => {
    const meta = taskMetaMap.get(item.id);
    if (meta?.inFlight || meta?.timer) {
      return;
    }
    void processReport(item, 0);
  });

  const pendingItems = queue.filter((item) => !item.result);
  if (!pendingItems.length) return;

  try {
    const connection = createSolanaFallbackConnection(getChainRpcUrl("Solana").rpcUrls);
    pendingItems.forEach((item) => {
      void recoverPendingItem(connection, item).catch((error) => {
        csl("solana broadcast report", "yellow-400", "recover failed, signature: %s, error: %o", item.signature, error);
      });
    });
  } catch (error) {
    csl("solana broadcast report", "red-500", "recover pending reports failed: %o", error);
  }
};
