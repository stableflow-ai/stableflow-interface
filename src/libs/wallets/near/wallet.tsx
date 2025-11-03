import { Buffer } from "buffer";

export default class NearWallet {
  private selector: any;
  private rpcUrl: string;
  constructor(_selector: any) {
    this.selector = _selector;
    // https://rpc.mainnet.near.org
    // https://nearinner.deltarpc.com
    this.rpcUrl = "https://nearinner.deltarpc.com";
  }

  private async query(contractId: string, methodName: string, args: any = {}) {
    const response = await fetch(this.rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "dontcare",
        method: "query",
        params: {
          request_type: "call_function",
          finality: "final",
          account_id: contractId,
          method_name: methodName,
          args_base64: Buffer.from(JSON.stringify(args)).toString("base64")
        }
      })
    });
    const result = await response.json();
    if (result.result && result.result.result) {
      return JSON.parse(Buffer.from(result.result.result).toString());
    }
    return result;
  }

  async transfer(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
  }) {
    const wallet = await this.selector.wallet();
    const checkStorage = await this.query(
      data.originAsset,
      "storage_balance_of",
      {
        account_id: data.depositAddress
      }
    );
    const transactions = [];
    if (!checkStorage?.available) {
      transactions.push({
        receiverId: data.originAsset,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "storage_deposit",
              args: {
                account_id: data.depositAddress,
                registration_only: true
              },
              gas: "15000000000000",
              deposit: "1250000000000000000000"
            }
          }
        ]
      });
    }
    transactions.push({
      receiverId: data.originAsset,
      actions: [
        {
          type: "FunctionCall" as const,
          params: {
            methodName: "ft_transfer",
            args: {
              receiver_id: data.depositAddress,
              amount: data.amount,
              memo: null
            },
            gas: "30000000000000",
            deposit: "1"
          }
        }
      ]
    });

    const result = await wallet.signAndSendTransactions({
      transactions,
      callbackUrl: "/"
    });

    if (result.slice(-1).length) {
      return result.slice(-1)[0].transaction.hash;
    }

    return "";
  }

  async getBalance(token: string, _account: string) {
    const balance = await this.query(token, "ft_balance_of", {
      account_id: _account
    });
    return balance || "0";
  }

  async balanceOf(token: string, account: string) {
    return await this.getBalance(token, account);
  }

  /**
   * Get native NEAR balance
   * @param account Account ID
   * @returns NEAR balance in yoctoNEAR (smallest unit)
   */
  async getNearBalance(account: string): Promise<string> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "dontcare",
          method: "query",
          params: {
            request_type: "view_account",
            finality: "final",
            account_id: account
          }
        })
      });
      const result = await response.json();
      return result.result?.amount || "0";
    } catch (error) {
      console.error("Failed to get NEAR balance:", error);
      return "0";
    }
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
    const { originAsset, depositAddress } = data;

    // Check if storage deposit is needed
    const checkStorage = await this.query(
      originAsset,
      "storage_balance_of",
      {
        account_id: depositAddress
      }
    );

    let gasLimit: bigint;

    if (!checkStorage?.available) {
      // Storage deposit: 15000000000000 gas
      // ft_transfer: 30000000000000 gas
      gasLimit = BigInt("15000000000000") + BigInt("30000000000000");
    } else {
      // Only ft_transfer needed: 30000000000000 gas
      gasLimit = BigInt("30000000000000");
    }

    // Increase by 20% to provide buffer
    gasLimit = (gasLimit * 120n) / 100n;

    // NEAR gas price is typically 100000000 yoctoNEAR per gas unit
    const gasPrice = BigInt("100000000");

    // Calculate estimated gas cost: gasLimit * gasPrice
    const estimateGas = gasLimit * gasPrice;

    return {
      gasLimit,
      gasPrice,
      estimateGas
    };
  }

  async checkTransactionStatus(txHash: string) {
    const wallet = await this.selector.wallet();
    const accounts = await wallet.getAccounts();
    const accountId = accounts[0]?.accountId;

    try {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "dontcare",
          method: "EXPERIMENTAL_tx_status",
          params: {
            tx_hash: txHash,
            sender_account_id: accountId,
            wait_until: "EXECUTED" // wait_until: "NONE" | "EXECUTED_OPTIMISTIC" | "EXECUTED"
          }
        })
      });
      const txStatus = await response.json();
      console.log("fetch rpc success: %o", txStatus);
      console.log("fetch rpc status success: %o", typeof txStatus.result?.status?.SuccessValue !== "undefined");
    } catch (error) {
      console.log("fetch rpc failed: %o", error);
    }
  }
}
