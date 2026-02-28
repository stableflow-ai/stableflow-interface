import { csl } from "@/utils/log";
import { useEffect } from "react";
import { useChainId, useAccount } from "wagmi";

export function useChainListener() {
  const chainId = useChainId();
  const { address } = useAccount();

  useEffect(() => {
    // Listen for chain changes
    const handleChainChange = (event: CustomEvent) => {
      csl("useChainListener", "gray-400", "Chain changed: %o", event.detail);
      // Add your chain change logic here
    };

    // Listen for account changes
    const handleAccountChange = (event: CustomEvent) => {
      csl("useChainListener", "gray-400", "Account changed: %o", event.detail);
      // Add your account change logic here
    };

    window.addEventListener("chainChanged", handleChainChange as EventListener);
    window.addEventListener(
      "accountsChanged",
      handleAccountChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "chainChanged",
        handleChainChange as EventListener
      );
      window.removeEventListener(
        "accountsChanged",
        handleAccountChange as EventListener
      );
    };
  }, []);

  return { chainId, address };
}
