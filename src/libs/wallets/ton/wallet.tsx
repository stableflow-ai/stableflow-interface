import { Address, beginCell, toNano, TonClient } from '@ton/ton';
import type { TupleItem } from '@ton/ton';
import { TonConnectUI } from '@tonconnect/ui-react';

export default class TonWallet {
  private tonConnectUI: TonConnectUI;
  private tonClient: TonClient;
  private account: string;

  constructor(options: { tonConnectUI: TonConnectUI; tonClient: TonClient; account: string; }) {
    this.tonConnectUI = options.tonConnectUI;
    this.tonClient = options.tonClient;
    this.account = options.account;
  }

  // Check if the token is native TON
  private isNativeToken(originAsset: string): boolean {
    const lowerAsset = originAsset.toLowerCase();
    return lowerAsset === "ton";
  }

  async getSenderJettonWallet(masterAddress: string) {
    try {
      const jettonMasterAddress = Address.parse(masterAddress);
      const owner = Address.parse(this.account);

      const ownerCell = beginCell().storeAddress(owner).endCell();
      const stack: TupleItem[] = [{ type: 'slice', cell: ownerCell }];

      const response = await this.tonClient.runMethod(jettonMasterAddress, "get_wallet_address", stack);

      const jettonWalletCell = response.stack.readCell();
      const jettonWalletAddress = jettonWalletCell.beginParse().loadAddress();

      return jettonWalletAddress;
    } catch (error) {
      console.error("get sender jetton wallet error: %o", error);
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

  async getBalance(token: string, account: string) {
    try {
      if (this.isNativeToken(token)) {
        const parsedAddress = Address.parse(account);
        const accountState = await this.tonClient.getBalance(parsedAddress);
        return accountState.toString();
      }
      const tokenJettonWallet = await this.getSenderJettonWallet(token);
      console.log("tokenJettonWallet: %o", tokenJettonWallet.toString());
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
}
