import AboutButton from "../components/about-button";
import { ABOUT_LINKS } from "../config";
import { getAboutAsset } from "../utils";

const Developers = () => {
  return (
    <section className="mt-24 w-full bg-black py-16 md:mt-30 md:py-16">
      <div className="mx-auto grid w-full max-w-[1190px] gap-12 px-4 md:grid-cols-[470px_1fr] md:items-center">
        <div className="text-white">
          <div className="text-lg font-light leading-none">For Developers</div>
          <h2 className="mt-7 text-[34px] font-light leading-[120%] md:text-[42px] md:leading-[150%]">
            Build with StableFlow
          </h2>
          <p className="mt-2 max-w-[364px] text-lg font-light leading-[150%]">
            An API is available for projects that want to integrate crosschain stablecoin routing into their own products.
          </p>
          <div className="mt-16 flex flex-wrap gap-5">
            <AboutButton href={ABOUT_LINKS.api} className="min-w-[179px]">
              Access API
            </AboutButton>
            <AboutButton href={ABOUT_LINKS.developerDocs} variant="glass" className="min-w-[270px] border-white/50">
              View Developer Docs
            </AboutButton>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl">
          <img src={getAboutAsset("banner-sdk.png")} alt="StableFlow SDK code example" className="h-[330px] w-full object-cover md:h-[452px]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-black" />
        </div>
      </div>
    </section>
  );
};

export default Developers;
