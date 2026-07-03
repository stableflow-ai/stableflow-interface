import axios from "axios";

export const getLayerzeroData = async (params: { tx_hash: string; from_chain?: string }) => {
  const { tx_hash, from_chain } = params;

  try {
    const txhash = from_chain === "tron" ? `0x${tx_hash}` : tx_hash;
    const response = await axios({
      url: `https://scan.layerzero-api.com/v1/messages/tx/${txhash}`,
      method: "GET",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data.data[0];
  } catch (error) {
    console.error("getLayerzeroData failed: %o", error);
    return null;
  }
};

export const getOftTransferStatus = async (params: any): Promise<{ status: string; toTxHash?: string }> => {
  const { hash, history, fromWallet } = params;
  const result = { status: "PENDING_DEPOSIT" };

  if (history?.fromToken?.chainType === "tron" && fromWallet) {
    const response = await fromWallet.getTransactionResult(hash);

    if (!response || !response.receipt || !response.receipt.result) {
      return result;
    }

    if (response.receipt.result !== "SUCCESS") {
      result.status = "FAILED";
      return result;
    }
  }

  try {
    const txhash = history?.fromToken?.chainType === "tron" ? `0x${hash}` : hash;
    const response = await axios({
      url: `https://scan.layerzero-api.com/v1/messages/tx/${txhash}`,
      method: "GET",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = response.data.data[0];
    const status = data.status.name;
    const toTxHash = data.destination?.tx?.txHash;
    let finalStatus = "PENDING_DEPOSIT";
    if (status === "DELIVERED") {
      finalStatus = "SUCCESS";
    }
    if (status === "FAILED" || status === "BLOCKED") {
      finalStatus = "FAILED";
    }

    return {
      status: finalStatus,
      toTxHash,
    };
  } catch (error) {
    console.error("getOftTransferStatus failed: %o", error);
    return {
      status: "PENDING_DEPOSIT",
    };
  }
};
