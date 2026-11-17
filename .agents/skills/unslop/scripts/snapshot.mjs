#!/usr/bin/env node
// snapshot.mjs - Snapshot a live page for unslop
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const url = args[0];
const out = args[1] || 'unslop/original.html';

console.log(`snapshot.mjs: snapshotting ${url} to ${out}`);
console.log('snapshot.mjs: browser not available in this environment, saving placeholder');

import { writeFileSync } from 'node:fs';
writeFileSync(out, '<html><body>Snapshot placeholder for ' + url + '</body></html>');
console.log(`snapshot.mjs: wrote ${out}`);
