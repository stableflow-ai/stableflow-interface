import { zeroPadValue } from "ethers";
import { USDT0_CONFIG } from "./config";
import { OFT_ABI } from "./contract";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { getPrice } from "@/utils/format/price";

export const PayInLzToken = false;

class Usdt0Service {
  public async quote(params: any) {
    const {
      wallet,
      originChain,
      destinationChain,
      amountWei,
      recipient,
      fromToken,
      prices,
    } = params;

    console.log("params: %o", params);

    const result: any = {
      needApprove: true,
      sendParam: void 0,
      quoteParam: params,
      fees: {},

      estimateTime: 32, // seconds
      outputAmount: amountWei, // wei
    };

    const originLayerzero = USDT0_CONFIG[originChain];
    const destinationLayerzero = USDT0_CONFIG[destinationChain];

    const oftContract = wallet.getContract({
      contractAddress: originLayerzero.oft,
      abi: OFT_ABI,
    });

    // 1. check if need approve
    result.needApprove = await oftContract.approvalRequired();
    console.log("%cApprovalRequired: %o", "background:blue;color:white;", result.needApprove);

    // 2. quote send
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
    const [, , oftReceipt] = oftData;
    sendParam.minAmountLD = oftReceipt[1];
    result.sendParam = sendParam;

    const msgFee = await oftContract.quoteSend.staticCall(sendParam, PayInLzToken);

    console.log("%cMsgFee: %o", "background:blue;color:white;", msgFee);

    // 3. estimate gas
    const nativeFeeUsd = Big(msgFee[0]?.toString() || 0).div(10 ** fromToken.nativeToken.decimals).times(getPrice(prices, fromToken.nativeToken.symbol));
    result.fees.nativeFeeUsd = numberRemoveEndZero(Big(nativeFeeUsd).toFixed(20));
    result.fees.lzTokenFeeUsd = numberRemoveEndZero(Big(msgFee[1]?.toString() || 0).div(10 ** fromToken.decimals).toFixed(20));
    try {
      const gasLimit = await oftContract.send.estimateGas(
        sendParam,
        {
          nativeFee: msgFee[0],
          lzTokenFee: msgFee[1],
        },
        recipient,
        { value: msgFee[0] }
      );
      const feeData = await wallet.provider.getFeeData();
      const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || BigInt("20000000000"); // Default 20 gwei
      const estimateGas = BigInt(gasLimit) * BigInt(gasPrice);
      const estimateGasUsd = Big(estimateGas.toString()).div(10 ** fromToken.nativeToken.decimals).times(getPrice(prices, fromToken.nativeToken.symbol));

      result.fees.estimateGasUsd = numberRemoveEndZero(Big(estimateGasUsd).toFixed(20));
    } catch (error) {
      console.log("usdt0 estimate gas failed: %o", error);
    }

    return result;
  }

  public async send(params: any) {
    const {
      wallet,
      originChain,
      destinationChain,
      amountWei,
      recipient,
    } = params;

    const originLayerzero = USDT0_CONFIG[originChain];
    const destinationLayerzero = USDT0_CONFIG[destinationChain];

    const oftContract = wallet.getContract({
      contractAddress: originLayerzero.oft,
      abi: OFT_ABI,
    });

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
    const [, , oftReceipt] = oftData;
    sendParam.minAmountLD = oftReceipt[1];
    const msgFee = await oftContract.quoteSend.staticCall(sendParam, PayInLzToken);

    console.log("%cMsgFee: %o", "background:blue;color:white;", msgFee);

    const tx = await oftContract.send(
      sendParam,
      {
        nativeFee: msgFee[0],
        lzTokenFee: msgFee[1],
      },
      recipient,
      { value: msgFee[0] }
    );

    const txReceipt = await tx.wait();
    console.log("txReceipt: %o", txReceipt);
    return txReceipt;
  }
}

export default new Usdt0Service();
