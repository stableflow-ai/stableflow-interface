import chains from "@/config/chains";

export const usdt = {
  symbol: "USDT",
  decimals: 6,
  icon: "/usdt.png"
};

export const usdtChains = {
  eth: {
    assetId: "nep141:eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near",
    contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    ...chains.eth
  },
  arb: {
    assetId: "nep141:arb-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9.omft.near",
    contractAddress: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    ...chains.arb
  },
  pol: {
    assetId: "nep245:v2_1.omni.hot.tg:137_3hpYoaLtt8MP1Z2GH1U473DMRKgr",
    contractAddress: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    ...chains.pol
  },
  bsc: {
    assetId: "nep245:v2_1.omni.hot.tg:56_2CMMyVTGZkeyNZTSvS5sarzfir6g",
    contractAddress: "0x55d398326f99059ff775485246999027b3197955",
    ...chains.bsc,
    decimals: 18
  },
  op: {
    assetId: "nep245:v2_1.omni.hot.tg:10_359RPSJVdTxwTJT9TyGssr2rFoWo",
    contractAddress: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
    ...chains.op
  },
  avax: {
    assetId: "nep245:v2_1.omni.hot.tg:43114_372BeH7ENZieCaabwkbWkBiTTgXp",
    contractAddress: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
    ...chains.avax
  },
  near: {
    assetId: "nep141:usdt.tether-token.near",
    contractAddress: "usdt.tether-token.near",
    ...chains.near
  },
  sol: {
    assetId: "nep141:sol-c800a4bd850783ccb82c2b2c7e84175443606352.omft.near",
    contractAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    ...chains.sol
  },
  tron: {
    assetId: "nep141:tron-d28a265909efecdcee7c5028585214ea0b96f015.omft.near",
    contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    ...chains.tron
  }
};

export const usdtSol = {
  ...usdt,
  ...usdtChains.sol
};

export const usdtNear = {
  ...usdt,
  ...usdtChains.near
};

export const usdtEvm = {
  ...usdt,
  chains: Object.values(usdtChains).filter((chain) => chain.chainType === "evm")
};

export const usdtTron = {
  ...usdt,
  ...usdtChains.tron
};
