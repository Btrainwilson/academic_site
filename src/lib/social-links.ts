/** Ordered social keys aligned with CV / landing — first match wins. */
export const SOCIAL_ORDER: { key: string; label: string }[] = [
  { key: "website", label: "Website" },
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "googleScholar", label: "Google Scholar" },
  { key: "bluesky", label: "Bluesky" },
  { key: "twitter", label: "X" },
  { key: "orcid", label: "ORCID" },
];

const knownUrlKeys = new Set(SOCIAL_ORDER.map((s) => s.key));

export interface BuiltSocialLink {
  key: string;
  label: string;
  href: string;
}

export function buildSocialLinks(urls: Record<string, string> | undefined): BuiltSocialLink[] {
  const ordered = SOCIAL_ORDER.flatMap(({ key, label }) => {
    const href = urls?.[key];
    return href ? [{ key, label, href }] : [];
  });
  const extra = Object.entries(urls ?? {})
    .filter(([k]) => !knownUrlKeys.has(k))
    .map(([key, href]) => ({
      key,
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (c) => c.toUpperCase())
        .trim(),
      href,
    }));
  return [...ordered, ...extra];
}
