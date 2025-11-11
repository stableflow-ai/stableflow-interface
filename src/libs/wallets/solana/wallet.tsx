import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getAccount,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync
} from "@solana/spl-token";
import { chainsRpcUrls } from "@/config/chains";
import { addressToBytes32 } from "@layerzerolabs/lz-v2-utilities";

export default class SolanaWallet {
  connection: Connection;
  private publicKey: PublicKey | null;
  private signTransaction: any;

  constructor(options: { publicKey: PublicKey | null; signTransaction: any }) {
    // https://api.mainnet-beta.solana.com
    // https://mainnet.helius-rpc.com/?api-key=28fc7f18-acf0-48a1-9e06-bd1b6cba1170
    // this.connection = new Connection(
    //   "https://mainnet.helius-rpc.com/?api-key=28fc7f18-acf0-48a1-9e06-bd1b6cba1170",
    //   "confirmed"
    // );
    this.connection = new Connection(
      chainsRpcUrls["Solana"],
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

  async getBalance(token: any, account: string) {
    if (token.symbol === "SOL" || token.symbol === "sol" || token.symbol === "native") {
      return await this.getSOLBalance(account);
    }
    return await this.getTokenBalance(token.contractAddress, account);
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

    // Solana transaction fees are typically fixed at 5000 lamports per signature
    // Base fee per signature: 5000 lamports
    let estimatedFee = 5000n;

    const { originAsset, depositAddress } = data;

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

    return {
      gasLimit: estimatedFee,
      gasPrice: 1n,
      estimateGas: estimatedFee,
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
          maxSupportedTransactionVersion: 0,
        });

        if (tx) {
          if (tx.meta && tx.meta.err === null) {
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

  async simulateIx(ix: any) {
    const tx = new Transaction().add(ix);

    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = this.publicKey!;

    // Convert Transaction to VersionedTransaction to use config options
    const message = tx.compileMessage();
    const versionedTx = new VersionedTransaction(message);

    const sim = await this.connection.simulateTransaction(versionedTx, {
      commitment: "confirmed",
      sigVerify: false,
    });

    if (sim.value.err) console.error('Error:', sim.value.err);

    console.log("sim: %o", sim);

    return sim.value;
  }

  async quoteOFT(params: any) {
    const {
      idl,
      originLayerzeroAddress,
      fromToken,
      toToken,
      dstEid,
      recipient,
      amountWei,
      payInLzToken,
    } = params;

    console.log("params: %o", params);

    if (!this.publicKey) {
      throw new Error("Wallet not connected");
    }

    // Create a wallet object that conforms to the Anchor Wallet interface
    const wallet = {
      publicKey: this.publicKey,
      signTransaction: this.signTransaction,
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
        const signedTxs: T[] = [];
        for (const tx of txs) {
          const signedTx = await this.signTransaction(tx);
          signedTxs.push(signedTx as T);
        }
        return signedTxs;
      }
    };

    // Create AnchorProvider
    const provider = new AnchorProvider(
      this.connection,
      wallet,
      {
        commitment: "confirmed"
      }
    );

    const creditsPubkey = new PublicKey("6zcTrmdkiQp6dZHYUxVr6A2XVDSYi44X1rcPtvwNcrXi");
    const peerPubkey = new PublicKey("5FEMXXjueR7y6Z1uVDxTm4ZZXFp6XnxR1Xu1WmvwjxBF");
    const oftStorePubkey = new PublicKey("HyXJcgYpURfDhgzuyRL7zxP4FhLg7LZQMeDrR4MXZcMN");
    const mint = new PublicKey(fromToken.contractAddress);
    const programId = new PublicKey(originLayerzeroAddress);

    // Ensure IDL has address field set to programId
    if (idl && !idl.address) {
      idl.address = programId.toBase58();
    }

    // Create Program - Anchor will use the address from IDL or we can pass programId
    const program = new Program(idl, provider);

    // 2. quote send
    const sendParam: any = {
      dst_eid: dstEid,
      to: Buffer.from(addressToBytes32(recipient)),
      amount_ld: amountWei,
      min_amount_ld: "0",
      extra_options: "0x0003",
      compose_msg: "0x",
      pay_in_lz_token: payInLzToken,
    };

    // Build instruction
    const quoteOftIx = await program.methods.quoteOft(sendParam)
      .accounts({
        oftStore: oftStorePubkey,
        credits: creditsPubkey,
        peer: peerPubkey,
      })
      .instruction();
    console.log("quoteOftIx: %o", quoteOftIx);
    const quoteOftResult = await this.simulateIx(quoteOftIx);
    console.log("quoteOftIxResult: %o", JSON.stringify(quoteOftResult));

    const quoteSendIx = await program.methods.quoteSend()
      .accounts({
        oftStore: oftStorePubkey,
        credits: creditsPubkey,
        peer: peerPubkey,
      })
      .instruction();
    const quoteSendResult = await this.simulateIx(quoteSendIx);
    console.log("quoteSendResult: %o", JSON.stringify(quoteSendResult));

    // Parse return data
    // let messagingFee = null;
    // let legacyMeshFee = null;
    // let estimatedSourceGas = null;

    // if (simulation.value?.returnData?.data) {
    //   const returnDataBase64 = simulation.value.returnData.data[0];
    //   try {
    //     // Decode base64 to buffer
    //     const buffer = Buffer.from(returnDataBase64, "base64");

    //     // Parse the data structure (assuming little-endian u64 values)
    //     // Based on the example: "AAAAAAAAAACIupfmRwAAAAAAAABAQg8AAAAAABRBDwAAAAAA"
    //     // This appears to be 32 bytes (4 u64 values)
    //     if (buffer.length >= 32) {
    //       // Read u64 values (8 bytes each, little-endian)
    //       const readU64 = (offset: number) => {
    //         const slice = buffer.slice(offset, offset + 8);
    //         return slice.readBigUInt64LE(0);
    //       };

    //       // First 8 bytes might be a status/flag (skip)
    //       // Next 8 bytes: Messaging Fee (in lamports, convert to SOL)
    //       const messagingFeeLamports = readU64(8);
    //       messagingFee = Number(messagingFeeLamports) / LAMPORTS_PER_SOL;

    //       // Next 8 bytes: Legacy Mesh Fee (in token smallest unit, convert based on decimals)
    //       const legacyMeshFeeRaw = readU64(16);
    //       // Assuming 6 decimals for USDT
    //       legacyMeshFee = Number(legacyMeshFeeRaw) / 1_000_000;

    //       // Next 8 bytes: Estimated Source Gas
    //       estimatedSourceGas = Number(readU64(24));
    //     }
    //   } catch (error) {
    //     console.error("Failed to parse return data:", error);
    //   }
    // }

    return {
      // messagingFee,
      // legacyMeshFee,
      // estimatedSourceGas,
      // simulation,
    };
  }
}
