import { useEffect, useMemo, useState } from "react";
import Button from "../button";
import Modal from "../modal";
import { useWallet } from "@solana/wallet-adapter-react";
import { wallets as configWallets } from "@/libs/wallets/solana/provider";
import useWalletsStore from "@/stores/use-wallets";
import SolanaWallet from "@/libs/wallets/solana/wallet";

export default function SolanaConnectWallet({ account }: any) {
  const { wallets, connect, select, publicKey, disconnect } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const mergedWallets = useMemo(() => {
    return wallets.filter((wallet: any) => wallet.adapter.name === "Phantom");
  }, [configWallets, wallets]);

  const setWallets = useWalletsStore((state) => state.set);

  useEffect(() => {
    if (!mounted) return;
    const solanaWallet = new SolanaWallet();

    setTimeout(() => {
      setWallets({
        sol: {
          account:
            publicKey?.toString() ||
            window?.solana?._publicKey?.toString() ||
            null,
          wallet: solanaWallet,
          connect: () => {},
          disconnect: () => {
            disconnect();
            setWallets({
              sol: {
                account: null,
                wallet: null,
                connect: () => {},
                disconnect: () => {}
              }
            });
          }
        }
      });
    }, 1000);
  }, [publicKey, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                connect()
                  .then(() => {
                    console.log("connect success");
                  })
                  .catch((err) => {
                    console.log("err", err);
                  });
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
