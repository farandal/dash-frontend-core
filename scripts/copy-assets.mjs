#!/usr/bin/env node
/**
 * copy-assets.mjs
 *
 * Packages ship `dist` only, and tsup (bundle:false) emits JavaScript but leaves stylesheets, fonts,
 * images and sounds behind in src. A compiled `./styles/info.less` import then points at nothing, and
 * so does a `dash-styles/dash.less` export. Run from a package directory after the build: copies the
 * non-code assets of src into dist, keeping their relative paths.
 */
import fs from 'fs';
import path from 'path';

const EXT = new Set(['.less', '.css', '.scss', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico',
  '.mp3', '.wav', '.ogg', '.ttf', '.woff', '.woff2', '.eot', '.otf']);
const SRC = path.resolve('src');
const DIST = path.resolve('dist');

if (!fs.existsSync(SRC)) { console.error('copy-assets: no src directory in ' + process.cwd()); process.exit(1); }

let copied = 0;
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const from = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'node_modules') walk(from); continue; }
    if (!EXT.has(path.extname(entry.name).toLowerCase())) continue;
    const to = path.join(DIST, path.relative(SRC, from));
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    copied++;
  }
};
walk(SRC);
console.log(`copy-assets: ${copied} file(s) -> dist`);
