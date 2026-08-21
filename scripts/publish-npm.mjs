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
 *   NPM_TOKEN — npm authentication token. Read from the shell env if set, else
 *   loaded from a root .env file (gitignored), else prompted interactively.
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

// Load a root .env file (gitignored) into process.env, without overriding
// anything already set in the shell. Minimal parser — no dotenv dependency,
// matches the style already used by build_config.js's loadEnvFile().
const loadDotEnv = () => {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (!key || rest.length === 0) continue;
    const value = rest.join('=').replace(/^["']|["']$/g, '');
    if (process.env[key] === undefined) process.env[key] = value;
  }
};
loadDotEnv();

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

// Bump the patch component of a semver string: "1.3.29" -> "1.3.30"
const bumpPatch = (version) => {
  const parts = version.split('.').map(Number);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  return parts.join('.');
};

// ── Main execution (async) ────────────────────────────────────────────────────
(async () => {
  // Root package.json's version is the single source of truth every published
  // package aligns to. Bump it here (not just read it) so every real run gets
  // a fresh version automatically — no more remembering --version by hand and
  // no more accidental re-publishes of an already-used version.
  const rootPkgPath = path.join(ROOT, 'package.json');
  const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));

  // Args parsing
  const args = process.argv.slice(2);
  let PUBLISH_VERSION = null;
  let DRY_RUN = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--version') { PUBLISH_VERSION = args[++i]; continue; }
    if (args[i] === '--dry-run') { DRY_RUN = true; continue; }
  }

  if (PUBLISH_VERSION) {
    console.log(`Using explicit --version ${PUBLISH_VERSION} (root package.json left untouched)`);
  } else {
    PUBLISH_VERSION = bumpPatch(rootPkg.version);
    console.log(`No --version given — bumping root package.json ${rootPkg.version} -> ${PUBLISH_VERSION}`);
    if (!DRY_RUN) {
      rootPkg.version = PUBLISH_VERSION;
      fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');
    }
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

  // Step 1: Build packages
  console.log('\n── Step 1: Building packages ────────────────────────────────────────────');
  try {
    execSync('pnpm turbo build --filter=\'./packages/*\'', { cwd: ROOT, stdio: 'inherit' });
  } catch {
    console.error('Build failed — aborting.');
    process.exit(1);
  }

  // Step 2: Transform + publish
  console.log('\n── Step 2: Publishing to npm ────────────────────────────────────────────');

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

    // Rewrite internal dash-* cross-deps to @dashadmin/, and resolve any
    // workspace: protocol specifier to a real published range — npm has no
    // concept of the workspace: protocol, so a literal "workspace:*" left in
    // a published package.json breaks resolution for every consumer outside
    // this monorepo (ERR_PNPM_WORKSPACE_PKG_NOT_FOUND).
    const resolveWorkspaceRange = (ver) => {
      if (!ver.startsWith('workspace:')) return ver;
      const range = ver.slice('workspace:'.length);
      if (range === '*') return PUBLISH_VERSION;
      if (range === '^') return `^${PUBLISH_VERSION}`;
      if (range === '~') return `~${PUBLISH_VERSION}`;
      return range; // e.g. "workspace:^1.2.3" -> "^1.2.3"
    };

    for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      if (!modified[section]) continue;
      const rewritten = {};
      for (const [dep, ver] of Object.entries(modified[section])) {
        const newDep = pkgNames.includes(dep) ? `${SCOPE}/${dep}` : dep;
        rewritten[newDep] = resolveWorkspaceRange(ver);
      }
      modified[section] = rewritten;
    }

    // Write temp package.json
    fs.writeFileSync(jsonPath, JSON.stringify(modified, null, '\t') + '\n');

    try {
      if (DRY_RUN) {
        console.log(`  [dry-run] npm publish ${dir}`);
      } else {
        execSync(
          `npm publish ${dir} --registry ${REGISTRY} --access public --no-git-checks`,
          { env: { ...process.env, npm_config_userconfig: NPMRC_PATH }, stdio: 'inherit' }
        );
      }
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
