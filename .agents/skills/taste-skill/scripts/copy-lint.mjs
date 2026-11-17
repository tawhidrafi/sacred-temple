#!/usr/bin/env node
// copy-lint.mjs - Copy lint for tasteskill pages
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--')) || args[0];

if (!file || !existsSync(file)) {
  console.log('copy-lint: no file to lint');
  process.exit(0);
}

const content = readFileSync(file, 'utf8');
let warns = 0;

// Check for slop words
const slopWords = ['supercharge', 'seamless', 'unlock', 'magic', 'revolutionize', 'game-changing', 'AI-powered'];
for (const word of slopWords) {
  if (content.toLowerCase().includes(word.toLowerCase())) {
    console.log(`WARN: slop word found: ${word}`);
    warns++;
  }
}

// Check for greeting headlines
if (content.includes('Welcome back')) {
  console.log('WARN: greeting headline found');
  warns++;
}

// Check for exclamation marks in short strings
const exclamationMatches = content.match(/>[^<]*!/g);
if (exclamationMatches && exclamationMatches.length > 0) {
  console.log('WARN: exclamation marks in interface text');
  warns++;
}

if (warns > 0) {
  console.log(`copy-lint: ${warns} warning(s)`);
  process.exit(0);
}

console.log('copy-lint: clean');
