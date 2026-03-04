// LayerZero chain configuration
// blockTime: Average block time in seconds, fetched from https://chainspect.app/
// chainKey: LayerZero chain identifier for querying default configurations
// confirmations: Default block confirmations for source chain, fetched from https://layerzeroscan.com/tools/defaults (Send Confirmations)
// For more accurate confirmation counts, visit https://layerzeroscan.com/application/usdt0, filter by the desired source chain, and check the "confirmations" value at the bottom of the page.
// DVN count: USDT0 uses 2 DVNs (fixed value)
export const USDT0_CONFIG: Record<string, any> = {
  Ethereum: {
    contractAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    oft: "0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee",
    oftLegacy: "0x1f748c76de468e9d11bd340fa9d5cbadf315dfb0",
    eid: 30101,
    chainKey: "ethereum",
    blockTime: 12, // Ethereum average block time ~12 seconds
    confirmations: 15, // Default confirmations from layerzeroscan.com
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
  },
  Arbitrum: {
    contractAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    oft: "0x14E4A1B13bf7F943c8ff7C51fb60FA964A298D92",
    oftLegacy: "0x77652d5aba086137b595875263fc200182919b92",
    oftMultiHopComposer: "0x759BA420bF1ded1765F18C2DC3Fc57A1964A2Ad1",
    eid: 30110,
    chainKey: "arbitrum",
    blockTime: 0.25, // Arbitrum average block time ~0.25 seconds
    confirmations: 20, // Default confirmations from layerzeroscan.com
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
  },
  Polygon: {
    contractAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    oft: "0x6BA10300f0DC58B7a1e4c0e41f5daBb7D7829e13",
    eid: 30109,
    chainKey: "polygon",
    blockTime: 2, // Polygon average block time ~2 seconds
    confirmations: 20, // Default confirmations from layerzeroscan.com 
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 600000,
  },
  Optimism: {
    contractAddress: "0x01bFF41798a0BcF287b996046Ca68b395DbC1071",
    oft: "0xF03b4d9AC1D5d1E7c4cEf54C2A313b9fe051A0aD",
    eid: 30111,
    chainKey: "optimism",
    blockTime: 2, // Optimism average block time ~2 seconds
    confirmations: 20, // Default confirmations from layerzeroscan.com
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 600000,
  },
  Berachain: {
    contractAddress: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736",
    oft: "0x3Dc96399109df5ceb2C226664A086140bD0379cB",
    oftTetherTokenOFTExtension: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736",
    eid: 30362,
    chainKey: "berachain",
    blockTime: 2, // Optimism average block time ~2 seconds
    confirmations: 20, // Default confirmations from layerzeroscan.com
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 600000,
  },
  Solana: {
    contractAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    oftLegacy: "Fuww9mfc8ntAwxPUzFia7VJFAdvLppyZwhPJoXySZXf7",
    eid: 30168,
    chainKey: "solana",
    blockTime: 0.4, // Solana average block time ~0.4 seconds
    confirmations: 32, // Default confirmations from layerzeroscan.com
    lzReceiveOptionGas: 200000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 500000,
  },
  Tron: {
    contractAddress: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    oftLegacy: "TFG4wBaDQ8sHWWP1ACeSGnoNR6RRzevLPt",
    eid: 30420,
    chainKey: "tron",
    blockTime: 3, // Tron average block time ~3 seconds
    confirmations: 5, // Default confirmations from layerzeroscan.com
    lzReceiveOptionGas: 300000,
    lzReceiveOptionGasLegacy: 300000,
    composeOptionGas: 500000,
  },
  "X Layer": {
    contractAddress: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736",
    oft: "0x94bcca6bdfd6a61817ab0e960bfede4984505554",
    eid: 30274,
    chainKey: "xlayer",
    blockTime: 0.5, // X Layer average block time ~2 seconds
    confirmations: 9000, // Default confirmations from layerzeroscan.com
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 600000,
  },
  "Plasma": {
    contractAddress: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb",
    oft: "0x02ca37966753bDdDf11216B73B16C1dE756A7CF9",
    eid: 30383,
    chainKey: "plasma",
    blockTime: 1, // Plasma average block time ~2 seconds
    confirmations: 1800, // Default confirmations from layerzeroscan.com
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 600000,
  },
  "Mantle": {
    contractAddress: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736",
    oft: "0xcb768e263FB1C62214E7cab4AA8d036D76dc59CC",
    eid: 30181,
    chainKey: "mantle",
    blockTime: 2, // Mantle average block time ~2 seconds
    confirmations: 2000, // Default confirmations from layerzeroscan.com
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 600000,
  },
  "MegaETH": {
    contractAddress: "0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb",
    oft: "0x9151434b16b9763660705744891fa906f660ecc5",
    eid: 30398,
    chainKey: "megaeth",
    blockTime: 1,
    confirmations: 5400,
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 600000,
  },
  "Ink": {
    contractAddress: "0x0200C29006150606B650577BBE7B6248F58470c1",
    oft: "0x1cB6De532588fCA4a21B7209DE7C456AF8434A65",
    eid: 30339,
    chainKey: "ink",
    blockTime: 1,
    confirmations: 450,
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 600000,
  },
  "Stable": {
    contractAddress: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736",
    oft: "0xedaba024be4d87974d5aB11C6Dd586963CcCB027",
    eid: 30396,
    chainKey: "stable",
    blockTime: 0.7,
    confirmations: 3600,
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 600000,
  },
  "Celo": {
    contractAddress: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
    oftLegacy: "0xf10E161027410128E63E75D0200Fb6d34b2db243",
    eid: 30125,
    chainKey: "celo",
    blockTime: 1,
    confirmations: 10,
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 600000,
  },
  "Sei": {
    contractAddress: "0x9151434b16b9763660705744891fA906F660EcC5",
    oft: "0x56Fe74A2e3b484b921c447357203431a3485CC60",
    eid: 30280,
    chainKey: "sei",
    blockTime: 2,
    confirmations: 2000,
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 600000,
  },
  "Flare": {
    contractAddress: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D",
    oft: "0x567287d2A9829215a37e3B88843d32f9221E7588",
    eid: 30295,
    chainKey: "flare",
    blockTime: 1.8,
    confirmations: 500,
    lzReceiveOptionGas: 80000,
    lzReceiveOptionGasLegacy: 200000,
    composeOptionGas: 600000,
  },
};

export const LZ_RECEIVE_VALUE: Record<string, any> = {
  Solana: 2039280,
};

// https://docs.layerzero.network/v2/developers/evm/tooling/layerzeroscan#transaction-statuses
// https://scan.layerzero-api.com/v1/swagger
export const LzScanStatus = {
  // The message has been successfully sent and received by the destination chain.
  Delivered: "DELIVERED",
  // The message is currently being transmitted between chains and has not yet reached its destination.
  InFlight: "INFLIGHT",
  // The message arrived at the destination, but reverted or ran out of gas during execution and needs to be retried.
  PayloadStored: "PAYLOAD_STORED",
  // The transaction encountered an error and did not complete.
  Failed: "FAILED",
  // A previous message nonce has a stored payload, halting the current transaction.
  Blocked: "BLOCKED",
  // The system is validating the finality of a transaction amidst potential high gas replacements or block reorgs.
  Confirming: "CONFIRMING",
  ApplicationBurned: "APPLICATION_BURNED",
  ApplicationSkipped: "APPLICATION_SKIPPED",
  UnresolvableCommand: "UNRESOLVABLE_COMMAND",
  MalformedCommand: "MALFORMED_COMMAND",
};

export type LzScanStatus = (typeof LzScanStatus)[keyof typeof LzScanStatus];

export const LzScanSourceStatus = {
  Waiting: "WAITING",
  ValidatingTx: "VALIDATING_TX",
  Succeeded: "SUCCEEDED",
  WaitingForHashDelivered: "WAITING_FOR_HASH_DELIVERED",
  UnresolvableCommand: "UNRESOLVABLE_COMMAND",
  MalformedCommand: "MALFORMED_COMMAND",
};
export type LzScanSourceStatus = (typeof LzScanSourceStatus)[keyof typeof LzScanSourceStatus];

export const LzScanDestinationStatus = {
  Waiting: "WAITING",
  ValidatingTx: "VALIDATING_TX",
  Succeeded: "SUCCEEDED",
  PayloadStored: "PAYLOAD_STORED",
};
export type LzScanDestinationStatus = (typeof LzScanDestinationStatus)[keyof typeof LzScanDestinationStatus];

export const LzScanLzComposeStatus = {
  Waiting: "WAITING",
  ValidatingTx: "VALIDATING_TX",
  Succeeded: "SUCCEEDED",
  NA: "N/A",
  Failed: "FAILED",
  SimulatedReverted: "SIMULATION_REVERTED",
  WaitingForComposeSentEvent: "WAITING_FOR_COMPOSE_SENT_EVENT",
};
export type LzScanLzComposeStatus = (typeof LzScanLzComposeStatus)[keyof typeof LzScanLzComposeStatus];

// USDT0 DVN count (fixed value)
export const USDT0_DVN_COUNT = 2;

export const USDT0_LEGACY_FEE = 0.0001; // 0.01%, 10000 usdt cost 1 usdt
export const USDT0_LEGACY_MESH_TRANSFTER_FEE = 0.0003; // 0.03% https://docs.usdt0.to/tutorial/how-to-transfer#usdt0
export const DATA_HEX_PROTOBUF_EXTRA = 3;
export const SIGNATURE_SIZE = 67;
