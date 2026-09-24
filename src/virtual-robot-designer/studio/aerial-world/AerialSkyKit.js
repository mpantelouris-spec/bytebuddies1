/**
 * AerialSkyKit — rich sky dome, volumetric clouds, golden-hour sun.
 */
import * as THREE from 'three';
import { getTrackSkyPreset, installTrackSky } from '../../racing/mk-tracks/TrackSkyKit.js';

function hex(c) {
  return new THREE.Color(c);
}

export function installAerialSky(scene, recipe, bounds = {}) {
  const cx = bounds.cx ?? 0;
  const cz = bounds.cz ?? 0;
  const sky = recipe.sky || {};
  if (sky.preset) {
    installTrackSky(scene, { cx, cz, spanX: 200, spanZ: recipe.spline?.length || 200 }, sky.preset);
    if (recipe.stormClouds) addStormCloudVolumes(scene, cx, cz);
    if (recipe.parallaxClouds) addParallaxCloudLayers(scene, cx, cz);
    return;
  }

  const top = hex(sky.top || '#87ceeb');
  const mid = hex(sky.mid || '#b0d8f8');
  const hor = hex(sky.horizon || '#e8f4ff');
  const fogCol = sky.fog || sky.horizon || '#c8e8ff';
  scene.background = hor.clone();
  scene.fog = new THREE.Fog(fogCol, sky.near ?? 80, sky.far ?? 260);

  const r = 900;
  const geo = new THREE.SphereGeometry(r, 48, 28);
  const colors = [];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = Math.max(0, Math.min(1, (y / r + 1) * 0.5));
    const c = t < 0.45 ? hor.clone().lerp(mid, t / 0.45) : mid.clone().lerp(top, (t - 0.45) / 0.55);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const old = scene.getObjectByName('aerial-sky-dome');
  if (old) old.parent?.remove(old);
  const dome = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }),
  );
  dome.name = 'aerial-sky-dome';
  dome.renderOrder = -30;
  dome.frustumCulled = false;
  dome.position.set(cx, 0, cz);
  scene.add(dome);
  scene.userData.customSky = true;

  if (recipe.parallaxClouds) addParallaxCloudLayers(scene, cx, cz);
  if (recipe.stormClouds) addStormCloudVolumes(scene, cx, cz);
  if (recipe.starfieldAbove) addAerialStarfield(scene, cx, cz, recipe.starfieldAbove);
}

export function installGoldenHourSky(scene, bounds = {}, sky = {}) {
  const cx = bounds.cx ?? 0;
  const cz = bounds.cz ?? 0;
  const top = hex(sky.top || '#1e3a5f');
  const mid = hex(sky.mid || '#3478b8');
  const hor = hex(sky.horizon || '#ff9a4a');
  const warmPeach = sky.warmPeach !== false;
  const peach = warmPeach ? hex('#ffb86a') : hor.clone().lerp(mid, 0.35);
  scene.background = top.clone();
  scene.fog = new THREE.Fog(sky.fog || '#d7b78f', sky.near ?? 95, sky.far ?? 360);

  const r = 900;
  const geo = new THREE.SphereGeometry(r, 48, 28);
  const colors = [];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = Math.max(0, Math.min(1, (y / r + 1) * 0.5));
    let c;
    if (t < 0.2) c = hor.clone().lerp(peach, t / 0.2);
    else if (t < 0.5) c = peach.clone().lerp(mid, (t - 0.2) / 0.3);
    else c = mid.clone().lerp(top, (t - 0.5) / 0.5);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const old = scene.getObjectByName('aerial-sky-dome');
  if (old) old.parent?.remove(old);
  const dome = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }),
  );
  dome.name = 'aerial-sky-dome';
  dome.renderOrder = -30;
  dome.position.set(cx, 0, cz);
  scene.add(dome);
  scene.userData.customSky = true;
  scene.userData.expMood = 1.02;

  // Matching image-based reflections keep metal rings and aircraft surfaces
  // blue on top and sunset-warm underneath instead of flat beige.
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 128;
  envCanvas.height = 64;
  const envCtx = envCanvas.getContext('2d');
  const envGradient = envCtx.createLinearGradient(0, 0, 0, 64);
  envGradient.addColorStop(0, sky.top || '#3478b8');
  envGradient.addColorStop(0.58, sky.mid || '#87b9d6');
  envGradient.addColorStop(1, sky.horizon || '#ffd39a');
  envCtx.fillStyle = envGradient;
  envCtx.fillRect(0, 0, 128, 64);
  const environment = new THREE.CanvasTexture(envCanvas);
  if (THREE.SRGBColorSpace) environment.colorSpace = THREE.SRGBColorSpace;
  environment.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = environment;
  scene.environmentIntensity = 0.45;
  scene.userData.skipSoftEnvironment = true;

  const sunColor = warmPeach ? 0xffd6a3 : top.getHex();
  const sun = new THREE.DirectionalLight(sunColor, warmPeach ? 0.72 : 0.58);
  sun.position.set(-100, 50, 90);
  sun.name = 'aerial-sun';
  scene.add(sun);

  // Subtle sun disc far off-axis
  const sunGlow = new THREE.Mesh(
    new THREE.CircleGeometry(10, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffe088,
      transparent: true,
      opacity: 0.09,
      fog: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  sunGlow.position.set(-250, 42, 180);
  sunGlow.name = 'aerial-sun-glow';
  scene.add(sunGlow);

  // Warm ambient
  const amb = new THREE.AmbientLight(0xc8dcf0, 0.22);
  amb.name = 'aerial-ambient';
  scene.add(amb);
  const hemi = new THREE.HemisphereLight(0x9fd4f2, 0x4a4038, 0.3);
  hemi.name = 'aerial-hemi';
  scene.add(hemi);

  const fill = new THREE.DirectionalLight(warmPeach ? 0xffb46b : hor.getHex(), warmPeach ? 0.12 : 0.08);
  fill.position.set(40, -20, -30);
  fill.name = 'aerial-fill';
  scene.add(fill);
}

/** Vista-locked sky — no golden peach injection (helicopter blue, stealth night, neon twilight, etc.). */
export function installThemedAerialSky(scene, recipe, bounds = {}) {
  installAerialSky(scene, recipe, bounds);
}

export function addParallaxCloudLayers(scene, cx, cz) {
  const g = new THREE.Group();
  g.name = 'aerial-parallax-clouds';
  // Upper-sky only — low layers overlapped the flight path and read as orange bubbles.
  const layers = [
    { y: 28, count: 5, scale: 16, spread: 160, color: 0xffead2 },
    { y: 38, count: 4, scale: 14, spread: 170, color: 0xfff7ed },
    { y: 48, count: 3, scale: 12, spread: 180, color: 0xffffff },
  ];
  layers.forEach((layer, li) => {
    const layerG = new THREE.Group();
    layerG.userData.driftPhase = li * 1.7;
    for (let i = 0; i < layer.count; i++) {
      const cloud = new THREE.Group();
      const puffCount = 3 + (i % 2);
      for (let p = 0; p < puffCount; p++) {
        const r = layer.scale * (0.2 + Math.random() * 0.22);
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(r, 14, 10),
          new THREE.MeshBasicMaterial({
            color: layer.color,
            transparent: true,
            opacity: 0.14 + Math.random() * 0.08,
            depthWrite: false,
            fog: true,
          }),
        );
        puff.position.set(
          (p - puffCount / 2) * r * 0.75,
          (Math.random() - 0.5) * r * 0.25,
          (Math.random() - 0.5) * r * 0.5,
        );
        puff.scale.set(1.2 + Math.random() * 0.25, 0.45 + Math.random() * 0.2, 1.1 + Math.random() * 0.2);
        cloud.add(puff);
      }
      cloud.position.set(
        (Math.random() - 0.5) * layer.spread,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * layer.spread * 0.55 - 70,
      );
      layerG.add(cloud);
    }
    layerG.position.set(cx + (li - 1) * 12, layer.y, cz - 30);
    g.add(layerG);
  });
  scene.add(g);
}

function addStormCloudVolumes(scene, cx, cz) {
  const g = new THREE.Group();
  g.name = 'aerial-storm-clouds';
  for (let i = 0; i < 8; i++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 6; j++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(10 + Math.random() * 10, 12, 8),
        new THREE.MeshBasicMaterial({
          color: j < 2 ? 0x5a6678 : 0x4a5568,
          transparent: true, opacity: 0.45 + Math.random() * 0.15,
          depthWrite: false, fog: false,
        }),
      );
      puff.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 12,
      );
      puff.scale.set(1 + Math.random() * 0.4, 0.5 + Math.random() * 0.3, 1 + Math.random() * 0.3);
      cloud.add(puff);
    }
    const angle = (i / 8) * Math.PI * 2;
    cloud.position.set(cx + Math.cos(angle) * 60, 32 + Math.random() * 18, cz + Math.sin(angle) * 60 - 40);
    g.add(cloud);
  }
  scene.add(g);
}

function addAerialStarfield(scene, cx, cz, minY) {
  const count = 450;
  const pos = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = cx + (Math.random() - 0.5) * 500;
    pos[i * 3 + 1] = minY + Math.random() * 150;
    pos[i * 3 + 2] = cz + (Math.random() - 0.5) * 500 - 80;
    sizes[i] = 0.5 + Math.random() * 1.0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.9, transparent: true, opacity: 0.85, fog: false, depthWrite: false,
    sizeAttenuation: true,
  }));
  stars.name = 'aerial-starfield';
  scene.add(stars);
}

export function animateAerialSky(scene, time) {
  const clouds = scene.getObjectByName('aerial-parallax-clouds');
  if (clouds) {
    clouds.children.forEach((layer) => {
      const ph = layer.userData.driftPhase ?? 0;
      layer.position.x += Math.sin(time * 0.06 + ph) * 0.012;
      layer.position.z += Math.cos(time * 0.04 + ph) * 0.008;
    });
  }
  const storm = scene.getObjectByName('aerial-storm-wall');
  if (storm) storm.rotation.y = time * 0.03;
}
