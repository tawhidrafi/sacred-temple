#!/usr/bin/env node
// moments.mjs - Pick moments for tasteskill
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const command = args[0];

if (command === 'pick') {
  console.log('moments.mjs pick: moment picker not available in this environment');
} else {
  console.log('moments.mjs: usage: moments.mjs pick [args]');
}
