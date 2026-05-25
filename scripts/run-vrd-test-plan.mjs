#!/usr/bin/env node
/**
 * Runs all Virtual Robot Designer automated tests and prints a test-plan report.
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' });
  return { code: r.status ?? 1, out: (r.stdout || '') + (r.stderr || '') };
}

console.log('═══ Virtual Robot Designer Test Plan Runner ═══\n');

const smoke = run('node', ['scripts/vrd-smoke.mjs']);
console.log(smoke.out.trim());
if (smoke.code !== 0) {
  console.error('\n✗ Smoke failed');
  process.exit(1);
}

console.log('\n── Jest (unit + integration) ──\n');
const jest = run('npx', ['jest', 'tests/vrd-designer.test.js', 'tests/vrd-comprehensive.test.js', '--no-coverage', '--verbose']);
process.stdout.write(jest.out);

const passed = (jest.out.match(/Tests:\s+(\d+) passed/) || [])[1];
const failed = (jest.out.match(/,\s+(\d+) failed/) || [])[1];
const total = passed && failed ? Number(passed) + Number(failed) : null;

console.log('\n═══ Coverage map (automated) ═══');
const sections = [
  ['Section 1 Functional', 'FT-001–FT-015', 'vrd-comprehensive + vrd-designer'],
  ['Section 5 Edge cases', 'ET-003–ET-005', 'vrd-comprehensive'],
  ['Section 6 Accessibility', 'AT-005', 'vrd-comprehensive (contrast)'],
  ['Section 2 Visual (static)', 'VT-002, VT-004, VT-006', 'CSS + tokens'],
  ['Section 8 Responsive (static)', 'RT-003, RT-004', 'media queries in CSS'],
  ['Section 9 Data integrity', 'DT-001–DT-003', 'vrd-comprehensive + vrd-designer'],
  ['API layer', 'save/load/delete', 'vrd-comprehensive'],
];
sections.forEach(([name, ids, how]) => console.log(`  ✓ ${name} (${ids}) — ${how}`));

console.log('\n── Manual / browser-only (not in CI) ──');
['PT-001–PT-009 Performance FPS/memory', 'BT-001–BT-006 Cross-browser', 'VT-009–VT-013 3D visual quality', 'IT-001–IT-004 Hover/click feel', 'CF-001 Full E2E journey'].forEach((line) => {
  console.log(`  ○ ${line} — run: npm run test:e2e:vrd (after build)`);
});

if (jest.code !== 0) {
  console.error('\n✗ Jest failed');
  process.exit(1);
}

console.log('\n── HTTP preview check (optional) ──\n');
try {
  const http = run('node', ['scripts/vrd-e2e-http.mjs']);
  console.log(http.out.trim());
} catch {
  console.log('  (skip — start preview: npm run preview -- --port 4173 --host 127.0.0.1)');
}

console.log(`\n✓ All automated VRD tests passed${total ? ` (${total} cases)` : ''}`);
console.log('  Full browser E2E: npm run build && npm run preview -- --port 4173 --host 127.0.0.1');
console.log('                  then: npm run test:e2e:vrd\n');
