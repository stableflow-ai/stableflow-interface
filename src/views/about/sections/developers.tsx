import AboutButton from "../components/about-button";
import { ABOUT_LINKS } from "../config";
import { getAboutAsset } from "../utils";

const Developers = () => {
  return (
    <section className="mt-20 w-full bg-black py-10 md:mt-30 md:py-16">
      <div className="mx-auto grid w-full max-w-[1190px] gap-8 px-4 md:grid-cols-[470px_1fr] md:items-center md:gap-12">
        <div className="text-white">
          <div className="text-lg font-light leading-none">For Developers</div>
          <h2 className="mt-7 text-[26px] font-light leading-[150%] md:text-[42px]">
            Build with StableFlow
          </h2>
          <p className="mt-2 max-w-[364px] text-base font-light leading-[150%] opacity-60 md:text-lg md:opacity-100">
            An API is available for projects that want to integrate crosschain stablecoin routing into their own products.
          </p>
          <div className="mt-8 flex flex-col gap-3.5 md:mt-16 md:flex-row md:flex-wrap md:gap-5">
            <AboutButton href={ABOUT_LINKS.api} className="w-full md:w-auto md:min-w-[179px]">
              Access API
            </AboutButton>
            <AboutButton href={ABOUT_LINKS.developerDocs} variant="glass" className="w-full border-white/50 md:w-auto md:min-w-[270px]">
              View Developer Docs
            </AboutButton>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl">
          <img src={getAboutAsset("banner-sdk.png")} alt="StableFlow SDK code example" className="h-[268px] w-full object-cover md:h-[452px]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-black" />
        </div>
      </div>
    </section>
  );
};

export default Developers;
