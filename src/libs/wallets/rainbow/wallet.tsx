import erc20Abi from "@/config/abi/erc20";
import { ethers } from "ethers";
import Big from "big.js";

export default class RainbowWallet {
  provider: any;
  signer: any;

  constructor(_provider: any, _signer?: any) {
    this.provider = _provider;
    this.signer = _signer;
  }

  async needApprove(token: string, spender: string, amount: string) {
    const contract = new ethers.Contract(token, erc20Abi, this.provider);
    const allowance = await contract.allowance(
      await this.signer.getAddress(),
      spender
    );
    return new Big(allowance.toString()).lt(new Big(amount));
  }

  async approve(token: string, spender: string, amount: string) {
    const contract = new ethers.Contract(token, erc20Abi, this.signer);
    const tx = await contract.approve(spender, amount);
    await tx.wait();
    return tx;
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
    await tx.wait();
    return tx;
  }

  async getBalance(token: string, account: string) {
    if (token === "eth") {
      const balance = await this.provider.getBalance(account);
      return balance.toString();
    }
    const contract = new ethers.Contract(token, erc20Abi, this.provider);
    const balance = await contract.balanceOf(account);
    return balance.toString();
  }
}
