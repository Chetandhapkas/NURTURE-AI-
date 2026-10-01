import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()]
    })
  ],

  server: {
    host: "0.0.0.0",
    port: 5173,

    // Allow the temporary Cloudflare Tunnel hostname
    allowedHosts: [
      "moved-bringing-incident-islamic.trycloudflare.com"
    ],

    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false
      }
    }
  }
});