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
  selector: any;
  constructor(_selector: any) {
    this.selector = _selector;
  }

  // Transfer SOL
  async transferSOL(to: string, amount: string) {
    const solana = (window as any).solana;
    if (!solana || !solana.account) {
      throw new Error("Wallet not connected");
    }

    const connection = new Connection("https://api.mainnet-beta.solana.com");
    const fromPubkey = new PublicKey(solana.account);
    const toPubkey = new PublicKey(to);
    const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    const signedTransaction = await solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    await connection.confirmTransaction(signature);
    return signature;
  }

  // Transfer SPL token
  async transferToken(tokenMint: string, to: string, amount: string) {
    const solana = (window as any).solana;
    if (!solana || !solana.account) {
      throw new Error("Wallet not connected");
    }

    const connection = new Connection("https://api.mainnet-beta.solana.com");
    const fromPubkey = new PublicKey(solana.account);
    const toPubkey = new PublicKey(to);
    const mint = new PublicKey(tokenMint);

    // Get associated token account addresses
    const fromTokenAccount = getAssociatedTokenAddressSync(mint, fromPubkey);
    const toTokenAccount = getAssociatedTokenAddressSync(mint, toPubkey);

    const transaction = new Transaction();

    // Check if recipient has token account, create if not
    try {
      await getAccount(connection, toTokenAccount);
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

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    const signedTransaction = await solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    await connection.confirmTransaction(signature);
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
    return await this.transferToken(originAsset, depositAddress, amount);
  }

  async getSOLBalance(account: string) {
    const connection = new Connection("https://api.mainnet-beta.solana.com");
    const publicKey = new PublicKey(account);
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9;
  }

  async getTokenBalance(tokenMint: string, account: string) {
    const connection = new Connection("https://api.mainnet-beta.solana.com");
    const mint = new PublicKey(tokenMint);
    const owner = new PublicKey(account);

    try {
      const tokenAccount = await getAssociatedTokenAddress(mint, owner);

      const accountInfo = await getAccount(connection, tokenAccount);

      return accountInfo.amount;
    } catch (error: any) {
      if (error.message.includes("could not find account")) {
        return 0;
      }
      throw error;
    }
  }

  async getBalance(token: string, account: string) {
    if (token === "SOL" || token === "sol") {
      return await this.getSOLBalance(account);
    }
    return await this.getTokenBalance(token, account);
  }
}
