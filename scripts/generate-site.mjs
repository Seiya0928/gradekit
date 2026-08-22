import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { activePartners, defaultOrigin as url, docSlugs, docs, gradeScale, routes, site, toolSlugs, tools } from "./pages.mjs";

const root = resolve(import.meta.dirname, "..", "site");
const plain = (value) => value.replace(/<[^>]+>/g, "");
const primaryTools = toolSlugs.filter((slug) => tools[slug].primary);
const secondaryTools = toolSlugs.filter((slug) => !tools[slug].primary);

/* ---------- chrome ---------- */

const navHtml = (active = "") => [
  ...primaryTools.map((slug) => `<a href="/${slug}/"${slug === active ? ' aria-current="page"' : ""}>${tools[slug].nav}</a>`),
  `<a href="/#all-tools">All tools</a>`,
].join("");

const header = (active = "") => `<a class="skip-link" href="#main">Skip to calculator</a><header class="site-header"><div class="shell header-inner"><a class="brand" href="/"><span class="brand-mark">GK</span>GradeKit</a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Tools</button><nav class="site-nav" id="site-nav" aria-label="Calculator navigation">${navHtml(active)}</nav></div></header>`;

const footerColumn = (heading, links) => `<div class="footer-column"><h2>${heading}</h2>${links.map(([label, path]) => `<a href="${path}">${label}</a>`).join("")}</div>`;

const footer = `<footer class="site-footer"><div class="shell footer-inner"><div class="footer-brand"><a class="brand" href="/"><span class="brand-mark">GK</span>GradeKit</a><p>${site.tagline}</p></div><div class="footer-columns">${[
  footerColumn("Popular calculators", primaryTools.map((slug) => [tools[slug].title, `/${slug}/`])),
  footerColumn("More calculators", secondaryTools.map((slug) => [tools[slug].title, `/${slug}/`])),
  footerColumn("GradeKit", docSlugs.map((slug) => [docs[slug].title, `/${slug}/`])),
].join("")}</div></div><div class="shell footer-legal"><p>GradeKit is independent and is not affiliated with or endorsed by any school, district, or university. Results are estimates — your syllabus is authoritative.</p></div></footer>`;

const toolCard = (slug) => `<a class="tool-link" href="/${slug}/"><span>Open tool →</span><h3>${tools[slug].title}</h3><p>${tools[slug].lede}</p></a>`;

/* ---------- monetization ----------
   Renders nothing at all while every partner in pages.mjs has an empty href,
   so the site never ships an empty promo box or an undisclosed link. */

const partnerSection = activePartners.length
  ? `<section class="partner-wrap"><div class="shell"><div class="partner-head"><p class="eyebrow">Recommended study tools</p><p class="partner-note">Independently chosen. Some links earn GradeKit a commission at no cost to you — see the <a href="/affiliate-disclosure/">affiliate disclosure</a>.</p></div><div class="partner-grid">${activePartners.map((partner) => `<a class="partner-card" href="${partner.href}" rel="sponsored nofollow noopener" target="_blank"><span class="partner-cat">${partner.category}</span><h3>${partner.name}</h3><p>${partner.summary}</p></a>`).join("")}</div></div></section>`
  : "";

/* ---------- head + structured data ---------- */

const orgNode = { "@type": "Organization", "@id": `${url}/#organization`, name: site.name, url: `${url}/`, description: site.tagline };
const siteNode = { "@type": "WebSite", "@id": `${url}/#website`, name: site.name, url: `${url}/`, inLanguage: "en", publisher: { "@id": `${url}/#organization` } };

function jsonLd(page, slug, extraNodes = []) {
  const pageUrl = slug ? `${url}/${slug}/` : `${url}/`;
  const graph = [
    orgNode,
    siteNode,
    { "@type": "WebPage", "@id": `${pageUrl}#webpage`, url: pageUrl, name: page.seoTitle, description: page.meta, isPartOf: { "@id": `${url}/#website` }, inLanguage: "en", dateModified: site.updated, ...(slug ? { breadcrumb: { "@id": `${pageUrl}#breadcrumb` } } : {}) },
    ...(slug ? [{ "@type": "BreadcrumbList", "@id": `${pageUrl}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${url}/` }, { "@type": "ListItem", position: 2, name: page.title, item: pageUrl }] }] : []),
    ...extraNodes,
    ...(page.faqs ? [{ "@type": "FAQPage", "@id": `${pageUrl}#faq`, mainEntity: page.faqs.map(([q, a]) => ({ "@type": "Question", name: plain(q), acceptedAnswer: { "@type": "Answer", text: plain(a) } })) }] : []),
  ];
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c");
}

function head({ seoTitle, meta, path = "", ld = "", robots = "" }) {
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${seoTitle}</title><meta name="description" content="${meta}">${robots ? `<meta name="robots" content="${robots}">` : `<link rel="canonical" href="${url}${path}">`}<meta property="og:type" content="website"><meta property="og:site_name" content="GradeKit"><meta property="og:title" content="${seoTitle}"><meta property="og:description" content="${meta}"><meta property="og:url" content="${url}${path}"><meta property="og:image" content="${url}/assets/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="GradeKit — Know where you stand. Free grade calculators."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${seoTitle}"><meta name="twitter:description" content="${meta}"><meta name="theme-color" content="#006b62"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/styles.css">${ld ? `<script type="application/ld+json">${ld}</script>` : ""}`;
}

/* ---------- shared page sections ---------- */

const faqSection = (page) => page.faqs ? `<article class="content-card wide"><p class="eyebrow">Common questions</p><h2>${page.title} FAQ</h2>${page.faqs.map(([q, a]) => `<div class="faq"><h3>${q}</h3><p>${a}</p></div>`).join("")}</article>` : "";

const notesCard = (page) => page.notes ? `<article class="content-card wide"><p class="eyebrow">Before you rely on the number</p><h2>Things worth checking</h2><ul class="note-list">${page.notes.map((note) => `<li>${note}</li>`).join("")}</ul></article>` : "";

const relatedSection = (page) => page.related?.length
  ? `<section class="tools-section"><div class="shell"><p class="eyebrow">Related tools</p><h2>Keep calculating</h2><div class="tools-grid">${page.related.map(toolCard).join("")}</div><p class="tools-all"><a href="/#all-tools">See all ${toolSlugs.length} calculators →</a></p></div></section>`
  : "";

const hero = (page, extraTrust = "") => `<section class="hero"><div class="shell"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> / ${page.title}</nav><p class="kicker">Free · Instant · Private</p><h1>${page.title}</h1><p class="lede">${page.lede}</p>${extraTrust}</div></section>`;

const trustRow = `<div class="trust-row"><span>✓ Updates as you type</span><span>✓ Works on mobile</span><span>✓ Nothing is saved</span></div>`;

const shell = ({ page, slug, bodyAttr = "", main, ld }) => `<!doctype html><html lang="en"><head>${head({ seoTitle: page.seoTitle, meta: page.meta, path: `/${slug}/`, ld })}</head><body${bodyAttr}>${header(slug)}<main id="main">${main}</main>${footer}<script type="module" src="/assets/main.js"></script></body></html>`;

/* ---------- tool + reference pages ---------- */

const scaleTable = `<div class="grade-table-wrap"><table class="scale-table"><caption class="sr-only">Letter grade, matching percentage range, and 4.0-scale grade points</caption><thead><tr><th scope="col">Letter grade</th><th scope="col">Percentage</th><th scope="col">GPA points</th></tr></thead><tbody>${gradeScale.map((row) => `<tr><td><strong>${row.letter}</strong></td><td>${row.min}–${row.max}%</td><td>${row.gpa}</td></tr>`).join("")}</tbody></table></div>`;

for (const slug of toolSlugs) {
  const page = tools[slug];
  const isReference = page.kind === "reference";

  const interactive = isReference
    ? `<section class="shell reference-layout" aria-label="${page.title}"><div class="calculator-card"><div class="card-head"><h2>Standard U.S. plus/minus grading scale</h2><p>The scale every GradeKit calculator uses.</p></div>${scaleTable}</div></section>`
    : `<section class="shell tool-layout" aria-label="${page.title} tool"><div class="calculator-card" id="calculator"><div class="card-head"><h2>${page.card}</h2><p>${page.hint}</p></div>${page.ui}</div><aside class="result" id="result" aria-describedby="result-status"><p>Enter values to calculate your grade.</p></aside><p class="sr-only" id="result-status" aria-live="polite"></p></section>`;

  const extraNodes = isReference ? [] : [{ "@type": "WebApplication", "@id": `${url}/${slug}/#app`, name: page.title, url: `${url}/${slug}/`, applicationCategory: "EducationalApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: page.meta, isPartOf: { "@id": `${url}/#website` } }];

  const main = `${hero(page, isReference ? "" : trustRow)}${interactive}<section class="content-wrap"><div class="shell content-grid"><article class="content-card"><p class="eyebrow">How it works</p><h2>How to calculate it</h2><p>${page.method}</p><div class="formula">${page.formula}</div></article><article class="content-card"><p class="eyebrow">Worked example</p><h2>Example calculation</h2><p class="example">${page.example}</p><p>${isReference ? `Use the <a href="/percentage-grade-calculator/">percentage grade calculator</a> to convert your own score automatically.` : "Use the calculator above to substitute your own numbers. Results update immediately."}</p></article>${notesCard(page)}${faqSection(page)}</div></section>${partnerSection}${relatedSection(page)}`;

  await mkdir(resolve(root, slug), { recursive: true });
  await writeFile(resolve(root, slug, "index.html"), shell({ page, slug, bodyAttr: isReference ? "" : ` data-calculator="${page.type}"`, main, ld: jsonLd(page, slug, extraNodes) }));
}

/* ---------- doc pages ---------- */

for (const slug of docSlugs) {
  const page = docs[slug];
  // Affiliate networks expect a reachable contact. Rendered only once a real
  // address is set in pages.mjs, so no placeholder inbox ever ships.
  const contact = page.contact && site.contactEmail
    ? `<h2>Contact</h2><p>Corrections, bug reports, and questions: <a href="mailto:${site.contactEmail}">${site.contactEmail}</a>.</p>`
    : "";
  const main = `${hero(page)}<section class="content-wrap doc-wrap"><div class="shell"><article class="content-card doc-body">${page.body}${contact}</article>${page.faqs ? `<article class="content-card doc-body"><p class="eyebrow">Common questions</p><h2>${page.title} FAQ</h2>${page.faqs.map(([q, a]) => `<div class="faq"><h3>${q}</h3><p>${a}</p></div>`).join("")}</article>` : ""}</div></section>${page.kind === "resource" ? partnerSection : ""}<section class="tools-section"><div class="shell"><p class="eyebrow">Free tools</p><h2>Start calculating</h2><div class="tools-grid">${primaryTools.slice(0, 3).map(toolCard).join("")}</div><p class="tools-all"><a href="/#all-tools">See all ${toolSlugs.length} calculators →</a></p></div></section>`;
  await mkdir(resolve(root, slug), { recursive: true });
  await writeFile(resolve(root, slug, "index.html"), shell({ page, slug, main, ld: jsonLd(page, slug) }));
}

/* ---------- home ---------- */

const home = {
  title: "GradeKit",
  seoTitle: "Free Grade Calculators for Students & Teachers | GradeKit",
  meta: `Free, instant grade calculators: current grade, final grade needed, weighted grade, GPA, semester grade, test scores, and a printable EZ Grader chart. No sign-up.`,
};

const homeLd = jsonLd(home, "", [{
  "@type": "ItemList", "@id": `${url}/#tools`, name: "GradeKit calculators", numberOfItems: toolSlugs.length,
  itemListElement: toolSlugs.map((slug, index) => ({ "@type": "ListItem", position: index + 1, name: tools[slug].title, url: `${url}/${slug}/` })),
}]);

await writeFile(resolve(root, "index.html"), `<!doctype html><html lang="en"><head>${head({ seoTitle: home.seoTitle, meta: home.meta, path: "/", ld: homeLd })}</head><body>${header()}<main id="main"><section class="home-hero"><div class="shell"><p class="kicker">Grades, without the guesswork</p><h1>Know where you stand. <span class="accent">Plan what’s next.</span></h1><p class="lede">Fast, focused calculators for every grade question—from today’s average to the score you need on your final.</p><div class="home-actions"><a class="button" href="/grade-calculator/">Calculate my grade</a><a class="button secondary" href="/final-grade-calculator/">Plan my final</a></div><div class="trust-row"><span>100% free</span><span>No account</span><span>Your data stays on device</span></div></div></section><section class="tools-section" id="all-tools"><div class="shell"><p class="eyebrow">${toolSlugs.length} focused calculators</p><h2>Pick the question you need answered</h2><div class="tools-grid">${toolSlugs.map(toolCard).join("")}</div></div></section><section class="content-wrap"><div class="shell content-grid"><article class="content-card"><p class="eyebrow">Made for focus</p><h2>Answers before distractions</h2><p>Every tool opens directly to the calculator, works on phones, and updates as you type. No accounts, no pop-ups, and no steps between you and the number you came for.</p></article><article class="content-card"><p class="eyebrow">Private by design</p><h2>Calculations stay in your browser</h2><p>GradeKit has no database, login, or external calculation service. The numbers you enter are processed only on your device — the full detail is in the <a href="/privacy/">privacy policy</a>.</p></article><article class="content-card"><p class="eyebrow">Show your work</p><h2>Every formula is published</h2><p>Each page states the exact formula it uses and walks through a worked example, so you can check the arithmetic by hand. The letter-grade cutoffs are listed on the <a href="/grading-scale-chart/">grading scale chart</a>.</p></article><article class="content-card"><p class="eyebrow">Free, and staying free</p><h2>How GradeKit is funded</h2><p>The calculators are free with no ads in the way of the result. A small number of links to third-party study tools may earn a commission, disclosed on the <a href="/affiliate-disclosure/">affiliate disclosure</a> page.</p></article></div></section>${partnerSection}</main>${footer}<script type="module" src="/assets/main.js"></script></body></html>`);

/* ---------- 404 ---------- */

const notFound = { seoTitle: "Page not found | GradeKit", meta: "That page does not exist. Pick a grade calculator from the list instead." };
await writeFile(resolve(root, "404.html"), `<!doctype html><html lang="en"><head>${head({ seoTitle: notFound.seoTitle, meta: notFound.meta, robots: "noindex, follow" })}</head><body>${header()}<main id="main"><section class="hero"><div class="shell"><p class="kicker">404</p><h1>That page moved or never existed.</h1><p class="lede">Nothing is broken on your end. Pick the calculator you were looking for and carry on.</p><div class="home-actions"><a class="button" href="/">Go to the homepage</a><a class="button secondary" href="/grade-calculator/">Calculate my grade</a></div></div></section><section class="tools-section" id="all-tools"><div class="shell"><p class="eyebrow">All ${toolSlugs.length} calculators</p><h2>Try one of these</h2><div class="tools-grid">${toolSlugs.map(toolCard).join("")}</div></div></section></main>${footer}<script type="module" src="/assets/main.js"></script></body></html>`);

/* ---------- discovery + headers ---------- */

await writeFile(resolve(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((path) => `  <url><loc>${url}/${path}</loc><lastmod>${site.updated}</lastmod><changefreq>monthly</changefreq><priority>${path ? "0.8" : "1.0"}</priority></url>`).join("\n")}\n</urlset>\n`);
await writeFile(resolve(root, "sitemap.txt"), `${routes.map((path) => `${url}/${path}`).join("\n")}\n`);
await writeFile(resolve(root, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\nSitemap: ${url}/sitemap.txt\n`);
await writeFile(resolve(root, "_headers"), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()\n  X-Frame-Options: SAMEORIGIN\n\n/assets/*\n  Cache-Control: public, max-age=604800\n`);

console.log(`Generated ${routes.length} GradeKit pages (${toolSlugs.length} tools, ${docSlugs.length} docs) + 404.`);
