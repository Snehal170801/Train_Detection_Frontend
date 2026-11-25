import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import fs from "fs";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serverUrl = env.VITE_SERVER_URL || "http://localhost:5000";

  const proxy = {
    "/api": {
      target: serverUrl,
      changeOrigin: true,
    },
    "/uploads": {
      target: serverUrl,
      changeOrigin: true,
    },
  };

  // Locally-trusted cert (mkcert) — install certs/rootCA.pem on each
  // viewer's machine once to avoid the browser HTTPS warning entirely.
  const https = {
    cert: fs.readFileSync(path.resolve(__dirname, "certs/cert.pem")),
    key: fs.readFileSync(path.resolve(__dirname, "certs/key.pem")),
  };

  return {
    plugins: [react(), svgr()],
    server: {
      host: true,
      port: 5173,
      https,
      proxy,
    },
    preview: {
      host: true,
      port: 5174,
      https,
      proxy,
    },
  };
});
