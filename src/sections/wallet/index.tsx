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
      <div className="h-[calc(100%-224px)] overflow-y-auto pb-[20px] px-[10px]">
        <div className="pt-[10px] cursor-pointer hover:rounded-[12px] hover:bg-[#EDF0F7] duration-300 border-b border-[#EDF0EF]">
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
        <div className="mt-[4px] pt-[6px] cursor-pointer hover:rounded-[12px] hover:bg-[#EDF0F7] duration-300 border-b border-[#EDF0EF]">
          <TypeItem type="sol" />
          {/* <TokenSimple token={usdcSol} /> */}
          <TokenSimple token={usdtSol} />
        </div>
        <div className="mt-[4px] pt-[6px] cursor-pointer hover:rounded-[12px] hover:bg-[#EDF0F7] duration-300 border-b border-[#EDF0EF]">
          <TypeItem type="near" />
          {/* <TokenSimple token={usdcNear} /> */}
          <TokenSimple token={usdtNear} />
        </div>
        <div className="mt-[4px] pt-[6px] cursor-pointer hover:rounded-[12px] hover:bg-[#EDF0F7] duration-300 border-b border-[#EDF0EF]">
          <TypeItem type="tron" />
          <TokenSimple token={usdtTron} />
        </div>
      </div>
    </Drawer>
  );
}
