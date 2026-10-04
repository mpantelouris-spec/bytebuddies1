# ByteBuddies Runtime (micro:bit firmware)

`bb-runtime/main.ts` is a MakeCode program flashed **once** onto a micro:bit. After that the
Robot Lab sends programs over USB (Web Serial) or Bluetooth (V2), the micro:bit saves them and runs them.

- micro:bit **V2**: Bluetooth + USB, full feature set
- micro:bit **V1**: USB only (no room for Bluetooth); lines tagged `// @full` / `// @v2` are left out

The program format is produced by `src/utils/runtimeCompiler.js` (which also contains a JS copy of the
interpreter used for tests).

## Rebuild `public/bytebuddies-runtime.hex`

```bash
mkdir -p /tmp/mkc && cd /tmp/mkc && npm init -y && npm i pxt pxt-microbit && npx pxt target microbit
cd <repo> && PXT_DIR=/tmp/mkc node firmware/build-runtime.mjs
```

Lines tagged `// @ble` are Bluetooth-only, `// @v1` / `// @v2` are board-specific.
NeoPixels and radio can't be used with Bluetooth in MakeCode, so the runtime skips those blocks.
