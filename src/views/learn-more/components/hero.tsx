export default function Hero() {
  return (
    <div className="w-full">
      <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] md:p-10 mt-[40px]">
        <h1 className="text-[24px] md:text-[32px] font-[700] text-[#6284F5] text-center mb-[20px] leading-[1.3]">
          The Liquidity Layer for Moving Stablecoins at Scale
        </h1>

        <p className="text-[14px] md:text-[16px] text-[#444C59] leading-[1.8]">
          StableFlow is an intent-based liquidity network dedicated to moving stablecoins. We provide a fast, reliable, and secure crosschain transfer solution that enables effortless movement between chains with the best available rates and 1:1 execution. No hidden fees. No surprises.
        </p>
      </div>
    </div>
  );
}
