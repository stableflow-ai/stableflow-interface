import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
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
import { ethers } from "ethers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  publicKey,
  transactionBuilder,
  type AddressLookupTableInput,
  type Umi
} from "@metaplex-foundation/umi";
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
  toWeb3JsTransaction
} from "@metaplex-foundation/umi-web3js-adapters";
import { oft } from "@layerzerolabs/oft-v2-solana-sdk";
import { fetchAddressLookupTable } from "@metaplex-foundation/mpl-toolbox";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import { getPrice } from "@/utils/format/price";
import stableflowProxyIdl from "@/services/oneclick/stableflow-proxy.json";
import cctpProxyIdl from "@/services/cctp/stableflow.json";
import { quoteSignature } from "../utils/cctp";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

const getAddressLookupTable = async (
  _lookupTableAddress: string | PublicKey,
  connection: Connection,
  umi: Umi
) => {
  const lookupTableAddress = publicKey(_lookupTableAddress);
  const addressLookupTableInput: AddressLookupTableInput =
    await fetchAddressLookupTable(umi, lookupTableAddress);
  if (!addressLookupTableInput) {
    throw new Error(`No address lookup table found for ${lookupTableAddress}`);
  }
  const { value: lookupTableAccount } = await connection.getAddressLookupTable(
    toWeb3JsPublicKey(lookupTableAddress)
  );
  if (!lookupTableAccount) {
    throw new Error(
      `No address lookup table account found for ${lookupTableAddress}`
    );
  }
  return { lookupTableAddress, addressLookupTableInput, lookupTableAccount };
};

const getDefaultAddressLookupTable = async (
  connection: Connection,
  umi: Umi
) => {
  // Lookup Table Address and Priority Fee Calculation
  const lookupTableAddress = publicKey(
    "AokBxha6VMLLgf97B5VYHEtqztamWmYERBmmFvjuTzJB"
  );
  return getAddressLookupTable(lookupTableAddress, connection, umi);
};

export default class SolanaWallet {
  connection: Connection;
  private publicKey: PublicKey | null;
  private signTransaction: any;
  private signer: any;

  constructor(options: { publicKey: PublicKey | null; signer: any }) {
    // https://api.mainnet-beta.solana.com
    // https://mainnet.helius-rpc.com/?api-key=28fc7f18-acf0-48a1-9e06-bd1b6cba1170
    // this.connection = new Connection(
    //   "https://mainnet.helius-rpc.com/?api-key=28fc7f18-acf0-48a1-9e06-bd1b6cba1170",
    //   "confirmed"
    // );
    this.connection = new Connection(chainsRpcUrls["Solana"], "confirmed");
    this.publicKey = options.publicKey;
    this.signTransaction = options.signer.signTransaction;
    this.signer = options.signer;
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
    if (
      token.symbol === "SOL" ||
      token.symbol === "sol" ||
      token.symbol === "native"
    ) {
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
      estimateGas: estimatedFee
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
          maxSupportedTransactionVersion: 0
        });

        if (tx) {
          if (tx.meta && tx.meta.err === null) {
            return true;
          } else {
            return false;
          }
        } else {
          console.log(
            `polling attempt ${attempt}/${maxAttempts}: transaction not confirmed...`
          );
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
      // commitment: "confirmed",
      sigVerify: false
    });

    if (sim.value.err) console.error("Error:", sim.value.err);

    console.log("sim: %o", sim);

    return sim.value;
  }

  async quoteOFT(params: any) {
    const {
      originLayerzeroAddress,
      destinationLayerzeroAddress,
      fromToken,
      toToken,
      dstEid,
      recipient,
      amountWei,
      payInLzToken,
      slippageTolerance,
      multiHopComposer,
      isMultiHopComposer
    } = params;

    console.log("params: %o", params);

    // Create UMI instance
    const umi = createUmi(this.connection.rpcEndpoint);

    const mint = new PublicKey(fromToken.contractAddress);
    const programId = new PublicKey(originLayerzeroAddress);

    console.log("programId: %o", originLayerzeroAddress);

    const provider = new AnchorProvider(this.connection, this.signer, {
      commitment: "confirmed"
    });

    const amountLd = BigInt(amountWei);
    const slippage = slippageTolerance || 0.01; // Default 1% slippage
    const minAmountLd =
      amountLd - (amountLd * BigInt(Math.floor(slippage * 10000))) / 10000n;

    const oftProgram = new Program(params.idl, programId, provider);

    console.log("oftProgram: %o", oftProgram);

    const anchorAccounts = oftProgram.account as any;
    const oftStore = await anchorAccounts.oftStore.all();

    const oftStoreAccount = oftStore.find(({ account }: { account: any }) => {
      return account.tokenMint.equals(mint);
    });
    console.log("oftStoreAccount: %o", oftStoreAccount.publicKey.toString());

    const creditsAccounts = (await anchorAccounts.credits.all()) ?? [];
    const recipientBytes = Buffer.from(addressToBytes32(recipient));

    let targetDstEid = dstEid;
    let targetToBuffer = recipientBytes;
    let peerAddressBytes = addressToBytes32(destinationLayerzeroAddress);

    const peerAccounts = await anchorAccounts.peerConfig.all();
    let expectedPeerAddress = Buffer.from(peerAddressBytes);

    const legacyExecutorGasLimit = 250_000n;
    const multiHopExecutorGasLimit = 250_000_000n;

    let executorOptions = Options.newOptions().addExecutorLzReceiveOption(
      legacyExecutorGasLimit,
      0n
    );
    let extraOptionsBytes = Buffer.from(executorOptions.toBytes());
    let composeMsgBuffer: Buffer | null = null;

    if (isMultiHopComposer) {
      console.log("Entering Multi-Hop branch");
      if (
        !multiHopComposer?.eid ||
        !multiHopComposer?.oftMultiHopComposer ||
        !toToken
      ) {
        throw new Error("Missing multiHopComposer configuration");
      }

      targetDstEid = multiHopComposer.eid;
      targetToBuffer = Buffer.from(
        addressToBytes32(multiHopComposer.oftMultiHopComposer)
      );
      peerAddressBytes = addressToBytes32(multiHopComposer.oftMultiHopComposer);
      expectedPeerAddress = Buffer.from(peerAddressBytes);

      executorOptions = Options.newOptions().addExecutorLzReceiveOption(
        multiHopExecutorGasLimit,
        0n
      );
      extraOptionsBytes = Buffer.from(executorOptions.toBytes());

      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const originalRecipientHex = recipientBytes.toString("hex");
      const innerExecutorOptions = Options.newOptions()
        .addExecutorLzReceiveOption(legacyExecutorGasLimit, 0n)
        .toHex();

      const encodedCompose = abiCoder.encode(
        [
          "tuple(uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd)"
        ],
        [
          [
            dstEid,
            `0x${originalRecipientHex}`,
            amountLd,
            minAmountLd,
            innerExecutorOptions,
            "0x",
            "0x"
          ]
        ]
      );
      composeMsgBuffer = Buffer.from(encodedCompose.slice(2), "hex");
    }

    const composeMsg =
      composeMsgBuffer && composeMsgBuffer.length > 0
        ? composeMsgBuffer
        : Buffer.from("0x");
    const composeMsgUint8 =
      composeMsgBuffer && composeMsgBuffer.length > 0
        ? new Uint8Array(composeMsgBuffer)
        : undefined;

    const creditsAccount = creditsAccounts.find(
      ({ account }: { account: any }) =>
        Array.isArray(account.entries) &&
        account.entries.some((entry: any) => {
          const eidValue =
            typeof entry.eid === "number" ? entry.eid : Number(entry.eid);
          return eidValue === targetDstEid;
        })
    );
    if (!creditsAccount) {
      throw new Error(`No credits account found for dstEid ${targetDstEid}`);
    }
    console.log("creditsAccount: %o", creditsAccount.publicKey.toString());

    const peerAccount = peerAccounts.find(({ account }: { account: any }) => {
      const onChainAddress = Buffer.from(account.peerAddress);
      return onChainAddress.equals(expectedPeerAddress);
    });
    if (!peerAccount) {
      throw new Error(
        `No peer account found for address ${expectedPeerAddress.toString(
          "hex"
        )}`
      );
    }

    const args = {
      dstEid: targetDstEid,
      to: targetToBuffer,
      amountLd: new BN(amountLd.toString()),
      minAmountLd: new BN(minAmountLd.toString()),
      extraOptions: extraOptionsBytes,
      composeMsg: composeMsg,
      payInLzToken: Boolean(payInLzToken)
    };

    console.log("args: %o", args);

    try {
      const feeInstruction = await oftProgram.methods
        .quoteSend(args)
        .accounts({
          oftStore: oftStoreAccount.publicKey,
          credits: creditsAccount.publicKey,
          peer: peerAccount.publicKey
        })
        .instruction();

      const simulation = await this.simulateIx(feeInstruction);
      console.log("quoteSend simulation: %o", simulation);

      return {};
    } catch (error: any) {
      throw error;
    }

    return {};

    // if (!msgFee?.nativeFee || !msgFee?.lzTokenFee) {
    //   throw new Error("No fee");
    // }

    // const sendArgs = {
    //   dstEid: new BN(dstEid.toString()),
    //   to: addressToBytes32(recipient),
    //   amountLd: new BN(amountLd.toString()),
    //   minAmountLd: new BN(minAmountLd.toString()),
    //   extraOptions: null,
    //   compose_msg: null,
    //   nativeFee: msgFee.nativeFee,
    //   lzTokenFee: msgFee.lzTokenFee
    // };

    // const sendAccounts = {
    //   signer: this.publicKey!,
    //   oftStore: oftStoreAccount.publicKey,
    //   credits: creditsAccount.publicKey,
    //   peer: peerAccount.publicKey,
    //   tokenSource: getAssociatedTokenAddressSync(mint, this.publicKey!),
    //   tokenEscrow: oftStoreAccount.account.tokenEscrow,
    //   tokenMint: mint,
    //   tokenProgram: TOKEN_PROGRAM_ID,
    //   eventAuthority: oftStoreAccount.account.eventAuthority,
    //   program: programId
    // };

    // const sendInstruction = await oftProgram.methods
    //   .send(sendArgs)
    //   .accounts(sendAccounts)
    //   .instruction();

    // const sendTx = new Transaction().add(sendInstruction);
    // sendTx.feePayer = this.publicKey!;
    // const { blockhash: sendBlockhash } =
    //   await this.connection.getLatestBlockhash();
    // sendTx.recentBlockhash = sendBlockhash;
    // const sendSimulation = await this.connection.simulateTransaction(sendTx);
    // // @ts-ignore
    // const sendMsgFee = sendSimulation.value.fee;
    // console.log("sendMsgFee: %o", sendMsgFee);
    // return {};

    // Get token escrow (OFT store escrow)
    // Priority: 1. params.tokenEscrow 2. Fetch from OFT store dynamically
    // Fetch OFT store account to get the actual tokenEscrow
    // const oftStoreInfo = await oft.accounts.fetchOFTStore(
    //   umi,
    //   oftStoreAccount.publicKey
    // );
    // console.log(
    //   "Fetch OFT store account to get the actual tokenEscrow: %o",
    //   oftStoreInfo
    // );
    const mintPk = new PublicKey(oftStoreAccount.account.tokenMint);
    const escrowPk = new PublicKey(oftStoreAccount.account.tokenEscrow);
    console.log(
      "Fetched tokenEscrow from OFT store mintPk:",
      mintPk.toBase58()
    );
    console.log(
      "Fetched tokenEscrow from OFT store escrowPk:",
      escrowPk.toBase58()
    );

    // Get token source (user's token account)
    const tokenSource = getAssociatedTokenAddressSync(mint, this.publicKey!);

    const sendParam = {
      dstEid: targetDstEid,
      to: targetToBuffer,
      amountLd: amountLd,
      minAmountLd: minAmountLd,
      options: undefined,
      composeMsg: undefined
    };

    const lookupTableAddresses = [
      (await getDefaultAddressLookupTable(this.connection, umi))
        .lookupTableAddress
    ];
    console.log("lookupTableAddresses: %o", sendParam);

    console.log("oft", oft);

    console.log("oft program id", oft.programs.OFT_PROGRAM_ID);

    // Get MessagingFee using quote
    // Note: peerAddr will be automatically fetched from peer config by the SDK
    // If peer config doesn't exist, it means the peer hasn't been configured yet
    const { nativeFee, lzTokenFee } = await oft.quote(
      umi.rpc,
      {
        payer: fromWeb3JsPublicKey(this.publicKey!),
        tokenMint: fromWeb3JsPublicKey(mintPk),
        tokenEscrow: fromWeb3JsPublicKey(escrowPk)
      },
      {
        ...sendParam,
        payInLzToken
      },
      {
        oft: publicKey(programId)
      },
      [],
      lookupTableAddresses
    );

    console.log(
      "MessagingFee - nativeFee:",
      nativeFee.toString(),
      "lzTokenFee:",
      lzTokenFee.toString()
    );

    // Create send transaction
    // Note: peerAddr will be automatically fetched from peer config by the SDK
    const wrappedInstruction = await oft.send(
      umi.rpc,
      {
        payer: this.signer as any,
        tokenMint: fromWeb3JsPublicKey(mintPk),
        tokenEscrow: fromWeb3JsPublicKey(escrowPk),
        tokenSource: fromWeb3JsPublicKey(tokenSource)
      },
      {
        nativeFee,
        ...sendParam
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
      wrappedInstruction
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

    // Check if transaction is already a Web3.js Transaction
    let web3Tx: Transaction | VersionedTransaction;
    if (transaction instanceof Transaction) {
      // Already a Web3.js Transaction
      web3Tx = transaction;
    } else if (transaction instanceof VersionedTransaction) {
      // Already a VersionedTransaction
      web3Tx = transaction;
    } else {
      // Convert UMI transaction to Web3.js transaction
      web3Tx = toWeb3JsTransaction(transaction);
    }

    // Sign the transaction
    const signedTransaction = await this.signTransaction(web3Tx);

    // Send the transaction
    const signature = await this.connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        maxRetries: 3
      }
    );

    console.log("Transaction sent with signature:", signature);

    // Confirm the transaction
    const confirmation = await this.connection.confirmTransaction(
      signature,
      "confirmed"
    );

    if (confirmation.value.err) {
      throw new Error(
        `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
      );
    }

    return signature;
  }

  async quoteOneClickProxy(params: any) {
    const {
      proxyAddress,
      fromToken,
      amountWei,
      prices,
      depositAddress,
    } = params;

    try {
      const result: any = { fees: {} };

      const PROGRAM_ID = new PublicKey(proxyAddress);
      const STATE_PDA = new PublicKey("9E8az3Y9sdXvM2f3CCH6c9N3iFyNfDryQCZhqDxRYGUw");
      const MINT = new PublicKey(fromToken.contractAddress);
      const AMOUNT = new BN(amountWei);
      const RECIPIENT = new PublicKey(depositAddress);
      const sender = this.publicKey!;

      // Create AnchorProvider
      const provider = new AnchorProvider(this.connection, this.signer, {
        commitment: "confirmed"
      });

      // Create Program instance
      const program = new Program<any>(stableflowProxyIdl, PROGRAM_ID, provider
      );

      // Get user's token account (ATA)
      const userTokenAccount = getAssociatedTokenAddressSync(MINT, sender);

      // Get recipient's token account (ATA)
      const toTokenAccount = getAssociatedTokenAddressSync(MINT, RECIPIENT);

      // Check if recipient's token account exists, create if not
      const transaction = new Transaction();
      try {
        await getAccount(this.connection, toTokenAccount);
      } catch (error) {
        // If token account doesn't exist, create it
        transaction.add(
          createAssociatedTokenAccountInstruction(
            sender, // payer
            toTokenAccount, // ata
            RECIPIENT, // owner
            MINT // mint
          )
        );
      }

      // Build transfer instruction
      const transferInstruction = await program.methods
        .transfer(AMOUNT)
        .accounts({
          stableFlowState: STATE_PDA,
          tokenMint: MINT,
          userTokenAccount: userTokenAccount,
          toTokenAccount: toTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          user: sender,
          toUser: RECIPIENT,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      // Add transfer instruction to transaction
      transaction.add(transferInstruction);

      // Set transaction blockhash and feePayer before simulation
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sender;

      // Simulate entire transaction (including account creation if needed) to estimate fees
      const message = transaction.compileMessage();
      const versionedTx = new VersionedTransaction(message);
      const simulation = await this.connection.simulateTransaction(versionedTx, {
        sigVerify: false
      });

      result.sendParam = {
        transaction,
      };

      // @ts-ignore Calculate estimated fee
      const estimatedFee = simulation.value.fee || 5000n; // Base fee per signature

      // Convert fee to USD
      const estimateGasUsd = Big(estimatedFee.toString())
        .div(10 ** fromToken.nativeToken.decimals)
        .times(getPrice(prices, fromToken.nativeToken.symbol));

      const usd = numberRemoveEndZero(estimateGasUsd.toFixed(20));
      const wei = estimatedFee;

      // Assign fee values to result
      result.fees.sourceGasFeeUsd = usd;
      result.estimateSourceGas = wei;
      result.estimateSourceGasUsd = usd;

      return result;
    } catch (error: any) {
      console.log("error: %o", error);
      return { errMsg: error.message };
    }
  }

  async quoteCCTP(params: any) {
    const {
      proxyAddress,
      refundTo,
      recipient,
      amountWei,
      fromToken,
      prices,
      excludeFees,
      destinationDomain,
      sourceDomain,
    } = params;

    try {
      const result: any = {
        needApprove: false,
        approveSpender: proxyAddress,
        sendParam: void 0,
        quoteParam: {
          sourceDomain,
          destinationDomain,
          proxyAddress,
          ...params,
        },
        fees: {},
        totalFeesUsd: void 0,
        estimateSourceGas: void 0,
        estimateSourceGasUsd: void 0,
        estimateTime: 0,
        outputAmount: numberRemoveEndZero(Big(amountWei || 0).div(10 ** fromToken.decimals).toFixed(fromToken.decimals, 0)),
      };

      const PROGRAM_ID = new PublicKey(proxyAddress);
      const STATE_PDA = new PublicKey("coNkR1719kohnaxQrVPwvaGdVrqPTps6NFUZic3hGJb");
      const PROTOCOL_FEE_ACCOUNT = new PublicKey("DGNLzBUrn18LC3CuStGAQrRLuzfKtw3vDoHLjEp7UtPA");
      const MINT = new PublicKey(fromToken.contractAddress);
      const sender = this.publicKey!;
      const userPubkey = new PublicKey(refundTo || sender.toString());

      // Create AnchorProvider
      const provider = new AnchorProvider(this.connection, this.signer, {
        commitment: "confirmed"
      });

      // Create Program instance
      const program = new Program<any>(cctpProxyIdl, PROGRAM_ID, provider);

      // Derive UserState PDA
      const [userStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_state"), userPubkey.toBuffer()],
        PROGRAM_ID
      );

      // Get user nonce from UserState account
      let userNonce = 0;
      try {
        const accountInfo = await this.connection.getAccountInfo(userStatePda);
        if (accountInfo && accountInfo.data) {
          // UserState structure: user (32 bytes) + nonce (8 bytes) + bump (1 byte)
          // Skip user (32 bytes) and read nonce (8 bytes, little-endian)
          const nonceBuffer = accountInfo.data.slice(32, 40);
          userNonce = Number(new BN(nonceBuffer, "le").toString());
        }
      } catch (error) {
        // If UserState doesn't exist, nonce is 0
        console.log("UserState not found, using nonce 0");
      }

      // Quote signature
      const signatureRes = await quoteSignature({
        address: userPubkey.toString(),
        amount: numberRemoveEndZero(Big(amountWei || 0).div(10 ** fromToken.decimals).toFixed(fromToken.decimals, 0)),
        destination_domain_id: destinationDomain,
        receipt_address: recipient,
        source_domain_id: sourceDomain,
        user_nonce: userNonce,
      });

      const {
        bridge_fee,
        finality_threshold,
        max_fee,
        mint_fee,
        receipt_amount,
        signature,
        destination_caller,
      } = signatureRes;

      result.fees.estimateMintGasUsd = numberRemoveEndZero(
        Big(mint_fee || 0)
          .div(10 ** fromToken.decimals)
          .toFixed(fromToken.decimals)
      );
      result.fees.bridgeFeeUsd = numberRemoveEndZero(
        Big(bridge_fee || 0)
          .div(10 ** fromToken.decimals)
          .toFixed(fromToken.decimals)
      );
      const chargedAmount = BigInt(amountWei) - BigInt(mint_fee);
      result.outputAmount = numberRemoveEndZero(
        Big(receipt_amount || 0)
          .div(10 ** fromToken.decimals)
          .toFixed(fromToken.decimals, 0)
      );

      // Convert recipient address to bytes32 (32 bytes)
      const recipientBytes32 = Buffer.alloc(32);
      if (recipient.startsWith("0x")) {
        Buffer.from(recipient.slice(2), "hex").copy(recipientBytes32);
      } else {
        // Assume it's a Solana address, convert to bytes
        const recipientPubkey = new PublicKey(recipient);
        recipientPubkey.toBuffer().copy(recipientBytes32, 0);
      }

      // Convert destinationCaller to bytes32 (zero-padded)
      const destinationCallerBytes32 = Buffer.alloc(32, 0);

      // Get user's token account (ATA)
      const userTokenAccount = getAssociatedTokenAddressSync(MINT, sender);

      // Build depositWithFee instruction
      const depositInstruction = await program.methods
        .depositWithFee(
          new BN(amountWei.toString()),
          new BN(chargedAmount.toString()),
          destinationDomain,
          Array.from(recipientBytes32),
          MINT,
          Array.from(destinationCallerBytes32),
          new BN(max_fee.toString()),
          finality_threshold
        )
        .accounts({
          stableFlowState: STATE_PDA,
          userState: userStatePda,
          tokenMint: MINT,
          userTokenAccount: userTokenAccount,
          protocolFeeAccount: PROTOCOL_FEE_ACCOUNT,
          eventRentPayer: sender,
          senderAuthorityPda: sender, // This might need to be a PDA, check IDL
          messageTransmitter: new PublicKey("CCTPV2vPZJS2u2BBsUoscuikbYjnpFmbFsvVuJdgUMQe"), // CCTP Token Messenger
          tokenMessenger: new PublicKey("CCTPV2vPZJS2u2BBsUoscuikbYjnpFmbFsvVuJdgUMQe"),
          remoteTokenMessenger: new PublicKey("CCTPV2vPZJS2u2BBsUoscuikbYjnpFmbFsvVuJdgUMQe"),
          tokenMinter: new PublicKey("CCTPV2vPZJS2u2BBsUoscuikbYjnpFmbFsvVuJdgUMQe"),
          localToken: MINT,
          messageSentEventData: sender, // This should be a new account, might need to derive
          cctpMessageTransmitterProgram: new PublicKey("CCTPV2vPZJS2u2BBsUoscuikbYjnpFmbFsvVuJdgUMQe"),
          cctpTokenMessengerMinterProgram: new PublicKey("CCTPV2vPZJS2u2BBsUoscuikbYjnpFmbFsvVuJdgUMQe"),
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          user: sender,
          operator: sender, // This might need to be from state
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      // Build transaction
      const transaction = new Transaction();
      transaction.add(depositInstruction);
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sender;

      // Simulate entire transaction (including account creation if needed) to estimate fees
      const message = transaction.compileMessage();
      const versionedTx = new VersionedTransaction(message);
      const simulation = await this.connection.simulateTransaction(versionedTx, {
        sigVerify: false
      });
      console.log("depositWithFee simulation: %o", simulation.value);
      console.log("depositWithFee simulation: %o", JSON.stringify(simulation.value));

      // Estimate gas cost (Solana fees are typically fixed, but we can use simulation)
      // @ts-ignore Solana base fee is 5000 lamports per signature
      const estimatedFee = simulation.value.fee || 5000n; // Base fee per signature
      const estimateGasUsd = Big(estimatedFee.toString())
        .div(10 ** fromToken.nativeToken.decimals)
        .times(getPrice(prices, fromToken.nativeToken.symbol));
      result.fees.estimateDepositGasUsd = numberRemoveEndZero(estimateGasUsd.toFixed(20));
      result.estimateSourceGas = estimatedFee;
      result.estimateSourceGasUsd = numberRemoveEndZero(estimateGasUsd.toFixed(20));

      result.sendParam = {
        transaction: transaction,
      };

      // Calculate total fees
      for (const feeKey in result.fees) {
        if (excludeFees && excludeFees.includes(feeKey) || !/Usd$/.test(feeKey)) {
          continue;
        }
        result.totalFeesUsd = Big(result.totalFeesUsd || 0).plus(result.fees[feeKey] || 0);
      }
      result.totalFeesUsd = numberRemoveEndZero(Big(result.totalFeesUsd || 0).toFixed(20));

      return result;
    } catch (error: any) {
      console.log("quoteCCTP failed: %o", error);
      return { errMsg: error.message };
    }
  }

  async createAssociatedTokenAddress(params: any) {
    const {
      tokenMint,
    } = params;

    if (!this.publicKey) {
      throw new Error("Wallet not connected");
    }

    const ownerPubkey = this.publicKey;
    const mint = new PublicKey(tokenMint);
    const associatedTokenAccount = getAssociatedTokenAddressSync(mint, ownerPubkey);

    console.log("associatedTokenAccount: %o", associatedTokenAccount);

    const createTokenAccount = async () => {
      const transaction = new Transaction();

      transaction.add(
        createAssociatedTokenAccountInstruction(
          ownerPubkey,
          associatedTokenAccount,
          ownerPubkey,
          mint
        )
      );

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = ownerPubkey;

      const signedTransaction = await this.signTransaction(transaction);

      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.checkTransactionStatus(signature);

      return associatedTokenAccount;
    };

    try {
      const accountRes = await getAccount(this.connection, associatedTokenAccount);
      console.log("associatedTokenAccount account: %o", accountRes);
      return associatedTokenAccount;
    } catch (error) {
      console.log("get ata failed: %o", error);
    }

    return createTokenAccount();
  }
}
