import { getStableflowLogo, getStableflowRouteLogo } from "@/utils/format/logo";
import { getAboutAsset } from "./utils";

export const ABOUT_LINKS = {
  app: "https://app.stableflow.ai",
  docs: "https://docs.stableflow.ai/",
  developerDocs: "https://docs.stableflow.ai/",
  api: "https://docs.stableflow.ai/",
  support: "https://t.me/stableflowai",
  x: "https://x.com/0xStableFlow",
  telegram: "https://t.me/stableflowai",
  paragraph: "https://paragraph.com/@stableflow",
} as const;

export const HERO_ACTIONS = [
  { label: "Transfer Now", href: ABOUT_LINKS.app, variant: "primary" },
  { label: "View Docs", href: ABOUT_LINKS.docs, variant: "glass" },
] as const;

export const TOKEN_FLOW_TOKENS = [
  { key: "usdt", label: "USDT", icon: getAboutAsset("tokens/token-usdt.png"), y: 30 },
  { key: "usdc", label: "USDC", icon: getAboutAsset("tokens/token-usdc.png"), y: 155 },
  { key: "usdt0", label: "USDT0", icon: getAboutAsset("tokens/token-usdt0.png"), y: 280 },
  { key: "frxusd", label: "frxUSD", icon: getAboutAsset("tokens/token-frxusd.png"), y: 405 },
] as const;

export const TOKEN_FLOW_CHAINS = [
  [
    { key: "eth", icon: getAboutAsset("chains/chain-eth.png"), y: 30 },
    { key: "arb", icon: getAboutAsset("chains/chain-arb.png"), y: 105 },
    { key: "avax", icon: getAboutAsset("chains/chain-avax.png"), y: 180 },
    { key: "bsc", icon: getAboutAsset("chains/chain-bsc.png"), y: 255 },
    { key: "op", icon: getAboutAsset("chains/chain-op.png"), y: 330 },
  ],
  [
    { key: "pol", icon: getAboutAsset("chains/chain-pol.png"), y: 67 },
    { key: "xlayer", icon: getAboutAsset("chains/chain-xlayer.png"), y: 142 },
    { key: "bera", icon: getAboutAsset("chains/chain-bera.png"), y: 217 },
    { key: "plasma", icon: getAboutAsset("chains/chain-plasma.png"), y: 292 },
    { key: "mantle", icon: getAboutAsset("chains/chain-mantle.png"), y: 367 },
  ],
  [
    { key: "mega", icon: getAboutAsset("chains/chain-mega.png"), y: 30 },
    { key: "ink", icon: getAboutAsset("chains/chain-ink.png"), y: 92 },
    { key: "stable", icon: getAboutAsset("chains/chain-stable.png"), y: 155 },
    { key: "celo", icon: getAboutAsset("chains/chain-celo.png"), y: 218 },
    { key: "sei", icon: getAboutAsset("chains/chain-sei.png"), y: 281 },
    { key: "flare", icon: getAboutAsset("chains/chain-flare.png"), y: 345 },
  ],
  [
    { key: "frax", icon: getAboutAsset("chains/chain-frax.png"), y: 67 },
    { key: "sol", icon: getAboutAsset("chains/chain-sol.png"), y: 142 },
    { key: "near", icon: getAboutAsset("chains/chain-near.png"), y: 217 },
    { key: "tron", icon: getAboutAsset("chains/chain-tron.png"), y: 292 },
    { key: "aptos", icon: getAboutAsset("chains/chain-aptos.png"), y: 367 },
  ],
] as const;

export const SMART_ROUTING_CARDS = [
  {
    key: "near-intents",
    title: "NEAR Intents",
    description: "Market makers compete with shared capital. Escrow Intents enable $1M+ transfers without pre-funded pools.",
    logo: getStableflowRouteLogo("logo-near-intents.svg"),
  },
  {
    key: "circle",
    title: "Circle",
    description: "USDC: Native mint-and-burn. Zero slippage, 1:1 peg, cross-chain.",
    logo: getStableflowRouteLogo("logo-circle.avif"),
  },
  {
    key: "usdt0",
    title: "USDT0",
    description: "USDT: Omnichain via LayerZero OFT. No wrapped tokens, shared liquidity across all networks.",
    logo: getStableflowRouteLogo("logo-usdt0.svg"),
  },
  {
    key: "fraxzero",
    title: "FraxZero",
    description: "frxUSD: Native crosschain. Direct mint/burn, lock/release across chains.",
    logo: getStableflowRouteLogo("logo-fraxzero.svg"),
  },
] as const;

export const COMPETITIVE_CARDS = [
  {
    key: "fees",
    title: "Low Fees",
    description: "From 1 basis point (0.01%)",
    icon: getAboutAsset("icons/icon-drip.png"),
    theme: "light",
  },
  {
    key: "slippage",
    title: "0 Slippage",
    description: "Via native rails and NEAR Intents",
    icon: getAboutAsset("icons/icon-candlestick-chart.png"),
    theme: "dark",
  },
  {
    key: "size",
    title: "Transfer Size",
    description: "Competitive from $1 to $1M+",
    icon: getAboutAsset("icons/icon-square-corner.png"),
    theme: "dark",
  },
  {
    key: "settlement",
    title: "Settlement",
    description: "Atomic, completes in full or refunds automatically",
    icon: getAboutAsset("icons/icon-settlement.png"),
    theme: "light",
  },
  {
    key: "chains",
    title: "Chains",
    description: "20+ including Ethereum, Solana, NEAR, Tron, and Aptos",
    icon: getAboutAsset("icons/icon-chains.png"),
    theme: "light",
    featured: true,
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    title: "Set your transfer",
    description: "Choose your token, source chain, and destination. Supported chains and assets are displayed in the UI.",
  },
  {
    title: "Get a quote",
    description: "StableFlow evaluates available routes and combinations at execution time. The best rate is returned automatically. If the route updates, so does the quote.",
  },
  {
    title: "Confirm once",
    description: "One transaction from your source wallet. Every subsequent step executes automatically. Your transfer completes in full or reverts with an automatic refund.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "Is my capital safe?",
    answer: "Transfers execute via signed intents and cryptographic proofs. StableFlow never holds your funds. Every transfer settles atomically: it completes in full or your funds return automatically. No partial states.",
  },
  {
    question: "What assets are supported?",
    answer: "USDT, USDC, and frxUSD are live across supported chains. More stablecoins are being added.",
  },
  {
    question: "How long do transfers take?",
    answer: "Most complete in seconds to minutes. Exact timing depends on source chain finality and the selected route.",
  },
  {
    question: "Can I track a transfer in progress?",
    answer: "Yes. The History tab tracks each transfer from deposit detection through final delivery or refund.",
  },
  {
    question: "What if no solver can fill my order?",
    answer: "The UI won't quote you. If a route can't be filled at the requested size, you'll see no quote rather than an unfavourable one.",
  },
  {
    question: "Do StableFlow's rates beat going directly through CCTP or USDT0?",
    answer: "StableFlow integrates both natively and routes through them when they offer the best execution. The solver network competes alongside, so you always get the most competitive rate available at the time.",
  },
] as const;

export const RESOURCE_CARDS = [
  {
    key: "x",
    title: "X",
    description: "Follow @0xStableFlow on X for product announcements.",
    href: ABOUT_LINKS.x,
    icon: getStableflowLogo("logo-x.svg"),
    theme: "light",
  },
  {
    key: "telegram",
    title: "Telegram",
    description: "Get in touch with community.",
    href: ABOUT_LINKS.telegram,
    icon: getStableflowLogo("logo-telegram.svg"),
    theme: "dark",
  },
  {
    key: "paragraph",
    title: "Paragraph",
    description: "Subscribe to updates for StableFlow.",
    href: ABOUT_LINKS.paragraph,
    icon: getStableflowLogo("logo-paragraph.svg"),
    theme: "dark",
  },
  {
    key: "docs",
    title: "Docs",
    description: "Explore product guides and key resources for StableFlow.",
    href: ABOUT_LINKS.docs,
    icon: getStableflowLogo("logo-gitbook.svg"),
    theme: "light",
  },
] as const;

export const STABLEFLOW_LOGO = getStableflowLogo("logo-stableflow.svg");
