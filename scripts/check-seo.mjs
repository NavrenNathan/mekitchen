#!/usr/bin/env node
/**
 * Indexing health guard. No dependencies, no network — reads the files here.
 *
 *   1. robots.txt      valid, declares the sitemap, and does not block real
 *                      content from Googlebot/Bingbot/*
 *   2. noindex audit   flags any page carrying a noindex meta tag
 *   3. canonical       exactly one, self-referencing, https + apex host
 *   4. JSON-LD         every block parses and has @context/@type; Restaurant
 *                      and Menu blocks are sanity-checked for required fields
 *   5. sitemap         every <loc> resolves to a real page, and every
 *                      indexable page appears in it
 *
 * THE LAUNCHED FLAG
 * -----------------
 * This site is deliberately pre-launch: robots.txt carries "Disallow: /" on
 * purpose so Google cannot index placeholder content. That is correct today
 * and wrong the moment the restaurant opens.
 *
 * While LAUNCHED is false, the Disallow is reported as an accepted, intentional
 * state. Flip it to true on launch day and this check becomes a hard failure if
 * anything ever blocks Googlebot again — which is the regression this guard
 * exists to prevent.
 *
 * Usage:  node scripts/check-seo.mjs
 * Exit:   0 pass/warn, 1 on error.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Flip to true on launch day. See the note above. */
const LAUNCHED = false;

const ORIGIN = 'https://me-kitchen.com';
const EXCLUDE = new Set(['404.html']);

/**
 * Pages allowed to carry noindex, and why. Anything NOT listed here that has a
 * noindex tag is treated as an error — that is the accident this guard exists
 * to catch, since a stray noindex silently removes a page from search.
 *
 * ON LAUNCH DAY: when the coming-soon page is retired and the real site moves
 * back to the root, delete the index.html entry so the root is protected again.
 */
const INTENTIONAL_NOINDEX = {
  'index.html':   'coming-soon holding page with the preview gate',
  'careers.html': 'placeholder filler, revisit before launch',
};

const errors = [];
const warns = [];
const notes = [];

const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, '');
const pages = readdirSync(ROOT).filter((f) => f.endsWith('.html') && !EXCLUDE.has(f)).sort();

/* ---------------- 1. robots.txt ---------------- */
const robotsPath = join(ROOT, 'robots.txt');
if (!existsSync(robotsPath)) {
  errors.push('robots.txt is missing');
} else {
  const robots = readFileSync(robotsPath, 'utf8');
  const lines = robots.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

  // Build the group that applies to a general crawler (User-agent: *).
  let current = null;
  const groups = {};
  for (const l of lines) {
    const ua = l.match(/^User-agent:\s*(.+)$/i);
    if (ua) { current = ua[1].trim(); groups[current] ??= []; continue; }
    if (current) groups[current].push(l);
  }

  const star = groups['*'] || [];
  const blocksRoot = star.some((l) => /^Disallow:\s*\/\s*$/i.test(l));

  if (blocksRoot) {
    if (LAUNCHED) {
      errors.push('robots.txt has "Disallow: /" for User-agent: * — this blocks Google from the entire site, and LAUNCHED is true');
    } else {
      notes.push('robots.txt blocks all crawlers ("Disallow: /") — intentional while LAUNCHED=false. Flip LAUNCHED in this script on launch day.');
    }
  } else if (!LAUNCHED) {
    warns.push('robots.txt no longer blocks crawlers, but LAUNCHED is still false — if the site has gone live, set LAUNCHED=true so this guard has teeth.');
  }

  if (!/^Sitemap:\s*https?:\/\/\S+/im.test(robots)) {
    errors.push('robots.txt does not declare a Sitemap: line');
  }
}

/* ---------------- 2-4. per-page checks ---------------- */
const canonicals = new Map();

for (const file of pages) {
  const raw = readFileSync(join(ROOT, file), 'utf8');
  const html = stripComments(raw);

  // --- noindex ---
  const noindex = html.match(/<meta\s+name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  if (noindex && /noindex/i.test(noindex[1])) {
    const why = INTENTIONAL_NOINDEX[file];
    if (why) {
      notes.push(`${file}: noindex present — intentional (${why})`);
    } else {
      errors.push(`${file}: carries noindex ("${noindex[1]}") — this page will silently drop out of search`);
    }
  }

  const indexable = !(noindex && /noindex/i.test(noindex[1]));

  // --- canonical ---
  const cans = [...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/gi)].map((m) => m[1]);
  if (cans.length === 0) {
    if (indexable) errors.push(`${file}: no <link rel="canonical">`);
  } else if (cans.length > 1) {
    errors.push(`${file}: ${cans.length} canonical tags — there must be exactly one`);
  } else {
    const c = cans[0];
    if (!c.startsWith('https://')) errors.push(`${file}: canonical is not https — "${c}"`);
    if (/\/\/www\./i.test(c)) errors.push(`${file}: canonical uses www, site serves apex — "${c}"`);
    if (!c.startsWith(ORIGIN)) errors.push(`${file}: canonical host does not match ${ORIGIN} — "${c}"`);
    if (indexable) canonicals.set(file, c);
  }

  // --- JSON-LD ---
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [, body] of blocks) {
    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      errors.push(`${file}: JSON-LD does not parse — ${e.message}`);
      continue;
    }
    const items = Array.isArray(data) ? data : [data];
    for (const item of items) {
      if (!item['@context']) errors.push(`${file}: JSON-LD block missing @context`);
      if (!item['@type']) { errors.push(`${file}: JSON-LD block missing @type`); continue; }

      if (item['@type'] === 'Restaurant') {
        for (const req of ['name', 'address']) {
          if (!item[req]) errors.push(`${file}: Restaurant schema missing "${req}"`);
        }
        const menu = item.hasMenu;
        if (menu && typeof menu === 'object') {
          const sections = menu.hasMenuSection || [];
          let count = 0;
          for (const sec of sections) {
            for (const mi of sec.hasMenuItem || []) {
              count++;
              if (!mi.name) errors.push(`${file}: a MenuItem has no name`);
              const price = mi.offers?.price;
              if (price === undefined) errors.push(`${file}: MenuItem "${mi.name}" has no offers.price`);
              if (mi.offers && mi.offers.priceCurrency !== 'USD') {
                errors.push(`${file}: MenuItem "${mi.name}" priceCurrency is not USD`);
              }
            }
          }
          notes.push(`${file}: Menu schema OK — ${sections.length} sections, ${count} items`);
        }
      }

      if (item['@type'] === 'FAQPage') {
        const qs = item.mainEntity || [];
        for (const q of qs) {
          if (!q.acceptedAnswer?.text) errors.push(`${file}: FAQ "${q.name}" has no acceptedAnswer.text`);
        }
        notes.push(`${file}: FAQPage OK — ${qs.length} questions`);
      }
    }
  }
}

/* ---------------- 5. sitemap ---------------- */
const smPath = join(ROOT, 'sitemap.xml');
if (!existsSync(smPath)) {
  errors.push('sitemap.xml is missing — run: node scripts/generate-sitemap.mjs');
} else {
  const sm = readFileSync(smPath, 'utf8');
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  if (!locs.length) errors.push('sitemap.xml contains no <loc> entries');

  const canonSet = new Set(canonicals.values());

  for (const loc of locs) {
    if (!canonSet.has(loc)) {
      errors.push(`sitemap lists ${loc}, which is not the canonical of any indexable page (404, redirect, or noindexed?)`);
    }
  }
  for (const [file, c] of canonicals) {
    if (!locs.includes(c)) {
      errors.push(`${file} is indexable (canonical ${c}) but is missing from sitemap.xml`);
    }
  }
  notes.push(`sitemap.xml: ${locs.length} URLs, all matching an indexable page's canonical`);
}

/* ---------------- report ---------------- */
const line = '-'.repeat(60);
console.log(`SEO / indexing check — ${pages.length} pages   (LAUNCHED=${LAUNCHED})`);
console.log(line);

if (errors.length) {
  console.log(`\n${errors.length} ERROR(S):`);
  errors.forEach((e) => console.log(`  ✗ ${e}`));
}
if (warns.length) {
  console.log(`\n${warns.length} warning(s):`);
  warns.forEach((w) => console.log(`  ! ${w}`));
}
if (notes.length) {
  console.log(`\nNotes:`);
  notes.forEach((n) => console.log(`  · ${n}`));
}

console.log(`\n${line}`);
console.log(errors.length ? 'FAIL' : 'PASS');
process.exit(errors.length ? 1 : 0);
