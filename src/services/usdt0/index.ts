import { USDT0_CONFIG, USDT0_DVN_COUNT } from "./config";
import { OFT_ABI, SOLANA_IDL } from "./contract";
import { getRouteStatus, Service } from "@/services/constants";
import { calculateEstimateTime } from "../utils";
import { ExecTime } from "@/utils/exec-time";
import { OftService } from "../oft/base-service";

export const PayInLzToken = false;

export const excludeFees: string[] = ["estimateGasUsd"];

export class Usdt0Service extends OftService {
  protected readonly service = Service.Usdt0;
  protected readonly dvnCount = USDT0_DVN_COUNT;

  public async quote(params: any) {
    const {
      dry,
      wallet,
      originChain,
      destinationChain,
      amountWei,
      refundTo,
      recipient,
      fromToken,
      toToken,
      slippageTolerance,
      prices,
      evmGasFees,
    } = params;

    const _quoteType = `Usdt0Service ${fromToken?.chainName}->${toToken?.chainName}`;
    const execTime = new ExecTime({ type: _quoteType, logStyle: "lime-600" });

    const originLayerzero = USDT0_CONFIG[originChain];
    const destinationLayerzero = USDT0_CONFIG[destinationChain];

    let originLayerzeroAddress = originLayerzero.oft;
    let destinationLayerzeroAddress = destinationLayerzero.oft;
    let dstEid = destinationLayerzero.eid;

    const estimateTime = calculateEstimateTime({
      requiredDvnCount: this.dvnCount,
      originConfig: originLayerzero,
      destinationConfig: destinationLayerzero,
    });

    const routeStatus = getRouteStatus(Service.Usdt0);

    if (fromToken.chainType === "evm") {
      destinationLayerzeroAddress = destinationLayerzero.oft || destinationLayerzero.oftLegacy;
      let isOriginLegacy = false;
      let isDestinationLegacy = destinationLayerzeroAddress === destinationLayerzero.oftLegacy;
      if (isDestinationLegacy) {
        originLayerzeroAddress = originLayerzero.oftLegacy || originLayerzero.oft;
        isOriginLegacy = originLayerzeroAddress === originLayerzero.oftLegacy;
      }
      if (!originLayerzeroAddress) {
        originLayerzeroAddress = originLayerzero.oftLegacy;
        isOriginLegacy = true;
        if (destinationLayerzero.oftLegacy) {
          destinationLayerzeroAddress = destinationLayerzero.oftLegacy;
          isDestinationLegacy = true;
        }
      }
      const isBothLegacy = isOriginLegacy && isDestinationLegacy;
      const isBothOUpgradeable = !isOriginLegacy && !isDestinationLegacy;
      const isMultiHopComposer = !isBothLegacy && !isBothOUpgradeable;

      const result = await wallet.quote(Service.Usdt0, {
        dry,
        abi: OFT_ABI,
        dstEid,
        refundTo,
        recipient,
        amountWei,
        slippageTolerance,
        payInLzToken: PayInLzToken,
        fromToken,
        toToken,
        prices,
        evmGasFees,
        originLayerzeroAddress,
        destinationLayerzeroAddress,
        excludeFees,
        multiHopComposer: USDT0_CONFIG["Arbitrum"],
        isMultiHopComposer,
        isOriginLegacy,
        isDestinationLegacy,
        originLayerzero,
        destinationLayerzero,
      });

      result.estimateTime = estimateTime;
      result.routeDisabled = routeStatus.disabled;
      result.sourceQuoteParams = params;

      execTime.logTotal("Usdt0Service.quote");
      return result;
    }

    const isOriginLegacy = true;
    originLayerzeroAddress = originLayerzero.oftLegacy;
    destinationLayerzeroAddress = destinationLayerzero.oftLegacy || destinationLayerzero.oft;
    const isDestinationLegacy = destinationLayerzeroAddress === destinationLayerzero.oftLegacy;
    const isBothLegacy = isOriginLegacy && isDestinationLegacy;
    const isMultiHopComposer = !isBothLegacy;

    if (isMultiHopComposer) {
      dstEid = USDT0_CONFIG["Arbitrum"].eid;
      destinationLayerzeroAddress = USDT0_CONFIG["Arbitrum"].oftMultiHopComposer;
    }

    const oftParams: any = {
      dry,
      dstEid: destinationLayerzero.eid,
      refundTo,
      recipient,
      amountWei,
      slippageTolerance,
      payInLzToken: PayInLzToken,
      fromToken,
      toToken,
      prices,
      originLayerzeroAddress,
      destinationLayerzeroAddress,
      excludeFees,
      multiHopComposer: USDT0_CONFIG["Arbitrum"],
      isMultiHopComposer,
      isOriginLegacy,
      isDestinationLegacy,
      originLayerzero,
      destinationLayerzero,
    };

    if (fromToken.chainType === "tron") {
      oftParams.abi = OFT_ABI;
    }

    if (fromToken.chainType === "sol") {
      oftParams.idl = SOLANA_IDL;
    }

    const result = await wallet.quote(Service.Usdt0, {
      idl: SOLANA_IDL,
      ...oftParams,
    });

    result.estimateTime = estimateTime;
    result.routeDisabled = routeStatus.disabled;
    result.sourceQuoteParams = params;

    execTime.logTotal("Usdt0Service.quote");

    return result;
  }
}

export default new Usdt0Service();
