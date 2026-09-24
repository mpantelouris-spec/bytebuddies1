#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';

const distDir = resolve(process.cwd(), 'dist');
const indexPath = resolve(distDir, 'index.html');
if (!existsSync(indexPath)) {
  console.error('write-bb-entry: dist/index.html missing');
  process.exit(1);
}
const html = readFileSync(indexPath, 'utf8');
const m = html.match(/src="\.\/assets\/(index-[A-Za-z0-9_.-]+\.js)"/);
if (!m) {
  console.error('write-bb-entry: no hashed index-*.js in dist/index.html');
  process.exit(1);
}
const buildMatch = html.match(/var BUILD = '([^']+)'/);
const entry = './assets/' + m[1];

const assetsDir = resolve(distDir, 'assets');
const studioChunks = existsSync(assetsDir)
  ? readdirSync(assetsDir)
      .filter((f) => /^vrd-core-[A-Za-z0-9_.-]+\.js$/.test(f) || /^ByteBuddiesStudio-[A-Za-z0-9_.-]+\.js$/.test(f) || /^LiveLabPage-[A-Za-z0-9_.-]+\.js$/.test(f))
      .map((f) => './assets/' + f)
  : [];

const manifest = {
  entry,
  build: buildMatch?.[1] || 'unknown',
  studioChunks,
  writtenAt: new Date().toISOString(),
};
writeFileSync(resolve(distDir, 'bb-entry.json'), JSON.stringify(manifest, null, 2));
console.log('write-bb-entry: OK', manifest.entry, manifest.build, studioChunks.length + ' studio chunks');
