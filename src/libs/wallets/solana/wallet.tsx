import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
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
import { chainsRpcUrls } from "@/config/chains";
import { addressToBytes32, Options } from "@layerzerolabs/lz-v2-utilities";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, transactionBuilder, type AddressLookupTableInput, type Umi } from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey, toWeb3JsPublicKey, toWeb3JsTransaction } from "@metaplex-foundation/umi-web3js-adapters";
import { oft } from "@layerzerolabs/oft-v2-solana-sdk";
import {
  fetchAddressLookupTable,
} from "@metaplex-foundation/mpl-toolbox";

const getAddressLookupTable = async (_lookupTableAddress: string | PublicKey, connection: Connection, umi: Umi) => {
  const lookupTableAddress = publicKey(_lookupTableAddress)
  const addressLookupTableInput: AddressLookupTableInput = await fetchAddressLookupTable(umi, lookupTableAddress)
  if (!addressLookupTableInput) {
      throw new Error(`No address lookup table found for ${lookupTableAddress}`)
  }
  const { value: lookupTableAccount } = await connection.getAddressLookupTable(toWeb3JsPublicKey(lookupTableAddress))
  if (!lookupTableAccount) {
      throw new Error(`No address lookup table account found for ${lookupTableAddress}`)
  }
  return { lookupTableAddress, addressLookupTableInput, lookupTableAccount }
}

const getDefaultAddressLookupTable = async (connection: Connection, umi: Umi) => {
  // Lookup Table Address and Priority Fee Calculation
  const lookupTableAddress = publicKey("AokBxha6VMLLgf97B5VYHEtqztamWmYERBmmFvjuTzJB");
  return getAddressLookupTable(lookupTableAddress, connection, umi);
}

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
      originLayerzeroAddress,
      fromToken,
      dstEid,
      recipient,
      amountWei,
      payInLzToken,
      slippageTolerance,
    } = params;

    console.log("params: %o", params);

    if (!this.publicKey) {
      throw new Error("Wallet not connected");
    }

    // Create UMI instance
    const umi = createUmi(this.connection.rpcEndpoint);

    // Create signer from wallet
    const signerPublicKey = fromWeb3JsPublicKey(this.publicKey);
    const signer = {
      publicKey: signerPublicKey,
      signMessage: async () => {
        throw new Error("signMessage not implemented");
      },
      signTransaction: async (transaction: any) => {
        const web3Tx = toWeb3JsTransaction(transaction);
        const signed = await this.signTransaction(web3Tx);
        return signed;
      },
      signAllTransactions: async (transactions: any[]) => {
        const web3Txs = transactions.map(toWeb3JsTransaction);
        const signed = await Promise.all(web3Txs.map(tx => this.signTransaction(tx)));
        return signed;
      }
    } as any;

    const mint = new PublicKey(fromToken.contractAddress);
    const programId = new PublicKey(originLayerzeroAddress);

    // Get token escrow (OFT store escrow)
    // Priority: 1. params.tokenEscrow 2. Fetch from OFT store dynamically
    // Fetch OFT store account to get the actual tokenEscrow
    const oftStoreInfo = await oft.accounts.fetchOFTStore(umi, publicKey("5FEMXXjueR7y6Z1uVDxTm4ZZXFp6XnxR1Xu1WmvwjxBF"));
    console.log("Fetch OFT store account to get the actual tokenEscrow: %o", oftStoreInfo);
    const mintPk = new PublicKey(oftStoreInfo.tokenMint)
    const escrowPk = new PublicKey(oftStoreInfo.tokenEscrow)
    console.log("Fetched tokenEscrow from OFT store mintPk:", mintPk.toBase58());
    console.log("Fetched tokenEscrow from OFT store escrowPk:", escrowPk.toBase58());

    // Get token source (user's token account)
    const tokenSource = getAssociatedTokenAddressSync(mint, this.publicKey);

    // Convert recipient address to bytes32
    // recipient could be EVM address (0x...), Tron address (T...), or Solana address
    // const recipientBytes32Hex: any = addressToBytes32(params.toToken.chainType, recipient);
    // console.log("recipientBytes32Hex:", recipientBytes32Hex);

    // if (recipient.startsWith('0x')) {
    //   // EVM address - pad to 32 bytes (left-pad with zeros)
    //   recipientBytes32Hex = zeroPadValue(recipient, 32);
    // } else if (recipient.startsWith('T') && recipient.length >= 34) {
    //   // Tron address - convert using tronAddressToBytes32
    //   recipientBytes32Hex = tronAddressToBytes32(recipient);
    // } else {
    //   // Assume Solana address - convert using solanaAddressToBytes32
    //   try {
    //     recipientBytes32Hex = solanaAddressToBytes32(recipient);
    //   } catch (error) {
    //     // If it fails, try to use addressToBytes32 with toToken chainType if available
    //     if (params.toToken?.chainType) {
    //       const converted = addressToBytes32(params.toToken.chainType, recipient);
    //       if (converted) {
    //         recipientBytes32Hex = converted;
    //       } else {
    //         throw new Error(`Invalid recipient address format: ${recipient}. Expected EVM (0x...), Tron (T...), or Solana address.`);
    //       }
    //     } else {
    //       throw new Error(`Invalid recipient address format: ${recipient}. Expected EVM (0x...), Tron (T...), or Solana address.`);
    //     }
    //   }
    // }

    // const recipientBytes32 = Buffer.from(
    //   recipientBytes32Hex.slice(2),
    //   'hex'
    // );
    // console.log("recipientBytes32:", recipientBytes32);

    // Calculate minAmountLd based on slippage tolerance
    const amountLd = BigInt(amountWei);
    const slippage = slippageTolerance || 0.01; // Default 1% slippage
    const minAmountLd = amountLd - (amountLd * BigInt(Math.floor(slippage * 10000)) / 10000n);

    // Create Options if needed
    const options = Options.newOptions();
    const optionsBytes = options.toBytes();

    const sendParam = {
      dstEid,
      to: Buffer.from(addressToBytes32(recipient)),
      amountLd: amountLd,
      minAmountLd: minAmountLd,
      options: optionsBytes,
      composeMsg: undefined,
    }

    const lookupTableAddresses = [(await getDefaultAddressLookupTable(this.connection, umi)).lookupTableAddress];
    console.log("lookupTableAddresses: %o", lookupTableAddresses);
    console.log("this.publicKey: %o", this.publicKey.toBase58());

    // Get MessagingFee using quote
    // Note: peerAddr will be automatically fetched from peer config by the SDK
    // If peer config doesn't exist, it means the peer hasn't been configured yet
    const { nativeFee, lzTokenFee } = await oft.quote(
      umi.rpc,
      {
        payer: fromWeb3JsPublicKey(this.publicKey),
        tokenMint: fromWeb3JsPublicKey(mintPk),
        tokenEscrow: fromWeb3JsPublicKey(escrowPk),
      },
      {
        ...sendParam,
        payInLzToken,
      },
      {
        oft: publicKey(programId),
      },
      [],
      lookupTableAddresses
    );

    console.log("MessagingFee - nativeFee:", nativeFee.toString(), "lzTokenFee:", lzTokenFee.toString());

    // Create send transaction
    // Note: peerAddr will be automatically fetched from peer config by the SDK
    const wrappedInstruction = await oft.send(
      umi.rpc,
      {
        payer: signer as any,
        tokenMint: fromWeb3JsPublicKey(mintPk),
        tokenEscrow: fromWeb3JsPublicKey(escrowPk),
        tokenSource: fromWeb3JsPublicKey(tokenSource),
      },
      {
        nativeFee,
        ...sendParam,
      },
      {
        oft: fromWeb3JsPublicKey(programId),
        token: publicKey(mint)
      }
    );

    // Build transaction from wrapped instruction using TransactionBuilder
    const txBuilder = transactionBuilder().add(wrappedInstruction);
    const transaction = await txBuilder.build(umi);

    return {
      transaction,
      nativeFee: nativeFee.toString(),
      lzTokenFee: lzTokenFee.toString(),
      wrappedInstruction,
    };
  }

  async sendTransaction(params: any) {
    const { transaction } = params;

    if (!this.publicKey) {
      throw new Error("Wallet not connected");
    }

    if (!transaction) {
      throw new Error("Transaction is required");
    }

    // Convert UMI transaction to Web3.js transaction
    const web3Tx = toWeb3JsTransaction(transaction);

    // Sign the transaction
    const signedTransaction = await this.signTransaction(web3Tx);

    // Send the transaction
    const signature = await this.connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        maxRetries: 3,
      }
    );

    console.log("Transaction sent with signature:", signature);

    // Confirm the transaction
    const confirmation = await this.connection.confirmTransaction(
      signature,
      "confirmed"
    );

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    return signature;
  }
}
