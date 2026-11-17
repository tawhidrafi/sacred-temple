#!/usr/bin/env node
// story.mjs - Generate story video for unslop
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const storyFile = args[0];
const output = args[1] || 'unslop-story.mp4';

if (!storyFile || !existsSync(storyFile)) {
  console.log('story.mjs: story file not found:', storyFile);
  process.exit(1);
}

console.log(`story.mjs: generating story video from ${storyFile} to ${output}`);
console.log('story.mjs: Playwright and ffmpeg not available in this environment');
