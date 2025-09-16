import { motion, AnimatePresence } from "framer-motion";
import Title from "./title";
import TypeItem from "./type-item";
import Address from "./address";
import TokenSimple from "./token-simple";
import Token from "./token";
// import { usdcEvm, usdcSol, usdcNear } from "@/config/tokens/usdc";
import { usdtEvm, usdtSol, usdtNear, usdtTron } from "@/config/tokens/usdt";
import useWalletStore from "@/stores/use-wallet";
import useEvmBalances from "@/hooks/use-evm-balances";
import useBalancesStore from "@/stores/use-balances";

export default function Wallet() {
  const walletStore = useWalletStore();
  const balancesStore = useBalancesStore();
  useEvmBalances(walletStore.showWallet);

  return (
    <AnimatePresence>
      {walletStore.showWallet && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.3
          }}
          className="fixed z-10 right-0 md:right-[10px] top-0 md:top-[10px] w-[85vw] md:w-[320px] h-full md:h-[calc(100%-20px)] overflow-hidden rounded-r-[0px] md:rounded-r-[16px] rounded-l-[16px] bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.10)]"
        >
          <Title
            onClose={() => {
              walletStore.set({ showWallet: false });
            }}
          />
          <div className="h-[calc(100%-50px)] overflow-y-auto pb-[20px] px-[15px]">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
