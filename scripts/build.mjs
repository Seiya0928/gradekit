import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { copyItems, defaultOrigin, originFiles } from "./pages.mjs";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const siteUrl = (process.env.SITE_URL || defaultOrigin).replace(/\/$/, "");

// Cloudflare Web Analytics is cookieless and free. The token only exists in the
// deploy environment, so the beacon is injected at build time rather than baked
// into the committed HTML.
const analyticsToken = (process.env.CF_ANALYTICS_TOKEN || "").trim();
const beacon = analyticsToken
  ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${analyticsToken}"}'></script>`
  : "";

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const item of copyItems) {
  await cp(resolve(root, "site", item), resolve(dist, item), { recursive: true });
}

for (const file of originFiles) {
  const path = resolve(dist, file);
  const content = await readFile(path, "utf8");
  let output = content.replaceAll(defaultOrigin, siteUrl);
  if (beacon && file.endsWith(".html")) output = output.replace("</body>", `${beacon}</body>`);
  await writeFile(path, output);
}

console.log(`Built ${originFiles.length} GradeKit pages to dist/ with canonical URL ${siteUrl}${beacon ? " (analytics beacon injected)" : ""}`);
