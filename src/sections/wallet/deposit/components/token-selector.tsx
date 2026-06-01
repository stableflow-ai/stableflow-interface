import Amount from "@/components/amount";
import Loading from "@/components/loading/icon";
import CheckIcon from "@/sections/wallet/check-icon";
import useBalancesStore from "@/stores/use-balances";
import { useDepositStore } from "@/stores/use-deposit";
import clsx from "clsx";
import { DEPOSIT_TOKEN_SYMBOLS, getDepositTokenMeta } from "../config";
import { getTokenTotalBalance } from "../utils";

export default function TokenSelector({
  balancesLoading = false,
}: {
  balancesLoading?: boolean;
}) {
  const depositStore = useDepositStore();
  const balancesStore = useBalancesStore();
  const selectedSymbol = depositStore.token?.symbol;

  return (
    <div>
      <div className="text-[#9FA7BA] text-[14px] px-[4px] mb-[6px]">Token</div>
      <div className="border border-[#EDF0F7] rounded-[12px] overflow-hidden">
        {DEPOSIT_TOKEN_SYMBOLS.map((symbol) => {
          const meta = getDepositTokenMeta(symbol);
          const totalBalance = getTokenTotalBalance(symbol, balancesStore);
          const isSelected = selectedSymbol === symbol;

          return (
            <button
              key={symbol}
              type="button"
              className={clsx(
                "w-full p-[10px] flex justify-between items-center duration-300",
                isSelected ? "bg-[#FAFBFF]" : "hover:bg-[#FAFBFF]"
              )}
              onClick={() => depositStore.setTokenBySymbol(symbol)}
            >
              <div className="flex items-center gap-[8px]">
                <img
                  src={meta.icon}
                  alt=""
                  className="w-[24px] h-[24px] rounded-full"
                />
                <span className="text-[14px] font-[500] text-[#444C59]">
                  {symbol}
                </span>
              </div>
              <div className="flex items-center gap-[8px]">
                {isSelected && balancesLoading ? (
                  <Loading size={14} />
                ) : (
                  <Amount amount={totalBalance} />
                )}
                {isSelected && <CheckIcon />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
