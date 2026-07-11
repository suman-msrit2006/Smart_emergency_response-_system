import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Production optimizations  
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
});