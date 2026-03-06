import TypeItem from "./type-item";
import TokenSimple from "./token-simple";
import Token, { TokenChains } from "./token";
// import { usdcEvm, usdcSol, usdcNear } from "@/config/tokens/usdc";
// import { usdtEvm, usdtSol, usdtNear, usdtTron } from "@/config/tokens/usdt";
import useWalletStore from "@/stores/use-wallet";
import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import useEvmBalances from "@/hooks/use-evm-balances";
import useBalancesStore from "@/stores/use-balances";
import Drawer from "@/components/drawer";
import { lazy, Suspense, useMemo } from "react";
import { stablecoinWithChains } from "@/config/tokens";
import { chainTypes } from "@/config/chains";

const Assets = lazy(() => import("@/views/bridge/components/assets"));
const Total = lazy(() => import("./total"));

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
      <Suspense fallback={null}>
        <Assets />
      </Suspense>
      <Suspense fallback={null}>
        <Total />
      </Suspense>
      <div className="h-[calc(100%-265px)] overflow-y-auto pt-[8px] pb-[20px] px-[10px]">
        {
          !!stablecoinWithChains.evm[walletStore.selectedToken] && (
            <div
              className="pt-[10px] cursor-pointer rounded-[12px] border border-[#EDF0F7] hover:bg-[#EDF0F7] duration-300"
              style={{
                backgroundImage: chainTypes["evm"].bg,
              }}
            >
              <TypeItem
                type="evm"
                token={stablecoinWithChains.evm[walletStore.selectedToken]}
              />
              <Token
                token={stablecoinWithChains.evm[walletStore.selectedToken]}
                expand={walletStore.usdtExpand}
                onExpand={() => {
                  walletStore.set({ usdtExpand: !walletStore.usdtExpand });
                }}
                balances={balancesStore.evmBalances}
                // loading={loading}
                totalBalance={balancesStore.evmBalances[`${walletStore.selectedToken.toLowerCase()}Balance`]}
              />
              <TokenChains
                token={stablecoinWithChains.evm[walletStore.selectedToken]}
                expand={walletStore.usdtExpand}
                onExpand={() => {
                  walletStore.set({ usdtExpand: !walletStore.usdtExpand });
                }}
              />
            </div>
          )
        }
        {
          Object.entries(stablecoinWithChains)
            .filter(([chain, tokens]) => !["evm"].includes(chain) && !!(tokens as any)[walletStore.selectedToken])
            .map(([chain, tokens]) => {
              return (
                <div
                  key={chain}
                  className="mt-[4px] pt-[6px] cursor-pointer rounded-[12px] border border-[#EDF0F7] hover:bg-[#EDF0F7] duration-300"
                  style={{
                    backgroundImage: chainTypes[chain as WalletType].bg,
                  }}
                >
                  <TypeItem
                    type={chain as WalletType}
                    token={(tokens as any)[walletStore.selectedToken]}
                  />
                  {/* <TokenSimple token={usdcSol} /> */}
                  <TokenSimple token={(tokens as any)[walletStore.selectedToken]} />
                </div>
              );
            })
        }
      </div>
    </Drawer>
  );
}
