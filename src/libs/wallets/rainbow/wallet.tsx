import erc20Abi from "@/config/abi/erc20";
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
      if (token === "eth") {
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
  async estimateGas(data: {
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
}