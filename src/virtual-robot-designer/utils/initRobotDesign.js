import { migrateDesign } from '../config.js';
import { updateAssemblyBase } from '../services/assembly-service.js';

/** Fresh robot for kids to build from scratch */
export function createFreshRobotDesign(existing = {}) {
  const base = migrateDesign(existing);
  return updateAssemblyBase(
    {
      ...base,
      name: 'Explorer Bot',
      cosmetics: {
        primaryColor: '#FFFFFF',
        ledColor: '#00D9FF',
        secondaryColor: '#FF8C00',
        wheelColor: '#1E90FF',
        accentLights: true,
      },
      assembly: {
        ...base.assembly,
        buildMode: 'advanced',
        mode: 'custom',
        visualMode: 'realistic',
        slots: {
          movement: null,
          head: null,
          front: null,
          left: null,
          right: null,
          back: null,
          top: null,
          addon_a: null,
          addon_b: null,
        },
      },
    },
    {
      color: '#FFFFFF',
      material: 'industrial',
      chassisType: 'cube',
      shape: 'box',
      width: 1,
      height: 0.62,
      depth: 1,
      scale: 1,
    },
  );
}
