// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.YOUTUBE_API_KEY || env.VITE_YOUTUBE_API_KEY || "";
  const channelId = env.YOUTUBE_CHANNEL_ID || env.VITE_YOUTUBE_CHANNEL_ID || "UCISl2wEDnzYeg-k_kElfN4Q";

  return {
    define: {
      "process.env.YOUTUBE_API_KEY": JSON.stringify(apiKey),
      "process.env.VITE_YOUTUBE_API_KEY": JSON.stringify(apiKey),
      "process.env.YOUTUBE_CHANNEL_ID": JSON.stringify(channelId),
      "process.env.VITE_YOUTUBE_CHANNEL_ID": JSON.stringify(channelId),
    },
    tanstackStart: {
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      // nitro/vite builds from this
      server: { entry: "server" },
    },
  };
});
