import { ethers } from "ethers";

const PROXY_RPC_DOMAIN = "rpcs.stableflow.ai";
const providerCache = new Map<number, ethers.AbstractProvider>();

class SequentialFallbackProvider extends ethers.AbstractProvider {
  private providers: ethers.JsonRpcProvider[];

  constructor(providers: ethers.JsonRpcProvider[], chainId: number) {
    super(chainId);
    this.providers = providers;
  }

  async _detectNetwork(): Promise<ethers.Network> {
    return this.providers[0]._detectNetwork();
  }

  async _perform(req: ethers.PerformActionRequest): Promise<any> {
    let lastError: unknown;
    for (const provider of this.providers) {
      try {
        return await provider._perform(req);
      } catch (err) {
        if (ethers.isError(err, "CALL_EXCEPTION")) throw err;
        lastError = err;
      }
    }
    throw lastError;
  }
}

export function evmRpcFallbackProvider(chain: any) {
  const { rpcUrls, chainId } = chain;

  if (providerCache.has(chainId)) return providerCache.get(chainId)!;

  const sortedUrls: string[] = [...rpcUrls].sort(
    (a: string, b: string) =>
      (b.includes(PROXY_RPC_DOMAIN) ? 1 : 0) - (a.includes(PROXY_RPC_DOMAIN) ? 1 : 0)
  );

  const providers = sortedUrls.map(
    (rpc: string) => new ethers.JsonRpcProvider(rpc, chainId, { staticNetwork: true })
  );

  const provider =
    providers.length === 1
      ? providers[0]
      : new SequentialFallbackProvider(providers, chainId);

  providerCache.set(chainId, provider);
  return provider;
}
