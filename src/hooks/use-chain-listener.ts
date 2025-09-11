import { useEffect } from "react";
import { useChainId, useAccount } from "wagmi";

export function useChainListener() {
  const chainId = useChainId();
  const { address } = useAccount();

  useEffect(() => {
    // Listen for chain changes
    const handleChainChange = (event: CustomEvent) => {
      console.log("Chain changed:", event.detail);
      // Add your chain change logic here
    };

    // Listen for account changes
    const handleAccountChange = (event: CustomEvent) => {
      console.log("Account changed:", event.detail);
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
