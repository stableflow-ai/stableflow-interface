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
    // Multi-chain wallet SDKs make the bundle very large; gzip size reporting
    // alone can push CI past the Node heap limit near the end of the build.
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
