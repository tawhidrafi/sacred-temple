#!/usr/bin/env node
// check.mjs - Layout checker for tasteskill pages
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--')) || args[0];

if (!url || !existsSync(url)) {
  console.log('check: no page to check');
  process.exit(0);
}

const content = readFileSync(url, 'utf8');
let fails = 0;

// Check for visual content
if (!content.includes('<img') && !content.includes('data-enter')) {
  console.log('FAIL: no visual content found');
  fails++;
}

// Check for caption under images (should not have captions)
if (content.includes('<figcaption')) {
  console.log('FAIL: caption under image (not allowed)');
  fails++;
}

if (fails > 0) {
  console.log(`check: ${fails} failure(s)`);
  process.exit(1);
}

console.log('check: PASS');
