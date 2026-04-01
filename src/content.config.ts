import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";
import { blogSchema } from "starlight-blog/schema";
import { z } from "astro/zod";

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({ extend: (context) => blogSchema(context) }),
});

const cv = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/cv" }),
  schema: z.object({
    title: z.string().optional(),
  }),
});

export const collections = { docs, cv };
