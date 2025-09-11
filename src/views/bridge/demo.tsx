import ConnectWallet from "@/components/connect-wallet";
import useWalletsStore from "@/stores/use-wallets";
import { useChainId, useSwitchChain } from "wagmi";
import Big from "big.js";

const buttonProps = {
  className: "w-[100px] h-[40px]",
  isPrimary: false
};

export default function Bridge() {
  const wallets = useWalletsStore();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">跨链桥接</h1>

      {/* EVM 钱包连接 */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">EVM 钱包</h2>
        <ConnectWallet type="evm" buttonProps={buttonProps} />

        <button
          onClick={() => wallets.evm.disconnect()}
          className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          EVM 断开连接
        </button>

        {/* <button
          className="button ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            console.log(49, "switchChain");
            switchChain({ chainId: 42161 });
          }}
        >
          Switch Chain {chainId}
        </button> */}
      </div>

      {/* Solana 钱包连接 */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Solana 钱包</h2>
        <ConnectWallet type="solana" buttonProps={buttonProps} />
        <button
          onClick={() => wallets.sol.disconnect()}
          className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Solana 断开连接
        </button>
      </div>

      {/* NEAR 钱包连接 */}
      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">NEAR 钱包</h2>
        <ConnectWallet type="near" buttonProps={buttonProps} />
        <button
          onClick={async () => {
            // const balance = await wallets.near.wallet?.getBalance(
            //   "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
            //   "sharproom177.near"
            // );
            // wallets.near.wallet?.transfer({
            //   originAsset:
            //     "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
            //   depositAddress: "amywang.near",
            //   amount: "100000"
            // });
          }}
          className="button ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Transfer
        </button>
        <button
          onClick={() => {
            console.log("near disconnect", wallets.near);
            wallets.near.disconnect();
          }}
          className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          NEAR 断开连接
        </button>
      </div>
    </div>
  );
}
