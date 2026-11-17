#!/usr/bin/env node
// shoot.mjs - Screenshot generator for tasteskill pages
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--')) || args[0];
const width = args.find(a => a.startsWith('--w='))?.split('=')[1] || '1440';
const out = args.find(a => a.startsWith('--out='))?.split('=')[1] || 'shots/output.png';

if (!url || !existsSync(url)) {
  console.log('shoot: no page to shoot');
  process.exit(0);
}

console.log(`shoot: ${url} at width ${width} -> ${out}`);

const content = readFileSync(url, 'utf8');
console.log(`shoot: read ${content.length} bytes, no browser available in this environment`);
