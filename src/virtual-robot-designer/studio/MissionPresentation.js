/**
 * MissionPresentation — mission banner on load + family win celebration particles (Part 0 / Part 5).
 */
import * as THREE from 'three';
import { resolveArenaTheme } from '../services/sim-visual-polish.js';

function extractObjectiveLine(challenge = {}) {
  const gp = challenge?.modeSpec?.gameplayDescription || '';
  const m = gp.match(/Objective:\s*([^.]+)/i);
  if (m) return m[1].trim();
  if (challenge?.tagline) return challenge.tagline;
  if (challenge?.desc) return challenge.desc.slice(0, 64);
  return `Complete mode ${challenge?.modeIndex || 1}`;
}

function extractStarLine(challenge = {}) {
  const stars = challenge?.starRequirements || challenge?.modeSpec?.quickInfo?.stars;
  if (!stars) return '';
  return `⭐ ${stars.one || 'Win'} · ⭐⭐ ${stars.two || 'Fast'} · ⭐⭐⭐ ${stars.three || 'Perfect'}`;
}

export function spawnMissionBanner(scene, challenge = {}, arenaType = '') {
  if (scene.userData.combatMode || scene.userData.flappyMode) return;
  const capstone = challenge?.modeIndex === 10 && challenge?.isChassisMode;
  const title = capstone
    ? `${challenge.shortName || challenge.name || 'Capstone'} ★`
    : (challenge.shortName || challenge.name || challenge.environmentName || 'Robot Mission');
  const objective = extractObjectiveLine(challenge);
  const stars = extractStarLine(challenge);
  const sub = capstone
    ? 'CAPSTONE — combine every skill from modes 1–9'
    : `OBJECTIVE: ${objective}`;
  const cnv = document.createElement('canvas');
  cnv.width = 720;
  cnv.height = stars ? 200 : 176;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = 'rgba(15,23,42,0.92)';
  ctx.roundRect(12, 12, 696, cnv.height - 24, 16);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.slice(0, 32), 360, 56);
  ctx.font = 'bold 18px system-ui,sans-serif';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(sub.slice(0, 52), 360, 92);
  ctx.font = '16px system-ui,sans-serif';
  ctx.fillStyle = '#94a3b8';
  if (stars) ctx.fillText(stars.slice(0, 58), 360, 124);
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 15px system-ui,sans-serif';
  ctx.fillText('Hit checkpoints · reach green goal · press ▶ Simulate', 360, stars ? 162 : 138);
  const tex = new THREE.CanvasTexture(cnv);
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(9, stars ? 2.5 : 2.2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  banner.position.set(0, 6, 7);
  banner.name = 'MissionBanner';
  scene.add(banner);
  scene.userData.missionBanner = { mesh: banner, startT: null, duration: 3 };
  (scene.userData.movers = scene.userData.movers || []).push({
    update(t) {
      const mb = scene.userData.missionBanner;
      if (!mb?.mesh) return;
      if (mb.startT == null) mb.startT = t;
      const age = t - mb.startT;
      if (age > mb.duration) {
        scene.remove(mb.mesh);
        mb.mesh.material?.map?.dispose?.();
        mb.mesh.material?.dispose?.();
        scene.userData.missionBanner = null;
        return;
      }
      const fade = age < 0.4 ? age / 0.4 : age > mb.duration - 0.6 ? (mb.duration - age) / 0.6 : 1;
      mb.mesh.material.opacity = fade;
      mb.mesh.position.y = 5.5 + Math.sin(t * 2) * 0.08;
    },
  });
}

export function spawnWinCelebration(scene, x, y, z) {
  const theme = scene.userData.arenaTheme || resolveArenaTheme(scene.userData.arenaType || '', scene.userData.chassisModeChallenge);
  const kind = theme?.particles || 'spark';
  const capstone = scene.userData.capstoneCourse;
  const count = capstone ? 36 : (kind === 'bubble' ? 24 : kind === 'ember' ? 20 : 16);
  const col = new THREE.Color(theme?.accent || 0xfbbf24);
  const pts = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pts[i * 3] = (Math.random() - 0.5) * 3;
    pts[i * 3 + 1] = Math.random() * 2.5;
    pts[i * 3 + 2] = (Math.random() - 0.5) * 3;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const mat = new THREE.PointsMaterial({
    color: col, size: kind === 'star' ? 0.22 : 0.16, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const burst = new THREE.Points(geo, mat);
  burst.position.set(x, y, z);
  scene.add(burst);
  let burstStart = null;
  (scene.userData.movers = scene.userData.movers || []).push({
    update(t) {
      if (burstStart == null) burstStart = t;
      const age = t - burstStart;
      if (age > 1.8) {
        scene.remove(burst);
        geo.dispose();
        mat.dispose();
        return;
      }
      mat.opacity = 1 - age / 1.8;
      const pos = geo.attributes.position;
      for (let i = 0; i < count; i++) {
        pos.array[i * 3 + 1] += 0.04 + Math.random() * 0.02;
      }
      pos.needsUpdate = true;
    },
  });
}
