import { zeroPadValue } from "ethers";
import { USDT0_CONFIG } from "./config";
import { OFT_ABI } from "./contract";

class Usdt0Service {
  public async quote(params: any) {
    const {
      wallet,
      originChain,
      destinationChain,
      amountWei,
      recipient,
    } = params;

    console.log("wallet: %o", wallet);

    const result = {
      needApprove: true,
      quote: void 0,
      quoteRequest: params,
      fees: void 0,
    };

    const originLayerzero = USDT0_CONFIG[originChain];
    const destinationLayerzero = USDT0_CONFIG[destinationChain];

    const oftContract = wallet.getContract({
      contractAddress: originLayerzero.oft,
      abi: OFT_ABI,
    });

    console.log("oftContract: %o", oftContract);

    const sendParam = {
      dstEid: destinationLayerzero.eid,
      to: zeroPadValue(recipient, 32),
      amountLD: amountWei,
      minAmountLD: 0,
      extraOptions: "0x",
      composeMsg: "0x",
      oftCmd: "0x"
    };

    const oftData = await oftContract.quoteOFT.staticCall(sendParam);
    console.log("oftData: %o", oftData);
    const [, , oftReceipt] = oftData;
    sendParam.minAmountLD = oftReceipt[1];
    console.log("sendParam: %o", sendParam);
    const payInLzToken = false;
    const msgFee = await oftContract.quoteSend.staticCall(sendParam, payInLzToken);

    console.log("%cMsgFee: %o", "background:blue;color:white;", msgFee);

    const gasLimit = await oftContract.send.estimateGas(
      sendParam,
      {
        nativeFee: msgFee[0],
        lzTokenFee: msgFee[1],
      },
      recipient,
      { value: msgFee[0] }
    );

    console.log("%cGasLimit: %o", "background:blue;color:white;", gasLimit);

    return result;
  }
}

export default new Usdt0Service();
