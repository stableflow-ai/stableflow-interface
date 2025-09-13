import { formatAddress } from "@/utils/format/address";
import clsx from "clsx";
import dayjs from "dayjs";

export default function Pending() {
  return (
    <div className="mt-[12px] rounded-[12px] px-[30px] pt-[20px] pb-[30px] bg-white border border-[#F2F2F2] shadow-[0_0_6px_0_rgba(0,0,0,0.10)]">
      <div className="text-[16px] font-[500]">2 Pending transfers</div>
      <div className="mt-[14px] flex flex-wrap">
        {[1, 2, 3].map((item, index) => (
          <PendingItem
            key={item}
            className={clsx(
              index > 1 && "mt-[18px]",
              index % 2 === 0 && "mr-[18px]"
            )}
          />
        ))}
      </div>
    </div>
  );
}

const PendingItem = ({ className }: any) => {
  return (
    <div className={clsx("w-[300px] bg-[#EDF0F7] rounded-[12px]", className)}>
      <div className="rounded-[12px] bg-white border border-[#EDF0F7] p-[12px]">
        <div className="flex items-center gap-[10px]">
          <img src="/usdt.png" alt="usdt" className="w-[28px] h-[28px]" />
          <span>
            <span className="text-[16px] font-bold">1,000</span>{" "}
            <span className="text-[12px] font-[500]">USDT</span>
          </span>
        </div>
        <div className="mt-[10px] flex items-center">
          <ChainAndAddress />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="5"
            height="8"
            viewBox="0 0 5 8"
            fill="none"
            className="ml-[30px] mr-[20px]"
          >
            <path
              d="M1 1L4 4.10345L1 7"
              stroke="#444C59"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <ChainAndAddress />
        </div>
      </div>
      <div className="h-[30px] text-[12px] font-[400] text-center leading-[30px]">
        {dayjs().format("MMM D, YYYY h:mm A")}
      </div>
    </div>
  );
};

const ChainAndAddress = ({ className }: any) => {
  return (
    <div className={clsx("flex items-center gap-[6px]", className)}>
      <img src="/chains/solana.png" alt="sol" className="w-[26px] h-[26px]" />
      <div>
        <div className="text-[12px] font-[500]">Ethereum</div>
        <div className="text-[12px] font-[400]">
          {formatAddress("0x229E549c97C22b139b8C05fba770D94C086853d8", 5, 4)}
        </div>
      </div>
    </div>
  );
};
