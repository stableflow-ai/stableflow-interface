import { renderTextWithLinks } from "../utils";

export default function BuiltFor() {
  const features = [
    {
      title: "Best Execution for Large Transfers",
      description: "StableFlow's solver network minimises slippage on high-value transfers up to $1M+, providing institutional-grade reliability and price consistency across 12+ chains including Ethereum, Solana, NEAR, Tron, and Aptos.",
      icon: "📈"
    },
    {
      title: "Effortless, Chain-Abstracted Experience",
      description: "One-click transfers eliminate multichain complexity. No destination gas, no manual bridging, no switching wallets. Just connect, specify, and confirm.",
      icon: "✨"
    },
    {
      title: "Transparent Cost Structure",
      description: "With fees as low as one basis point (0.01%) and full cost transparency upfront, you always know exactly what you pay.",
      icon: "💎"
    }
  ];

  return (
    <div className="w-full">
      <h2 className="text-[20px] md:text-[24px] font-[700] text-[#000000] mb-[12px]">
        Built for Institutions, Accessible to Everyone
      </h2>

      <div className="grid grid-cols-1 gap-[16px]">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px]"
          >
            <div className="flex items-start gap-[16px]">
              <div className="flex-grow">
                <h3 className="text-[16px] md:text-[18px] font-[700] text-[#2B3337] mb-[8px]">
                  {feature.title}
                </h3>

                <p className="text-[13px] md:text-[14px] text-[#444C59] leading-[1.6]">
                  {renderTextWithLinks(feature.description)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
