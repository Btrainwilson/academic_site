// @ts-check
import { defineConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import starlightBlog from "starlight-blog";

import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Example Research Lab",
      description: "Research notes and updates (Starlight blog).",
      plugins: [starlightBlog()],
      customCss: [
        "./src/styles/global.css",
        "./src/styles/starlight-katex.css",
        "./src/styles/starlight-site-colors.css",
      ],
      sidebar: [
        {
          label: "Blog",
          autogenerate: { directory: "blog" },
        },
      ],
    }),
    react(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  },
});
