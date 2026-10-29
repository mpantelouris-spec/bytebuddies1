/**
 * Real characters for the fighting worlds — the KayKit Adventurers and Skeletons packs
 * by Kay Lousberg (CC0, public/models/fighters). Each is a rigged, animated character with
 * its own gear. Weapons are toys: foam swords, a wooden practice sword, bamboo sticks, a star wand.
 *
 * The fight engine asks a fighter to play a move by name (jab, cross, block, hit, knockdown,
 * victory…). Here each move plays a real animation in that character's style: a knight's
 * "cross" is a diagonal sword slice, a mage's is a spell cast.
 *
 * Same userData API as the boxers: setAnimState(state, dur), animate(t, dt), setTimeScale, setHealthPct.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const BASE = `${(typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/'}models/fighters/`;
const HEIGHT = 1.95;          // chunky chibi build: a little shorter than the boxers so they don't crowd each other
const cache = new Map();
const load = (path) => {
  if (!cache.has(path)) cache.set(path, new GLTFLoader().loadAsync(BASE + path));
  return cache.get(path);
};

/** Who each fighting world uses. show = which of the model's own accessories to keep. */
export const KAYKIT_CAST = {
  knight: { file: 'Knight', show: ['Badge_Shield', 'Knight_Helmet', 'Knight_Cape'], right: { toy: 'foamSword', color: 0x3b82f6 }, style: 'sword' },
  skeletonknight: { file: 'Skeleton_Warrior', show: ['Skeleton_Warrior_Helmet', 'Skeleton_Warrior_Cloak'], right: { toy: 'foamSword', color: 0xa855f7 }, left: 'shield_round', style: 'sword' },
  swordmaster: { file: 'Rogue', show: ['Rogue_Cape'], right: { toy: 'woodSword' }, style: 'twohand' },
  ninja: { file: 'Rogue_Hooded', show: ['Rogue_Cape'], right: { toy: 'bamboo' }, left: { toy: 'bamboo' }, style: 'dual', tint: 0x3a3550 },
  captain: { file: 'Barbarian', show: ['Barbarian_Cape'], right: { toy: 'foamSword', color: 0xf97316, guard: 0xfacc15 }, style: 'sword' },
  skeletonpirate: { file: 'Skeleton_Rogue', show: ['Skeleton_Rogue_Hood', 'Skeleton_Rogue_Cape'], right: { toy: 'foamSword', color: 0x22c55e }, left: { toy: 'foamSword', color: 0x22c55e, short: true }, style: 'dual' },
  mage: { file: 'Mage', show: ['2H_Staff', 'Mage_Hat', 'Mage_Cape'], style: 'magic' },
  skeletonmage: { file: 'Skeleton_Mage', show: ['Skeleton_Mage_Hat'], right: { toy: 'starWand' }, style: 'magic' },
};
export const isKayKitOutfit = (name) => Boolean(KAYKIT_CAST[name]) || name === 'dummy';

/** The body itself is always shown; everything else (weapons, hats, capes) only if listed. */
const BODY_PART = /(Arm(Left|Right)|_Body|_Head|Leg(Left|Right)|_Eyes|_Jaw|_Skull)/;

/* Fight moves → animation clips, per fighting style (first clip found wins) */
const COMMON = {
  idle: ['Idle_Combat', 'Idle'],
  block: ['Block'], hit: ['Hit_A'], stagger: ['Hit_B'], kick_hit: ['Hit_B'], kick_heavy_hit: ['Hit_B'], block_kick: ['Block_Hit'],
  dodge: ['Dodge_Backward'], knockdown: ['Death_A'], victory: ['Cheer'],
  advance: ['Walking_A'], retreat: ['Walking_Backwards'],
  kick: ['Unarmed_Melee_Attack_Kick'], light_kick: ['Unarmed_Melee_Attack_Kick'], sweep: ['Unarmed_Melee_Attack_Kick'],
  heavy_kick: ['2H_Melee_Attack_Chop'], roundhouse: ['2H_Melee_Attack_Spin'],
};
const STYLES = {
  sword: { jab: ['1H_Melee_Attack_Stab'], cross: ['1H_Melee_Attack_Slice_Diagonal'], hook: ['1H_Melee_Attack_Slice_Horizontal'], uppercut: ['1H_Melee_Attack_Chop'], low_punch: ['1H_Melee_Attack_Stab'] },
  twohand: { idle: ['2H_Melee_Idle', 'Idle'], jab: ['2H_Melee_Attack_Stab'], cross: ['2H_Melee_Attack_Slice'], hook: ['2H_Melee_Attack_Slice'], uppercut: ['2H_Melee_Attack_Chop'], low_punch: ['2H_Melee_Attack_Stab'] },
  dual: { jab: ['Dualwield_Melee_Attack_Stab'], cross: ['Dualwield_Melee_Attack_Slice'], hook: ['Dualwield_Melee_Attack_Chop'], uppercut: ['1H_Melee_Attack_Chop'], low_punch: ['Dualwield_Melee_Attack_Stab'] },
  magic: { jab: ['Spellcast_Raise'], cross: ['Spellcast_Shoot'], uppercut: ['Spellcast_Long'], hook: ['1H_Melee_Attack_Slice_Horizontal'], low_punch: ['Spellcast_Raise'] },
};
const LOOPING = new Set(['idle', 'victory', 'advance', 'retreat']);
const ALIASES = { celebrate: 'victory', attack: 'jab', punch: 'jab', heavy: 'cross', guard: 'idle' };

/** Wrap a group so its feet stand on y = 0, scaled to the fighters' height. */
function normalise(model) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3();
  model.traverse((o) => { if (o.isMesh && o.visible && BODY_PART.test(o.name)) box.expandByObject(o); });
  if (box.isEmpty()) box.setFromObject(model);
  const h = box.max.y - box.min.y || 1;
  const s = HEIGHT / h;
  model.scale.multiplyScalar(s);
  model.position.y -= box.min.y * s;
}

/* ── Toy weapons: foam swords, a wooden practice sword, bamboo sticks, a star wand ──
 * Built along +y from the hand slot (grip below, blade above), the same way the KayKit
 * weapons are, in the model's own units (a one-handed sword is about 1.4 long). */
const soft = (color, rough = 0.85) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });
const piece = (geo, mat, y = 0) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; m.castShadow = true; return m; };
const TOYS = {
  // Bright foam blade with a rounded tip and a squashy round guard: nothing sharp anywhere
  foamSword({ color = 0x3b82f6, guard = 0xfde047, short = false }) {
    const g = new THREE.Group();
    const len = short ? 0.75 : 1.15;
    g.add(piece(new THREE.CylinderGeometry(0.07, 0.07, 0.34, 10), soft(0x334155), -0.17));
    g.add(piece(new THREE.SphereGeometry(0.1, 12, 10), soft(guard), -0.36));
    const cross = piece(new THREE.CapsuleGeometry(0.08, 0.36, 4, 10), soft(guard), 0.04);
    cross.rotation.z = Math.PI / 2;
    g.add(cross);
    const blade = piece(new THREE.CapsuleGeometry(0.12, len, 6, 14), soft(color), 0.14 + len / 2 + 0.06);
    blade.scale.z = 0.55;
    g.add(blade);
    // A white stripe down the middle, like a real foam practice sword
    const stripe = piece(new THREE.BoxGeometry(0.04, len * 0.85, 0.135), soft(0xffffff), 0.2 + len / 2);
    g.add(stripe);
    return g;
  },
  // Smooth wooden practice sword (a bokken): rounded, no edge
  woodSword() {
    const g = new THREE.Group();
    const wood = soft(0xc89b5e, 0.7);
    g.add(piece(new THREE.CylinderGeometry(0.065, 0.065, 0.55, 10), soft(0x7c2d12), -0.2));
    g.add(piece(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16), soft(0x111827), 0.1));
    const blade = piece(new THREE.CapsuleGeometry(0.075, 1.45, 6, 12), wood, 0.9);
    blade.scale.x = 1.3;
    g.add(blade);
    return g;
  },
  // Green bamboo practice stick with knots
  bamboo() {
    const g = new THREE.Group();
    g.add(piece(new THREE.CapsuleGeometry(0.06, 1.05, 4, 10), soft(0x84cc16, 0.6), 0.3));
    [-0.05, 0.3, 0.65].forEach((y) => g.add(piece(new THREE.TorusGeometry(0.062, 0.016, 6, 14).rotateX(Math.PI / 2), soft(0x4d7c0f), y)));
    return g;
  },
  // A wooden wand-staff topped with a glowing star
  starWand() {
    const g = new THREE.Group();
    g.add(piece(new THREE.CylinderGeometry(0.05, 0.06, 1.9, 10), soft(0x92400e, 0.7), 0.5));
    const shape = new THREE.Shape();
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 ? 0.11 : 0.26;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      if (i) shape.lineTo(Math.cos(a) * r, Math.sin(a) * r); else shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const star = piece(new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 }).center(),
      new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xfacc15, emissiveIntensity: 0.6, roughness: 0.5 }), 1.6);
    g.add(star);
    return g;
  },
};

function attachWeapon(model, slotName, item) {
  // three.js drops the dot from bone names when it loads them ("handslot.r" → "handslotr")
  const slot = model.getObjectByName(slotName) || model.getObjectByName(slotName.replace('.', ''));
  if (!slot || !item) return;
  if (item.toy) {
    const toy = TOYS[item.toy](item);
    toy.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
    slot.add(toy);
    return;
  }
  load(`weapons/${item}.gltf`).then((gltf) => {
    const w = gltf.scene.clone(true);
    w.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
    slot.add(w);
  }).catch(() => {});
}

/** A wooden practice dummy on a post: wobbles when it's hit. */
export function buildTrainingDummy() {
  const g = new THREE.Group();
  g.name = 'TrainingDummy';
  const wood = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
  const straw = new THREE.MeshStandardMaterial({ color: 0xd9b45a, roughness: 1 });
  const sack = new THREE.MeshStandardMaterial({ color: 0xc8a46e, roughness: 1 });
  const rope = new THREE.MeshStandardMaterial({ color: 0x7c5a2a, roughness: 1 });
  const mk = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };
  g.add(mk(new THREE.CylinderGeometry(0.55, 0.65, 0.18, 20), wood, 0, 0.09, 0));
  const body = new THREE.Group();
  body.position.y = 0.18;
  g.add(body);
  body.add(mk(new THREE.CylinderGeometry(0.07, 0.08, 1.3, 10), wood, 0, 0.65, 0));
  body.add(mk(new THREE.CylinderGeometry(0.36, 0.3, 0.9, 18), straw, 0, 1.2, 0));
  [0.95, 1.45].forEach((y) => { const r = mk(new THREE.TorusGeometry(0.35, 0.03, 6, 20), rope, 0, y, 0); r.rotation.x = Math.PI / 2; body.add(r); });
  const arms = mk(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 8), wood, 0, 1.45, 0);
  arms.rotation.z = Math.PI / 2;
  body.add(arms);
  body.add(mk(new THREE.SphereGeometry(0.27, 16, 12), sack, 0, 1.88, 0));
  [-0.09, 0.09].forEach((x) => { const e = mk(new THREE.BoxGeometry(0.06, 0.06, 0.02), new THREE.MeshStandardMaterial({ color: 0x3f2a14 }), x, 1.93, 0.25); body.add(e); });
  let wobble = 0;
  let wobbleT = 0;
  g.userData.setAnimState = (state) => { if (/hit|stagger|knock/.test(String(state))) { wobble = 0.35; wobbleT = 0; } };
  g.userData.animate = (t, dt = 1 / 60) => {
    wobbleT += dt;
    wobble *= Math.exp(-dt * 2.2);
    body.rotation.z = Math.sin(wobbleT * 14) * wobble;
  };
  g.userData.setTimeScale = () => {};
  g.userData.setHealthPct = () => {};
  g.userData.isKayKitFighter = true;
  g.userData.skipStudioPaint = true;
  return g;
}

/**
 * A KayKit character, ready for the fight engine. It appears as soon as its model has
 * loaded (a fraction of a second once cached); until then an invisible stand-in keeps its
 * place so the arena lines it up on the floor.
 */
export function buildKayKitFighter(name) {
  if (name === 'dummy') return buildTrainingDummy();
  const cast = KAYKIT_CAST[name];
  const g = new THREE.Group();
  g.name = `KayKit_${name}`;
  // Stand-in so the arena can line the fighter's feet up with the floor before the model arrives
  const standIn = new THREE.Mesh(new THREE.BoxGeometry(0.8, HEIGHT, 0.6), new THREE.MeshBasicMaterial({ visible: false }));
  standIn.position.y = HEIGHT / 2;
  g.add(standIn);

  const clipsFor = (state) => [...((STYLES[cast.style] || {})[state] || []), ...(COMMON[state] || [])];
  let mixer = null;
  const actions = {};
  let current = null;
  let currentState = '';
  let stateTimer = 0;
  let pending = null;
  let timeScale = 1;

  const pick = (state) => {
    for (const c of clipsFor(state)) if (actions[c]) return actions[c];
    return null;
  };
  const play = (state, dur = 0.5) => {
    state = ALIASES[state] || state || 'idle';
    if (!mixer) { pending = [state, dur]; return; }
    if (state === currentState && LOOPING.has(state)) return;
    const action = pick(state) || pick('hit') || pick('idle');
    if (!action) return;
    const loop = LOOPING.has(state);
    action.reset();
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    action.clampWhenFinished = !loop;
    // One-shot moves are sped up or slowed down to last as long as the engine's move does
    const clipDur = action.getClip().duration || 0.5;
    action.timeScale = loop ? 1 : THREE.MathUtils.clamp(clipDur / Math.max(0.15, dur), 0.6, 2.6);
    if (current && current !== action) action.crossFadeFrom(current, loop ? 0.25 : 0.1, false);
    action.play();
    current = action;
    currentState = state;
    stateTimer = loop ? Infinity : Math.max(0.15, dur) + (state === 'knockdown' ? 0.6 : 0.05);
  };

  load(`${cast.file}.glb`).then((gltf) => {
    const model = skeletonClone(gltf.scene);
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.frustumCulled = false;
      // Hide the gear this character doesn't carry
      o.visible = BODY_PART.test(o.name) || cast.show.includes(o.name);
      // The shadow ninja dresses in dark cloth (skin and blades keep their colours)
      if (cast.tint && /Body|Arm|Leg|Cape|Hooded/.test(o.name)) {
        o.material = o.material.clone();
        o.material.color.multiply(new THREE.Color(cast.tint).multiplyScalar(2));
      }
    });
    normalise(model);
    attachWeapon(model, 'handslot.r', cast.right);
    attachWeapon(model, 'handslot.l', cast.left);
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => { actions[clip.name] = mixer.clipAction(clip); });
    g.remove(standIn);
    g.add(model);
    const [s, d] = pending || ['idle', 1];
    pending = null;
    currentState = '';
    play(s, d);
  }).catch((err) => { console.warn('[KayKitFighters] could not load', cast.file, err); });

  g.userData.setAnimState = (state, dur) => play(state, dur);
  g.userData.animate = (t, dt = 1 / 60) => {
    if (!mixer) return;
    const step = Math.min(0.1, dt) * timeScale;
    mixer.update(step);
    stateTimer -= step;
    if (stateTimer <= 0 && currentState !== 'idle') {
      // Knocked down: get back up, then return to guard
      if (currentState === 'knockdown' && actions.Lie_StandUp) {
        currentState = 'getup';
        const a = actions.Lie_StandUp;
        a.reset(); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; a.timeScale = 1.4;
        if (current) a.crossFadeFrom(current, 0.15, false);
        a.play(); current = a;
        stateTimer = a.getClip().duration / 1.4;
        return;
      }
      play('idle');
    }
  };
  g.userData.setTimeScale = (s) => { timeScale = s; };
  g.userData.setHealthPct = () => {};
  g.userData.isKayKitFighter = true;
  g.userData.skipStudioPaint = true;
  return g;
}

/** Start loading a world's two characters early, so they appear straight away. */
export function preloadKayKit(names = []) {
  names.forEach((n) => { const c = KAYKIT_CAST[n]; if (c) { load(`${c.file}.glb`).catch(() => {}); [c.right, c.left].forEach((w) => { if (typeof w === 'string') load(`weapons/${w}.gltf`).catch(() => {}); }); } });
}
