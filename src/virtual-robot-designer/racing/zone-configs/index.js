export { ZONE_RAINBOW_ROAD, createRainbowRoadCurve } from './ZoneConfig_RainbowRoad.js';
export { ZONE_SUNNY_CIRCUIT, createSunnyCircuitCurve } from './ZoneConfig_SunnyCircuit.js';
export { ZONE_VOLCANO_DRIFT, createVolcanoDriftCurve } from './ZoneConfig_VolcanoDrift.js';

export const RACING_ZONE_CONFIGS = {
  rainbow_road: () => import('./ZoneConfig_RainbowRoad.js').then((m) => m.ZONE_RAINBOW_ROAD),
  sunny_circuit: () => import('./ZoneConfig_SunnyCircuit.js').then((m) => m.ZONE_SUNNY_CIRCUIT),
  volcano_drift: () => import('./ZoneConfig_VolcanoDrift.js').then((m) => m.ZONE_VOLCANO_DRIFT),
};
