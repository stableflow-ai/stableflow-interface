import { motion, useReducedMotion } from "framer-motion";
import { STABLEFLOW_LOGO } from "../config";

const RIPPLE_TRANSITION = {
  duration: 2.4,
  repeat: Infinity,
  ease: "easeOut" as const,
  repeatDelay: 0.2,
};

const FlowLogo = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex size-34 items-center justify-center bg-[#F6F8FC]">
    <div className="absolute z-1 size-16 rounded-full bg-[#E9EFF8]" />
    {!reduceMotion && (
      <>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-5 rounded-full bg-[#b0cbf7]"
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{ scale: [0.1, 0.15, 1.9, 2], opacity: [0, 1, 0.3, 0] }}
          transition={{
            times: [0, 0.1, 0.95, 1],
            duration: 2.4,
            repeat: Infinity,
            ease: "easeOut" as const,
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-5 rounded-full bg-[#b0cbf7]"
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{ scale: [0.1, 0.15, 1.9, 2], opacity: [0, 1, 0.3, 0] }}
          transition={{
            times: [0, 0.1, 0.95, 1],
            duration: 2.4,
            repeat: Infinity,
            ease: "easeOut" as const,
            delay: 1.2,
          }}
        />
      </>
    )}
      <img src={STABLEFLOW_LOGO} alt="StableFlow" className="relative z-1 size-22 object-contain" />
    </div>
  );
};

export default FlowLogo;
