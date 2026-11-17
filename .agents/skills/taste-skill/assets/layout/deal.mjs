#!/usr/bin/env node
// deal.mjs - Deal hero layout for tasteskill
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const type = args.find(a => a.startsWith('--type='))?.split('=')[1];
const has = args.find(a => a.startsWith('--has='))?.split('=')[1];
const history = args.find(a => a.startsWith('--history='))?.split('=')[1];

console.log(`deal.mjs: dealing hero type=${type} has=${has} history=${history}`);
console.log('deal.mjs: hero layout engine not available in this environment');
