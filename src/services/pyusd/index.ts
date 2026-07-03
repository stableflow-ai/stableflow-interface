import { pyusdChains } from "@/config/tokens/pyusd";
import { getRouteStatus, Service } from "@/services/constants";
import { calculateEstimateTime } from "../utils";
import { ExecTime } from "@/utils/exec-time";
import { OftService } from "../oft/base-service";
import {
  getPyusdRouteBlockReason,
  isPyusdHubOriginComposerRoute,
  isPyusdMultiHopRoute,
  PYUSD_DVN_COUNT,
  PYUSD_HUB_CONFIG,
  PYUSD_ARBITRUM_HUB_OFT,
  PYUSD_LZ_CONFIG,
  resolvePyusdHubQuoteOftAddress,
  resolvePyusdMultiHopComposerAddress,
  resolvePyusdMultiHopHopQuote,
} from "./config";
import { OFT_ABI } from "./contract";

export const PayInLzToken = false;

export const excludeFees: string[] = ["estimateGasUsd"];

export class PyusdService extends OftService {
  protected readonly service = Service.Pyusd;
  protected readonly dvnCount = PYUSD_DVN_COUNT;

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

    const routeBlockReason = getPyusdRouteBlockReason(fromToken, toToken);
    if (routeBlockReason) {
      return { errMsg: routeBlockReason };
    }

    const _quoteType = `PyusdService ${fromToken?.chainName}->${toToken?.chainName}`;
    const execTime = new ExecTime({ type: _quoteType, logStyle: "cyan-600" });

    const originLayerzero = PYUSD_LZ_CONFIG[originChain];
    const destinationLayerzero = PYUSD_LZ_CONFIG[destinationChain];

    if (!originLayerzero || !destinationLayerzero) {
      return { errMsg: "Unsupported PYUSD route" };
    }

    const originLayerzeroAddress = originLayerzero.oft;
    let destinationLayerzeroAddress = destinationLayerzero.oft;
    let dstEid = destinationLayerzero.eid;

    const estimateTime = calculateEstimateTime({
      requiredDvnCount: this.dvnCount,
      originConfig: originLayerzero,
      destinationConfig: destinationLayerzero,
    });

    const routeStatus = getRouteStatus(Service.Pyusd);
    const isHubOriginComposerRoute = isPyusdHubOriginComposerRoute(fromToken, toToken);
    let isMultiHopComposer = isPyusdMultiHopRoute(fromToken, toToken);

    const multiHopComposer = isMultiHopComposer
      ? {
        ...PYUSD_HUB_CONFIG,
        oftMultiHopComposer: resolvePyusdMultiHopComposerAddress(destinationLayerzero.eid),
      }
      : PYUSD_HUB_CONFIG;

    let hopQuote = isMultiHopComposer
      ? {
        hubConfig: PYUSD_HUB_CONFIG,
        hubChain: pyusdChains["arb"],
        destinationConfig: destinationLayerzero,
        resolveHubQuoteOftAddress: resolvePyusdHubQuoteOftAddress,
        ...resolvePyusdMultiHopHopQuote(destinationLayerzero.eid),
      }
      : undefined;

    let originLayerzeroForQuote = originLayerzero;
    let originOftAddress = originLayerzeroAddress;

    if (isHubOriginComposerRoute) {
      originOftAddress = PYUSD_ARBITRUM_HUB_OFT;
      originLayerzeroForQuote = {
        ...originLayerzero,
        oftApprovalRequired: true,
      };
    }

    if (fromToken.chainType === "evm") {
      const result = await wallet.quote(Service.Pyusd, {
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
        originLayerzeroAddress: originOftAddress,
        destinationLayerzeroAddress,
        excludeFees,
        multiHopComposer,
        isMultiHopComposer,
        isOriginLegacy: false,
        isDestinationLegacy: false,
        originLayerzero: originLayerzeroForQuote,
        destinationLayerzero,
        hopQuote,
      });

      result.estimateTime = estimateTime;
      result.routeDisabled = routeStatus.disabled;
      result.sourceQuoteParams = params;

      execTime.logTotal("PyusdService.quote");
      return result;
    }

    if (fromToken.chainType === "sol") {
      const result = await wallet.quote(Service.Pyusd, {
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
        originLayerzeroAddress: originLayerzero.programId || originLayerzero.oft,
        destinationLayerzeroAddress,
        excludeFees,
        isMultiHopComposer: false,
        isOriginLegacy: false,
        isDestinationLegacy: false,
        originLayerzero,
        destinationLayerzero,
      });

      result.estimateTime = estimateTime;
      result.routeDisabled = routeStatus.disabled;
      result.sourceQuoteParams = params;

      execTime.logTotal("PyusdService.quote");
      return result;
    }

    if (fromToken.chainType === "tron") {
      if (isMultiHopComposer) {
        dstEid = PYUSD_HUB_CONFIG.eid;
        destinationLayerzeroAddress = multiHopComposer.oftMultiHopComposer;
      }

      const result = await wallet.quote(Service.Pyusd, {
        dry,
        abi: OFT_ABI,
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
        multiHopComposer,
        isMultiHopComposer,
        isOriginLegacy: false,
        isDestinationLegacy: false,
        originLayerzero,
        destinationLayerzero,
        hopQuote,
      });

      result.estimateTime = estimateTime;
      result.routeDisabled = routeStatus.disabled;
      result.sourceQuoteParams = params;

      execTime.logTotal("PyusdService.quote");
      return result;
    }

    return { errMsg: "Unsupported source chain for PYUSD" };
  }
}

export default new PyusdService();
