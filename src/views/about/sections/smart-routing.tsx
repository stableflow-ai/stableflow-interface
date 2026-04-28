import HoverCard from "../components/hover-card";
import SectionTitle from "../components/section-title";
import { SMART_ROUTING_CARDS } from "../config";

const SmartRouting = () => {
  return (
    <section className="w-full px-4">
      <div className="mx-auto mt-24 grid w-full max-w-[1060px] gap-10 md:mt-30 md:grid-cols-[426px_1fr] md:items-center md:gap-15">
        <div>
          <SectionTitle align="left">Smart Routing</SectionTitle>
          <p className="mt-8 text-lg font-light leading-[150%] text-[#444C59]">
            Transfers between different assets on different chains can require bridging, redeeming, minting, and converting across multiple protocols. StableFlow sequences these steps using pre-signed authorisations. You confirm once. The rest executes automatically.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {SMART_ROUTING_CARDS.map(card => (
            <HoverCard key={card.key} className="min-h-[167px] bg-white p-6 cursor-default">
              <div className="flex h-full flex-col justify-between gap-7">
                <img src={card.logo} alt={card.title} className="h-7 max-w-[136px] object-contain object-left" />
                <p className="text-base font-light leading-[150%] text-[#444C59]">
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
