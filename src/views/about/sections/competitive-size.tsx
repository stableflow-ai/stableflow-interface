import clsx from "clsx";
import HoverCard from "../components/hover-card";
import SectionTitle from "../components/section-title";
import { COMPETITIVE_CARDS } from "../config";

const cardByKey = Object.fromEntries(COMPETITIVE_CARDS.map(card => [card.key, card]));
const CARD_ORDER = ["fees", "slippage", "chains", "size", "settlement"] as const;

const CompetitiveSize = () => {
  return (
    <section className="w-full px-4">
      <div className="mx-auto mt-24 w-full max-w-[1060px] md:mt-30">
        <SectionTitle>Competitive at any size</SectionTitle>
        <div className="mt-14 grid gap-5 md:grid-cols-3 md:grid-rows-2">
          {CARD_ORDER.map((key) => {
            const card = cardByKey[key];
            const isDark = card.theme === "dark";
            const isFeatured = card.key === "chains";

            return (
              <HoverCard
                key={card.key}
                className={clsx(
                  "relative min-h-[157px] overflow-hidden p-7 cursor-default",
                  isDark ? "bg-black text-white" : "bg-white text-black",
                  isFeatured && "md:row-span-2",
                )}
              >
                <div className="relative z-[1] flex h-full min-h-[101px] flex-col justify-between gap-10">
                  <h3 className="text-[26px] font-normal leading-none">{card.title}</h3>
                  <p className="max-w-[288px] text-lg font-light leading-[120%]">{card.description}</p>
                </div>
                <img
                  src={card.icon}
                  alt=""
                  className={clsx(
                    "absolute object-contain",
                    isFeatured ? "right-[5%] top-23 w-[90%] md:right-[5%] md:top-23" : "right-7 top-4 size-18",
                  )}
                />
              </HoverCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CompetitiveSize;
