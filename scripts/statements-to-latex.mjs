/**
 * Generates latex/research-content.tex, teaching-content.tex, and *-meta.tex
 * from src/content/cv/*.mdx and profile.json.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import {
  escapeLatex,
  latexRoot,
  loadJson,
  readText,
  stripYamlFrontmatter,
} from "./lib/latex-shared.mjs";
import { markdownToLatex } from "./lib/md-to-latex.mjs";

function writeMetaFile(outPath, { authorName, tagline, bannerTitle, pdfTitle }) {
  const tag = tagline ? escapeLatex(tagline) : "";
  const lines = [
    "% Auto-generated — do not edit by hand",
    "\\newcommand{\\StatementAuthorName}{" + escapeLatex(authorName) + "}",
    "\\newcommand{\\StatementAuthorTagline}{" + tag + "}",
    "\\newcommand{\\StatementBannerTitle}{" + escapeLatex(bannerTitle) + "}",
    "\\hypersetup{pdftitle={" + escapeLatex(pdfTitle) + "}, pdfauthor={" + escapeLatex(authorName) + "}}",
    "",
  ];
  writeFileSync(outPath, lines.join("\n"), "utf8");
}

/**
 * @param {string} relMdx — path under repo root, e.g. src/content/cv/research-statement.mdx
 * @param {string} prefix — "research" | "teaching" (basename for *-content.tex and *-meta.tex)
 */
function processStatement(relMdx, prefix, defaultTitle, pdfTitle) {
  const raw = readText(relMdx);
  const { frontmatter, body } = stripYamlFrontmatter(raw);
  const bannerTitle = frontmatter.title || defaultTitle;
  const profile = loadJson("src/data/cv/profile.json");
  const authorName = profile.fullName?.trim() || "Curriculum vitae";
  const tagline = profile.currentPosition?.trim() || "";

  const texBody = markdownToLatex(body);
  const outDir = join(latexRoot, "latex");
  mkdirSync(outDir, { recursive: true });
  const contentFile = join(outDir, `${prefix}-content.tex`);
  const metaPath = join(outDir, `${prefix}-meta.tex`);

  const header =
    "% Auto-generated from " +
    relMdx.replace(/\\/g, "/") +
    " — do not edit by hand\n";
  writeFileSync(contentFile, header + texBody, "utf8");
  console.log(`Wrote ${contentFile}`);

  writeMetaFile(metaPath, {
    authorName,
    tagline,
    bannerTitle,
    pdfTitle: pdfTitle || bannerTitle,
  });
  console.log(`Wrote ${metaPath}`);
}

export function generateStatementTex() {
  processStatement(
    "src/content/cv/research-statement.mdx",
    "research",
    "Research statement",
    "Research statement",
  );
  processStatement(
    "src/content/cv/teaching-statement.mdx",
    "teaching",
    "Teaching statement",
    "Teaching statement",
  );
}

function main() {
  generateStatementTex();
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main();
}
