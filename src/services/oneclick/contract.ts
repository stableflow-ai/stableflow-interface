export const ONECLICK_PROXY: Record<string, string> = {
  ["Arbitrum"]: "0xc8dB1175132C64e311D01258dD05D4e2e75fD7b8",
  ["Polygon"]: "0xc8dB1175132C64e311D01258dD05D4e2e75fD7b8",
  ["BNB Chain"]: "0xf5f1ec09b3ec88F6Cf23ADEEDd792E4642c5B7f1",
  ["Optimism"]: "0xc8dB1175132C64e311D01258dD05D4e2e75fD7b8",
  ["Avalanche"]: "0xc8dB1175132C64e311D01258dD05D4e2e75fD7b8",
  ["Ethereum"]: "0xc8dB1175132C64e311D01258dD05D4e2e75fD7b8",
  ["Bera"]: "0x1766A6B8453c7dbcA8c70d17980B6EA87ACA4F60",
  ["Tron"]: "TMqM35eVd3D9d7JbShRrMzMPyWLFweKYvW",
  ["Solana"]: "HWk6MsFEGzXxpe9B4mfEHpvVoCwNeVVMFxb5Mi7qNTM",
  ["Near"]: "stbflow.near",
  ["Aptos"]: "0x67ac166725094a8180862f548e2e4482e9e362e226263caee569e02a36073ca0",
};

export const ONECLICK_PROXY_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "proxyTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
];
