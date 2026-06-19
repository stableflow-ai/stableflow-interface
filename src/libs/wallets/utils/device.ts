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
