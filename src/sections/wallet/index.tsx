import TypeItem from "./type-item";
import TokenSimple from "./token-simple";
import Token from "./token";
// import { usdcEvm, usdcSol, usdcNear } from "@/config/tokens/usdc";
import { usdtEvm, usdtSol, usdtNear, usdtTron } from "@/config/tokens/usdt";
import useWalletStore from "@/stores/use-wallet";
import useWalletsStore from "@/stores/use-wallets";
import useEvmBalances from "@/hooks/use-evm-balances";
import useBalancesStore from "@/stores/use-balances";
import Total from "./total";
import Drawer from "@/components/drawer";
import { useMemo } from "react";

export default function Wallet() {
  const walletStore = useWalletStore();
  const walletsStore = useWalletsStore();
  const balancesStore = useBalancesStore();
  useEvmBalances(walletStore.showWallet);

  const walletConnected = useMemo(() => {
    return !!walletsStore.evm.account || !!walletsStore.sol.account || !!walletsStore.near.account || !!walletsStore.tron.account;
  }, [walletsStore]);

  return (
    <Drawer
      title={walletConnected ? "My Wallets" : "Connect Wallet"}
      open={walletStore.showWallet}
      onClose={() => {
        walletStore.set({ showWallet: false });
      }}
    >
      <Total />
      <div className="h-[calc(100%-201px)] overflow-y-auto pt-[8px] pb-[20px] px-[10px]">
        <div className="pt-[10px] cursor-pointer rounded-[12px] border border-[#EDF0F7] bg-[linear-gradient(90deg,_rgba(185,215,255,0.20)_0%,_rgba(185,215,255,0.00)_50%)] hover:bg-[#EDF0F7] duration-300">
          <TypeItem type="evm" />
          {/* <Token
              token={usdcEvm}
              expand={walletStore.usdcExpand}
              onExpand={() => {
                walletStore.set({ usdcExpand: !walletStore.usdcExpand });
              }}
              balances={balancesStore.evmBalances}
              loading={loading}
              totalBalance={balancesStore.evmBalances.usdcBalance}
            /> */}
          <Token
            token={usdtEvm}
            expand={walletStore.usdtExpand}
            onExpand={() => {
              walletStore.set({ usdtExpand: !walletStore.usdtExpand });
            }}
            balances={balancesStore.evmBalances}
            // loading={loading}
            totalBalance={balancesStore.evmBalances.usdtBalance}
          />
        </div>
        <div className="mt-[4px] pt-[6px] cursor-pointer rounded-[12px] border border-[#EDF0F7] bg-[linear-gradient(90deg,_rgba(248,108,255,0.20)_0%,_rgba(248,108,255,0.00)_50%)] hover:bg-[#EDF0F7] duration-300">
          <TypeItem type="sol" />
          {/* <TokenSimple token={usdcSol} /> */}
          <TokenSimple token={usdtSol} />
        </div>
        <div className="mt-[4px] pt-[6px] cursor-pointer rounded-[12px] border border-[#EDF0F7] bg-[linear-gradient(90deg,_rgba(1,237,151,0.20)_0%,_rgba(1,237,151,0.00)_50%)] hover:bg-[#EDF0F7] duration-300">
          <TypeItem type="near" />
          {/* <TokenSimple token={usdcNear} /> */}
          <TokenSimple token={usdtNear} />
        </div>
        <div className="mt-[4px] pt-[6px] cursor-pointer rounded-[12px] border border-[#EDF0F7] bg-[linear-gradient(90deg,_rgba(210,31,16,0.20)_0%,_rgba(210,31,16,0.00)_50%)] hover:bg-[#EDF0F7] duration-300">
          <TypeItem type="tron" />
          <TokenSimple token={usdtTron} />
        </div>
      </div>
    </Drawer>
  );
}
