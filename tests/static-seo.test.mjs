import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const routes = ["grade-calculator", "final-grade-calculator", "weighted-grade-calculator", "gpa-calculator", "test-grade-calculator", "ez-grader", "percentage-grade-calculator"];

test("all calculator routes contain static SEO and accessibility essentials", async () => {
  for (const route of routes) {
    const html = await readFile(resolve(root, "site", route, "index.html"), "utf8");
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<meta name="description"/);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://gradekit\\.pages\\.dev/${route}/"`));
    assert.match(html, /<meta property="og:image"/);
    assert.match(html, /application\/ld\+json/);
    assert.match(html, /"@type":"FAQPage"/);
    assert.match(html, /<h1>[^<]+<\/h1>/);
    assert.match(html, /aria-live="polite"/);
    assert.match(html, /inputmode="(?:decimal|numeric)"/);
    assert.match(html, /How to calculate it/);
    assert.match(html, /Example calculation/);
  }
});

test("discovery files list every canonical route", async () => {
  const sitemap = await readFile(resolve(root, "site", "sitemap.xml"), "utf8");
  const robots = await readFile(resolve(root, "site", "robots.txt"), "utf8");
  routes.forEach((route) => assert.match(sitemap, new RegExp(`/${route}/`)));
  assert.match(robots, /Sitemap: https:\/\/gradekit\.pages\.dev\/sitemap\.xml/);
});

test("every local page, script, stylesheet, image, and icon reference resolves", async () => {
  const htmlFiles = ["index.html", ...routes.map((route) => `${route}/index.html`)];
  for (const file of htmlFiles) {
    const html = await readFile(resolve(root, "site", file), "utf8");
    for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
      const localPath = match[1].split(/[?#]/)[0];
      const target = localPath.endsWith("/") ? `${localPath}index.html` : localPath;
      await access(resolve(root, "site", `.${target}`));
    }
  }
});
