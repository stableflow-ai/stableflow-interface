// Host
const ROOT_URL = "https://test.stableflow.ai";

export const minikitConfig = {
  // get from https://farcaster.xyz/~/developers/mini-apps/manifest
  "accountAssociation": {
    "header": "eyJmaWQiOjE1NTA1NDMsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhjMEVFRkY5MDIwMjA2M0EwN2QyQzg5YmE3MkQ5Yjk2MjcwNjQ1ZDkwIn0",
    "payload": "eyJkb21haW4iOiJ0ZXN0LnN0YWJsZWZsb3cuYWkifQ",
    "signature": "50nd4qvGtfIT3OsYtDxi5bfZOLw/bOPQHYG3yUFuf2pZ/XODoReWqcDBm9QSgeGX87aXenUI0pm7mv0Zg9aXwhs="
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
