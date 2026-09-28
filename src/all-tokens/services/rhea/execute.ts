import type { RheaApproveItem, RheaSwapResponse, RheaSwapTx } from "./types";
import { rheaOrderSubmit } from "./swap";

export type ExecuteRheaTxResult = {
  txHash?: string;
  orderId?: string;
  cancelled?: boolean;
};

export type RheaTxExecutor = (params: {
  chainType: string;
  fromChain: string;
  tx: RheaSwapTx;
  approve?: RheaSwapTx | RheaSwapTx[] | null;
}) => Promise<{ hash: string }>;

export type RheaSigner = (signingRequest: unknown) => Promise<Record<string, unknown>>;

/** API returns `{ spender, tx }` or a bare RheaSwapTx */
const unwrapApproveTx = (item: RheaApproveItem): RheaSwapTx => {
  if (item && typeof item === "object" && "tx" in item) {
    const tx = (item as { tx?: RheaSwapTx }).tx;
    if (tx && typeof tx === "object") return tx;
  }
  return item as RheaSwapTx;
};

const runApproves = async (
  swap: RheaSwapResponse,
  deps: { executeTx: RheaTxExecutor }
) => {
  if (!swap.approve) return;
  const fromChain = String(swap.fromChain || "");
  const chainType = String(swap.chainType || "evm");
  const approves = Array.isArray(swap.approve) ? swap.approve : [swap.approve];
  for (const approveItem of approves) {
    await deps.executeTx({
      chainType,
      fromChain,
      tx: unwrapApproveTx(approveItem),
      approve: null,
    });
  }
};

/**
 * Execute a Rhea /swap response via injected chain wallet helpers.
 * - transaction: optional approve(s) then main tx
 * - signature: optional approve(s), sign signingRequest, then POST /order-submit
 */
export async function executeRheaSwapResponse(
  swap: RheaSwapResponse,
  deps: {
    executeTx: RheaTxExecutor;
    signRequest?: RheaSigner;
  }
): Promise<ExecuteRheaTxResult> {
  const executionType = (swap.executionType || "transaction").toLowerCase();

  if (executionType === "signature") {
    if (!swap.signingRequest) {
      throw new Error("Missing signingRequest for signature execution");
    }
    if (!deps.signRequest) {
      throw new Error("No signer available for signature execution");
    }
    // CoW etc. may require Vault Relayer approval before the signed order can settle
    await runApproves(swap, deps);
    const signed = await deps.signRequest(swap.signingRequest);
    const submitted = await rheaOrderSubmit(signed);
    const orderId =
      (submitted.orderId as string | undefined) ||
      (submitted.id as string | undefined) ||
      swap.orderId;
    return { orderId };
  }

  // Prefer approve presence (API docs); needsApprove is auxiliary
  await runApproves(swap, deps);

  if (swap.tx) {
    const fromChain = String(swap.fromChain || "");
    const chainType = String(swap.chainType || "evm");
    const { hash } = await deps.executeTx({
      chainType,
      fromChain,
      tx: swap.tx,
      approve: null,
    });
    return {
      txHash: hash,
      orderId: swap.orderId || swap.deposit?.orderId,
    };
  }

  // Deposit-address style: caller transfers to deposit.depositAddress separately
  if (swap.deposit?.depositAddress) {
    return {
      orderId: swap.deposit.orderId || swap.orderId,
    };
  }

  throw new Error("Swap response has no executable transaction");
}
