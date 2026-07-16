import chains, { type TokenChain } from "@/config/chains";
import { Service } from "@/services/constants";
import { getStableflowTokenLogo } from "@/utils/format/logo";

export const pyusd = {
  symbol: "PYUSD",
  decimals: 6,
  icon: getStableflowTokenLogo("pyusd"),
};

export const pyusd0 = {
  symbol: "PYUSD0",
  decimals: 6,
  icon: getStableflowTokenLogo("pyusd"),
};

export const pyusdChains: Record<string, TokenChain> = {
  eth: {
    ...pyusd,
    assetId: "",
    contractAddress: "0x6c3ea9036406852006290770bedfcaba0e23a0e8",
    ...chains.eth,
    services: [Service.Pyusd, Service.LayerzeroVt],
  },
  arb: {
    ...pyusd,
    assetId: "",
    contractAddress: "0x46850ad61c2b7d64d08c9c754f45254596696984",
    ...chains.arb,
    services: [Service.Pyusd, Service.LayerzeroVt],
  },
  sol: {
    ...pyusd,
    assetId: "",
    contractAddress: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    ...chains.sol,
    services: [Service.Pyusd, Service.LayerzeroVt],
  },
  sei: {
    ...pyusd0,
    assetId: "",
    contractAddress: "0x142cdc44890978b506e745bb3bd11607b7f7faef",
    ...chains.sei,
    services: [Service.Pyusd, Service.LayerzeroVt],
  },
  avax: {
    ...pyusd0,
    assetId: "",
    contractAddress: "0x142cdc44890978B506e745bB3Bd11607B7f7faEf",
    ...chains.avax,
    services: [Service.Pyusd, Service.LayerzeroVt],
  },
  op: {
    ...pyusd0,
    assetId: "",
    contractAddress: "0xA0C9b923f4551f1EC1A49665943160B18704Ce06",
    ...chains.op,
    services: [Service.Pyusd, Service.LayerzeroVt],
  },
  pol: {
    ...pyusd0,
    assetId: "",
    contractAddress: "0x99aF3EeA856556646C98c8B9b2548Fe815240750",
    ...chains.pol,
    services: [Service.Pyusd, Service.LayerzeroVt],
  },
  frax: {
    ...pyusd0,
    assetId: "",
    contractAddress: "0x99aF3EeA856556646C98c8B9b2548Fe815240750",
    ...chains.frax,
    services: [Service.Pyusd, Service.LayerzeroVt],
  },
  tron: {
    ...pyusd0,
    assetId: "",
    contractAddress: "TKkvjWuAYrNQkbo3onBDhCU77WtNPByD5a",
    ...chains.tron,
    services: [Service.Pyusd, Service.LayerzeroVt],
  },
  stable: {
    ...pyusd0,
    assetId: "",
    contractAddress: "0x99aF3EeA856556646C98c8B9b2548Fe815240750",
    ...chains.stable,
    services: [Service.Pyusd, Service.LayerzeroVt],
  },
  ink: {
    ...pyusd0,
    assetId: "",
    contractAddress: "0x142cdc44890978B506e745bB3Bd11607B7f7faEf",
    ...chains.ink,
    services: [Service.Pyusd, Service.LayerzeroVt],
  },
  flow: {
    ...pyusd0,
    assetId: "",
    contractAddress: "0x99aF3EeA856556646C98c8B9b2548Fe815240750",
    ...chains.flow,
    services: [Service.Pyusd, Service.LayerzeroVt],
  },
};

export const pyusdEvm = {
  ...pyusd,
  chains: Object.values(pyusdChains).filter((chain) => chain.chainType === "evm" && chain.symbol === pyusd.symbol),
};

export const pyusd0Evm = {
  ...pyusd0,
  chains: Object.values(pyusdChains).filter((chain) => chain.chainType === "evm" && chain.symbol === pyusd0.symbol),
};

export const pyusdSol = {
  ...pyusd,
  ...pyusdChains.sol,
  chains: Object.values(pyusdChains).filter((chain) => chain.chainType === "sol"),
};

export const pyusdTron = {
  ...pyusd0,
  ...pyusdChains.tron,
  chains: Object.values(pyusdChains).filter((chain) => chain.chainType === "tron"),
};
