/**
 * Subset Markdown → LaTeX for statement MDX bodies (no JSX/components).
 * Supports: ### / #### headings, paragraphs, **bold**, *italic*, [text](url),
 * and bullet lists (- or * at line start).
 */
import { escapeHrefUrl, escapeLatex } from "./latex-shared.mjs";

/**
 * Format inline markdown within a line: links, bold, italic. Remaining text is LaTeX-escaped.
 */
export function formatInline(line) {
  let s = line;
  let out = "";
  while (s.length) {
    const linkMatch = s.match(/^\[([^\]]*)\]\(([^)]*)\)/);
    if (linkMatch) {
      out +=
        "\\href{" +
        escapeHrefUrl(linkMatch[2]) +
        "}{" +
        escapeLatex(linkMatch[1]) +
        "}";
      s = s.slice(linkMatch[0].length);
      continue;
    }
    if (s.startsWith("**")) {
      const end = s.indexOf("**", 2);
      if (end !== -1) {
        out += "\\textbf{" + escapeLatex(s.slice(2, end)) + "}";
        s = s.slice(end + 2);
        continue;
      }
    }
    if (s.startsWith("*")) {
      const end = s.indexOf("*", 1);
      if (end !== -1 && end > 1) {
        out += "\\textit{" + escapeLatex(s.slice(1, end)) + "}";
        s = s.slice(end + 1);
        continue;
      }
    }
    const nextSpecial = s.search(/[[*]/);
    if (nextSpecial === -1) {
      out += escapeLatex(s);
      break;
    }
    if (nextSpecial > 0) {
      out += escapeLatex(s.slice(0, nextSpecial));
      s = s.slice(nextSpecial);
      continue;
    }
    // Leading [ or * that didn't match — escape literal
    out += escapeLatex(s[0]);
    s = s.slice(1);
  }
  return out;
}

/**
 * Convert markdown body to LaTeX fragment (no document wrapper).
 */
export function markdownToLatex(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (trimmed.startsWith("#### ")) {
      out.push("\\subsubsection*{" + formatInline(trimmed.slice(5)) + "}");
      out.push("");
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      out.push("\\subsection*{" + formatInline(trimmed.slice(4)) + "}");
      out.push("");
      i++;
      continue;
    }

    const listMatch = trimmed.match(/^(\*|-)\s+(.*)$/);
    if (listMatch) {
      out.push("\\begin{itemize}\\setlength{\\itemsep}{0.25em}");
      while (i < lines.length) {
        const L = lines[i].trim();
        const lm = L.match(/^(\*|-)\s+(.*)$/);
        if (!lm) break;
        out.push("  \\item " + formatInline(lm[2]));
        i++;
      }
      out.push("\\end{itemize}");
      out.push("");
      continue;
    }

    const para = [];
    while (i < lines.length) {
      const L = lines[i];
      const T = L.trim();
      if (T === "") break;
      if (T.startsWith("### ") || T.startsWith("#### ")) break;
      if (/^(\*|-)\s+/.test(T)) break;
      para.push(T);
      i++;
    }
    out.push(para.join(" ") + "\\par");
    out.push("\\medskip");
    out.push("");
  }

  return out.join("\n").trim() + "\n";
}
