import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ["buffer", "process"],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    })
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
    include: ["buffer", "process"],
    // Force pre-bundling of problematic dependencies
    force: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split node_modules packages into separate chunks
          if (id.includes('node_modules')) {
            // Keep React and React-dependent libraries together
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') ||
                id.includes('ahooks') || id.includes('zustand') || id.includes('@tanstack')) {
              return 'react-vendor';
            }
            // Keep wallet and blockchain libraries together
            if (id.includes('@rainbow-me') || id.includes('@solana/wallet') || 
                id.includes('@aptos-labs/wallet') || id.includes('@near-wallet') || 
                id.includes('@tronweb3') || id.includes('@solana/web3') || 
                id.includes('@solana/spl-token') || id.includes('@aptos-labs/ts-sdk') || 
                id.includes('ethers') || id.includes('viem') || id.includes('wagmi') || 
                id.includes('tronweb')) {
              return 'wallet-blockchain-vendor';
            }
            // UI libraries
            if (id.includes('framer-motion') || id.includes('swiper') || 
                id.includes('react-toastify')) {
              return 'ui-vendor';
            }
            // Pure utility libraries (no React dependencies)
            if (id.includes('axios') || id.includes('dayjs') || id.includes('big.js') || 
                id.includes('clsx')) {
              return 'utils-vendor';
            }
            // Other third-party libraries
            return 'vendor';
          }
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Enable sourcemap for debugging
    sourcemap: false,
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      mangle: {
        safari10: true
      }
    },
    // Enable gzip compression reporting
    reportCompressedSize: true,
    // Target browser
    target: 'esnext'
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
