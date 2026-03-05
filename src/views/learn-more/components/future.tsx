import { renderTextWithLinks } from "../utils";

export default function Future() {
  const roadmapItems = [
    {
      title: "Expanding Asset Support",
      description: "Currently supporting USDT and USDC, StableFlow will soon add USD1, USDH, USAT, PYUSD, and RLUSD, creating a truly unified transfer network for major stablecoin assets.",
      icon: "🌐"
    },
    {
      title: "Smarter Execution",
      description: "Native integrations with CCTP (for USDC) and LayerZero OFT (for USDT0) enable hybrid routing between native mint-and-burn mechanisms and solver networks. This ensures optimal execution across all transfer sizes.",
      icon: "🧠"
    },
    {
      title: "Beyond Transfers",
      description: "Next, StableFlow is set to be powered by the [Stablecoin Transport Protocol (STP)](https://www.stablecointransport.com/). This lays the groundwork for stablecoin-based DeFi at institutional scale.",
      icon: "🚀"
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-[20px] md:text-[24px] font-[700] text-[#6284F5] mb-[12px]">
        The Future of Stablecoin Liquidity
      </h2>

      <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] mb-[20px]">
        <p className="text-[14px] md:text-[16px] text-[#2B3337] leading-[1.8]">
          StableFlow is evolving from a transfer protocol into a universal liquidity layer for compliant stablecoins, powering an entire suite of crosschain financial operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
        {roadmapItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px]"
          >
            <div className="flex items-center gap-[12px] mb-[12px]">
              <h3 className="text-[16px] font-[700] text-[#2B3337]">
                {item.title}
              </h3>
            </div>

            <p className="text-[13px] md:text-[14px] text-[#444c59] leading-[1.6]">
              {renderTextWithLinks(item.description)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
