#!/usr/bin/env node
// photos.mjs - Photo sourcing for tasteskill
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const command = args[0];

if (command === 'credits') {
  console.log('photos.mjs credits: no photographs used in this page');
} else if (command === 'search') {
  console.log('photos.mjs search: photo search not available in this environment');
} else {
  console.log('photos.mjs: usage: photos.mjs <credits|search> [args]');
}
