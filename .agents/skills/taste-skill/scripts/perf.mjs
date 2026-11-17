#!/usr/bin/env node
// perf.mjs - Performance checker for tasteskill pages
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--')) || args[0];

if (!file || !existsSync(file)) {
  console.log('perf: no file to check');
  process.exit(0);
}

const content = readFileSync(file, 'utf8');

// Count images
const images = (content.match(/<img[^>]*>/g) || []).length;
console.log(`perf: ${images} images found`);

// Check WebGL contexts
const webglCount = (content.match(/WebGL/g) || []).length;
console.log(`perf: WebGL references: ${webglCount}`);

if (webglCount > 4) {
  console.log('FAIL: more than 4 WebGL contexts');
  process.exit(1);
}

console.log('perf: PASS');
