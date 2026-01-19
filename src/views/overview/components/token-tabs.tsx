import clsx from "clsx";
import { tokens } from "../config";

interface TokenTabsProps {
  selectedToken: "USDT" | "USDC" | "USD1";
  onTokenChange: (token: "USDT" | "USDC" | "USD1") => void;
}

export default function TokenTabs({ selectedToken, onTokenChange }: TokenTabsProps) {
  return (
    <div className="w-full">
      <div className="text-[16px] font-[500] text-[#0E3616] mb-[12px] pl-[40px] md:pl-0">
        Select Token
      </div>
      <div className="flex items-center gap-[12px]">
        {tokens.map((token) => (
          <button
            key={token.symbol}
            onClick={() => token.available && onTokenChange(token.symbol as "USDT" | "USDC" | "USD1")}
            disabled={!token.available}
            className={clsx(
              "flex items-center gap-[8px] px-[16px] py-[10px] rounded-[12px] transition-all duration-300",
              selectedToken === token.symbol
                ? "bg-white shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] border border-transparent"
                : "border-dashed border-[#B3BBCE] border",
              token.available
                ? "cursor-pointer hover:opacity-80"
                : "cursor-not-allowed opacity-50"
            )}
          >
            <img
              src={token.icon}
              alt={token.symbol}
              className={clsx(
                "w-[20px] h-[20px]",
                !token.available && "grayscale"
              )}
            />
            <span className="text-[14px] font-[500] text-[#2B3337]">
              {token.symbol}
            </span>
            {!token.available && (
              <span className="text-[10px] text-[#9FA7BA]">soon</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
