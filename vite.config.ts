import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
  const isStorybook =
    process.env.STORYBOOK === "true" ||
    process.env.npm_lifecycle_event === "storybook" ||
    process.env.npm_lifecycle_event === "build-storybook";

  const plugins = [react()];

  if (!isStorybook) {
    plugins.push(
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["icons/**"],
        manifest: {
          name: "Tennis-Mixer 🎾",
          short_name: "Tennis-Mixer",
          description: "Intelligenter Aufstellungs-Mixer für Tennis-Doppel mit 5 Spielern",
          theme_color: "#0f172a",
          background_color: "#0f172a",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          icons: [
            {
              src: "/icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: { cacheName: "google-fonts-cache" },
            },
          ],
        },
      }),
    );
  }

  return {
    plugins,
    test: {
      environment: "jsdom",
      globals: true,
      coverage: {
        provider: "v8",
        include: ["src/lib/**"],
      },
    },
  };
});
