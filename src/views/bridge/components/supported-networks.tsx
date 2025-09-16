import { usdtChains } from "@/config/tokens/usdt";
import { motion } from "framer-motion";

const SupportedNetworks = (props: any) => {
  const { } = props;

  const networks = Object.values(usdtChains);

  return (
    <div className="w-full shrink-0 mt-auto pt-[50px]">
      <div className="text-[16px] md:text-[24px] font-[500] text-center text-[#9FA7BA] md:text-[#444C59]">
        Supported Networks
      </div>
      <div className="relative overflow-hidden pb-[50px] px-0 md:px-[10px] pt-[20px] md:pt-[40px] w-full md:w-[70.97vw] md:mx-auto">
        {/* Left gradient mask */}
        <div className="absolute left-[-5px] top-[15px] md:top-[35px] h-[60px] w-[120px] md:w-[300px] bg-gradient-to-r from-white to-transparent z-[1] pointer-events-none blur-[5px]" />

        {/* Right gradient mask */}
        <div className="absolute right-[-5px] top-[15px] md:top-[35px] h-[60px] w-[120px] md:w-[300px] bg-gradient-to-l from-white to-transparent z-[1] pointer-events-none blur-[5px]" />

        <div
          className="flex items-center flex-nowrap"
        >
          {
            [...new Array(3).fill(0)].map((_, index) => (
              <motion.div
                key={index}
                className="flex items-center flex-nowrap"
                initial={{
                  x: "-50%",
                }}
                animate={{
                  x: "-150%",
                }}
                transition={{
                  duration: 15,
                  ease: "linear",
                  repeat: Infinity,
                }}
              >
                {
                  networks.map((network, idx) => (
                    <div
                      key={`${index}-${idx}`}
                      className="w-[32px] h-[32px] md:w-[50px] md:h-[50px] mr-[20px] md:mr-[31px] shrink-0 bg-white rounded-[10px] overflow-hidden shadow-[0_0_10px_0_rgba(0,_0,_0,_0.10)] flex justify-center items-center"
                    >
                      <img
                        src={network.chainIconGray}
                        alt={network.chainName}
                        className="w-full h-full object-center object-contain"
                      />
                    </div>
                  ))
                }
              </motion.div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default SupportedNetworks;
