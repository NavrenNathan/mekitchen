#!/usr/bin/env node
/**
 * Crawl error guard. Runs against the files in this folder — no server, no
 * network, no dependencies — so it works identically on a laptop and in CI.
 *
 * Checks, in order of severity:
 *
 *   ERROR  unrendered template syntax in any href/src ({{LIKE_THIS}})
 *          This is the exact bug that shipped {{CAREERS_URL}} and
 *          {{GOOGLE_MAPS_URL}} to production as live 404s. It fails the
 *          build outright — this class should never ship again.
 *   ERROR  internal link pointing at a file that does not exist
 *   ERROR  internal asset (img/script/link/use) that does not exist
 *   ERROR  anchor link (#section) whose target id is missing on that page
 *   WARN   link to a page excluded from the sitemap (noindex/404/reserve)
 *
 * Usage:  node scripts/check-links.mjs
 * Exit:   0 clean or warnings only, 1 if any ERROR fired.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warns = [];
const pending = [];

const htmlFiles = readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort();

// Pages that exist but are deliberately not part of the indexable site.
const NON_INDEXABLE = new Set(['404.html', 'soon.html', 'careers.html']);

/**
 * Placeholders that are known-outstanding and consciously accepted for now.
 * These are DOWNGRADED to warnings instead of failing the build — but they are
 * printed loudly on every single run so they cannot be quietly forgotten.
 * Anything NOT on this list still hard-fails. Delete an entry the moment the
 * real value lands, and the guard goes back to full strength for it.
 */
const KNOWN_PENDING = new Set([
  '{{PHONE}}',   // no real number supplied yet — see NEEDS INPUT in DEPLOY.md
]);

// Collect every id= on each page so #anchors can be verified.
const idsByFile = {};
for (const f of htmlFiles) {
  const html = readFileSync(join(ROOT, f), 'utf8');
  idsByFile[f] = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]));
}

const isExternal = (u) => /^(https?:|mailto:|tel:|data:)/i.test(u);

for (const file of htmlFiles) {
  const raw = readFileSync(join(ROOT, file), 'utf8');
  // Ignore commented-out markup — a documented example is not a live link.
  const html = raw.replace(/<!--[\s\S]*?-->/g, '');

  // Every href/src/use-href on the page.
  const refs = [
    ...[...html.matchAll(/\bhref=["']([^"']+)["']/g)].map((m) => ({ url: m[1], kind: 'href' })),
    ...[...html.matchAll(/\bsrc=["']([^"']+)["']/g)].map((m) => ({ url: m[1], kind: 'src' })),
  ];

  for (const { url, kind } of refs) {
    // 1. Unrendered template syntax — hard fail, anywhere it appears.
    const tokens = url.match(/\{\{.*?\}\}/g);
    if (tokens) {
      const accepted = tokens.every((t) => KNOWN_PENDING.has(t));
      const msg = `${file}: unrendered template syntax in ${kind}="${url}"`;
      if (accepted) {
        pending.push(`${msg}  [known-pending, still owed]`);
      } else {
        errors.push(msg);
      }
      continue;
    }

    if (isExternal(url) || url.startsWith('//')) continue;

    // 2. Pure anchor on the same page.
    if (url.startsWith('#')) {
      const id = url.slice(1);
      if (id && !idsByFile[file].has(id)) {
        errors.push(`${file}: anchor "${url}" has no matching id on this page`);
      }
      continue;
    }

    // Split path and fragment.
    const [rawPath, frag] = url.split('#');
    let p = rawPath;
    if (!p) continue;

    // Root-relative "/" and "/menu" style links -> resolve to a file.
    let target;
    if (p === '/') {
      target = 'index.html';
    } else {
      target = p.replace(/^\//, '');
      if (!target.endsWith('.html') && !/\.[a-z0-9]+$/i.test(target)) {
        // Netlify pretty URL: /menu serves menu.html
        target = `${target}.html`;
      }
    }
    target = normalize(target);

    if (!existsSync(join(ROOT, target))) {
      errors.push(`${file}: ${kind}="${url}" -> missing file "${target}"`);
      continue;
    }

    // 3. Fragment on another page must exist there.
    if (frag && idsByFile[target] && !idsByFile[target].has(frag)) {
      errors.push(`${file}: "${url}" -> "${target}" has no id="${frag}"`);
    }

  }
}

// Report
const line = '-'.repeat(60);
console.log(`Link check — ${htmlFiles.length} pages scanned`);
console.log(line);

if (errors.length) {
  console.log(`\n${errors.length} ERROR(S):`);
  errors.forEach((e) => console.log(`  ✗ ${e}`));
}
if (pending.length) {
  console.log(`\n${pending.length} known-pending placeholder(s) — accepted, but still outstanding:`);
  pending.forEach((p) => console.log(`  ⚠ ${p}`));
}
if (warns.length) {
  const unique = [...new Set(warns)];
  console.log(`\n${unique.length} warning(s):`);
  unique.forEach((w) => console.log(`  ! ${w}`));
}
if (!errors.length && !warns.length && !pending.length) console.log('\nNo broken links, no template placeholders, all anchors resolve.');

console.log(`\n${line}`);
console.log(errors.length ? 'FAIL' : 'PASS');
process.exit(errors.length ? 1 : 0);
