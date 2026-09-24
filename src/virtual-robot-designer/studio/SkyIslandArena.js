/**
 * SkyIslandArena.js — Sky Island Delivery
 * Complete replacement for _skyIslandArena in LiveLabPage.jsx
 *
 * Layout (robot starts x=0, z=5, faces -z):
 *   Island 1 (spawn depot):  center 0,   0,    0    — 22×18 grass
 *   Bridge 1:                0,-9 → 0,-33   y=-0.3
 *   Island 2 (waypoint):     center 0,  -0.8, -42   — 16×12 grass
 *   Bridge 2:                0,-51 → 6,-69  y=-1.0
 *   Island 3 (delivery hub): center 6,  -1.5, -74   — 14×10 grass + landing pad
 *
 * Engine hooks used:
 *   scene.userData.finishZone   {x,z,radius}
 *   scene.userData.collectibles [{mesh,pos,radius,value,collected}]
 *   scene.userData.movers       [{update:(t,dt,rs)=>{}}]   ← MUST be object not plain fn
 */
import * as THREE from 'three';

// ─── engine hook helpers ────────────────────────────────────────────────────
function _mover(scene, fn) {
  (scene.userData.movers = scene.userData.movers || []).push({ update: fn });
}
function _finishZone(scene, x, z, radius) {
  scene.userData.finishZone = { x, z, radius };
}
function _regCollectible(scene, mesh, x, y, z, value = 10, radius = 1.1) {
  (scene.userData.collectibles = scene.userData.collectibles || []).push({
    mesh, pos: { x, y, z }, radius, value, collected: false,
  });
}
function _regObstacle(scene, ref) {
  (scene.userData.obstacles = scene.userData.obstacles || []).push(ref);
}

// ─── sky dome ───────────────────────────────────────────────────────────────
function _buildSkyDome(scene) {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(280, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {},
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv=uv;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
        }`,
      fragmentShader: `
        varying vec2 vUv;
        void main(){
          float t=clamp(vUv.y,0.0,1.0);
          vec3 zenith =vec3(0.06,0.31,0.75);
          vec3 horizon=vec3(0.49,0.74,0.97);
          vec3 loHoriz=vec3(0.86,0.93,1.00);
          vec3 col = t<0.12
            ? mix(loHoriz,horizon,t/0.12)
            : mix(horizon,zenith,(t-0.12)/0.88);
          gl_FragColor=vec4(col,1.0);
        }`,
    }),
  );
  scene.add(sky);
}

// ─── animated cloud layer ───────────────────────────────────────────────────
function _buildCloudLayer(scene) {
  // Canvas cloud texture
  const sz = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = sz;
  const ctx = cv.getContext('2d');
  for (let i = 0; i < 55; i++) {
    const x = Math.random() * sz, y = Math.random() * sz;
    const r = 18 + Math.random() * 55;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.38)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);

  // Large cloud plane far below islands
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, opacity: 0.76,
    depthWrite: false, side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), mat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -22;
  scene.add(plane);

  // Slowly drift the UV offset
  _mover(scene, (t) => { tex.offset.x = t * 0.0003; });

  // Mid-level wispy cloud puffs
  const wispMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.55,
  });
  const wispPositions = [
    [-38, -6, -30], [52, -4, -50], [-60, -8, -75], [45, -5, -90], [-20, -7, -115],
  ];
  wispPositions.forEach(([cx, cy, cz]) => {
    for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(3.5 + Math.random() * 3.5, 8, 5), wispMat,
      );
      m.position.set(cx + (Math.random() - 0.5) * 16, cy + (Math.random() - 0.5) * 3,
        cz + (Math.random() - 0.5) * 10);
      scene.add(m);
    }
  });
}

// ─── wind particles ─────────────────────────────────────────────────────────
function _buildWindParticles(scene) {
  const N = 200;
  const pos = new Float32Array(N * 3);
  const vel = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 80;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 20 + 5;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 120 - 40;
    vel[i * 3]     = 0.6 + Math.random() * 1.2;
    vel[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
    vel[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo,
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.35 }));
  scene.add(pts);

  _mover(scene, (t, dt) => {
    for (let i = 0; i < N; i++) {
      pos[i * 3]     += vel[i * 3] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      if (pos[i * 3] > 42) pos[i * 3] = -42; // wrap around
    }
    geo.attributes.position.needsUpdate = true;
  });
}

// ─── island builder ──────────────────────────────────────────────────────────
function _buildIsland(scene, cx, cy, cz, w, d, thick = 1.4) {
  // Low-poly grass top with vertex-colour variation
  const topGeo = new THREE.PlaneGeometry(w, d, 5, 5);
  topGeo.rotateX(-Math.PI / 2);
  const topGeoNI = topGeo.toNonIndexed();
  const vCount = topGeoNI.attributes.position.count;
  const colors = new Float32Array(vCount * 3);
  const baseG = new THREE.Color(0x5aaa2e);
  const varG  = new THREE.Color(0x7dd444);
  for (let i = 0; i < vCount; i += 3) {
    const c = Math.random() < 0.5 ? baseG : varG;
    for (let k = 0; k < 3; k++) {
      colors[(i + k) * 3]     = c.r;
      colors[(i + k) * 3 + 1] = c.g;
      colors[(i + k) * 3 + 2] = c.b;
    }
  }
  topGeoNI.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  // Slight vertex displacement for organic feel
  const pAttr = topGeoNI.attributes.position;
  for (let i = 0; i < pAttr.count; i++) {
    pAttr.setY(i, pAttr.getY(i) + (Math.random() - 0.5) * 0.25);
  }
  topGeoNI.computeVertexNormals();
  const topMesh = new THREE.Mesh(topGeoNI,
    new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  topMesh.position.set(cx, cy + thick / 2, cz);
  topMesh.receiveShadow = true;
  scene.add(topMesh);

  // Tapered earth body
  const earthMat = new THREE.MeshLambertMaterial({ color: 0x7a5c32 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.36, w * 0.22, thick * 1.8, 7), earthMat);
  body.position.set(cx, cy - thick * 0.5, cz);
  body.castShadow = true;
  scene.add(body);

  // Rock chunks hanging from sides
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x5a4828 });
  const rng = [w * 0.28, d * 0.28];
  for (let i = 0; i < 5; i++) {
    const rock = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.35 + Math.random() * 0.4, 0), rockMat,
    );
    const ang = (i / 5) * Math.PI * 2 + Math.random() * 0.8;
    rock.position.set(
      cx + Math.cos(ang) * rng[0] * (0.7 + Math.random() * 0.4),
      cy - thick * (0.8 + Math.random() * 0.7),
      cz + Math.sin(ang) * rng[1] * (0.7 + Math.random() * 0.4),
    );
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    scene.add(rock);
  }
}

// ─── bridge builder ──────────────────────────────────────────────────────────
function _buildBridge(scene, x1, z1, x2, z2, y) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const ang = Math.atan2(dx, dz);
  const midX = (x1 + x2) / 2, midZ = (z1 + z2) / 2;

  // Deck planks (individual pieces for detail)
  const plankMat = new THREE.MeshLambertMaterial({ color: 0x9a6632 });
  const numPlanks = Math.floor(len / 0.9);
  for (let i = 0; i < numPlanks; i++) {
    const t = (i + 0.5) / numPlanks;
    const px = x1 + dx * t, pz = z1 + dz * t;
    const plank = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.7), plankMat);
    plank.position.set(px, y, pz);
    plank.rotation.y = ang;
    plank.receiveShadow = true;
    scene.add(plank);
  }

  // Rope rails
  const ropeMat = new THREE.MeshLambertMaterial({ color: 0xb08840 });
  [-1, 1].forEach(side => {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, len, 5), ropeMat);
    rail.position.set(midX + Math.cos(ang) * side * 1.1, y + 0.45, midZ - Math.sin(ang) * side * 1.1);
    rail.rotation.y = ang + Math.PI / 2;
    scene.add(rail);
    // Posts every ~4 units
    const numPosts = Math.floor(len / 4);
    for (let i = 0; i <= numPosts; i++) {
      const t2 = i / numPosts;
      const px = x1 + dx * t2, pz = z1 + dz * t2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 5), ropeMat);
      post.position.set(px + Math.cos(ang) * side * 1.1, y + 0.45, pz - Math.sin(ang) * side * 1.1);
      scene.add(post);
    }
  });
}

// ─── windmill (landmark on Island 1) ─────────────────────────────────────────
function _buildWindmill(scene, x, y, z) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);

  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.62, 6.2, 10),
    new THREE.MeshLambertMaterial({ color: 0xf5edd4 }));
  tower.position.y = 3.1; tower.castShadow = true; grp.add(tower);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.3, 10),
    new THREE.MeshLambertMaterial({ color: 0xcc3322 }));
  roof.position.y = 6.85; grp.add(roof);

  // Windows
  const winMat = new THREE.MeshLambertMaterial({ color: 0x88ccff });
  [1.5, 3.5].forEach(wy => {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.05), winMat);
    win.position.set(0, wy, 0.65); grp.add(win);
  });

  const bladeGrp = new THREE.Group();
  bladeGrp.position.set(0, 6.2, 0.65);
  const bladeMat = new THREE.MeshLambertMaterial({ color: 0xf0e8d0 });
  for (let b = 0; b < 4; b++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.6, 0.08), bladeMat);
    const ang = (b / 4) * Math.PI * 2;
    blade.position.set(Math.cos(ang) * 1.85, Math.sin(ang) * 1.85, 0);
    blade.rotation.z = ang;
    blade.castShadow = true;
    bladeGrp.add(blade);
  }
  grp.add(bladeGrp);
  scene.add(grp);

  // Correct mover format: {update: fn}
  _mover(scene, (t) => { bladeGrp.rotation.z = t * 0.65; });
}

// ─── delivery package (collectible) ─────────────────────────────────────────
function _buildPackage(scene, x, y, z, colorHex = 0x4ac8ff, index = 0) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);

  // Main box
  const boxMat = new THREE.MeshStandardMaterial({
    color: colorHex, roughness: 0.55, metalness: 0.1,
    emissive: colorHex, emissiveIntensity: 0.15,
  });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.56, 0.72), boxMat);
  box.castShadow = true;
  grp.add(box);

  // Ribbon straps
  const ribMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 });
  [[0.72, 0.06, 0.18], [0.18, 0.06, 0.72]].forEach(([w, h, d]) => {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ribMat);
    rib.position.y = 0.29;
    grp.add(rib);
  });

  // Bow on top
  const bowMat = new THREE.MeshStandardMaterial({ color: 0xff4488, emissive: 0xff2266, emissiveIntensity: 0.4 });
  [-1, 1].forEach(side => {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.035, 6, 10), bowMat);
    loop.position.set(side * 0.1, 0.32, 0);
    loop.rotation.y = Math.PI / 4;
    grp.add(loop);
  });

  // Glow ring around base
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.03, 8, 32),
    new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.6 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.32;
  grp.add(ring);

  // Orbiting glow halo
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 10, 8),
    new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.08, side: THREE.BackSide }),
  );
  grp.add(halo);

  // Point light
  const pl = new THREE.PointLight(colorHex, 1.2, 6);
  pl.position.y = 0.3;
  grp.add(pl);

  scene.add(grp);

  // Float + spin animation
  const baseY = y;
  const phase = index * (Math.PI * 2 / 7);
  _mover(scene, (t, dt) => {
    grp.position.y = baseY + Math.sin(t * 1.8 + phase) * 0.22;
    grp.rotation.y += dt * 0.9;
    ring.material.opacity = 0.45 + Math.sin(t * 2.5 + phase) * 0.2;
    pl.intensity = 1.0 + Math.sin(t * 3.1 + phase) * 0.35;
  });

  _regCollectible(scene, grp, x, y, z, 15, 1.1);
}

// ─── goal beacon — landing pad + rings ──────────────────────────────────────
function _buildDeliveryBeacon(scene, x, y, z) {
  // Landing pad base
  const padCanvas = document.createElement('canvas');
  padCanvas.width = padCanvas.height = 256;
  const pc = padCanvas.getContext('2d');
  pc.fillStyle = '#1a2a4a';
  pc.fillRect(0, 0, 256, 256);
  pc.strokeStyle = '#ffdd00';
  pc.lineWidth = 6;
  pc.strokeRect(12, 12, 232, 232);
  // H marking
  pc.font = 'bold 140px Arial';
  pc.fillStyle = '#ffdd00';
  pc.textAlign = 'center';
  pc.textBaseline = 'middle';
  pc.fillText('H', 128, 128);
  // Concentric circles
  pc.strokeStyle = 'rgba(255,220,0,0.4)';
  pc.lineWidth = 4;
  [80, 55].forEach(r => {
    pc.beginPath(); pc.arc(128, 128, r, 0, Math.PI * 2); pc.stroke();
  });
  const padTex = new THREE.CanvasTexture(padCanvas);

  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(3.6, 3.6, 0.06, 32),
    new THREE.MeshStandardMaterial({ map: padTex, roughness: 0.7, metalness: 0.3 }),
  );
  pad.position.set(x, y + 0.04, z);
  scene.add(pad);

  // Perimeter runway lights
  const lightBulbMat = new THREE.MeshStandardMaterial({
    color: 0xffee44, emissive: 0xffdd00, emissiveIntensity: 1.2,
  });
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), lightBulbMat);
    bulb.position.set(x + Math.cos(ang) * 3.8, y + 0.15, z + Math.sin(ang) * 3.8);
    scene.add(bulb);
  }

  // Three spinning rings
  const ringColors = [0xffdd00, 0x4ac8ff, 0xff4488];
  const ringRadii  = [2.4, 1.8, 1.2];
  const ringTubes  = [0.10, 0.07, 0.05];
  const rings = ringColors.map((col, i) => {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(ringRadii[i], ringTubes[i], 14, 80),
      new THREE.MeshStandardMaterial({
        color: col, emissive: col, emissiveIntensity: 0.9,
        metalness: 0.4, roughness: 0.2,
      }),
    );
    r.position.set(x, y + 1.6 + i * 0.7, z);
    scene.add(r);
    return r;
  });

  // Center orb
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffdd88, emissiveIntensity: 1.4,
      metalness: 0.2, roughness: 0.1 }),
  );
  orb.position.set(x, y + 2.8, z);
  scene.add(orb);

  // Sky beam
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 50, 8),
    new THREE.MeshBasicMaterial({ color: 0xffee88, transparent: true, opacity: 0.12, depthWrite: false }),
  );
  beam.position.set(x, y + 27, z);
  scene.add(beam);

  // Ground glow disc
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(4.5, 40),
    new THREE.MeshBasicMaterial({ color: 0xffdd00, transparent: true, opacity: 0.08,
      side: THREE.DoubleSide, depthWrite: false }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(x, y + 0.01, z);
  scene.add(disc);

  // Point lights
  const pl1 = new THREE.PointLight(0xffdd00, 5.0, 18);
  pl1.position.set(x, y + 2.5, z);
  scene.add(pl1);
  const pl2 = new THREE.PointLight(0x4ac8ff, 2.0, 28);
  pl2.position.set(x, y + 1.0, z);
  scene.add(pl2);

  // Billboard label
  const lblCv = document.createElement('canvas');
  lblCv.width = 320; lblCv.height = 80;
  const lc = lblCv.getContext('2d');
  lc.fillStyle = 'rgba(10,20,50,0.85)';
  if (lc.roundRect) lc.roundRect(4, 4, 312, 72, 12); else lc.fillRect(4, 4, 312, 72);
  lc.fill();
  lc.strokeStyle = '#ffdd00'; lc.lineWidth = 3; lc.stroke();
  lc.fillStyle = '#ffffff'; lc.font = 'bold 28px Arial';
  lc.textAlign = 'center'; lc.textBaseline = 'middle';
  lc.fillText('✈ DELIVERY HUB', 160, 28);
  lc.fillStyle = '#ffdd88'; lc.font = '18px Arial';
  lc.fillText('Collect all 7 packages!', 160, 56);
  const lblTex = new THREE.CanvasTexture(lblCv);
  const lbl = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 1.05),
    new THREE.MeshBasicMaterial({ map: lblTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
  );
  lbl.position.set(x, y + 5.5, z);
  scene.add(lbl);

  // Upward gold particles
  const N = 160;
  const pPos = new Float32Array(N * 3);
  const pVel = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.random() * 3.2;
    pPos[i * 3]     = x + Math.cos(a) * r;
    pPos[i * 3 + 1] = y + Math.random() * 9;
    pPos[i * 3 + 2] = z + Math.sin(a) * r;
    pVel[i] = 0.8 + Math.random() * 1.4;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pPts = new THREE.Points(pGeo,
    new THREE.PointsMaterial({ color: 0xffee44, size: 0.14, transparent: true, opacity: 0.7 }));
  scene.add(pPts);

  // Animations
  _mover(scene, (t, dt) => {
    // Ring rotation
    rings[0].rotation.y += 0.55 * dt;
    rings[1].rotation.x -= 0.90 * dt;
    rings[2].rotation.y += 1.80 * dt;
    // Orb pulse
    const sc = 0.95 + Math.sin(t * 3.2) * 0.08;
    orb.scale.setScalar(sc);
    // Light flicker
    pl1.intensity = 4.5 + Math.sin(t * 3.8) * 0.9;
    // Label billboard (always faces camera — handled via simple Y look)
    // Pad pulse
    disc.material.opacity = 0.06 + Math.sin(t * 2.4) * 0.04;
    // Particles rise
    for (let i = 0; i < N; i++) {
      pPos[i * 3 + 1] += pVel[i] * dt;
      if (pPos[i * 3 + 1] > y + 9.5) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * 3.2;
        pPos[i * 3]     = x + Math.cos(a) * r;
        pPos[i * 3 + 1] = y + 0.1;
        pPos[i * 3 + 2] = z + Math.sin(a) * r;
      }
    }
    pGeo.attributes.position.needsUpdate = true;
  });

  _finishZone(scene, x, z, 4.5);
}

// ─── island props ─────────────────────────────────────────────────────────────
function _buildSignpost(scene, x, y, z, text = 'GO!') {
  const postMat = new THREE.MeshLambertMaterial({ color: 0x8a5c28 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.4, 6), postMat);
  post.position.set(x, y + 0.7, z);
  scene.add(post);

  const signCv = document.createElement('canvas');
  signCv.width = 128; signCv.height = 64;
  const sc = signCv.getContext('2d');
  sc.fillStyle = '#ffe8a0'; sc.fillRect(0, 0, 128, 64);
  sc.strokeStyle = '#885522'; sc.lineWidth = 4; sc.strokeRect(2, 2, 124, 60);
  sc.fillStyle = '#443311'; sc.font = 'bold 28px Arial';
  sc.textAlign = 'center'; sc.textBaseline = 'middle';
  sc.fillText(text, 64, 32);
  const signTex = new THREE.CanvasTexture(signCv);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.4),
    new THREE.MeshLambertMaterial({ map: signTex, side: THREE.DoubleSide }),
  );
  sign.position.set(x, y + 1.55, z);
  scene.add(sign);
}

function _buildTree(scene, x, y, z, h = 1.0) {
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x7a4820 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, h, 6), trunkMat);
  trunk.position.set(x, y + h / 2, z);
  scene.add(trunk);

  const leafMat = new THREE.MeshLambertMaterial({ color: 0x3a9a28 });
  [[0, h + 0.45, 0, 0.72], [0, h + 0.9, 0, 0.52], [0, h + 1.25, 0, 0.32]].forEach(([dx, dy, dz, r]) => {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(r, r * 1.4, 7), leafMat);
    leaf.position.set(x + dx, y + dy, z + dz);
    leaf.castShadow = true;
    scene.add(leaf);
  });
}

function _buildLantern(scene, x, y, z) {
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x444466 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.6, 5), poleMat);
  pole.position.set(x, y + 0.8, z);
  scene.add(pole);

  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xffee88, emissive: 0xffcc44, emissiveIntensity: 0.8,
    transparent: true, opacity: 0.85,
  });
  const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.22), lanternMat);
  lantern.position.set(x, y + 1.74, z);
  scene.add(lantern);

  const pl = new THREE.PointLight(0xffcc44, 0.9, 5);
  pl.position.set(x, y + 1.8, z);
  scene.add(pl);
}

function _buildBarrel(scene, x, y, z) {
  const mat = new THREE.MeshLambertMaterial({ color: 0x7a4820 });
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.45, 10), mat);
  barrel.position.set(x, y + 0.22, z);
  barrel.castShadow = true;
  scene.add(barrel);
}

// ─── distant background islands ──────────────────────────────────────────────
function _buildBackgroundIslands(scene) {
  const mats = [
    new THREE.MeshLambertMaterial({ color: 0x4a8a22 }),
    new THREE.MeshLambertMaterial({ color: 0x3a7818 }),
  ];
  [
    [-55, 8, -85, 12, 8],
    [58, 12, -95, 10, 7],
    [-42, 16, -108, 14, 9],
    [68, 5, -55, 8, 6],
    [-62, 18, -50, 9, 7],
  ].forEach(([x, y, z, w, d], i) => {
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, d), mats[i % 2]);
    top.position.set(x, y, z); scene.add(top);
    const earth = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.32, w * 0.18, 2.5, 6),
      new THREE.MeshLambertMaterial({ color: 0x6a4e22 }));
    earth.position.set(x, y - 1.6, z); scene.add(earth);
    // Tiny tree on each
    _buildTree(scene, x, y + 0.4, z, 0.8);
  });
}

// ─── main export ─────────────────────────────────────────────────────────────
export function buildSkyIslandArena(scene) {
  // Allow camera to follow all the way to Island 3
  scene.userData.arenaBounds = { camMinZ: -95, camMaxX: 28 };
  // Tell sim-visual-polish.js to skip its generic sky gradient + generic decorations
  // (we supply our own full sky dome and props)
  scene.userData.customSky = true;
  scene.userData.customDecor = true;

  // Clear legacy background/fog
  scene.background = null;
  scene.fog = new THREE.FogExp2(0x9acfee, 0.006);

  // ── Sky + atmosphere ──
  _buildSkyDome(scene);
  _buildCloudLayer(scene);
  _buildWindParticles(scene);
  _buildBackgroundIslands(scene);

  // ── Lighting: bright blue-sky day ──
  scene.add(new THREE.AmbientLight(0x88bbdd, 0.55));
  const hemi = new THREE.HemisphereLight(0x7ec8f4, 0x4a8820, 0.65);
  scene.add(hemi);

  // Warm sun from upper-left
  const sun = new THREE.DirectionalLight(0xfff5e0, 1.55);
  sun.position.set(-20, 40, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 180;
  sun.shadow.camera.left = -60; sun.shadow.camera.right = 60;
  sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
  scene.add(sun);

  // Fill light from right
  const fill = new THREE.DirectionalLight(0xaaddff, 0.38);
  fill.position.set(18, 12, -20); scene.add(fill);

  // Spawn warmth
  const spawnPl = new THREE.PointLight(0xffeedd, 0.7, 20);
  spawnPl.position.set(0, 5, 0); scene.add(spawnPl);

  // ── Islands ──
  _buildIsland(scene, 0,    0,    0,   22, 18, 1.4);  // Island 1 — spawn depot
  _buildIsland(scene, 0,   -0.8, -42,  16, 12, 1.2);  // Island 2 — waypoint
  _buildIsland(scene, 6,   -1.5, -74,  14, 10, 1.1);  // Island 3 — delivery hub

  // ── Bridges ──
  _buildBridge(scene, 0, -9,  0, -33, -0.3);
  _buildBridge(scene, 0, -51, 6, -69, -1.0);

  // ── Island 1 props ──
  _buildWindmill(scene, 8, 0.7, -8);
  _buildTree(scene,   -7, 0.7, -5,  1.3);
  _buildTree(scene,   -5, 0.7, -12, 1.1);
  _buildTree(scene,    6, 0.7,  6,  0.9);
  _buildSignpost(scene, -3, 0.7, 7, 'START');
  _buildLantern(scene,   2, 0.7, 7.5);
  _buildLantern(scene,  -2, 0.7, 7.5);
  _buildBarrel(scene,    5, 0.7, -14);
  _buildBarrel(scene,   -6, 0.7, -14);

  // ── Island 2 props ──
  _buildTree(scene,  -5.5, -0.1, -44, 1.0);
  _buildTree(scene,   5.5, -0.1, -39, 0.85);
  _buildSignpost(scene, 0, -0.1, -35, 'KEEP GOING!');
  _buildLantern(scene, -6.5, -0.1, -40);
  _buildLantern(scene,  6.5, -0.1, -40);
  _buildBarrel(scene,   4,   -0.1, -48);

  // ── Island 3 props (delivery hub) ──
  _buildTree(scene, 1,  -0.8, -76, 0.9);
  _buildTree(scene, 12, -0.8, -72, 0.85);
  _buildLantern(scene, 2,  -0.8, -70);
  _buildLantern(scene, 10, -0.8, -78);
  _buildSignpost(scene, 10, -0.8, -72, 'DELIVER!');

  // ── 7 Delivery packages (glowing collectibles) ──
  // Island 1: 3 packages
  _buildPackage(scene, -4.5, 1.9,  -2,   0x4ac8ff, 0);
  _buildPackage(scene,  4.2, 1.9,  -5,   0xff8844, 1);
  _buildPackage(scene,  1.5, 1.9, -14,   0x88ff44, 2);
  // Island 2: 2 packages
  _buildPackage(scene, -3.5, 1.1, -39,   0xffdd44, 3);
  _buildPackage(scene,  3.0, 1.1, -44,   0xff44cc, 4);
  // Island 3: 2 packages (near goal)
  _buildPackage(scene, -1.5, 0.4, -72,   0x44ffcc, 5);
  _buildPackage(scene,  4.5, 0.4, -78,   0xcc88ff, 6);

  // ── Goal beacon — Island 3 delivery hub ──
  _buildDeliveryBeacon(scene, 6, -1.5, -74);

  // ── Ambient cloud puff decorations near play area ──
  [
    [-28, 3, -15], [35, 5, -25], [-38, 7, -55], [30, 4, -68], [-25, 6, -90],
  ].forEach(([cx, cy, cz]) => {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
    for (let i = 0; i < 5; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(2.2 + Math.random() * 2.2, 8, 5), mat,
      );
      puff.position.set(
        cx + (Math.random() - 0.5) * 10,
        cy + (Math.random() - 0.5) * 2,
        cz + (Math.random() - 0.5) * 8,
      );
      scene.add(puff);
    }
  });
}
