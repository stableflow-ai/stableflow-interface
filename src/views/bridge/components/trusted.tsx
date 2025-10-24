import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

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
      <div className="">
        Bridging stablecoins is now effortless. Transfer up to 1M+ from any chain to Polygon. <br />Now with <a className="text-[#6284F5]" href="https://x.com/0xStableFlow" target="_blank" rel="noreferrer noopener nofollow">@0xStableFlow</a>.
      </div>
    ),
    link: "https://x.com/0xPolygon/status/1981359965198573920",
  },
];

const Trusted = () => {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Calculate total width of all cards
  const totalCardWidth = CardList.length * 375; // 350px card + 25px gap = 375px

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
    if (!isHovered && shouldAnimate) {
      const startAnimation = () => {
        controls.start({
          x: -375 * CardList.length,
          transition: {
            duration: 20,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop"
          }
        });
      };
      startAnimation();
    } else if (!shouldAnimate) {
      // Stop animation and reset position when screen is large enough
      controls.stop();
      controls.set({ x: 0 });
    }
  }, [controls, isHovered, shouldAnimate]);

  // Use duplicated cards only when animation is needed
  const cardsToRender = shouldAnimate ? [...CardList, ...CardList] : CardList;

  return (
    <div className="w-full md:max-w-[1440px] mx-auto mt-[50px]">
      <div className="text-[16px] md:text-[24px] font-[500] text-center text-[#9FA7BA] md:text-[#444C59]">
        Trusted by The Best
      </div>
      <div className="mt-[34px]">
        <motion.div
          className={`flex gap-[25px] items-center ${!shouldAnimate ? 'justify-center' : ''}`}
          animate={shouldAnimate ? controls : {}}
          onHoverStart={() => {
            if (shouldAnimate) {
              setIsHovered(true);
              controls.stop();
            }
          }}
          onHoverEnd={() => {
            if (shouldAnimate) {
              setIsHovered(false);
            }
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
    <a
      href={link}
      className="relative w-[350px] shrink-0 h-[192px] p-[35px_12px_20px_18px] flex flex-col justify-between rounded-[16px] bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.10)] font-[SpaceGrotesk] text-[16px] font-[400] leading-[120%] text-black"
      rel="noreferrer noopener nofollow"
      target="_blank"
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
    </a>
  );
};
