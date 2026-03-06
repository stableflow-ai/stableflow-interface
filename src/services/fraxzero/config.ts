import { LAYERZZERO_CHAINS, type LayerZeroChainConfig } from "../utils";

export interface FraxZeroConfig extends LayerZeroChainConfig {
  remoteHop?: string;
  lockbox?: string;
  programId?: string;
  mint?: string;
  escrow?: string;
  confirmations: number;
}

// DVN count: frax-finance uses 3 DVNs (fixed value)
export const FRAXZERO_REQUIRED_DVN_COUNT = 3;

// FraxZero RemoteHop config, see https://docs.frax.com/frxusd/fraxzero-supported-networks
// Chain names match chainName in frxusdChains, excluding Fraxtal
// confirmation counts: visit https://layerzeroscan.com/application/frax-finance, filter by the desired source chain, and check the "confirmations" value at the bottom of the page.
export const FRAXZERO_CONFIG: Record<string, FraxZeroConfig> = {
  Ethereum: {
    ...LAYERZZERO_CHAINS["Ethereum"],
    remoteHop: "0x3ad4dC2319394bB4BE99A0e4aE2AbF7bCEbD648E",
    lockbox: "0x566a6442a5a6e9895b9dca97cc7879d632c6e4b0",
    confirmations: 15,
  },
  Arbitrum: {
    ...LAYERZZERO_CHAINS["Arbitrum"],
    remoteHop: "0x29F5DBD0FE72d8f11271FCBE79Cb87E18a83C70A",
    confirmations: 20,
  },
  Avalanche: {
    ...LAYERZZERO_CHAINS["Avalanche"],
    remoteHop: "0x7a07D606c87b7251c2953A30Fa445d8c5F856C7A",
    confirmations: 12,
  },
  Berachain: {
    ...LAYERZZERO_CHAINS["Berachain"],
    remoteHop: "0xc71BF5Ee4740405030eF521F18A96eA14fec802D",
    confirmations: 20,
  },
  "BNB Chain": {
    ...LAYERZZERO_CHAINS["BNB Chain"],
    remoteHop: "0x452420df4AC1e3db5429b5FD629f3047482C543C",
    confirmations: 20,
  },
  Optimism: {
    ...LAYERZZERO_CHAINS["Optimism"],
    remoteHop: "0x31D982ebd82Ad900358984bd049207A4c2468640",
    confirmations: 20,
  },
  Polygon: {
    ...LAYERZZERO_CHAINS["Polygon"],
    remoteHop: "0xf74D38A26948E9DDa53eD85cF03C6b1188FbB30C",
    confirmations: 512,
  },
  "X Layer": {
    ...LAYERZZERO_CHAINS["X Layer"],
    remoteHop: "0x79152c303AD5aE429eDefa4553CB1Ad2c6EE1396",
    confirmations: 225000,
  },
  Solana: {
    ...LAYERZZERO_CHAINS["Solana"],
    programId: "E1ht9dUh1ZkgWWRRPCuN3kExEoF2FXiyADXeN3XyMHaQ",
    escrow: "84AFSH3TSzyjbEFJX9z8sjpV7npTWq7f8ZR5zkLG22hX",
    confirmations: 32,
  },
  Fraxtal: {
    ...LAYERZZERO_CHAINS["Fraxtal"],
    lockbox: "0x96A394058E2b84A89bac9667B19661Ed003cF5D4",
    confirmations: 5,
  },
};
