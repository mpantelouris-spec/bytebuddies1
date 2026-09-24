#!/usr/bin/env node
/**
 * Safe VPS deploy — never rm the web root before a successful rsync.
 * Usage: npm run build && npm run deploy:vps
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const indexPath = path.join(dist, 'index.html');

const host = process.env.BB_DEPLOY_HOST || 'ubuntu@129.151.144.92';
const remote = process.env.BB_DEPLOY_DIR || '/home/ubuntu/bytebuddies';
const key = process.env.BB_DEPLOY_KEY
  || path.join(process.env.HOME || '', '.ssh/bb_deploy_key');

const sshOpts = `-i "${key}" -o StrictHostKeyChecking=no`;
const rsyncSsh = `-e "ssh ${sshOpts}"`;

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: root, shell: true });
}

if (!fs.existsSync(indexPath)) {
  console.error('[deploy-vps] dist/index.html missing — run npm run build first');
  process.exit(1);
}

run('node scripts/verify-dist-index.mjs');
run('node scripts/write-bb-entry.mjs');

console.log('[deploy-vps] syncing app (characters preserved on server)…');
run(`rsync -az --delete --exclude='assets/characters/' ${rsyncSsh} "${dist}/" ${host}:${remote}/`);

console.log('[deploy-vps] syncing characters…');
run(`rsync -az --checksum ${rsyncSsh} "${path.join(dist, 'assets/characters')}/" ${host}:${remote}/assets/characters/`);

run(`ssh ${sshOpts} ${host} "test -f ${remote}/index.html && test -f ${remote}/bb-entry.json && find ${remote} -type d -exec chmod 755 {} \\; && find ${remote} -type f -exec chmod 644 {} \\; && sudo nginx -t && sudo systemctl reload nginx && curl -sf -o /dev/null http://127.0.0.1/ && echo Site OK"`);

console.log('[deploy-vps] done');
