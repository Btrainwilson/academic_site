import type { Publication } from "@/types/data";

import publicationsJson from "@/data/publications.json";

/** Single source of truth for the site publications list (`src/data/publications.json`). */
export const publications: Publication[] = publicationsJson as Publication[];
