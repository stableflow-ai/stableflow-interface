import { chainsRpcUrls } from "@/config/chains";
import { ethers } from "ethers";
import { USDT0_CONFIG } from "./config";
import { OFT_ABI } from "./contract";
import { addressToBytes32 } from "@/utils/address-validation";
import Big from "big.js";

export const getHopMsgFee = async (params: any) => {
  const {
    dstEid,
    toToken,
    recipient,
    amountWei,
    slippageTolerance,
  } = params;

  const originLayerzero = USDT0_CONFIG["Arbitrum"];
  const destinationLayerzero = USDT0_CONFIG[toToken.chainName];

  let arbitrumOft = originLayerzero.oft;
  let destinationLayerzeroAddress = destinationLayerzero.oft || destinationLayerzero.oftLegacy;
  const isDestinationLegacy = destinationLayerzeroAddress === destinationLayerzero.oftLegacy;
  if (isDestinationLegacy) {
    arbitrumOft = originLayerzero.oftLegacy || originLayerzero.oft;
  }

  const provider = new ethers.JsonRpcProvider(chainsRpcUrls["Arbitrum"]);
  const oftContractRead = new ethers.Contract(arbitrumOft, OFT_ABI, provider);

  // const minAmountLD = BigInt(Big(amountWei).times(Big(1).minus(Big(slippageTolerance).div(100))).toFixed(0));

  const sendParam: any = {
    dstEid: dstEid,
    to: addressToBytes32(toToken.chainType, recipient),
    amountLD: amountWei,
    minAmountLD: 0n,
    extraOptions: "0x0003",
    composeMsg: "0x",
    oftCmd: "0x"
  };

  try {
    const oftData = await oftContractRead.quoteOFT.staticCall(sendParam);
    const [, , oftReceipt] = oftData;
    sendParam.minAmountLD = oftReceipt[1];
  } catch (error) {
    console.log("get oftReceipt failed: %o", error);
  }

  try {
    const msgFee = await oftContractRead.quoteSend.staticCall(sendParam, false);

    const [nativeFee] = msgFee;

    console.log("nativeFee: %o", nativeFee);

    // 20% buffer
    return nativeFee * 120n / 100n;
  } catch (error) {
    console.log("getHopMsgFee failed: %o", error);
    return 0;
  }
};
