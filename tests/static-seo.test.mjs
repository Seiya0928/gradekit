import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { activePartners, defaultOrigin, docSlugs, routes, site, toolSlugs, tools } from "../scripts/pages.mjs";

const root = resolve(import.meta.dirname, "..");
const read = (file) => readFile(resolve(root, "site", file), "utf8");
const htmlFiles = ["index.html", "404.html", ...toolSlugs.map((s) => `${s}/index.html`), ...docSlugs.map((s) => `${s}/index.html`)];
const indexedFiles = htmlFiles.filter((file) => file !== "404.html");
const pick = (html, re) => html.match(re)?.[1] ?? "";

test("every calculator route ships the on-page SEO and accessibility essentials", async () => {
  for (const slug of toolSlugs) {
    const html = await read(`${slug}/index.html`);
    assert.match(html, /<title>[^<]+<\/title>/, slug);
    assert.match(html, /<meta name="description" content="[^"]+"/, slug);
    assert.match(html, new RegExp(`<link rel="canonical" href="${defaultOrigin}/${slug}/"`), slug);
    assert.match(html, /<meta property="og:image"/, slug);
    assert.match(html, /"@type":"FAQPage"/, slug);
    assert.match(html, /"@type":"BreadcrumbList"/, slug);
    assert.match(html, /<h1>[^<]+<\/h1>/, slug);
    assert.match(html, /How to calculate it/, slug);
    assert.match(html, /Example calculation/, slug);
    // Reference pages carry no live calculator, so the widget-only checks are scoped.
    if (tools[slug].kind !== "reference") {
      assert.match(html, /aria-live="polite"/, slug);
      assert.match(html, /inputmode="(?:decimal|numeric)"/, slug);
      assert.match(html, new RegExp(`data-calculator="${tools[slug].type}"`), slug);
      assert.match(html, /"@type":"WebApplication"/, slug);
    }
  }
});

test("doc pages exist, are indexable, and carry real body copy", async () => {
  for (const slug of docSlugs) {
    const html = await read(`${slug}/index.html`);
    assert.match(html, new RegExp(`<link rel="canonical" href="${defaultOrigin}/${slug}/"`), slug);
    assert.doesNotMatch(html, /name="robots"/, slug);
    const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    assert.ok(words > 250, `${slug} has only ${words} words`);
  }
  // Affiliate networks and the FTC both require these to be reachable.
  assert.ok(docSlugs.includes("privacy"), "a privacy policy is required");
  assert.ok(docSlugs.includes("affiliate-disclosure"), "an affiliate disclosure is required");
});

test("titles and descriptions are unique and fit the SERP", async () => {
  const titles = new Map(), descriptions = new Map();
  for (const file of indexedFiles) {
    const html = await read(file);
    const title = pick(html, /<title>([^<]+)<\/title>/);
    const description = pick(html, /<meta name="description" content="([^"]+)"/);
    assert.ok(title.length > 0 && title.length <= 60, `${file}: title is ${title.length} chars — ${title}`);
    assert.ok(description.length >= 70 && description.length <= 165, `${file}: description is ${description.length} chars`);
    assert.equal(titles.get(title), undefined, `duplicate title in ${file} and ${titles.get(title)}`);
    assert.equal(descriptions.get(description), undefined, `duplicate description in ${file} and ${descriptions.get(description)}`);
    titles.set(title, file);
    descriptions.set(description, file);
  }
});

test("structured data parses and describes the right page", async () => {
  for (const file of indexedFiles) {
    const html = await read(file);
    const raw = pick(html, /<script type="application\/ld\+json">(.+?)<\/script>/s);
    assert.ok(raw, `${file} has no JSON-LD`);
    const data = JSON.parse(raw);
    const types = data["@graph"].map((node) => node["@type"]);
    assert.ok(types.includes("Organization") && types.includes("WebSite") && types.includes("WebPage"), `${file}: ${types}`);
    const page = data["@graph"].find((node) => node["@type"] === "WebPage");
    assert.equal(page.url, `${defaultOrigin}/${file.replace(/index\.html$/, "")}`, file);
    assert.equal(page.dateModified, site.updated, file);
    // The old homepage shipped a SearchAction with no query template, which is invalid.
    assert.ok(!JSON.stringify(data).includes("SearchAction"), `${file} still declares a SearchAction`);
  }
});

test("404 page exists, is noindex, and is kept out of discovery files", async () => {
  const html = await read("404.html");
  assert.match(html, /<meta name="robots" content="noindex, follow">/);
  assert.doesNotMatch(html, /rel="canonical"/);
  assert.match(html, /class="tools-grid"/, "the 404 page should route visitors back into the site");
  const sitemap = await read("sitemap.xml");
  assert.doesNotMatch(sitemap, /404/);
});

test("discovery files list every canonical route and nothing else", async () => {
  const sitemap = await read("sitemap.xml");
  const textSitemap = await read("sitemap.txt");
  const robots = await read("robots.txt");
  const expected = routes.map((path) => `${defaultOrigin}/${path}`);

  assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]), expected);
  assert.deepEqual(textSitemap.trim().split("\n"), expected);
  assert.equal([...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].length, expected.length, "every URL needs a lastmod");
  assert.match(sitemap, new RegExp(`<lastmod>${site.updated}</lastmod>`));
  assert.match(robots, new RegExp(`Sitemap: ${defaultOrigin}/sitemap\\.xml`));
  assert.ok(expected.length >= 12, `expected at least 12 routes, found ${expected.length}`);
});

test("every local page, script, stylesheet, image, and icon reference resolves", async () => {
  for (const file of htmlFiles) {
    const html = await read(file);
    for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
      const localPath = match[1].split(/[?#]/)[0];
      const target = localPath.endsWith("/") ? `${localPath}index.html` : localPath;
      await access(resolve(root, "site", `.${target}`)).catch(() => {
        assert.fail(`${file} links to ${match[1]}, which does not exist`);
      });
    }
  }
});

test("internal linking: every page is reachable and tools cross-link in body copy", async () => {
  const home = await read("index.html");
  for (const slug of [...toolSlugs, ...docSlugs]) {
    assert.match(home, new RegExp(`href="/${slug}/"`), `home does not link to /${slug}/`);
  }
  assert.match(home, /id="all-tools"/);

  // Contextual links inside the rendered explanatory copy — not the nav, the
  // footer, or the related-tools cards, which every page carries anyway.
  for (const slug of toolSlugs) {
    const html = await read(`${slug}/index.html`);
    const prose = html.match(/<section class="content-wrap">[\s\S]*?<\/section>/)?.[0];
    assert.ok(prose, `${slug} has no content-wrap section`);
    const links = [...prose.matchAll(/href="\/([a-z-]+)\/"/g)].map((m) => m[1]);
    assert.ok(links.length >= 1, `${slug} renders no contextual internal link in its body copy`);
    links.forEach((target) => assert.ok(toolSlugs.includes(target) || docSlugs.includes(target), `${slug} links to unknown route /${target}/`));
    assert.ok(!links.includes(slug), `${slug} links to itself in body copy`);
  }
});

test("related tools reference real, different routes", () => {
  for (const slug of toolSlugs) {
    for (const target of tools[slug].related ?? []) {
      assert.ok(toolSlugs.includes(target), `${slug} lists unknown related tool ${target}`);
      assert.notEqual(target, slug, `${slug} lists itself as related`);
    }
  }
});

test("the published grading scale cannot drift from what the calculators return", async () => {
  const { letterGrade } = await import("../site/assets/calculators.js");
  const { gradeScale } = await import("../scripts/pages.mjs");
  for (const row of gradeScale) {
    assert.equal(letterGrade(row.min), row.letter, `${row.min}% should be ${row.letter}`);
    assert.equal(letterGrade(row.max), row.letter, `${row.max}% should be ${row.letter}`);
  }
  const html = await read("grading-scale-chart/index.html");
  gradeScale.forEach((row) => assert.match(html, new RegExp(`${row.min}–${row.max}%`), `chart is missing the ${row.letter} row`));
});

test("affiliate links stay disclosed, attributed, and out of the calculators", async () => {
  for (const file of htmlFiles) {
    const html = await read(file);
    for (const match of html.matchAll(/<a class="partner-card" href="([^"]+)"([^>]*)>/g)) {
      assert.match(match[2], /rel="sponsored nofollow noopener"/, `${file}: partner link is missing rel attributes`);
      assert.match(match[2], /target="_blank"/, file);
    }
    if (html.includes("partner-card")) {
      assert.match(html, /affiliate-disclosure/, `${file} shows partner links without linking the disclosure`);
    }
    // No outbound commercial link may sit inside the calculator or result widget.
    const widget = html.match(/<div class="calculator-card"[\s\S]*?<\/aside>/)?.[0] ?? "";
    assert.doesNotMatch(widget, /rel="sponsored/, `${file}: sponsored link inside the calculator`);
  }
  activePartners.forEach((partner) => assert.match(partner.href, /^https:\/\//, `${partner.id} needs an absolute https URL`));
});

test("docs and tools do not collide on a slug", () => {
  const overlap = toolSlugs.filter((slug) => docSlugs.includes(slug));
  assert.deepEqual(overlap, []);
  assert.equal(new Set(routes).size, routes.length, "duplicate route");
});

// The generated markup and the browser code are edited in different files, so a
// renamed input id would otherwise ship a silently dead calculator.
test("every calculator type is wired to an initializer that finds its inputs", async () => {
  const js = await readFile(resolve(root, "site", "assets", "main.js"), "utf8");
  const map = pick(js, /const initializers = \{([^}]+)\}/);
  assert.ok(map, "could not locate the initializers map in main.js");
  const wiring = Object.fromEntries([...map.matchAll(/(\w+):\s*(\w+)/g)].map((m) => [m[1], m[2]]));

  for (const slug of toolSlugs) {
    const { type, kind } = tools[slug];
    if (kind === "reference") { assert.equal(type, undefined, `${slug} is a reference page and needs no type`); continue; }
    const fn = wiring[type];
    assert.ok(fn, `main.js has no initializer registered for data-calculator="${type}" (${slug})`);

    const start = js.indexOf(`function ${fn}(`);
    assert.ok(start > -1, `${fn} is registered but not defined`);
    const body = js.slice(start, js.indexOf("\n}", start));
    const html = await read(`${slug}/index.html`);
    for (const id of new Set([...body.matchAll(/["'`]#([a-z][\w-]*)["'`]/g)].map((m) => m[1]))) {
      assert.match(html, new RegExp(`id="${id}"`), `${slug}: ${fn} reads #${id}, which is not in the page`);
    }
    for (const cls of new Set([...body.matchAll(/\$\(["']\.([a-z][\w-]*)["']/g)].map((m) => m[1]))) {
      assert.match(html, new RegExp(`class="[^"]*\\b${cls}\\b`), `${slug}: ${fn} reads .${cls}, which is not in the page`);
    }
  }
});

test("every tool and doc is reachable from the footer of every page", async () => {
  for (const file of htmlFiles) {
    const footer = (await read(file)).match(/<footer[\s\S]*<\/footer>/)?.[0] ?? "";
    assert.ok(footer, `${file} has no footer`);
    for (const slug of [...toolSlugs, ...docSlugs]) {
      assert.match(footer, new RegExp(`href="/${slug}/"`), `${file} footer omits /${slug}/`);
    }
  }
});
