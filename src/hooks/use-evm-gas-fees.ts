import chains, { chainTypes, type TokenChain } from "@/config/chains";
import useEvmGasFeesStore, { type EvmChainGasFee } from "@/stores/use-evm-gas-fees";
import { csl } from "@/utils/log";
import { useRequest } from "ahooks";
import { ethers } from "ethers";

const POLL_MS = 30 * 60 * 1000;

function getEvmChains(): (TokenChain & { chainId: number })[] {
  return (Object.values(chains) as unknown as TokenChain[]).filter(
    (c): c is TokenChain & { chainId: number } =>
      c.chainType === chainTypes.evm.value && typeof c.chainId === "number"
  );
}

async function fetchFeeForChain(chain: TokenChain & { chainId: number }) {
  const providers = chain.rpcUrls.map(
    (rpc) => new ethers.JsonRpcProvider(rpc, chain.chainId)
  );
  const provider = new ethers.FallbackProvider(providers);
  const feeData = await provider.getFeeData();
  const maxFeePerGas = feeData.maxFeePerGas;
  const legacyGasPrice = feeData.gasPrice;
  const effective = maxFeePerGas ?? legacyGasPrice;
  if (effective == null) {
    throw new Error("no gas price from getFeeData");
  }
  return {
    chainId: chain.chainId,
    gasPrice: effective.toString(),
    maxFeePerGas: maxFeePerGas != null ? maxFeePerGas.toString() : undefined,
    maxPriorityFeePerGas:
      feeData.maxPriorityFeePerGas != null
        ? feeData.maxPriorityFeePerGas.toString()
        : undefined,
    lastUpdated: Date.now(),
  };
}

export function useEvmGasFees() {
  const set = useEvmGasFeesStore((s) => s.set);

  useRequest(
    async () => {
      const list = getEvmChains();
      set({ loading: true });
      const settled = await Promise.allSettled(list.map((c) => fetchFeeForChain(c)));
      const patch: Record<string, EvmChainGasFee> = {};
      for (let i = 0; i < settled.length; i++) {
        const r = settled[i]!;
        const chain = list[i]!;
        const chainIdStr = String(chain.chainId);
        if (r.status === "fulfilled") {
          const v = r.value;
          patch[chainIdStr] = {
            gasPrice: v.gasPrice,
            maxFeePerGas: v.maxFeePerGas,
            maxPriorityFeePerGas: v.maxPriorityFeePerGas,
            lastUpdated: v.lastUpdated,
          };
        } else {
          csl("evm-gas-fees", "yellow-600", "%s getFeeData failed: %o", chain.chainName, r.reason);
        }
      }
      set({
        byChainId: patch,
        loading: false,
      });
    },
    { pollingInterval: POLL_MS }
  );

  return {};
}
