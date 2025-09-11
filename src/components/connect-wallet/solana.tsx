import { useMemo, useState } from "react";
import Button from "../button";
import Modal from "../modal";
import { useWallet } from "@solana/wallet-adapter-react";
import { wallets as configWallets } from "@/libs/wallets/solana/provider";

export default function SolanaConnectWallet({ account }: any) {
  const { wallets, connect, select } = useWallet();

  const [showModal, setShowModal] = useState(false);

  const mergedWallets = useMemo(() => {
    return wallets.filter((wallet: any) => wallet.adapter.name === "Phantom");
  }, [configWallets, wallets]);

  return account ? (
    <div>{account}</div>
  ) : (
    <>
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <div className="w-[300px] text-white bg-black rounded-[12px] p-[20px]">
          <div className="text-center pb-[10px]">Connect Wallet</div>
          {mergedWallets.map((wallet) => (
            <div
              className="button flex items-center gap-[8px]"
              key={wallet.adapter.name}
              onClick={async () => {
                select(wallet.adapter.name);
                connect();
              }}
            >
              <img
                src={wallet.adapter.icon}
                alt={wallet.adapter.name}
                className="w-[30px] h-[30px]"
              />
              <span>{wallet.adapter.name}</span>
            </div>
          ))}
        </div>
      </Modal>
      <Button
        onClick={() => {
          setShowModal(true);
        }}
      >
        Connect to Solana
      </Button>
    </>
  );
}
