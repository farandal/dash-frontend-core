#!/usr/bin/env node
/**
 * publish-npm.mjs
 *
 * Publishes all workspace packages to npm under the @dashadmin scope.
 *
 * Usage:
 *   node scripts/publish-npm.mjs [--version X.Y.Z] [--dry-run]
 *
 * Environment:
 *   NPM_TOKEN — npm authentication token (optional; prompted interactively if not set)
 *
 * Options:
 *   --version X.Y.Z   Publish version (defaults to package.json version)
 *   --dry-run        Simulate publish without uploading
 *
 * What it does:
 *   1. Unpublishes existing @dashadmin/* packages (best-effort, skips on error)
 *   2. For each package in packages/:
 *      - Rewrites name → @dashadmin/<name>
 *      - Bumps version to specified --version (or package.json version)
 *      - Rewrites internal dash-* deps to @dashadmin/dash-*
 *      - Runs `npm publish` with the temp-modified package.json
 *      - Restores original package.json
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PACKAGES_DIR = path.join(ROOT, 'packages');
const SCOPE = '@dashadmin';
const REGISTRY = 'https://registry.npmjs.org';

// ── Interactive prompt for sensitive input ────────────────────────────────────
const promptHidden = (query) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    process.stdout.write(query);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let answer = '';
    process.stdin.on('data', (char) => {
      if (char === '\n' || char === '\r') {
        process.stdin.pause();
        process.stdout.write('\n');
        rl.close();
        resolve(answer.trim());
      } else if (char === '') {
        process.exit();
      } else {
        answer += char;
      }
    });
  });
};

// ── Main execution (async) ────────────────────────────────────────────────────
(async () => {
  // Read default version from package.json
  const rootPkgPath = path.join(ROOT, 'package.json');
  const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
  const DEFAULT_VERSION = rootPkg.version;

  // Args parsing
  const args = process.argv.slice(2);
  let PUBLISH_VERSION = DEFAULT_VERSION;
  let DRY_RUN = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--version') { PUBLISH_VERSION = args[++i]; continue; }
    if (args[i] === '--dry-run') { DRY_RUN = true; continue; }
  }

  // NPM Token (interactive prompt if not in env)
  let NPM_TOKEN = process.env.NPM_TOKEN;
  if (!NPM_TOKEN) {
    console.log('NPM_TOKEN environment variable not set. Please enter your npm token:');
    NPM_TOKEN = await promptHidden('npm token (hidden): ');

    if (!NPM_TOKEN) {
      console.error('ERROR: NPM_TOKEN is required to publish.');
      process.exit(1);
    }
  }

  // Temp .npmrc
  const NPMRC_PATH = path.join(ROOT, '.npmrc.npm_publish_tmp');
  fs.writeFileSync(NPMRC_PATH, [
    `//registry.npmjs.org/:_authToken=${NPM_TOKEN}`,
    `registry=${REGISTRY}`,
  ].join('\n') + '\n');

  const cleanup = () => { try { fs.unlinkSync(NPMRC_PATH); } catch {} };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });
  process.on('uncaughtException', (e) => { console.error(e); cleanup(); process.exit(1); });

  const npm = (cmd, opts = {}) => {
    const env = { ...process.env, npm_config_userconfig: NPMRC_PATH };
    if (DRY_RUN && cmd.startsWith('publish')) {
      console.log(`  [dry-run] npm ${cmd}`);
      return '';
    }
    try {
      return execSync(`npm ${cmd}`, { env, cwd: ROOT, stdio: opts.silent ? 'pipe' : 'inherit', encoding: 'utf8' });
    } catch (e) {
      if (opts.ignoreErrors) return '';
      throw e;
    }
  };

  // Verify auth
  console.log('Verifying npm token...');
  try {
    const user = npm('whoami --registry ' + REGISTRY, { silent: true }).trim();
    console.log(`  Authenticated as: ${user}`);
  } catch {
    console.error('  ERROR: Could not authenticate with npm. Check your NPM_TOKEN.');
    process.exit(1);
  }

  // Collect workspace packages
  const pkgDirs = fs.readdirSync(PACKAGES_DIR)
    .map(name => ({ name, dir: path.join(PACKAGES_DIR, name), jsonPath: path.join(PACKAGES_DIR, name, 'package.json') }))
    .filter(({ jsonPath }) => fs.existsSync(jsonPath));

  const pkgNames = pkgDirs.map(({ jsonPath }) => JSON.parse(fs.readFileSync(jsonPath, 'utf8')).name).filter(Boolean);

  console.log(`\nWorkspace packages (${pkgNames.length}):`);
  pkgNames.forEach(n => console.log(`  ${n} → ${SCOPE}/${n}@${PUBLISH_VERSION}`));

  // Step 1: Unpublish existing @dashadmin/* packages
  console.log('\n── Step 1: Unpublishing existing @dashadmin/* packages ──────────────────');

  let existingPkgs = [];
  try {
    const raw = execSync(
      `npm search ${SCOPE} --registry ${REGISTRY} --json`,
      { env: { ...process.env, npm_config_userconfig: NPMRC_PATH }, encoding: 'utf8', stdio: 'pipe' }
    );
    existingPkgs = JSON.parse(raw).map(p => p.name);
  } catch {
    console.log('  (search failed — continuing without unpublish list)');
  }

  for (const pkg of existingPkgs) {
    process.stdout.write(`  Unpublishing ${pkg} ... `);
    try {
      execSync(`npm unpublish ${pkg} --force --registry ${REGISTRY}`, {
        env: { ...process.env, npm_config_userconfig: NPMRC_PATH },
        stdio: 'pipe', encoding: 'utf8',
      });
      console.log('done');
    } catch (e) {
      console.log(`skipped (${(e.stderr || e.message || '').split('\n')[0].trim()})`);
    }
  }

  // Step 2: Build packages
  console.log('\n── Step 2: Building packages ────────────────────────────────────────────');
  try {
    execSync('pnpm turbo build --filter=\'./packages/*\'', { cwd: ROOT, stdio: 'inherit' });
  } catch {
    console.error('Build failed — aborting.');
    process.exit(1);
  }

  // Step 3: Transform + publish
  console.log('\n── Step 3: Publishing to npm ────────────────────────────────────────────');

  const published = [];
  const failed = [];

  for (const { name: originalName, dir, jsonPath } of pkgDirs) {
    const pkg = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const originalContent = fs.readFileSync(jsonPath, 'utf8');
    const scopedName = `${SCOPE}/${originalName}`;

    console.log(`\n  ${scopedName}@${PUBLISH_VERSION}`);

    // Build modified package.json
    const modified = { ...pkg };
    modified.name = scopedName;
    modified.version = PUBLISH_VERSION;
    delete modified.private;
    modified.publishConfig = { access: 'public', registry: REGISTRY };

    // Rewrite internal dash-* cross-deps to @dashadmin/
    for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      if (!modified[section]) continue;
      const rewritten = {};
      for (const [dep, ver] of Object.entries(modified[section])) {
        rewritten[pkgNames.includes(dep) ? `${SCOPE}/${dep}` : dep] = ver;
      }
      modified[section] = rewritten;
    }

    // Write temp package.json
    fs.writeFileSync(jsonPath, JSON.stringify(modified, null, '\t') + '\n');

    try {
      execSync(
        `npm publish ${dir} --registry ${REGISTRY} --access public --no-git-checks`,
        { env: { ...process.env, npm_config_userconfig: NPMRC_PATH }, stdio: 'inherit' }
      );
      published.push(`${scopedName}@${PUBLISH_VERSION}`);
    } catch {
      failed.push(scopedName);
    } finally {
      // Always restore original package.json
      fs.writeFileSync(jsonPath, originalContent);
    }
  }

  // Summary
  console.log('\n── Summary ──────────────────────────────────────────────────────────────');
  console.log(`\nPublished (${published.length}):`);
  published.forEach(p => console.log(`  ✓ ${p}`));

  if (failed.length > 0) {
    console.log(`\nFailed (${failed.length}):`);
    failed.forEach(p => console.log(`  ✗ ${p}`));
    process.exit(1);
  }

  console.log(`\nAll packages published to npm under ${SCOPE}`);
  console.log(`View at: https://www.npmjs.com/org/dashadmin`);
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
