// Host
const ROOT_URL = "https://test.stableflow.ai";

export const minikitConfig = {
  // get from https://farcaster.xyz/~/developers/mini-apps/manifest
  "accountAssociation": {
    "header": "",
    "payload": "",
    "signature": ""
  },
  "baseBuilder": {
    "ownerAddress": ""
  },
  miniapp: {
    version: "1", // Must be "1" or "next"
    name: "Stableflow",
    subtitle: "Stableflow",
    description: "Stablecoins to any chain, with one click.",
    screenshotUrls: [`${ROOT_URL}/stableflow-banner.png`],
    iconUrl: `${ROOT_URL}/logo.png`,
    splashImageUrl: `${ROOT_URL}/logo.png`,
    splashBackgroundColor: "#6284F5",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/stableflow-banner.png`,
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/logo.png`,
  },
} as const;
