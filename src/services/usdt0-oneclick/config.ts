import { IS_PRODUCTION } from "@/config/api";
import { allUsdtChains } from "@/config/tokens";

export const MIDDLE_CHAIN_REFOUND_ADDRESS = "0x654E7B96E1DE0b54E53D9ae8082fC2219E66dAC3";
export const MIDDLE_TOKEN_CHAIN = allUsdtChains["arb"];
export const MIDDLE_CHAIN_LAYERZERO_EXECUTOR = IS_PRODUCTION ? "0x53812Feae0fd2C43f8E6D8847A7f5d035F1d1f8f" : "0x78FdA46abBDE058c585eBA76De7Bde98bA64a8B5";
