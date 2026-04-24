/**
 * Generates latex/cv-content.tex (or cv-content-academic.tex) from src/data/cv/*.json.
 * Targeting the Sourabh Bajaj resume template format.
 *
 * Usage:
 *   node scripts/cv-to-latex.mjs                  # executive (default)
 *   CV_VARIANT=academic node scripts/cv-to-latex.mjs  # academic
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import {
  escapeHrefUrl,
  escapeLatex,
  latexRoot,
  loadJson,
} from "./lib/latex-shared.mjs";

const CV_VARIANT = process.env.CV_VARIANT ?? "executive";
const isAcademic = CV_VARIANT === "academic";
const SUMMARY_KEY = isAcademic ? "RS" : (process.env.CV_SUMMARY_KEY ?? "ceo");

const SOCIAL_ORDER = [
  { key: "website", label: "Website" },
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "googleScholar", label: "Google Scholar" },
  { key: "bluesky", label: "Bluesky" },
  { key: "twitter", label: "X" },
  { key: "orcid", label: "ORCID" },
];

const SERVICE_BLOCKS_EXEC = [
  { key: "leadership", title: "Leadership" },
  { key: "speaking", title: "Speaking \\& panels" },
  { key: "refereeRoles", title: "Reviewing \\& committees" },
  { key: "teachingRoles", title: "Teaching \\& formal roles" },
  { key: "competitions", title: "Competitions" },
  { key: "extWork", title: "Additional appointments" },
];

const SERVICE_BLOCKS_ACADEMIC = [
  { key: "teachingRoles", title: "Teaching \\& formal roles" },
  { key: "refereeRoles", title: "Reviewing \\& committees" },
];

function buildSocialLinks(urls) {
  const known = new Set(SOCIAL_ORDER.map((s) => s.key));
  const ordered = SOCIAL_ORDER.flatMap(({ key, label }) => {
    const href = urls?.[key];
    return href ? [{ key, label, href }] : [];
  });
  const extra = Object.entries(urls ?? {})
    .filter(([k]) => !known.has(k))
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

function mailtoFromContactBanner(contactBanner) {
  if (!Array.isArray(contactBanner)) return null;
  for (const item of contactBanner) {
    const link = item?.link;
    if (typeof link === "string" && link.startsWith("mailto:")) {
      return link;
    }
  }
  return null;
}

function renderCvItemBlock(item) {
  const rawTitle = escapeLatex(item.title);
  const title = item.link
    ? "\\href{" + escapeHrefUrl(item.link) + "}{" + rawTitle + "}"
    : rawTitle;
  const date = item.date ? escapeLatex(item.date) : "";
  const subtitle = item.subtitle ? escapeLatex(item.subtitle) : "";

  let out = "";
  if (subtitle) {
    out +=
      "    \\resumeSubheading\n" +
      "      {" +
      title +
      "}{" +
      date +
      "}\n" +
      "      {" +
      subtitle +
      "}{}";
  } else {
    out += "    \\resumeSubheadingSimple\n" + "      {" + title + "}{" + date + "}";
  }

  if (item.detail) {
    out +=
      "\n      \\resumeItemListStart\n" +
      "        \\resumeItemPlain{" +
      escapeLatex(item.detail) +
      "}\n" +
      "      \\resumeItemListEnd";
  }
  return out;
}

function renderPaperList(papers, sectionTitle) {
  if (!papers?.length) return "";
  const out = ["\\section{" + sectionTitle + "}", "  \\resumeSubHeadingListStart"];
  for (const p of papers) {
    const extra = p.additional_info ? " " + escapeLatex(p.additional_info) : "";

    const titleTex = p.link
      ? "\\href{" + escapeHrefUrl(p.link) + "}{" + escapeLatex(p.title) + "}"
      : escapeLatex(p.title);

    out.push("    \\resumeItemPlain{");
    out.push("      \\textbf{" + titleTex + "} \\\\");
    out.push("      " + escapeLatex(p.authors) + " \\\\");
    out.push("      \\textit{" + escapeLatex(p.citation) + "}" + extra);
    out.push("    }");
  }
  out.push("  \\resumeSubHeadingListEnd");
  return out.join("\n");
}

/* ── Section builders ─────────────────────────────────────────── */

function buildHeader(profile, displayName, mailto, email, links) {
  const chunks = [];
  chunks.push(
    "\\hypersetup{pdftitle={CV --- " +
      escapeLatex(displayName) +
      "}, pdfauthor={" +
      escapeLatex(displayName) +
      "}}",
  );

  const website = links.find((l) => l.key === "website");

  chunks.push("%----------HEADING-----------------");
  chunks.push("\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}");

  let left1 = "\\textbf{\\Large " + escapeLatex(displayName) + "}";
  if (website) {
    left1 =
      "\\textbf{\\href{" +
      escapeHrefUrl(website.href) +
      "}{\\Large " +
      escapeLatex(displayName) +
      "}}";
  }

  const right1 = email
    ? "Email : \\href{" + escapeHrefUrl(mailto) + "}{" + escapeLatex(email) + "}"
    : "";

  chunks.push("  " + left1 + " & " + right1 + "\\\\");

  const left2 = website
    ? "\\href{" +
      escapeHrefUrl(website.href) +
      "}{" +
      escapeLatex(website.href.replace(/^https?:\/\//, "")) +
      "}"
    : "";

  const otherLink = links.find((l) => l.key !== "website");
  const right2 = otherLink
    ? escapeLatex(otherLink.label) +
      " : \\href{" +
      escapeHrefUrl(otherLink.href) +
      "}{" +
      escapeLatex(otherLink.href.replace(/^https?:\/\//, "")) +
      "}"
    : "";

  chunks.push("  " + left2 + " & " + right2 + " \\\\");
  chunks.push("\\end{tabular*}");
  return chunks.join("\n");
}

function buildSummary(profile, summary) {
  if (!summary && !profile.productHighlight) return "";
  const chunks = [];
  chunks.push("\\section{Summary}");
  const parts = [];
  if (summary) parts.push(escapeLatex(summary.trim()));
  if (!isAcademic && summary && profile.productHighlight) parts.push(" -- ");
  if (!isAcademic && profile.productHighlight) {
    const ph = profile.productHighlight;
    parts.push(
      "\\textbf{\\href{" +
        escapeHrefUrl(ph.url) +
        "}{" +
        escapeLatex(ph.label) +
        "}}",
    );
    if (ph.subtitle) {
      parts.push(" (" + escapeLatex(ph.subtitle) + ")");
    }
  }
  chunks.push("\\small{" + parts.join("") + "}");
  return chunks.join("\n");
}

function buildSkills(profile) {
  if ((profile.skillList?.length ?? 0) === 0) return "";
  const chunks = [];
  chunks.push("\\section{Skills}");
  chunks.push(" \\resumeSubHeadingListStart");
  chunks.push("   \\item{");
  chunks.push("     {" + escapeLatex(profile.skillList.join(", ")) + "}");
  chunks.push("   }");
  chunks.push(" \\resumeSubHeadingListEnd");
  return chunks.join("\n");
}

function buildEducation(education) {
  if (education.length === 0) return "";
  const chunks = [];
  chunks.push("\\section{Education}");
  chunks.push("  \\resumeSubHeadingListStart");
  for (const item of education) {
    chunks.push(renderCvItemBlock(item));
  }
  chunks.push("  \\resumeSubHeadingListEnd");
  return chunks.join("\n");
}

function buildTools(tools) {
  if (tools.length === 0) return "";
  const chunks = [];
  chunks.push("\\section{Developed Tools}");
  chunks.push("  \\resumeSubHeadingListStart");
  for (const item of tools) {
    chunks.push(renderCvItemBlock(item));
  }
  chunks.push("  \\resumeSubHeadingListEnd");
  return chunks.join("\n");
}

function buildProfessionalCareer(orderedRoles) {
  if (!orderedRoles?.length) return "";
  const chunks = [];
  chunks.push("\\section{Professional Career}");
  chunks.push("  \\resumeSubHeadingListStart");
  for (const role of orderedRoles) {
    const h = role.head;
    chunks.push("    \\resumeSubheading");
    chunks.push(
      "      {" + escapeLatex(h.title) + "}{" +
        (h.date ? escapeLatex(h.date) : "") + "}",
    );
    chunks.push(
      "      {" + (h.subtitle ? escapeLatex(h.subtitle) : "") + "}{}",
    );
  }
  chunks.push("  \\resumeSubHeadingListEnd");
  return chunks.join("\n");
}

function buildExperience(orderedRoles) {
  if (!orderedRoles?.length) return "";
  const chunks = [];
  chunks.push("\\section{Experience}");
  chunks.push("  \\resumeSubHeadingListStart");

  for (const role of orderedRoles) {
    const h = role.head;
    const titleTex = h.link
      ? "\\href{" + escapeHrefUrl(h.link) + "}{" + escapeLatex(h.title) + "}"
      : escapeLatex(h.title);

    if (h.subtitle || h.date) {
      chunks.push("    \\resumeSubheading");
      chunks.push(
        "      {" +
          titleTex +
          "}{" +
          (h.location ? escapeLatex(h.location) : "") +
          "}",
      );
      chunks.push(
        "      {" +
          (h.subtitle ? escapeLatex(h.subtitle) : "") +
          "}{" +
          (h.date ? escapeLatex(h.date) : "") +
          "}",
      );
    } else {
      chunks.push("    \\resumeSubheadingSimple");
      chunks.push(
        "      {" +
          titleTex +
          "}{" +
          (h.location ? escapeLatex(h.location) : "") +
          "}",
      );
    }

    if (role.bullets?.length) {
      chunks.push("      \\resumeItemListStart");
      for (const b of role.bullets) {
        let line = escapeLatex(b.text);
        if (b.links?.length) {
          const linkParts = b.links.map(
            (href, i) =>
              "\\href{" + escapeHrefUrl(href) + "}{[" + (i + 1) + "]}",
          );
          line += "\\, " + linkParts.join("\\, ");
        }
        chunks.push("        \\resumeItemPlain{" + line + "}");
      }
      chunks.push("      \\resumeItemListEnd");
    }
  }
  chunks.push("  \\resumeSubHeadingListEnd");
  return chunks.join("\n");
}

function buildInterests(profile) {
  if ((profile.interests?.length ?? 0) === 0) return "";
  const chunks = [];
  chunks.push("\\section{Research Interests}");
  chunks.push("  \\resumeSubHeadingListStart");
  for (const t of profile.interests) {
    chunks.push("    \\resumeItemPlain{" + escapeLatex(t) + "}");
  }
  chunks.push("  \\resumeSubHeadingListEnd");
  return chunks.join("\n");
}

function buildFunding(funding) {
  const hasFunding =
    (funding.grants?.length ?? 0) +
      (funding.fellowships?.length ?? 0) +
      (funding.funding?.length ?? 0) >
    0;
  if (!hasFunding) return "";

  const chunks = [];
  if ((funding.grants ?? []).length > 0) {
    chunks.push("\\section{Grants}");
    chunks.push("  \\resumeSubHeadingListStart");
    for (const item of funding.grants) {
      chunks.push(renderCvItemBlock(item));
    }
    chunks.push("  \\resumeSubHeadingListEnd");
  }
  if ((funding.fellowships ?? []).length > 0) {
    chunks.push("\\section{Fellowships}");
    chunks.push("  \\resumeSubHeadingListStart");
    for (const item of funding.fellowships) {
      chunks.push(renderCvItemBlock(item));
    }
    chunks.push("  \\resumeSubHeadingListEnd");
  }
  if ((funding.funding ?? []).length > 0) {
    chunks.push("\\section{Sponsors \\& Programs}");
    chunks.push("  \\resumeSubHeadingListStart");
    for (const item of funding.funding) {
      chunks.push(renderCvItemBlock(item));
    }
    chunks.push("  \\resumeSubHeadingListEnd");
  }
  return chunks.join("\n");
}

function buildService(service, blocks) {
  const anyService = blocks.some(({ key }) => (service[key] ?? []).length > 0);
  if (!anyService) return "";

  const chunks = [];
  for (const { key, title } of blocks) {
    const items = service[key] ?? [];
    if (!items.length) continue;
    chunks.push("\\section{" + title + "}");
    chunks.push("  \\resumeSubHeadingListStart");
    for (const item of items) {
      chunks.push(renderCvItemBlock(item));
    }
    chunks.push("  \\resumeSubHeadingListEnd");
  }
  return chunks.join("\n");
}

function buildMentorship(mentorshipHighlights, menteesSorted) {
  const chunks = [];
  if (mentorshipHighlights.length > 0) {
    chunks.push("\\section{Student Highlights \\& Mentorship}");
    chunks.push("  \\resumeSubHeadingListStart");
    for (const item of mentorshipHighlights) {
      chunks.push(renderCvItemBlock(item));
    }
    chunks.push("  \\resumeSubHeadingListEnd");
  }

  if (menteesSorted.length > 0) {
    chunks.push("\\section{Mentees}");
    chunks.push("  \\resumeSubHeadingListStart");
    for (const m of menteesSorted) {
      const loc = m.lastKnownLocation?.trim()
        ? escapeLatex(m.lastKnownLocation.trim())
        : "";
      chunks.push("    \\resumeSubheadingSimple");
      chunks.push("      {" + escapeLatex(m.name) + "}{" + loc + "}");
    }
    chunks.push("  \\resumeSubHeadingListEnd");
  }
  return chunks.join("\n");
}

function buildSoftware(software) {
  if (software.length === 0) return "";
  const chunks = [];
  chunks.push("\\section{Software \\& Engineering Projects}");
  chunks.push("  \\resumeSubHeadingListStart");
  for (const item of software) {
    chunks.push(renderCvItemBlock(item));
  }
  chunks.push("  \\resumeSubHeadingListEnd");
  return chunks.join("\n");
}

function buildNews(news) {
  if (news.length === 0) return "";
  const chunks = [];
  chunks.push("\\section{Media \\& Highlights}");
  chunks.push("  \\resumeSubHeadingListStart");
  for (const n of news) {
    const dateCol = n.date ? escapeLatex(n.date) : "";
    const titlePart = n.link
      ? "\\href{" +
        escapeHrefUrl(n.link) +
        "}{" +
        escapeLatex(n.title) +
        "}"
      : escapeLatex(n.title);

    chunks.push("    \\resumeSubheading");
    chunks.push("      {" + titlePart + "}{" + dateCol + "}");
    chunks.push("      {" + escapeLatex(n.location) + "}{}");
  }
  chunks.push("  \\resumeSubHeadingListEnd");
  return chunks.join("\n");
}

function buildAffiliations(affiliations) {
  if (affiliations.length === 0) return "";
  const chunks = [];
  chunks.push("\\section{Affiliations}");
  chunks.push("  \\resumeSubHeadingListStart");
  for (const item of affiliations) {
    chunks.push(renderCvItemBlock(item));
  }
  chunks.push("  \\resumeSubHeadingListEnd");
  return chunks.join("\n");
}

function buildReferences(references) {
  if (references.length === 0) return "";
  const chunks = [];
  chunks.push("\\section{References}");
  chunks.push("  \\resumeSubHeadingListStart");
  for (const r of references) {
    if (r.subtitle) {
      chunks.push("    \\resumeSubheading");
      chunks.push("      {" + escapeLatex(r.title) + "}{}");
      chunks.push("      {" + escapeLatex(r.subtitle) + "}{}");
    } else {
      chunks.push("    \\resumeSubheadingSimple");
      chunks.push("      {" + escapeLatex(r.title) + "}{}");
    }
  }
  chunks.push("  \\resumeSubHeadingListEnd");
  return chunks.join("\n");
}

/* ── Main ─────────────────────────────────────────────────────── */

/**
 * Writes latex/cv-content.tex (or cv-content-academic.tex) from JSON sources.
 */
export function generateCvContent() {
  const profile = loadJson("src/data/cv/profile.json");
  const education = loadJson("src/data/cv/education.json");
  const experience = loadJson("src/data/cv/experience.json");
  const funding = loadJson("src/data/cv/funding.json");
  const service = loadJson("src/data/cv/service.json");
  const papers = loadJson("src/data/cv/papers.json");
  const conferences = loadJson("src/data/cv/conferences.json");
  const news = loadJson("src/data/cv/news.json");
  const affiliations = loadJson("src/data/cv/affiliations.json");
  const mentorship = loadJson("src/data/cv/mentorship.json");
  const software = loadJson("src/data/cv/software.json");
  const tools = loadJson("src/data/cv/tools.json");
  const references = loadJson("src/data/cv/references.json");

  const summary =
    profile.summaries?.[SUMMARY_KEY] ?? profile.summaries?.RS ?? "";
  const displayName = profile.fullName?.trim() || "Curriculum vitae";

  const mentorshipHighlights = mentorship.highlights ?? [];
  const menteesSorted = [...(mentorship.mentees ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const orderedRoles = experience.order
    ? experience.order
        .map((id) => experience.roles.find((r) => r.id === id))
        .filter((r) => r !== undefined)
    : experience.roles;

  const mailto = mailtoFromContactBanner(profile.contactBanner);
  const email = mailto ? mailto.replace(/^mailto:/i, "") : "";
  const links = buildSocialLinks(profile.urls);

  const serviceBlocks = isAcademic ? SERVICE_BLOCKS_ACADEMIC : SERVICE_BLOCKS_EXEC;

  // Build all sections
  const sec = {
    header: buildHeader(profile, displayName, mailto, email, links),
    summary: buildSummary(profile, summary),
    skills: buildSkills(profile),
    education: buildEducation(education),
    tools: buildTools(tools),
    professionalCareer: buildProfessionalCareer(orderedRoles),
    experience: buildExperience(orderedRoles),
    interests: buildInterests(profile),
    publications: renderPaperList(papers, "Publications"),
    conferences: renderPaperList(conferences, "Conference Talks \\& Posters"),
    funding: buildFunding(funding),
    service: buildService(service, serviceBlocks),
    mentorship: buildMentorship(mentorshipHighlights, menteesSorted),
    software: buildSoftware(software),
    news: buildNews(news),
    affiliations: buildAffiliations(affiliations),
    references: buildReferences(references),
  };

  // Section order depends on variant
  const order = isAcademic
    ? [
        "header", "summary", "skills", "education",
        "professionalCareer", "funding",
        "publications", "conferences",
        "affiliations",
        "interests", "tools",
        "service", "mentorship",
        "references",
      ]
    : [
        "header", "summary", "skills", "education",
        "tools", "experience", "interests",
        "publications", "conferences", "funding",
        "service", "mentorship",
        "software", "news",
        "affiliations", "references",
      ];

  const outDir = join(latexRoot, "latex");
  mkdirSync(outDir, { recursive: true });
  const suffix = isAcademic ? "-academic" : "";
  const outPath = join(outDir, `cv-content${suffix}.tex`);
  const body = order.map((k) => sec[k]).filter(Boolean).join("\n") + "\n";
  writeFileSync(outPath, body, "utf8");
  console.log(`Wrote ${outPath} (variant: ${CV_VARIANT})`);
}

function main() {
  generateCvContent();
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main();
}
