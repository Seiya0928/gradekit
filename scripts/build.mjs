import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const defaultUrl = "https://gradekit.pages.dev";
const siteUrl = (process.env.SITE_URL || defaultUrl).replace(/\/$/, "");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const item of ["index.html", "robots.txt", "sitemap.xml", "sitemap.txt", "google037f1ca7862cb5a0.html", "_headers", "assets", "grade-calculator", "final-grade-calculator", "weighted-grade-calculator", "gpa-calculator", "test-grade-calculator", "ez-grader", "percentage-grade-calculator"]) {
  await cp(resolve(root, "site", item), resolve(dist, item), { recursive: true });
}

for (const file of ["index.html", "robots.txt", "sitemap.xml", "sitemap.txt", ...[
  "grade-calculator", "final-grade-calculator", "weighted-grade-calculator", "gpa-calculator", "test-grade-calculator", "ez-grader", "percentage-grade-calculator",
].map((route) => `${route}/index.html`)]) {
  const path = resolve(dist, file);
  const content = await readFile(path, "utf8");
  await writeFile(path, content.replaceAll("https://gradekit.pages.dev", siteUrl));
}

console.log(`Built GradeKit to dist/ with canonical URL ${siteUrl}`);
