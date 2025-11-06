import { Aptos, AptosConfig, Network, parseTypeTag, TypeTagAddress, TypeTagU64, type EntryFunctionABI } from "@aptos-labs/ts-sdk";

export default class AptosWallet {
  connection: any;
  private account: any | null;
  private aptos: Aptos;
  private signAndSubmitTransaction: any;
  private isMobile: boolean;

  constructor(options: { account: any | null; signAndSubmitTransaction: any; isMobile?: boolean; }) {
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
          sender: this.account?.address?.toString(),
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
          sender: this.account?.address?.toString(),
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

  async getBalance(token: string, account: string) {
    if (token === "APT" || token === "apt" || token === "native") {
      return await this.getAPTBalance(account);
    }
    return await this.getTokenBalance(token, account);
  }

  async balanceOf(token: string, account: string) {
    return await this.getBalance(token, account);
  }

  /**
   * Estimate gas limit for transfer transaction
   * @param data Transfer data
   * @returns Gas limit estimate, gas price, and estimated gas cost
   */
  async estimateTransferGas(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
  }): Promise<{
    gasLimit: bigint;
    gasPrice: bigint;
    estimateGas: bigint;
  }> {
    if (!this.account) {
      throw new Error("Wallet not connected");
    }

    const { originAsset, depositAddress, amount } = data;
    const isOriginNative = originAsset === "APT" || originAsset === "apt";
    const sender = this.account?.address?.toString();
    
    if (!sender) {
      throw new Error("Invalid sender address");
    }

    // Get signer public key for simulation
    // The account object from wallet adapter should have publicKey or we can derive it from address
    let signerPublicKey: any;
    if (this.account.publicKey) {
      signerPublicKey = this.account.publicKey;
    } else if (this.account.address) {
      // If publicKey is not available, we can use the address as PublicKey for simulation
      // Aptos SDK can handle this in some cases, but ideally we need the actual public key
      signerPublicKey = this.account.address;
    } else {
      throw new Error("Unable to get signer public key");
    }

    // For simulation, we might need to use a smaller amount if balance is insufficient
    // First try with the actual amount, if it fails due to insufficient balance, use a minimal amount
    let simulationAmount = amount;
    let useMinimalAmount = false;
  
    try {
      // Check balance first for APT transfers
      if (isOriginNative) {
        try {
          const balance = await this.aptos.getAccountAPTAmount({
            accountAddress: sender,
          });
          const amountBigInt = BigInt(amount);
          // If amount exceeds balance, use a minimal amount for estimation (1 octa)
          if (amountBigInt > balance) {
            simulationAmount = "1";
            useMinimalAmount = true;
          }
        } catch (error) {
          // If balance check fails, try with minimal amount
          simulationAmount = "1";
          useMinimalAmount = true;
        }
      }
    } catch (error) {
      // If check fails, proceed with original amount
    }

    let rawTxn;
    if (isOriginNative) {
      // For APT, ensure amount is in octas (smallest unit)
      // If amount might be in APT units, convert it, but typically it's already in octas
      rawTxn = await this.aptos.transaction.build.simple({
        sender,
        data: {
          function: "0x1::coin::transfer",
          typeArguments: ["0x1::aptos_coin::AptosCoin"],
          functionArguments: [depositAddress, simulationAmount],
        },
      });
    } else {
      rawTxn = await this.aptos.transaction.build.simple({
        sender,
        data: {
          function: "0x1::primary_fungible_store::transfer",
          typeArguments: ["0x1::fungible_asset::Metadata"],
          functionArguments: [originAsset, depositAddress, simulationAmount],
        },
      });
    }
  
    let simulation: any;
    try {
      const simulationResult = await this.aptos.transaction.simulate.simple({
        signerPublicKey,
        transaction: rawTxn,
        options: {
          estimateGasUnitPrice: true,
          estimateMaxGasAmount: true,
          estimatePrioritizedGasUnitPrice: true,
        },
      });
      simulation = simulationResult[0];
    } catch (error: any) {
      // If simulation fails with insufficient balance and we haven't tried minimal amount, retry
      if (!useMinimalAmount && (error.message?.includes("INSUFFICIENT_BALANCE") || error.message?.includes("EINSUFFICIENT_BALANCE"))) {
        simulationAmount = isOriginNative ? "1" : "1";
        // Rebuild transaction with minimal amount
        if (isOriginNative) {
          rawTxn = await this.aptos.transaction.build.simple({
            sender,
            data: {
              function: "0x1::coin::transfer",
              typeArguments: ["0x1::aptos_coin::AptosCoin"],
              functionArguments: [depositAddress, simulationAmount],
            },
          });
        } else {
          rawTxn = await this.aptos.transaction.build.simple({
            sender,
            data: {
              function: "0x1::primary_fungible_store::transfer",
              typeArguments: ["0x1::fungible_asset::Metadata"],
              functionArguments: [originAsset, depositAddress, simulationAmount],
            },
          });
        }
        
        const simulationResult = await this.aptos.transaction.simulate.simple({
          signerPublicKey,
          transaction: rawTxn,
          options: {
            estimateGasUnitPrice: true,
            estimateMaxGasAmount: true,
            estimatePrioritizedGasUnitPrice: true,
          },
        });
        simulation = simulationResult[0];
      } else {
        throw error;
      }
    }
  
    if (!simulation.success) {
      // If simulation still fails, return default values
      const defaultGasLimit = isOriginNative ? 2400n : 6000n; // 2000 * 1.2 or 5000 * 1.2
      const defaultGasPrice = 100n; // 100 octas per gas unit
      const defaultEstimateGas = defaultGasLimit * defaultGasPrice;
      
      console.warn(`Simulation failed: ${simulation.vm_status}, using default gas estimates`);
      return {
        gasLimit: defaultGasLimit,
        gasPrice: defaultGasPrice,
        estimateGas: defaultEstimateGas,
      };
    }
  
    const gasUsed = BigInt(simulation.gas_used || 0);
    const gasLimit = (gasUsed * 150n) / 100n;
  
    const gasPrice = BigInt(simulation.gas_unit_price || 100);
  
    const estimateGas = gasLimit * gasPrice;
  
    return {
      gasLimit,
      gasPrice,
      estimateGas,
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
