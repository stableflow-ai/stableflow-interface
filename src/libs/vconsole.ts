const VCONSOLE_VERSION = "3.15.1";
const VCONSOLE_CDN_URL = `https://unpkg.com/vconsole@${VCONSOLE_VERSION}/dist/vconsole.min.js`;

let initialized = false;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

function shouldEnableVConsole(): boolean {
  if (import.meta.env.DEV) return true;
  return new URLSearchParams(window.location.search).has("vconsole");
}

/** Async init vConsole via CDN. Dev auto-enables; production uses `?vconsole=1`. */
export function initVConsole(): void {
  if (initialized || typeof window === "undefined" || !shouldEnableVConsole()) {
    return;
  }

  initialized = true;

  void loadScript(VCONSOLE_CDN_URL).then(() => {
    const VConsole = (window as Window & { VConsole?: new () => void }).VConsole;
    if (VConsole) {
      new VConsole();
    }
  });
}
