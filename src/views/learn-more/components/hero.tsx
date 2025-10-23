export default function Hero() {
  return (
    <div className="w-full">
      <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] md:p-[30px] mt-[20px]">
        <h1 className="text-[24px] md:text-[32px] font-[700] text-[#0E3616] text-center mb-[20px] leading-[1.3]">
          The Liquidity Layer for Moving Stablecoins at Scale
        </h1>

        <p className="text-[14px] md:text-[16px] text-[#2B3337] leading-[1.8]">
          StableFlow is an intent-based liquidity network dedicated to moving stablecoins. 
          We provide a fast, reliable, and secure bridge that enables effortless cross-chain 
          transfers with the best available rates and 1:1 execution. No hidden fees. And no surprises.
        </p>
      </div>
    </div>
  );
}
