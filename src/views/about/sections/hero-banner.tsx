import Grainient from "@/components/grainient";
import AboutButton from "../components/about-button";
import { HERO_ACTIONS } from "../config";
import { getAboutAsset } from "../utils";
import clsx from "clsx";

const HeroBanner = () => {
  return (
    <section className="w-full px-0 md:px-4">
      <div className="relative mx-auto h-[641px] w-full max-w-[1380px] overflow-hidden rounded-b-[20px] border border-[#F2F2F2] md:h-[630px] md:rounded-[20px]">
        <Grainient className="absolute inset-0" />
        <img src={getAboutAsset("mobile/banner.png")} alt="" className="absolute inset-0 size-full object-cover md:hidden" />
        <img src={getAboutAsset("banner.png")} alt="" className="absolute inset-0 hidden size-full object-cover md:block" />
        <div className="relative z-[1] flex h-full flex-col items-center px-6 pt-[35px] pb-[29px] text-white md:items-start md:justify-between md:px-15 md:py-14">
          <img src={getAboutAsset("logo-text.png")} alt="StableFlow" className="h-auto w-[171px] object-contain md:w-56" />
          <div className="mt-auto max-w-[715px] pb-0 text-center md:pb-5 md:text-left">
            <h1 className="mx-auto w-[318px] text-[24px] font-medium leading-[120%] md:mx-0 md:w-auto md:text-[30px] md:leading-none">
              The Routing Layer For Large Stablecoin Transfers
            </h1>
            <p className="mx-auto mt-4 w-[330px] text-base font-light leading-[120%] md:mx-0 md:mt-5 md:w-auto md:text-lg md:font-normal md:leading-[150%]">
              StableFlow evaluates every available path at execution time and routes your transfer through the most capital-efficient option. Competitive rates from $1 to $1M+, settling atomically on arrival.
            </p>
            <div className="mt-[34px] flex flex-nowrap justify-center gap-3 md:mt-9 md:flex-wrap md:justify-start md:gap-4">
              {HERO_ACTIONS.map(action => (
                <AboutButton
                  key={action.label}
                  href={action.href}
                  variant={action.variant}
                  className={clsx(
                    "h-11! md:h-13! px-4! md:px-7! whitespace-nowrap",
                  )}
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
