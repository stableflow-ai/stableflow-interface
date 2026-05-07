import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
// import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ["buffer", "process", "stream", "util"],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    }),
    // visualizer({ open: false, gzipSize: true, brotliSize: true })
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: "/src"
      },
      { find: "buffer", replacement: "buffer" }
    ]
  },
  define: {
    global: "globalThis",
    "process.env": "{}",
    "process.browser": "true"
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
        "process.env": "{}",
        "process.browser": "true"
      }
    },
    include: ["buffer", "process", "stream", "util"],
    // Force pre-bundling of problematic dependencies
    force: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;

          // WalletConnect & Reown appkit: Confirmed by visualizer to be duplicated across 4 chunks
          // There are cross-dependencies between chain SDKs. Forcing chunks causes circular chunk errors, so only merge WalletConnect
          if (id.includes("/@walletconnect/") || id.includes("/@reown/appkit")) {
            return "vendor-walletconnect";
          }
          // Let Rollup automatically split the remaining chain-specific SDKs (solana/near/tron/aptos/ton/layerzero),
          // to avoid circular chunk errors caused by cross-chain imports
        }
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
