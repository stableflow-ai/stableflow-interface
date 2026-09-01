import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  type SimulatedTransactionResponse,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { csl } from "@/utils/log";
import {
  enqueueSolanaBroadcastReport,
  settleSolanaBroadcastReport,
  type SolanaBroadcastContext,
} from "@/stores/use-solana-broadcast-report";

const readEnvNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

export const PRIORITY_FEE_MIN_MICRO_LAMPORTS = readEnvNumber(
  import.meta.env.VITE_SOLANA_PRIORITY_FEE_MIN_MICRO_LAMPORTS,
  20_000
);
export const PRIORITY_FEE_MAX_MICRO_LAMPORTS = readEnvNumber(
  import.meta.env.VITE_SOLANA_PRIORITY_FEE_MAX_MICRO_LAMPORTS,
  1_000_000
);

const PRIORITY_FEE_CACHE_MS = 20_000;
const PRIORITY_FEE_PERCENTILE = 0.75;
/** getRecentPrioritizationFees accepts at most 128 locked writable accounts. */
const MAX_LOCKED_WRITABLE_ACCOUNTS = 128;
const COMPUTE_UNIT_BUFFER = 1.2;
/** Per-transaction ceiling, used only while simulating so the probe is never the limiting factor. */
const SIMULATION_UNIT_LIMIT = 1_400_000;
const LOOKUP_TABLE_CACHE_MS = 60_000;
const REBROADCAST_INTERVAL_MS = 2_000;
const REBROADCAST_MAX_DURATION_MS = 60_000;
const PLACEHOLDER_BLOCKHASH = PublicKey.default.toBase58();
const ASSOCIATED_TOKEN_ACCOUNT_SIZE = 165;
/** Rent-exempt minimum for 165 bytes at the current rate, used when the RPC call fails. */
const ASSOCIATED_TOKEN_ACCOUNT_RENT_FALLBACK = 2_039_280;

export type PriorityFeeSource = "recent_fees_p75" | "min_floor" | "max_clamped";

export interface ComputeBudgetResult {
  ixs: TransactionInstruction[];
  unitLimit: number;
  microLamports: number;
  priorityFeeLamports: number;
  feeSource: PriorityFeeSource;
  unitsConsumed?: number;
}

interface PriorityFeeCacheEntry {
  microLamports: number;
  source: PriorityFeeSource;
  expiredAt: number;
}

const priorityFeeCache = new Map<string, PriorityFeeCacheEntry>();
const lookupTableCache = new Map<string, { account: AddressLookupTableAccount; expiredAt: number; }>();

export const collectWritableAccounts = (instructions: TransactionInstruction[]) => {
  const accounts = new Map<string, PublicKey>();
  instructions.forEach((instruction) => {
    instruction.keys.forEach((key) => {
      if (!key.isWritable) return;
      accounts.set(key.pubkey.toBase58(), key.pubkey);
    });
  });
  return Array.from(accounts.values());
};

/**
 * Fetch address lookup table accounts with a short-lived cache.
 * Lookup tables are needed to compile the v0 message used for the compute unit simulation.
 */
export const fetchLookupTableAccounts = async (params: {
  connection: Connection;
  addresses: (PublicKey | string)[];
}) => {
  const { connection, addresses } = params;
  const accounts: AddressLookupTableAccount[] = [];

  for (const address of addresses) {
    const key = typeof address === "string" ? address : address.toBase58();
    const cached = lookupTableCache.get(key);
    if (cached && cached.expiredAt > Date.now()) {
      accounts.push(cached.account);
      continue;
    }
    try {
      const { value } = await connection.getAddressLookupTable(new PublicKey(key));
      if (!value) continue;
      lookupTableCache.set(key, { account: value, expiredAt: Date.now() + LOOKUP_TABLE_CACHE_MS });
      accounts.push(value);
    } catch (error) {
      csl("solana-tx lookupTable", "yellow-400", "getAddressLookupTable failed: %o", error);
    }
  }

  return accounts;
};

/**
 * Dynamic priority fee: P75 of the recent non-zero prioritization fees for the writable accounts
 * this transaction locks, clamped between MIN and MAX. Falls back to MIN whenever the RPC does not
 * support the method or answers with nothing usable — taking a fee must never block a transaction.
 */
export const getPriorityFeeMicroLamports = async (params: {
  connection: Connection;
  writableAccounts?: PublicKey[];
}): Promise<{ microLamports: number; source: PriorityFeeSource; }> => {
  const { connection, writableAccounts = [] } = params;

  const lockedWritableAccounts = writableAccounts.slice(0, MAX_LOCKED_WRITABLE_ACCOUNTS);
  const cacheKey = lockedWritableAccounts.map((account) => account.toBase58()).sort().join(",");
  const cached = priorityFeeCache.get(cacheKey);
  if (cached && cached.expiredAt > Date.now()) {
    return { microLamports: cached.microLamports, source: cached.source };
  }

  const clampAndCache = (microLamports: number, source: PriorityFeeSource) => {
    let result = microLamports;
    let resultSource = source;
    if (result > PRIORITY_FEE_MAX_MICRO_LAMPORTS) {
      result = PRIORITY_FEE_MAX_MICRO_LAMPORTS;
      resultSource = "max_clamped";
    }
    if (result < PRIORITY_FEE_MIN_MICRO_LAMPORTS) {
      result = PRIORITY_FEE_MIN_MICRO_LAMPORTS;
      resultSource = "min_floor";
    }
    priorityFeeCache.set(cacheKey, {
      microLamports: result,
      source: resultSource,
      expiredAt: Date.now() + PRIORITY_FEE_CACHE_MS,
    });
    return { microLamports: result, source: resultSource };
  };

  try {
    const recentFees = await connection.getRecentPrioritizationFees({
      lockedWritableAccounts,
    });
    const fees = (recentFees || [])
      .map((item) => Number(item.prioritizationFee))
      .filter((fee) => Number.isFinite(fee) && fee > 0)
      .sort((a, b) => a - b);

    if (!fees.length) {
      return clampAndCache(PRIORITY_FEE_MIN_MICRO_LAMPORTS, "min_floor");
    }

    const index = Math.min(fees.length - 1, Math.floor(fees.length * PRIORITY_FEE_PERCENTILE));
    return clampAndCache(Math.ceil(fees[index]), "recent_fees_p75");
  } catch (error) {
    csl("solana-tx priorityFee", "yellow-400", "getRecentPrioritizationFees failed, fallback to min: %o", error);
    return clampAndCache(PRIORITY_FEE_MIN_MICRO_LAMPORTS, "min_floor");
  }
};

/**
 * Right-size the compute unit limit from a simulation.
 * An inflated limit lowers the fee-per-CU used by the leader to order transactions, so this both
 * saves money and improves the odds of being picked up.
 */
export const resolveComputeUnitLimit = async (params: {
  connection: Connection;
  payer: PublicKey;
  instructions: TransactionInstruction[];
  lookupTables?: AddressLookupTableAccount[];
  fallbackUnits: number;
}): Promise<{ unitLimit: number; unitsConsumed?: number; }> => {
  const { connection, payer, instructions, lookupTables, fallbackUnits } = params;

  try {
    const message = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: PLACEHOLDER_BLOCKHASH,
      instructions: [
        ComputeBudgetProgram.setComputeUnitLimit({ units: SIMULATION_UNIT_LIMIT }),
        ...instructions,
      ],
    }).compileToV0Message(lookupTables);

    const simulation = await connection.simulateTransaction(new VersionedTransaction(message), {
      sigVerify: false,
      replaceRecentBlockhash: true,
    });

    const unitsConsumed = simulation.value.unitsConsumed;
    if (simulation.value.err || !unitsConsumed) {
      csl("solana-tx computeUnit", "yellow-400", "simulation unusable, fallback units: %o, err: %o", fallbackUnits, simulation.value.err);
      return { unitLimit: fallbackUnits };
    }

    const unitLimit = Math.min(SIMULATION_UNIT_LIMIT, Math.ceil(unitsConsumed * COMPUTE_UNIT_BUFFER));
    return { unitLimit, unitsConsumed };
  } catch (error) {
    csl("solana-tx computeUnit", "yellow-400", "simulateTransaction failed, fallback units: %o, error: %o", fallbackUnits, error);
    return { unitLimit: fallbackUnits };
  }
};

/**
 * Single entry point returning the [setComputeUnitLimit, setComputeUnitPrice] pair to prepend,
 * plus the lamports the priority fee will cost so gas estimation stays honest.
 */
export const buildComputeBudgetIxs = async (params: {
  connection: Connection;
  payer: PublicKey;
  instructions: TransactionInstruction[];
  lookupTables?: AddressLookupTableAccount[];
  fallbackUnits: number;
  writableAccounts?: PublicKey[];
}): Promise<ComputeBudgetResult> => {
  const { connection, payer, instructions, lookupTables, fallbackUnits, writableAccounts } = params;

  const [{ unitLimit, unitsConsumed }, { microLamports, source }] = await Promise.all([
    resolveComputeUnitLimit({ connection, payer, instructions, lookupTables, fallbackUnits }),
    getPriorityFeeMicroLamports({
      connection,
      writableAccounts: writableAccounts ?? collectWritableAccounts(instructions),
    }),
  ]);

  const priorityFeeLamports = Math.ceil((unitLimit * microLamports) / 1_000_000);

  csl(
    "solana-tx computeBudget",
    "purple-400",
    "unitLimit: %o, microLamports: %o (%s), priorityFeeLamports: %o",
    unitLimit,
    microLamports,
    source,
    priorityFeeLamports
  );

  return {
    ixs: [
      ComputeBudgetProgram.setComputeUnitLimit({ units: unitLimit }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports }),
    ],
    unitLimit,
    microLamports,
    priorityFeeLamports,
    feeSource: source,
    unitsConsumed,
  };
};

export interface NewAccountRentResult {
  /**
   * False when the simulation errored or the RPC returned no account snapshot.
   * `rentLamports` is meaningless then and the caller should use its own estimate.
   */
  usable: boolean;
  rentLamports: number;
  simulationError?: SimulatedTransactionResponse["err"];
}

/**
 * Rent, not fees: a transaction that creates accounts has to fund them to the rent-exempt
 * minimum out of the payer's pocket. A CCTP burn alone costs around 0.005 SOL this way, which
 * dwarfs the 5000 lamport signature fee.
 *
 * Any account that does not exist yet but does exist after the simulation was created by this
 * transaction, and its post-simulation lamports are exactly what the payer had to put up.
 * Looking only at created accounts (rather than the payer's total balance delta) keeps SOL that
 * the transaction legitimately spends elsewhere — the LayerZero native fee, for instance — out
 * of the number, since that is already quoted separately.
 *
 * Known gap: accounts loaded through an address lookup table are not in staticAccountKeys, so
 * they are invisible here. The OFT and FraxZero routes create no accounts on the source chain,
 * so this does not matter today.
 */
export const resolveNewAccountRentLamports = async (params: {
  connection: Connection;
  versionedTx: VersionedTransaction;
}): Promise<NewAccountRentResult> => {
  const { connection, versionedTx } = params;

  try {
    const accountKeys = versionedTx.message.staticAccountKeys;
    const addresses = accountKeys.map((key) => key.toBase58());

    const [preAccounts, simulationResponse] = await Promise.all([
      connection.getMultipleAccountsInfo(accountKeys),
      connection.simulateTransaction(versionedTx, {
        sigVerify: false,
        replaceRecentBlockhash: true,
        accounts: { encoding: "base64", addresses },
      }),
    ]);

    const simulation = simulationResponse.value;
    const postAccounts = simulation.accounts;
    if (simulation.err || !postAccounts?.length) {
      return { usable: false, rentLamports: 0, simulationError: simulation.err };
    }

    let rentLamports = 0;
    addresses.forEach((address, index) => {
      if (preAccounts[index]) return;
      const post = postAccounts[index];
      if (!post?.lamports) return;
      rentLamports += post.lamports;
      csl("solana-tx rent", "purple-400", "account created by tx: %s, rent: %o", address, post.lamports);
    });

    return { usable: true, rentLamports };
  } catch (error) {
    csl("solana-tx rent", "yellow-400", "resolveNewAccountRentLamports failed: %o", error);
    return { usable: false, rentLamports: 0 };
  }
};

/** Rent-exempt minimum for a token account, cached because it only moves with a cluster upgrade. */
let associatedTokenAccountRentLamports: number | undefined;

export const getAssociatedTokenAccountRent = async (connection: Connection) => {
  if (associatedTokenAccountRentLamports !== undefined) {
    return associatedTokenAccountRentLamports;
  }
  try {
    associatedTokenAccountRentLamports = await connection.getMinimumBalanceForRentExemption(
      ASSOCIATED_TOKEN_ACCOUNT_SIZE
    );
  } catch (error) {
    csl("solana-tx rent", "yellow-400", "getMinimumBalanceForRentExemption failed: %o", error);
    associatedTokenAccountRentLamports = ASSOCIATED_TOKEN_ACCOUNT_RENT_FALLBACK;
  }
  return associatedTokenAccountRentLamports;
};

export const getRpcEndpointHost = (connection: Connection) => {
  try {
    return new URL(connection.rpcEndpoint).host;
  } catch {
    return "";
  }
};

/**
 * Keep re-sending the very same raw transaction in the background until it lands or its blockhash
 * expires. Rebroadcasting is safe: the signature is fixed, so the network deduplicates it.
 * Never awaited by the caller and never throws — the hash is returned and reported immediately.
 */
export const startRebroadcast = (params: {
  connection: Connection;
  rawTransaction: Uint8Array | Buffer;
  signature: string;
  lastValidBlockHeight?: number;
  intervalMs?: number;
  maxDurationMs?: number;
  report?: SolanaBroadcastContext;
}): void => {
  const {
    connection,
    rawTransaction,
    signature,
    lastValidBlockHeight,
    intervalMs = REBROADCAST_INTERVAL_MS,
    maxDurationMs = REBROADCAST_MAX_DURATION_MS,
    report,
  } = params;

  const startedAt = Date.now();

  if (report) {
    enqueueSolanaBroadcastReport({
      signature,
      startedAt,
      context: {
        ...report,
        rpcEndpoint: report.rpcEndpoint || getRpcEndpointHost(connection),
      },
    });
  }

  const settle = (result: {
    outcome: "landed" | "dropped" | "failed";
    exitReason: "confirmed" | "block_height_exceeded" | "max_duration";
    attempts: number;
  }) => {
    csl(
      "solana-tx rebroadcast",
      result.outcome === "landed" ? "green-400" : "yellow-400",
      "signature: %s, outcome: %s, exitReason: %s, attempts: %o",
      signature,
      result.outcome,
      result.exitReason,
      result.attempts
    );
    if (!report) return;
    void settleSolanaBroadcastReport({
      signature,
      outcome: result.outcome,
      exitReason: result.exitReason,
      rebroadcastAttempts: result.attempts,
      timeToLandMs: result.outcome === "landed" ? Date.now() - startedAt : undefined,
      connection,
    });
  };

  /** Returns the verdict when the network already has one, otherwise undefined. */
  const probeOutcome = async () => {
    const { value } = await connection.getSignatureStatuses([signature]);
    const status = value?.[0];
    if (status?.err) return "failed" as const;
    if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") {
      return "landed" as const;
    }
    return void 0;
  };

  const loop = async () => {
    let attempts = 0;

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));

      if (Date.now() - startedAt > maxDurationMs) {
        // One last probe, so a transaction that landed since the previous round is not called dropped.
        let outcome: "landed" | "failed" | undefined;
        try {
          outcome = await probeOutcome();
        } catch {
          outcome = void 0;
        }
        settle({
          outcome: outcome ?? "dropped",
          exitReason: outcome ? "confirmed" : "max_duration",
          attempts,
        });
        return;
      }

      try {
        const outcome = await probeOutcome();
        if (outcome) {
          settle({ outcome, exitReason: "confirmed", attempts });
          return;
        }

        if (lastValidBlockHeight) {
          const blockHeight = await connection.getBlockHeight("confirmed");
          if (blockHeight > lastValidBlockHeight) {
            settle({ outcome: "dropped", exitReason: "block_height_exceeded", attempts });
            return;
          }
        }

        // skipPreflight is mandatory here: an already processed transaction fails preflight.
        await connection.sendRawTransaction(rawTransaction, { skipPreflight: true, maxRetries: 0 });
        attempts += 1;
      } catch (error) {
        // A flaky RPC round must not end the rebroadcast window; the duration cap still applies.
        csl("solana-tx rebroadcast", "yellow-400", "round failed, signature: %s, error: %o", signature, error);
      }
    }
  };

  void loop().catch((error) => {
    csl("solana-tx rebroadcast", "red-500", "rebroadcast loop aborted, signature: %s, error: %o", signature, error);
  });
};
