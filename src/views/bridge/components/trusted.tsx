import clsx from "clsx";
import { useCallback, useId, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const CardList = [
  {
    img: "/bridge/trusted/avatar-near.png",
    name: "NEAR Protocol",
    description: (
      <div className="line-clamp-5">
        This is the end of inefficient, high-cost stablecoin trading — and the start of a new era of capital efficiency.
      </div>
    ),
    link: "https://x.com/NEARProtocol/status/1976316826431705412",
  },
  {
    img: "/bridge/trusted/avatar-arb.png",
    name: "Arbitrum",
    description: (
      <div className="line-clamp-5">
        One-click stablecoin transfer from any chain to Arbitrum via StableFlow. StableFlow Everywhere. Arbitrum Everywhere
      </div>
    ),
    link: "https://x.com/arbitrum/status/1978135970282168509",
  },
  {
    img: "/bridge/trusted/avatar-polygon.png",
    name: "Polygon",
    description: (
      <div className="line-clamp-5">
        Bridging stablecoins is now effortless. Transfer up to 1M+ from any chain to Polygon. <br />Now with <span className="text-[#6284F5] cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); window.open("https://x.com/0xStableFlow", "_blank"); }}>@0xStableFlow</span>.
      </div>
    ),
    link: "https://x.com/0xPolygon/status/1981359965198573920",
  },
  {
    img: "/bridge/trusted/avatar-aptos.png",
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
    img: "/bridge/trusted/avatar-plasma.jpg",
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
    img: "/bridge/trusted/avatar-stable.jpg",
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
    img: "/bridge/trusted/avatar-mantle.jpg",
    name: "Mantle",
    description: (
      <div className="line-clamp-5">
        Stablecoins are a huge part of how real-world finance moves onchain.<br />
        And the distribution layer is where that finance flows.<br />
        Now live on Mantle, <span className="text-[#6284F5] cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); window.open("https://x.com/0xStableFlow", "_blank"); }}>@0xStableFlow</span> just made moving stablecoins frictionless from any chain with zero slippage.
      </div>
    ),
    link: "https://x.com/mantle_official/status/2042208500127031762?s=46",
  },
];

const SLIDE_GAP = 25;

const Trusted = () => {
  const rawPaginationId = useId().replace(/:/g, "");
  const paginationElSelector = `#trusted-swiper-pg-${rawPaginationId}`;
  const swiperRef = useRef<SwiperType | null>(null);

  const [edge, setEdge] = useState({ beginning: true, end: false });

  const updateEdge = useCallback((s: SwiperType) => {
    setEdge({ beginning: s.isBeginning, end: s.isEnd });
  }, []);

  return (
    <div className="w-full md:max-w-[1440px] mx-auto mt-[50px] px-[10px] md:px-0">
      <div className="text-[16px] md:text-[24px] font-[500] text-center text-[#9FA7BA] md:text-[#444C59]">
        Trusted by
      </div>
      <div className="mt-[34px]">
        <div className="mx-auto w-full md:max-w-[712px] lg:max-w-[1074px]">
          <Swiper
            className="trusted-swiper w-full"
            modules={[Pagination, Autoplay]}
            loop
            autoplay={{
              delay: 3000,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={SLIDE_GAP}
            slidesPerView={1.15}
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
              updateEdge(s);
            }}
            onSlideChange={updateEdge}
            onBreakpoint={updateEdge}
          >
            {CardList.map(item => (
              <SwiperSlide key={item.name} className="!flex !h-auto">
                <div className="flex w-full justify-center">
                  <Card
                    {...item}
                    className="w-full max-w-[350px]"
                  >
                    {item.description}
                  </Card>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="mt-6 flex items-center justify-center gap-3 md:gap-5">
          <CarouselNavButton
            direction="prev"
            disabled={false}
            onPress={() => swiperRef.current?.slidePrev()}
          />
          <div
            id={`trusted-swiper-pg-${rawPaginationId}`}
            className="trusted-swiper-pagination-host flex min-h-[24px] min-w-0 flex-1 max-w-[min(280px,100%)] items-center justify-center"
          />
          <CarouselNavButton
            direction="next"
            disabled={false}
            onPress={() => swiperRef.current?.slideNext()}
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
  onPress: () => void;
}) {
  const { direction, disabled, onPress } = props;
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

const Card = (props: any) => {
  const { children, img, name, title, link, className } = props;

  return (
    <div
      className={clsx(
        "cursor-pointer relative w-[350px] shrink-0 h-[192px] p-[25px_12px_20px_18px] flex flex-col justify-between rounded-[16px] bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.10)] font-[SpaceGrotesk] text-[16px] font-[400] leading-[120%] text-black",
        className,
      )}
      onClick={() => {
        window.open(link, "_blank");
      }}
    >
      <div className="absolute z-0 left-[11px] top-[10px] text-[90px] text-[#D7E1F1] leading-[100%]">
        “
      </div>
      <div className="relative z-[1]">
        {children}
      </div>
      <div className="flex items-center gap-[10px] relative z-[1]">
        <img
          src={img}
          alt=""
          className="w-[50px] h-[50px] rounded-full origin-center object-contain shrink-0"
        />
        <div className="leading-[100%]">
          <div className="text-[18px] font-[600]">
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
