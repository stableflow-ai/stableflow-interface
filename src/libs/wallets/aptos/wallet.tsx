import { Aptos, AptosConfig, Network, parseTypeTag, TypeTagAddress, TypeTagU64, type EntryFunctionABI } from "@aptos-labs/ts-sdk";

export default class AptosWallet {
  connection: any;
  private account: string | null;
  private aptos: Aptos;
  private signAndSubmitTransaction: any;
  private isMobile: boolean;

  constructor(options: { account: string | null; signAndSubmitTransaction: any; isMobile?: boolean; }) {
    const config = new AptosConfig({
      network: Network.MAINNET,
    });
    const aptos = new Aptos(config);

    this.aptos = aptos;
    this.signAndSubmitTransaction = options.signAndSubmitTransaction;
    this.account = options.account;
    this.isMobile = options.isMobile || false;
  }

  // Transfer APT
  async transferAPT(to: string, amount: string): Promise<string> {
    if (!this.account) {
      throw new Error("Wallet not connected");
    }

    try {
      // Convert amount to octas (1 APT = 10^8 octas)
      const amountInOctas = Math.floor(parseFloat(amount) * 100000000);

      let result: any;
      if (this.isMobile) {
        const transaction = await this.aptos.transaction.build.simple({
          sender: this.account,
          data: {
            function: "0x1::coin::transfer",
            typeArguments: ["0x1::aptos_coin::AptosCoin"],
            functionArguments: [to, amountInOctas.toString()],
          },
        });
        result = await this.signAndSubmitTransaction(transaction);
      } else {
        // Sign and submit transaction
        result = await this.signAndSubmitTransaction({
          data: {
            function: "0x1::coin::transfer",
            typeArguments: ["0x1::aptos_coin::AptosCoin"],
            functionArguments: [to, amountInOctas.toString()],
          },
        });
      }

      const executedTransaction = await this.aptos.waitForTransaction({ transactionHash: typeof result === "string" ? result : result.hash });
      if (executedTransaction.success !== true) {
        console.log("Transfer APT token failed: %o", executedTransaction);
        throw new Error("Transfer token failed");
      }

      return typeof result === "string" ? result : result.hash;
    } catch (error) {
      console.log("Transfer APT failed:", error);
      throw error;
    }
  }

  // Transfer Fungible Asset token
  async transferToken(contractAddress: string, to: string, amount: string): Promise<string> {
    if (!this.account) {
      throw new Error("Wallet not connected");
    }

    try {
      let result: any;
      if (this.isMobile) {
        const transaction = await this.aptos.transaction.build.simple({
          sender: this.account,
          data: {
            function: "0x1::primary_fungible_store::transfer",
            typeArguments: ["0x1::fungible_asset::Metadata"],
            functionArguments: [contractAddress, to, amount],
            abi: faTransferAbi,
          },
        });
        result = await this.signAndSubmitTransaction(transaction);
      } else {
        result = await this.signAndSubmitTransaction({
          data: {
            function: "0x1::primary_fungible_store::transfer",
            typeArguments: ["0x1::fungible_asset::Metadata"],
            functionArguments: [contractAddress, to, amount],
            abi: faTransferAbi,
          },
        });
      }

      const executedTransaction = await this.aptos.waitForTransaction({ transactionHash: typeof result === "string" ? result : result.hash });
      if (executedTransaction.success !== true) {
        console.log("Transfer token failed: %o", executedTransaction);
        throw new Error("Transfer token failed");
      }

      return typeof result === "string" ? result : result.hash;
    } catch (error) {
      console.log("Transfer token failed:", error);
      throw error;
    }
  }

  // Generic transfer method
  async transfer(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
  }): Promise<string> {
    const { originAsset, depositAddress, amount } = data;

    // Transfer APT
    if (originAsset === "APT" || originAsset === "apt") {
      return await this.transferAPT(depositAddress, amount);
    }

    // Transfer SPL token
    const result = await this.transferToken(
      originAsset,
      depositAddress,
      amount
    );
    return result;
  }

  async getAPTBalance(account: string) {
    try {
      const accountAPTAmount = await this.aptos.getAccountAPTAmount({
        accountAddress: account,
      });
      return accountAPTAmount.toString();
    } catch (error) {
      console.log("Get APT balance failed:", error);
      return "0";
    }
  }

  async getTokenBalance(contractAddress: string, account: string) {
    try {
      const balance = await this.aptos.getBalance({
        accountAddress: account,
        asset: contractAddress,
      });
      return balance.toString();
    } catch (error) {
      console.log("Get token balance failed:", error);
      return "0";
    }
  }

  async getBalance(token: any, account: string) {
    if (token.symbol === "APT" || token.symbol === "apt" || token.symbol === "native") {
      return await this.getAPTBalance(account);
    }
    return await this.getTokenBalance(token.contractAddress, account);
  }

  async balanceOf(token: any, account: string) {
    return await this.getBalance(token, account);
  }

  /**
   * Estimate gas limit for transfer transaction
   * @param data Transfer data
   * @returns Gas limit estimate
   */
  async estimateGas(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
  }): Promise<{
    gasLimit: bigint;
  }> {
    if (!this.account) {
      throw new Error("Wallet not connected");
    }

    const { originAsset } = data;

    // Aptos has a maximum gas unit price and gas limit
    // Typical transfer: ~1000-5000 gas units
    // For simplicity, we'll estimate based on transaction type
    let gasLimit: bigint;

    if (originAsset === "APT" || originAsset === "apt") {
      // APT transfer typically uses ~1000-2000 gas units
      gasLimit = 2000n;
    } else {
      // Fungible Asset transfer may use more gas (~3000-5000)
      gasLimit = 5000n;
    }

    // Increase by 20% to provide buffer
    gasLimit = (gasLimit * 120n) / 100n;

    return {
      gasLimit
    };
  }

  async checkTransactionStatus(signature: string) {
    try {
      // Get transaction by hash
      const transaction = await this.aptos.getTransactionByHash({
        transactionHash: signature,
      });

      if (!transaction) {
        return false;
      }

      // Check if transaction is successful by checking the success field
      // The transaction object should have a success property or we can check the status
      return (transaction as any).success === true || (transaction as any).status === "success";
    } catch (error) {
      console.log("Check transaction status failed:", error);
      return false;
    }
  }
}

const faTransferAbi: EntryFunctionABI = {
  typeParameters: [{ constraints: [] }],
  parameters: [parseTypeTag("0x1::object::Object"), new TypeTagAddress(), new TypeTagU64()],
};
