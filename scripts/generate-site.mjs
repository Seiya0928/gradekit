import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "site");
const url = "https://gradekit.pages.dev";
const nav = [
  ["Grade", "grade-calculator"], ["Final Grade", "final-grade-calculator"], ["Weighted", "weighted-grade-calculator"], ["GPA", "gpa-calculator"], ["Test Grade", "test-grade-calculator"], ["EZ Grader", "ez-grader"], ["Percentage", "percentage-grade-calculator"],
];

const pages = {
  "grade-calculator": {
    type: "grade", title: "Grade Calculator", meta: "Calculate your current class grade from assignments and points instantly. Free, private, mobile-friendly, and no sign-up required.",
    lede: "Add your assignments and see your current grade update instantly. No sign-up, no saved data, just a clear answer.",
    card: "Add assignments", hint: "Enter points earned and points possible for each item.",
    ui: `<div id="rows"><div class="data-row"><label>Points earned<input class="earned" type="number" inputmode="decimal" min="0" step="any" value="18"></label><label>Points possible<input class="possible" type="number" inputmode="decimal" min="0" step="any" value="20"></label><button class="remove" type="button" aria-label="Remove assignment">Remove</button></div><div class="data-row"><label>Points earned<input class="earned" type="number" inputmode="decimal" min="0" step="any" value="42"></label><label>Points possible<input class="possible" type="number" inputmode="decimal" min="0" step="any" value="50"></label><button class="remove" type="button" aria-label="Remove assignment">Remove</button></div><div class="data-row"><label>Points earned<input class="earned" type="number" inputmode="decimal" min="0" step="any" value="27"></label><label>Points possible<input class="possible" type="number" inputmode="decimal" min="0" step="any" value="30"></label><button class="remove" type="button" aria-label="Remove assignment">Remove</button></div></div><button class="add-button" id="add-row" type="button">+ Add assignment</button>`,
    method: "Add all points you earned, add all points possible, then divide the two totals. This points-based method works when assignments are not separated into weighted categories.",
    formula: "Current grade = (total points earned ÷ total points possible) × 100",
    example: "If you earned 87 points out of 100 possible points, your current grade is 87%, typically a B+ on a standard U.S. scale.",
    faqs: [["What grade scale does this calculator use?", "The letter-grade label uses a common U.S. plus/minus scale. Your school may use different cutoffs, so the percentage is the authoritative result."], ["Can I include extra credit?", "Yes. Add extra-credit points to points earned. If the assignment adds points without increasing points possible, enter 0 as its possible points."], ["Is my grade data stored?", "No. Every calculation happens in your browser and GradeKit does not send or save your entries."]]
  },
  "final-grade-calculator": {
    type: "final", title: "Final Grade Calculator", meta: "Find the score you need on your final exam to reach your target course grade, including impossible-target and best-case checks.",
    lede: "See the exact final exam score you need—and whether your target is still mathematically possible.",
    card: "Plan your final", hint: "Use your current course grade before the final exam.",
    ui: `<div class="fields three"><label>Current grade<input id="current" type="number" inputmode="decimal" min="0" max="100" step="any" value="84"><span class="suffix">%</span></label><label>Desired grade<input id="desired" type="number" inputmode="decimal" min="0" max="100" step="any" value="90"><span class="suffix">%</span></label><label>Final exam weight<input id="weight" type="number" inputmode="decimal" min="1" max="100" step="any" value="35"><span class="suffix">%</span></label></div>`,
    method: "The calculator treats your current grade as the portion of the course completed before the final. It solves the weighted-grade equation for the unknown final exam score.",
    formula: "Required final score = [target grade − current grade × (1 − final weight)] ÷ final weight",
    example: "With an 84% current grade, a 90% target, and a final worth 35%, you need about 101.1%. That target is impossible without extra credit; a perfect final would produce a maximum course grade of 89.6%.",
    faqs: [["What if the required score is over 100%?", "Your target is not reachable under the entered weights unless extra credit is available. GradeKit shows the highest grade you can finish with after scoring 100% on the final."], ["What does a negative required score mean?", "You have already secured the target grade. A zero on the final would still leave your overall course grade at or above the target."], ["Should I round the required score?", "Aim above the displayed number. GradeKit shows one decimal place, but your instructor may keep more precision or apply a different rounding policy."]]
  },
  "weighted-grade-calculator": {
    type: "weighted", title: "Weighted Grade Calculator", meta: "Calculate a weighted course grade from categories such as homework, quizzes, exams, and projects. Instant and free.",
    lede: "Combine category grades with different weights and see your overall course grade as you type.",
    card: "Enter grade categories", hint: "Weights can total 100%, or the calculator will normalize what you enter.",
    ui: `<div id="rows">${[[92,25],[84,35],[88,40]].map(([g,w]) => `<div class="data-row"><label>Category grade<input class="grade" type="number" inputmode="decimal" min="0" step="any" value="${g}"><span class="suffix">%</span></label><label>Weight<input class="weight" type="number" inputmode="decimal" min="0" step="any" value="${w}"><span class="suffix">%</span></label><button class="remove" type="button" aria-label="Remove category">Remove</button></div>`).join("")}</div><button class="add-button" id="add-row" type="button">+ Add category</button>`,
    method: "Multiply each category grade by its weight, add the products, then divide by the total weight entered. When weights total 100%, the last division is effectively by 100.",
    formula: "Weighted grade = Σ(category grade × category weight) ÷ Σ(weights)",
    example: "Homework at 92% × 25%, exams at 84% × 35%, and projects at 88% × 40% produce an overall weighted grade of 87.6%.",
    faqs: [["Do my weights have to total 100%?", "Ideally, yes. If they do not, GradeKit normalizes the entered categories so you can still estimate the grade represented by them."], ["How do I calculate a category grade?", "Add points earned in that category and divide by its total possible points, or use the Grade Calculator first."], ["Can I use decimal weights?", "Yes. Decimal grades and weights are supported."]]
  },
  "gpa-calculator": {
    type: "gpa", title: "GPA Calculator", meta: "Calculate your college GPA on a 4.0 scale using course letter grades and credit hours. Fast, free, and private.",
    lede: "Estimate your GPA on a standard 4.0 scale, weighted by each course’s credit hours.",
    card: "Add your courses", hint: "Choose each final letter grade and enter its credit hours.",
    ui: `<div id="rows">${[["4","A (4.0)",3],["3.3","B+ (3.3)",4],["3.7","A− (3.7)",3]].map(([v,l,c]) => `<div class="data-row"><label>Letter grade<select><option value="${v}" selected>${l}</option><option value="4">A (4.0)</option><option value="3.7">A− (3.7)</option><option value="3.3">B+ (3.3)</option><option value="3">B (3.0)</option><option value="2.7">B− (2.7)</option><option value="2.3">C+ (2.3)</option><option value="2">C (2.0)</option><option value="1.7">C− (1.7)</option><option value="1">D (1.0)</option><option value="0">F (0.0)</option></select></label><label>Credit hours<input type="number" inputmode="decimal" min="0.5" step="0.5" value="${c}"></label><button class="remove" type="button" aria-label="Remove course">Remove</button></div>`).join("")}</div><button class="add-button" id="add-row" type="button">+ Add course</button>`,
    method: "Convert each letter grade to grade points, multiply by course credits, add those quality points, then divide by total attempted credits.",
    formula: "GPA = Σ(grade points × credit hours) ÷ Σ(credit hours)",
    example: "An A in a 3-credit class, B+ in a 4-credit class, and A− in a 3-credit class gives (4.0×3 + 3.3×4 + 3.7×3) ÷ 10 = 3.63 GPA.",
    faqs: [["Does this calculate weighted high-school GPA?", "No. This version uses a standard unweighted 4.0 college scale. Honors and AP weighting policies vary by school."], ["What about pass/fail courses?", "Courses without grade points normally do not affect GPA, so leave them out unless your institution says otherwise."], ["Will this exactly match my transcript?", "It is an estimate. Repeat-course, withdrawal, plus/minus, and rounding policies vary by institution."]]
  },
  "test-grade-calculator": {
    type: "test", title: "Test Grade Calculator", meta: "Convert correct answers into a test percentage and letter grade instantly. Free calculator for students and teachers.",
    lede: "Turn correct answers into a percentage and letter grade in one step.",
    card: "Calculate a test score", hint: "Enter the number of correct answers and total questions.",
    ui: `<div class="fields two"><label>Correct answers<input id="correct" type="number" inputmode="numeric" min="0" step="1" value="46"></label><label>Total questions<input id="total" type="number" inputmode="numeric" min="1" step="1" value="50"></label></div>`,
    method: "Divide the number of correct answers by the total number of questions, then multiply by 100. The letter label uses a common U.S. plus/minus scale.",
    formula: "Test percentage = (correct answers ÷ total questions) × 100",
    example: "If 46 answers are correct on a 50-question test, 46 ÷ 50 × 100 = 92%, typically an A−.",
    faqs: [["How do I calculate from wrong answers instead?", "Subtract wrong answers from total questions to find correct answers, or use the EZ Grader page."], ["Does every question have equal value?", "This calculator assumes equal points per question. For questions with different point values, use the Grade Calculator."], ["Can teachers use this calculator?", "Yes. For a full score chart covering every possible number wrong, use EZ Grader."]]
  },
  "ez-grader": {
    type: "ez", title: "EZ Grader", meta: "Free EZ Grader for teachers. Enter total questions and answers wrong to get the score, letter grade, and a complete printable grading chart.",
    lede: "Grade a test instantly and generate a complete score chart for every possible number wrong.",
    card: "Build a grading chart", hint: "Enter total questions and the selected student’s wrong answers.",
    ui: `<div class="fields two"><label>Total questions<input id="total" type="number" inputmode="numeric" min="1" max="500" step="1" value="50"></label><label>Answers wrong<input id="wrong" type="number" inputmode="numeric" min="0" step="1" value="4"></label></div><div class="grade-table-wrap"><table><thead><tr><th>Wrong</th><th>Correct</th><th>Score</th><th>Grade</th></tr></thead><tbody id="grade-chart"></tbody></table></div>`,
    method: "Subtract wrong answers from total questions. Divide correct answers by total questions and multiply by 100. The chart repeats this for every possible number wrong.",
    formula: "Score = [(total questions − wrong answers) ÷ total questions] × 100",
    example: "On a 50-question test with 4 wrong answers, the student has 46 correct. The score is 46 ÷ 50 × 100 = 92%, typically an A−.",
    faqs: [["Can I print the EZ Grader chart?", "Yes. Use your browser’s Print command. GradeKit includes a clean print layout and does not require a separate PDF download."], ["Can I change the letter-grade scale?", "The MVP uses a common U.S. plus/minus scale. Use the percentage column if your school has different cutoffs."], ["What is the maximum test length?", "The interface supports up to 500 questions to keep the generated chart practical."]]
  },
  "percentage-grade-calculator": {
    type: "percentage", title: "Percentage Grade Calculator", meta: "Convert points earned and points possible into a percentage and letter grade instantly. Free and mobile-friendly.",
    lede: "Convert any points-based score into a percentage and common letter grade.",
    card: "Convert points to a grade", hint: "Enter the points earned and the maximum points possible.",
    ui: `<div class="fields two"><label>Points earned<input id="earned" type="number" inputmode="decimal" min="0" step="any" value="37"></label><label>Points possible<input id="possible" type="number" inputmode="decimal" min="0.01" step="any" value="40"></label></div>`,
    method: "Divide points earned by points possible and multiply by 100. This works for a single assignment, quiz, project, or any points-based score.",
    formula: "Percentage grade = (points earned ÷ points possible) × 100",
    example: "If you earned 37 points out of 40, then 37 ÷ 40 × 100 = 92.5%, typically an A−.",
    faqs: [["Can a percentage be over 100%?", "Yes, if extra credit makes points earned greater than points possible."], ["What if the assignment has weighted questions?", "Add the actual points earned and possible across all questions rather than using the question count."], ["How is this different from the Grade Calculator?", "This page converts one points total. The Grade Calculator lets you add multiple assignments and total them automatically."]]
  }
};

const navHtml = (active = "") => nav.map(([label, path]) => `<a href="/${path}/"${path === active ? ' aria-current="page"' : ""}>${label}</a>`).join("");
const header = (active = "") => `<a class="skip-link" href="#main">Skip to calculator</a><header class="site-header"><div class="shell header-inner"><a class="brand" href="/"><span class="brand-mark">GK</span>GradeKit</a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Tools</button><nav class="site-nav" id="site-nav" aria-label="Calculator navigation">${navHtml(active)}</nav></div></header>`;
const footer = `<footer class="site-footer"><div class="shell footer-inner"><div><a class="brand" href="/"><span class="brand-mark">GK</span>GradeKit</a><p>Fast, private grade tools for students and teachers.</p></div><div class="footer-links"><a href="/grade-calculator/">Grade Calculator</a><a href="/final-grade-calculator/">Final Grade</a><a href="/ez-grader/">EZ Grader</a></div></div></footer>`;
const toolCards = nav.map(([label, path]) => `<a class="tool-link" href="/${path}/"><span>Open tool →</span><h3>${label}</h3><p>${pages[path].lede}</p></a>`).join("");

function jsonLd(page, slug) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [
    { "@type": "WebApplication", name: page.title, url: `${url}/${slug}/`, applicationCategory: "EducationalApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: page.meta },
    { "@type": "FAQPage", mainEntity: page.faqs.map(([q,a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${url}/` }, { "@type": "ListItem", position: 2, name: page.title, item: `${url}/${slug}/` }] }
  ]}).replaceAll("<", "\\u003c");
}

function head({ title, meta, path = "", ld = "" }) {
  const fullTitle = `${title} — Free & Instant | GradeKit`;
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${fullTitle}</title><meta name="description" content="${meta}"><link rel="canonical" href="${url}${path}"><meta property="og:type" content="website"><meta property="og:site_name" content="GradeKit"><meta property="og:title" content="${fullTitle}"><meta property="og:description" content="${meta}"><meta property="og:url" content="${url}${path}"><meta property="og:image" content="${url}/assets/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="GradeKit — Know where you stand. Free grade calculators."><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${fullTitle}"><meta name="twitter:description" content="${meta}"><meta name="twitter:image" content="${url}/assets/og.png"><meta name="theme-color" content="#006b62"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/styles.css">${ld ? `<script type="application/ld+json">${ld}</script>` : ""}`;
}

for (const [slug, page] of Object.entries(pages)) {
  const faq = page.faqs.map(([q,a]) => `<div class="faq"><h3>${q}</h3><p>${a}</p></div>`).join("");
  const html = `<!doctype html><html lang="en"><head>${head({ title: page.title, meta: page.meta, path: `/${slug}/`, ld: jsonLd(page, slug) })}</head><body data-calculator="${page.type}">${header(slug)}<main id="main"><section class="hero"><div class="shell"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a> / ${page.title}</nav><p class="kicker">Free · Instant · Private</p><h1>${page.title}</h1><p class="lede">${page.lede}</p><div class="trust-row"><span>✓ Updates as you type</span><span>✓ Works on mobile</span><span>✓ Nothing is saved</span></div></div></section><section class="shell tool-layout" aria-label="${page.title} tool"><div class="calculator-card" id="calculator"><div class="card-head"><h2>${page.card}</h2><p>${page.hint}</p></div>${page.ui}</div><aside class="result" id="result" aria-describedby="result-status"><p>Enter values to calculate your grade.</p></aside><p class="sr-only" id="result-status" aria-live="polite"></p></section><section class="content-wrap"><div class="shell content-grid"><article class="content-card"><p class="eyebrow">How it works</p><h2>How to calculate it</h2><p>${page.method}</p><div class="formula">${page.formula}</div></article><article class="content-card"><p class="eyebrow">Worked example</p><h2>Example calculation</h2><p class="example">${page.example}</p><p>Use the calculator above to substitute your own numbers. Results update immediately.</p></article><article class="content-card wide"><p class="eyebrow">Common questions</p><h2>${page.title} FAQ</h2>${faq}</article></div></section><section class="tools-section"><div class="shell"><p class="eyebrow">More free tools</p><h2>Keep calculating</h2><div class="tools-grid">${toolCards}</div></div></section></main>${footer}<script type="module" src="/assets/main.js"></script></body></html>`;
  await mkdir(resolve(root, slug), { recursive: true });
  await writeFile(resolve(root, slug, "index.html"), html);
}

const homeMeta = "Free, instant grade calculators for students and teachers: current grade, final grade, weighted grade, GPA, test grade, and EZ Grader.";
const homeLd = JSON.stringify({ "@context":"https://schema.org", "@type":"WebSite", name:"GradeKit", url:`${url}/`, description:homeMeta, potentialAction: { "@type":"SearchAction", target:`${url}/grade-calculator/` } });
await writeFile(resolve(root, "index.html"), `<!doctype html><html lang="en"><head>${head({ title: "Free Grade Calculators for Students & Teachers", meta: homeMeta, path: "/", ld: homeLd })}</head><body>${header()}<main id="main"><section class="home-hero"><div class="shell"><p class="kicker">Grades, without the guesswork</p><h1>Know where you stand. <span class="accent">Plan what’s next.</span></h1><p class="lede">Fast, focused calculators for every grade question—from today’s average to the score you need on your final.</p><div class="home-actions"><a class="button" href="/grade-calculator/">Calculate my grade</a><a class="button secondary" href="/final-grade-calculator/">Plan my final</a></div><div class="trust-row"><span>100% free</span><span>No account</span><span>Your data stays on device</span></div></div></section><section class="tools-section"><div class="shell"><p class="eyebrow">Seven focused calculators</p><h2>Pick the question you need answered</h2><div class="tools-grid">${toolCards}</div></div></section><section class="content-wrap"><div class="shell content-grid"><article class="content-card"><p class="eyebrow">Made for focus</p><h2>Answers before distractions</h2><p>Every tool opens directly to the calculator, works on phones, and updates as you type. There are no accounts, ads, or unnecessary steps in this first release.</p></article><article class="content-card"><p class="eyebrow">Private by design</p><h2>Calculations stay in your browser</h2><p>GradeKit has no database, login, or external calculation service. The numbers you enter are processed only on your device.</p></article></div></section></main>${footer}<script type="module" src="/assets/main.js"></script></body></html>`);

const routes = ["", ...Object.keys(pages).map((p) => `${p}/`)];
await writeFile(resolve(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((p) => `  <url><loc>${url}/${p}</loc><changefreq>monthly</changefreq><priority>${p ? "0.8" : "1.0"}</priority></url>`).join("\n")}\n</urlset>\n`);
await writeFile(resolve(root, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`);
await writeFile(resolve(root, "_headers"), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n/assets/*\n  Cache-Control: public, max-age=604800\n`);
console.log("Generated GradeKit source pages.");
