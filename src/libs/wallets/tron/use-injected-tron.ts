import { useEffect, useState } from "react";
import { detectInjectedTronWalletName, type InjectedTronWalletName } from "./deeplinks";

const POLL_INTERVAL_MS = 100;
const POLL_MAX_TIMES = 30;

export function useInjectedTron() {
  const [injectedName, setInjectedName] = useState<InjectedTronWalletName | null>(
    () => detectInjectedTronWalletName()
  );

  useEffect(() => {
    const currentName = detectInjectedTronWalletName();
    if (currentName) {
      setInjectedName(currentName);
      return;
    }

    let times = 0;
    const timer = setInterval(() => {
      times += 1;
      const name = detectInjectedTronWalletName();
      if (name) {
        setInjectedName(name);
        clearInterval(timer);
      } else if (times >= POLL_MAX_TIMES) {
        clearInterval(timer);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return {
    hasInjected: injectedName !== null,
    injectedName,
  };
}
