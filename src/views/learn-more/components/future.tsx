export default function Future() {
  const roadmapItems = [
    {
      title: "Expanding Asset Support",
      description: "Starting with USDT, StableFlow will soon support USDC, USD1, and other major stablecoins, enabling a truly unified transfer network.",
      icon: "🌐"
    },
    {
      title: "Smarter Execution",
      description: "Integrations with USDC's CCTP and LayerZero's OFT framework will enable hybrid routing between native bridges and solver networks, optimising execution across all transfer sizes.",
      icon: "🧠"
    },
    {
      title: "Beyond Transfers",
      description: "Next, StableFlow will power cross-chain yield and liquidity strategies. This lays the groundwork for stablecoin-based DeFi at scale.",
      icon: "🚀"
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-[20px] md:text-[24px] font-[700] text-[#0E3616] mb-[12px]">
        The Future of Stablecoin Liquidity
      </h2>

      <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] mb-[20px]">
        <p className="text-[14px] md:text-[16px] text-[#2B3337] leading-[1.8]">
          StableFlow is evolving from a bridge into a universal liquidity layer for compliant 
          stablecoins, powering an entire suite of cross-chain financial operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        {roadmapItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px]"
          >
            <div className="flex items-center gap-[12px] mb-[12px]">
              <span className="text-[32px]">{item.icon}</span>
              <h3 className="text-[16px] font-[700] text-[#2B3337]">
                {item.title}
              </h3>
            </div>

            <p className="text-[13px] md:text-[14px] text-[#444c59] leading-[1.6]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
