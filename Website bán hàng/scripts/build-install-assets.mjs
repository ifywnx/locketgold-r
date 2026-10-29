/**
 * Generate install-test-assets.json from the canonical v1/, v2/, v3/ sources.
 * The JSON is a build artifact, not an independently edited source file.
 *
 * Run from "Website bán hàng" or from the Vercel mirror "web-vercel".
 * Usage: node scripts/build-install-assets.mjs [--check]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(projectRoot, '..');
const destination = join(projectRoot, 'lib', 'install-test-assets.json');
const versions = ['v1', 'v2', 'v3'];
const fileNames = [
  'An-Locket-DNS.mobileconfig',
  'deleteHeader.js',
  'An-Locket.sgmodule',
  'Locket_An.js',
  'Locket_Unlocked.js',
];

const generated = {};
for (const version of versions) {
  generated[version] = {};
  for (const fileName of fileNames) {
    // Only the canonical, versioned sources are read. Do not ingest a URL or
    // arbitrary user-provided path into the download bundle.
    generated[version][fileName] = readFileSync(
      join(repoRoot, version, fileName), 'utf8'
    );
  }
}

const content = JSON.stringify(generated) + '\n';
if (process.argv.includes('--check')) {
  if (!existsSync(destination) || readFileSync(destination, 'utf8') !== content) {
    console.error('Version bundle is missing or out of sync. Rebuild it before testing.');
    process.exitCode = 1;
  } else {
    console.log('PASS install bundle is identical to v1/v2/v3 sources');
  }
} else {
  mkdirSync(dirname(destination), { recursive: true });
  const old = existsSync(destination) ? readFileSync(destination, 'utf8') : null;
  if (old !== content) writeFileSync(destination, content, 'utf8');
  console.log('Prepared install bundle from v1/v2/v3 (' + Buffer.byteLength(content) + ' bytes)');
}
