import clsx from "clsx";
import SectionTitle from "../components/section-title";
import { ABOUT_LINKS, RESOURCE_CARDS } from "../config";
import { EXTERNAL_LINK_PROPS } from "../utils";
import SupportLink from "@/components/support-link";

const mobileOrderClassName = {
  x: "order-1",
  telegram: "order-2",
  docs: "order-3",
  paragraph: "order-4",
} as const;

const Resources = () => {
  return (
    <section className="w-full px-4">
      <div className="mx-auto mt-20 w-full max-w-[1030px] md:mt-30">
        <SectionTitle className="text-[26px] md:text-left md:text-[42px]">Resources and updates</SectionTitle>
        <div className="mt-5 grid gap-2.5 md:mt-10 md:gap-5 md:grid-cols-[385px_220px_385px]">
          {RESOURCE_CARDS.map((card, index) => {
            const isDark = card.theme === "dark";

            return (
              <a
                key={card.key}
                href={card.href}
                {...EXTERNAL_LINK_PROPS}
                className={clsx(
                  "group relative flex h-[128px] flex-col justify-between rounded-xl border border-[#F2F2F2] p-4 transition-transform duration-300 hover:scale-105 md:h-auto md:min-h-[145px] md:p-7",
                  isDark ? "bg-black text-white" : "bg-white text-black",
                  mobileOrderClassName[card.key as keyof typeof mobileOrderClassName],
                  "md:order-none",
                  index === 0 && "md:col-span-2",
                  index === 1 && "md:col-start-3",
                  index === 2 && "md:col-start-1 md:row-start-2",
                  index === 3 && "md:col-span-2 md:col-start-2 md:row-start-2",
                )}
              >
                <div className="flex items-center gap-5">
                  <img src={card.icon} alt="" className={clsx("size-8 object-contain", !isDark && "brightness-0")} />
                  <div className="text-xl font-medium leading-[150%]">{card.title}</div>
                </div>
                <p className={clsx("text-base font-light leading-[150%]", isDark ? "text-white/80" : "text-[#444C59]")}>
                  {card.description}
                </p>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-4 top-5 size-4 md:right-7 md:top-7"
                >
                  <path
                    d="M0.5 16.5L16.5 0.5M16.5 0.5H3.54762M16.5 0.5V13.4524"
                    stroke={isDark ? "#FFFFFF" : "#444C59"}
                    stroke-linecap="round"
                  />
                </svg>
              </a>
            );
          })}
        </div>
        <SupportLink />
      </div>
    </section>
  );
};

export default Resources;
