# Virtual Robot Designer — Test Report

**Last run:** automated via `npm run test:vrd`  
**Result:** 61/61 Jest tests passing + smoke OK

## Run everything locally

```bash
# Unit + integration (maps to test plan IDs in test names)
npm run test:vrd

# Quick module smoke
npm run smoke:vrd

# Browser E2E (requires: npm run build && npm run preview, then Chromium)
npm run build && npm run preview -- --port 4173 --host 127.0.0.1
SKIP_VRD_WEBSERVER=1 npm run test:e2e:vrd
```

## Automated coverage by section

| Section | Test plan IDs | Automated | Count |
|---------|---------------|-----------|-------|
| 1 Functional | FT-001–FT-015 | Yes | 40+ cases |
| 2 Visual (tokens/layout) | VT-002, VT-004, VT-006 | Yes (static) | 5 |
| 3 Performance | PT-001–PT-009 | No* | — |
| 4 Interaction (feel) | IT-001–IT-004 | Partial (logic) | 6 |
| 5 Edge cases | ET-003–ET-005 | Yes | 4 |
| 6 Accessibility | AT-005 | Yes (contrast math) | 2 |
| 7 Browsers | BT-001 | E2E spec (Chromium) | 7 tests |
| 8 Responsive | RT-001, RT-003, RT-006 | CSS + E2E | 3 |
| 9 Data integrity | DT-001–DT-003 | Yes | 5 |
| 10 User flow | CF-001 | E2E partial | 1 |

\*Performance (60 FPS, memory) requires Chrome DevTools manual profiling or Lighthouse CI.

## Test files

| File | Purpose |
|------|---------|
| `tests/vrd-designer.test.js` | Core save/load, sockets, stats |
| `tests/vrd-comprehensive.test.js` | Full functional + visual + API + undo |
| `tests/e2e/vrd.spec.js` | Playwright browser tests |
| `scripts/vrd-smoke.mjs` | Fast import/placement smoke |
| `scripts/run-vrd-test-plan.mjs` | Orchestrator + coverage map |

## Items that remain manual

- **PT-001–PT-009:** Record Performance tab while rotating robot; target ≥50 FPS average.
- **VT-009–VT-013:** 3D material quality, bobbing, LED blink (visual approval).
- **BT-002–BT-006:** Firefox, Safari, Edge, mobile browsers.
- **IT-001–IT-002:** Button hover scale “feel” (subjective).

These are documented so release sign-off can include a short manual checklist.
