import { useAllTokensStore } from "@/all-tokens/store";
import { useHistoryStore } from "@/stores/use-history";
import { motion, useReducedMotion } from "framer-motion";

const TRACK_OFF = "#B3BBCE";
const TRACK_ON = "#6284F5";

export default function AllTokensSwitch() {
  const enabled = useAllTokensStore((state) => state.enabled);
  const reduceMotion = useReducedMotion();

  const onToggle = () => {
    const next = !enabled;
    useAllTokensStore.getState().setEnabled(next);
    useHistoryStore.getState().activate(next ? "allTokens" : "stablecoin");
  };

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 500, damping: 30 };

  return (
    <button
      type="button"
      className="button flex items-center gap-[8px] shrink-0"
      onClick={onToggle}
      aria-pressed={enabled}
      data-all-tokens-switch=""
    >
      <span className="font-['Space_Grotesk'] text-[14px] font-normal leading-none text-[#9FA7BA] whitespace-nowrap">
        All Tokens
      </span>
      <motion.span
        aria-hidden
        className="relative block h-[16px] w-[30px] shrink-0 rounded-full"
        animate={{ backgroundColor: enabled ? TRACK_ON : TRACK_OFF }}
        transition={transition}
      >
        <motion.span
          className="absolute top-[2px] left-[2px] block h-[12px] w-[12px] rounded-full bg-white"
          animate={{ x: enabled ? 14 : 0 }}
          transition={transition}
        />
      </motion.span>
    </button>
  );
}
