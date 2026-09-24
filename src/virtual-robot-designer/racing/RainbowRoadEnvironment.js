/**
 * RainbowRoadEnvironment.js — Cosmic nebula sky, ringed planet, asteroids (RC7).
 */
import * as THREE from 'three';

function createSpaceSkyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = normalize(wp.xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vWorld;
      float hash(vec3 p) {
        return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
      }
      float hash2(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec3 p) {
        return hash(p) * 0.5 + hash(p * 2.1) * 0.3 + hash(p * 4.3) * 0.2;
      }
      void main() {
        vec3 dir = normalize(vWorld);

        // Near-black deep-space base — truly dark
        vec3 col = vec3(0.003, 0.001, 0.010);

        // Blue-teal nebula patches
        float n1 = smoothstep(0.50, 0.82, noise(dir * 2.4 + time * 0.010));
        col += vec3(0.04, 0.12, 0.42) * n1 * 0.28;

        // Magenta / purple nebula — MK Rainbow Road vibe
        float n2 = smoothstep(0.48, 0.85, noise(dir * 3.2 - time * 0.008));
        col += vec3(0.32, 0.04, 0.42) * n2 * 0.32;

        // Sparse crisp stars — few but bright
        float star1 = step(0.993, hash(floor(dir * 180.0)));
        float star2 = step(0.997, hash(floor(dir * 320.0)));
        float twinkle1 = 0.5 + 0.5 * sin(time * 3.0 + hash(dir) * 22.0);
        float twinkle2 = 0.6 + 0.4 * sin(time * 4.8 + hash(dir * 1.5) * 16.0);
        col += vec3(0.9, 0.95, 1.0) * star1 * twinkle1 * 0.70;
        col += vec3(0.7, 0.80, 1.0) * star2 * twinkle2 * 0.45;

        // Very low hard cap — background MUST stay dark below bloom threshold (0.40)
        // so bloom only fires on the emissive neon track, not the sky.
        col = min(col, vec3(0.18));

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

export function buildSpaceSkybox(scene, radius = 85, { segments, worldLod = 1 } = {}) {
  // Use static sky for low AND medium tiers — the animated shader is expensive
  const useStaticSky = worldLod < 0.85;
  const wSeg = segments?.width ?? (useStaticSky ? 16 : 40);
  const hSeg = segments?.height ?? (useStaticSky ? 12 : 28);

  // Low/Medium LOD: static dark sky — no per-pixel noise shader on full-screen sphere.
  if (useStaticSky) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x020010, side: THREE.BackSide, depthWrite: false,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(radius, wSeg, hSeg), mat);
    sky.frustumCulled = false;
    scene.add(sky);
    scene.background = new THREE.Color(0x020010);
    scene.fog = null;
    return { mesh: sky, update: () => {} };
  }

  const mat = createSpaceSkyMaterial();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(radius, wSeg, hSeg), mat);
  sky.frustumCulled = false;
  scene.add(sky);
  scene.background = new THREE.Color(0x010007);
  // No fog — MeshBasic tiles + FogExp2 was wiping the road to black mid-lap
  scene.fog = null;
  return { mesh: sky, update: (t) => { mat.uniforms.time.value = t; } };
}

export function buildRingedPlanet(scene, {
  x = -48, y = 18, z = -85, radius = 32, ringRadius = 48,
} = {}) {
  const isEarth = ringRadius <= 0;
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');

  if (isEarth) {
    // Earth-like blue oceans + white cloud swirls (MK Rainbow Road reference)
    const ocean = ctx.createLinearGradient(0, 0, 0, 256);
    ocean.addColorStop(0.0, '#0a2a6a');
    ocean.addColorStop(0.35, '#1a5aaa');
    ocean.addColorStop(0.55, '#2288cc');
    ocean.addColorStop(0.75, '#1a5aaa');
    ocean.addColorStop(1.0, '#0a3060');
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, 512, 256);
    // Land masses
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#2a8844';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.ellipse(80 + i * 55, 90 + (i % 3) * 40, 35 + Math.random() * 25, 18 + Math.random() * 12, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cloud swirls
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * 512, Math.random() * 256, 30 + Math.random() * 40, 8 + Math.random() * 10, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    const g = ctx.createLinearGradient(0, 0, 512, 256);
    g.addColorStop(0.0,  '#1a0840');
    g.addColorStop(0.25, '#3d1470');
    g.addColorStop(0.50, '#5a1a8a');
    g.addColorStop(0.70, '#3a0e60');
    g.addColorStop(1.0,  '#150630');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 256);
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 14; i++) {
      const y2 = (i / 14) * 256;
      ctx.fillStyle = i % 2 === 0 ? '#8833cc' : '#220055';
      ctx.fillRect(0, y2, 512, 256 / 14);
    }
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#cc88ff';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random() * 512, Math.random() * 256, 50 + Math.random() * 40, 14, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 32),
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: isEarth ? 0.65 : 0.80,
      metalness: 0.05,
      emissive: isEarth ? 0x113366 : 0x220044,
      emissiveIntensity: isEarth ? 0.08 : 0.25,
    }),
  );
  planet.position.set(x, y, z);
  scene.add(planet);

  let ring = null;
  let innerRing = null;
  if (!isEarth) {
    const ringGeo = new THREE.RingGeometry(ringRadius * 0.85, ringRadius * 1.25, 80);
    ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshStandardMaterial({
        color: 0xffcc44,
        emissive: 0xffaa00,
        emissiveIntensity: 0.55,
        transparent: true,
        opacity: 0.70,
        roughness: 0.4,
        metalness: 0.3,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = Math.PI / 2.2;
    ring.position.set(x, y, z);
    scene.add(ring);

    innerRing = new THREE.Mesh(
      new THREE.RingGeometry(ringRadius * 0.90, ringRadius * 1.05, 80),
      new THREE.MeshBasicMaterial({
        color: 0xffdd88, transparent: true, opacity: 0.45,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      }),
    );
    innerRing.rotation.x = Math.PI / 2.2;
    innerRing.position.set(x, y, z);
    scene.add(innerRing);
  }

  // Atmospheric glow — bright white rim for Earth, purple for other planets
  const atmoColor = isEarth ? 0xaaddff : 0x9933ff;
  const atmoOpacity = isEarth ? 0.35 : 0.18;
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.12, 32, 24),
    new THREE.MeshBasicMaterial({
      color: atmoColor, transparent: true, opacity: atmoOpacity, depthWrite: false,
    }),
  );
  atmo.position.set(x, y, z);
  scene.add(atmo);

  // Extra bright rim for Earth (fresnel-like horizon glow)
  if (isEarth) {
    const rim = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.18, 32, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.12,
        depthWrite: false, side: THREE.BackSide,
      }),
    );
    rim.position.set(x, y, z);
    scene.add(rim);
  }

  return {
    planet, ring, atmo,
    update: (dt) => { planet.rotation.y += dt * 0.010; },
  };
}

export function buildPlanet(scene, opts = {}) {
  return buildRingedPlanet(scene, opts);
}

export function buildMoon(scene, { x = 55, y = 12, z = -60, radius = 5 } = {}) {
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 24, 16),
    new THREE.MeshStandardMaterial({ color: 0xccccdd, roughness: 1, emissive: 0x444466, emissiveIntensity: 0.2 }),
  );
  moon.position.set(x, y, z);
  scene.add(moon);
  return moon;
}

export function buildAsteroidField(scene, count = 28) {
  const group = new THREE.Group();
  group.name = 'asteroid-field';
  // Shared material — dark grey rocky surface
  const matA = new THREE.MeshStandardMaterial({ color: 0x4a3d4f, roughness: 0.96, metalness: 0.04 });
  const matB = new THREE.MeshStandardMaterial({ color: 0x352840, roughness: 0.98, metalness: 0.02 });

  for (let i = 0; i < count; i++) {
    const r = 0.8 + Math.random() * 2.2;  // smaller — max 3 units radius
    const geo = new THREE.DodecahedronGeometry(r, 0);
    const ast = new THREE.Mesh(geo, (i % 2 === 0 ? matA : matB));
    // Push them further out so they read as background depth, not obstacles
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.8;
    const dist  = 82 + Math.random() * 48;
    ast.position.set(
      Math.cos(angle) * dist,
      -8 + Math.random() * 40,
      Math.sin(angle) * dist,
    );
    ast.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    ast.userData.spin = (Math.random() - 0.5) * 0.35;
    ast.castShadow = false;
    ast.receiveShadow = false;
    group.add(ast);
  }
  scene.add(group);
  return {
    group,
    update: (dt) => {
      group.children.forEach((a) => { a.rotation.y += (a.userData.spin || 0.08) * dt; });
    },
  };
}

export function buildStarParticles(scene, count = 120) {
  // Fewer, subtler stars — reduces the "grainy" white-speckle look
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 140;
    pos[i * 3 + 1] = Math.random() * 55 + 5;   // push stars above the track
    pos[i * 3 + 2] = (Math.random() - 0.5) * 140;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.22, transparent: true, opacity: 0.45,
    sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return {
    points: pts,
    material: mat,
    update: (t) => { mat.opacity = 0.35 + Math.sin(t * 2.5) * 0.1; },
  };
}

export function buildNebulaSprites(scene) {
  const group = new THREE.Group();
  // Push sprites far back and make them large but very faint —
  // they colour the background without washing it out.
  const configs = [
    { color: 0x2244aa, pos: [-55, 30, -130], scale: 90 },
    { color: 0x441188, pos: [60, 35, -110], scale: 80 },
    { color: 0x004466, pos: [-20, 10, -100], scale: 70 },
  ];
  configs.forEach(({ color, pos, scale }) => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,0.30)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.10)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, color, transparent: true, opacity: 0.28,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    spr.position.set(...pos);
    spr.scale.set(scale, scale * 0.65, 1);
    group.add(spr);
  });
  scene.add(group);
  return group;
}

export function buildRainbowRoadLighting(scene) {
  scene.add(new THREE.AmbientLight(0x665588, 0.72));
  scene.add(new THREE.HemisphereLight(0xcc88ff, 0x221144, 0.75));
  const sun = new THREE.DirectionalLight(0xfff8ff, 1.25);
  sun.position.set(40, 70, -20);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x6688ff, 0.45);
  fill.position.set(-25, 35, 30);
  scene.add(fill);
  const rim = new THREE.PointLight(0xff88cc, 0.8, 120);
  rim.position.set(0, 25, 0);
  scene.add(rim);
  return { sun, fill, rim };
}

export function buildRainbowRoadEnvironment(scene) {
  const sky = buildSpaceSkybox(scene);
  const planet = buildRingedPlanet(scene);
  const moon = buildMoon(scene);
  const stars = buildStarParticles(scene);
  const nebula = buildNebulaSprites(scene);
  const asteroids = buildAsteroidField(scene);
  const lights = buildRainbowRoadLighting(scene);

  return {
    sky, planet, moon, stars, nebula, asteroids, lights,
    update(time, dt) {
      sky.update(time);
      planet.update(dt);
      stars.update(time);
      asteroids.update(dt);
    },
  };
}
