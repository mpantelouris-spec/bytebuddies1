import { assetUrl } from './assetUrl';

const POSE_V = 'v1';
const POSE_SLUGS = {
  Adventurer: 'adventurer',
  Explorer: 'explorer',
  Sporty: 'sporty',
  Coder: 'coder',
  Warrior: 'warrior',
  Archer: 'archer',
  Wizard: 'wizard',
  Knight: 'knight',
  Robot: 'robot',
  Mechanic: 'mechanic',
  RoboDog: 'robodog',
  Drone: 'drone',
};

export function costumeStem(name) {
  const s = String(name || 'sprite').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  return s || 'sprite';
}

function slot(name, sprite, extra = {}) {
  return {
    name,
    svgKey: sprite.svgKey || sprite.name || null,
    color: sprite.color ?? null,
    customImage: sprite.customImage,
    w: sprite.baseW || sprite.w || 48,
    h: sprite.baseH || sprite.h || 48,
    ...extra,
  };
}

export function poseFilesForSprite(name) {
  const key = Object.keys(POSE_SLUGS).find((n) => n.toLowerCase() === String(name || '').toLowerCase());
  if (!key) return [];
  const slug = POSE_SLUGS[key];
  return [
    { name: key, file: `/assets/characters/chibi/chibi_${slug}.png?o=1&v=28` },
    { name: `${key} walk`, file: `/assets/characters/chibi/poses/chibi_${slug}_walk.png?o=1&${POSE_V}` },
    { name: `${key} jump`, file: `/assets/characters/chibi/poses/chibi_${slug}_jump.png?o=1&${POSE_V}` },
    { name: `${key} cheer`, file: `/assets/characters/chibi/poses/chibi_${slug}_cheer.png?o=1&${POSE_V}` },
  ];
}

export function defaultCostumesForSprite(sprite) {
  const name = String(sprite.name || 'costume').trim() || 'costume';
  const poses = poseFilesForSprite(name);
  if (poses.length) {
    return poses.map((p, i) => slot(p.name, sprite, {
      customImage: p.file,
      flipX: false,
      hue: 0,
      tilt: 0,
    }));
  }
  const idle = slot(name, sprite);
  if (!sprite.customImage) return [idle];
  return [idle, slot(`${name}-b`, sprite, { flipX: true })];
}

export function isPlaceholderCostumeList(costumes, sprite) {
  if (!Array.isArray(costumes) || !costumes.length) return true;
  if (poseFilesForSprite(sprite?.name).length) {
    if (costumes.some((c) => c.hue || c.tilt)) return true;
    const names = costumes.map((c) => String(c.name || '').toLowerCase());
    const hasPose = names.some((n) => n.includes('walk') || n.includes('jump') || n.includes('cheer'));
    if (!hasPose) return true;
  }
  if (costumes.length !== 1) return false;
  const c = costumes[0];
  const n = String(c.name || '').toLowerCase().replace(/\s+/g, '');
  const stem = costumeStem(sprite?.name);
  if (n !== 'costume1' && n !== stem && n !== String(sprite?.name || '').toLowerCase()) return false;
  const img = c.customImage || sprite?.customImage || '';
  return typeof img === 'string' && img.includes('/assets/');
}

export function isLegacyBakedPack(costumes, sprite) {
  if (!Array.isArray(costumes) || costumes.length !== 4) return false;
  const stem = costumeStem(sprite?.name);
  const names = costumes.map((c) => String(c.name || '').toLowerCase());
  if (names[0] !== stem || names[1] !== `${stem}-b`) return false;
  return String(costumes[1]?.customImage || '').startsWith('data:');
}

export function fitCostumeDimensions(nw, nh, max = 200) {
  const scale = max / Math.max(nw || 1, nh || 1, 1);
  return {
    w: Math.max(16, Math.round((nw || 48) * scale)),
    h: Math.max(16, Math.round((nh || 48) * scale)),
  };
}

export function nextSurpriseCostume(sprite, costumes = []) {
  const pack = defaultCostumesForSprite(sprite);
  const have = new Set((costumes || []).map((c) => String(c.customImage || '').split('?')[0]));
  const unused = pack.filter((p) => !have.has(String(p.customImage || '').split('?')[0]));
  if (unused.length) return unused[Math.floor(Math.random() * unused.length)];
  const idle = pack[0] || costumes[0] || slot(sprite.name || 'costume', sprite);
  return { ...idle, name: `${sprite.name || 'costume'}-b`, flipX: true, hue: 0, tilt: 0 };
}

export function loadCostumeDimensions(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve({ w: 48, h: 48 });
      return;
    }
    const img = new Image();
    img.onload = () => resolve(fitCostumeDimensions(img.naturalWidth, img.naturalHeight));
    img.onerror = () => resolve({ w: 48, h: 48 });
    img.src = assetUrl(src);
  });
}
