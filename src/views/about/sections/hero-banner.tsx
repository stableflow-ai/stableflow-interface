import Grainient from "@/components/grainient";
import AboutButton from "../components/about-button";
import { HERO_ACTIONS } from "../config";
import { getAboutAsset } from "../utils";

const HeroBanner = () => {
  return (
    <section className="px-4 w-full">
      <div className="relative mx-auto h-[560px] w-full max-w-[1380px] overflow-hidden rounded-[20px] border border-[#F2F2F2] md:h-[630px]">
        <Grainient className="absolute inset-0" />
        <img src={getAboutAsset("banner.png")} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="relative z-[1] flex h-full flex-col justify-between px-6 py-9 text-white md:px-15 md:py-14">
          <img src={getAboutAsset("logo-text.png")} alt="StableFlow" className="h-auto w-48 object-contain md:w-56" />
          <div className="max-w-[715px] pb-2 md:pb-5">
            <h1 className="text-[24px] font-medium leading-[120%] md:text-[30px] md:leading-none">
              The Routing Layer For Large Stablecoin Transfers
            </h1>
            <p className="mt-5 text-base font-normal leading-[150%] md:text-lg">
              StableFlow evaluates every available path at execution time and routes your transfer through the most capital-efficient option. Competitive rates from $1 to $1M+, settling atomically on arrival.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              {HERO_ACTIONS.map(action => (
                <AboutButton
                  key={action.label}
                  href={action.href}
                  variant={action.variant}
                  className={action.variant === "primary" ? "min-w-[195px]" : "min-w-[174px]"}
                >
                  {action.label}
                </AboutButton>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
