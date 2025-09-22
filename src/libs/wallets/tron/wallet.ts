export default class TronWallet {
  private tronWeb: any;

  constructor() {
    this.tronWeb = (window as any).tronWeb;
  }

  async waitForTronWeb() {
    return new Promise((resolve, reject) => {
      if (this.tronWeb) {
        resolve(this.tronWeb);
        return;
      }

      const checkTronWeb = () => {
        if ((window as any).tronWeb) {
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

    // Call transfer function
    const transaction = await contract.transfer(to, amount).send({
      feeLimit: 100_000_000
    });

    return transaction;
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
    return balance.toString();
  }

  async getTokenBalance(contractAddress: string, account: string) {
    await this.waitForTronWeb();

    try {
      const contract = await this.tronWeb.contract().at(contractAddress);
      const balance = await contract.balanceOf(account).call();

      // Convert from smallest unit to token unit (assuming 6 decimals)
      return balance.toString();
    } catch (error) {
      console.error("Error getting token balance:", error);
      return "0";
    }
  }

  async balanceOf(token: string, account: string) {
    return await this.getBalance(token, account);
  }
}

export class OKXTronWallet {
  private account: string; // Currently connected account address
  private signAndSendTransaction: any;
  private tronWeb: any;

  constructor(options: any) {
    this.signAndSendTransaction = options.signAndSendTransaction;
    this.account = options.account;
    this.tronWeb = options.tronWeb;
  }

  // Get currently connected account address
  getAccount(): string {
    return this.account;
  }

  async transfer(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
  }) {
    const { originAsset, depositAddress, amount } = data;

    if (originAsset === "TRX" || originAsset === "trx") {
      return this.transferTRX(depositAddress, amount);
    }

    // Transfer TRC20 token (USDT, USDC, etc.)
    return await this.transferToken(originAsset, depositAddress, amount);
  }

  async transferTRX(to: string, amount: string) {
    // Build TRX transfer transaction
    const transaction = await this.tronWeb.transactionBuilder.sendTrx(
      to,
      this.tronWeb.toSun(amount),
      this.account
    );

    // Sign and send transaction using the provided signAndSendTransaction method
    const result = await this.signAndSendTransaction(transaction);

    return result;
  }

  async transferToken(contractAddress: string, to: string, amount: string) {
    // Set the default address for TronWeb
    this.tronWeb.setAddress(this.account);

    // Load TRC20 contract
    const contract = await this.tronWeb.contract().at(contractAddress);

    // Build transfer transaction
    const transaction = await contract.transfer(
      to,
      amount
    ).build();

    // Sign and send transaction using the provided signAndSendTransaction method
    const result = await this.signAndSendTransaction(transaction);

    return result;
  }

  async getBalance(token: string, account: string) {
    if (token === "TRX" || token === "trx") {
      return await this.getTRXBalance(account);
    }

    return await this.getTokenBalance(token, account);
  }

  async getTRXBalance(account: string) {
    // Get TRX balance using tronWeb
    const balance = await this.tronWeb.trx.getBalance(account);
    return balance.toString();
  }

  async getTokenBalance(contractAddress: string, account: string) {
    try {
      // Set the default address for TronWeb
      this.tronWeb.setAddress(account);

      // Get contract instance
      const contract = await this.tronWeb.contract().at(contractAddress);

      // Call balanceOf method to get token balance
      const balance = await contract.balanceOf(account).call();

      // Return balance as string
      return balance.toString();
    } catch (error) {
      console.log("Error getting token balance:", error);
      return "0";
    }
  }

  async balanceOf(token: string, account: string) {
    return await this.getBalance(token, account);
  }
}
