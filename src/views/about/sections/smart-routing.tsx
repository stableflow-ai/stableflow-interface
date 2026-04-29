import HoverCard from "../components/hover-card";
import SectionTitle from "../components/section-title";
import { SMART_ROUTING_CARDS } from "../config";

const SmartRouting = () => {
  return (
    <section className="w-full px-4">
      <div className="mx-auto mt-20 grid w-full max-w-[1060px] gap-5 md:mt-30 md:grid-cols-[426px_1fr] md:items-center md:gap-15">
        <div>
          <SectionTitle align="left" className="text-[26px] md:text-[42px]">Smart Routing</SectionTitle>
          <p className="mt-4 text-base font-light leading-[120%] text-[#444C59] md:mt-8 md:text-lg md:leading-[150%]">
            Transfers between different assets on different chains can require bridging, redeeming, minting, and converting across multiple protocols. StableFlow sequences these steps using pre-signed authorisations. You confirm once. The rest executes automatically.
          </p>
        </div>
        <div className="grid gap-2.5 md:gap-4 md:grid-cols-2">
          {SMART_ROUTING_CARDS.map(card => (
            <HoverCard key={card.key} className="relative min-h-[132px] overflow-hidden bg-white p-5 cursor-default md:min-h-[167px] md:p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(98,132,245,0.14),rgba(255,255,255,0)_48%)]" />
              <div className="relative z-[1] flex h-full flex-col justify-between gap-7">
                <img src={card.logo} alt={card.title} className="h-[30px] max-w-[136px] object-contain object-left md:h-7" />
                <p className="text-sm font-light leading-[120%] text-[#444C59] md:text-base md:leading-[150%]">
                  {card.description}
                </p>
              </div>
            </HoverCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartRouting;
