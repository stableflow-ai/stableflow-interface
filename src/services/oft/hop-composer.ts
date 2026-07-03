import type { TokenChain } from "@/config/chains";
import { ethers } from "ethers";
import { OFT_ABI } from "../usdt0/contract";
import { csl } from "@/utils/log";
import { ExecTime } from "@/utils/exec-time";
import { evmRpcFallbackProvider } from "@/utils/evm-rpc-providers";
import type { OftChainConfig, OftHopQuoteParams } from "./types";

export const resolveUsdt0HubQuoteOftAddress = (
  hubConfig: OftChainConfig,
  destinationConfig?: OftChainConfig,
): string | undefined => {
  let hubOft = hubConfig.oft;
  const destinationLayerzeroAddress = destinationConfig?.oft || destinationConfig?.oftLegacy;
  const isDestinationLegacy = destinationLayerzeroAddress === destinationConfig?.oftLegacy;
  if (isDestinationLegacy) {
    hubOft = hubConfig.oftLegacy || hubConfig.oft;
  }
  return hubOft;
};

export const resolveDefaultHubQuoteOftAddress = (
  hubConfig: OftChainConfig,
): string | undefined => {
  return hubConfig.oft || hubConfig.oftAdapter || hubConfig.oftLegacy;
};

export const getHopMsgFee = async (params: OftHopQuoteParams) => {
  const {
    sendParam,
    hubConfig,
    hubChain,
    destinationConfig,
    resolveHubQuoteOftAddress = resolveDefaultHubQuoteOftAddress,
  } = params;

  const execTime = new ExecTime({ type: "getHopMsgFee", logStyle: "lime-800" });

  const hubOftAddress = resolveHubQuoteOftAddress(hubConfig, destinationConfig);
  if (!hubOftAddress) {
    throw new Error("Missing hub OFT address for multi-hop quote");
  }

  execTime.breakpoint();
  const provider = evmRpcFallbackProvider(hubChain);
  const oftContractRead = new ethers.Contract(hubOftAddress, OFT_ABI, provider);
  execTime.log("provider init");

  try {
    execTime.breakpoint();
    const msgFee = await oftContractRead.quoteSend.staticCall(sendParam, false);
    execTime.log("quoteSend");

    const [nativeFee] = msgFee;

    execTime.logTotal("getHopMsgFee");

    return nativeFee * 100n / 100n;
  } catch (error) {
    csl("getHopMsgFee", "red-500", "getHopMsgFee failed: %o", error);
    throw new Error("Quote multi hop message fee failed");
  }
};

export const buildUsdt0HopQuoteParams = (params: {
  sendParam: any;
  toToken: TokenChain;
  hubConfig: OftChainConfig;
  hubChain: TokenChain;
  destinationConfig: OftChainConfig;
}): OftHopQuoteParams => ({
  ...params,
  resolveHubQuoteOftAddress: resolveUsdt0HubQuoteOftAddress,
});
