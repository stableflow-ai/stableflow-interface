import { motion, useReducedMotion } from "framer-motion";
import AboutButton from "../components/about-button";
import FlowLogo from "../components/flow-logo";
import SectionTitle from "../components/section-title";
import { ABOUT_LINKS, TOKEN_FLOW_CHAINS, TOKEN_FLOW_TOKENS } from "../config";
import { buildCurvePath, getAboutAsset, getFlowDelay } from "../utils";

const CENTER = { x: 377, y: 220 };
const TOKEN_X = 30;
const CHAIN_COLUMNS = [765, 840, 915, 990];
const MOBILE_CENTER = { x: 167, y: 294 };
const MOBILE_CHAIN_OFFSET_Y = 26;
const MOBILE_TOKEN_POSITIONS = [
  { x: 21, y: 20 },
  { x: 115, y: 20 },
  { x: 209, y: 20 },
  { x: 303, y: 20 },
] as const;
const MOBILE_CHAIN_POSITIONS = [
  { x: 21, y: 430 + MOBILE_CHAIN_OFFSET_Y },
  { x: 79, y: 430 + MOBILE_CHAIN_OFFSET_Y },
  { x: 137, y: 430 + MOBILE_CHAIN_OFFSET_Y },
  { x: 195, y: 430 + MOBILE_CHAIN_OFFSET_Y },
  { x: 253, y: 430 + MOBILE_CHAIN_OFFSET_Y },
  { x: 311, y: 430 + MOBILE_CHAIN_OFFSET_Y },
  { x: 42, y: 472 + MOBILE_CHAIN_OFFSET_Y },
  { x: 100, y: 472 + MOBILE_CHAIN_OFFSET_Y },
  { x: 158, y: 472 + MOBILE_CHAIN_OFFSET_Y },
  { x: 216, y: 472 + MOBILE_CHAIN_OFFSET_Y },
  { x: 274, y: 472 + MOBILE_CHAIN_OFFSET_Y },
  { x: 21, y: 514 + MOBILE_CHAIN_OFFSET_Y },
  { x: 79, y: 514 + MOBILE_CHAIN_OFFSET_Y },
  { x: 137, y: 514 + MOBILE_CHAIN_OFFSET_Y },
  { x: 195, y: 514 + MOBILE_CHAIN_OFFSET_Y },
  { x: 253, y: 514 + MOBILE_CHAIN_OFFSET_Y },
  { x: 311, y: 514 + MOBILE_CHAIN_OFFSET_Y },
  { x: 42, y: 556 + MOBILE_CHAIN_OFFSET_Y },
  { x: 100, y: 556 + MOBILE_CHAIN_OFFSET_Y },
  { x: 158, y: 556 + MOBILE_CHAIN_OFFSET_Y },
  { x: 216, y: 556 + MOBILE_CHAIN_OFFSET_Y },
  { x: 274, y: 556 + MOBILE_CHAIN_OFFSET_Y },
] as const;
const MOBILE_CONNECTED_CHAIN_COUNT = 6;
const MOBILE_CHAIN_ORDER = [
  "eth",
  "arb",
  "avax",
  "bsc",
  "op",
  "base",
  "pol",
  "xlayer",
  "bera",
  "plasma",
  "mantle",
  "mega",
  "ink",
  "stable",
  "celo",
  "sei",
  "flare",
  "frax",
  "sol",
  "near",
  "tron",
  "aptos",
] as const;

type Point = {
  x: number;
  y: number;
};

const buildMobileTokenPath = (from: Point, to: Point) => {
  const distance = Math.abs(from.x - to.x);
  const controlY = from.y + 96 + distance * 0.18;

  return `M ${from.x} ${from.y} C ${from.x} ${controlY}, ${to.x} ${controlY}, ${to.x} ${to.y}`;
};

const buildMobileChainPath = (from: Point, to: Point) => {
  const distance = Math.abs(from.x - to.x);
  const controlY = from.y + 18 + distance * 0.15;

  return `M ${from.x} ${from.y} C ${from.x} ${controlY}, ${to.x} ${controlY}, ${to.x} ${to.y}`;
};

const SolverFlow = () => {
  const reduceMotion = useReducedMotion();
  const tokenPaths = TOKEN_FLOW_TOKENS.map(token => ({
    key: `token-${token.key}`,
    path: buildCurvePath({ x: TOKEN_X + 45, y: token.y }, { x: CENTER.x - 55, y: CENTER.y }, 0),
  }));
  const chainPaths = TOKEN_FLOW_CHAINS[0].map(chain => ({
    key: `chain-${chain.key}`,
    path: buildCurvePath({ x: CENTER.x + 55, y: CENTER.y }, { x: CHAIN_COLUMNS[0] - 35, y: chain.y }, 0),
  }));
  const allPaths = [...tokenPaths, ...chainPaths];
  const mobileChainMap = new Map([
    ...TOKEN_FLOW_CHAINS.flat(),
    { key: "base", icon: getAboutAsset("chains/chian-base.png") },
  ].map(chain => [chain.key, chain]));
  const mobileChains = MOBILE_CHAIN_ORDER.map(key => mobileChainMap.get(key)).filter((chain): chain is NonNullable<typeof chain> => Boolean(chain));
  const mobileTokenPaths = TOKEN_FLOW_TOKENS.map((token, index) => ({
    key: `mobile-token-${token.key}`,
    path: buildMobileTokenPath(
      { x: MOBILE_TOKEN_POSITIONS[index].x, y: MOBILE_TOKEN_POSITIONS[index].y + 42 },
      { x: MOBILE_CENTER.x, y: MOBILE_CENTER.y - 63 },
    ),
  }));
  const mobileChainPaths = mobileChains.slice(0, MOBILE_CONNECTED_CHAIN_COUNT).map((chain, index) => {
    const position = MOBILE_CHAIN_POSITIONS[index % MOBILE_CHAIN_POSITIONS.length];

    return {
      key: `mobile-chain-${chain.key}`,
      path: buildMobileChainPath(
        { x: MOBILE_CENTER.x, y: MOBILE_CENTER.y + 63 },
        { x: position.x, y: position.y - 21 },
      ),
    };
  });
  const mobilePaths = [...mobileTokenPaths, ...mobileChainPaths];

  return (
    <section className="w-full px-4">
      <div className="mx-auto mt-20 w-full max-w-[1060px] md:mt-25">
        <div className="mx-auto max-w-[933px] text-center">
          <SectionTitle className="text-[26px] md:text-[42px]">Solver-based. Competitive at size.</SectionTitle>
          <p className="mt-4 text-base font-light leading-[120%] text-[#444C59] md:mt-8 md:text-lg md:leading-[150%]">
            A decentralised network of professional market makers competes to fill your order. When native protocol rails offer better execution, StableFlow routes there instead. Deep liquidity, across every transfer size.
            <br className="hidden md:block" />
            Transfer leading stablecoins including USDT, USDC, and frxUSD across 12+ chains.
          </p>
          <AboutButton href={ABOUT_LINKS.app} variant="dark" className="mt-8 min-w-[248px]">
            app.stableflow.ai
          </AboutButton>
        </div>

        <div className="mt-[30px] overflow-visible pb-0 md:mt-7 md:overflow-x-auto md:pb-4">
          <div className="relative mx-auto h-[631px] w-[334px] md:hidden">
            <svg className="absolute inset-0 size-full" viewBox="0 0 334 631" fill="none" aria-hidden>
              <defs>
                <linearGradient id="about-mobile-flow-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6284F5" stopOpacity="0" />
                  <stop offset="45%" stopColor="#6284F5" />
                  <stop offset="100%" stopColor="#6284F5" stopOpacity="0" />
                </linearGradient>
              </defs>
              {mobilePaths.map(item => (
                <path key={`${item.key}-base`} d={item.path} stroke="#D7E1F1" strokeWidth="1" />
              ))}
              {!reduceMotion && mobilePaths.map((item, index) => (
                <motion.path
                  key={`${item.key}-motion`}
                  d={item.path}
                  stroke="url(#about-mobile-flow-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="38 760"
                  initial={{ strokeDashoffset: 760 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{
                    duration: 3.2,
                    delay: getFlowDelay(index, mobilePaths.length),
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}
            </svg>

            {TOKEN_FLOW_TOKENS.map((token, index) => (
              <div
                key={token.key}
                className="absolute flex size-[42px] items-center justify-center rounded-full border border-[#6A749A] bg-white shadow-[0_4px_20px_rgba(98,132,245,0.08)]"
                style={{ left: MOBILE_TOKEN_POSITIONS[index].x - 21, top: MOBILE_TOKEN_POSITIONS[index].y }}
              >
                <img src={token.icon} alt={token.label} className="size-7 object-contain" />
              </div>
            ))}

            <div className="absolute scale-[0.92]" style={{ left: MOBILE_CENTER.x - 68, top: MOBILE_CENTER.y - 68 }}>
              <FlowLogo />
            </div>

            {mobileChains.map((chain, index) => {
              const position = MOBILE_CHAIN_POSITIONS[index % MOBILE_CHAIN_POSITIONS.length];

              return (
                <img
                  key={chain.key}
                  src={chain.icon}
                  alt={chain.key}
                  className="absolute size-[42px] object-contain"
                  style={{ left: position.x - 21, top: position.y - 21 }}
                />
              );
            })}
          </div>

          <div className="relative mx-auto hidden h-[440px] w-[1022px] md:block">
            <svg className="absolute inset-0 size-full" viewBox="0 0 1022 440" fill="none" aria-hidden>
              <defs>
                <linearGradient id="about-flow-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6284F5" stopOpacity="0" />
                  <stop offset="45%" stopColor="#6284F5" />
                  <stop offset="100%" stopColor="#6284F5" stopOpacity="0" />
                </linearGradient>
              </defs>
              {allPaths.map(item => (
                <path key={`${item.key}-base`} d={item.path} stroke="#D7E1F1" strokeWidth="1" />
              ))}
              {!reduceMotion && allPaths.map((item, index) => (
                <motion.path
                  key={`${item.key}-motion`}
                  d={item.path}
                  stroke="url(#about-flow-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="46 900"
                  initial={{ strokeDashoffset: 900 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{
                    duration: 3.2,
                    delay: getFlowDelay(index, allPaths.length),
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}
            </svg>

            {TOKEN_FLOW_TOKENS.map(token => (
              <div
                key={token.key}
                className="absolute flex size-15 items-center justify-center rounded-full border border-[#6A749A] bg-white shadow-[0_4px_20px_rgba(98,132,245,0.08)]"
                style={{ left: TOKEN_X - 30, top: token.y - 30 }}
              >
                <img src={token.icon} alt={token.label} className="size-10 object-contain" />
              </div>
            ))}

            <div className="absolute" style={{ left: CENTER.x - 68, top: CENTER.y - 68 }}>
              <FlowLogo />
            </div>

            {TOKEN_FLOW_CHAINS.flatMap((column, columnIndex) => (
              column.map(chain => (
                <img
                  key={chain.key}
                  src={chain.icon}
                  alt={chain.key}
                  className="object-contain absolute size-15"
                  style={{ left: CHAIN_COLUMNS[columnIndex] - 30, top: chain.y - 30, opacity: 1 }}
                />
              ))
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolverFlow;
