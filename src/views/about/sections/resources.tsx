import clsx from "clsx";
import SectionTitle from "../components/section-title";
import { ABOUT_LINKS, RESOURCE_CARDS } from "../config";
import { EXTERNAL_LINK_PROPS, getAboutAsset } from "../utils";

const Resources = () => {
  return (
    <section className="w-full px-4">
      <div className="mx-auto mt-24 w-full max-w-[1030px] md:mt-30">
        <SectionTitle align="left">Resources And Updates</SectionTitle>
        <div className="mt-10 grid gap-5 md:grid-cols-[385px_220px_385px]">
          {RESOURCE_CARDS.map((card, index) => {
            const isDark = card.theme === "dark";

            return (
              <a
                key={card.key}
                href={card.href}
                {...EXTERNAL_LINK_PROPS}
                className={clsx(
                  "group relative flex min-h-[145px] flex-col justify-between rounded-xl border border-[#F2F2F2] p-7 transition-transform duration-300 hover:scale-105",
                  isDark ? "bg-black text-white" : "bg-white text-black",
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
                <img
                  src={getAboutAsset(isDark ? "icons/icon-right-white.png" : "icons/icon-right-black.png")}
                  alt=""
                  className="absolute right-7 top-7 size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </a>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm font-light leading-[150%] text-[#444C59]">
          For chain or stablecoin integration proposals, reach out via{" "}
          <a href={ABOUT_LINKS.support} {...EXTERNAL_LINK_PROPS} className="font-medium text-[#6284F5] hover:underline">
            Support →
          </a>
        </p>
      </div>
    </section>
  );
};

export default Resources;
