/**
 * MissionRouteKit — PBR mission route strip, checkpoint arches, start gantry.
 */
import * as THREE from 'three';
import { arenaMover } from '../ArenaBuilderCore.js';
import { kidSafeText } from '../../data/primary-robot-studio.js';

function canvasRoundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function makeMissionRoadTexture(accentHex, stripeHex, familyId) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  const base = { industrial: '#374151', martian: '#a84a27', underwater: '#cfba85', sandbox: '#eef3f8', emergency: '#596477', spider_climber: '#65734a', cyber_ninja: '#25314a' }[familyId] || '#38465c';
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 16) {
    for (let x = 0; x < 512; x += 16) {
      ctx.fillStyle = `rgba(255,255,255,${0.015 + Math.random() * 0.04})`;
      ctx.fillRect(x, y, 16, 16);
    }
  }
  if (familyId === 'industrial') {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.setLineDash([28, 18]);
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.strokeStyle = `#${stripeHex.toString(16).padStart(6, '0')}`;
  ctx.lineWidth = 4;
  ctx.setLineDash([22, 16]);
  ctx.beginPath();
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 512);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = `#${accentHex.toString(16).padStart(6, '0')}`;
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 500, 500);
  const tex = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 8);
  return tex;
}

function buildRoadStrip(scene, curve, theme, familyId) {
  const accent = theme.path || 0x22c55e;
  const glow = theme.glow || 0x06b6d4;
  const martianDirt = scene.userData.chassisVisualDna?.floorKind === 'martian_dirt';
  const roadTex = makeMissionRoadTexture(accent, glow, familyId);
  const pts = [];
  for (let i = 0; i <= 80; i++) pts.push(curve.getPoint(i / 80).clone().setY(0.12));
  // A road is a ribbon, not a tube: the old 2.85m radius tube engulfed
  // robots, hid landmarks and rendered like a giant pipe along the route.
  const positions = [], uvs = [], indices = [];
  pts.forEach((point, i) => {
    const tangent = curve.getTangent(i / 80);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    for (const side of [-1, 1]) {
      positions.push(point.x + normal.x * 2.85 * side, point.y, point.z + normal.z * 2.85 * side);
      uvs.push(side === -1 ? 0 : 1, i / 80);
    }
    if (i < 80) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: roadTex,
    emissive: martianDirt ? 0x000000 : glow,
    emissiveIntensity: martianDirt ? 0 : 0.025,
    roughness: martianDirt ? 0.94 : 0.86,
    metalness: martianDirt ? 0 : 0.04,
  });
  const road = new THREE.Mesh(geo, mat);
  road.name = 'MissionPBRoad';
  road.receiveShadow = true;
  scene.add(road);

  [-3.2, 3.2].forEach((side) => {
    const kerbPts = pts.map((p, i) => {
      const t = i / 80;
      const tan = curve.getTangent(t).normalize();
      const yaw = Math.atan2(tan.x, tan.z);
      const ox = Math.cos(yaw) * side;
      const oz = -Math.sin(yaw) * side;
      return p.clone().add(new THREE.Vector3(ox, 0.08, oz));
    });
    const kerbPath = new THREE.CatmullRomCurve3(kerbPts);
    const kerbGeo = new THREE.TubeGeometry(kerbPath, 80, 0.12, 6, false);
    const kerbMat = new THREE.MeshStandardMaterial({
      color: accent,
      emissive: martianDirt ? 0x000000 : glow,
      emissiveIntensity: martianDirt ? 0 : 0.42,
      roughness: martianDirt ? 0.92 : 0.35,
      metalness: martianDirt ? 0 : 0.35,
    });
    const kerb = new THREE.Mesh(kerbGeo, kerbMat);
    kerb.name = 'MissionKerbs';
    scene.add(kerb);
  });
}

function buildCheckpointArches(scene, curve, accent) {
  const cps = scene.userData.chassisCheckpoints || [];
  const legacyCheckpoints = [];
  scene.traverse((o) => {
    if (o.name === 'cp') legacyCheckpoints.push(o);
  });
  // Three.js traversal iterates the live children array; removing during it
  // skips nodes and can abort the entire mission-world build.
  legacyCheckpoints.forEach(o => o.removeFromParent());
  const cols = [accent, 0x22c55e];
  cps.forEach((cp, ci) => {
    const col = cols[ci % cols.length];
    const t = (ci + 1) / (cps.length + 1);
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const yaw = Math.atan2(tan.x, tan.z);
    const archMat = new THREE.MeshStandardMaterial({
      color: col, emissive: col, emissiveIntensity: 0.55, transparent: true, opacity: 0.92,
    });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.16, 10, 24, Math.PI), archMat);
    arch.position.set(p.x, 1.35, p.z);
    arch.rotation.y = yaw;
    arch.name = 'MissionCpArch';
    scene.add(arch);
    [-2.5, 2.5].forEach((ox) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.14, 2.6, 8),
        archMat,
      );
      const lx = p.x + Math.cos(yaw) * ox;
      const lz = p.z - Math.sin(yaw) * ox;
      post.position.set(lx, 1.3, lz);
      scene.add(post);
    });
    arenaMover(scene, (time) => {
      archMat.emissiveIntensity = 0.5 + Math.sin(time * 3 + ci) * 0.12;
    });
    cp.x = p.x;
    cp.z = p.z;
  });
}

function buildStartGantry(scene, curve, title, subtitle, accent) {
  if (scene.getObjectByName('MissionStartGantry')) return;
  const start = curve.getPoint(0);
  const tan = curve.getTangent(0).normalize();
  const yaw = Math.atan2(tan.x, tan.z);
  const gantry = new THREE.Group();
  gantry.name = 'MissionStartGantry';
  const poleMat = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.35 });
  [-3.2, 3.2].forEach((ox) => {
    const lx = start.x + Math.cos(yaw) * ox;
    const lz = start.z - Math.sin(yaw) * ox;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 4.2, 10), poleMat);
    pole.position.set(lx, 2.1, lz);
    gantry.add(pole);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.35, 0.35), poleMat);
  beam.position.set(start.x, 4.0, start.z);
  beam.rotation.y = yaw;
  gantry.add(beam);

  const cnv = document.createElement('canvas');
  cnv.width = 640;
  cnv.height = 120;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = 'rgba(8,12,24,0.9)';
  canvasRoundRect(ctx, 8, 8, 624, 104, 12);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((title || 'MISSION').slice(0, 32), 320, 48);
  ctx.fillStyle = '#dbeafe';
  ctx.font = '600 18px system-ui,sans-serif';
  ctx.fillText((subtitle || 'REACH THE GLOWING GOAL').slice(0, 58), 320, 82);
  const signTexture = new THREE.CanvasTexture(cnv);
  if (THREE.SRGBColorSpace) signTexture.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 1.0),
    new THREE.MeshBasicMaterial({ map: signTexture, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
  );
  sign.position.set(start.x, 4.8, start.z);
  // Face the incoming robot; route tangents point away from the start camera.
  sign.rotation.y = yaw + Math.PI;
  gantry.add(sign);
  scene.add(gantry);
}

/** Replace legacy box tiles with PBR route presentation. */
export function applyMissionRoutePresentation(scene, curve, theme, challenge, familyId) {
  if (!curve || scene.getObjectByName('MissionPBRoad')) return;

  const legacy = scene.getObjectByName('MissionLegacyRoute');
  if (legacy) {
    legacy.visible = false;
  }
  scene.traverse((o) => {
    if (o.name === 'NeonRouteRibbon' || o.name === 'MissionCinematicRoot') o.visible = false;
  });

  buildRoadStrip(scene, curve, theme, familyId);
  buildCheckpointArches(scene, curve, theme.path || 0x22c55e);
  const title = kidSafeText(challenge?.shortName || challenge?.modeName || challenge?.catalogName || challenge?.name || 'Mission');
  const objective = kidSafeText(theme.goalDescription
    || challenge?.desc
    || challenge?.modeSpec?.gameplayDescription?.match?.(/Objective:\s*([^.]*)/i)?.[1]
    || challenge?.primaryObjective?.label
    || 'Reach the glowing goal');
  buildStartGantry(scene, curve, title, objective, theme.path || 0x38bdf8);
}
