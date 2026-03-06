import { Service } from "@/services/constants";
import { FRAXZERO_CONFIG, FRAXZERO_REQUIRED_DVN_COUNT } from "./config";
import { FRAXZERO_ABI } from "./contract";
import { calculateEstimateTime } from "../utils";
import { Usdt0Service } from "../usdt0";
import { OFT_ABI } from "../usdt0/contract";

export const PayInLzToken = false;

export const excludeFees: string[] = ["estimateGasUsd"];

export class FraxZeroService extends Usdt0Service {
  public override async quote(params: any) {
    const {
      wallet,
      amountWei,
      refundTo,
      recipient,
      fromToken,
      toToken,
      slippageTolerance,
      prices,
    } = params;

    const originLayerzero = FRAXZERO_CONFIG[fromToken.chainName];
    const destinationLayerzero = FRAXZERO_CONFIG[toToken.chainName];

    const isFromEthereumOrFraxtal = fromToken.chainId === 1 || fromToken.chainId === 252;
    const isToEthereumOrFraxtal = toToken.chainId === 1 || toToken.chainId === 252;
    const isFraxtal = fromToken.chainId === 252 || toToken.chainId === 252;
    const isFromSolana = fromToken.chainName === "Solana";

    if (isFromSolana) {
      // only support Ethereum and Fraxtal
      if (![1, 252].includes(toToken.chainId)) {
        throw new Error("Invalid destination chain");
      }
    }

    const estimateTime = calculateEstimateTime({
      requiredDvnCount: FRAXZERO_REQUIRED_DVN_COUNT,
      originConfig: originLayerzero,
      destinationConfig: destinationLayerzero,
    });

    if (isFraxtal && !isFromSolana) {
      const result = await wallet.quote(Service.Usdt0, {
        ...params,
        abi: OFT_ABI,
        dstEid: destinationLayerzero.eid,
        payInLzToken: PayInLzToken,
        originLayerzeroAddress: isFromEthereumOrFraxtal ? originLayerzero.lockbox : fromToken.contractAddress,
        destinationLayerzeroAddress: isToEthereumOrFraxtal ? destinationLayerzero.lockbox : toToken.contractAddress,
        excludeFees,
        originLayerzero,
        destinationLayerzero,
      });

      result.estimateTime = estimateTime;

      return result;
    }

    const result = await wallet.quote(Service.FraxZero, {
      ...params,
      abi: FRAXZERO_ABI,
      originLayerzero,
      destinationLayerzero,
      excludeFees,
    });

    result.estimateTime = estimateTime;

    return result;
  }
}

export default new FraxZeroService();
