import { getChainRpcUrl } from '@/config/chains';
import { Service } from '@/services/constants';
import { Address, beginCell, Cell, storeMessage, toNano, TonClient } from '@ton/ton';
import type { TupleItem } from '@ton/ton';
import { TonConnectUI } from '@tonconnect/ui-react';
import { SendType } from '../types';
import {
  buildClass,
  decodeClass,
  emptyCell,
  generateBuildClass,
  generateDecodeClass,
} from '@layerzerolabs/lz-ton-sdk-v2';
import { buildJettonWalletTransferBody, pollTransactionByBoc, tonObjects } from '../utils/ton';
import { numberRemoveEndZero } from '@/utils/format/number';
import Big from 'big.js';
import { Options } from '@layerzerolabs/lz-v2-utilities';
import { LZ_RECEIVE_VALUE } from '@/services/usdt0/config';
import { addressToBytes32 } from '@/utils/address-validation';
import { getHopMsgFee } from '@/services/usdt0/hop-composer';
import { ethers } from 'ethers';
import { csl } from '@/utils/log';
import { getPrice } from '@/utils/format/price';

const oftBuildClass = generateBuildClass(tonObjects);

const _log = (str: string, ...params: any) => {
  if (import.meta.env.VITE_BASE_API_URL === "https://api.stableflow.ai") return;
  console.log(`%c[TON]${str}`, "background:#0098EA;color:#fff;", ...params);
};

export default class TonWallet {
  private tonConnectUI: TonConnectUI;
  private tonClient: TonClient;
  private account: string;

  constructor(options: { tonConnectUI: TonConnectUI; account: string; }) {
    this.tonConnectUI = options.tonConnectUI;
    this.account = options.account;

    this.tonClient = new TonClient({
      endpoint: getChainRpcUrl("Ton").rpcUrl,
      apiKey: import.meta.env.VITE_TON_RPC_API_KEY,
    });
  }

  // Check if the token is native TON
  private isNativeToken(originAsset: string): boolean {
    const lowerAsset = originAsset.toLowerCase();
    return lowerAsset === "ton" || lowerAsset === "native";
  }

  async getSenderJettonWallet(masterAddress: string, account?: string) {
    const _account = account || this.account;
    try {
      const jettonMasterAddress = Address.parse(masterAddress);
      const owner = Address.parse(_account);

      const ownerCell = beginCell().storeAddress(owner).endCell();
      const stack: TupleItem[] = [{ type: 'slice', cell: ownerCell }];

      const response = await this.tonClient.runMethod(jettonMasterAddress, "get_wallet_address", stack);

      const jettonWalletCell = response.stack.readCell();
      const jettonWalletAddress = jettonWalletCell.beginParse().loadAddress();

      return jettonWalletAddress;
    } catch (error) {
      console.error("get %s jetton wallet failed: %o", _account, error);
      throw error;
    }
  }

  async transfer(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
    memo?: string;
  }) {
    const { originAsset, depositAddress, amount, memo } = data;

    if (!this.tonConnectUI) {
      throw new Error('TON Connect UI not initialized');
    }

    try {
      if (this.isNativeToken(originAsset)) {
        // Native TON token transfer
        const transaction = {
          messages: [
            {
              address: depositAddress,
              amount: toNano(amount).toString(),
            }
          ],
          validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        };

        const result = await this.tonConnectUI.sendTransaction(transaction);
        return result.boc;
      }

      const senderJettonWallet = await this.getSenderJettonWallet(originAsset);

      const body = buildJettonWalletTransferBody({
        memo,
        amount,
        recipient: depositAddress,
        refundTo: this.account,
      });

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: senderJettonWallet.toString(), // sender jetton wallet
            amount: toNano("0.05").toString(), // for commission fees, excess will be returned
            payload: body.toBoc().toString("base64"), // payload with jetton transfer body
          },
        ],
      };

      const result = await this.tonConnectUI.sendTransaction(transaction);
      return result.boc;
    } catch (error) {
      console.log('TON transfer error:', error);
      throw error;
    }
  }

  async getBalance(token: any, account: string) {
    try {
      if (this.isNativeToken(token.symbol)) {
        const parsedAddress = Address.parse(account);
        const accountState = await this.tonClient.getBalance(parsedAddress);
        return accountState.toString();
      }
      const tokenJettonWallet = await this.getSenderJettonWallet(token.contractAddress, account);
      const response = await this.tonClient.runMethod(tokenJettonWallet, "get_wallet_data", []);
      const balance = response.stack.readBigNumber();
      return balance.toString();
    } catch (error) {
      console.log('TON getBalance error:', error);
      return '0';
    }
  }

  async balanceOf(token: string, account: string) {
    return await this.getBalance(token, account);
  }

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
    const { fromToken, amount, depositAddress, account } = data;

    let estimateGas: bigint;

    if (this.isNativeToken(fromToken.symbol)) {
      estimateGas = toNano("0.01");
    } else {
      const senderJettonWallet = await this.getSenderJettonWallet(fromToken.contractAddress, account);
      const body = buildJettonWalletTransferBody({
        amount,
        recipient: depositAddress,
        refundTo: account,
      });
      try {
        const estimation = await this.tonClient.estimateExternalMessageFee(senderJettonWallet, {
          body,
          initCode: null,
          initData: null,
          ignoreSignature: true,
        });
        const { in_fwd_fee, storage_fee, gas_fee, fwd_fee } = estimation.source_fees;
        estimateGas = BigInt(in_fwd_fee) + BigInt(storage_fee) + BigInt(gas_fee) + BigInt(fwd_fee);
        csl("TON estimateTransferGas", "blue-300", "estimateGas: %o", estimateGas);
        estimateGas = estimateGas + toNano("0.1");
      } catch {
        estimateGas = toNano("0.12");
      }
    }

    return {
      gasLimit: estimateGas,
      gasPrice: 1n, // TON has no gas price concept, use 1 for compatibility
      estimateGas,
    };
  }

  async getEstimateGas(params: any) {
    const { estimateGas, prices, fromToken } = params;

    const price = getPrice(prices, fromToken.nativeToken.symbol);

    const estimateGasAmount = Big(estimateGas.toString()).div(10 ** fromToken.nativeToken.decimals);
    const estimateGasUsd = Big(estimateGasAmount).times(price || 1);

    return {
      gasPrice: 1n,
      usd: numberRemoveEndZero(Big(estimateGasUsd).toFixed(20)),
      wei: estimateGas,
      amount: numberRemoveEndZero(Big(estimateGasAmount).toFixed(fromToken.nativeToken.decimals)),
    };
  }

  async quote(type: Service, params: any) {
    switch (type) {
      case Service.Usdt0:
        return await this.quoteOFT(params);
      case Service.OneClick:
        return await this.quoteOneClickProxy(params);
      default:
        throw new Error(`Unsupported quote type: ${type}`);
    }
  }

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

  async sendTransaction(params: any) {
    const {
      transaction,
    } = params;

    const result = await this.tonConnectUI.sendTransaction(transaction);
    const { hexHash } = await pollTransactionByBoc(result.boc, { maxPollCount: 60, pollInterval: 3000 });
    return hexHash;
  }

  async quoteOFT(params: any) {
    const {
      originLayerzeroAddress,
      destinationLayerzeroAddress,
      fromToken,
      toToken,
      dstEid,
      refundTo,
      recipient,
      amountWei,
      payInLzToken,
      slippageTolerance,
      multiHopComposer,
      isMultiHopComposer,
      isOriginLegacy,
      isDestinationLegacy,
      prices,
      excludeFees,
      originLayerzero,
      destinationLayerzero,
    } = params;

    const result: any = {
      needApprove: false,
      sendParam: void 0,
      fees: {},
      estimateSourceGas: void 0,
      estimateSourceGasUsd: void 0,
      outputAmount: numberRemoveEndZero(Big(amountWei || 0).div(10 ** fromToken.decimals).toFixed(fromToken.decimals, 0)),
      quoteParam: {
        ...params,
      },
      totalFeesUsd: void 0,
      estimateTime: 0,
    };

    const amountLd = BigInt(amountWei);
    const slippage = slippageTolerance;
    const minAmountLd = BigInt(Big(amountWei).times(Big(1).minus(Big(slippage).div(100))).toFixed(0));

    const lzReceiveOptionGas = isDestinationLegacy ? destinationLayerzero.lzReceiveOptionGasLegacy : destinationLayerzero.lzReceiveOptionGas;
    const lzReceiveOptionValue = LZ_RECEIVE_VALUE[toToken.chainName] || 0;

    let unMultiHopExtraOptions = Options.newOptions().toBytes();
    if (!isMultiHopComposer && lzReceiveOptionValue) {
      unMultiHopExtraOptions = Options.newOptions().addExecutorLzReceiveOption(lzReceiveOptionGas, lzReceiveOptionValue).toBytes();
    }

    let _dstEid: any = dstEid;
    let to = addressToBytes32(toToken.chainType, recipient);

    let extraOptions = unMultiHopExtraOptions;
    let composeMsg = null;
    if (isMultiHopComposer) {
      _dstEid = multiHopComposer.eid;
      to = addressToBytes32("evm", multiHopComposer.oftMultiHopComposer);

      let multiHopExtraOptions = Options.newOptions().toHex();
      if (lzReceiveOptionValue) {
        multiHopExtraOptions = Options.newOptions().addExecutorLzReceiveOption(lzReceiveOptionGas, lzReceiveOptionValue).toHex();
      }

      const composeMsgSendParam = {
        dstEid,
        to: addressToBytes32(toToken.chainType, recipient),
        amountLD: amountLd,
        minAmountLD: minAmountLd,
        extraOptions: multiHopExtraOptions,
        composeMsg: "0x",
        oftCmd: "0x",
      };
      const hopMsgFee = await getHopMsgFee({
        sendParam: composeMsgSendParam,
        toToken,
      });

      extraOptions = Options.newOptions()
        .addExecutorComposeOption(0, originLayerzero.composeOptionGas || 500000, hopMsgFee)
        .toBytes();

      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const composeEncoder = abiCoder.encode(
        ["tuple(uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd)"],
        [Object.values(composeMsgSendParam)]);

      composeMsg = ethers.getBytes(composeEncoder);
    }

    // const parsedAddress = Address.parse(originLayerzeroAddress);
    // const contractStorage = await this.tonClient.runMethod(parsedAddress, "getContractStorage", []);

    // _log("contractStorage: %o", contractStorage);
    // const contractStorageReader = contractStorage.stack;
    // const contractStorageReaderCell = contractStorage.stack.readCell();

    // _log("contractStorageReader: %o", contractStorageReader);
    // _log("contractStorageReaderCell: %o", contractStorageReaderCell);

    // const adminAddress = contractStorageReader.readAddress();

    // _log("adminAddress: %o", adminAddress);

    // const usdtOftDecoder = generateDecodeClass(tonObjects);
    // _log("usdtOftDecoder: %o", usdtOftDecoder);
    // const usdtOFT = usdtOftDecoder('UsdtOFT', contractStorageReaderCell);

    // _log("usdtOFT: %o", usdtOFT);

    // const oftSend = await oftBuildClass('OFTSend', {
    //   dstEid: BigInt(_dstEid),
    //   to: BigInt(to),
    //   minAmount: minAmountLd,
    //   nativeFee: toNano("1.5"),
    //   zroFee: 0n,
    //   extraOptions: extraOptions,
    //   composeMessage,
    // });

    return { errMsg: "Not supported yet" };
  }

  async quoteOneClickProxy(params: any) {
    const {
      proxyAddress,
      fromToken,
      refundTo,
      depositAddress,
      amountWei,
      prices,
    } = params;

    const result: any = { fees: {} };

    const forwardTonAmount = toNano("0.085");
    const buffer = toNano("0.01");
    const estimatedGas = await this.estimateTransferGas({
      fromToken,
      amount: amountWei,
      depositAddress: proxyAddress,
      account: refundTo,
    });
    const totalValue = forwardTonAmount + buffer + estimatedGas.estimateGas;
    csl("TON quoteOneClickProxy", "blue-300", "totalValue: %o", totalValue);

    const userJettonWallet = await this.getSenderJettonWallet(fromToken.contractAddress, refundTo);
    csl("TON quoteOneClickProxy", "blue-300", "userJettonWallet: %o", userJettonWallet);

    const forwardPayload = beginCell().storeAddress(Address.parse(depositAddress)).endCell();
    const body = buildJettonWalletTransferBody({
      amount: amountWei,
      recipient: proxyAddress,
      refundTo: refundTo,
      forwardTonAmount: forwardTonAmount,
      forwardPayload,
    });
    csl("TON quoteOneClickProxy", "blue-300", "body: %o", body);

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [
        {
          address: userJettonWallet.toString(),
          amount: totalValue.toString(),
          payload: body.toBoc().toString("base64"),
        },
      ],
    };
    csl("TON quoteOneClickProxy", "blue-300", "transaction: %o", transaction);

    result.sendParam = {
      transaction,
    };

    try {
      const { usd, wei } = await this.getEstimateGas({
        estimateGas: estimatedGas.estimateGas,
        prices,
        fromToken,
      });
      result.fees.sourceGasFeeUsd = numberRemoveEndZero(Big(usd).toFixed(20));
      result.estimateSourceGas = wei;
      result.estimateSourceGasUsd = numberRemoveEndZero(Big(usd).toFixed(20));
    } catch (error) {
      csl("TON quoteOneClickProxy", "red-500", "getEstimateGas failed: %o", error);
    }

    return result;
  }
}
