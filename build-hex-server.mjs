#!/usr/bin/env node
/**
 * Build micro:bit hex server-side
 * Returns single-board Intel Hex (V2) which works on both V1 and V2 devices
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MicropythonFsHex, microbitBoardId } from '@microbit/microbit-fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load V2 hex only (V2 hex works on both V1 and V2 devices via auto-detection)
const hexV2 = fs.readFileSync(path.join(__dirname, 'public/micropython-v2.hex'), 'utf8');
console.log(`✅ Loaded V2 hex: ${(hexV2.length / 1024).toFixed(1)} KB`);

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/build-hex') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
    if (body.length > 100 * 1024) {
      res.writeHead(413);
      res.end('Payload too large');
      req.connection.destroy();
    }
  });

  req.on('end', () => {
    try {
      const { pythonCode } = JSON.parse(body);
      if (!pythonCode || typeof pythonCode !== 'string') {
        throw new Error('Missing or invalid pythonCode');
      }

      // Build with V2 hex only (simpler, more reliable)
      const fs_builder = new MicropythonFsHex(hexV2);
      fs_builder.write('main.py', pythonCode);

      // Get Intel Hex (single-board format, no type 0x0A records)
      const hexOutput = fs_builder.getIntelHex();

      const sizeKB = hexOutput.length / 1024;
      console.log(`✅ Built hex: ${sizeKB.toFixed(1)} KB`);

      if (sizeKB < 500 || sizeKB > 2000) {
        console.warn(`⚠️  Unexpected size: ${sizeKB.toFixed(1)} KB`);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        hex: hexOutput,
        size: hexOutput.length,
      }));
    } catch (e) {
      console.error('❌ Error:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
  });
});

const PORT = 3456;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Hex server ready at http://localhost:${PORT}/api/build-hex`);
});
