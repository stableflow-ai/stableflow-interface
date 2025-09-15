export default class TronWallet {
  private tronWeb: any;

  constructor() {
    this.tronWeb = (window as any).tronWeb;
  }

  async waitForTronWeb() {
    return new Promise((resolve, reject) => {
      if (this.tronWeb && this.tronWeb.ready) {
        resolve(this.tronWeb);
        return;
      }

      const checkTronWeb = () => {
        if ((window as any).tronWeb && (window as any).tronWeb.ready) {
          this.tronWeb = (window as any).tronWeb;
          resolve(this.tronWeb);
        } else {
          setTimeout(checkTronWeb, 100);
        }
      };

      checkTronWeb();

      setTimeout(() => {
        reject(new Error("TronWeb initialization timeout"));
      }, 10000);
    });
  }

  async transfer(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
  }) {
    const { originAsset, depositAddress, amount } = data;

    await this.waitForTronWeb();

    if (originAsset === "TRX" || originAsset === "trx") {
      return await this.transferTRX(depositAddress, amount);
    }

    // Transfer TRC20 token (USDT, USDC, etc.)
    return await this.transferToken(originAsset, depositAddress, amount);
  }

  async transferTRX(to: string, amount: string) {
    await this.waitForTronWeb();

    const transaction = await this.tronWeb.transactionBuilder.sendTrx(
      to,
      this.tronWeb.toSun(amount)
    );

    const signedTransaction = await this.tronWeb.trx.sign(transaction);
    const result = await this.tronWeb.trx.sendRawTransaction(signedTransaction);

    return result.txid;
  }

  async transferToken(contractAddress: string, to: string, amount: string) {
    await this.waitForTronWeb();

    // Get contract instance
    const contract = await this.tronWeb.contract().at(contractAddress);

    // Convert amount to proper format (assuming 6 decimals for USDT/USDC)
    const amountInSun = this.tronWeb.toSun(amount);

    // Call transfer function
    const transaction = await contract.transfer(to, amountInSun).send();

    return transaction.txid;
  }

  async getBalance(token: string, account: string) {
    await this.waitForTronWeb();

    if (token === "TRX" || token === "trx") {
      return await this.getTRXBalance(account);
    }

    return await this.getTokenBalance(token, account);
  }

  async getTRXBalance(account: string) {
    await this.waitForTronWeb();

    const balance = await this.tronWeb.trx.getBalance(account);
    return this.tronWeb.fromSun(balance);
  }

  async getTokenBalance(contractAddress: string, account: string) {
    await this.waitForTronWeb();

    try {
      const contract = await this.tronWeb.contract().at(contractAddress);
      const balance = await contract.balanceOf(account).call();

      // Convert from smallest unit to token unit (assuming 6 decimals)
      return this.tronWeb.fromSun(balance.toString());
    } catch (error) {
      console.error("Error getting token balance:", error);
      return "0";
    }
  }

  async balanceOf(token: string, account: string) {
    return await this.getBalance(token, account);
  }
}
