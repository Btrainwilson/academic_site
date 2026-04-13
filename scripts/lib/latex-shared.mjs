/**
 * Shared helpers for LaTeX generation (CV + statements).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Repo root (parent of scripts/). */
export const latexRoot = join(__dirname, "..", "..");

/** Escape text that appears in LaTeX body (not inside \\url / \\href URL arg handled separately). */
export function escapeLatex(s) {
  if (s == null || s === undefined) return "";
  return String(s)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/%/g, "\\%")
    .replace(/&/g, "\\&")
    .replace(/_/g, "\\_")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

/** Escape URL for hyperref first argument (%, #, &, ~ are problematic). */
export function escapeHrefUrl(u) {
  if (!u) return "";
  return String(u)
    .replace(/%/g, "\\%")
    .replace(/#/g, "\\#")
    .replace(/&/g, "\\&")
    .replace(/~/g, "\\textasciitilde{}");
}

export function loadJson(relPath) {
  const p = join(latexRoot, relPath);
  return JSON.parse(readFileSync(p, "utf8"));
}

export function readText(relPath) {
  const p = join(latexRoot, relPath);
  return readFileSync(p, "utf8");
}

/**
 * Strip YAML frontmatter from MD/MDX. Returns plain key/value strings (values trimmed).
 */
export function stripYamlFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) {
    return { frontmatter: {}, body: raw.trim() };
  }
  const fmBlock = m[1];
  const body = m[2].trimEnd();
  const frontmatter = {};
  for (const line of fmBlock.split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (kv) {
      frontmatter[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  return { frontmatter, body };
}
