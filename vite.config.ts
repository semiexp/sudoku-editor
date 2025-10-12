import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import topLevelAwait from "vite-plugin-top-level-await";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), topLevelAwait()],
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      }
    }
  },
  worker: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      }
    }
  },
})
