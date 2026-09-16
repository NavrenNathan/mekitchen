#!/usr/bin/env node
/**
 * Performance budget guard + trend recorder.
 *
 * Reads a Lighthouse JSON report, compares the key metrics against budgets,
 * and appends one line to reports/lighthouse-history.jsonl so the trend lives
 * in the repo rather than only in a CI log that scrolls away.
 *
 * BUDGETS ARE SET FROM THIS SITE'S MEASURED BASELINE, not from generic
 * best-practice numbers that would fail on day one. They are "do not regress"
 * lines with deliberate headroom, so normal run-to-run variance does not turn
 * CI red. The longer-term Google targets are recorded alongside them, and the
 * budgets should be tightened toward those as the site improves.
 *
 * Usage:
 *   node scripts/perf-check.mjs <lighthouse-report.json> [--label=local]
 */

import { readFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Enforced today (measured locally, 2026-09-16, after the render-blocking and
 * image-sizing fixes: Perf 98, LCP 1.5s, CLS 0.091, TBT 0ms).
 *
 * `target` is Google's Core Web Vitals "good" threshold — what to aim for,
 * not what is enforced. Where enforced === target the site already meets it.
 */
const BUDGETS = {
  performance:              { min: 90,   target: 90,   label: 'Performance score' },
  'largest-contentful-paint': { max: 2000, target: 2500, label: 'LCP (ms)' },
  'cumulative-layout-shift':  { max: 0.12, target: 0.10, label: 'CLS' },
  'total-blocking-time':      { max: 200,  target: 200,  label: 'TBT (ms)' },
};

const reportPath = process.argv[2];
const label = (process.argv.find((a) => a.startsWith('--label=')) || '--label=local').split('=')[1];

if (!reportPath || !existsSync(reportPath)) {
  console.error('Usage: node scripts/perf-check.mjs <lighthouse-report.json> [--label=local]');
  process.exit(2);
}

const lh = JSON.parse(readFileSync(reportPath, 'utf8'));
const audits = lh.audits;

const metrics = {
  performance: Math.round(lh.categories.performance.score * 100),
  'largest-contentful-paint': Math.round(audits['largest-contentful-paint'].numericValue),
  'cumulative-layout-shift': Number(audits['cumulative-layout-shift'].numericValue.toFixed(3)),
  'total-blocking-time': Math.round(audits['total-blocking-time'].numericValue),
};
const pageWeightKiB = Math.round((audits['total-byte-weight']?.numericValue || 0) / 1024);

const failures = [];
const rows = [];

for (const [key, budget] of Object.entries(BUDGETS)) {
  const value = metrics[key];
  let ok = true;
  let limit;
  if (budget.min !== undefined) { ok = value >= budget.min; limit = `>= ${budget.min}`; }
  if (budget.max !== undefined) { ok = value <= budget.max; limit = `<= ${budget.max}`; }
  if (!ok) failures.push(`${budget.label}: ${value} (budget ${limit})`);
  rows.push({ label: budget.label, value, limit, ok, target: budget.target });
}

// --- report ---
const line = '-'.repeat(64);
console.log(`Performance budgets — ${label}   ${lh.finalDisplayedUrl || lh.finalUrl || ''}`);
console.log(line);
for (const r of rows) {
  console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.label.padEnd(22)} ${String(r.value).padStart(7)}   budget ${r.limit.padEnd(8)} target ${r.target}`);
}
console.log(`  ----  ${'Page weight (KiB)'.padEnd(22)} ${String(pageWeightKiB).padStart(7)}   (tracked, not enforced)`);

// --- append to the trend file ---
const entry = {
  ts: new Date().toISOString(),
  label,
  url: lh.finalDisplayedUrl || lh.finalUrl || null,
  ...metrics,
  pageWeightKiB,
  pass: failures.length === 0,
};
mkdirSync(join(ROOT, 'reports'), { recursive: true });
appendFileSync(join(ROOT, 'reports', 'lighthouse-history.jsonl'), JSON.stringify(entry) + '\n');
console.log(`\n  recorded -> reports/lighthouse-history.jsonl`);

console.log(`\n${line}`);
if (failures.length) {
  console.log('FAIL — performance regressed past budget:');
  failures.forEach((f) => console.log(`  ✗ ${f}`));
  process.exit(1);
}
console.log('PASS');
