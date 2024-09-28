import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import icon from "astro-icon";

import netlify from "@astrojs/netlify/functions";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react(), icon()],
  redirects: {
    "/programs": "/",
  },
  output: "server",
  adapter: netlify({
    edgeMiddleware: true,
  }),
});
