// Simplily detect mobile device
export function isInMobileBrowser() {
  return (
    typeof navigator !== "undefined" &&
    navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i)
  );
}

// check simply if current environment is browser or not
export function isInBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined" && typeof navigator !== "undefined";
}

function hasOkxUserAgent() {
  return typeof navigator !== "undefined" && /OKApp/i.test(navigator.userAgent);
}

// Determine whether the app is running within the OKX built-in browser
export function isInOKApp() {
  if (!isInBrowser()) {
    return false;
  }

  return hasOkxUserAgent();
}

function isTrustProvider(provider: unknown): boolean {
  if (!provider || typeof provider !== "object") {
    return false;
  }

  const trustProvider = provider as { isTrust?: boolean; isTrustWallet?: boolean };
  return Boolean(trustProvider.isTrust || trustProvider.isTrustWallet);
}

// Determine whether the app is running within the Trust Wallet built-in browser
export function isInTrustWallet() {
  if (!isInBrowser() || !isInMobileBrowser()) {
    return false;
  }

  const w = window as Window & {
    ethereum?: { isTrust?: boolean; isTrustWallet?: boolean; providers?: unknown[] };
    trustWallet?: { ethereum?: unknown };
    trustwallet?: { ethereum?: unknown };
  };

  if (isTrustProvider(w.ethereum)) {
    return true;
  }

  if (w.ethereum?.providers?.some?.(isTrustProvider)) {
    return true;
  }

  const trustNamespace = w.trustWallet || w.trustwallet;
  return isTrustProvider(trustNamespace?.ethereum);
}
