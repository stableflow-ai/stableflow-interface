/// <reference types="vite/client" />

declare global {
  interface Window {
    updateTxnTimer: NodeJS.Timeout;
    updateEvmBalancesTimer: NodeJS.Timeout;
  }
}

export {};
