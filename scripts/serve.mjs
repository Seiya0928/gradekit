import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "site");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  const clean = decodeURIComponent((req.url || "/").split("?")[0]);
  let path = join(root, clean);
  if (existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html");
  // Mirror Cloudflare Pages: unknown paths render 404.html with a 404 status.
  if (!existsSync(path)) {
    res.writeHead(404, { "Content-Type": types[".html"] });
    createReadStream(join(root, "404.html")).pipe(res);
    return;
  }
  res.setHeader("Content-Type", types[extname(path)] || "application/octet-stream");
  createReadStream(path).pipe(res);
});
server.listen(4173, "127.0.0.1", () => console.log("Local URL: http://127.0.0.1:4173"));
