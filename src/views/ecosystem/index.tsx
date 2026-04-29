import chains from "@/config/chains";
import PixelBlast from "@/components/pixel-blast";
import { ServiceLogoMap } from "@/services/constants";
import Trusted from "@/views/bridge/components/trusted";
import { getStableflowTokenLogo } from "@/utils/format/logo";
import { ECOSYSTEM_NETWORK_ORDER, ECOSYSTEM_RAILS, ECOSYSTEM_STABLECOINS } from "./config";

const Ecosystem = () => {
  return (
    <div className="grid w-full min-h-full overflow-x-hidden">
      <div className="w-screen col-start-1 row-start-1 min-h-full">
        <PixelBlast
          pixelSize={3}
          patternScale={1.5}
          patternDensity={0.2}
          color="#85ABFA"
          colorSaturation={1.1}
          speed={0.45}
          className="h-full min-h-full"
        />
      </div>

      <div className="w-screen col-start-1 row-start-1 relative z-1 min-h-full flex flex-col">
        <main className="max-w-[1440px] w-full mx-auto px-4 pt-[112px] md:pt-[120px] flex-1">
          <section className="text-center">
            <h1 className="text-[36px] md:text-[42px] leading-none font-medium text-black">
              StableFlow <span className="text-[#6284F5]">Ecosystem</span>
            </h1>
            <p className="mt-5 text-[16px] leading-none font-normal text-[#444C59]">
              Swap stablecoins anywhere.
            </p>
          </section>

          <section className="mt-[58px]">
            <h2 className="text-[26px] leading-none font-normal text-black">
              Stablecoins
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {ECOSYSTEM_STABLECOINS.map((token) => (
                <div
                  key={token.symbol}
                  className="h-[122px] rounded-[12px] border border-[#F2F2F2] bg-white px-5 py-4 flex flex-col items-center justify-center"
                  style={{ backgroundImage: `${token.gradient}, linear-gradient(90deg, #FFF 0%, #FFF 100%)` }}
                >
                  <img
                    src={getStableflowTokenLogo(token.tokenLogo)}
                    alt={token.symbol}
                    className="size-[50px] object-contain"
                  />
                  <p className="mt-4 text-[16px] leading-none font-medium text-[#444C59]">
                    {token.symbol}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <h2 className="text-[26px] leading-none font-normal text-black">
              Supported Networks
            </h2>
            <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {ECOSYSTEM_NETWORK_ORDER.map((chainKey) => {
                const chain = chains[chainKey];
                return (
                  <div
                    key={chain.chainName}
                    className="h-[120px] rounded-[12px] border border-[#F2F2F2] bg-white px-2 py-5 flex flex-col items-center justify-center"
                  >
                    <img
                      src={chain.chainIcon}
                      alt={chain.chainName}
                      className="size-10 object-contain"
                    />
                    <p className="mt-4 text-[16px] leading-none font-medium text-[#444C59] text-center">
                      {chain.chainName}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-[96px]">
            <h2 className="text-[26px] leading-none font-normal text-black text-center">
              Integrated Rails
            </h2>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-16">
              {ECOSYSTEM_RAILS.map((service) => (
                <img
                  key={service}
                  src={ServiceLogoMap[service]}
                  alt={service}
                  className="h-[32px] w-auto object-contain"
                />
              ))}
            </div>
          </section>

          <section className="mt-15 md:mt-30 pb-[76px] w-full overflow-hidden">
            <Trusted />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Ecosystem;
