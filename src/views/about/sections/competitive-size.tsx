import clsx from "clsx";
import HoverCard from "../components/hover-card";
import SectionTitle from "../components/section-title";
import { COMPETITIVE_CARDS } from "../config";

const cardByKey = Object.fromEntries(COMPETITIVE_CARDS.map(card => [card.key, card]));
const CARD_ORDER = ["fees", "slippage", "chains", "size", "settlement"] as const;
const mobileOrderClassName = {
  fees: "order-1",
  slippage: "order-2",
  size: "order-3",
  settlement: "order-4",
  chains: "order-5",
} as const;

const CompetitiveSize = () => {
  return (
    <section className="w-full px-4">
      <div className="mx-auto mt-20 w-full max-w-[1060px] md:mt-30">
        <SectionTitle className="text-[26px] md:text-[42px]">Competitive at any size</SectionTitle>
        <div className="mt-5 grid grid-cols-2 gap-2.5 md:mt-14 md:grid-cols-3 md:grid-rows-2 md:gap-5">
          {CARD_ORDER.map((key) => {
            const card = cardByKey[key];
            const isDark = card.theme === "dark";
            const isFeatured = card.key === "chains";

            return (
              <HoverCard
                key={card.key}
                className={clsx(
                  "relative h-[126px] overflow-hidden p-3 cursor-default md:h-auto md:min-h-[157px] md:p-7",
                  isDark ? "bg-black text-white" : "bg-white text-black",
                  mobileOrderClassName[card.key as keyof typeof mobileOrderClassName],
                  "md:order-none",
                  isFeatured && "col-span-2 h-[249px] md:col-span-1 md:h-auto md:row-span-2",
                )}
              >
                <div className="relative z-[1] flex h-full min-h-0 flex-col justify-between gap-4 md:min-h-[101px] md:gap-10">
                  <h3 className="text-xl font-normal leading-none md:text-[26px]">{card.title}</h3>
                  <p className={clsx("font-light leading-[120%]", isFeatured ? "max-w-[341px] text-sm md:max-w-[288px] md:text-lg" : "max-w-[156px] text-sm md:max-w-[288px] md:text-lg")}>{card.description}</p>
                </div>
                {isFeatured ? (
                  <>
                    <img
                      src={card.mobileIcon ?? card.icon}
                      alt=""
                      className="absolute left-1/2 top-4 w-[335px] -translate-x-1/2 object-contain md:hidden"
                    />
                    <img
                      src={card.icon}
                      alt=""
                      className="absolute right-[5%] top-23 hidden w-[90%] object-contain md:block"
                    />
                  </>
                ) : (
                  <img
                    src={card.icon}
                    alt=""
                    className="absolute right-3 top-3 size-11 object-contain md:right-7 md:top-4 md:size-18"
                  />
                )}
              </HoverCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CompetitiveSize;
