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

  async getBalance(token: any, account: string) {
    try {
      // Use token's rpcUrl if available, otherwise fall back to current provider
      let provider = this.provider;
      if (token.rpcUrl) {
        provider = new ethers.JsonRpcProvider(token.rpcUrl);
      }

      if (token.symbol === "eth" || token.symbol === "ETH" || token.symbol === "native") {
        const balance = await provider.getBalance(account);
        return balance.toString();
      }

      // Use provider instead of signer for read-only operations
      const contract = new ethers.Contract(token.contractAddress, erc20Abi, provider);

      const balance = await contract.balanceOf(account);

      return balance.toString();
    } catch (err) {
      console.error("Error getting token balance:", err);
      return "0";
    }
  }

  async balanceOf(token: any, account: string) {
    return await this.getBalance(token, account);
  }

  /**
   * Estimate gas limit for transfer transaction
   * @param data Transfer data
   * @returns Gas limit estimate
   */
  async estimateGas(data: {
    originAsset: string;
    depositAddress: string;
    amount: string;
  }): Promise<{
    gasLimit: bigint;
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

    return {
      gasLimit
    };
  }
}