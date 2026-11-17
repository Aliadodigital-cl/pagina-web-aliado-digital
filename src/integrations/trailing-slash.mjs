/**
 * Adds the trailing slash to every internal page URL in the built HTML.
 *
 * Astro builds each page as /ruta/index.html, so nginx answers /ruta with a
 * 301 to /ruta/. Links across the site (navbar, footer, cards, MDX written by
 * n8n) were written without the slash, so every internal click and every
 * Googlebot hop went through a redirect: Search Console listed 24 pages as
 * "Página con redirección". Fixing it here covers every source of links,
 * including future ones, instead of chasing them file by file.
 *
 * Touched:
 *   - href="/ruta", href="/ruta#ancla", href="/ruta?x=1"
 *   - absolute https://<site>/ruta anywhere (canonical, og:url, JSON-LD)
 * Left alone: paths with a file extension (/blog/rss.xml, /logo.svg),
 * paths that already end in "/", protocol-relative "//", and external hosts.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const needsSlash = (path) => {
  if (!path || path.endsWith("/")) return false;
  const last = path.slice(path.lastIndexOf("/") + 1);
  return !last.includes(".");
};

const addSlash = (path) => (needsSlash(path) ? `${path}/` : path);

export const normalizeHtml = (html, siteOrigin) => {
  let out = html.replace(
    /href="(\/(?!\/)[^"?#]*)([?#][^"]*)?"/g,
    (_, path, rest = "") => `href="${addSlash(path)}${rest}"`,
  );
  if (siteOrigin) {
    const escaped = siteOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(
      new RegExp(`${escaped}(/[^"'\\s<>?#\\\\]+)`, "g"),
      (_, path) => `${siteOrigin}${addSlash(path)}`,
    );
  }
  return out;
};

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith(".html")) yield full;
  }
}

export default function trailingSlash() {
  let siteOrigin;
  return {
    name: "aliado:trailing-slash",
    hooks: {
      "astro:config:done": ({ config }) => {
        siteOrigin = config.site ? new URL(config.site).origin : undefined;
      },
      "astro:build:done": async ({ dir, logger }) => {
        let changed = 0;
        for await (const file of htmlFiles(fileURLToPath(dir))) {
          const html = await readFile(file, "utf8");
          const fixed = normalizeHtml(html, siteOrigin);
          if (fixed !== html) {
            await writeFile(file, fixed);
            changed += 1;
          }
        }
        logger.info(`Barra final agregada a enlaces internos en ${changed} páginas`);
      },
    },
  };
}
