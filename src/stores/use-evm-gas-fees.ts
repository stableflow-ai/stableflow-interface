import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface EvmChainGasFee {
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  lastUpdated: number;
}

interface EvmGasFeesState {
  byChainId: Record<string, EvmChainGasFee>;
  loading: boolean;
  set: (params: Partial<Omit<EvmGasFeesState, "set">>) => void;
}

export const useEvmGasFeesStore = create(
  persist<EvmGasFeesState>(
    (set) => ({
      byChainId: {},
      loading: false,
      set: (params) =>
        set((state) => ({
          ...state,
          ...params,
          byChainId:
            params.byChainId != null
              ? { ...state.byChainId, ...params.byChainId }
              : state.byChainId,
        })),
    }),
    {
      name: "_evm_gas_fees",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({ byChainId: state.byChainId }) as unknown as EvmGasFeesState,
    }
  )
);

export function gasFeeEntryToWei(entry: EvmChainGasFee | undefined): bigint | null {
  if (!entry?.gasPrice) return null;
  try {
    return BigInt(entry.gasPrice);
  } catch {
    return null;
  }
}

export default useEvmGasFeesStore;
