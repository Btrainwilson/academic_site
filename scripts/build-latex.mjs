/**
 * Generates CV + statement TeX, runs pdflatex twice per document, copies PDFs to public/.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

import { latexRoot } from "./lib/latex-shared.mjs";
import { generateCvContent } from "./cv-to-latex.mjs";
import { generateStatementTex } from "./statements-to-latex.mjs";

const latexDir = join(latexRoot, "latex");
const publicDir = join(latexRoot, "public");

function pdflatexTwice(baseName) {
  const opts = { cwd: latexDir, stdio: "inherit" };
  const cmd = `pdflatex -interaction=nonstopmode -file-line-error ${baseName}.tex`;
  execSync(cmd, opts);
  execSync(cmd, opts);
}

function main() {
  mkdirSync(latexDir, { recursive: true });
  mkdirSync(publicDir, { recursive: true });

  generateCvContent();
  generateStatementTex();

  for (const base of ["cv", "research-statement", "teaching-statement"]) {
    pdflatexTwice(base);
  }

  for (const name of [
    "cv.pdf",
    "research-statement.pdf",
    "teaching-statement.pdf",
  ]) {
    copyFileSync(join(latexDir, name), join(publicDir, name));
    console.log(`Copied ${name} → public/`);
  }
}

main();
