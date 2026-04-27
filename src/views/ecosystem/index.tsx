import { motion } from "framer-motion";

const FLASH_COLORS = [
  "#FF0000",
  "#FF6600",
  "#FFFF00",
  "#00FF00",
  "#00FFFF",
  "#0000FF",
  "#FF00FF",
  "#FF0000",
];

const Ecosystem = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 px-6 text-center w-screen h-screen"
      animate={{ backgroundColor: FLASH_COLORS }}
      transition={{
        duration: 0.15 * FLASH_COLORS.length,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <motion.h1
        className="text-4xl font-black text-white md:text-7xl"
        style={{ textShadow: "2px 2px 0 #000, -2px -2px 0 #000" }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
      >
        🚧 Page Under Construction 🚧
      </motion.h1>
      <p className="text-base font-semibold text-white/90 md:text-2xl">
        This page is currently under development. Please ignore.
      </p>
    </motion.div>
  );
};

export default Ecosystem;
