#!/usr/bin/env node
// icons.mjs - Icon scanner for tasteskill
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const command = args[0];
const file = args.find(a => a.endsWith('.html'));

if (command === 'scan' && file && existsSync(file)) {
  const content = readFileSync(file, 'utf8');
  const icons = (content.match(/data-icon="[^"]*"/g) || []).length;
  console.log(`icons.mjs scan: ${icons} icons found in ${file}`);
} else if (command === 'scan') {
  console.log('icons.mjs scan: no HTML file specified');
} else {
  console.log('icons.mjs: usage: icons.mjs scan <file.html> --out <dir> --colour');
}
