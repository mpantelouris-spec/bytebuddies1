/**
 * AerialGltfEnrichKit — glTF citadel dressing + illustrated backdrops (CodeRacer quality).
 */
import * as THREE from 'three';
import { getTrackManifest } from '../../racing/mk-tracks/TrackAssetManifest.js';
import { getTrackBackdrop } from '../../racing/mk-tracks/TrackBackdropManifest.js';
import {
  loadTrackAsset,
  cloneForInstancing,
  normalizeObjectHeight,
} from '../../racing/mk-tracks/TrackAssetLoader.js';
import {
  buildSkyExplorersTreehouse,
  buildPremiumWindmill,
  buildRainbowArc,
} from '../../racing/mk-tracks/MK8TrackQualityKit.js';
import { buildFloatingRockSpire } from './AerialIslandKit.js';

const BACKDROP_TRACKS = {
  drone_canyon: '/assets/backgrounds/tracks/cloud_kingdom_loop.png',
  cloud_race: '/assets/backgrounds/tracks/cloud_kingdom_loop.png',
  jet_stunt: '/assets/backgrounds/tracks/sunset_coast_reference.png',
  canyon_flight: '/assets/backgrounds/tracks/sky_garden_reference.png',
  space_orbit: '/assets/backgrounds/tracks/stardust_galaxy_reference.png',
  storm_cloud: '/assets/backgrounds/tracks/thunder_ridge_01.png',
  typhoon: '/assets/backgrounds/tracks/coral_bay_sprint.png',
  warp_gate: '/assets/backgrounds/tracks/cosmic_ring_rally.png',
};

function loadBackdropTexture(url) {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      },
      undefined,
      () => resolve(null),
    );
  });
}

/** Illustrated PNG layers + god rays — fills the view like cup-track backdrops. */
export async function installAerialCinematicAtmosphere(scene, bounds, recipe, trackId) {
  const g = new THREE.Group();
  g.name = 'AerialCinematicAtmosphere';
  scene.add(g);

  if (recipe.goldenHour) {
    scene.userData.aerialGoldenHour = true;
    // God-ray planes stack with bloom and read as a white pillar down the course — skip them.
  }

  const arenaType = recipe.id || trackId;
  const backdropCfg = getTrackBackdrop(trackId);
  const png = !recipe.goldenHour
    ? (BACKDROP_TRACKS[arenaType] || backdropCfg?.sky)
    : null;
  if (png) {
    const tex = await loadBackdropTexture(png);
    if (tex) {
      const span = bounds.spanZ + bounds.spanX;
      const w = span * 0.95;
      const h = w * 0.42;
      const backZ = bounds.camMinZ ?? (bounds.cz - bounds.spanZ * 0.55);
      const routeY = scene.userData.spawnAltitude ?? scene.userData.spawnY ?? 24;
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        fog: true,
        depthWrite: false,
        transparent: true,
        opacity: 0.28,
      });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      plane.position.set(bounds.cx, routeY * 0.35 + 8, backZ);
      plane.rotation.y = Math.PI;
      plane.name = 'aerial-backdrop-0';
      plane.renderOrder = -20;
      g.add(plane);
    }
  }

  return g;
}

/** Far silhouette mesas for depth — three receding layers with warm tints. */
export function scatterDistantSilhouetteIslands(scene, curve, bounds) {
  const g = new THREE.Group();
  g.name = 'AerialDistantSilhouettes';
  scene.add(g);

  const layers = [
    { count: 8, off: 85, yBase: -24, scale: 0.6, opacity: 0.38, color: 0x6a4830 },
    { count: 10, off: 120, yBase: -32, scale: 0.45, opacity: 0.24, color: 0x5a3f28 },
    { count: 12, off: 165, yBase: -40, scale: 0.35, opacity: 0.14, color: 0x4a3520 },
    { count: 8, off: 210, yBase: -48, scale: 0.28, opacity: 0.08, color: 0x3a2818 },
  ];

  layers.forEach((layer, li) => {
    for (let i = 0; i < layer.count; i++) {
      const t = (i + 0.3) / (layer.count + 0.5);
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t).normalize();
      const yaw = Math.atan2(tan.x, tan.z);
      const side = i % 2 === 0 ? -1 : 1;
      const lx = p.x + Math.cos(yaw) * side * (layer.off + (i % 3) * 14);
      const lz = p.z - Math.sin(yaw) * side * (layer.off + (i % 4) * 12);

      const spire = buildFloatingRockSpire(layer.scale, false);
      spire.traverse((o) => {
        if (o.isMesh && o.material) {
          o.material = new THREE.MeshBasicMaterial({
            color: layer.color,
            transparent: true,
            opacity: layer.opacity,
            fog: true,
            depthWrite: false,
          });
        }
      });
      spire.position.set(lx, p.y + layer.yBase + li * 2, lz);
      spire.rotation.y = yaw + side * 0.5;
      g.add(spire);
    }
  });
}

/** Cup-track hero props on floor vista (treehouse, windmill, rainbow). */
export function installAerialCupLandmarks(world, bounds, trackId, finishT = 0) {
  if (trackId !== 'cloud_citadel_01') return;

  const treehouse = buildSkyExplorersTreehouse();
  treehouse.scale.setScalar(1.15);
  treehouse.position.set(bounds.cx - bounds.spanX * 0.35, 2, bounds.cz - bounds.spanZ * 0.2);
  world.add(treehouse);

  const windmill = buildPremiumWindmill();
  windmill.position.set(bounds.cx + bounds.spanX * 0.38, 0, bounds.cz - bounds.spanZ * 0.15);
  world.add(windmill);

  const rainbow = buildRainbowArc(38, 14);
  rainbow.position.set(bounds.cx + bounds.spanX * 0.25, 8, bounds.cz - bounds.spanZ * 0.35);
  world.add(rainbow);
}

/** Async glTF castle towers + cloud rocks on floating islands. */
export async function enrichAerialFloatingIslands(scene, trackId = 'cloud_citadel_01') {
  const manifest = getTrackManifest(trackId);
  const islands = scene.getObjectByName('AerialFloatingIslands');
  if (!manifest || !islands) return 0;

  const towerFile = manifest.buildings?.castle_tower || manifest.assets?.castle_tower;
  const rockFile = manifest.assets?.cloud_rock;
  const towerBFile = manifest.assets?.castle_tower_b;

  const towerGltf = towerFile
    ? await loadTrackAsset(`${manifest.base}/${towerFile}`)
    : null;
  const towerBGltf = towerBFile
    ? await loadTrackAsset(`${manifest.base}/${towerBFile}`)
    : null;
  const rockGltf = rockFile
    ? await loadTrackAsset(`${manifest.base}/${rockFile}`)
    : null;

  let placed = 0;

  islands.children.forEach((island, i) => {
    const isHero = island.name === 'aerial-citadel-island' || island.userData.hero;

    if (rockGltf) {
      const rock = cloneForInstancing(rockGltf);
      if (rock) {
        normalizeObjectHeight(rock, isHero ? 14 : 9);
        rock.position.y = isHero ? 28 : 14;
        rock.name = `gltf-cloud-rock-${i}`;
        island.add(rock);
        placed++;
      }
    }

    if (isHero && towerGltf) {
      const towerCount = 2 + (i % 2);
      for (let t = 0; t < towerCount; t++) {
        const src = (t % 2 && towerBGltf) ? towerBGltf : towerGltf;
        const tower = cloneForInstancing(src);
        if (!tower) continue;
        normalizeObjectHeight(tower, 20 + (t % 2) * 6);
        const a = (t / towerCount) * Math.PI * 2 + i * 0.4;
        const r = 5 + (t % 2) * 2;
        tower.position.set(Math.cos(a) * r, isHero ? 36 : 18, Math.sin(a) * r);
        tower.rotation.y = a + Math.PI;
        tower.name = `gltf-castle-tower-${i}-${t}`;
        island.add(tower);
        placed++;
      }
    }
  });

  console.log('[AerialGltf] island enrich', trackId, { placed, islands: islands.children.length });
  return placed;
}
