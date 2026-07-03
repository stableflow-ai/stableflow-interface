import { usdt0Chains } from "@/config/tokens/usdt0";
import { USDT0_CONFIG } from "./config";
import type { OftHopQuoteParams } from "../oft/types";
import {
  buildUsdt0HopQuoteParams,
  getHopMsgFee as getHopMsgFeeBase,
  resolveUsdt0HubQuoteOftAddress,
} from "../oft/hop-composer";

export {
  buildUsdt0HopQuoteParams,
  resolveUsdt0HubQuoteOftAddress,
} from "../oft/hop-composer";

export const getHopMsgFee = async (params: {
  sendParam: any;
  toToken?: { chainName: string };
  hopQuote?: Partial<OftHopQuoteParams> & Pick<OftHopQuoteParams, "hubConfig" | "hubChain">;
}) => {
  const hopQuote = params.hopQuote
    ? {
      resolveHubQuoteOftAddress: resolveUsdt0HubQuoteOftAddress,
      ...params.hopQuote,
      sendParam: params.sendParam,
    } as OftHopQuoteParams
    : buildUsdt0HopQuoteParams({
      sendParam: params.sendParam,
      toToken: params.toToken as any,
      hubConfig: USDT0_CONFIG["Arbitrum"],
      hubChain: usdt0Chains["arb"],
      destinationConfig: USDT0_CONFIG[params.toToken!.chainName],
    });

  return getHopMsgFeeBase(hopQuote);
};
