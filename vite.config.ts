import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // Vercel serves this app from the domain root (e.g. https://your-app.vercel.app/),
  // unlike GitHub Pages which needed a "/MONEY-RECEIPT/" subpath prefix.
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
