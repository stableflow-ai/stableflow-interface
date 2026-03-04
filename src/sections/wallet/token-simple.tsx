import Amount from "@/components/amount";
import Loading from "@/components/loading/icon";
import useTokenBalance from "@/hooks/use-token-balance";
import useBalancesStore, { type BalancesState } from "@/stores/use-balances";
import useWalletStore from "@/stores/use-wallet";

export default function TokenSimple({ token }: any) {
  const { loading } = useTokenBalance(token, true);
  const balancesStore = useBalancesStore();
  const walletStore = useWalletStore();

  return (
    <div
      className="mx-[10px] h-[50px] pb-[10px] flex items-center justify-between"
      onClick={() => {
        if (!token) {
          return;
        }

        if (walletStore.isTo) {
          if (token.contractAddress === walletStore.fromToken?.contractAddress) {
            walletStore.set({
              toToken: token,
              fromToken: null,
              showWallet: false,
            });
            return;
          }
        } else {
          if (token.contractAddress === walletStore.toToken?.contractAddress) {
            walletStore.set({
              fromToken: token,
              toToken: null,
              showWallet: false,
            });
            return;
          }
        }

        walletStore.set({
          [walletStore.isTo ? "toToken" : "fromToken"]: token,
          showWallet: false
        });
      }}
    >
      <div className="flex items-center gap-[8px]">
        <img className="w-[24px] h-[24px] rounded-full" src={token.icon} />
        <span className="text-[14px] font-[500]">{token.symbol}</span>
      </div>
      {loading ? (
        <Loading size={14} />
      ) : (
        <Amount
          amount={
            balancesStore[`${token.chainType}Balances` as keyof BalancesState]?.[token.blockchain]?.[
              token.contractAddress
            ]
          }
        />
      )}
    </div>
  );
}
