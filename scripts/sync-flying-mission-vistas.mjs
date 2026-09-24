/** Sync aerialVista in FlyingMissionSpecs to chassis-locked FLYER_VISUAL_BIBLES. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FLYER_VISUAL_BIBLES, resolvePremiumAerialVista } from '../src/virtual-robot-designer/studio/aerial-world/FlyingArenaSpec.js';

const dir = dirname(fileURLToPath(import.meta.url));
const path = join(dir, '../src/virtual-robot-designer/studio/aerial-world/FlyingMissionSpecs.js');
let src = readFileSync(path, 'utf8');

for (const [chassisId, bible] of Object.entries(FLYER_VISUAL_BIBLES)) {
  for (let mode = 1; mode <= 10; mode++) {
    const vista = resolvePremiumAerialVista(chassisId, mode);
    const re = new RegExp(`("chassisId":\\s*"${chassisId}"[\\s\\S]*?"mode":\\s*${mode}[\\s\\S]*?"aerialVista":\\s*")[^"]+(")`, 'g');
    src = src.replace(re, `$1${vista}$2`);
  }
}

writeFileSync(path, src);
console.log('Synced aerialVista for 9 chassis bibles in FlyingMissionSpecs.js');
