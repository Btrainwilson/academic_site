import type { Publication } from "@/types/data";

import conferenceProceedingsJson from "@/data/conference-proceedings.json";

/** Conference talks, posters, and proceedings (`src/data/conference-proceedings.json`). */
export const conferenceProceedings: Publication[] =
  conferenceProceedingsJson as Publication[];
