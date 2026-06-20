import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// `base` controls the path the app is served from. GitHub Pages serves project
// sites from /<repo>/, so it defaults to "/most-wanted/". Override with the
// BASE_PATH env var (e.g. set BASE_PATH="/" when using a custom domain).
export default defineConfig(() => ({
  base: process.env.BASE_PATH ?? "/most-wanted/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
