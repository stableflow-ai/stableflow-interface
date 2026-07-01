let initialized = false;

export function shouldEnableVConsole() {
  if (import.meta.env.DEV) return true;
  if (import.meta.env.VITE_VCONSOLE === "true") return true;

  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  const value = params.get("vconsole");
  return value === "1" || value === "true";
}

export async function initVConsole() {
  if (!shouldEnableVConsole() || initialized) return;

  initialized = true;

  const { default: VConsole } = await import("vconsole");
  new VConsole();
}
