import erc20Abi from "@/config/abi/erc20";
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

  getContract(params: any) {
    const {
      contractAddress,
      abi,
    } = params;

    return new ethers.Contract(contractAddress, abi, this.signer);
  }

  async approve(params: any) {
    const {
      contractAddress,
      spender,
      address,
      amountWei,
      isApprove = true,
      isApproveMax = false,
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

    if (Big(amountWei || 0).lte(allowance || 0)) {
      return true;
    }

    if (!isApprove) {
      return false;
    }

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

  async call(params: any) {
    const {
      contractAddress,
      abi,
      methodName,
      options,
      param,
      isEstimateGas = false,
    } = params;

    const opts: any = {};

    if (options?.value) {
      opts.value = options.value;
    }

    if (isEstimateGas) {
      const gasLimit = await this.estimateGas(params);
      opts.gasLimit = gasLimit;
    }

    try {
      const contract = new ethers.Contract(contractAddress, abi, this.signer);
      return contract[methodName](...param, opts);
    } catch (error) {
      console.log("Error %s calling %s:", contractAddress, methodName, error);
      return error;
    }
  }

  async estimateGas(params: any) {
    const {
      contractAddress,
      abi,
      methodName,
      options,
      param,
    } = params;

    const opts = options?.value ? { value: options.value } : {};

    try {
      const contract = new ethers.Contract(contractAddress, abi, this.signer);
      const gas = await contract[methodName].estimateGas(...param, opts);
      return Big(gas.toString() || 0).times(1.2).toFixed(0);
    } catch (error) {
      console.log("Error %s estimating %s gas:", contractAddress, methodName, error);
    }
    return options?.defaultGasLimit || "4000000";
  }
}
