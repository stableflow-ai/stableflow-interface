import ConnectWallet from "@/components/connect-wallet";
import useWalletsStore from "@/stores/use-wallets";
import { useChainId, useSwitchChain } from "wagmi";

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
          onClick={async () => {
            wallets.sol.wallet?.transfer({
              originAsset: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              depositAddress: "B2WpzSJdDF6XSWXo46bxHjdUx4mRgybcYcUfZEAAfFpq",
              amount: "100000"
            });
            // console.log(23, "transfer");
            // const balance = await wallets.evm.wallet?.getBalance(
            //   "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
            //   "0x229E549c97C22b139b8C05fba770D94C086853d8"
            // );
            // console.log(28, "balance", balance, wallets.evm.chainId);
          }}
          className="button ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Transfer
        </button>
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
