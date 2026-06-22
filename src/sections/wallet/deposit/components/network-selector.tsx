import type { TokenChain } from "@/config/chains";
import Amount from "@/components/amount";
import Loading from "@/components/loading/icon";
import CheckIcon from "@/sections/wallet/check-icon";
import useTokenBalance from "@/hooks/use-token-balance";
import useBalancesStore from "@/stores/use-balances";
import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import { useDepositStore } from "@/stores/use-deposit";
import clsx from "clsx";
import { getDepositNetworksBySymbol } from "../config";
import { getNetworkBalance } from "../utils";

function NetworkBalance({
  chain,
  enabled,
  evmBalancesLoading,
}: {
  chain: TokenChain;
  enabled: boolean;
  evmBalancesLoading: boolean;
}) {
  const balancesStore = useBalancesStore();
  const wallet = useWalletsStore((s) => s[chain.chainType as WalletType]);
  const isEvm = chain.chainType === "evm";
  const { loading } = useTokenBalance(
    chain,
    enabled && !isEvm && !!wallet?.account
  );

  const balance = getNetworkBalance(chain, balancesStore);
  const showLoading = isEvm ? evmBalancesLoading : loading;

  if (showLoading) {
    return <Loading size={14} />;
  }

  return <Amount amount={balance} />;
}

export default function NetworkSelector({
  evmBalancesLoading = false,
}: {
  evmBalancesLoading?: boolean;
}) {
  const depositStore = useDepositStore();
  const walletsStore = useWalletsStore();

  const symbol = depositStore.token?.symbol;
  const networks = symbol ? getDepositNetworksBySymbol(symbol) : [];
  const selectedNetwork = depositStore.network;

  if (!symbol) return null;

  return (
    <div>
      <div className="text-[#9FA7BA] text-[14px] px-[4px] mb-[6px]">Network</div>
      <div className="border border-[#EDF0F7] rounded-[12px] overflow-hidden max-h-[220px] overflow-y-auto">
        {networks.map((chain) => {
          const isSelected = selectedNetwork === chain.blockchain;
          const balanceEnabled =
            depositStore.visible && depositStore.token?.symbol === chain.symbol;

          return (
            <button
              key={`${chain.chainType}-${chain.blockchain}-${chain.contractAddress}`}
              type="button"
              className={clsx(
                "w-full p-[10px] flex justify-between items-center duration-300",
                isSelected ? "bg-[#FAFBFF]" : "hover:bg-[#FAFBFF]"
              )}
              onClick={() => {
                depositStore.setTokenAndNetwork(chain, chain.blockchain);
                const wallet = walletsStore[chain.chainType as WalletType];
                if (wallet?.account) {
                  depositStore.setRecipientAddress(wallet.account);
                } else {
                  depositStore.setRecipientAddress("");
                }
              }}
            >
              <div className="flex items-center gap-[8px]">
                <img
                  src={chain.chainIcon}
                  alt=""
                  className="w-[24px] h-[24px] rounded-full"
                />
                <span className="text-[14px] text-[#444C59]">{chain.chainName}</span>
              </div>
              <div className="flex items-center gap-[8px]">
                <NetworkBalance
                  chain={chain}
                  enabled={balanceEnabled}
                  evmBalancesLoading={evmBalancesLoading}
                />
                {isSelected && <CheckIcon />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
