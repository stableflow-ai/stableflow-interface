import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import AboutButton from "../components/about-button";
import FlowLogo from "../components/flow-logo";
import SectionTitle from "../components/section-title";
import { ABOUT_LINKS, FLOW_ROUTE_CARD, TOKEN_FLOW_CHAINS, TOKEN_FLOW_ROUTES, TOKEN_FLOW_TOKENS } from "../config";
import { buildCurvePath, FLOW_HOLD, FLOW_INBOUND_TRAVEL, FLOW_OUTBOUND_TRAVEL, FLOW_SETTLE, FLOW_STAGGER, flowSegmentDuration } from "../utils";

const CENTER = { x: 377, y: 220 };
const TOKEN_X = 30;
const CHAIN_COLUMNS = [765, 840, 915, 990];
const LOGO_SIZE = 136;
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

type FlowPhase = "inbound" | "hold" | "outbound" | "settle";

type FlowPath = {
  key: string;
  path: string;
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

const useFlowCycle = (inboundCount: number, outboundCount: number, paused: boolean) => {
  const [phase, setPhase] = useState<FlowPhase>("inbound");
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (paused) return;

    const ms = phase === "inbound"
      ? flowSegmentDuration(inboundCount, FLOW_INBOUND_TRAVEL) * 1000
      : phase === "hold"
        ? FLOW_HOLD * 1000
        : phase === "outbound"
          ? flowSegmentDuration(outboundCount, FLOW_OUTBOUND_TRAVEL) * 1000
          : FLOW_SETTLE * 1000;
    const timer = window.setTimeout(() => {
      if (phase === "inbound") {
        setPhase("hold");
        return;
      }
      if (phase === "hold") {
        setPhase("outbound");
        return;
      }
      if (phase === "outbound") {
        setPhase("settle");
        return;
      }
      setPhase("inbound");
      setCycle(value => value + 1);
    }, ms);

    return () => window.clearTimeout(timer);
  }, [phase, cycle, paused, inboundCount, outboundCount]);

  return { phase, cycle };
};

const routePosition = (side: "left" | "right", row: "top" | "bottom", logoLeft: number, logoTop: number, mobile: boolean) => {
  if (mobile) {
    return {
      left: side === "left" ? 22 : 236,
      top: row === "top" ? 257 : 306,
      width: 76,
      height: 26,
    };
  }

  return {
    left: side === "left" ? logoLeft - 81 : logoLeft + 119,
    top: row === "top" ? logoTop + 28 : logoTop + 82,
    width: 104,
    height: 34,
  };
};

const FlowComet = ({ d, delay, cycle, comet, travel }: { d: string; delay: number; cycle: number; comet: number; travel: number }) => {
  const ref = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);

  useLayoutEffect(() => {
    setLength(ref.current?.getTotalLength() ?? 0);
  }, [d]);

  const ready = length > 0;

  return (
    <motion.path
      ref={ref}
      key={`${cycle}-${Math.round(length)}`}
      d={d}
      stroke="#6284F5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray={ready ? `${comet} ${length}` : undefined}
      initial={{ strokeDashoffset: length + comet, opacity: 0 }}
      animate={ready ? { strokeDashoffset: comet, opacity: [0, 1, 1, 0] } : { opacity: 0 }}
      transition={{
        strokeDashoffset: { duration: travel, delay, ease: "linear" },
        opacity: { duration: travel, delay, times: [0, 0.02, 0.85, 1], ease: "linear" },
      }}
    />
  );
};

const FlowComets = ({ paths, comet, cycle, travel }: { paths: FlowPath[]; comet: number; cycle: number; travel: number }) => {
  return paths.map((item, index) => (
    <FlowComet
      key={`${cycle}-${item.key}`}
      d={item.path}
      delay={index * FLOW_STAGGER}
      cycle={cycle}
      comet={comet}
      travel={travel}
    />
  ));
};

const RouteBadges = ({ phase, cycle, paused, mobile, logoLeft, logoTop }: { phase: FlowPhase; cycle: number; paused: boolean; mobile: boolean; logoLeft: number; logoTop: number }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (paused || phase !== "hold") return;
    controls.set({ scale: 0.9 });
    void controls.start({ scale: 1, transition: { type: "spring", stiffness: 460, damping: 12 } });
  }, [controls, cycle, paused, phase]);

  return TOKEN_FLOW_ROUTES.map(route => {
    const position = routePosition(route.side, route.row, logoLeft, logoTop, mobile);

    return (
      <motion.div
        key={route.key}
        animate={controls}
        className="absolute z-20"
        style={{ left: position.left, top: position.top, width: position.width, height: position.height }}
      >
        <img
          src={FLOW_ROUTE_CARD}
          alt=""
          className={`absolute inset-0 size-full ${route.side === "right" ? "-scale-x-100" : ""}`}
        />
        <img
          src={route.logo}
          alt={route.label}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain ${mobile ? "h-3.5 w-14" : "h-[18px] w-[70px]"}`}
        />
      </motion.div>
    );
  });
};

const SolverFlow = () => {
  const reduceMotion = useReducedMotion() === true;
  const { phase, cycle } = useFlowCycle(TOKEN_FLOW_TOKENS.length, TOKEN_FLOW_CHAINS[0].length, reduceMotion);
  const tokenPaths = TOKEN_FLOW_TOKENS.map(token => ({
    key: `token-${token.key}`,
    path: buildCurvePath({ x: TOKEN_X + 45, y: token.y }, { x: CENTER.x - 55, y: CENTER.y }, 0),
  }));
  const chainPaths = TOKEN_FLOW_CHAINS[0].map(chain => ({
    key: `chain-${chain.key}`,
    path: buildCurvePath({ x: CENTER.x + 55, y: CENTER.y }, { x: CHAIN_COLUMNS[0] - 35, y: chain.y }, 0),
  }));
  const mobileChainMap = new Map(TOKEN_FLOW_CHAINS.flat().map(chain => [chain.key, chain]));
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
  const showInbound = !reduceMotion && phase === "inbound";
  const showOutbound = !reduceMotion && phase === "outbound";

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

        <div className="mt-[30px] overflow-visible pb-0 md:mt-7 md:pb-4">
          <div className="relative mx-auto h-[631px] w-[334px] md:hidden">
            <svg className="absolute inset-0 size-full" viewBox="0 0 334 631" fill="none" aria-hidden>
              {mobileTokenPaths.map(item => (
                <path key={`${item.key}-base`} d={item.path} stroke="#D7E1F1" strokeWidth="1" />
              ))}
              {mobileChainPaths.map(item => (
                <path key={`${item.key}-base`} d={item.path} stroke="#D7E1F1" strokeWidth="1" />
              ))}
              {showInbound && (
                <FlowComets paths={mobileTokenPaths} comet={38} cycle={cycle} travel={FLOW_INBOUND_TRAVEL} />
              )}
              {showOutbound && (
                <FlowComets paths={mobileChainPaths} comet={38} cycle={cycle} travel={FLOW_OUTBOUND_TRAVEL} />
              )}
            </svg>

            {TOKEN_FLOW_TOKENS.map((token, index) => (
              <div
                key={token.key}
                className="absolute z-20 flex size-[42px] items-center justify-center rounded-full border border-[#6A749A] bg-white shadow-[0_4px_20px_rgba(98,132,245,0.08)]"
                style={{ left: MOBILE_TOKEN_POSITIONS[index].x - 21, top: MOBILE_TOKEN_POSITIONS[index].y }}
              >
                <img src={token.icon} alt={token.label} className="size-7 object-contain" />
              </div>
            ))}

            <RouteBadges phase={phase} cycle={cycle} paused={reduceMotion} mobile logoLeft={0} logoTop={0} />

            <div className="absolute z-10 scale-[0.92]" style={{ left: MOBILE_CENTER.x - 68, top: MOBILE_CENTER.y - 68 }}>
              <FlowLogo />
            </div>

            {mobileChains.map((chain, index) => {
              const position = MOBILE_CHAIN_POSITIONS[index % MOBILE_CHAIN_POSITIONS.length];

              return (
                <img
                  key={chain.key}
                  src={chain.icon}
                  alt={chain.key}
                  className="absolute z-20 size-[42px] object-contain"
                  style={{ left: position.x - 21, top: position.y - 21 }}
                />
              );
            })}
          </div>

          <div className="@container mx-auto hidden w-full max-w-[1022px] md:block">
          <div className="relative h-[calc(440px*min(1,100cqw/1022px))] w-full">
          <div className="absolute top-0 left-0 h-[440px] w-[1022px] origin-top-left [transform:scale(min(1,100cqw/1022px))]">
            <svg className="absolute inset-0 size-full" viewBox="0 0 1022 440" fill="none" aria-hidden>
              {tokenPaths.map(item => (
                <path key={`${item.key}-base`} d={item.path} stroke="#D7E1F1" strokeWidth="1" />
              ))}
              {chainPaths.map(item => (
                <path key={`${item.key}-base`} d={item.path} stroke="#D7E1F1" strokeWidth="1" />
              ))}
              {showInbound && (
                <FlowComets paths={tokenPaths} comet={46} cycle={cycle} travel={FLOW_INBOUND_TRAVEL} />
              )}
              {showOutbound && (
                <FlowComets paths={chainPaths} comet={46} cycle={cycle} travel={FLOW_OUTBOUND_TRAVEL} />
              )}
            </svg>

            {TOKEN_FLOW_TOKENS.map(token => (
              <div
                key={token.key}
                className="absolute z-20 flex size-15 items-center justify-center rounded-full border border-[#6A749A] bg-white shadow-[0_4px_20px_rgba(98,132,245,0.08)]"
                style={{ left: TOKEN_X - 30, top: token.y - 30 }}
              >
                <img src={token.icon} alt={token.label} className="size-10 object-contain" />
              </div>
            ))}

            <RouteBadges
              phase={phase}
              cycle={cycle}
              paused={reduceMotion}
              mobile={false}
              logoLeft={CENTER.x - LOGO_SIZE / 2}
              logoTop={CENTER.y - LOGO_SIZE / 2}
            />

            <div className="absolute z-10" style={{ left: CENTER.x - LOGO_SIZE / 2, top: CENTER.y - LOGO_SIZE / 2 }}>
              <FlowLogo />
            </div>

            {TOKEN_FLOW_CHAINS.flatMap((column, columnIndex) => (
              column.map(chain => (
                <img
                  key={chain.key}
                  src={chain.icon}
                  alt={chain.key}
                  className="absolute z-20 size-15 object-contain"
                  style={{ left: CHAIN_COLUMNS[columnIndex] - 30, top: chain.y - 30 }}
                />
              ))
            ))}
          </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolverFlow;
