import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget =
    env.VITE_API_PROXY_TARGET?.trim() ||
    "http://127.0.0.1:5001/ai-artisan/us-central1/api";

  return {
    base: "/",
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          background_color: "#ffffff",
          description: "Turn your craft into a global brand - powered by AI",
          display: "standalone",
          icons: [
            { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
            { purpose: "any maskable", src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          ],
          name: "AI Artisan",
          short_name: "AI Artisan",
          start_url: "/",
          theme_color: "#ea580c",
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "unsplash-cache",
                expiration: { maxEntries: 60, maxAgeSeconds: 2592000 },
              },
            },
          ],
        },
      }),
    ],
    server: {
      cors: true,
      host: "::",
      port: 3000,
      proxy: {
        "/api": {
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api/, ""),
          target: proxyTarget,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".jsx", ".js", ".tsx", ".ts", ".json"],
    },
    build: {
      outDir: "dist",
      reportCompressedSize: true,
    },
  };
});
