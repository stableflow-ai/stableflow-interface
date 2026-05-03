import { ethers } from "ethers";

export function evmRpcFallbackProvider(chain: any) {
  const { rpcUrls, chainId } = chain;

  const providers = rpcUrls.map((rpc: string) => {
    const isProxyRpc = rpc.includes("rpc-proxy.jimmygu.workers.dev");
    return {
      provider: new ethers.JsonRpcProvider(rpc, chainId, { staticNetwork: true }),
      priority: isProxyRpc ? 1 : 2,
      weight: 1,
      stallTimeout: 2000,
    };
  });
  const provider = new ethers.FallbackProvider(providers, chainId, { quorum: 1 });

  return provider;
}
