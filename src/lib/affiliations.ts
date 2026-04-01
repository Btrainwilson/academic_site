import fs from "node:fs";
import path from "node:path";
import affiliationsMeta from "@/data/landing/affiliations-meta.json";
import type { LandingCollaborator } from "@/types/data";

type MetaEntry = { name: string; href?: string };

const IMAGE_EXT = /\.(svg|png|jpe?g|webp|gif)$/i;

function isImageFile(name: string): boolean {
  return IMAGE_EXT.test(name);
}

/**
 * Build carousel items from files in `public/affiliations/`.
 * Each image must have an entry in `affiliations-meta.json` (keyed by filename).
 */
export function loadAffiliationsFromFolder(): LandingCollaborator[] {
  const dir = path.join(process.cwd(), "public/affiliations");
  if (!fs.existsSync(dir)) return [];

  const meta = affiliationsMeta as Record<string, MetaEntry>;
  const files = fs
    .readdirSync(dir)
    .filter(isImageFile)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const out: LandingCollaborator[] = [];
  for (const file of files) {
    const m = meta[file];
    if (!m?.name) continue;
    out.push({
      name: m.name,
      href: m.href,
      logo: `/affiliations/${file}`,
    });
  }
  return out;
}
