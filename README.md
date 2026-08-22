# GradeKit

GradeKit is a free, mobile-first set of grade calculators for students and teachers. It is a static site: calculations run in the browser, and there is no API, database, authentication, or user-data storage.

## Pages

Eleven calculators:

| Route | Targets |
| --- | --- |
| `/grade-calculator/` | current class grade from points |
| `/final-grade-calculator/` | score needed on the final |
| `/weighted-grade-calculator/` | grade from weighted categories |
| `/semester-grade-calculator/` | two terms plus a semester exam |
| `/gpa-calculator/` | college GPA, 4.0 scale, credit hours |
| `/high-school-gpa-calculator/` | weighted and unweighted, honors/AP/IB |
| `/test-grade-calculator/` | correct answers to a percentage |
| `/ez-grader/` | printable grading chart for teachers |
| `/grade-curve-calculator/` | flat, square root, and scale-to-top curves |
| `/percentage-grade-calculator/` | one points total to a percentage |
| `/grading-scale-chart/` | reference table, no JavaScript required |

Plus `/about/`, `/privacy/`, `/affiliate-disclosure/`, `/study-tools/`, and a `404.html`.

Every page contains crawlable explanatory copy, the formula it uses, a worked example, FAQs, canonical and social metadata, and JSON-LD. The site also includes `sitemap.xml` with `lastmod`, `robots.txt`, security headers, a print layout, keyboard-visible focus states, and live result announcements for screen readers.

## Run and verify locally

Requires Node.js 20 or newer. There are no package dependencies to install.

```bash
npm run dev      # http://127.0.0.1:4173
npm run check    # tests + production build
```

The publishable site is created in `dist/`.

## Adding a calculator

`scripts/pages.mjs` is the single source of truth for every route. The generator, the build, and the tests all read their route lists from it, so a new page needs no edits anywhere else.

1. Add an entry to `tools` in `scripts/pages.mjs`: `type`, `nav`, `primary`, `seoTitle`, `meta`, `lede`, `card`, `hint`, `ui`, `method`, `formula`, `example`, `notes`, `faqs`, `related`.
2. If it needs new math, add a pure function to `site/assets/calculators.js` and a test for it.
3. Add an `init<Type>()` in `site/assets/main.js` and register it in the `initializers` map under the same `type` string.
4. Run `node scripts/generate-site.mjs && npm run check`.

Set `kind: "reference"` instead of `type` for a static page with no calculator (see `grading-scale-chart`). Add to `docs` instead of `tools` for a prose page with no tool at all.

The test suite enforces the parts that are easy to get wrong: unique titles under 60 characters, descriptions between 70 and 165 characters, JSON-LD that parses and points at the right URL, `lastmod` on every sitemap entry, at least one contextual internal link in each page's body copy, every route reachable from the footer, and — most usefully — that each initializer's `#ids` and `.classes` actually exist in the page it runs on.

Do not edit the generated `index.html` files directly; regenerate them so metadata and structured data stay consistent.

## Monetization

Affiliate partners live in the `partners` array in `scripts/pages.mjs`. Each entry ships with an empty `href`, and **a partner with an empty `href` is omitted from every page** — so nothing renders until real tracking URLs are added.

To turn it on, set `href` to the tracking URL for each partner. The module then appears once per page, below the explanation and above the related tools, never inside a calculator or a result. Links are emitted with `rel="sponsored nofollow noopener"` and the section links to `/affiliate-disclosure/`; the tests fail if either is missing.

Before enabling: set `site.contactEmail` in `scripts/pages.mjs` (affiliate networks generally require a reachable contact, and the About page renders the contact block only when it is set).

## Analytics

Optional and cookieless. Set `CF_ANALYTICS_TOKEN` in the Cloudflare Pages build environment and the beacon is injected into every page at build time. Without the variable, no analytics code ships at all.

## Deploy free on Cloudflare Pages

1. Push this project to a GitHub repository.
2. In the Cloudflare dashboard, open **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repository and use these build settings:
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add an environment variable named `SITE_URL` with the exact production origin, such as `https://your-project.pages.dev` (no trailing slash).
5. Deploy once, then confirm that the canonical URL in page source matches the public URL.

The default build uses `https://gradekit.pages.dev`. A custom domain is optional and is the only part that costs money — but it is also the single biggest constraint on ranking, since `pages.dev` is a shared subdomain.

To build locally with the final domain:

```bash
SITE_URL=https://your-project.pages.dev npm run build
```

## Google Search Console

The property is verified by the committed `site/google037f1ca7862cb5a0.html` file, which the build copies to `dist/`. If you move to a custom domain, add a DNS property for the new origin.

After deploying, submit `sitemap.xml` under **Sitemaps** and request indexing for the homepage and the calculator pages. Check **Pages**, **Core Web Vitals**, and search queries once Google begins crawling. Avoid changing existing URLs during the initial SEO period.

## Project structure

- `scripts/pages.mjs` — every route, its copy, and the partner config
- `scripts/generate-site.mjs` — renders the registry into `site/`
- `scripts/build.mjs` — makes `dist/`, rewrites the canonical origin, injects analytics
- `site/assets/calculators.js` — pure calculation functions
- `site/assets/main.js` — accessible browser interactions
- `tests/` — calculation and static-SEO checks
