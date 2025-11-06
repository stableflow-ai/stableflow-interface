import erc20Abi from "@/config/abi/erc20";
import { numberRemoveEndZero } from "@/utils/format/number";
import Big from "big.js";
import { ethers } from "ethers";

export default class RainbowWallet {
  provider: any;
  signer: any;

  constructor(_provider: any, _signer?: any) {
    this.provider = _provider;
    this.signer = _signer;
  }

  async transfer(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
  }) {
    const { originAsset, depositAddress, amount } = data;

    if (originAsset === "eth") {
      const tx = await this.signer.sendTransaction({
        to: depositAddress,
        value: ethers.parseEther(amount)
      });
      await tx.wait();
      return tx;
    }

    const contract = new ethers.Contract(originAsset, erc20Abi, this.signer);

    const tx = await contract.transfer(depositAddress, amount);
    const result = await tx.wait();

    return result.hash;
  }

  async getBalance(token: string, account: string) {
    try {
      if (token === "eth" || token === "ETH" || token === "native") {
        const balance = await this.provider.getBalance(account);
        return balance.toString();
      }

      const contract = new ethers.Contract(token, erc20Abi, this.signer);

      const balance = await contract.balanceOf(account);

      return balance.toString();
    } catch (err) {
      console.error("Error getting token balance:", err);
      return "0";
    }
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
    const { originAsset, depositAddress, amount } = data;

    if (!this.signer) {
      throw new Error("Signer not available");
    }

    const fromAddress = await this.signer.getAddress();

    let gasLimit: bigint;

    if (originAsset === "eth") {
      // Estimate gas for ETH transfer
      const tx = {
        from: fromAddress,
        to: depositAddress,
        value: ethers.parseEther(amount)
      };
      gasLimit = await this.provider.estimateGas(tx);
    } else {
      // Estimate gas for ERC20 token transfer
      const contract = new ethers.Contract(originAsset, erc20Abi, this.signer);
      gasLimit = await contract.transfer.estimateGas(depositAddress, amount);
    }

    // Increase gas limit by 20% to provide buffer
    gasLimit = (gasLimit * 120n) / 100n;

    // Get gas price
    const feeData = await this.provider.getFeeData();
    const gasPrice = feeData.gasPrice || 0n;

    // Calculate estimated gas cost: gasLimit * gasPrice
    const estimateGas = gasLimit * gasPrice;

    return {
      gasLimit,
      gasPrice,
      estimateGas
    };
  }

  getContract(params: any) {
    const {
      contractAddress,
      abi,
    } = params;

    return new ethers.Contract(contractAddress, abi, this.signer);
  }

  async allowance(params: any) {
    const {
      contractAddress,
      spender,
      address,
      amountWei,
    } = params;

    const contract = new ethers.Contract(contractAddress, erc20Abi, this.signer);

    // get allowance
    let allowance = "0";
    try {
      allowance = await contract.allowance(address, spender);
      allowance = allowance.toString();
    } catch (error) {
      console.log("Error getting allowance: %o", error)
    }

    return {
      contract,
      allowance,
      needApprove: Big(amountWei || 0).gt(allowance || 0),
    };
  }

  async approve(params: any) {
    const {
      contractAddress,
      spender,
      amountWei,
      isApproveMax = false,
    } = params;

    const contract = new ethers.Contract(contractAddress, erc20Abi, this.signer);

    let _amountWei = amountWei;
    if (isApproveMax) {
      _amountWei = ethers.MaxUint256;
    }

    try {
      const tx = await contract.approve(spender, _amountWei);
      const txReceipt = await tx.wait();
      if (txReceipt.status === 1) {
        return true;
      }
      return false;
    } catch (error) {
      console.log("Error approve: %o", error)
    }

    return false;
  }

  async getEstimateGas(params: any) {
    const { gasLimit, price, nativeToken } = params;

    const feeData = await this.provider.getFeeData();
    const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || BigInt("20000000000"); // Default 20 gwei

    const estimateGas = BigInt(gasLimit) * BigInt(gasPrice);
    const estimateGasAmount = Big(estimateGas.toString()).div(10 ** nativeToken.decimals);
    const estimateGasUsd = Big(estimateGasAmount).times(price || 1);

    return {
      gasPrice,
      usd: numberRemoveEndZero(Big(estimateGasUsd).toFixed(20)),
      wei: estimateGas,
      amount: numberRemoveEndZero(Big(estimateGasAmount).toFixed(nativeToken.decimals)),
    };
  }
}
