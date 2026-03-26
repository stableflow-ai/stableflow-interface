import { getChainRpcUrl } from "@/config/chains";
import { ethers } from "ethers";
import { USDT0_CONFIG } from "./config";
import { OFT_ABI } from "./contract";
import { csl } from "@/utils/log";

export const getHopMsgFee = async (params: any) => {
  const {
    sendParam,
    toToken,
  } = params;

  const _t0 = performance.now();
  let _t = _t0;

  const originLayerzero = USDT0_CONFIG["Arbitrum"];
  const destinationLayerzero = USDT0_CONFIG[toToken.chainName];

  let arbitrumOft = originLayerzero.oft;
  let destinationLayerzeroAddress = destinationLayerzero.oft || destinationLayerzero.oftLegacy;
  const isDestinationLegacy = destinationLayerzeroAddress === destinationLayerzero.oftLegacy;
  if (isDestinationLegacy) {
    arbitrumOft = originLayerzero.oftLegacy || originLayerzero.oft;
  }

  _t = performance.now();
  const providers = getChainRpcUrl("Arbitrum").rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, 42161));
  const provider = new ethers.FallbackProvider(providers);
  const oftContractRead = new ethers.Contract(arbitrumOft!, OFT_ABI, provider);
  csl(`getHopMsgFee ->${toToken?.chainName}`, "gray-900", "provider init: %sms", (performance.now() - _t).toFixed(0));

  try {
    _t = performance.now();
    const msgFee = await oftContractRead.quoteSend.staticCall(sendParam, false);
    csl(`getHopMsgFee ->${toToken?.chainName}`, "gray-900", "quoteSend.staticCall: %sms", (performance.now() - _t).toFixed(0));

    const [nativeFee] = msgFee;

    csl(`getHopMsgFee ->${toToken?.chainName}`, "gray-900", "total: %sms", (performance.now() - _t0).toFixed(0));
    return nativeFee * 100n / 100n;
  } catch (error) {
    csl("getHopMsgFee", "red-500", "getHopMsgFee failed: %o", error);
    throw new Error("Quote multi hop message fee failed");
  }
};
