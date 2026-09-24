#!/usr/bin/env node
/**
 * Fail the build/deploy if dist/index.html still points at dev entry (broken production).
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const indexPath = resolve(process.cwd(), 'dist/index.html');
if (!existsSync(indexPath)) {
  console.error('verify-dist-index: dist/index.html missing — run npm run build first');
  process.exit(1);
}
const html = readFileSync(indexPath, 'utf8');
if (html.includes('/src/main.jsx')) {
  console.error(
    'verify-dist-index: dist/index.html still references /src/main.jsx (dev entry).\n' +
      'Do NOT copy source index.html to dist. Run npm run build and deploy dist/index.html only.'
  );
  process.exit(1);
}
if (!html.includes('./assets/index-') && !html.includes('/assets/index-')) {
  console.error('verify-dist-index: no hashed index-*.js bundle in dist/index.html');
  process.exit(1);
}
console.log('verify-dist-index: OK');
