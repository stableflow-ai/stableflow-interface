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

export const getFlowDelay = (index: number, total: number) => {
  if (total <= 1) return 0;
  return (index / total) * 2.8;
};
