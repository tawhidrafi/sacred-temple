#!/usr/bin/env node
// start.mjs - Deal, css, brand commands for tasteskill
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const command = args[0];

if (command === 'deal') {
  console.log('start.mjs deal: palette dealer not available in this environment');
} else if (command === 'css') {
  console.log('start.mjs css: CSS generator not available in this environment');
} else if (command === 'brand') {
  console.log('start.mjs brand: brand command not available in this environment');
} else {
  console.log('start.mjs: usage: start.mjs <deal|css|brand> [args]');
}
