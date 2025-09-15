import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
    "process.env": "{}"
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
        "process.env": "{}"
      }
    },
    include: ["buffer", "process"]
  }
});
