/**
 * PremiumArenas.js — ByteBuddies Premium Zone Builders
 *
 * Each exported function wires into buildSmartArena(scene, arenaType) in
 * LiveLabPage.jsx and populates the four engine hooks the tick-loop reads:
 *
 *   scene.userData.finishZone   {x,z,radius}              → triggers win
 *   scene.userData.collectibles [{mesh,pos,radius,value,collected}] → score
 *   scene.userData.obstacles    [{mesh,radius,check3d}]   → stop robot
 *   scene.userData.movers       [{update:(t,dt,rs)=>{}}]  → animations
 */
import * as THREE from 'three';

// ─── ENGINE HOOKS ────────────────────────────────────────────────────────────

function _mover(scene, fn) {
  (scene.userData.movers = scene.userData.movers || []).push({ update: fn });
}
function _finishZone(scene, x, z, radius = 3.5) {
  scene.userData.finishZone = { x, z, radius };
}
function _regCollectible(scene, mesh, x, y, z, value = 10, radius = 0.9) {
  (scene.userData.collectibles = scene.userData.collectibles || []).push(
    { mesh, pos: { x, y, z }, radius, value, collected: false }
  );
}
function _regObstacle(scene, mesh, radius = 1.0, check3d = false) {
  const obs = { mesh, radius, check3d };
  (scene.userData.obstacles = scene.userData.obstacles || []).push(obs);
  return obs;
}

/** Robot campaign missions supply their own collectibles/goals via MissionArenaBuilder */
function _missionMode(scene, challenge) {
  return !!(challenge?.isRobotMission || scene.userData?.missionChallenge?.isRobotMission);
}

function _initMissionShell(scene) {
  scene.userData.collectibles = [];
  scene.userData.obstacles = [];
  delete scene.userData.finishZone;
}

// ─── SHARED VISUAL UTILITIES ─────────────────────────────────────────────────

/** Sky sphere with a vertical gradient of 2–3 colour stops. */
function _makeSky(scene, topHex, midHex, botHex) {
  const c = document.createElement('canvas');
  c.width = 2; c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0,    '#' + topHex.toString(16).padStart(6, '0'));
  g.addColorStop(0.5,  '#' + (midHex ?? topHex).toString(16).padStart(6, '0'));
  g.addColorStop(1,    '#' + botHex.toString(16).padStart(6, '0'));
  ctx.fillStyle = g; ctx.fillRect(0, 0, 2, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
}

/** Low-poly coloured ground plane with slight vertex displacement. */
function _makeTerrain(scene, baseHex, variation, maxY) {
  const segs = 28;
  const geo = new THREE.PlaneGeometry(110, 110, segs, segs);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(pos.getX(i)) < 54 && Math.abs(pos.getY(i)) < 54) {
      pos.setZ(i, (Math.random() - 0.5) * maxY);
    }
  }
  geo.computeVertexNormals();
  const nonIdx = geo.toNonIndexed();
  nonIdx.computeVertexNormals();
  const pArr = nonIdx.attributes.position.array;
  const colors = new Float32Array(pArr.length);
  const base = new THREE.Color(baseHex);
  for (let f = 0; f < pArr.length / 9; f++) {
    const l = base.clone();
    l.offsetHSL(0, 0, (Math.random() - 0.5) * variation);
    for (let v = 0; v < 3; v++) {
      colors[(f * 9) + v * 3]     = l.r;
      colors[(f * 9) + v * 3 + 1] = l.g;
      colors[(f * 9) + v * 3 + 2] = l.b;
    }
  }
  nonIdx.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const mesh = new THREE.Mesh(nonIdx, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

/** Standard zone lighting setup. */
function _lighting(scene, cfg) {
  scene.add(new THREE.AmbientLight(cfg.ambient.color, cfg.ambient.intensity));
  const hemi = new THREE.HemisphereLight(cfg.hemi.skyColor, cfg.hemi.groundColor, cfg.hemi.intensity);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(cfg.sun.color, cfg.sun.intensity);
  sun.position.set(cfg.sun.pos.x, cfg.sun.pos.y, cfg.sun.pos.z);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(1024);
  sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
  sun.shadow.camera.top  = 30;  sun.shadow.camera.bottom = -30;
  scene.add(sun);
  (cfg.pointLights || []).forEach(pl => {
    const light = new THREE.PointLight(pl.color, pl.intensity, pl.distance);
    light.position.set(pl.pos.x, pl.pos.y, pl.pos.z);
    scene.add(light);
    if (pl.flicker) {
      const base = pl.intensity;
      _mover(scene, t => { light.intensity = base + Math.sin(t * 7.3 + pl.pos.z) * base * 0.35; });
    }
  });
}

/** Floating ambient particle field (bioluminescence, embers, dust, etc.) */
function _ambientParticles(scene, cfg) {
  if (!cfg || cfg.count < 1) return;
  const count = cfg.count;
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 40;
    pos[i*3+1] = Math.random() * 12;
    pos[i*3+2] = (Math.random() * 36) - 30;
    vel[i*3]   = (Math.random() - 0.5) * cfg.speed;
    vel[i*3+1] = (Math.random() * 0.3 + 0.1) * cfg.speed;
    vel[i*3+2] = (Math.random() - 0.5) * cfg.speed * 0.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: cfg.color, size: cfg.size, transparent: true,
    opacity: cfg.opacity, blending: THREE.AdditiveBlending, depthWrite: false,
    sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  _mover(scene, (t, dt) => {
    const a = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      a[i*3]   += vel[i*3]   * dt;
      a[i*3+1] += vel[i*3+1] * dt;
      a[i*3+2] += vel[i*3+2] * dt;
      if (a[i*3+1] > 14) { a[i*3+1] = 0; }
      if (Math.abs(a[i*3]) > 20)   a[i*3]   *= -0.9;
      if (Math.abs(a[i*3+2]) > 28) a[i*3+2] *= -0.9;
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = cfg.opacity * (0.7 + 0.3 * Math.sin(t * 1.4));
  });
}

// ─── GOAL BEACON SYSTEM ──────────────────────────────────────────────────────
/**
 * Builds the full multi-ring goal beacon — visible from the entire map.
 * Three spinning rings + pulsing orb + sky beam + drifting particles + label.
 * Registers finishZone so reaching it triggers the win screen.
 */
function _buildGoalBeacon(scene, x, z, col1, col2, label) {
  const G = new THREE.Group();
  G.position.set(x, 1.6, z);
  scene.add(G);

  // Outer ring — slow Y rotation
  const r1Mat = new THREE.MeshStandardMaterial({
    color: col1, emissive: col1, emissiveIntensity: 1.6, metalness: 0.7, roughness: 0.1,
  });
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.14, 16, 80), r1Mat);
  G.add(r1);

  // Middle ring — X axis, counter-spin
  const r2Mat = new THREE.MeshStandardMaterial({
    color: col2, emissive: col2, emissiveIntensity: 2.2,
  });
  const r2 = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.09, 16, 80), r2Mat);
  G.add(r2);

  // Inner ring — fast Y spin
  const r3Mat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.8,
  });
  const r3 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.06, 16, 80), r3Mat);
  G.add(r3);

  // Centre orb
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: col1, emissiveIntensity: 3.0, transparent: true, opacity: 0.9,
  });
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), orbMat);
  G.add(orb);

  // Sky beam — tall thin column, visible from entire map
  const beamMat = new THREE.MeshBasicMaterial({
    color: col1, transparent: true, opacity: 0.14,
    side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 44, 6, 1, true), beamMat);
  beam.position.set(x, 1.6 + 22, z);   // independent of G group so it doesn't spin
  scene.add(beam);

  // Ground ring landing pad
  const padMat = new THREE.MeshBasicMaterial({
    color: col1, transparent: true, opacity: 0.35,
    depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const pad = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.1, 48), padMat);
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(x, 0.025, z);
  scene.add(pad);

  // Outer glow disc
  const discMat = new THREE.MeshBasicMaterial({
    color: col1, transparent: true, opacity: 0.1,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(3.2, 32), discMat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(x, 0.01, z);
  scene.add(disc);

  // Point lights
  const pl1 = new THREE.PointLight(col1, 4.5, 16);
  pl1.position.set(x, 1.6, z);
  scene.add(pl1);
  const pl2 = new THREE.PointLight(col2, 1.8, 28);
  pl2.position.set(x, 1.6, z);
  scene.add(pl2);

  // Billboard label (canvas texture, faces +Z so it's readable from robot start)
  const cnv = document.createElement('canvas');
  cnv.width = 320; cnv.height = 80;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.68)';
  ctx.beginPath();
  ctx.roundRect(0, 0, 320, 80, 14);
  ctx.fill();
  const hexStr = '#' + col1.toString(16).padStart(6, '0');
  ctx.strokeStyle = hexStr; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(1, 1, 318, 78, 13); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = hexStr; ctx.shadowBlur = 12;
  ctx.fillText(label, 160, 40);
  const lblTex = new THREE.CanvasTexture(cnv);
  const lbl = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.8),
    new THREE.MeshBasicMaterial({ map: lblTex, transparent: true, depthWrite: false }),
  );
  lbl.position.set(x, 1.6 + 3.6, z);
  scene.add(lbl);

  // Upward-drift particles
  const PC = 180;
  const pPos = new Float32Array(PC * 3);
  const pVy  = new Float32Array(PC);
  const pVx  = new Float32Array(PC);
  const pVz  = new Float32Array(PC);
  for (let i = 0; i < PC; i++) {
    const ang = Math.random() * Math.PI * 2;
    const r   = Math.random() * 0.65;
    pPos[i*3]   = x + Math.cos(ang) * r;
    pPos[i*3+1] = 1.6 + Math.random() * 8;
    pPos[i*3+2] = z + Math.sin(ang) * r;
    pVy[i] = 0.5 + Math.random() * 0.9;
    pVx[i] = (Math.random() - 0.5) * 0.12;
    pVz[i] = (Math.random() - 0.5) * 0.12;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: col1, size: 0.1, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  scene.add(new THREE.Points(pGeo, pMat));

  // Animate everything
  _mover(scene, (t, dt) => {
    r1.rotation.y += 0.55 * dt;
    r2.rotation.x -= 0.9  * dt;
    r3.rotation.y += 1.8  * dt;
    const pulse = 0.95 + Math.sin(t * 3.2) * 0.08;
    orb.scale.setScalar(pulse);
    pl1.intensity = 3.5 + Math.sin(t * 3.8) * 0.9;
    // Ground ring pulse
    padMat.opacity = 0.22 + Math.sin(t * 2.5) * 0.13;
    pad.scale.setScalar(0.97 + Math.sin(t * 2.5) * 0.04);
    beamMat.opacity = 0.11 + Math.sin(t * 1.4) * 0.05;
    // Particle drift
    const a = pGeo.attributes.position.array;
    for (let i = 0; i < PC; i++) {
      a[i*3]   += pVx[i] * dt;
      a[i*3+1] += pVy[i] * dt;
      a[i*3+2] += pVz[i] * dt;
      if (a[i*3+1] > 1.6 + 9) {
        const ang = Math.random() * Math.PI * 2;
        const r2a = Math.random() * 0.65;
        a[i*3]   = x + Math.cos(ang) * r2a;
        a[i*3+1] = 1.6;
        a[i*3+2] = z + Math.sin(ang) * r2a;
      }
    }
    pGeo.attributes.position.needsUpdate = true;
  });

  _finishZone(scene, x, z, 3.5);
}

// ─── COLLECTIBLE BUILDERS ─────────────────────────────────────────────────────

/**
 * Builds a glowing, spinning, bobbing collectible and registers it with the engine.
 * type controls the geometry — all types share float + spin animation.
 */
function _buildCollectible(scene, type, x, y, z, col, emissCol, value) {
  const G = new THREE.Group();
  G.position.set(x, y, z);
  scene.add(G);

  let inner;
  const emissInt = 1.1;

  if (type === 'energy_crystal' || type === 'resonance_shard' || type === 'lava_crystal') {
    inner = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.38, 0),
      new THREE.MeshStandardMaterial({ color: col, emissive: emissCol, emissiveIntensity: emissInt, metalness: 0.2, roughness: 0.12 }),
    );
  } else if (type === 'ancient_coin') {
    inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.07, 24),
      new THREE.MeshStandardMaterial({ color: col, emissive: emissCol, emissiveIntensity: 0.9, metalness: 0.85, roughness: 0.08 }),
    );
  } else if (type === 'data_orb') {
    inner = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 24, 24),
      new THREE.MeshStandardMaterial({ color: col, emissive: emissCol, emissiveIntensity: 1.3, transparent: true, opacity: 0.88, roughness: 0.0, metalness: 0.0 }),
    );
    // Wireframe overlay for data orb
    const wf = new THREE.Mesh(
      new THREE.SphereGeometry(0.37, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.4 }),
    );
    G.add(wf);
    _mover(scene, (t) => { wf.rotation.x = t * 0.8; wf.rotation.z = t * 0.5; });
  } else if (type === 'sacred_gem') {
    inner = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.38, 1),
      new THREE.MeshStandardMaterial({ color: col, emissive: emissCol, emissiveIntensity: 1.1, metalness: 0.1, roughness: 0.07 }),
    );
  } else if (type === 'neon_chip') {
    inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.06, 6),
      new THREE.MeshStandardMaterial({ color: col, emissive: emissCol, emissiveIntensity: 1.5, metalness: 0.9, roughness: 0.05 }),
    );
  } else if (type === 'alien_artefact') {
    inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.36, 0),
      new THREE.MeshStandardMaterial({ color: col, emissive: emissCol, emissiveIntensity: 1.2, metalness: 0.4, roughness: 0.1 }),
    );
  } else {
    // fallback star-like shape
    inner = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.38, 0),
      new THREE.MeshStandardMaterial({ color: col, emissive: emissCol, emissiveIntensity: 1.0 }),
    );
  }
  inner.castShadow = false;
  G.add(inner);

  // Outer glow ring orbiting the collectible
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.04, 8, 32),
    new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.65, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  G.add(ring);

  // Soft glow halo (larger transparent sphere)
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 12, 12),
    new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  G.add(glow);

  // Attached point light
  const pl = new THREE.PointLight(col, 1.0, 5.0);
  pl.position.set(0, 0, 0);
  G.add(pl);

  const baseY = y;
  const phase = Math.random() * Math.PI * 2;
  _mover(scene, (t, dt) => {
    G.rotation.y += 0.015;
    G.position.y = baseY + Math.sin(t * 2.1 + phase) * 0.18;
    ring.rotation.z -= 0.022;
    ring.rotation.x  = Math.sin(t * 0.9 + phase) * 0.5;
    pl.intensity = 0.8 + Math.sin(t * 2.8 + phase) * 0.35;
    glow.material.opacity = 0.10 + Math.sin(t * 1.5 + phase) * 0.06;
  });

  _regCollectible(scene, G, x, y, z, value, 0.9);
  return G;
}

// ─── OBSTACLE BUILDERS ────────────────────────────────────────────────────────

/** Electric jellyfish — purple bell + tentacles + drifting. */
function _buildJellyfish(scene, x, baseY, z, phase) {
  const G = new THREE.Group();
  G.position.set(x, baseY, z);
  scene.add(G);

  // Bell (squashed sphere)
  const bell = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x9c27b0, emissive: 0x7b1fa2, emissiveIntensity: 0.8, transparent: true, opacity: 0.78 }),
  );
  bell.scale.y = 0.58;
  G.add(bell);

  // Outer glow shell
  const shellMat = new THREE.MeshBasicMaterial({
    color: 0xce93d8, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 12), shellMat);
  shell.scale.y = 0.6;
  G.add(shell);

  // Six tentacles (each is a chain of 4 segments)
  const tentRoot = new THREE.Group();
  tentRoot.position.y = -0.35;
  G.add(tentRoot);
  const tentSegMat = new THREE.MeshStandardMaterial({
    color: 0xce93d8, emissive: 0x7c4dff, emissiveIntensity: 0.9,
  });
  const tentacles = [];
  for (let ti = 0; ti < 6; ti++) {
    const ang = (ti / 6) * Math.PI * 2;
    const tg = new THREE.Group();
    tg.position.set(Math.cos(ang) * 0.28, 0, Math.sin(ang) * 0.28);
    tentRoot.add(tg);
    const segs = [];
    let parent = tg;
    for (let si = 0; si < 4; si++) {
      const seg = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 5, 5),
        tentSegMat,
      );
      seg.position.y = -0.22;
      parent.add(seg);
      parent = seg;
      segs.push(seg);
    }
    tentacles.push({ tg, segs, ang });
  }

  // Warning ring on ground below
  const warnMat = new THREE.MeshBasicMaterial({
    color: 0xff1744, transparent: true, opacity: 0.22,
    depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const warn = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.8, 24), warnMat);
  warn.rotation.x = -Math.PI / 2;
  warn.position.set(x, 0.02, z);
  scene.add(warn);

  // Point light
  const pl = new THREE.PointLight(0xce93d8, 1.6, 6);
  G.add(pl);

  const obs = _regObstacle(scene, G, 1.2);

  _mover(scene, (t, dt) => {
    const bobY = baseY + Math.sin(t * 0.75 + phase) * 1.4;
    const driftX = x + Math.sin(t * 0.32 + phase) * 0.9;
    G.position.set(driftX, bobY, z);
    // Tentacle wave
    tentacles.forEach(({ segs }, ti) => {
      segs.forEach((seg, si) => {
        seg.position.x = Math.sin(t * 1.8 + si * 0.5 + ti * 1.1) * 0.09;
        seg.position.z = Math.cos(t * 1.4 + si * 0.4 + ti * 0.8) * 0.07;
      });
    });
    pl.intensity = 1.2 + Math.sin(t * 4.5 + phase) * 0.7;
    // Warn ring follows
    warn.position.x = driftX;
    warn.material.opacity = 0.15 + Math.sin(t * 1.2) * 0.1;
    // Keep obs tracking
    obs.mesh.position.copy(G.position);
  });
}

/** Rolling stone boulder — patrols X lane, rotates in motion direction. */
function _buildBoulder(scene, x, z, phase, speed, range) {
  const G = new THREE.Group();
  G.position.set(x, 0.9, z);
  scene.add(G);

  const stoneCol = new THREE.Color(0x8d6e63);
  const stoneGeo = new THREE.SphereGeometry(0.9, 14, 14);
  const stoneMat = new THREE.MeshStandardMaterial({
    color: stoneCol, roughness: 0.94, metalness: 0.0,
  });
  const stone = new THREE.Mesh(stoneGeo, stoneMat);
  stone.castShadow = true;
  G.add(stone);

  // Danger stripe band (emissive orange equator)
  const bandGeo = new THREE.TorusGeometry(0.9, 0.09, 8, 32);
  const bandMat = new THREE.MeshStandardMaterial({ color: 0xff6d00, emissive: 0xff4400, emissiveIntensity: 0.9 });
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.rotation.x = Math.PI / 2;
  G.add(band);

  // Dust cloud particles following the boulder
  const dustCount = 20;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i*3]   = (Math.random() - 0.5) * 0.5;
    dustPos[i*3+1] = Math.random() * 0.4;
    dustPos[i*3+2] = (Math.random() - 0.5) * 0.5;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustPts = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xc8a060, size: 0.1, transparent: true, opacity: 0.4, depthWrite: false,
  }));
  G.add(dustPts);

  const obs = _regObstacle(scene, G, 1.1);

  _mover(scene, (t, dt) => {
    const nx = x + Math.sin(t * speed * 0.5 + phase) * range;
    const dir = Math.cos(t * speed * 0.5 + phase); // -1 to +1 velocity direction
    G.position.x = nx;
    stone.rotation.z -= dir * speed * dt * 1.8;
    stone.rotation.x += Math.abs(dir) * speed * dt * 0.5;
    obs.mesh.position.copy(G.position);
  });
}

/** Whirlwind / sandstorm funnel — spins and drifts. */
function _buildWhirlwind(scene, x, z, phase) {
  const G = new THREE.Group();
  G.position.set(x, 0, z);
  scene.add(G);

  // Spinning funnel cone
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.6, 2.4, 12, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xd4a030, transparent: true, opacity: 0.55,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    }),
  );
  cone.position.y = 1.2;
  G.add(cone);

  // Inner brighter core
  const core = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 2.2, 8, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffcc44, transparent: true, opacity: 0.4,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    }),
  );
  core.position.y = 1.1;
  G.add(core);

  const pl = new THREE.PointLight(0xd4a030, 0.7, 4);
  pl.position.y = 1;
  G.add(pl);

  const obs = _regObstacle(scene, G, 1.1);
  const baseX = x;

  _mover(scene, (t, dt) => {
    cone.rotation.y = t * 3.5;
    core.rotation.y = -t * 5;
    G.position.x = baseX + Math.sin(t * 0.45 + phase) * 2.2;
    G.position.z = z + Math.cos(t * 0.3 + phase) * 1.2;
    pl.intensity = 0.6 + Math.sin(t * 8 + phase) * 0.3;
    obs.mesh.position.copy(G.position);
  });
}

/** Timed laser beam gate — toggles on/off, glows while active, safe to pass through when off. */
function _buildLaser(scene, x, z, width, period, phase) {
  const G = new THREE.Group();
  G.position.set(x, 1.1, z);
  scene.add(G);

  // Emitter posts
  [-1, 1].forEach(side => {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 2.0, 8),
      new THREE.MeshStandardMaterial({ color: 0x424242, metalness: 0.8, roughness: 0.3 }),
    );
    post.position.set(side * (width / 2), 0, 0);
    G.add(post);

    // Danger stripe rings on post
    [0.5, 0, -0.5].forEach(py => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.02, 6, 16),
        new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 0.9 }),
      );
      ring.position.set(side * (width / 2), py, 0);
      ring.rotation.x = Math.PI / 2;
      G.add(ring);
    });
  });

  // Beam itself (thin cylinder spanning the width)
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xff1744, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, width, 6), beamMat);
  beam.rotation.z = Math.PI / 2;
  G.add(beam);

  // Glow halo cylinder (wider, dimmer)
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xff1744, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const halo = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, width, 6), haloMat);
  halo.rotation.z = Math.PI / 2;
  G.add(halo);

  // End-cap spark lights
  const capL = new THREE.PointLight(0xff1744, 0, 4);
  capL.position.set(-width / 2, 0, 0);
  G.add(capL);
  const capR = new THREE.PointLight(0xff1744, 0, 4);
  capR.position.set(width / 2, 0, 0);
  G.add(capR);

  // Collision proxy at the group's position
  const hitProxy = new THREE.Object3D();
  hitProxy.position.set(x, 1.1, z);
  scene.add(hitProxy);
  const obs = _regObstacle(scene, hitProxy, 0);

  _mover(scene, (t) => {
    const cycle = (t + phase) % period;
    const onTime = period * 0.6;
    const warnTime = period * 0.7;
    const on = cycle < onTime;
    const warning = cycle >= onTime && cycle < warnTime;
    const blink = warning ? (Math.sin(t * 18) > 0 ? 0.5 : 0) : (on ? 0.92 : 0);
    beamMat.opacity = blink;
    haloMat.opacity = blink * 0.24;
    const li = on ? 1.8 : 0;
    capL.intensity = li; capR.intensity = li;
    // Danger radius: span the full width when beam is on or warning
    obs.radius = (on || warning) ? (width / 2) : 0;
  });
}

/** Falling rock from ceiling — shadow warns before impact. */
function _buildFallingRock(scene, x, z, period, phase) {
  const restY = 11;
  const rock = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.48, 0),
    new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.95, flatShading: true }),
  );
  rock.position.set(x, restY, z);
  rock.castShadow = true;
  scene.add(rock);

  // Shadow warning circle on ground
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000, transparent: true, opacity: 0,
    depthWrite: false, side: THREE.DoubleSide,
  });
  const shadowCirc = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16), shadowMat);
  shadowCirc.rotation.x = -Math.PI / 2;
  shadowCirc.position.set(x, 0.03, z);
  scene.add(shadowCirc);

  const obs = _regObstacle(scene, rock, 0);

  _mover(scene, (t) => {
    const cycle = ((t + phase) % period + period) % period;
    const warnPhase  = period * 0.55; // shadow appears
    const fallPhase  = period * 0.75; // rock drops
    const impactPhase = period * 0.88;
    const resetPhase  = period * 1.00;

    if (cycle < warnPhase) {
      // Idle — rock high up, no shadow
      rock.position.y = restY;
      rock.visible = true;
      shadowMat.opacity = 0;
      obs.radius = 0;
    } else if (cycle < fallPhase) {
      // Warning — shadow fades in
      const t01 = (cycle - warnPhase) / (fallPhase - warnPhase);
      shadowMat.opacity = t01 * 0.7;
      rock.position.y = restY;
      obs.radius = 0;
    } else if (cycle < impactPhase) {
      // Rock falls with gravity
      const t01 = (cycle - fallPhase) / (impactPhase - fallPhase);
      rock.position.y = Math.max(0.5, restY - t01 * t01 * restY * 1.1);
      shadowMat.opacity = 0.7;
      obs.radius = (rock.position.y < 2.5) ? 0.65 : 0;
    } else {
      // Reset phase — hide rock while it teleports back
      rock.visible = false;
      shadowMat.opacity = 0;
      obs.radius = 0;
    }
  });
}

/** Swinging pendulum vine — blocks path on a timed swing. */
function _buildVineSwing(scene, x, z, phase) {
  const anchor = new THREE.Group();
  anchor.position.set(x, 5, z);
  scene.add(anchor);

  // Horizontal log at anchor
  const log = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 }),
  );
  log.rotation.z = Math.PI / 2;
  anchor.add(log);

  // Vine rope segments (8 links)
  const segments = [];
  let parent = anchor;
  for (let i = 0; i < 8; i++) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(i === 7 ? 0.12 : 0.06, i === 7 ? 0.08 : 0.055, 0.42, 6),
      new THREE.MeshStandardMaterial({ color: i === 7 ? 0x795548 : 0x388e3c, roughness: 0.9 }),
    );
    seg.position.y = -0.42;
    parent.add(seg);
    parent = seg;
    segments.push(seg);
  }

  // Collision proxy at bottom weight
  const bottomProxy = new THREE.Object3D();
  bottomProxy.position.set(x, 5 - 8 * 0.42, z);
  scene.add(bottomProxy);
  const obs = _regObstacle(scene, bottomProxy, 0.45);

  _mover(scene, (t) => {
    const swing = Math.sin(t * 0.95 + phase) * 1.1;
    anchor.rotation.z = swing;
    // Update world-space bottom position for collision
    const swingX = x + Math.sin(swing) * (8 * 0.42);
    const swingY = 5 + Math.cos(swing) * (8 * 0.42) - 8 * 0.42;
    bottomProxy.position.set(swingX, Math.max(0, swingY), z);
    obs.mesh.position.copy(bottomProxy.position);
  });
}

/** Crystal stalactite — drops on a timer; purple warning shadow below. */
function _buildStalactite(scene, x, z, period, phase) {
  const restY = 9.5;

  const stal = new THREE.Mesh(
    new THREE.ConeGeometry(0.25, 1.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x7c4dff, emissive: 0x4a1fb8, emissiveIntensity: 0.6 }),
  );
  stal.rotation.x = Math.PI; // point downward
  stal.position.set(x, restY, z);
  scene.add(stal);

  const warnMat = new THREE.MeshBasicMaterial({
    color: 0xcc00ff, transparent: true, opacity: 0,
    depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  const warnDisc = new THREE.Mesh(new THREE.CircleGeometry(0.45, 16), warnMat);
  warnDisc.rotation.x = -Math.PI / 2;
  warnDisc.position.set(x, 0.03, z);
  scene.add(warnDisc);

  const obs = _regObstacle(scene, stal, 0);

  _mover(scene, (t) => {
    const cycle = ((t + phase) % period + period) % period;
    const warnStart  = period * 0.5;
    const fallStart  = period * 0.72;
    const impactTime = period * 0.85;

    if (cycle < warnStart) {
      stal.position.y = restY;
      warnMat.opacity = 0;
      obs.radius = 0;
    } else if (cycle < fallStart) {
      const t01 = (cycle - warnStart) / (fallStart - warnStart);
      warnMat.opacity = t01 * 0.65 + Math.sin(t * 18) * 0.08 * t01;
      stal.position.y = restY;
      obs.radius = 0;
    } else if (cycle < impactTime) {
      const t01 = (cycle - fallStart) / (impactTime - fallStart);
      stal.position.y = Math.max(0.8, restY - t01 * t01 * restY);
      warnMat.opacity = 0.65;
      obs.radius = (stal.position.y < 2.5) ? 0.4 : 0;
    } else {
      stal.visible = false;
      warnMat.opacity = 0;
      obs.radius = 0;
    }
    if (cycle < warnStart) stal.visible = true;
  });
}

/** Lava geyser — erupts on a timer; safe while dormant. */
function _buildGeyser(scene, x, z, period, phase) {
  // Vent base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.52, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: 0x212121, emissive: 0xff4400, emissiveIntensity: 0.4 }),
  );
  base.position.set(x, 0.14, z);
  scene.add(base);

  // Ground glow
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff6d00, transparent: true, opacity: 0.25,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(new THREE.CircleGeometry(0.55, 20), glowMat);
  glow.rotation.x = -Math.PI / 2;
  glow.position.set(x, 0.02, z);
  scene.add(glow);

  // Lava burst particles
  const PC = 60;
  const pPos = new Float32Array(PC * 3);
  const pVel = new Float32Array(PC * 3);
  const pLife = new Float32Array(PC);
  for (let i = 0; i < PC; i++) pLife[i] = -1;
  const burstGeo = new THREE.BufferGeometry();
  burstGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const burstPts = new THREE.Points(burstGeo, new THREE.PointsMaterial({
    color: 0xff6d00, size: 0.18, transparent: true, opacity: 0, depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  scene.add(burstPts);

  // Danger point light
  const pl = new THREE.PointLight(0xff6d00, 0.3, 5);
  pl.position.set(x, 0.5, z);
  scene.add(pl);

  const proxyMesh = base;
  const obs = _regObstacle(scene, proxyMesh, 0);
  let erupting = false;

  _mover(scene, (t, dt) => {
    const cycle = ((t + phase) % period + period) % period;
    const warnStart = period * 0.65;
    const eruptStart = period * 0.78;
    const eruptEnd   = period * 0.92;

    if (cycle < warnStart) {
      glowMat.opacity = 0.18 + Math.sin(t * 2.5) * 0.08;
      pl.intensity = 0.3;
      obs.radius = 0;
      erupting = false;
    } else if (cycle < eruptStart) {
      // Warning: glow intensifies
      glowMat.opacity = 0.45 + Math.sin(t * 14) * 0.2;
      pl.intensity = 1.0 + Math.sin(t * 12) * 0.5;
      obs.radius = 0;
    } else if (cycle < eruptEnd) {
      // ERUPTION
      if (!erupting) {
        erupting = true;
        // Spawn burst particles
        for (let i = 0; i < PC; i++) {
          const ang = Math.random() * Math.PI * 2;
          const cone = Math.random() * 0.38;
          pVel[i*3]   = Math.cos(ang) * cone;
          pVel[i*3+1] = 8 + Math.random() * 6;
          pVel[i*3+2] = Math.sin(ang) * cone;
          pPos[i*3]   = x; pPos[i*3+1] = 0.5; pPos[i*3+2] = z;
          pLife[i] = 1.0;
        }
      }
      glowMat.opacity = 0.8;
      pl.intensity = 3.5;
      obs.radius = 1.7;
      burstPts.material.opacity = 0.85;
    } else {
      erupting = false;
      glowMat.opacity = 0.18 + Math.sin(t * 2.5) * 0.08;
      pl.intensity = 0.3;
      obs.radius = 0;
      burstPts.material.opacity = 0;
      for (let i = 0; i < PC; i++) pLife[i] = -1;
    }

    // Update burst particles
    const pa = burstGeo.attributes.position.array;
    for (let i = 0; i < PC; i++) {
      if (pLife[i] > 0) {
        pLife[i] -= dt / 1.2;
        pa[i*3]   += pVel[i*3]   * dt;
        pa[i*3+1] += pVel[i*3+1] * dt;
        pa[i*3+2] += pVel[i*3+2] * dt;
        pVel[i*3+1] -= 9.8 * dt; // gravity
        if (pLife[i] <= 0) pa[i*3+1] = -100;
      }
    }
    burstGeo.attributes.position.needsUpdate = true;
  });
}

/** Wind turbine — large spinning blade hub; wide collision radius covers blade sweep. */
function _buildTurbine(scene, x, z, speed) {
  const G = new THREE.Group();
  G.position.set(x, 0, z);
  scene.add(G);

  // Tower
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.18, 4.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.6, roughness: 0.3 }),
  );
  tower.position.y = 2.25;
  G.add(tower);

  // Nacelle (hub box)
  const nacelle = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.22, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.5, roughness: 0.4 }),
  );
  nacelle.position.y = 4.6;
  G.add(nacelle);

  // Blade hub (three blades)
  const hubGroup = new THREE.Group();
  hubGroup.position.y = 4.6;
  G.add(hubGroup);

  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, emissive: 0xff4400, emissiveIntensity: 0.25, metalness: 0.3, roughness: 0.5 });
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 2.6, 0.06),
      bladeMat,
    );
    blade.position.y = 1.3;
    const holder = new THREE.Group();
    holder.rotation.z = (i / 3) * Math.PI * 2;
    holder.add(blade);
    hubGroup.add(holder);
  }

  // Warning ring on ground
  const warnRing = new THREE.Mesh(
    new THREE.RingGeometry(2.5, 2.85, 32),
    new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
  );
  warnRing.rotation.x = -Math.PI / 2;
  warnRing.position.set(x, 0.02, z);
  scene.add(warnRing);

  // Point light to make blades glow
  const pl = new THREE.PointLight(0xff8800, 0.6, 6);
  pl.position.y = 4.6;
  G.add(pl);

  _regObstacle(scene, nacelle, 2.8);

  _mover(scene, (t) => {
    hubGroup.rotation.z = t * speed;
    warnRing.material.opacity = 0.22 + Math.sin(t * 3.5) * 0.1;
  });
}

/** Electric fence — toggles between dangerous (active) and safe (off) on a cycle. */
function _buildElecFence(scene, x, z, width, period, phase) {
  const halfW = width / 2;

  // Posts
  [-1, 1].forEach(side => {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 2.0, 8),
      new THREE.MeshStandardMaterial({ color: 0x424242, metalness: 0.8 }),
    );
    post.position.set(x + side * halfW, 1.0, z);
    scene.add(post);
    // Warning stripes on post
    [0.7, 0, -0.7].forEach(py => {
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8),
        new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 0.7 }),
      );
      stripe.position.set(x + side * halfW, 1.0 + py, z);
      scene.add(stripe);
    });
  });

  // Energy beam segments (zigzag crackle)
  const segCount = 5;
  const segPts = [];
  for (let i = 0; i <= segCount; i++) {
    segPts.push(new THREE.Vector3(-halfW + (i / segCount) * width, 0, 0));
  }
  const lineGeo = new THREE.BufferGeometry().setFromPoints(segPts);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0 });
  const crackle = new THREE.Line(lineGeo, lineMat);
  crackle.position.set(x, 1.0, z);
  scene.add(crackle);

  // Glow around the beam
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const glowBar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, width, 6), glowMat);
  glowBar.rotation.z = Math.PI / 2;
  glowBar.position.set(x, 1.0, z);
  scene.add(glowBar);

  // Collision proxy
  const proxy = new THREE.Object3D();
  proxy.position.set(x, 1.0, z);
  scene.add(proxy);
  const obs = _regObstacle(scene, proxy, 0);

  let crackleTimer = 0;
  _mover(scene, (t, dt) => {
    const cycle = ((t + phase) % period + period) % period;
    const onEnd = period * 0.62;
    const warnEnd = period * 0.75;
    const on = cycle < onEnd;
    const warn = !on && cycle < warnEnd;

    if (on) {
      lineMat.opacity = 0.92;
      glowMat.opacity = 0.22;
      obs.radius = halfW;
      // Crackle: randomise midpoints every 0.06s
      crackleTimer += dt;
      if (crackleTimer > 0.06) {
        crackleTimer = 0;
        const pts = lineGeo.attributes.position.array;
        for (let i = 1; i < segCount; i++) {
          pts[i * 3 + 1] = (Math.random() - 0.5) * 0.28;
        }
        lineGeo.attributes.position.needsUpdate = true;
      }
    } else if (warn) {
      lineMat.opacity = Math.sin(t * 22) > 0 ? 0.4 : 0;
      glowMat.opacity = 0;
      obs.radius = 0;
    } else {
      lineMat.opacity = 0.08;
      glowMat.opacity = 0;
      obs.radius = 0;
    }
  });
}

// ─── ZONE PROP BUILDERS ────────────────────────────────────────────────────────

function _coralProps(scene) {
  const coralCols = [0xff6b6b, 0xff8e53, 0xff5722, 0xe91e63, 0xff4081];
  for (let c = 0; c < 6; c++) {
    const cx = (Math.random() - 0.5) * 26;
    const cz = -Math.random() * 30 - 4;
    if (Math.abs(cx) < 3) continue; // don't block robot path
    const col = coralCols[Math.floor(Math.random() * coralCols.length)];
    for (let s = 0; s < 4 + Math.floor(Math.random() * 3); s++) {
      const h = 0.8 + Math.random() * 1.8;
      const coral = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06 + Math.random() * 0.06, 0.1 + Math.random() * 0.08, h, 6),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.2 }),
      );
      coral.position.set(cx + (Math.random() - 0.5) * 1.4, h / 2, cz + (Math.random() - 0.5) * 1.4);
      coral.rotation.z = (Math.random() - 0.5) * 0.3;
      scene.add(coral);
    }
  }
  // Starfish
  for (let i = 0; i < 8; i++) {
    const sf = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.06, 4, 5),
      new THREE.MeshStandardMaterial({ color: 0xff8a65, emissive: 0xff5722, emissiveIntensity: 0.3 }),
    );
    sf.rotation.x = -Math.PI / 2;
    sf.position.set((Math.random() - 0.5) * 28, 0.04, -Math.random() * 30 - 2);
    scene.add(sf);
  }
}

function _desertProps(scene) {
  // Crumbling pillars
  for (let i = 0; i < 6; i++) {
    const px = ((i % 2) * 2 - 1) * (7 + Math.random() * 4);
    const pz = -i * 4 - 2;
    const segments = 3 + Math.floor(Math.random() * 3);
    for (let s = 0; s < segments; s++) {
      const w = 0.4 + (segments - s) * 0.08;
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(w + (Math.random() - 0.5) * 0.12, 0.6 + Math.random() * 0.2, w + (Math.random() - 0.5) * 0.12),
        new THREE.MeshStandardMaterial({ color: 0x9e8060, roughness: 0.95 }),
      );
      block.position.set(px, 0.3 + s * 0.7, pz);
      block.rotation.y = (Math.random() - 0.5) * 0.15;
      scene.add(block);
    }
  }
  // Buried wall sections
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x8d7055, roughness: 0.95 });
  [{ x: -12, z: -12, ry: 0.3 }, { x: 10, z: -20, ry: -0.2 }].forEach(({ x, z, ry }) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 2.5, 0.5), wallMat);
    wall.position.set(x, 0.8, z);
    wall.rotation.y = ry;
    scene.add(wall);
  });
}

function _spaceProps(scene) {
  // Wall panel strips along edges
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.7, roughness: 0.4 });
  const detailMat = new THREE.MeshStandardMaterial({ color: 0x4fc3f7, emissive: 0x4fc3f7, emissiveIntensity: 0.6 });
  for (let i = 0; i < 8; i++) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(4, 0.08, 1.2), panelMat);
    panel.position.set(0, 0.04, -i * 3.5);
    scene.add(panel);
    // Emissive strip detail
    const strip = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.03, 0.12), detailMat);
    strip.position.set(0, 0.08, -i * 3.5 + 0.3);
    scene.add(strip);
  }
  // Floating debris cubes
  for (let i = 0; i < 8; i++) {
    const s = 0.1 + Math.random() * 0.25;
    const debris = new THREE.Mesh(
      new THREE.BoxGeometry(s, s, s),
      new THREE.MeshStandardMaterial({ color: 0x546e7a, metalness: 0.5 }),
    );
    debris.position.set((Math.random() - 0.5) * 14, 1 + Math.random() * 3, -Math.random() * 25 - 2);
    const dPhase = Math.random() * Math.PI * 2;
    const dSpeed = 0.15 + Math.random() * 0.3;
    const dBase = debris.position.clone();
    scene.add(debris);
    _mover(scene, t => {
      debris.rotation.x = t * dSpeed;
      debris.rotation.y = t * dSpeed * 0.7;
      debris.position.y = dBase.y + Math.sin(t * 0.5 + dPhase) * 0.4;
    });
  }
}

function _jungleProps(scene) {
  // Temple steps
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.95 });
  for (let s = 0; s < 5; s++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(4 - s * 0.4, 0.35, 0.8),
      stoneMat,
    );
    step.position.set(0, s * 0.35, -22 + s * 0.8);
    scene.add(step);
  }
  // Fireflies (glowing points)
  const ffCount = 80;
  const ffPos = new Float32Array(ffCount * 3);
  for (let i = 0; i < ffCount; i++) {
    ffPos[i*3]   = (Math.random() - 0.5) * 30;
    ffPos[i*3+1] = 0.3 + Math.random() * 4;
    ffPos[i*3+2] = Math.random() * -30;
  }
  const ffGeo = new THREE.BufferGeometry();
  ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
  const ffMat = new THREE.PointsMaterial({ color: 0xddff88, size: 0.1, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.Points(ffGeo, ffMat));
  _mover(scene, t => {
    const a = ffGeo.attributes.position.array;
    for (let i = 0; i < ffCount; i++) {
      a[i*3]   += Math.sin(t * 0.4 + i) * 0.005;
      a[i*3+1] += Math.sin(t * 0.6 + i * 0.7) * 0.004;
    }
    ffGeo.attributes.position.needsUpdate = true;
    ffMat.opacity = 0.55 + Math.sin(t * 1.8) * 0.3;
  });
}

function _crystalCaveProps(scene) {
  // Crystal formations
  const crystalCols = [0xe040fb, 0x7c4dff, 0xaa00ff, 0xd500f9, 0xcc44ff];
  for (let i = 0; i < 18; i++) {
    const cx = (Math.random() - 0.5) * 22;
    const cz = -Math.random() * 28 - 2;
    if (Math.abs(cx) < 2.5) continue;
    const col = crystalCols[i % crystalCols.length];
    const h = 0.6 + Math.random() * 2.5;
    const xtal = new THREE.Mesh(
      new THREE.ConeGeometry(0.12 + Math.random() * 0.1, h, 5),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.55, transparent: true, opacity: 0.85 }),
    );
    xtal.position.set(cx, h / 2, cz);
    xtal.rotation.z = (Math.random() - 0.5) * 0.25;
    xtal.rotation.y = Math.random() * Math.PI;
    scene.add(xtal);
  }
}

function _volcanoProps(scene) {
  // Lava glow strips on terrain
  const lavaMat = new THREE.MeshBasicMaterial({
    color: 0xff4400, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  [{ x: -6, z: -8, w: 3, l: 10 }, { x: 5, z: -17, w: 2.5, l: 8 }].forEach(({ x, z, w, l }) => {
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(w, l), lavaMat);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(x, 0.01, z);
    scene.add(strip);
    _mover(scene, t => { strip.material.opacity = 0.4 + Math.sin(t * 2.2) * 0.2; });
  });
  // Rock formations
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x1a0a00, roughness: 0.98 });
  for (let i = 0; i < 10; i++) {
    const rx = (Math.random() - 0.5) * 20;
    const rz = -Math.random() * 28 - 3;
    if (Math.abs(rx) < 3) continue;
    const s = 0.4 + Math.random() * 1.2;
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), rockMat);
    rock.position.set(rx, s * 0.5, rz);
    rock.rotation.y = Math.random() * Math.PI;
    scene.add(rock);
  }
}

function _neonCityProps(scene) {
  // Neon sign panels
  const signCols = [0xff00ff, 0x00ff88, 0x00e5ff, 0xffcc00, 0xff4400];
  signCols.forEach((col, i) => {
    const signMat = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.5), signMat);
    sign.position.set((i % 2 === 0 ? -1 : 1) * (6 + Math.random() * 3), 1.5 + Math.random(), -i * 5 - 3);
    scene.add(sign);
    const pl = new THREE.PointLight(col, 0.5, 4);
    pl.position.copy(sign.position);
    scene.add(pl);
    _mover(scene, t => { pl.intensity = 0.3 + Math.sin(t * 3.5 + i) * 0.25; });
  });
  // Roof details (HVAC boxes)
  const hvacMat = new THREE.MeshStandardMaterial({ color: 0x424242, metalness: 0.5 });
  for (let i = 0; i < 5; i++) {
    const bx = (Math.random() - 0.5) * 16;
    const bz = -i * 5 - 4;
    if (Math.abs(bx) < 3.5) continue;
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.9), hvacMat);
    box.position.set(bx, 0.35, bz);
    scene.add(box);
  }
}

function _alienProps(scene) {
  // Alien monolith spires
  const spireCol = [0xcc44ff, 0x4488ff, 0x44ffcc];
  for (let i = 0; i < 8; i++) {
    const sx = (Math.random() - 0.5) * 22;
    const sz = -Math.random() * 30 - 3;
    if (Math.abs(sx) < 3) continue;
    const h = 1.5 + Math.random() * 3;
    const col = spireCol[i % spireCol.length];
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.2, h, 5),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.5 }),
    );
    spire.position.set(sx, h / 2, sz);
    scene.add(spire);
  }
}

// ─── ZONE BUILDERS ────────────────────────────────────────────────────────────

export function buildRobotReef(scene, challenge) {
  const missionMode = _missionMode(scene, challenge);
  const cfg = {
    ambient:  { color: 0x082848, intensity: 0.4 },
    hemi:     { skyColor: 0x0d3a6b, groundColor: 0x1e6e4e, intensity: 0.6 },
    sun:      { color: 0x4fc3f7, intensity: 0.9, pos: { x: -8, y: 14, z: -5 } },
    pointLights: [
      { color: 0xff6b9d, intensity: 0.5, distance: 7, pos: { x: -8, y: 1.5, z: -5  } },
      { color: 0xff8e53, intensity: 0.5, distance: 7, pos: { x:  6, y: 1.5, z: -12 } },
    ],
  };
  scene.fog = new THREE.FogExp2(0x071830, 0.024);
  _makeSky(scene, 0x020810, 0x0a3048, 0x165468);
  _lighting(scene, cfg);
  _makeTerrain(scene, 0xc8b87a, 0.12, 0.4);
  _coralProps(scene);
  _ambientParticles(scene, { count: 280, color: 0x00e5ff, size: 0.07, speed: 0.28, opacity: 0.55 });

  if (missionMode) {
    _initMissionShell(scene);
    return;
  }

  // Goal beacon + 6 collectibles + 4 jellyfish
  _buildGoalBeacon(scene, 0, -24, 0xffd700, 0x00e5ff, 'SALVAGE POINT');
  [
    [-4, 0.7,  1], [ 3.5, 0.7, -3],
    [-5, 0.7, -7], [ 4,   0.7,-11],
    [-3, 0.7,-16], [ 2,   0.7,-21],
  ].forEach(([x, y, z]) => _buildCollectible(scene, 'energy_crystal', x, y, z, 0x00e5ff, 0x00b4cc, 10));

  _buildJellyfish(scene, -2.5, 2.5,  0,  0.0);
  _buildJellyfish(scene,  3.5, 2.2, -6,  1.4);
  _buildJellyfish(scene, -3.5, 2.8,-13,  2.8);
  _buildJellyfish(scene,  2.5, 2.4,-19,  4.2);
}

export function buildDesertRuins(scene, challenge) {
  const missionMode = _missionMode(scene, challenge);
  const cfg = {
    ambient:  { color: 0x6b3a00, intensity: 0.35 },
    hemi:     { skyColor: 0xe89030, groundColor: 0xa07840, intensity: 0.7 },
    sun:      { color: 0xffcc66, intensity: 1.3, pos: { x: -18, y: 7, z: -8 } },
    pointLights: [
      { color: 0xffd700, intensity: 1.5, distance: 12, pos: { x: 0, y: 2, z: -26 }, flicker: true },
    ],
  };
  scene.fog = new THREE.FogExp2(0xc49050, 0.013);
  _makeSky(scene, 0x1a0d00, 0x7a3500, 0xd47020);
  _lighting(scene, cfg);
  _makeTerrain(scene, 0xd4a553, 0.14, 1.2);
  _desertProps(scene);
  _ambientParticles(scene, { count: 400, color: 0xd4a030, size: 0.04, speed: 0.9, opacity: 0.3 });

  if (missionMode) {
    _initMissionShell(scene);
    return;
  }

  _buildGoalBeacon(scene, 0, -26, 0xffd700, 0xff8f00, 'SARCOPHAGUS');
  [
    [-4.5, 0.6,  4], [ 4,   0.6,  0],
    [-5,   0.6, -4], [ 3.5, 0.6, -9],
    [-4,   0.6,-14], [ 4,   0.6,-18],
    [-3,   0.6,-21], [ 2.5, 0.6,-24],
  ].forEach(([x, y, z]) => _buildCollectible(scene, 'ancient_coin', x, y, z, 0xffd700, 0xcc8800, 12));

  _buildBoulder(scene, -4,   -1,  0.0, 2.0, 7);
  _buildBoulder(scene,  4.5, -9,  2.1, 1.6, 6);
  _buildBoulder(scene, -3.5,-18,  4.0, 2.3, 7);
  _buildWhirlwind(scene,  3,  2,  0.5);
  _buildWhirlwind(scene, -5, -6,  1.9);
  _buildWhirlwind(scene,  4,-13,  3.3);
}

export function buildSpaceStation(scene, challenge) {
  const cfg = {
    ambient:  { color: 0x101828, intensity: 0.2 },
    hemi:     { skyColor: 0x182040, groundColor: 0x101020, intensity: 0.35 },
    sun:      { color: 0xddeeff, intensity: 0.55, pos: { x: 5, y: 12, z: 5 } },
    pointLights: [
      { color: 0xff1744, intensity: 1.5, distance: 8, pos: { x: -8,  y: 2, z:  0  }, flicker: true },
      { color: 0xff1744, intensity: 1.5, distance: 8, pos: { x:  8,  y: 2, z: -14 }, flicker: true },
      { color: 0x4fc3f7, intensity: 0.8, distance: 12, pos: { x:  0, y: 2, z: -26 } },
    ],
  };
  scene.fog = new THREE.FogExp2(0x040818, 0.007);
  _makeSky(scene, 0x000005, 0x000812, 0x020520);
  _lighting(scene, cfg);
  // Metal floor tile for space station
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x263238, metalness: 0.7, roughness: 0.35 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 60), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -15);
  floor.receiveShadow = true;
  scene.add(floor);
  // Also add a wider background plane
  const bgFloor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x1a2028 }));
  bgFloor.rotation.x = -Math.PI / 2;
  bgFloor.position.set(0, -0.02, -15);
  scene.add(bgFloor);
  _spaceProps(scene);
  _ambientParticles(scene, { count: 120, color: 0x8899aa, size: 0.04, speed: 0.08, opacity: 0.2 });

  // Starfield backdrop
  const starCount = 1200;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i*3]   = (Math.random() - 0.5) * 180;
    starPos[i*3+1] = Math.random() * 80 + 5;
    starPos[i*3+2] = (Math.random() - 0.5) * 180;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, sizeAttenuation: true })));

  if (_missionMode(scene, challenge)) { _initMissionShell(scene); return; }

  _buildGoalBeacon(scene, 0, -26, 0x4fc3f7, 0x00e5ff, 'AIRLOCK');
  [
    [-4, 0.8,  1], [ 4.5, 0.8, -4],
    [-3, 0.8,-10], [ 3.5, 0.8,-16],
    [-2, 0.8,-21],
  ].forEach(([x, y, z]) => _buildCollectible(scene, 'data_orb', x, y, z, 0x4fc3f7, 0x0288d1, 15));

  _buildLaser(scene,  0, -2,  10, 4.0, 0.0);
  _buildLaser(scene,  0, -8,  10, 3.5, 1.8);
  _buildLaser(scene,  0,-14,  10, 3.0, 3.2);
  _buildLaser(scene,  0,-20,  10, 4.5, 0.9);
}

export function buildJungleTemple(scene, challenge) {
  const cfg = {
    ambient:  { color: 0x1a2e10, intensity: 0.3 },
    hemi:     { skyColor: 0x2d4a20, groundColor: 0x1a2810, intensity: 0.55 },
    sun:      { color: 0xff8f00, intensity: 0.9, pos: { x: -10, y: 8, z: -5 } },
    pointLights: [
      { color: 0xff5500, intensity: 0.5, distance: 6, pos: { x: -5, y: 1, z: -5  } },
      { color: 0xff5500, intensity: 0.5, distance: 6, pos: { x:  5, y: 1, z: -14 } },
      { color: 0x66bb6a, intensity: 1.0, distance: 10, pos: { x: 0, y: 2, z: -24 } },
    ],
  };
  scene.fog = new THREE.FogExp2(0x081205, 0.027);
  _makeSky(scene, 0x020802, 0x0a1a05, 0x1a3010);
  _lighting(scene, cfg);
  _makeTerrain(scene, 0x2d5a27, 0.18, 0.9);
  _jungleProps(scene);
  _ambientParticles(scene, { count: 90, color: 0xddff88, size: 0.06, speed: 0.14, opacity: 0.65 });

  if (_missionMode(scene, challenge)) { _initMissionShell(scene); return; }

  _buildGoalBeacon(scene, 0, -24, 0x66bb6a, 0xff5252, 'TEMPLE IDOL');
  [
    [-4, 0.7,  2], [ 4.5, 0.7, -2],
    [-4, 0.7, -7], [ 3.5, 0.7,-12],
    [-3, 0.7,-17], [ 2,   0.7,-21],
  ].forEach(([x, y, z]) => _buildCollectible(scene, 'sacred_gem', x, y, z, 0xe53935, 0xb71c1c, 14));

  _buildFallingRock(scene, -2, -1,  4.0, 0.0);
  _buildFallingRock(scene,  3, -8,  3.5, 1.5);
  _buildFallingRock(scene, -3,-15,  4.5, 3.0);
  _buildVineSwing(scene,  4, -4,  0.0);
  _buildVineSwing(scene, -4,-12,  1.8);
}

export function buildCrystalCaves(scene, challenge) {
  const cfg = {
    ambient:  { color: 0x200040, intensity: 0.35 },
    hemi:     { skyColor: 0x2a0855, groundColor: 0x100020, intensity: 0.5 },
    sun:      { color: 0xcc88ff, intensity: 0.5, pos: { x: 0, y: 10, z: 5 } },
    pointLights: [
      { color: 0x7c4dff, intensity: 0.7, distance: 8, pos: { x: -8, y: 2, z: -5  } },
      { color: 0xe040fb, intensity: 0.7, distance: 8, pos: { x:  6, y: 2, z: -14 } },
    ],
  };
  scene.fog = new THREE.FogExp2(0x0a0520, 0.03);
  _makeSky(scene, 0x03000a, 0x0a0520, 0x1a0a35);
  _lighting(scene, cfg);
  _makeTerrain(scene, 0x1a1030, 0.09, 0.5);
  _crystalCaveProps(scene);
  _ambientParticles(scene, { count: 200, color: 0xcc88ff, size: 0.06, speed: 0.15, opacity: 0.45 });

  if (_missionMode(scene, challenge)) { _initMissionShell(scene); return; }

  _buildGoalBeacon(scene, 0, -24, 0xe040fb, 0x7c4dff, 'CRYSTAL ALTAR');
  [
    [-4, 0.7,  1], [ 4,   0.7, -4],
    [-3, 0.7, -9], [ 4.5, 0.7,-15],
    [-3, 0.7,-20],
  ].forEach(([x, y, z]) => _buildCollectible(scene, 'resonance_shard', x, y, z, 0xe040fb, 0x9c27b0, 16));

  _buildStalactite(scene, -2, -2,  5.0, 0.0);
  _buildStalactite(scene,  3, -7,  4.0, 1.2);
  _buildStalactite(scene, -4,-12,  5.5, 2.8);
  _buildStalactite(scene,  2,-17,  4.5, 4.0);
  _buildStalactite(scene, -3,-21,  3.8, 0.8);
}

export function buildVolcanoIsland(scene, challenge) {
  const cfg = {
    ambient:  { color: 0x3a0500, intensity: 0.3 },
    hemi:     { skyColor: 0x5a1000, groundColor: 0x2a0500, intensity: 0.5 },
    sun:      { color: 0xff4400, intensity: 0.8, pos: { x: -5, y: -2, z: -5 } },
    pointLights: [
      { color: 0xff6d00, intensity: 2.2, distance: 10, pos: { x: -7, y: 0.5, z: -5  }, flicker: true },
      { color: 0xff6d00, intensity: 2.2, distance: 10, pos: { x:  6, y: 0.5, z: -16 }, flicker: true },
      { color: 0x4fc3f7, intensity: 2.5, distance: 9,  pos: { x:  0, y: 1,   z: -26 } },
    ],
  };
  scene.fog = new THREE.FogExp2(0x1a0500, 0.028);
  _makeSky(scene, 0x0a0000, 0x2a0500, 0x5a0800);
  _lighting(scene, cfg);
  _makeTerrain(scene, 0x1a0800, 0.07, 1.5);
  _volcanoProps(scene);
  _ambientParticles(scene, { count: 350, color: 0xff6d00, size: 0.06, speed: 0.65, opacity: 0.45 });

  if (_missionMode(scene, challenge)) { _initMissionShell(scene); return; }

  _buildGoalBeacon(scene, 0, -26, 0x4fc3f7, 0x00e5ff, 'COOLING CHAMBER');
  [
    [-4.5, 0.8,  2], [ 4,   0.8, -5],
    [-3.5, 0.8,-13], [ 3.5, 0.8,-20],
  ].forEach(([x, y, z]) => _buildCollectible(scene, 'lava_crystal', x, y, z, 0xbf360c, 0xff6d00, 22));

  _buildGeyser(scene, -3, -3,  3.5, 0.0);
  _buildGeyser(scene,  3,-10,  3.0, 1.5);
  _buildGeyser(scene, -2,-18,  4.0, 2.8);
  _buildBoulder(scene,  4, -7, 0.3, 2.0, 6);
  _buildBoulder(scene, -4,-14, 2.0, 2.5, 6);
}

export function buildCityNeonRush(scene, challenge) {
  const cfg = {
    ambient:  { color: 0x050512, intensity: 0.15 },
    hemi:     { skyColor: 0x0a0a28, groundColor: 0x050510, intensity: 0.28 },
    sun:      { color: 0x4488ff, intensity: 0.35, pos: { x: 5, y: 18, z: 5 } },
    pointLights: [
      { color: 0xff00ff, intensity: 1.4, distance: 9, pos: { x: -7, y: 2, z:  0 } },
      { color: 0x00ff88, intensity: 1.2, distance: 9, pos: { x:  6, y: 2, z: -12 } },
      { color: 0x00e5ff, intensity: 1.0, distance: 7, pos: { x: -5, y: 2, z: -20 } },
    ],
  };
  scene.fog = new THREE.FogExp2(0x040510, 0.022);
  _makeSky(scene, 0x000005, 0x050010, 0x0a0020);
  _lighting(scene, cfg);

  // Concrete rooftop floor
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.9 });
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(18, 55), roofMat);
  roof.rotation.x = -Math.PI / 2;
  roof.position.set(0, 0, -15);
  roof.receiveShadow = true;
  scene.add(roof);
  // Low wall borders
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x141420 });
  [[-9, -15, 55, 0.6], [9, -15, 55, 0.6]].forEach(([wx, wz, wl, h]) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, wl), wallMat);
    wall.position.set(wx, 0.3, wz);
    scene.add(wall);
  });
  _neonCityProps(scene);

  if (_missionMode(scene, challenge)) { _initMissionShell(scene); return; }

  _buildGoalBeacon(scene, 0, -26, 0x00ff88, 0x00e5ff, 'SERVER ROOM');
  [
    [-4, 0.5,  1], [ 4.5, 0.5, -4],
    [-4, 0.5,-10], [ 4,   0.5,-16],
    [-2, 0.5,-21],
  ].forEach(([x, y, z]) => _buildCollectible(scene, 'neon_chip', x, y, z, 0x00ff88, 0x00cc44, 18));

  _buildTurbine(scene,  -3, -3,  1.5);
  _buildTurbine(scene,   3,-14,  2.0);
  _buildElecFence(scene,  0, -7,  9, 3.5, 0.0);
  _buildElecFence(scene,  0,-18,  9, 2.8, 1.8);
}

export function buildFinalFrontier(scene, challenge) {
  const cfg = {
    ambient:  { color: 0x150530, intensity: 0.28 },
    hemi:     { skyColor: 0x200a45, groundColor: 0x0a0520, intensity: 0.45 },
    sun:      { color: 0xcc88ff, intensity: 0.7, pos: { x: 8, y: 12, z: -5 } },
    pointLights: [
      { color: 0xff4488, intensity: 0.8, distance: 8, pos: { x: -8, y: 1.5, z:  0  } },
      { color: 0x44ffcc, intensity: 0.8, distance: 8, pos: { x:  7, y: 1.5, z: -14 } },
      { color: 0xfdd835, intensity: 2.0, distance: 12, pos: { x:  0, y: 2,   z: -28 } },
    ],
  };
  scene.fog = new THREE.FogExp2(0x080320, 0.015);
  _makeSky(scene, 0x020005, 0x0a0520, 0x1a0840);
  _lighting(scene, cfg);
  _makeTerrain(scene, 0x1a1030, 0.13, 1.0);
  _alienProps(scene);
  _ambientParticles(scene, { count: 180, color: 0xaa66ff, size: 0.06, speed: 0.22, opacity: 0.4 });

  // Binary suns (two glowing spheres far in background sky)
  [{ x: -30, y: 22, z: -80, col: 0xff6622 }, { x: 25, y: 30, z: -80, col: 0xaaaaff }].forEach(({ x, y, z, col }) => {
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(3, 16, 16),
      new THREE.MeshBasicMaterial({ color: col }),
    );
    sun.position.set(x, y, z);
    scene.add(sun);
    const sunPl = new THREE.PointLight(col, 0.4, 80);
    sunPl.position.set(x, y, z);
    scene.add(sunPl);
  });

  if (_missionMode(scene, challenge)) { _initMissionShell(scene); return; }

  _buildGoalBeacon(scene, 0, -28, 0xfdd835, 0xff8800, 'GRADUATE');
  [
    [-4,   0.8,  2], [ 4,   0.8, -3],
    [-4.5, 0.8, -8], [ 4.5, 0.8,-13],
    [-3,   0.8,-18], [ 3,   0.8,-22],
    [ 0,   0.8,-25],
  ].forEach(([x, y, z]) => _buildCollectible(scene, 'alien_artefact', x, y, z, 0xcc44ff, 0x8800cc, 25));

  // One of each obstacle type — the grand gauntlet
  _buildJellyfish(scene,  -3, 2.5,  -1, 0.0);
  _buildBoulder(scene,     4, -6,    1.0, 2.2, 7);
  _buildLaser(scene,       0,-10,   10,  3.5, 0.5);
  _buildGeyser(scene,     -3,-15,    3.0, 2.0);
  _buildStalactite(scene,  3,-20,    4.0, 1.5);
  _buildTurbine(scene,    -4,-24,    2.5);
}
