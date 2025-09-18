import { Address, beginCell, toNano, fromNano } from '@ton/ton';
import { TonConnectUI } from '@tonconnect/ui-react';

// FIXME
export default class TonWallet {
  private tonConnectUI: TonConnectUI | null = null;

  constructor(tonConnectUI?: TonConnectUI) {
    this.tonConnectUI = tonConnectUI || null;
  }

  // Check if the token is native TON
  private isNativeToken(originAsset: string): boolean {
    const lowerAsset = originAsset.toLowerCase();
    return lowerAsset === "ton";
  }

  async transfer(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
  }) {
    const { originAsset, depositAddress, amount } = data;

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
      // Build USDT transfer message
      const transferMessage = beginCell()
        .storeUint(0xf8a7ea5, 32) // transfer op
        .storeUint(0, 64) // query_id
        .storeUint(toNano(amount), 64) // amount
        .storeAddress(Address.parse(depositAddress)) // destination
        .storeAddress(Address.parse(depositAddress)) // response_destination
        .storeBit(false) // custom_payload
        .storeCoins(0) // forward_ton_amount
        .storeBit(false) // forward_payload in this slice, not separate cell
        .endCell();

      const transaction = {
        messages: [
          {
            address: originAsset,
            amount: toNano('0.1').toString(), // For gas fees
            payload: transferMessage.toBoc().toString('base64'),
          }
        ],
        validUntil: Math.floor(Date.now() / 1000) + 600,
      };

      const result = await this.tonConnectUI.sendTransaction(transaction);
      return result.boc;
    } catch (error) {
      console.error('TON transfer error:', error);
      throw error;
    }
  }

  async getBalance(token: string, account: string) {
    try {
      if (this.isNativeToken(token)) {
        // Get native TON balance
        const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${account}`);
        const data = await response.json();

        if (data.ok) {
          // Convert nanoTON to TON
          return fromNano(data.result);
        }
        return '0';
      }
      const response = await fetch(`https://toncenter.com/api/v2/runGetMethod`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: token,
          method: 'get_wallet_data',
          stack: [
            ['tvm.Slice', Address.parse(account).toRawString()]
          ]
        })
      });

      const data = await response.json();

      if (data.ok && data.result && data.result.stack) {
        const balance = data.result.stack[0][1];
        // USDT has 6 decimal places
        return (BigInt(balance) / BigInt(1000000)).toString();
      }
      return '0';
    } catch (error) {
      console.error('TON getBalance error:', error);
      return '0';
    }
  }

  async balanceOf(token: string, account: string) {
    return await this.getBalance(token, account);
  }
}
