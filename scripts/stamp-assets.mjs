#!/usr/bin/env node
/**
 * Cache-busting for shared files.
 *
 * Pages load their scripts as  assets/js/name.js?v=<fingerprint>  where the
 * fingerprint is the first 10 hex characters of the file's SHA-256. Change a
 * file, run this, and every page that loads it gets a new URL, so a returning
 * visitor can never pair fresh HTML with a stale cached script.
 *
 * It also prints the CSP hash for each remaining inline <script> (the home
 * page's one-line head script), and fails if netlify.toml doesn't allow it.
 *
 * Usage:  node scripts/stamp-assets.mjs        (rewrites pages in place)
 *         node scripts/stamp-assets.mjs --check (exit 1 if anything is stale)
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

// The deployable pages. Mockups and snapshots are drafts and never ship.
const pages = readdirSync(ROOT).filter(
  (f) => f.endsWith('.html') && !f.startsWith('story-mock') && !f.startsWith('_')
);

const sha = (buf, enc = 'hex') => createHash('sha256').update(buf).digest(enc);
const fingerprint = new Map();
const fp = (rel) => {
  if (!fingerprint.has(rel)) fingerprint.set(rel, sha(readFileSync(join(ROOT, rel))).slice(0, 10));
  return fingerprint.get(rel);
};

let stale = 0;
const inlineHashes = new Set();

for (const page of pages) {
  const path = join(ROOT, page);
  const html = readFileSync(path, 'utf8');
  const out = html.replace(/(src|href)="(\/?)((?:assets\/js|assets\/css)\/[^"?]+\.(?:js|css))(?:\?v=[^"]*)?"/g,
    (m, attr, slash, rel) => `${attr}="${slash}${rel}?v=${fp(rel)}"`);
  if (out !== html) {
    stale++;
    if (!CHECK) writeFileSync(path, out);
    console.log(`${CHECK ? 'stale' : 'stamped'}  ${page}`);
  }
  // inline executable scripts (JSON-LD data blocks are not executed, so CSP ignores them)
  for (const m of out.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1] || '';
    if (/src=|ld\+json/.test(attrs) || !m[2].trim()) continue;
    inlineHashes.add(`'sha256-${sha(m[2], 'base64')}'`);
  }
}

const toml = readFileSync(join(ROOT, 'netlify.toml'), 'utf8');
let missing = 0;
for (const h of inlineHashes) {
  if (!toml.includes(h)) { missing++; console.log(`netlify.toml script-src is missing ${h}`); }
}

for (const [rel, v] of fingerprint) console.log(`  ${rel}  v=${v}`);
console.log(`inline script hashes: ${[...inlineHashes].join(' ') || 'none'}`);

if ((CHECK && stale) || missing) process.exit(1);
