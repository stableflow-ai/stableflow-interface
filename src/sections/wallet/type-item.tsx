import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import CheckIcon from "./check-icon";
import useWalletStore from "@/stores/use-wallet";
import Address from "./address";

const LABEL = {
  evm: "EVM-based",
  sol: "Solana",
  near: "Near",
  tron: "Tron",
  aptos: "Aptos",
};

export default function TypeItem({ type = "evm", token }: { type: WalletType; token: any; }) {
  const wallets = useWalletsStore();
  const wallet = wallets[type || "evm"];
  const walletStore = useWalletStore();

  return (
    <div
      className="button mx-[10px] py-[6px] flex justify-between items-center"
      onClick={() => {
        if (type === "evm" || !token) {
          return;
        }

        if (!walletStore.isTo && !wallet.account) {
          return;
        }

        if (
          (walletStore.isTo &&
            walletStore.fromToken?.contractAddress === token.contractAddress) ||
          (!walletStore.isTo &&
            walletStore.toToken?.contractAddress === token.contractAddress)
        ) {
          return;
        }

        walletStore.set({
          [walletStore.isTo ? "toToken" : "fromToken"]: token,
          showWallet: false
        });
      }}
    >
      <div className="flex items-center gap-[10px]">
        {token?.chainIcon && (
          <img
            src={token?.chainIcon}
            alt={token?.chainName}
            className="w-[24px] h-[24px]"
          />
        )}

        <span className="text-[16px] font-[500] flex items-center gap-[5px]">
          <span>{LABEL[type]}</span>
          {
            (walletStore.fromToken?.chainType === type || walletStore.toToken?.chainType === type)
              ? (
                <CheckIcon circleColor="#fff" />
              )
              : null
          }
        </span>
      </div>
      {wallet.account ? (
        <Address type={type} />
      ) : (
        <button
          className="duration-300 cursor-pointer w-[90px] h-[32px] rounded-[16px] bg-white shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] text-[14px] text-[#444C59] hover:bg-[#6284F5] hover:text-white"
          onClick={() => {
            wallet.connect();
          }}
        >
          Connect
        </button>
      )}
    </div>
  );
}
