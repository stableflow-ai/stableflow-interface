import { getChainRpcUrl } from '@/config/chains';
import { Service } from '@/services/constants';
import { Address, beginCell, toNano, TonClient } from '@ton/ton';
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
import { tonObjects } from '../utils/ton';
import { numberRemoveEndZero } from '@/utils/format/number';
import Big from 'big.js';
import { Options } from '@layerzerolabs/lz-v2-utilities';
import { LZ_RECEIVE_VALUE } from '@/services/usdt0/config';
import { addressToBytes32 } from '@/utils/address-validation';
import { getHopMsgFee } from '@/services/usdt0/hop-composer';
import { ethers } from 'ethers';

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

      // Create forward payload with memo if provided
      let forwardPayload = beginCell().endCell(); // empty payload reference
      if (memo) {
        forwardPayload = beginCell()
          .storeUint(0, 32) // op code for comment
          .storeStringTail(memo) // memo text
          .endCell();
      }

      const body = beginCell()
        .storeUint(0xf8a7ea5, 32) // Jetton transfer op code
        .storeUint(0, 64) // query_id
        .storeCoins(BigInt(amount)) // Jetton amount (VarUInteger 16)
        .storeAddress(Address.parse(depositAddress)) // destination
        .storeAddress(Address.parse(this.account)) // response_destination
        .storeUint(0, 1) // custom_payload:(Maybe ^Cell)
        .storeCoins(0) // forward_ton_amount (VarUInteger 16) - if >0, will send notification message
        .storeBit(1) // forward_payload:(Either Cell ^Cell) - as a reference
        .storeRef(forwardPayload)
        .endCell();

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
    const { fromToken } = data;

    // TON uses fixed fees: native transfer ~0.01 TON, jetton transfer ~0.02 TON
    // 1 TON = 10^9 nanotons
    let estimateGas: bigint;

    if (this.isNativeToken(fromToken.symbol)) {
      estimateGas = toNano("0.02");
    } else {
      estimateGas = toNano("0.06");
    }

    // Increase fee by 20% to provide buffer
    estimateGas = (estimateGas * 120n) / 100n;

    return {
      gasLimit: estimateGas,
      gasPrice: 1n, // TON has no gas price concept, use 1 for compatibility
      estimateGas,
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
    return result.boc;
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

  async quoteOneClickProxy(params: any) { }
}
