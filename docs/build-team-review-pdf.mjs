/**
 * Сборка HTML + PDF отчёта SPA Segment Team Review (Edge headless, без Puppeteer).
 */
import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const mdPath = join(root, "knowledge-base", "SPA-SEGMENT-TEAM-REVIEW.md");
const cssPath = join(__dirname, "team-review-pdf.css");
const htmlPath = join(__dirname, "SPA-SEGMENT-TEAM-REVIEW.html");
const pdfDocs = join(__dirname, "SPA-SEGMENT-TEAM-REVIEW.pdf");
const desktop = join(
  process.env.USERPROFILE,
  "OneDrive",
  "Рабочий стол",
  "SPA-SEGMENT-TEAM-REVIEW.pdf"
);

const md = readFileSync(mdPath, "utf8");
const css = readFileSync(cssPath, "utf8");
const body = marked.parse(md, { gfm: true, breaks: false });

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Сегмент SPA / банные комплексы — командное ревью</title>
<style>
${css}
</style>
</head>
<body>
${body}
</body>
</html>`;

writeFileSync(htmlPath, html, "utf8");
console.log("HTML:", htmlPath);

const edge =
  process.env.EDGE_PATH ??
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/").replace(/ /g, "%20");

execFileSync(
  edge,
  ["--headless=new", "--disable-gpu", `--print-to-pdf=${pdfDocs}`, fileUrl],
  { stdio: "inherit", timeout: 120000 }
);

copyFileSync(pdfDocs, desktop);
console.log("PDF:", pdfDocs);
console.log("PDF:", desktop);
