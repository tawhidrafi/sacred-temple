#!/usr/bin/env node
// gate.mjs - Finish gate for tasteskill pages
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--')) || args[0];

console.log('tasteskill gate: checking', url || '(no page)');

if (!url || !existsSync(url)) {
  console.log('GATE: SETUP (no page yet)');
  process.exit(0);
}

const content = readFileSync(url, 'utf8');
let fails = 0;

// Basic checks
if (!content.includes('<html')) { console.log('FAIL: no <html> tag'); fails++; }
if (!content.includes('<head>')) { console.log('FAIL: no <head>'); fails++; }
if (!content.includes('<body>')) { console.log('FAIL: no <body>'); fails++; }
if (!content.includes('data-type')) { console.log('WARN: no data-type on <html>'); }

if (fails > 0) {
  console.log(`GATE: ERROR (${fails} failure(s))`);
  process.exit(1);
}

console.log('GATE: PASS');
