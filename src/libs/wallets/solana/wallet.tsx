import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getAccount,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync
} from "@solana/spl-token";

export default class SolanaWallet {
  connection: any;
  private publicKey: PublicKey | null;
  private signTransaction: any;

  constructor(options: { publicKey: PublicKey | null; signTransaction: any }) {
    // https://api.mainnet-beta.solana.com
    // https://mainnet.helius-rpc.com/?api-key=28fc7f18-acf0-48a1-9e06-bd1b6cba1170
    this.connection = new Connection(
      "https://mainnet.helius-rpc.com/?api-key=28fc7f18-acf0-48a1-9e06-bd1b6cba1170",
      "confirmed"
    );
    this.publicKey = options.publicKey;
    this.signTransaction = options.signTransaction;
  }

  // Transfer SOL
  async transferSOL(to: string, amount: string) {
    if (!this.publicKey) {
      throw new Error("Wallet not connected");
    }

    const fromPubkey = this.publicKey;
    const toPubkey = new PublicKey(to);
    const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports
      })
    );

    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    const signedTransaction = await this.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    await this.connection.confirmTransaction(signature);
    return signature;
  }

  // Transfer SPL token
  async transferToken(tokenMint: string, to: string, amount: string) {
    if (!this.publicKey) {
      throw new Error("Wallet not connected");
    }

    const fromPubkey = this.publicKey;
    const toPubkey = new PublicKey(to);
    const mint = new PublicKey(tokenMint);

    // Get associated token account addresses
    const fromTokenAccount = getAssociatedTokenAddressSync(mint, fromPubkey);
    const toTokenAccount = getAssociatedTokenAddressSync(mint, toPubkey);

    const transaction = new Transaction();

    // Check if recipient has token account, create if not
    try {
      await getAccount(this.connection, toTokenAccount);
    } catch (error) {
      // If token account doesn't exist, create it
      transaction.add(
        createAssociatedTokenAccountInstruction(
          fromPubkey, // payer
          toTokenAccount, // ata
          toPubkey, // owner
          mint // mint
        )
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromPubkey,
        BigInt(amount),
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    const signedTransaction = await this.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    await this.connection.confirmTransaction(signature);

    return signature;
  }

  // Generic transfer method
  async transfer(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
  }) {
    const { originAsset, depositAddress, amount } = data;

    // Transfer SOL
    if (originAsset === "SOL" || originAsset === "sol") {
      return await this.transferSOL(depositAddress, amount);
    }

    // Transfer SPL token
    const result = await this.transferToken(
      originAsset,
      depositAddress,
      amount
    );
    return result;
  }

  async getSOLBalance(account: string) {
    const publicKey = new PublicKey(account);
    const balance = await this.connection.getBalance(publicKey);
    return balance;
  }

  async getTokenBalance(tokenMint: string, account: string) {
    const mint = new PublicKey(tokenMint);
    const owner = new PublicKey(account);

    try {
      const tokenAccount = await getAssociatedTokenAddress(mint, owner);

      const accountInfo = await getAccount(this.connection, tokenAccount);

      return accountInfo.amount;
    } catch (error: any) {
      if (error.message.includes("could not find account")) {
        return 0;
      }
      throw error;
    }
  }

  async getBalance(token: string, account: string) {
    if (token === "SOL" || token === "sol" || token === "native") {
      return await this.getSOLBalance(account);
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
  async estimateGas(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
  }): Promise<{
    gasLimit: bigint;
    gasPrice: bigint;
    estimateGas: bigint;
  }> {
    if (!this.publicKey) {
      throw new Error("Wallet not connected");
    }

    const { originAsset, depositAddress } = data;

    // Solana transaction fees are typically fixed at 5000 lamports per signature
    // Base fee per signature: 5000 lamports
    let estimatedFee = 5000n;
    
    // Check if token account creation is needed for SPL tokens
    if (originAsset !== "SOL" && originAsset !== "sol") {
      const mint = new PublicKey(originAsset);
      const toPubkey = new PublicKey(depositAddress);
      const toTokenAccount = getAssociatedTokenAddressSync(mint, toPubkey);

      // Check if recipient has token account
      try {
        await getAccount(this.connection, toTokenAccount);
        // Account exists, no additional fee
      } catch (error) {
        // Account doesn't exist, will need to create it (additional fee)
        estimatedFee += 5000n;
      }
    }

    // Increase by 20% to provide buffer
    const gasLimit = (estimatedFee * 120n) / 100n;

    // Solana has a fixed fee per signature (5000 lamports)
    // For gasPrice, we use 1 since the fee is already included in gasLimit
    const gasPrice = 1n;

    // Calculate estimated gas cost: gasLimit * gasPrice (same as gasLimit for Solana)
    const estimateGas = gasLimit * gasPrice;

    return {
      gasLimit,
      gasPrice,
      estimateGas
    };
  }

  async checkTransactionStatus(signature: string) {
    const maxAttempts = 30;
    const interval = 4000;
    let timer: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const tx = await this.connection.getTransaction(signature, {
          commitment: "finalized",
          encoding: "json",
          maxSupportedTransactionVersion: 0,
        });

        if (tx) {
          if (tx.meta.err === null) {
            return true;
          } else {
            return false;
          }
        } else {
          console.log(`polling attempt ${attempt}/${maxAttempts}: transaction not confirmed...`);
        }
      } catch (error: any) {
        console.log("checkTransactionStatus failed:", error.message);
      }

      await new Promise((resolve) => {
        timer = setTimeout(() => {
          clearTimeout(timer);
          resolve(true);
        }, interval);
      });
    }

    console.log("checkTransactionStatus failed: timeout");
    return false;
  }
}
