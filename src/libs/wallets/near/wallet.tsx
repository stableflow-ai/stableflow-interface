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
              gas: "30000000000000",
              deposit: "1"
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
    return result;
  }

  async getBalance(token: string, _account: string) {
    const balance = await this.query(token, "ft_balance_of", {
      account_id: _account
    });
    return balance || "0";
  }
}
