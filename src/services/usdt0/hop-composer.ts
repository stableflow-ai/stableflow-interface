import { getChainRpcUrl } from "@/config/chains";
import { ethers } from "ethers";
import { USDT0_CONFIG } from "./config";
import { OFT_ABI } from "./contract";
import { csl } from "@/utils/log";
import { ExecTime } from "@/utils/exec-time";

export const getHopMsgFee = async (params: any) => {
  const {
    sendParam,
    toToken,
  } = params;

  const execTime = new ExecTime({ type: "getHopMsgFee", logStyle: "lime-800" });

  const originLayerzero = USDT0_CONFIG["Arbitrum"];
  const destinationLayerzero = USDT0_CONFIG[toToken.chainName];

  let arbitrumOft = originLayerzero.oft;
  let destinationLayerzeroAddress = destinationLayerzero.oft || destinationLayerzero.oftLegacy;
  const isDestinationLegacy = destinationLayerzeroAddress === destinationLayerzero.oftLegacy;
  if (isDestinationLegacy) {
    arbitrumOft = originLayerzero.oftLegacy || originLayerzero.oft;
  }

  execTime.breakpoint();
  const providers = getChainRpcUrl("Arbitrum").rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, 42161));
  const provider = new ethers.FallbackProvider(providers);
  const oftContractRead = new ethers.Contract(arbitrumOft!, OFT_ABI, provider);
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
