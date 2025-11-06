import { zeroPadValue } from "ethers";
import { CCTP_TOKEN_PROXY, CCTP_TOKEN_PROXY_ABI, CCTP_TOKEN_PROXY_GAS_USED } from "./contract";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { getPrice } from "@/utils/format/price";
import axios, { type AxiosInstance } from "axios";
import { CCTP_DOMAINS, IRIS_API_URL } from "./config";

export const PayInLzToken = false;

const excludeFees: string[] = ["estimateApproveGasUsd"];

class CCTPService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: IRIS_API_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  public async getCCTPFees(params: any) {
    const {
      type = "fast",
      sourceDomain,
      destinationDomain,
    } = params;

    try {
      const response = await this.api.get(`/burn/USDC/fees/${sourceDomain}/${destinationDomain}`);
      const [fast, standard] = response.data;
      if (type === "fast") {
        return fast;
      }
      return standard;
    } catch (error) {
      console.log("cctp get fees failed: %o", error);
    }
    return {
      finalityThreshold: 1000,
      minimumFee: 0,
    };
  }

  public async quote(params: any) {
    const {
      wallet,
      // originChain,
      // destinationChain,
      amountWei,
      refundTo,
      recipient,
      fromToken,
      toToken,
      // slippageTolerance,
      prices,
    } = params;

    const sourceDomain = CCTP_DOMAINS[fromToken.chainName];
    const destinationDomain = CCTP_DOMAINS[toToken.chainName];
    const proxyAddress = CCTP_TOKEN_PROXY[fromToken.chainName];

    const result: any = {
      needApprove: true,
      approveSpender: proxyAddress,
      sendParam: void 0,
      quoteParam: {
        sourceDomain,
        destinationDomain,
        proxyAddress,
        ...params,
      },
      fees: {},
      totalFeesUsd: void 0,
      estimateSourceGas: void 0,
      estimateTime: 0,
      outputAmount: numberRemoveEndZero(Big(amountWei || 0).div(10 ** fromToken.decimals).toFixed(fromToken.decimals, 0)),
    };

    const { finalityThreshold, minimumFee } = await this.getCCTPFees({
      sourceDomain,
      destinationDomain,
    });

    // 1. check approve
    const allowance = await wallet.allowance({
      contractAddress: fromToken.contractAddress,
      address: refundTo,
      spender: proxyAddress,
      amountWei,
    });
    result.needApprove = allowance.needApprove;
    if (result.needApprove) {
      try {
        const gasLimit = await allowance.contract.approve.estimateGas(proxyAddress, amountWei);
        const { usd } = await wallet.getEstimateGas({
          gasLimit,
          price: getPrice(prices, fromToken.nativeToken.symbol),
          nativeToken: fromToken.nativeToken,
        });
        result.fees.estimateApproveGasUsd = usd;
      } catch (error) {
        console.log("cctp estimate approve gas failed: %o", error);
      }
    }

    const proxyContract = wallet.getContract({
      contractAddress: CCTP_TOKEN_PROXY[fromToken.chainName],
      abi: CCTP_TOKEN_PROXY_ABI,
    });

    // 2. estimate mint gas
    const mintGasUsed = CCTP_TOKEN_PROXY_GAS_USED[fromToken.chainName];
    const { usd: mintGasUsd } = await wallet.getEstimateGas({
      gasLimit: mintGasUsed,
      price: getPrice(prices, fromToken.nativeToken.symbol),
      nativeToken: fromToken.nativeToken,
    });
    result.fees.estimateMintGasUsd = mintGasUsd;

    // 3. deposit
    const chargedAmount = BigInt(amountWei) - BigInt(Big(mintGasUsd || 0).times(10 ** fromToken.decimals).toFixed(0));
    result.outputAmount = numberRemoveEndZero(Big(chargedAmount.toString()).div(10 ** fromToken.decimals).toFixed(fromToken.decimals, 0));
    // minimumFee: 1 = 0.01%
    const maxFee = Big(amountWei).times(Big(1).minus(Big(minimumFee).div(10000))).toFixed(0);
    const depositParam = [
      // originalAmount
      amountWei,
      // chargedAmount = originalAmount - gas fee
      chargedAmount,
      // destinationDomain
      destinationDomain,
      // mintRecipient
      zeroPadValue(recipient, 32),
      // burnToken
      fromToken.contractAddress,
      // destinationCaller
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      // maxFee
      maxFee,
      // minFinalityThreshold
      finalityThreshold,
      // signature
      "0x",
    ];
    result.sendParam = {
      contract: proxyContract,
      param: depositParam,
    };

    // 4. estimate deposit gas
    try {
      const gasLimit = await proxyContract.depositWithFee.estimateGas(...depositParam);
      const { usd, wei } = await wallet.getEstimateGas({
        gasLimit,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
      });
      result.fees.estimateDepositGasUsd = usd;
      result.estimateSourceGas = wei;
    } catch (error) {
      console.log("cctp estimate deposit gas failed: %o", error);
    }

    // calculate total fees
    for (const feeKey in result.fees) {
      if (excludeFees.includes(feeKey)) {
        continue;
      }
      result.totalFeesUsd = Big(result.totalFeesUsd || 0).plus(result.fees[feeKey] || 0);
    }
    result.totalFeesUsd = numberRemoveEndZero(Big(result.totalFeesUsd).toFixed(20));

    return result;
  }

  public async send(params: any) {
    const {
      contract,
      param,
    } = params;

    const tx = await contract.depositWithFee(...param);

    const txReceipt = await tx.wait();
    if (txReceipt.status !== 1) {
      throw new Error("Transaction failed");
    }
    return txReceipt.hash;
  }

  public async getStatus(params: any) {
    return axios({
      url: `https://scan.layerzero-api.com/v1/messages/tx/${params.hash}`,
      method: "GET",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json"
      },
    });
  }
}

export default new CCTPService();
