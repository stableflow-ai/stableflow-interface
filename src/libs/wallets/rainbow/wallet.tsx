import erc20Abi from "@/config/abi/erc20";
import { numberRemoveEndZero } from "@/utils/format/number";
import { getPrice } from "@/utils/format/price";
import Big from "big.js";
import { ethers } from "ethers";
import { Options } from "@layerzerolabs/lz-v2-utilities";
import { addressToBytes32 } from "@/utils/address-validation";
import { LZ_RECEIVE_VALUE, USDT0_CONFIG, USDT0_LEGACY_MESH_TRANSFTER_FEE } from "@/services/usdt0/config";
import { quoteSignature } from "../utils/cctp";
import { SendType } from "../types";
import { Service } from "@/services/constants";
import { getHopMsgFee } from "@/services/usdt0/hop-composer";
import { getDestinationAssociatedTokenAddress } from "../utils/solana";
import { allUsdtChains } from "@/config/tokens";
import { buildEndpointV2LzComposePayload, NATIVE_MSG_FEE_BUFFER } from "../utils/layerzero";
import { OFT_ABI } from "@/services/usdt0/contract";
import { csl } from "@/utils/log";
import { createMulticall3, type Call } from "@/utils/multicall3";

const DEFAULT_GAS_LIMIT = 100000n;

export default class RainbowWallet {
  provider: any;
  signer: any;

  constructor(_provider: any, _signer?: any) {
    this.provider = _provider;
    this.signer = _signer;
  }

  async transfer(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
  }) {
    const { originAsset, depositAddress, amount } = data;

    if (originAsset === "eth") {
      const tx = await this.signer.sendTransaction({
        to: depositAddress,
        value: ethers.parseEther(amount)
      });
      await tx.wait();
      return tx;
    }

    const contract = new ethers.Contract(originAsset, erc20Abi, this.signer);

    const tx = await contract.transfer(depositAddress, amount);
    const result = await tx.wait();

    return result.hash;
  }

  async getBalance(token: any, account: string) {
    try {
      let provider = this.provider;
      if (token.rpcUrls) {
        const providers = token.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, token.chainId));
        provider = new ethers.FallbackProvider(providers);
      }

      if (token.symbol === "eth" || token.symbol === "ETH" || token.symbol === "native") {
        const balance = await provider.getBalance(account);
        return balance.toString();
      }

      // Use provider instead of _signer for read-only operations
      const contract = new ethers.Contract(token.contractAddress, erc20Abi, provider);

      const balance = await contract.balanceOf(account);
      csl("EVM getBalance", "green-500", "Success getting %s token balance: %o", token.contractAddress, balance);

      return balance.toString();
    } catch (err) {
      console.error("Error getting token balance: %o", err);
      return "0";
    }
  }

  async balanceOf(token: any, account: string) {
    return await this.getBalance(token, account);
  }

  /**
   * Estimate gas limit for transfer transaction
   * @param data Transfer data
   * @returns Gas limit estimate, gas price, and estimated gas cost
   */
  async estimateTransferGas(data: {
    fromToken: any;
    depositAddress: string;
    amount: string;
    account: string;
  }): Promise<{
    gasLimit: bigint;
    gasPrice: bigint;
    estimateGas: bigint;
  }> {
    const { fromToken, depositAddress, amount, account } = data;
    const originAsset = fromToken.contractAddress;
    const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
    const provider = new ethers.FallbackProvider(providers);

    let gasLimit: bigint;

    if (originAsset === "eth") {
      // Estimate gas for ETH transfer
      const tx = {
        from: account,
        to: depositAddress,
        value: ethers.parseEther(amount)
      };
      gasLimit = await provider.estimateGas(tx);
    } else {
      // Estimate gas for ERC20 token transfer
      const contract = new ethers.Contract(originAsset, erc20Abi, provider);
      gasLimit = await contract.transfer.estimateGas(depositAddress, amount);
    }

    // Increase gas limit by 20% to provide buffer
    gasLimit = (gasLimit * 120n) / 100n;

    // Get gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || 0n;

    // Calculate estimated gas cost: gasLimit * gasPrice
    const estimateGas = gasLimit * gasPrice;

    return {
      gasLimit,
      gasPrice,
      estimateGas
    };
  }

  getContract(params: any) {
    const {
      contractAddress,
      abi,
    } = params;

    return new ethers.Contract(contractAddress, abi, this.signer);
  }

  async allowance(params: any) {
    const {
      contractAddress,
      spender,
      address,
      amountWei,
      provider,
    } = params;

    const runner = provider || this.provider;
    const contract = new ethers.Contract(contractAddress, erc20Abi, runner);

    // get allowance
    let allowance = "0";
    try {
      allowance = await contract.allowance(address, spender);
      allowance = allowance.toString();
    } catch (error) {
      csl("EVM allowance", "red-500", "Error getting allowance: %o", error);
    }

    return {
      contract,
      allowance,
      needApprove: Big(amountWei || 0).gt(allowance || 0),
    };
  }

  async approve(params: any) {
    const {
      contractAddress,
      spender,
      amountWei,
      isApproveMax = false,
    } = params;

    const contract = new ethers.Contract(contractAddress, erc20Abi, this.signer);

    let _amountWei = amountWei;
    if (isApproveMax) {
      _amountWei = ethers.MaxUint256;
    }

    try {
      const tx = await contract.approve(spender, _amountWei);
      const txReceipt = await tx.wait();
      if (txReceipt.status === 1) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error approve: %o", error)
    }

    return false;
  }

  async getEstimateGas(params: any) {
    const { gasLimit, price, nativeToken, provider } = params;

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || BigInt("20000000000"); // Default 20 gwei

    const estimateGas = BigInt(gasLimit) * BigInt(gasPrice);
    const estimateGasAmount = Big(estimateGas.toString()).div(10 ** nativeToken.decimals);
    const estimateGasUsd = Big(estimateGasAmount).times(price || 1);

    return {
      gasPrice,
      usd: numberRemoveEndZero(Big(estimateGasUsd).toFixed(20)),
      wei: estimateGas,
      amount: numberRemoveEndZero(Big(estimateGasAmount).toFixed(nativeToken.decimals)),
    };
  }

  async quoteOFT(params: any) {
    const {
      abi,
      dstEid,
      recipient,
      amountWei,
      slippageTolerance,
      payInLzToken,
      fromToken,
      toToken,
      prices,
      originLayerzeroAddress,
      destinationLayerzeroAddress,
      excludeFees,
      refundTo,
      multiHopComposer,
      isMultiHopComposer,
      isOriginLegacy,
      isDestinationLegacy,
      originLayerzero,
      destinationLayerzero,
    } = params;

    const result: any = {
      needApprove: false,
      approveSpender: originLayerzeroAddress,
      sendParam: void 0,
      quoteParam: {
        ...params,
        originLayerzeroAddress: originLayerzeroAddress,
        destinationLayerzeroAddress: destinationLayerzeroAddress,
      },
      fees: {},
      totalFeesUsd: void 0,
      estimateSourceGas: void 0,
      estimateSourceGasUsd: void 0,
      estimateTime: 0, // seconds - dynamically calculated using LayerZero formula
      outputAmount: numberRemoveEndZero(Big(amountWei || 0).div(10 ** params.fromToken.decimals).toFixed(params.fromToken.decimals, 0)),
    };

    const _quoteType = `Usdt0 EVM ${fromToken.chainName}->${toToken.chainName}`;
    const _t0 = performance.now();
    let _t = _t0;

    const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
    const provider = new ethers.FallbackProvider(providers);

    const oftContract = new ethers.Contract(originLayerzeroAddress, abi, this.signer);
    const oftContractRead = new ethers.Contract(originLayerzeroAddress, abi, provider);

    // csl("EVM quoteOFT", "blue-900", "params: %o", params);
    _t = performance.now();

    // 1. check if need approve
    const approvalRequired = await oftContractRead.approvalRequired();
    csl("EVM quoteOFT", "blue-900", "approvalRequired: %o", approvalRequired);
    csl(_quoteType, "gray-900", "approvalRequired: %sms", (performance.now() - _t).toFixed(0));

    // If approval is required, check actual allowance
    if (approvalRequired) {
      try {
        _t = performance.now();
        // Check allowance
        const allowanceResult = await this.allowance({
          contractAddress: fromToken.contractAddress,
          spender: originLayerzeroAddress,
          address: refundTo,
          amountWei,
          provider,
        });
        result.needApprove = allowanceResult.needApprove;
        csl(_quoteType, "gray-900", "allowance: %sms", (performance.now() - _t).toFixed(0));
      } catch (error) {
        csl("EVM checking allowance", "red-500", "Error checking allowance: %o", error);
      }
    }

    const lzReceiveOptionGas = isDestinationLegacy ? destinationLayerzero.lzReceiveOptionGasLegacy : (destinationLayerzero.lzReceiveOptionGas || 200000);
    let lzReceiveOptionValue = 0;

    _t = performance.now();
    const destATA = await getDestinationAssociatedTokenAddress({
      recipient,
      toToken,
    });
    csl(_quoteType, "gray-900", "getDestinationAssociatedTokenAddress: %sms", (performance.now() - _t).toFixed(0));
    if (destATA.needCreateTokenAccount) {
      lzReceiveOptionValue = LZ_RECEIVE_VALUE[toToken.chainName] || 0;
    }

    let unMultiHopExtraOptions = Options.newOptions().toHex();
    if (!isMultiHopComposer && lzReceiveOptionValue) {
      unMultiHopExtraOptions = Options.newOptions().addExecutorLzReceiveOption(lzReceiveOptionGas, lzReceiveOptionValue).toHex();
    }

    // 2. quote send
    const sendParam: any = {
      dstEid: dstEid,
      to: addressToBytes32(toToken.chainType, recipient),
      amountLD: amountWei,
      minAmountLD: 0n,
      extraOptions: unMultiHopExtraOptions,
      composeMsg: "0x",
      oftCmd: "0x"
    };

    // csl("EVM quoteOFT", "blue-900", "isMultiHopComposer: %o", isMultiHopComposer);
    if (isMultiHopComposer) {
      // multiHopComposer: Arbitrum legacy mesh MultiHopComposer, eid = 30110
      sendParam.dstEid = multiHopComposer.eid;
      sendParam.to = addressToBytes32("evm", multiHopComposer.oftMultiHopComposer);

      let multiHopExtraOptions = Options.newOptions().toHex();
      if (lzReceiveOptionValue) {
        multiHopExtraOptions = Options.newOptions().addExecutorLzReceiveOption(lzReceiveOptionGas, lzReceiveOptionValue).toHex();
      }

      const composeMsgSendParam = {
        dstEid,
        to: addressToBytes32(toToken.chainType, recipient),
        amountLD: sendParam.amountLD,
        minAmountLD: sendParam.minAmountLD,
        extraOptions: multiHopExtraOptions,
        composeMsg: "0x",
        oftCmd: "0x",
      };
      _t = performance.now();
      const hopMsgFee = await getHopMsgFee({
        sendParam: composeMsgSendParam,
        toToken,
      });
      csl(_quoteType, "gray-900", "getHopMsgFee: %sms", (performance.now() - _t).toFixed(0));

      sendParam.extraOptions = Options.newOptions()
        .addExecutorComposeOption(0, originLayerzero.composeOptionGas || 800000, hopMsgFee)
        .toHex();
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      sendParam.composeMsg = abiCoder.encode(
        ["tuple(uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd)"],
        [Object.values(composeMsgSendParam)]
      );
    }

    // csl("EVM quoteOFT", "blue-900", "sendParam: %o", sendParam);
    _t = performance.now();

    const oftData = await oftContractRead.quoteOFT.staticCall(sendParam);
    const [, , oftReceipt] = oftData;
    sendParam.minAmountLD = oftReceipt[1] * (1000000n - BigInt(slippageTolerance * 10000)) / 1000000n;
    // csl("EVM quoteOFT", "blue-900", "oftData: %o", oftData);
    csl(_quoteType, "gray-900", "quoteOFT.staticCall: %sms", (performance.now() - _t).toFixed(0));

    _t = performance.now();
    const msgFee = await oftContractRead.quoteSend.staticCall(sendParam, payInLzToken);
    let nativeMsgFee = msgFee[0];
    const lzMsgFee = msgFee[1];
    result.estimateSourceGas = nativeMsgFee;
    csl("EVM quoteOFT", "blue-900", "msgFee: %o, nativeMsgFee: %o", msgFee, nativeMsgFee);
    csl(_quoteType, "gray-900", "quoteSend.staticCall: %sms", (performance.now() - _t).toFixed(0));
    // add 5% buffer
    nativeMsgFee = nativeMsgFee * NATIVE_MSG_FEE_BUFFER / 100n;
    csl("EVM quoteOFT", "blue-900", "msgFee after buffer: %o", nativeMsgFee);

    // csl("EVM quoteOFT", "blue-900", "Params: %o", result.sendParam);

    // 3. estimate gas
    const nativeFeeUsd = Big(nativeMsgFee?.toString() || 0).div(10 ** fromToken.nativeToken.decimals).times(getPrice(prices, fromToken.nativeToken.symbol));
    result.fees.nativeFee = numberRemoveEndZero(Big(nativeMsgFee?.toString() || 0).div(10 ** fromToken.nativeToken.decimals).toFixed(fromToken.nativeToken.decimals));
    result.fees.nativeFeeUsd = numberRemoveEndZero(Big(nativeFeeUsd).toFixed(20));
    result.fees.lzTokenFeeUsd = numberRemoveEndZero(Big(lzMsgFee?.toString() || 0).div(10 ** fromToken.decimals).toFixed(20));

    // 0.03% fee for Legacy Mesh transfers only (native USDT0 transfers are free)
    if (isOriginLegacy || isDestinationLegacy) {
      result.fees.legacyMeshFeeUsd = numberRemoveEndZero(Big(amountWei || 0).div(10 ** params.fromToken.decimals).times(USDT0_LEGACY_MESH_TRANSFTER_FEE).toFixed(params.fromToken.decimals));
      result.outputAmount = numberRemoveEndZero(Big(Big(amountWei || 0).div(10 ** params.fromToken.decimals)).minus(result.fees.legacyMeshFeeUsd || 0).toFixed(params.fromToken.decimals, 0));
    }

    let sendWithFeeGasLimit = 4000000n;
    _t = performance.now();
    try {
      const gasLimit = await oftContract.send.estimateGas(...result.sendParam.param);
      sendWithFeeGasLimit = gasLimit * 120n / 100n;
      const { usd, wei } = await this.getEstimateGas({
        gasLimit,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });
      result.fees.estimateGasUsd = usd;
      result.estimateSourceGas += wei;
      result.estimateSourceGasUsd = usd;
    } catch (error) {
      const { usd, wei } = await this.getEstimateGas({
        gasLimit: DEFAULT_GAS_LIMIT,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });
      result.fees.estimateGasUsd = usd;
      result.estimateSourceGas += wei;
      result.estimateSourceGasUsd = usd;
    }
    csl(_quoteType, "gray-900", "send.estimateGas: %sms", (performance.now() - _t).toFixed(0));

    result.sendParam = {
      contract: oftContract,
      method: "send",
      param: [
        sendParam,
        {
          nativeFee: nativeMsgFee,
          lzTokenFee: lzMsgFee,
        },
        refundTo,
        { value: nativeMsgFee, gasLimit: sendWithFeeGasLimit }
      ],
    };

    // calculate total fees
    for (const feeKey in result.fees) {
      if (excludeFees.includes(feeKey)) {
        continue;
      }
      result.totalFeesUsd = Big(result.totalFeesUsd || 0).plus(result.fees[feeKey] || 0);
    }
    result.totalFeesUsd = numberRemoveEndZero(Big(result.totalFeesUsd).toFixed(20));

    csl(_quoteType, "gray-900", "total: %sms", (performance.now() - _t0).toFixed(0));

    return result;
  }

  async sendTransaction(params: any) {
    const {
      method,
      contract,
      param,
    } = params;

    // Add gas fee buffer to prevent "max fee per gas less than block base fee" error.
    // Between quote and send, the baseFee may increase, causing the estimated
    // maxFeePerGas to be lower than the current baseFee.
    const overridesIndex = param.length - 1;
    const overrides = param[overridesIndex] && typeof param[overridesIndex] === "object" && !Array.isArray(param[overridesIndex])
      ? { ...param[overridesIndex] }
      : {};

    if (!overrides.maxFeePerGas) {
      try {
        const feeData = await this.provider.getFeeData();
        if (feeData.maxFeePerGas) {
          // Add 20% buffer to maxFeePerGas to account for baseFee fluctuations
          overrides.maxFeePerGas = (feeData.maxFeePerGas * 120n) / 100n;
        }
        if (feeData.maxPriorityFeePerGas && !overrides.maxPriorityFeePerGas) {
          overrides.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        }
      } catch (error) {
        csl("EVM sendTransaction", "red-500", "Failed to get fee data for gas buffer: %o", error);
      }
    }

    const finalParam = [...param];
    if (param[overridesIndex] && typeof param[overridesIndex] === "object" && !Array.isArray(param[overridesIndex])) {
      finalParam[overridesIndex] = overrides;
    } else {
      finalParam.push(overrides);
    }

    try {
      const tx = await contract[method](...finalParam);

      return tx.hash;
    } catch (error: any) {
      csl("EVM sendTransaction", "red-500", "Error sending transaction: %o, message: %o", error, error.message);
      let _finalErrorMessage = "Transaction failed";
      if (error?.message?.includes("user rejected action")) {
        _finalErrorMessage = error.message;
      }
      throw new Error(_finalErrorMessage);
    }

    // const DefaultErrorMsg = "Transaction failed";
    // try {
    //   const txReceipt = await tx.wait();

    //   if (txReceipt.status !== 1) {
    //     throw new Error(DefaultErrorMsg);
    //   }

    //   return txReceipt.hash;
    // } catch (error: any) {
    //   return tx.hash;
    // }
  }

  /**
   * Unified quote method that routes to specific quote methods based on type
   * @param type Service type from Service
   * @param params Parameters for the quote
   */
  async quote(type: Service, params: any) {
    switch (type) {
      case Service.CCTP:
        return await this.quoteCCTP(params);
      case Service.Usdt0:
        return await this.quoteOFT(params);
      case Service.OneClick:
        return await this.quoteOneClickProxy(params);
      case Service.Native:
        return await this.quoteNative(params);
      case Service.FraxZero:
        return await this.quoteFraxZero(params);
      default:
        throw new Error(`Unsupported quote type: ${type}`);
    }
  }

  /**
   * Unified send method that routes to specific send methods based on type
   * @param type Send type from SendType enum
   * @param params Parameters for the send transaction
   */
  async send(type: SendType, params: any) {
    switch (type) {
      case SendType.SEND:
        return await this.sendTransaction(params);
      case SendType.TRANSFER:
        return await this.transfer(params);
      default:
        throw new Error(`Unsupported send type: ${type}`);
    }
  }

  async quoteCCTP(params: any) {
    const {
      proxyAddress,
      abi,
      refundTo,
      recipient,
      amountWei,
      // slippageTolerance,
      fromToken,
      toToken,
      prices,
      excludeFees,
      destinationDomain,
      sourceDomain,
    } = params;

    const result: any = {
      needApprove: false,
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
      estimateSourceGasUsd: void 0,
      estimateTime: Math.floor(Math.random() * 8) + 3,
      outputAmount: numberRemoveEndZero(Big(amountWei || 0).div(10 ** fromToken.decimals).toFixed(fromToken.decimals, 0)),
    };

    const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
    const provider = new ethers.FallbackProvider(providers);

    const _quoteType = `CCTP EVM ${fromToken.chainName}->${toToken.chainName}`;
    const _t0 = performance.now();
    let _t = _t0;

    const proxyContract = new ethers.Contract(proxyAddress, abi, this.signer);
    const proxyContractRead = new ethers.Contract(proxyAddress, abi, provider);

    let realRecipient = recipient;
    _t = performance.now();
    // get ATA address
    const destATA = await getDestinationAssociatedTokenAddress({
      recipient,
      toToken,
    });
    csl(_quoteType, "gray-900", "getDestinationAssociatedTokenAddress: %sms", (performance.now() - _t).toFixed(0));
    result.needCreateTokenAccount = destATA.needCreateTokenAccount;
    if (destATA.associatedTokenAddress) {
      realRecipient = destATA.associatedTokenAddress;
    }

    _t = performance.now();
    // 1. get user nonce
    let userNonce = 0n;
    try {
      userNonce = await proxyContract.userNonces(refundTo);
    } catch (error) {
    }
    csl(_quoteType, "gray-900", "userNonces: %sms", (performance.now() - _t).toFixed(0));

    _t = performance.now();
    // 2. quote signature
    const signatureRes = await quoteSignature({
      address: refundTo,
      amount: numberRemoveEndZero(Big(amountWei || 0).div(10 ** fromToken.decimals).toFixed(fromToken.decimals, 0)),
      destination_domain_id: destinationDomain,
      receipt_address: realRecipient,
      source_domain_id: sourceDomain,
      user_nonce: Number(userNonce),
    });
    const {
      bridge_fee,
      finality_threshold,
      max_fee,
      mint_fee,
      receipt_amount,
      signature,
      destination_caller,
    } = signatureRes;
    csl(_quoteType, "gray-900", "quoteSignature: %sms", (performance.now() - _t).toFixed(0));

    result.fees.estimateMintGasUsd = numberRemoveEndZero(Big(mint_fee || 0).div(10 ** fromToken.decimals).toFixed(fromToken.decimals));
    result.fees.bridgeFeeUsd = numberRemoveEndZero(Big(bridge_fee || 0).div(10 ** fromToken.decimals).toFixed(fromToken.decimals));
    const chargedAmount = BigInt(amountWei) - BigInt(mint_fee);
    result.outputAmount = numberRemoveEndZero(Big(receipt_amount || 0).div(10 ** fromToken.decimals).toFixed(fromToken.decimals, 0));

    const depositParam = [
      // originalAmount
      amountWei,
      // chargedAmount = originalAmount - gas fee
      chargedAmount,
      // destinationDomain
      destinationDomain,
      // mintRecipient
      addressToBytes32(toToken.chainType, realRecipient),
      // burnToken
      fromToken.contractAddress,
      // destinationCaller
      destination_caller ? addressToBytes32(toToken.chainType, destination_caller) : "0x0000000000000000000000000000000000000000000000000000000000000000",
      // maxFee
      max_fee,
      // minFinalityThreshold
      finality_threshold,
      // signature
      signature,
    ];

    _t = performance.now();
    // 3. estimate deposit gas
    let depositWithFeeGasLimit = 4000000n;
    try {
      const gasLimit = await proxyContract.depositWithFee.estimateGas(...depositParam);
      depositWithFeeGasLimit = gasLimit * 120n / 100n;
      const { usd, wei } = await this.getEstimateGas({
        gasLimit,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });
      result.fees.estimateDepositGasUsd = usd;
      result.estimateSourceGas = wei;
      result.estimateSourceGasUsd = usd;
    } catch (error) {
      const { usd, wei } = await this.getEstimateGas({
        gasLimit: DEFAULT_GAS_LIMIT,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });
      result.fees.estimateDepositGasUsd = usd;
      result.estimateSourceGas = wei;
      result.estimateSourceGasUsd = usd;
    }
    csl(_quoteType, "gray-900", "depositWithFee.estimateGas: %sms", (performance.now() - _t).toFixed(0));

    result.sendParam = {
      method: "depositWithFee",
      contract: proxyContract,
      param: [
        ...depositParam,
        { gasLimit: depositWithFeeGasLimit }
      ],
    };

    _t = performance.now();
    // 4. check approve
    const allowance = await this.allowance({
      contractAddress: fromToken.contractAddress,
      address: refundTo,
      spender: proxyAddress,
      amountWei,
      provider,
    });
    result.needApprove = allowance.needApprove;
    csl(_quoteType, "gray-900", "allowance: %sms", (performance.now() - _t).toFixed(0));
    // get approve gas cost
    if (result.needApprove) {
      try {
        _t = performance.now();
        const gasLimit = await allowance.contract.approve.estimateGas(proxyAddress, amountWei);
        const { usd } = await this.getEstimateGas({
          gasLimit,
          price: getPrice(prices, fromToken.nativeToken.symbol),
          nativeToken: fromToken.nativeToken,
          provider,
        });
        result.fees.estimateApproveGasUsd = usd;
        csl(_quoteType, "gray-900", "approve.estimateGas: %sms", (performance.now() - _t).toFixed(0));
      } catch (error) {
        csl("EVM quoteCCTP", "red-500", "estimate approve gas failed: %o", error);
      }
    }

    // 5. calculate total fees
    for (const feeKey in result.fees) {
      if (excludeFees.includes(feeKey) || !/Usd$/.test(feeKey)) {
        continue;
      }
      result.totalFeesUsd = Big(result.totalFeesUsd || 0).plus(result.fees[feeKey] || 0);
    }
    result.totalFeesUsd = numberRemoveEndZero(Big(result.totalFeesUsd).toFixed(20));

    csl(_quoteType, "gray-900", "total: %sms", (performance.now() - _t0).toFixed(0));

    return result;
  }

  async quoteOneClickProxy(params: any) {
    const {
      proxyAddress,
      abi,
      fromToken,
      refundTo,
      depositAddress,
      amountWei,
      prices,
    } = params;

    const _quoteType = `OneClick EVM ${fromToken.chainName}`;
    const _t0 = performance.now();
    let _t = _t0;

    const result: any = { fees: {} };

    const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
    const provider = new ethers.FallbackProvider(providers);

    _t = performance.now();
    try {
      const allowance = await this.allowance({
        contractAddress: fromToken.contractAddress,
        address: refundTo,
        spender: proxyAddress,
        amountWei: amountWei,
        provider,
      });
      result.needApprove = allowance.needApprove;
      result.approveSpender = proxyAddress;
      csl(_quoteType, "gray-900", "allowance: %sms", (performance.now() - _t).toFixed(0));
    } catch (error) {
      csl("EVM quoteOneClickProxy", "red-500", "check allowance failed: %o", error);
    }

    const proxyContract = new ethers.Contract(proxyAddress, abi, this.signer);
    const proxyParam: any = [
      // tokenAddress
      fromToken.contractAddress,
      // recipient
      depositAddress,
      // amount
      amountWei,
    ];

    _t = performance.now();
    let proxyTransferGasLimit = 4000000n;
    try {
      const gasLimit = await proxyContract.proxyTransfer.estimateGas(...proxyParam);
      proxyTransferGasLimit = gasLimit * 120n / 100n;
      const { usd, wei } = await this.getEstimateGas({
        gasLimit,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });
      result.fees.sourceGasFeeUsd = numberRemoveEndZero(Big(usd).toFixed(20));
      result.estimateSourceGas = wei;
      result.estimateSourceGasUsd = numberRemoveEndZero(Big(usd).toFixed(20));
    } catch (error) {
      const { usd, wei } = await this.getEstimateGas({
        gasLimit: DEFAULT_GAS_LIMIT,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });
      result.fees.sourceGasFeeUsd = numberRemoveEndZero(Big(usd).toFixed(20));
      result.estimateSourceGas = wei;
      result.estimateSourceGasUsd = numberRemoveEndZero(Big(usd).toFixed(20));
    }
    csl(_quoteType, "gray-900", "proxyTransfer.estimateGas: %sms", (performance.now() - _t).toFixed(0));

    result.sendParam = {
      method: "proxyTransfer",
      contract: proxyContract,
      param: [
        ...proxyParam,
        { gasLimit: proxyTransferGasLimit }
      ],
    };

    csl(_quoteType, "gray-900", "total: %sms", (performance.now() - _t0).toFixed(0));

    return result;
  }

  async quoteNative(params: any) {
    const {
      quoteResponse,
      bridgeRouterAddress,
      ...restParams
    } = params;
    const {
      dry,
      amountWei,
      refundTo,
      fromToken,
      toToken,
      prices,
    } = restParams;

    const result: any = {
      ...quoteResponse,
      fees: {},
      needApprove: false,
      approveSpender: bridgeRouterAddress,
      quoteParam: {
        ...restParams,
      },
      sendParam: {
        txRequest: quoteResponse.txRequest,
      },
      totalFeesUsd: void 0,
      estimateSourceGas: void 0,
      estimateSourceGasUsd: void 0,
      estimateTime: quoteResponse.priority === "fast" ? Math.floor(Math.random() * 10) + 50 : Math.floor(Math.random() * 60) + 300,
      outputAmount: 0,
    };

    const _quoteType = `Native EVM ${fromToken.chainName}->${toToken.chainName}`;
    const _t0 = performance.now();
    let _t = _t0;

    const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
    const provider = new ethers.FallbackProvider(providers);

    _t = performance.now();
    const allowanceResult = await this.allowance({
      contractAddress: fromToken.contractAddress,
      spender: bridgeRouterAddress,
      address: refundTo,
      amountWei,
    });
    result.needApprove = allowanceResult.needApprove;
    csl(_quoteType, "gray-900", "allowance: %sms", (performance.now() - _t).toFixed(0));

    if (dry) {
      _t = performance.now();
      const { usd, wei } = await this.getEstimateGas({
        gasLimit: DEFAULT_GAS_LIMIT,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });
      csl(_quoteType, "gray-900", "getEstimateGas(dry): %sms", (performance.now() - _t).toFixed(0));

      result.outputAmount = quoteResponse.buyerTokenAmount + "";
      result.fees = {
        sourceGasFeeUsd: usd,
        widgetFeeUsd: quoteResponse.widgetFeeUsd,
        liquidityProviderFeeUsd: quoteResponse.liquidityProviderFeeUsd,
      };
      result.estimateSourceGas = wei;
      result.estimateSourceGasUsd = usd;
      result.totalFeesUsd = numberRemoveEndZero(Big(quoteResponse.totalFeeUsd).toFixed(20));
    }
    else {
      _t = performance.now();
      let gasEstimate = DEFAULT_GAS_LIMIT;
      try {
        gasEstimate = await provider.estimateGas({
          to: quoteResponse.txRequest.target,
          data: quoteResponse.txRequest.calldata,
          from: refundTo,
        });
        result.txRequest.gasLimit = gasEstimate;
      } catch (error) {
        result.txRequest.gasLimit = 4000000n;
      }
      csl(_quoteType, "gray-900", "provider.estimateGas: %sms", (performance.now() - _t).toFixed(0));
      const { usd, wei } = await this.getEstimateGas({
        gasLimit: gasEstimate,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });

      result.outputAmount = Big(quoteResponse.amountOut || 0).div(10 ** (toToken.decimals || 6)).toFixed(toToken.decimals || 6, 0);
      result.fees = {
        sourceGasFeeUsd: usd,
        // maybe 100 = 1%
        widgetFeeUsd: numberRemoveEndZero(Big(amountWei || 0).div(10 ** (fromToken.decimals || 6)).times(quoteResponse.widgetFee.feeRate || 0).toFixed(20, 0)),
        // not return by api
        liquidityProviderFeeUsd: "0",
      };
      result.estimateSourceGas = wei;
      result.estimateSourceGasUsd = usd;
      result.totalFeesUsd = numberRemoveEndZero(Big(quoteResponse.amountOutBeforeFee || 0).minus(quoteResponse.amountOut).div(10 ** (fromToken.decimals || 6)).toFixed(20, 0));
    }

    csl(_quoteType, "gray-900", "total: %sms", (performance.now() - _t0).toFixed(0));

    return result;
  }

  async quoteFraxZero(params: any) {
    const {
      abi,
      recipient,
      amountWei,
      slippageTolerance,
      fromToken,
      toToken,
      prices,
      excludeFees,
      refundTo,
      originLayerzero,
      destinationLayerzero,
    } = params;

    const {
      eid: srcEid,
      remoteHop,
      lockbox,
    } = originLayerzero;
    const {
      eid: dstEid,
    } = destinationLayerzero;

    const isFromEthereum = fromToken.chainId === 1;

    const result: any = {
      needApprove: false,
      approveSpender: remoteHop,
      sendParam: void 0,
      quoteParam: {
        ...params,
      },
      fees: {},
      totalFeesUsd: 0,
      estimateSourceGas: 0n,
      estimateSourceGasUsd: 0,
      estimateTime: 0,
      outputAmount: numberRemoveEndZero(Big(amountWei || 0).div(10 ** params.fromToken.decimals).toFixed(params.fromToken.decimals, 0)),
    };

    const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
    const provider = new ethers.FallbackProvider(providers);

    const _quoteType = `FraxZero EVM ${fromToken.chainName}->${toToken.chainName}`;
    const _t0 = performance.now();
    let _t = _t0;

    const remoteHopContract = new ethers.Contract(remoteHop, abi, this.signer);
    const remoteHopContractRead = new ethers.Contract(remoteHop, abi, provider);

    _t = performance.now();
    // 1. check if need approve
    try {
      // Check allowance
      const allowanceResult = await this.allowance({
        contractAddress: fromToken.contractAddress,
        spender: remoteHop,
        address: refundTo,
        amountWei,
        provider,
      });
      result.needApprove = allowanceResult.needApprove;
      csl(_quoteType, "gray-900", "allowance: %sms", (performance.now() - _t).toFixed(0));
    } catch (error) {
      csl("EVM quoteFraxZero", "red-500", "Error checking allowance: %o", error);
    }

    // 2. get message fee
    const sendParams = [
      // _oft
      isFromEthereum ? lockbox : fromToken.contractAddress,
      // _dstEid
      dstEid,
      // _to
      addressToBytes32(toToken.chainType, recipient),
      // _amountLD
      amountWei
    ];
    _t = performance.now();
    const msgFee = await remoteHopContractRead.quote.staticCall(...sendParams);
    let nativeMsgFee = msgFee[0];
    csl("EVM quoteFraxZero", "blue-700", "nativeMsgFee: %o", nativeMsgFee);
    csl(_quoteType, "gray-900", "quote.staticCall: %sms", (performance.now() - _t).toFixed(0));
    // add 5% buffer
    nativeMsgFee = nativeMsgFee * NATIVE_MSG_FEE_BUFFER / 100n;
    csl("EVM quoteFraxZero", "blue-700", "nativeMsgFee after buffer: %o", nativeMsgFee);
    result.estimateSourceGas = nativeMsgFee;

    const nativeFeeUsd = Big(nativeMsgFee?.toString() || 0).div(10 ** fromToken.nativeToken.decimals).times(getPrice(prices, fromToken.nativeToken.symbol));
    result.fees.nativeFee = numberRemoveEndZero(Big(nativeMsgFee?.toString() || 0).div(10 ** fromToken.nativeToken.decimals).toFixed(fromToken.nativeToken.decimals));
    result.fees.nativeFeeUsd = numberRemoveEndZero(Big(nativeFeeUsd).toFixed(20));
    result.fees.lzTokenFeeUsd = numberRemoveEndZero(Big(msgFee[1]?.toString() || 0).div(10 ** fromToken.decimals).toFixed(20));

    csl("EVM quoteFraxZero", "blue-700", "msgFee: %o", msgFee);

    _t = performance.now();
    // 3. estimate send gas
    let sendWithFeeGasLimit = 4000000n;
    try {
      const gasLimit = await remoteHopContract.sendOFT.estimateGas(...sendParams, { value: nativeMsgFee });
      sendWithFeeGasLimit = gasLimit * 120n / 100n;
      const { usd, wei } = await this.getEstimateGas({
        gasLimit,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });
      result.fees.estimateGasUsd = usd;
      result.estimateSourceGas += wei;
      result.estimateSourceGasUsd = usd;
    } catch (error) {
      csl("EVM quoteFraxZero", "red-500", "estimate send gas failed: %o", error);
      const { usd, wei } = await this.getEstimateGas({
        gasLimit: DEFAULT_GAS_LIMIT,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });
      result.fees.estimateGasUsd = usd;
      result.estimateSourceGas += wei;
      result.estimateSourceGasUsd = usd;
    }
    csl(_quoteType, "gray-900", "sendOFT.estimateGas: %sms", (performance.now() - _t).toFixed(0));

    // 4. generate transaction
    result.sendParam = {
      contract: remoteHopContract,
      method: "sendOFT",
      param: [
        ...sendParams,
        { value: nativeMsgFee, gasLimit: sendWithFeeGasLimit }
      ],
    };

    // 5. calculate total fees
    for (const feeKey in result.fees) {
      if (excludeFees.includes(feeKey)) {
        continue;
      }
      result.totalFeesUsd = Big(result.totalFeesUsd || 0).plus(result.fees[feeKey] || 0);
    }
    result.totalFeesUsd = numberRemoveEndZero(Big(result.totalFeesUsd).toFixed(20));

    csl(_quoteType, "gray-900", "total: %sms", (performance.now() - _t0).toFixed(0));

    return result;
  }

  async preivewRedeemFrxUSD(params: any) {
    const {
      amountWei,
      fromToken,
      abi,
      usdcCustodianAddress,
      rwaCustodianAddress,
      redemptionAddress,
    } = params;

    csl("EVM preivewRedeemFrxUSD", "blue-700", "params: %o", params);

    const _quoteType = "FraxZero EVM preivewRedeemFrxUSD";
    const _t0 = performance.now();
    let _t = _t0;

    const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
    const provider = new ethers.FallbackProvider(providers);

    // Get maxSharesRedeemable (index 3) from mdwrComboView for both custodians
    const usdcCustodian = new ethers.Contract(usdcCustodianAddress, abi, provider);
    const rwaCustodian = new ethers.Contract(rwaCustodianAddress, abi, provider);
    const redemption = new ethers.Contract(redemptionAddress, abi, provider);

    _t = performance.now();
    const [usdcView, redemptionView] = await Promise.all([
      usdcCustodian.mdwrComboView.staticCall(),
      redemption.maxUstbRedemptionAmount.staticCall(),
    ]);
    csl(_quoteType, "gray-900", "mdwrComboView (Promise.all): %sms", (performance.now() - _t).toFixed(0));

    // This value is the frxUSD wei amount
    const maxUsdc = usdcView[3]; // maxSharesRedeemable
    const superstateTokenAmount = redemptionView[0]; // superstateTokenAmount

    // This value represents the wei amount of USDC
    const [maxRwa] = await redemption.calculateUsdcOut.staticCall(superstateTokenAmount);

    const amountWeiBigInt = BigInt(amountWei || 0);

    csl("EVM preivewRedeemFrxUSD", "blue-700", "usdcCustodian maxSharesRedeemable(frxUSD wei amount): %o", maxUsdc);
    csl("EVM preivewRedeemFrxUSD", "blue-700", "rwaCustodian maxSharesRedeemable(USDC wei amount): %o", maxRwa);
    csl("EVM preivewRedeemFrxUSD", "blue-700", "amountWei: %o", amountWeiBigInt);

    let totalAssetsOut = 0n;
    let isInsufficientLiquidity = false;

    if (amountWeiBigInt <= maxUsdc) {
      // USDC path only
      _t = performance.now();
      const assetsOut = await usdcCustodian.previewRedeem.staticCall(amountWeiBigInt);
      csl(_quoteType, "gray-900", "usdcCustodian.previewRedeem (USDC only): %sms", (performance.now() - _t).toFixed(0));
      csl("EVM preivewRedeemFrxUSD", "blue-700", "USDC path only, usdcCustodian previewRedeem input: %o, value: %o", amountWeiBigInt, assetsOut);
      totalAssetsOut = assetsOut;
      csl("EVM preivewRedeemFrxUSD", "blue-700", "USDC path only, totalAssetsOut: %o", totalAssetsOut);
    } else {
      // USDC first (maxUsdc), then RWA for remainder
      if (maxUsdc > 0n) {
        _t = performance.now();
        const usdcAssetsOut = await usdcCustodian.previewRedeem.staticCall(maxUsdc);
        csl(_quoteType, "gray-900", "usdcCustodian.previewRedeem (mixed): %sms", (performance.now() - _t).toFixed(0));
        csl("EVM preivewRedeemFrxUSD", "blue-700", "USDC first (maxUsdc), usdcCustodian previewRedeem input: %o, value: %o", maxUsdc, usdcAssetsOut);
        totalAssetsOut += usdcAssetsOut;
        csl("EVM preivewRedeemFrxUSD", "blue-700", "USDC first (maxUsdc), totalAssetsOut: %o", totalAssetsOut);
      }
      const rwaAmount = amountWeiBigInt - maxUsdc;
      csl("EVM preivewRedeemFrxUSD", "blue-700", "RWA for remainder, rwaAmount: %o", rwaAmount);
      if (rwaAmount > 0n) {
        _t = performance.now();
        const superstateTokenInAmount = await rwaCustodian.previewRedeem.staticCall(rwaAmount);
        csl("EVM preivewRedeemFrxUSD", "blue-700", "USDC first (maxUsdc), rwaCustodian previewRedeem input: %o, superstateTokenInAmount: %o", rwaAmount, superstateTokenInAmount);
        const [rwaAssetsOut] = await redemption.calculateUsdcOut.staticCall(superstateTokenInAmount);
        csl(_quoteType, "gray-900", "rwaCustodian.previewRedeem (mixed): %sms", (performance.now() - _t).toFixed(0));
        csl("EVM preivewRedeemFrxUSD", "blue-700", "USDC first (maxUsdc), rwaCustodian previewRedeem input: %o, value: %o", rwaAmount, rwaAssetsOut);
        totalAssetsOut += rwaAssetsOut;
        csl("EVM preivewRedeemFrxUSD", "blue-700", "RWA for remainder, totalAssetsOut: %o", totalAssetsOut);

        if (rwaAssetsOut > maxRwa) {
          isInsufficientLiquidity = true;
        }
      }
    }

    csl("EVM preivewRedeemFrxUSD", "blue-700", "final totalAssetsOut: %o", totalAssetsOut);
    csl("EVM preivewRedeemFrxUSD", "blue-700", "final insufficient liquidity: %o", isInsufficientLiquidity);
    csl(_quoteType, "gray-900", "total: %sms", (performance.now() - _t0).toFixed(0));

    return {
      maxUsdc,
      maxRwa,
      amountWeiBigInt,
      totalAssetsOut,
      isInsufficientLiquidity,
    };
  }

  async previewMintFrxUSD(params: any) {
    const {
      amountWei,
      fromToken,
      abi,
      usdcCustodianAddress,
    } = params;

    csl("EVM previewMintFrxUSD", "blue-700", "params: %o", params);

    const _quoteType = "FraxZero EVM previewMintFrxUSD";
    const _t0 = performance.now();
    let _t = _t0;

    const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
    const provider = new ethers.FallbackProvider(providers);

    // Get maxAssetsDepositable (index 0) from mdwrComboView for both custodians
    const usdcCustodian = new ethers.Contract(usdcCustodianAddress, abi, provider);

    _t = performance.now();
    const usdcView = await usdcCustodian.mdwrComboView.staticCall();
    csl(_quoteType, "gray-900", "mdwrComboView.staticCall: %sms", (performance.now() - _t).toFixed(0));

    const maxUsdc = usdcView[0]; // maxAssetsDepositable

    const amountWeiBigInt = BigInt(amountWei || 0);
    const totalMax = maxUsdc;

    _t = performance.now();
    const totalAssetsOut = await usdcCustodian.previewDeposit.staticCall(amountWeiBigInt);
    csl(_quoteType, "gray-900", "previewDeposit.staticCall: %sms", (performance.now() - _t).toFixed(0));

    csl(_quoteType, "gray-900", "total: %sms", (performance.now() - _t0).toFixed(0));

    return {
      maxUsdc,
      amountWeiBigInt,
      totalMax,
      totalAssetsOut,
    };
  }

  /**
   * Redeem frxUSD to USDC via USDC and/or RWA custodian contracts.
   * Uses mdwrComboView to get max redeemable liquidity and splits redemption across USDC/RWA paths.
   * Uses previewRedeem to get accurate output amount (USDC).
   */
  async redeemFrxUSD(params: any) {
    const {
      recipient,
      amountWei,
      fromToken,
      toToken,
      prices,
      refundTo,
      abi,
      usdcCustodianAddress,
      rwaCustodianAddress,
      redeemAndMintContractAddress,
    } = params;

    csl("EVM redeemFrxUSD", "blue-700", "params: %o", params);

    // Ethereum average block time ~12s, random ±5 seconds
    const ETH_AVG_BLOCK_TIME = 12;
    const estimateTime = (ETH_AVG_BLOCK_TIME * 2) + Math.floor(Math.random() * 11) - 5;

    const result: any = {
      needApprove: false,
      approveSpender: redeemAndMintContractAddress,
      sendParam: void 0,
      quoteParam: {
        ...params,
      },
      fees: {},
      totalFeesUsd: 0,
      estimateSourceGas: 0n,
      estimateSourceGasUsd: 0,
      estimateTime,
      outputAmount: "0",
    };

    const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
    const provider = new ethers.FallbackProvider(providers);

    const _quoteType = "FraxZero EVM redeemFrxUSD";
    const _t0 = performance.now();
    let _t = _t0;

    const redeemContractRead = new ethers.Contract(redeemAndMintContractAddress, abi, provider);
    const redeemContract = new ethers.Contract(redeemAndMintContractAddress, abi, this.signer);

    _t = performance.now();
    const {
      maxUsdc,
      maxRwa,
      amountWeiBigInt,
      isInsufficientLiquidity,
      totalAssetsOut,
    } = await this.preivewRedeemFrxUSD(params);
    csl(_quoteType, "gray-900", "preivewRedeemFrxUSD: %sms", (performance.now() - _t).toFixed(0));

    if (isInsufficientLiquidity) {
      throw new Error("Insufficient liquidity");
    }

    // outputAmount = USDC amount (6 decimals), human-readable
    result.outputAmount = numberRemoveEndZero(
      Big(totalAssetsOut.toString()).div(10 ** toToken.decimals).toFixed(toToken.decimals, 0)
    );

    _t = performance.now();
    // check allowance of fromToken for redeemAndMintContractAddress
    try {
      const allowanceResult = await this.allowance({
        contractAddress: fromToken.contractAddress,
        spender: redeemAndMintContractAddress,
        address: refundTo,
        amountWei,
        provider,
      });
      result.needApprove = allowanceResult.needApprove;
    } catch {
    }
    csl(_quoteType, "gray-900", "allowance: %sms", (performance.now() - _t).toFixed(0));

    result.sendParam = {
      contract: redeemContract,
      method: "redeemToUsdcAndTransfer",
      param: [
        amountWei,
        recipient,
      ],
    };

    _t = performance.now();
    let redeemGasLimit = DEFAULT_GAS_LIMIT;
    try {
      const gasLimit = await redeemContract[result.sendParam.method].estimateGas(...result.sendParam.param);
      redeemGasLimit = (gasLimit * 120n) / 100n;
    } catch (error) {
      csl("EVM redeemFrxUSD", "red-500", "estimate redeem gas failed: %o", error);
    }
    csl(_quoteType, "gray-900", "redeemToUsdcAndTransfer.estimateGas: %sms", (performance.now() - _t).toFixed(0));

    result.sendParam.param[2] = { gasLimit: redeemGasLimit };

    _t = performance.now();
    // Estimate gas for multicall aggregate and compute fees
    try {
      const { usd, wei } = await this.getEstimateGas({
        gasLimit: redeemGasLimit,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });
      result.fees.estimateGasUsd = usd;
      result.estimateSourceGas = wei;
      result.estimateSourceGasUsd = numberRemoveEndZero(Big(usd).toFixed(20));
      result.totalFeesUsd = numberRemoveEndZero(Big(usd).toFixed(20));
    } catch (error) {
      // skip gas estimation on error
      // csl("EVM redeemFrxUSD", "red-500", "estimate redeem gas failed: %o", error);
    }
    csl(_quoteType, "gray-900", "getEstimateGas: %sms", (performance.now() - _t).toFixed(0));

    csl(_quoteType, "gray-900", "total: %sms", (performance.now() - _t0).toFixed(0));

    return result;
  }

  /**
   * Mint frxUSD by depositing USDC into the custodian contract.
   * Calls deposit(assetsIn, receiver) on usdcCustodianAddress.
   * assetsIn = USDC amount (6 decimals), sharesOut = frxUSD amount (18 decimals).
   */
  async mintFrxUSD(params: any) {
    const {
      recipient,
      amountWei,
      fromToken,
      toToken,
      prices,
      refundTo,
      abi,
      usdcCustodianAddress,
    } = params;

    csl("EVM mintFrxUSD", "blue-700", "params: %o", params);

    // Ethereum average block time ~12s, estimateTime = 12*2 + random(-5, 5) seconds
    const ETH_AVG_BLOCK_TIME = 12;
    const estimateTime = (ETH_AVG_BLOCK_TIME * 2) + Math.floor(Math.random() * 11) - 5;

    const result: any = {
      needApprove: false,
      approveSpender: usdcCustodianAddress,
      sendParam: void 0,
      quoteParam: {
        ...params,
      },
      fees: {},
      totalFeesUsd: 0,
      estimateSourceGas: 0n,
      estimateSourceGasUsd: 0,
      estimateTime,
      outputAmount: "0",
    };

    const _quoteType = "FraxZero EVM mintFrxUSD";
    const _t0 = performance.now();
    let _t = _t0;

    const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
    const provider = new ethers.FallbackProvider(providers);

    _t = performance.now();
    // Check allowance of fromToken for usdcCustodianAddress (USDC must be approved to custodian)
    try {
      const allowanceResult = await this.allowance({
        contractAddress: fromToken.contractAddress,
        spender: usdcCustodianAddress,
        address: refundTo,
        amountWei,
        provider,
      });
      result.needApprove = allowanceResult.needApprove;
    } catch (error) {
      csl("EVM mintFrxUSD", "red-500", "Error checking allowance: %o", error);
    }
    csl(_quoteType, "gray-900", "allowance: %sms", (performance.now() - _t).toFixed(0));

    const usdcCustodian = new ethers.Contract(usdcCustodianAddress, abi, provider);
    const usdcCustodianWithSigner = new ethers.Contract(usdcCustodianAddress, abi, this.signer);

    _t = performance.now();
    const {
      maxUsdc,
      amountWeiBigInt,
      totalMax,
      totalAssetsOut,
    } = await this.previewMintFrxUSD(params);
    csl(_quoteType, "gray-900", "previewMintFrxUSD: %sms", (performance.now() - _t).toFixed(0));

    result.outputAmount = numberRemoveEndZero(
      Big(totalAssetsOut.toString()).div(10 ** toToken.decimals).toFixed(toToken.decimals, 0)
    );

    _t = performance.now();
    // Build sendParam for deposit(assetsIn, receiver)
    let depositGasLimit = DEFAULT_GAS_LIMIT;
    try {
      const gasLimit = await usdcCustodianWithSigner.deposit.estimateGas(amountWeiBigInt, recipient);
      depositGasLimit = (gasLimit * 120n) / 100n;
    } catch {
      // use default if estimation fails
    }
    csl(_quoteType, "gray-900", "deposit.estimateGas: %sms", (performance.now() - _t).toFixed(0));

    result.sendParam = {
      contract: usdcCustodianWithSigner,
      method: "deposit",
      param: [
        amountWeiBigInt,
        recipient,
        { gasLimit: depositGasLimit },
      ],
    };

    _t = performance.now();
    // Estimate gas fees
    try {
      const { usd, wei } = await this.getEstimateGas({
        gasLimit: depositGasLimit,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });
      result.fees.estimateGasUsd = usd;
      result.estimateSourceGas = wei;
      result.estimateSourceGasUsd = numberRemoveEndZero(Big(usd).toFixed(20));
      result.totalFeesUsd = numberRemoveEndZero(Big(usd).toFixed(20));
    } catch {
      // skip gas estimation on error
    }
    csl(_quoteType, "gray-900", "getEstimateGas: %sms", (performance.now() - _t).toFixed(0));

    csl(_quoteType, "gray-900", "total: %sms", (performance.now() - _t0).toFixed(0));

    return result;
  }

  async mintAndSendFrxUSD(params: any) {
    const {
      recipient,
      amountWei,
      fromToken,
      toToken,
      prices,
      refundTo,
      abi,
      usdcCustodianAddress,
      redeemAndMintContractAddress,
      originLayerzero,
      destinationLayerzero,
    } = params;

    csl("EVM mintAndSendFrxUSD", "blue-700", "params: %o", params);

    const {
      eid: dstEid,
    } = destinationLayerzero;

    // Ethereum average block time ~12s, estimateTime = 12*2 + random(-5, 5) seconds
    const ETH_AVG_BLOCK_TIME = 12;
    const estimateTime = (ETH_AVG_BLOCK_TIME * 2) + Math.floor(Math.random() * 11) - 5;

    const result: any = {
      needApprove: false,
      approveSpender: redeemAndMintContractAddress,
      sendParam: void 0,
      quoteParam: {
        ...params,
      },
      fees: {},
      totalFeesUsd: 0,
      estimateSourceGas: 0n,
      estimateSourceGasUsd: 0,
      estimateTime,
      outputAmount: "0",
    };

    const _quoteType = "FraxZero EVM mintAndSendFrxUSD";
    const _t0 = performance.now();
    let _t = _t0;

    const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
    const provider = new ethers.FallbackProvider(providers);

    _t = performance.now();
    // Check allowance of fromToken for usdcCustodianAddress (USDC must be approved to custodian)
    try {
      const allowanceResult = await this.allowance({
        contractAddress: fromToken.contractAddress,
        spender: redeemAndMintContractAddress,
        address: refundTo,
        amountWei,
        provider,
      });
      result.needApprove = allowanceResult.needApprove;
    } catch (error) {
      csl("EVM mintAndSendFrxUSD", "red-500", "Error checking allowance: %o", error);
    }
    csl(_quoteType, "gray-900", "allowance: %sms", (performance.now() - _t).toFixed(0));

    const redeemAndMintContractWithSigner = new ethers.Contract(redeemAndMintContractAddress, abi, this.signer);

    _t = performance.now();
    const {
      totalAssetsOut,
    } = await this.previewMintFrxUSD(params);
    csl("EVM mintAndSendFrxUSD", "gray-600", "previewMintFrxUSD totalAssetsOut: %o", totalAssetsOut);
    csl(_quoteType, "gray-900", "previewMintFrxUSD: %sms", (performance.now() - _t).toFixed(0));

    result.outputAmount = numberRemoveEndZero(
      Big(totalAssetsOut.toString()).div(10 ** 18).toFixed(18, 0)
    );

    // Build sendParam for deposit(assetsIn, receiver)
    const mintAndSendParam = [
      // assetsIn
      amountWei,
      // dstEid
      dstEid,
      // receiver
      addressToBytes32(toToken.chainType, recipient)
    ];
    _t = performance.now();
    let depositGasLimit = DEFAULT_GAS_LIMIT;
    try {
      const gasLimit = await redeemAndMintContractWithSigner.mintAndSend.estimateGas(...mintAndSendParam);
      depositGasLimit = (gasLimit * 120n) / 100n;
    } catch {
      // use default if estimation fails
    }
    csl(_quoteType, "gray-900", "mintAndSend.estimateGas: %sms", (performance.now() - _t).toFixed(0));

    result.sendParam = {
      contract: redeemAndMintContractWithSigner,
      method: "mintAndSend",
      param: [
        ...mintAndSendParam,
        { gasLimit: depositGasLimit },
      ],
    };

    _t = performance.now();
    // Estimate gas fees
    try {
      const { usd, wei } = await this.getEstimateGas({
        gasLimit: depositGasLimit,
        price: getPrice(prices, fromToken.nativeToken.symbol),
        nativeToken: fromToken.nativeToken,
        provider,
      });
      result.fees.estimateGasUsd = usd;
      result.estimateSourceGas = wei;
      result.estimateSourceGasUsd = numberRemoveEndZero(Big(usd).toFixed(20));
      result.totalFeesUsd = numberRemoveEndZero(Big(usd).toFixed(20));
    } catch {
      // skip gas estimation on error
    }
    csl(_quoteType, "gray-900", "getEstimateGas: %sms", (performance.now() - _t).toFixed(0));

    csl(_quoteType, "gray-900", "total: %sms", (performance.now() - _t0).toFixed(0));

    return result;
  }

  /**
   * Execute multicall batch transaction (e.g. redeem frxUSD via multiple custodian contracts).
   * Uses utils/multicall3 for transaction submission.
   * @param params Must contain multicallCalls: { target, callData }[] and chainId
   * @returns Transaction hash
   */
  async sendBatchCall(params: any) {
    const { multicallCalls, chainId } = params;

    if (!multicallCalls?.length || !chainId) {
      throw new Error("sendBatchCall requires multicallCalls and chainId");
    }

    try {
      const multicall = createMulticall3(this.provider, chainId);
      return await multicall.sendAggregate(multicallCalls as Call[], this.signer);
    } catch (error: any) {
      csl("EVM sendBatchCall", "red-500", "Error executing multicall: %o", error);
      const msg = error?.message?.includes("user rejected") ? error.message : "Transaction failed";
      throw new Error(msg);
    }
  }

  async retryLayerzeroLzComponse(params: any) {
    const {
      layerzeroData,
      history,
    } = params;

    const LayerZeroEndpointV2 = "0x1a44076050125825900e736c501f859c50fe728c";
    const LayerZeroEndpointV2ABI = [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_to",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "_guid",
            "type": "bytes32"
          },
          {
            "internalType": "uint16",
            "name": "_index",
            "type": "uint16"
          },
          {
            "internalType": "bytes",
            "name": "_message",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "_extraData",
            "type": "bytes"
          }
        ],
        "name": "lzCompose",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      }
    ];
    // lzCompose(address _from,address _to,bytes32 _guid,uint16 _index,bytes _message,bytes _extraData)
    const LayerZeroEndpointV2Contract = new ethers.Contract(LayerZeroEndpointV2, LayerZeroEndpointV2ABI, this.signer);

    const toToken: any = allUsdtChains[history.destination_chain.blockchain as keyof typeof allUsdtChains];
    const amountWei = Big(history.token_in_amount).times(10 ** (toToken.decimals || 6)).toFixed(0);

    const originLayerzero = USDT0_CONFIG["Arbitrum"];
    const isOriginLegacy = layerzeroData.destination.lzCompose.failedTx[0].from.toLowerCase() === originLayerzero.oftLegacy?.toLowerCase();
    const lzReceiveOptionGas = isOriginLegacy ? originLayerzero.lzReceiveOptionGasLegacy : originLayerzero.lzReceiveOptionGas;
    let lzReceiveOptionValue = 0;

    const destATA = await getDestinationAssociatedTokenAddress({
      recipient: history.receive_address,
      toToken,
    });
    if (destATA.needCreateTokenAccount) {
      lzReceiveOptionValue = LZ_RECEIVE_VALUE[toToken.chainName] || 0;
    }

    const composeFrom = layerzeroData.source.tx.from;
    const composeMsg = layerzeroData.source.tx.payload.split(composeFrom.replace(/^0x/, ""))[1];
    const _message = buildEndpointV2LzComposePayload({
      nonce: layerzeroData.pathway.nonce,
      srcEid: layerzeroData.pathway.srcEid,
      amountLD: amountWei,
      composeFrom: composeFrom,
      composeMsg: composeMsg,
    });

    const contractParams = [
      layerzeroData.destination.lzCompose.failedTx[0].from,
      layerzeroData.destination.lzCompose.failedTx[0].to,
      layerzeroData.guid,
      layerzeroData.destination.lzCompose.failedTx[0].index,
      _message,
      "0x",
    ];

    const dstOFT = isOriginLegacy ? originLayerzero.oft : originLayerzero.oftLegacy;
    const sendParam: any = {
      dstEid: USDT0_CONFIG[history.destination_chain.chainName].eid,
      to: addressToBytes32(toToken.chainType, history.receive_address),
      amountLD: amountWei,
      minAmountLD: 0n,
      extraOptions: Options.newOptions()
        // .addExecutorLzReceiveOption(lzReceiveOptionGas, lzReceiveOptionValue)
        .toHex(),
      composeMsg: "0x",
      oftCmd: "0x"
    };

    const dstOFTContract = new ethers.Contract(dstOFT!, OFT_ABI, this.provider);
    const msgFee = await dstOFTContract.quoteSend.staticCall(sendParam, false);
    let nativeFee = msgFee[0];
    nativeFee = nativeFee * NATIVE_MSG_FEE_BUFFER / 100n;

    const tx = await LayerZeroEndpointV2Contract.lzCompose(
      ...contractParams,
      {
        gasLimit: originLayerzero.composeOptionGas || 800000,
        value: nativeFee,
      }
    );

    const txReceipt = await tx.wait();

    if (txReceipt.status === 1) {
      return txReceipt.hash;
    }

    return null;
  }

  async signTypedData(params: any) {
    const { fromToken, amountWei, spender } = params;

    csl("EVM signTypedData", "blue-900", "params: %o", params);

    const providers = fromToken.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, fromToken.chainId));
    const provider = new ethers.FallbackProvider(providers);

    const value = amountWei;
    const tokenAddress = fromToken.contractAddress;
    const chainId = fromToken.chainId;
    // 3 days
    const deadline = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 3);
    const account = this.signer.address;

    const erc20 = new ethers.Contract(tokenAddress, erc20Abi, provider);
    const nonce = await erc20.nonces(account);
    const name = await erc20.name();

    let _version = "1";
    if (fromToken.symbol === "USDC") {
      _version = "2";
    }

    const domain = {
      name,
      version: _version,
      chainId: Number(chainId),
      verifyingContract: tokenAddress
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    };

    const values = {
      owner: account,
      spender,
      value,
      nonce: nonce.toString(),
      deadline
    };

    const signature = await this.signer?.signTypedData(domain, types, values);

    const { v, r, s } = ethers.Signature.from(signature);

    // Check if signature is available
    try {
      const permitParams = [
        account,
        spender,
        value,
        deadline,
        v,
        r,
        s,
      ];
      const permitResponse = await erc20.permit.staticCall(...permitParams);
      csl("EVM signTypedData", "green-500", "permit response: %o", permitResponse);
    } catch (error: any) {
      csl("EVM signTypedData", "red-500", "check permit signature failed: %o", error);
      throw new Error("Permit signature verification failed");
    }

    return {
      owner: account,
      value,
      deadline,
      nonce: Number(nonce),
      v,
      r,
      s,
    };
  }
}
