import { motion, useAnimate, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const CardList = [
  {
    img: "/bridge/trusted/avatar-near.png",
    name: "NEAR Protocol",
    description: "This is the end of inefficient, high-cost stablecoin trading — and the start of a new era of capital efficiency.",
    link: "https://x.com/NEARProtocol/status/1976316826431705412",
  },
  {
    img: "/bridge/trusted/avatar-arb.png",
    name: "Arbitrum",
    description: "One-click stablecoin transfer from any chain to Arbitrum via StableFlow. StableFlow Everywhere. Arbitrum Everywhere",
    link: "https://x.com/arbitrum/status/1978135970282168509",
  },
  {
    img: "/bridge/trusted/avatar-polygon.png",
    name: "Polygon",
    description: (
      <div className="line-clamp-4">
        Bridging stablecoins is now effortless. Transfer up to 1M+ from any chain to Polygon. <br />Now with <span className="text-[#6284F5] cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); window.open("https://x.com/0xStableFlow", "_blank"); }}>@0xStableFlow</span>.
      </div>
    ),
    link: "https://x.com/0xPolygon/status/1981359965198573920",
  },
  {
    img: "/bridge/trusted/avatar-aptos.png",
    name: "Aptos",
    description: (
      <div className="line-clamp-4">
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
      <div className="line-clamp-4">
        StableFlow is now live on Plasma.
        This gives builders access to deep crosschain liquidity at CEX-equivalent pricing.
      </div>
    ),
    link: "https://x.com/plasma/status/2016228518972244197?s=46",
  },
];

const Trusted = () => {
  const carouselTransform = useMotionValue("translate3d(0, 0, 0)");
  const [carouselRef, animateCarousel] = useAnimate();
  const carouselAnimation = useRef<any>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const itemWidth = 350;
  const itemGap = 25;
  // Calculate total width of all cards
  const totalCardWidth = CardList.length * (itemWidth + itemGap); // 350px card + 25px gap = 375px

  useEffect(() => {
    const checkScreenWidth = () => {
      const screenWidth = window.innerWidth;
      // Only animate if screen width is less than total card width
      setShouldAnimate(screenWidth < totalCardWidth);
    };

    checkScreenWidth();
    window.addEventListener('resize', checkScreenWidth);

    return () => window.removeEventListener('resize', checkScreenWidth);
  }, [totalCardWidth]);

  useEffect(() => {
    if (!shouldAnimate) {
      carouselAnimation.current = animateCarousel(carouselRef.current, { transform: "translate3d(0, 0, 0)" }, { duration: 0 });
      carouselTransform.set("translate3d(0, 0, 0)");
      return;
    }
    carouselAnimation.current = animateCarousel(
      carouselRef.current,
      { transform: [`translate3d(0, 0, 0)`, `translate3d(${-totalCardWidth}px, 0, 0)`] },
      { duration: 15, repeat: Infinity, ease: "linear" }
    );
  }, [shouldAnimate]);

  // Use duplicated cards only when animation is needed
  const cardsToRender = shouldAnimate ? [...CardList, ...CardList] : CardList;

  return (
    <div className="w-full md:max-w-[1440px] mx-auto mt-[50px]">
      <div className="text-[16px] md:text-[24px] font-[500] text-center text-[#9FA7BA] md:text-[#444C59]">
        Trusted by
      </div>
      <div className="mt-[34px]">
        <motion.div
          ref={carouselRef}
          className={`flex gap-[25px] items-center will-change-transform ${!shouldAnimate ? 'justify-center' : ''}`}
          style={{ transform: carouselTransform }}
          onHoverStart={() => {
            carouselAnimation.current?.pause?.();
          }}
          onHoverEnd={() => {
            carouselAnimation.current?.play?.();
          }}
        >
          {
            cardsToRender.map((item, index) => (
              <Card
                key={index}
                {...item}
              >
                {item.description}
              </Card>
            ))
          }
        </motion.div>
      </div>
    </div>
  );
};

export default Trusted;

const Card = (props: any) => {
  const { children, img, name, title, link } = props;

  return (
    <div
      className="cursor-pointer relative w-[350px] shrink-0 h-[192px] p-[35px_12px_20px_18px] flex flex-col justify-between rounded-[16px] bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.10)] font-[SpaceGrotesk] text-[16px] font-[400] leading-[120%] text-black"
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
