#!/usr/bin/env node
// consistency.mjs - Consistency checker for tasteskill pages
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--')) || args[0];

if (!file || !existsSync(file)) {
  console.log('consistency: no file to check');
  process.exit(0);
}

const content = readFileSync(file, 'utf8');
let fails = 0;

// Check for equal edges
if (!content.includes('.wrap')) { console.log('FAIL: no .wrap container'); fails++; }

// Check for one section per screen
const sections = (content.match(/<section[^>]*>/g) || []).length;
if (sections === 0) { console.log('FAIL: no sections found'); fails++; }

// Check for data-type
if (!content.includes('data-type')) { console.log('FAIL: no data-type'); fails++; }

if (fails > 0) {
  console.log(`consistency: ${fails} failure(s)`);
  process.exit(1);
}

console.log('consistency: PASS');
