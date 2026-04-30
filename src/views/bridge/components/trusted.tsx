import useIsMobile from "@/hooks/use-is-mobile";
import { getStableflowTrustAvatar } from "@/utils/format/logo";
import clsx from "clsx";
import { useEffect, useId, useRef, type ReactNode } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const CardList = [
  {
    img: getStableflowTrustAvatar("avatar-near.png"),
    name: "NEAR Protocol",
    description: (
      <div className="line-clamp-5">
        This is the end of inefficient, high-cost stablecoin trading — and the start of a new era of capital efficiency.
      </div>
    ),
    link: "https://x.com/NEARProtocol/status/1976316826431705412",
  },
  {
    img: getStableflowTrustAvatar("avatar-arb.png"),
    name: "Arbitrum",
    description: (
      <div className="line-clamp-5">
        One-click stablecoin transfer from any chain to Arbitrum via StableFlow. StableFlow Everywhere. Arbitrum Everywhere
      </div>
    ),
    link: "https://x.com/arbitrum/status/1978135970282168509",
  },
  {
    img: getStableflowTrustAvatar("avatar-polygon.png"),
    name: "Polygon",
    description: (
      <div className="line-clamp-5">
        Bridging stablecoins is now effortless. Transfer up to 1M+ from any chain to Polygon. <br />Now with <span className="text-[#6284F5] cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); window.open("https://x.com/0xStableFlow", "_blank"); }}>@0xStableFlow</span>.
      </div>
    ),
    link: "https://x.com/0xPolygon/status/1981359965198573920",
  },
  {
    img: getStableflowTrustAvatar("avatar-aptos.png"),
    name: "Aptos",
    description: (
      <div className="line-clamp-5">
        Built as a means to move stablecoins at scale, <span className="text-[#6284F5] cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); window.open("https://x.com/0xStableFlow", "_blank"); }}>@0xStableFlow</span> has enabled support for Aptos, the chain built to move what matters.
        Fast. Cheap. Secure. Effortless.
        Money Moves Better on Aptos.
      </div>
    ),
    link: "https://x.com/Aptos/status/1983919379856421334",
  },
  {
    img: getStableflowTrustAvatar("avatar-plasma.jpg"),
    name: "Plasma",
    description: (
      <div className="line-clamp-5">
        StableFlow is now live on Plasma.
        This gives builders access to deep crosschain liquidity at CEX-equivalent pricing.
      </div>
    ),
    link: "https://x.com/plasma/status/2016228518972244197?s=46",
  },
  {
    img: getStableflowTrustAvatar("avatar-stable.jpg"),
    name: "Stable",
    description: (
      <div className="line-clamp-5">
        Stablecoin payments, without the usual friction.
        We are excited to partner with <span className="text-[#6284F5] cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); window.open("https://x.com/0xStableFlow", "_blank"); }}>@0xStableFlow</span> to bring faster, simpler, dollar-based payments onchain.
      </div>
    ),
    link: "https://x.com/stable/status/2038980573235151054?s=46",
  },
  {
    img: getStableflowTrustAvatar("avatar-mantle.jpg"),
    name: "Mantle",
    description: (
      <div className="line-clamp-5">
        Now live on Mantle,
        <span className="text-[#6284F5] cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); window.open("https://x.com/0xStableFlow", "_blank"); }}>@0xStableFlow</span> just made moving stablecoins frictionless from any chain with zero slippage.
      </div>
    ),
    link: "https://x.com/mantle_official/status/2042208500127031762?s=46",
  },
  {
    img: getStableflowTrustAvatar("avatar-frax.jpg"),
    name: "Frax Finance",
    description: (
      <div className="line-clamp-5">
        frxUSD is now live on <span className="text-[#6284F5] cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); window.open("https://x.com/0xStableFlow", "_blank"); }}>@0xStableFlow</span><br />

        Swap between frxUSD and USDC/USDT in one click across 25+ chains.
      </div>
    ),
    link: "https://x.com/fraxfinance/status/2044038162175922670?s=46",
  },
];

const SLIDE_GAP = 25;

type TrustedProps = {
  variant?: "default" | "about";
};

const Trusted = ({ variant = "default" }: TrustedProps) => {
  const rawPaginationId = useId().replace(/:/g, "");
  const paginationElSelector = `#trusted-swiper-pg-${rawPaginationId}`;
  const swiperRef = useRef<SwiperType | null>(null);

  const isMobile = useIsMobile();
  const isAbout = variant === "about";

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper?.autoplay) return;

    if (isMobile) {
      swiper.autoplay.stop();
      return;
    }

    swiper.autoplay.start();
  }, [isMobile]);

  return (
    <div className={clsx("w-full md:max-w-[1440px] mx-auto px-[10px] md:px-0", isAbout ? "mt-0" : "mt-[50px]")}>
      <div className={clsx(
        "text-center",
        isAbout ? "text-[26px] font-light leading-[120%] text-black md:text-[24px] md:font-medium md:text-[#444C59]" : "text-[16px] md:text-[24px] font-medium text-[#9FA7BA] md:text-[#444C59]",
      )}>
        Trusted by
      </div>
      <div className={clsx("w-full", isAbout ? "mt-[30px] md:mt-[34px]" : "mt-[34px]")}>
        <div className="relative mx-auto w-full md:max-w-[712px] lg:max-w-[1074px]">
          <Swiper
            className="trusted-swiper w-full"
            modules={isMobile ? [Pagination] : [Autoplay, Pagination]}
            loop
            autoplay={isMobile ? false : {
              delay: 3000,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={SLIDE_GAP}
            slidesPerView={1}
            breakpoints={{
              768: {
                slidesPerView: 2,
                spaceBetween: SLIDE_GAP,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: SLIDE_GAP,
              },
            }}
            pagination={{
              el: paginationElSelector,
              clickable: true,
            }}
            onSwiper={(s) => {
              swiperRef.current = s;
            }}
          >
            {CardList.map(item => (
              <SwiperSlide key={item.name} className="flex! h-auto!">
                <div className="flex w-full justify-center">
                  <Card
                    {...item}
                    className={clsx("w-full max-w-[350px]", isAbout && "h-[200px] rounded-xl border border-[#F2F2F2] shadow-none md:h-[192px]")}
                  >
                    {item.description}
                  </Card>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <>
            <CarouselNavButton
              direction="prev"
              disabled={false}
              onPress={() => swiperRef.current?.slidePrev()}
              className="absolute -left-12 top-1/2 -translate-y-1/2 z-1 hidden md:flex"
            />
            <CarouselNavButton
              direction="next"
              disabled={false}
              onPress={() => swiperRef.current?.slideNext()}
              className="absolute -right-12 top-1/2 -translate-y-1/2 z-1 hidden md:flex"
            />
          </>
          <div
            id={`trusted-swiper-pg-${rawPaginationId}`}
            className="trusted-swiper-pagination-host mt-5 flex justify-center gap-1.5 md:hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default Trusted;

function CarouselNavButton(props: {
  direction: "prev" | "next";
  disabled: boolean;
  className?: string;
  onPress: () => void;
}) {
  const { direction, disabled, onPress, className } = props;
  const isPrev = direction === "prev";

  return (
    <button
      type="button"
      aria-label={isPrev ? "Previous slide" : "Next slide"}
      disabled={disabled}
      className={clsx(
        "cursor-pointer flex size-10 shrink-0 items-center justify-center rounded-full border border-[#E8EAF0] bg-white text-[#444C59] shadow-[0_0_10px_0_rgba(0,0,0,0.06)] transition-colors",
        "hover:border-[#6284F5] hover:bg-[#6284F5] hover:text-white",
        "disabled:pointer-events-none disabled:opacity-40 disabled:hover:border-[#E8EAF0] disabled:hover:bg-white disabled:hover:text-[#444C59]",
        className,
      )}
      onClick={onPress}
    >
      <svg
        className="size-[18px] shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d={isPrev ? "M15 6L9 12L15 18" : "M9 6L15 12L9 18"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

type CardProps = {
  children: ReactNode;
  img: string;
  name: string;
  title?: string;
  link: string;
  className?: string;
};

const Card = (props: CardProps) => {
  const { children, img, name, title, link, className } = props;

  return (
    <div
      className={clsx(
        "cursor-pointer relative w-[350px] shrink-0 h-[192px] p-[25px_12px_20px_18px] flex flex-col justify-between rounded-[16px] bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.10)] font-[SpaceGrotesk] text-[16px] font-normal leading-[120%] text-black",
        className,
      )}
      onClick={() => {
        window.open(link, "_blank");
      }}
    >
      <div className="absolute z-0 left-[11px] top-[10px] text-[90px] text-[#D7E1F1] leading-[100%]">
        “
      </div>
      <div className="relative z-1">
        {children}
      </div>
      <div className="flex items-center gap-[10px] relative z-1">
        <img
          src={img}
          alt=""
          className="w-[50px] h-[50px] rounded-full origin-center object-contain shrink-0"
        />
        <div className="leading-[100%]">
          <div className="text-[18px] font-semibold">
            {name}
          </div>
          {
            !!title && (
              <div className="text-[12px] text-[#9FA7BA]">
                {title}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};
