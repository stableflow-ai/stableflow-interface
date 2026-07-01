// Detect which wallet's in-app DApp browser we are running inside and return
// the matching adapter name. Returns null when running in a plain browser.
// Note: this intentionally checks injected globals / user-agent instead of
// adapter readyState, because on mobile TronLinkAdapter always reports "Found"
// and WalletConnectAdapter always reports "Found".
export function detectInjectedTronWalletName(): "TronLink" | null {
  if (typeof window === "undefined") {
    return null;
  }
  const w = window as any;

  // TokenPocket / TronLink in-app browsers expose window.tronLink / tronWeb,
  // both handled by TronLinkAdapter. (Trust's in-app browser only injects an
  // EVM provider and has no Tron provider, so it is intentionally excluded.)
  if (w.tronLink || w.tronWeb || w.tron) {
    return "TronLink";
  }

  return null;
}

export function hasInjectedTronWallet() {
  return detectInjectedTronWalletName() !== null;
}

export type MobileDeeplinkKey = "tokenpocket" | "tronlink";

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
    default:
      return;
  }

  window.location.href = deeplink;
}
