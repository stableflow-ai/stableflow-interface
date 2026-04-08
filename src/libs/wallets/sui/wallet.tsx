import { Transaction } from "@mysten/sui/transactions";
import Big from "big.js";
import { getPrice } from "@/utils/format/price";
import { numberRemoveEndZero } from "@/utils/format/number";
import { SendType } from "../types";
import { Service } from "@/services/constants";
import { csl } from "@/utils/log";

const SUI_COIN_TYPE = "0x2::sui::SUI";

type SuiWalletClient = {
  listCoins: (input: any) => Promise<any>;
  getBalance: (input: any) => Promise<any>;
  simulateTransaction: (input: any) => Promise<any>;
  getReferenceGasPrice: () => Promise<any>;
  getTransaction: (input: any) => Promise<any>;
};

export default class SuiWallet {
  private account: any | null;
  private signAndExecuteTransaction: any;
  private suiClient: SuiWalletClient;

  constructor(options: { account: any | null; signAndExecuteTransaction: any; suiClient: SuiWalletClient; }) {
    this.signAndExecuteTransaction = options.signAndExecuteTransaction;
    this.account = options.account;
    this.suiClient = options.suiClient;
  }

  // Transfer SUI
  async transferSUI(to: string, amount: string): Promise<string> {
    if (!this.account) {
      throw new Error("Wallet not connected");
    }

    try {
      const tx = new Transaction();

      // Convert amount to octas (1 SUI = 10^9)
      const amountInMist = BigInt(Math.floor(parseFloat(amount) * 10 ** 9));

      const [coinToSend] = tx.splitCoins(tx.gas, [amountInMist]);

      tx.transferObjects([coinToSend], to);

      // Sign and submit transaction
      const result = await this.signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showBalanceChanges: true,
        },
      });

      // const executedTransaction = await this.aptos.waitForTransaction({ transactionHash: typeof result === "string" ? result : result.hash });
      // if (executedTransaction.success !== true) {
      //   csl("Aptos transferAPT", "red-500", "Transfer APT token failed: %o", executedTransaction);
      //   throw new Error("Transfer token failed");
      // }

      return typeof result === "string" ? result : result.digest;
    } catch (error) {
      csl("Sui transferSUI", "red-500", "Transfer APT failed: %o", error);
      throw error;
    }
  }

  // Transfer token
  async transferToken(contractAddress: string, to: string, amount: string): Promise<string> {
    if (!this.account) {
      throw new Error("Wallet not connected");
    }

    try {
      const owner = this.account?.address?.toString();
      if (!owner) {
        throw new Error("Invalid sender address");
      }

      const amountBigInt = BigInt(amount);
      const coinsResponse = await this.suiClient.listCoins({
        owner,
        coinType: contractAddress,
        limit: 50,
      });

      if (!coinsResponse.objects?.length) {
        throw new Error("Insufficient token balance");
      }

      const [primaryCoin, ...restCoins] = coinsResponse.objects;
      const tx = new Transaction();
      const primaryInput = tx.object(primaryCoin.objectId);

      if (restCoins.length) {
        tx.mergeCoins(
          primaryInput,
          restCoins.map((coin: any) => tx.object(coin.objectId)),
        );
      }

      const [coinToSend] = tx.splitCoins(primaryInput, [amountBigInt]);
      tx.transferObjects([coinToSend], to);

      const result = await this.signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showBalanceChanges: true,
        },
      });

      return typeof result === "string" ? result : result.digest;
    } catch (error) {
      csl("Sui transferToken", "red-500", "Transfer token failed: %o", error);
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

    // Transfer SUI
    if (originAsset === "SUI" || originAsset === "sui" || originAsset === "native") {
      return await this.transferSUI(depositAddress, amount);
    }

    // Transfer token
    const result = await this.transferToken(
      originAsset,
      depositAddress,
      amount
    );
    return result;
  }

  async getSUIBalance(account: string) {
    try {
      const response = await this.suiClient.getBalance({
        owner: account,
        coinType: SUI_COIN_TYPE,
      });
      return response.balance.balance || "0";
    } catch (error) {
      csl("Sui getSUIBalance", "red-500", "Get SUI balance failed: %o", error);
      return "0";
    }
  }

  async getTokenBalance(contractAddress: string, account: string) {
    try {
      const response = await this.suiClient.getBalance({
        owner: account,
        coinType: contractAddress,
      });
      console.log("response: %o", response)
      return response.balance.balance || "0";
    } catch (error) {
      csl("Sui getTokenBalance", "red-500", "Get token balance failed: %o", error);
      return "0";
    }
  }

  async getBalance(token: any, account: string) {
    if (token.symbol === "SUI" || token.symbol === "sui" || token.symbol === "native") {
      return await this.getSUIBalance(account);
    }
    return await this.getTokenBalance(token.contractAddress, account);
  }

  async balanceOf(token: any, account: string) {
    return await this.getBalance(token, account);
  }

  async estimateTransferGas(data: {
    fromToken: any;
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

    const { fromToken, depositAddress, amount } = data;
    const sender = this.account?.address?.toString();
    if (!sender) {
      throw new Error("Invalid sender address");
    }

    const tx = new Transaction();
    const originAsset = fromToken?.contractAddress;
    const isNative = originAsset === "SUI" || originAsset === "sui" || originAsset === "native";

    if (isNative) {
      const [coinToSend] = tx.splitCoins(tx.gas, [BigInt(amount)]);
      tx.transferObjects([coinToSend], depositAddress);
    } else {
      const coinsResponse = await this.suiClient.listCoins({
        owner: sender,
        coinType: originAsset,
        limit: 50,
      });

      if (!coinsResponse.objects?.length) {
        throw new Error("No token coins found for gas estimation");
      }

      const [primaryCoin, ...restCoins] = coinsResponse.objects;
      const primaryInput = tx.object(primaryCoin.objectId);
      if (restCoins.length) {
        tx.mergeCoins(
          primaryInput,
          restCoins.map((coin: any) => tx.object(coin.objectId)),
        );
      }
      const [coinToSend] = tx.splitCoins(primaryInput, [BigInt(amount)]);
      tx.transferObjects([coinToSend], depositAddress);
    }

    const simulation = await this.suiClient.simulateTransaction({
      transaction: tx,
      include: {
        effects: true,
      },
    });
    const simulationTx = simulation.$kind === "Transaction" ? simulation.Transaction : simulation.FailedTransaction;
    const gasUsed = simulationTx?.effects?.gasUsed;
    const computationCost = BigInt(gasUsed?.computationCost || "0");
    const storageCost = BigInt(gasUsed?.storageCost || "0");
    const storageRebate = BigInt(gasUsed?.storageRebate || "0");
    const gasLimit = computationCost + storageCost - storageRebate;

    const gasPriceResponse = await this.suiClient.getReferenceGasPrice();
    const gasPrice = BigInt(gasPriceResponse.referenceGasPrice || "0");

    return {
      gasLimit,
      gasPrice,
      estimateGas: gasLimit * gasPrice,
    };
  }

  async checkTransactionStatus(signature: string) {
    try {
      const tx = await this.suiClient.getTransaction({
        digest: signature,
      });
      if (tx?.$kind === "Transaction") {
        return tx.Transaction?.status?.success === true;
      }
      return tx?.status?.success === true;
    } catch (error) {
      csl("Sui checkTransactionStatus", "red-500", "Check transaction status failed: %o", error);
      return false;
    }
  }

  async quoteOneClickProxy(params: any) {
    const {
      proxyAddress,
      fromToken,
      depositAddress,
      amountWei,
      prices,
    } = params;

    const result: any = { fees: {} };

    if (!depositAddress) {
      throw new Error("depositAddress is required");
    }

    try {
      const tx = new Transaction();
      const defaultTarget = `${proxyAddress}::stableflow_proxy::proxy_transfer`;
      const functionTarget = params?.functionTarget || defaultTarget;
      const typeArguments = params?.typeArguments || [fromToken.contractAddress];
      const functionArguments = params?.functionArguments || [depositAddress, amountWei];

      tx.moveCall({
        target: functionTarget,
        typeArguments,
        arguments: functionArguments.map((arg: any) => {
          if (typeof arg === "bigint") {
            return tx.pure.u64(arg);
          }
          if (typeof arg === "number") {
            return tx.pure.u64(BigInt(Math.floor(arg)));
          }
          if (typeof arg === "string" && /^\d+$/.test(arg)) {
            return tx.pure.u64(BigInt(arg));
          }
          return tx.pure.string(String(arg));
        }),
      });

      const simulation = await this.suiClient.simulateTransaction({
        transaction: tx,
        include: {
          effects: true,
        },
      });
      const simulationTx = simulation.$kind === "Transaction" ? simulation.Transaction : simulation.FailedTransaction;
      const gasUsed = simulationTx?.effects?.gasUsed;
      const gasLimit = BigInt(gasUsed?.computationCost || "0")
        + BigInt(gasUsed?.storageCost || "0")
        - BigInt(gasUsed?.storageRebate || "0");
      const gasPriceRes = await this.suiClient.getReferenceGasPrice();
      const gasPrice = BigInt(gasPriceRes.referenceGasPrice || "0");
      const estimateGas = gasLimit * gasPrice;
      const estimateGasUsd = Big(estimateGas.toString())
        .div(10 ** (fromToken.nativeToken?.decimals || 9))
        .times(getPrice(prices, fromToken.nativeToken?.symbol || "SUI"));

      result.fees.sourceGasFeeUsd = numberRemoveEndZero(Big(estimateGasUsd).toFixed(20));
      result.estimateSourceGas = estimateGas.toString();
      result.estimateSourceGasUsd = numberRemoveEndZero(Big(estimateGasUsd).toFixed(20));
      result.sendParam = { tx };

    } catch (error) {
      csl("Sui quoteOneClickProxy", "red-500", "oneclick quote proxy failed: %o", error);
      // Return default values on error
      const defaultEstimateGas = 1000000n;
      const estimateGasUsd = Big(defaultEstimateGas.toString())
        .div(10 ** (fromToken.nativeToken?.decimals || 9))
        .times(getPrice(prices, fromToken.nativeToken?.symbol || "SUI"));
      result.fees.sourceGasFeeUsd = numberRemoveEndZero(Big(estimateGasUsd).toFixed(20));
      result.estimateSourceGas = defaultEstimateGas.toString();
      result.estimateSourceGasUsd = numberRemoveEndZero(Big(estimateGasUsd).toFixed(20));
    }

    return result;
  }

  async sendTransaction(params: any) {
    if (!this.account) {
      throw new Error("Wallet not connected");
    }

    const { tx } = params;

    try {
      const sender = this.account?.address?.toString();
      if (!sender) {
        throw new Error("Invalid sender address");
      }

      const result = await this.signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showBalanceChanges: true,
        },
      });

      return typeof result === "string" ? result : result.digest;
    } catch (error) {
      csl("Sui sendTransaction", "red-500", "Send transaction failed: %o", error);
      throw error;
    }
  }

  async quote(type: Service, params: any) {
    switch (type) {
      case Service.OneClick:
        return await this.quoteOneClickProxy(params);
      default:
        throw new Error(`Unsupported quote type: ${type}`);
    }
  }

  async send(type: SendType, params: any) {
    switch (type) {
      case SendType.SEND:
        return await this.sendTransaction(params);
      case SendType.TRANSFER:
        return await this.transfer(params);
      default:
        throw new Error(`Unsupported send type: ${type}`);
    }
  }
}
