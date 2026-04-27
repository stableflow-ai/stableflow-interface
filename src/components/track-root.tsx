import { useTrack } from "@/hooks/use-track";
import useWalletsStore from "@/stores/use-wallets";
import { useEffect, useRef } from "react";

type WalletSnapshot = { address: string; walletName: string | null } | null;

const TrackRoot = () => {
  const { addDisconnect, addConnect } = useTrack({ isRoot: true });
  const addLogoutRef = useRef(addDisconnect);
  addLogoutRef.current = addDisconnect;

  const evmAccount = useWalletsStore((s) => s.evm.account);
  const evmWalletName = useWalletsStore((s) => s.evm.walletName);
  const solAccount = useWalletsStore((s) => s.sol.account);
  const solWalletName = useWalletsStore((s) => s.sol.walletName);
  const nearAccount = useWalletsStore((s) => s.near.account);
  const nearWalletName = useWalletsStore((s) => s.near.walletName);
  const aptosAccount = useWalletsStore((s) => s.aptos.account);
  const aptosWalletName = useWalletsStore((s) => s.aptos.walletName);
  const tronAccount = useWalletsStore((s) => s.tron.account);
  const tronWalletName = useWalletsStore((s) => s.tron.walletName);
  const tonAccount = useWalletsStore((s) => s.ton.account);
  const tonWalletName = useWalletsStore((s) => s.ton.walletName);

  const prevRef = useRef<Record<string, WalletSnapshot>>({
    evm: null,
    sol: null,
    near: null,
    aptos: null,
    tron: null,
    ton: null,
  });

  useEffect(() => {
    const p = prevRef.current;
    const report = (snapshot: WalletSnapshot, walletType: string) => {
      if (!snapshot?.address) return;
      addLogoutRef.current({
        address: snapshot.address,
        walletName: snapshot.walletName,
        walletType,
      });
    };
    const check = (
      key: keyof typeof p,
      account: string | null,
      walletName: string | null
    ) => {
      const prevSnapshot = p[key];
      if (prevSnapshot?.address && !account) report(prevSnapshot, key);
      p[key] = account ? { address: account, walletName } : null;
    };
    check("evm", evmAccount, evmWalletName ?? null);
    check("sol", solAccount, solWalletName ?? null);
    check("near", nearAccount, nearWalletName ?? null);
    check("aptos", aptosAccount, aptosWalletName ?? null);
    check("tron", tronAccount, tronWalletName ?? null);
    check("ton", tonAccount, tonWalletName ?? null);
  }, [
    evmAccount,
    evmWalletName,
    solAccount,
    solWalletName,
    nearAccount,
    nearWalletName,
    aptosAccount,
    aptosWalletName,
    tronAccount,
    tronWalletName,
    tonAccount,
    tonWalletName,
  ]);

  useEffect(() => {
    if (!evmAccount) return;
    addConnect({ address: evmAccount, walletName: evmWalletName, walletType: "evm" });
  }, [evmAccount]);

  useEffect(() => {
    if (!solAccount) return;
    addConnect({ address: solAccount, walletName: solWalletName, walletType: "sol" });
  }, [solAccount]);

  useEffect(() => {
    if (!nearAccount) return;
    addConnect({ address: nearAccount, walletName: nearWalletName, walletType: "near" });
  }, [nearAccount]);

  useEffect(() => {
    if (!aptosAccount) return;
    addConnect({ address: aptosAccount, walletName: aptosWalletName, walletType: "aptos" });
  }, [aptosAccount]);

  useEffect(() => {
    if (!tronAccount) return;
    addConnect({ address: tronAccount, walletName: tronWalletName, walletType: "tron" });
  }, [tronAccount]);

  useEffect(() => {
    if (!tonAccount) return;
    addConnect({ address: tonAccount, walletName: tonWalletName, walletType: "ton" });
  }, [tonAccount]);

  return null;
};

export default TrackRoot;
