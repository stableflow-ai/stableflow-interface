import Big from "big.js";
import { USDT0_CONFIG } from "./config";
import { Contract } from "ethers";
import { OFT_ABI } from "./contract";

class Usdt0Service {
  public async quote(params: any) {
    const {
      slippageTolerance,
      originChain,
      destinationChain,
      amountWei,
      refundTo,
      recipient,
      signer,
    } = params;

    const result = {
      needApprove: true,
      quote: void 0,
      quoteRequest: params,
      fees: void 0,
    };

    const originLayerzero = USDT0_CONFIG[originChain];
    const minAmountWei = Big(amountWei).times(1 - slippageTolerance / 100).toFixed(0);

    const oftContract = new Contract(originLayerzero.oft, OFT_ABI, signer);

    // get msgFee
    const sendParams = [
      // dstEid
      originLayerzero.eid,
      // to
      recipient,
      // amountLD
      amountWei,
      // minAmountLD
      minAmountWei,
      // extraOptions
      "0x",
      // composeMsg
      "0x",
      // oftCmd
      "0x"
    ];

    // const [,, oftReceipt] = await oftContract.callStatic.quoteOFT(sendParams);
    // sendParams[3] = oftReceipt[1];
    // const msgFee = await oftContract.callStatic.quoteSend(sendParams, false);
  }
}

export default new Usdt0Service();
