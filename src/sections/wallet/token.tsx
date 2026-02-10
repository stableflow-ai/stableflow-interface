import Amount from "@/components/amount";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/components/loading/icon";
import CheckIcon from "./check-icon";
import useWalletStore from "@/stores/use-wallet";
import { useSwitchChain } from "wagmi";
import { isChainDisabled } from "@/config/token-restrictions";

export default function Token({
  token,
  expand,
  onExpand,
  balances,
  loading,
  totalBalance
}: any) {
  const walletStore = useWalletStore();
  const { switchChain } = useSwitchChain();
  return (
    <div className="rounded-[12px]">
      <div className="flex items-center justify-between h-[50px] mx-[10px]">
        <div className="flex items-center gap-[8px]">
          <img className="w-[24px] h-[24px] rounded-full" src={token.icon} />
          <span className="text-[14px] font-[500]">{token.symbol}</span>
        </div>
        <div className="flex items-center gap-[4px]">
          <Amount amount={totalBalance} />
        </div>
      </div>
      <AnimatePresence>
        {expand && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#DBDFE7] pt-[10px] pb-[4px]">
              <div className="text-[#9FA7BA] text-[14px] flex justify-between items-center px-[10px]">
                <span>Network</span>
                <span>{token.symbol} Balance</span>
              </div>
              {token.chains.map((chain: any) => {
                // Check if chain is disabled: when selecting to token, check if from token causes this chain to be disabled
                const isDisabled = walletStore.isTo
                  ? isChainDisabled(
                    walletStore.fromToken?.symbol,
                    token.symbol,
                    chain.chainName
                  )
                  : false;

                return (
                  <div
                    key={chain.chainName}
                    className={`p-[10px] duration-300 flex justify-between items-center ${isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:bg-[#FAFBFF]"
                      }`}
                    onClick={async () => {
                      // Prevent click if disabled
                      if (isDisabled) {
                        return;
                      }

                      const mergedToken = {
                        symbol: token.symbol,
                        decimals: token.decimals,
                        icon: token.icon,
                        ...chain
                      };

                      if (!walletStore.isTo) {
                        await switchChain({ chainId: chain.chainId });
                      }

                      if (walletStore.isTo) {
                        if (mergedToken.contractAddress === walletStore.fromToken?.contractAddress) {
                          walletStore.set({
                            toToken: mergedToken,
                            fromToken: null,
                            showWallet: false,
                          });
                          return;
                        }
                      } else {
                        if (mergedToken.contractAddress === walletStore.toToken?.contractAddress) {
                          walletStore.set({
                            fromToken: mergedToken,
                            toToken: null,
                            showWallet: false,
                          });
                          return;
                        }
                      }

                      walletStore.set({
                        [walletStore.isTo ? "toToken" : "fromToken"]: mergedToken,
                        selectedToken: token.symbol,
                        showWallet: false
                      });
                    }}
                  >
                    <div className="flex items-center gap-[8px]">
                      <img src={chain.chainIcon} className="w-[24px] h-[24px]" />
                      <span className="text-[14px] text-[#444C59]">
                        {chain.chainName}
                      </span>
                      {(walletStore.fromToken?.contractAddress ===
                        chain.contractAddress ||
                        walletStore.toToken?.contractAddress ===
                        chain.contractAddress) && (
                          <CheckIcon circleColor={"#fff"} />
                        )}
                    </div>
                    {loading ? (
                      <Loading size={14} />
                    ) : (
                      <Amount
                        amount={balances?.[chain.chainId]?.[chain.contractAddress]}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const ExpandButton = ({
  expand,
  onClick
}: {
  expand: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      className="w-[26px] h-[26px] ml-[10px] flex justify-center items-center button rounded-[8px] bg-white shadow-[0_0_4px_0_rgba(0,0,0,0.15)]"
      onClick={onClick}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="5"
        viewBox="0 0 10 5"
        fill="none"
        animate={{ rotate: !expand ? 180 : 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.3
        }}
      >
        <path
          d="M1 4L5.13793 1L9 4"
          stroke="#A1A699"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </button>
  );
};

export const TokenChains = (props: any) => {
  const { onExpand, expand, token } = props;

  const chains = token.chains;

  return (
    <div className="flex justify-between items-center mx-[10px] pb-[10px]">
      <div className="flex items-center shrink-0">
        {
          expand ? null : chains.map((chain: any) => (
            <img
              src={chain.chainIcon}
              alt=""
              className="w-[24px] h-[24px] rounded-[6px] border border-[#fff] object-center object-contain not-first:ml-[-6px]"
            />
          ))
        }
      </div>
      <ExpandButton
        onClick={() => {
          onExpand(!expand);
        }}
        expand={expand}
      />
    </div>
  );
};
