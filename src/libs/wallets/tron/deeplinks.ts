export const TP_ICON = "https://www.tokenpocket.pro/favicon.ico";

// Detect whether an injected Tron provider exists (i.e. running inside a
// wallet's in-app DApp browser such as TronLink/TokenPocket/Trust).
// Note: this intentionally checks injected globals instead of adapter
// readyState, because the WalletConnect adapter always reports "Found".
export function hasInjectedTronWallet() {
  if (typeof window === "undefined") {
    return false;
  }
  const w = window as any;
  return !!(w.tronLink || w.tronWeb || w.tron || w.trustwallet?.tronLink);
}

export type MobileDeeplinkKey = "tokenpocket" | "tronlink" | "trust";

export function buildTokenPocketDeeplink(url: string) {
  const params = encodeURIComponent(JSON.stringify({
    url,
    chain: "TRON",
    source: "StableFlow",
  }));
  return `tpdapp://open?params=${params}`;
}

export function buildTronLinkDeeplink(url: string) {
  const param = encodeURIComponent(JSON.stringify({
    url,
    action: "open",
    protocol: "tronlink",
    version: "1.0",
  }));
  return `tronlinkoutside://pull.activity?param=${param}`;
}

export function buildTrustDeeplink(url: string) {
  return `https://link.trustwallet.com/open_url?coin_id=195&url=${encodeURIComponent(url)}`;
}

export function openDeeplink(key: MobileDeeplinkKey, url?: string) {
  const targetUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  let deeplink = "";

  switch (key) {
    case "tokenpocket":
      deeplink = buildTokenPocketDeeplink(targetUrl);
      break;
    case "tronlink":
      deeplink = buildTronLinkDeeplink(targetUrl);
      break;
    case "trust":
      deeplink = buildTrustDeeplink(targetUrl);
      break;
    default:
      return;
  }

  window.location.href = deeplink;
}
