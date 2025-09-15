/// <reference types="vite/client" />

declare global {
  interface Window {
    updateTxnTimer: NodeJS.Timeout;
  }
}

export {};
