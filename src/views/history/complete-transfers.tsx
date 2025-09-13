import dayjs from "dayjs";

export default function CompleteTransfers() {
  return (
    <div className="mt-[12px] rounded-[12px] px-[30px] pt-[20px] pb-[30px] bg-white border border-[#F2F2F2] shadow-[0_0_6px_0_rgba(0,0,0,0.10)]">
      <div className="text-[16px] font-[500]">6 Completed transfers</div>
      <div className="mt-[14px]">
        <CompleteTransferItem />
      </div>
    </div>
  );
}

const CompleteTransferItem = () => {
  return (
    <div className="flex items-center justify-between border-b border-[#EBF0F8] py-[10px]">
      <div className="flex items-center gap-[10px]">
        <img src="/usdt.png" alt="usdt" className="w-[28px] h-[28px]" />
        <span>
          <span className="text-[16px] font-bold">1,000</span>{" "}
          <span className="text-[12px] font-[500]">USDT</span>
        </span>
      </div>
      <div className="flex items-center gap-[10px]">
        <img src="/chains/solana.png" alt="sol" className="w-[26px] h-[26px]" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="5"
          height="10"
          viewBox="0 0 5 10"
          fill="none"
        >
          <path
            d="M1 1L4 5.13793L1 9"
            stroke="#444C59"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <img src="/chains/solana.png" alt="sol" className="w-[26px] h-[26px]" />
        <div className="text-[14px] font-[500]">
          {dayjs().format("MMM D, YYYY h:mm A")}
        </div>
        <button className="text-[14px] font-[500] underline ml-[10px] button">
          Tx
        </button>
      </div>
    </div>
  );
};
