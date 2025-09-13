import Amount from "@/components/amount";
import Loading from "@/components/loading/icon";
import useTokenBalance from "@/hooks/use-token-balance";
import useBalancesStore from "@/stores/use-balances";

export default function TokenSimple({ token }: any) {
  const { loading } = useTokenBalance(token, true);
  const balancesStore = useBalancesStore();

  return (
    <div className="mx-[10px] mt-[4px] px-[10px] h-[50px] flex items-center justify-between rounded-[12px] border border-[#EDF0F7] bg-[#EDF0F7]">
      <div className="flex items-center gap-[8px]">
        <img className="w-[24px] h-[24px] rounded-full" src={token.icon} />
        <span className="text-[14px] font-[500]">{token.symbol}</span>
      </div>
      {loading ? (
        <Loading size={14} />
      ) : (
        <Amount amount={balancesStore.balances[token.contractAddress]} />
      )}
    </div>
  );
}
