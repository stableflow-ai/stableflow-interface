export const ABOUT_ASSET_BASE = "/about";

export type Point = {
  x: number;
  y: number;
};

export const getAboutAsset = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${ABOUT_ASSET_BASE}${normalized}`;
};

export const EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer nofollow",
} as const;

export const buildCurvePath = (from: Point, to: Point, bend = 0) => {
  const midX = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${midX + bend} ${from.y}, ${midX - bend} ${to.y}, ${to.x} ${to.y}`;
};

export const FLOW_STAGGER = 0.25;
export const FLOW_OUTBOUND_TRAVEL = 1.8;
export const FLOW_INBOUND_TRAVEL = 2.3;
export const FLOW_HOLD = 2;
export const FLOW_SETTLE = 0.8;

export const flowSegmentDuration = (count: number, travel: number) => {
  return FLOW_STAGGER * Math.max(count - 1, 0) + travel;
};
