import { PROXY_RPC_DOMAIN } from "@/config/api";
import type { TokenChain } from "@/config/chains";
import { generateRpcSignature } from "@/libs/signature";
import { ethers } from "ethers";

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

// RPC_CHAINS="tron,solana,aptos,aptos,sui,ethereum,arbitrum,bsc,avalanche,base,polygon,gnosis,optimism,berachain,xlayer,plasma,mantle,megaeth,ink,stable,celo,sei,fraxtal,katana"
const ChainNameMap: Record<string, string> = {
  "eth": "ethereum",
  "arb": "arbitrum",
  "bsc": "bsc",
  "avax": "avalanche",
  "base": "base",
  "pol": "polygon",
  "gnosis": "gnosis",
  "op": "optimism",
  "bera": "berachain",
  "xlayer": "xlayer",
  "plasma": "plasma",
  "mantle": "mantle",
  "megaeth": "megaeth",
  "ink": "ink",
  "stable": "stable",
  "celo": "celo",
  "sei": "sei",
  "frax": "fraxtal",
  "katana": "katana",
};

export function evmRpcFallbackProvider(chain: TokenChain) {
  const { rpcUrls, chainId } = chain;

  if (providerCache.has(chainId!)) {
    return providerCache.get(chainId!)!;
  }

  const sortedUrls: string[] = [...rpcUrls].sort(
    (a: string, b: string) =>
      (b.includes(PROXY_RPC_DOMAIN) ? 1 : 0) - (a.includes(PROXY_RPC_DOMAIN) ? 1 : 0)
  );

  const rpcChainSlug = ChainNameMap[chain.blockchain];

  const providers = sortedUrls.map(
    (rpc: string) => {
      if (rpc.includes(PROXY_RPC_DOMAIN)) {
        const req = new ethers.FetchRequest(rpc);
        req.preflightFunc = async (r) => {
          const { headers } = generateRpcSignature(rpcChainSlug);
          r.setHeader("x-hmac-signature", headers["x-hmac-signature"]);
          r.setHeader("x-timestamp", headers["x-timestamp"]);
          return r;
        };
        return new ethers.JsonRpcProvider(req, chainId, { staticNetwork: true });
      }
      return new ethers.JsonRpcProvider(rpc, chainId, { staticNetwork: true });
    }
  );

  const provider =
    providers.length === 1
      ? providers[0]
      : new SequentialFallbackProvider(providers, chainId!);

  providerCache.set(chainId!, provider);
  return provider;
}
