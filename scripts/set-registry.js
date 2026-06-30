#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const mode = process.argv[2];

const REGISTRIES = {
  npmjs: 'https://registry.npmjs.org/',
  verdaccio: 'http://localhost:4873',
};

if (!mode || !REGISTRIES[mode]) {
  console.error('Usage: node scripts/set-registry.js <npmjs|verdaccio>');
  process.exit(1);
}

const repoRoot = path.resolve(__dirname, '..');
const npmrcPath = path.join(repoRoot, '.npmrc');
const targetRegistry = REGISTRIES[mode];

let lines = [];
if (fs.existsSync(npmrcPath)) {
  lines = fs.readFileSync(npmrcPath, 'utf8').split(/\r?\n/);
}

let replaced = false;
lines = lines.map((line) => {
  if (/^\s*registry\s*=/.test(line)) {
    replaced = true;
    return `registry=${targetRegistry}`;
  }
  return line;
});

if (!replaced) {
  lines.unshift(`registry=${targetRegistry}`);
}

const output = `${lines.filter((line, i, arr) => !(i === arr.length - 1 && line === '')).join('\n')}\n`;
fs.writeFileSync(npmrcPath, output, 'utf8');

console.log(`Set npm registry to ${targetRegistry}`);
console.log('Run pnpm install to apply lockfile/dependency resolution changes.');
