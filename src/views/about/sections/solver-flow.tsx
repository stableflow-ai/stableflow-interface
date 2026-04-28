import { motion, useReducedMotion } from "framer-motion";
import AboutButton from "../components/about-button";
import FlowLogo from "../components/flow-logo";
import SectionTitle from "../components/section-title";
import { ABOUT_LINKS, TOKEN_FLOW_CHAINS, TOKEN_FLOW_TOKENS } from "../config";
import { buildCurvePath, getFlowDelay } from "../utils";

const CENTER = { x: 377, y: 220 };
const TOKEN_X = 30;
const CHAIN_COLUMNS = [765, 840, 915, 990];

const SolverFlow = () => {
  const reduceMotion = useReducedMotion();
  const tokenPaths = TOKEN_FLOW_TOKENS.map((token, index) => ({
    key: `token-${token.key}`,
    path: buildCurvePath({ x: TOKEN_X + 45, y: token.y }, { x: CENTER.x - 55, y: CENTER.y }, index < 2 ? 42 : -42),
  }));
  const chainPaths = TOKEN_FLOW_CHAINS[0].map(chain => ({
    key: `chain-${chain.key}`,
    path: buildCurvePath({ x: CENTER.x + 55, y: CENTER.y }, { x: CHAIN_COLUMNS[0] - 35, y: chain.y }, 0),
  }));
  const allPaths = [...tokenPaths, ...chainPaths];

  return (
    <section className="w-full px-4">
      <div className="mx-auto mt-24 w-full max-w-[1060px] md:mt-25">
        <div className="mx-auto max-w-[933px] text-center">
          <SectionTitle>Solver-based. Competitive at size.</SectionTitle>
          <p className="mt-8 text-lg font-light leading-[150%] text-[#444C59]">
            A decentralised network of professional market makers competes to fill your order. When native protocol rails offer better execution, StableFlow routes there instead. Deep liquidity, across every transfer size.
            <br className="hidden md:block" />
            Transfer leading stablecoins including USDT, USDC, and frxUSD across 12+ chains.
          </p>
          <AboutButton href={ABOUT_LINKS.app} variant="dark" className="mt-8 min-w-[248px]">
            app.stableflow.ai
          </AboutButton>
        </div>

        <div className="mt-7 overflow-x-auto pb-4">
          <div className="relative mx-auto h-[440px] w-[1022px]">
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
