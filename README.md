# GradeKit

GradeKit is a free, mobile-first set of grade calculators for students and teachers. It is a static site: calculations run in the browser, and there is no API, database, authentication, analytics, or user-data storage.

## Included pages

- `/grade-calculator/`
- `/final-grade-calculator/`
- `/weighted-grade-calculator/`
- `/gpa-calculator/`
- `/test-grade-calculator/`
- `/ez-grader/`
- `/percentage-grade-calculator/`

Every calculator page contains crawlable explanatory copy, a formula, an example, FAQs, canonical and social metadata, and JSON-LD. The site also includes `sitemap.xml`, `robots.txt`, security headers, a print layout, keyboard-visible focus states, and live result announcements for screen readers.

## Run and verify locally

Requires Node.js 20 or newer. There are no package dependencies to install.

```bash
npm run dev
```

Open `http://127.0.0.1:4173`.

Run the automated checks and production build:

```bash
npm run check
```

The publishable site is created in `dist/`.

## Deploy free on Cloudflare Pages

1. Create a free GitHub repository and push this project.
2. In the Cloudflare dashboard, open **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repository and use these build settings:
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add an environment variable named `SITE_URL` with the exact production origin Cloudflare assigns, such as `https://your-project.pages.dev` (no trailing slash).
5. Deploy once, then confirm that the canonical URL in page source matches the public URL.

The default build uses `https://gradekit.pages.dev`. If that Pages project name is unavailable, setting `SITE_URL` is required. A custom domain is optional and is the only part that may cost money.

To build locally with the final domain:

```bash
SITE_URL=https://your-project.pages.dev npm run build
```

## Register with Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console/) and add a **URL-prefix property** using the exact Pages URL.
2. Choose **HTML tag** verification and copy the verification meta tag.
3. Add that tag inside the `<head>` output in `scripts/generate-site.mjs`, rebuild, and deploy. Alternatively, use a DNS property if you later add a custom domain.
4. After verification, open **Sitemaps**, submit `sitemap.xml`, and request indexing for the homepage and the seven calculator pages.
5. Check **Pages**, **Core Web Vitals**, and search queries after Google begins crawling. Avoid changing URLs during the initial SEO test.

## Project structure

- `site/` — publishable static source and generated page HTML
- `site/assets/calculators.js` — pure calculation functions
- `site/assets/main.js` — accessible browser interactions
- `scripts/generate-site.mjs` — creates the seven SEO landing pages
- `scripts/build.mjs` — makes `dist/` and replaces the canonical origin from `SITE_URL`
- `tests/` — calculation and static-SEO checks

## Updating page copy or metadata

Edit the page definitions in `scripts/generate-site.mjs`, then run:

```bash
node scripts/generate-site.mjs
npm run check
```

Do not edit the generated calculator `index.html` files directly; regenerate them from the page definitions so metadata and structured data stay consistent.
