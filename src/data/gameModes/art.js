/**
 * Game Modes — small vector sprites (platforms, maze walls, drum pads…) as data URLs,
 * plus the character pictures they share with the sprite library.
 */
const svg = (w, h, body) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`,
)}`;

/** Characters trimmed to their outline (so touching and sizes match what you see). */
export const IMG = {
  robot: '/assets/gamemodes/robot.png',
  bot: '/assets/gamemodes/bot.png',
  rollbot: '/assets/gamemodes/rollbot.png',
  coin: '/assets/gamemodes/coin.png',
  trophy: '/assets/gamemodes/trophy.png',
  target: '/assets/gamemodes/target.png',
  apple: '/assets/gamemodes/apple.png',
  bomb: '/assets/gamemodes/bomb.png',
  orb: '/assets/gamemodes/orb.png',
  slime: '/assets/gamemodes/slime.png',
};

/** A grassy ledge to stand on. */
export function platform(w, h = 22) {
  return svg(w, h, `
    <rect x="0" y="4" width="${w}" height="${h - 4}" rx="6" fill="#8b5a2b"/>
    <rect x="0" y="0" width="${w}" height="9" rx="4.5" fill="#4ade80"/>
    <rect x="0" y="6" width="${w}" height="3" fill="#22c55e"/>
    ${Array.from({ length: Math.floor(w / 26) }, (_, i) => `<circle cx="${13 + i * 26}" cy="${14 + (i % 2) * 4}" r="2.2" fill="#a16207" opacity=".7"/>`).join('')}`);
}

/** A maze wall: dark block with a bright edge, easy to see on a light stage. */
export function wall(w, h) {
  return svg(w, h, `
    <rect width="${w}" height="${h}" rx="3" fill="#1e293b"/>
    <rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="2" fill="none" stroke="#38bdf8" stroke-width="2"/>`);
}

/** A checkered finish flag. */
export const flag = svg(40, 56, `
  <rect x="5" y="4" width="4" height="50" rx="2" fill="#e2e8f0"/>
  ${[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${9 + c * 7}" y="${6 + r * 7}" width="7" height="7" fill="${(r + c) % 2 ? '#111827' : '#ffffff'}"/>`).join('')).join('')}
  <rect x="9" y="6" width="28" height="21" fill="none" stroke="#111827" stroke-width="1"/>`);

/** A glowing drum pad / speaker for the Beat Lab. */
export function pad(color, label) {
  return svg(64, 64, `
    <defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#ffffff" stop-opacity=".85"/><stop offset=".45" stop-color="${color}"/><stop offset="1" stop-color="#0f172a"/></radialGradient></defs>
    <rect x="3" y="3" width="58" height="58" rx="14" fill="#0f172a" stroke="${color}" stroke-width="3"/>
    <circle cx="32" cy="32" r="20" fill="url(#g)"/>
    <text x="32" y="58" font-family="Arial" font-size="9" font-weight="700" text-anchor="middle" fill="#fff">${label}</text>`);
}

/** A slingshot-style launch pad. */
export const launcher = svg(56, 48, `
  <rect x="6" y="34" width="44" height="12" rx="4" fill="#475569"/>
  <path d="M16 36 L24 10 M40 36 L32 10" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
  <circle cx="28" cy="10" r="6" fill="#ef4444"/>`);

/* ── Arcade mode art ── */
/** A glowing paddle for Pong Bot. */
export const paddle = svg(96, 18, `
  <rect x="1" y="1" width="94" height="16" rx="8" fill="#0ea5e9" stroke="#e0f2fe" stroke-width="2"/>
  <rect x="10" y="4" width="76" height="4" rx="2" fill="#ffffff" opacity=".55"/>`);

/** A bouncy ball. */
export const ball = svg(26, 26, `
  <defs><radialGradient id="b" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#facc15"/><stop offset="1" stop-color="#ea580c"/></radialGradient></defs>
  <circle cx="13" cy="13" r="12" fill="url(#b)" stroke="#7c2d12" stroke-width="1"/>`);

/** A little rocket ship pointing up. */
export const ship = svg(48, 56, `
  <path d="M24 2 C34 12 36 26 34 40 L14 40 C12 26 14 12 24 2Z" fill="#e2e8f0" stroke="#334155" stroke-width="2"/>
  <circle cx="24" cy="20" r="6" fill="#38bdf8" stroke="#0f172a" stroke-width="2"/>
  <path d="M14 30 L4 44 L14 42Z M34 30 L44 44 L34 42Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.5"/>
  <path d="M18 40 L24 54 L30 40Z" fill="#f97316"/><path d="M21 40 L24 48 L27 40Z" fill="#fde047"/>`);

/** A laser bolt. */
export const laser = svg(8, 26, `
  <rect x="1" y="1" width="6" height="24" rx="3" fill="#a3e635"/><rect x="3" y="3" width="2" height="20" rx="1" fill="#f7fee7"/>`);

/** A lumpy space rock. */
export const meteor = svg(44, 40, `
  <path d="M8 10 L20 3 L34 6 L42 18 L38 32 L24 38 L9 34 L2 22Z" fill="#78716c" stroke="#292524" stroke-width="2"/>
  <circle cx="16" cy="16" r="4" fill="#57534e"/><circle cx="29" cy="25" r="5" fill="#57534e"/><circle cx="28" cy="12" r="2.5" fill="#57534e"/>`);

/** A sprinkled donut for Chase Bot. */
export const donut = svg(40, 40, `
  <circle cx="20" cy="20" r="18" fill="#d97706"/><circle cx="20" cy="19" r="15" fill="#f472b6"/>
  <circle cx="20" cy="20" r="6" fill="#fde68a" stroke="#d97706" stroke-width="2"/>
  ${[[11, 11, '#fff'], [28, 12, '#60a5fa'], [10, 25, '#facc15'], [29, 27, '#4ade80'], [20, 8, '#a78bfa'], [17, 31, '#fff']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="5" height="2" rx="1" fill="${c}" transform="rotate(${x * 7} ${x} ${y})"/>`).join('')}`);

/** A friendly-spooky ghost. */
export const ghost = svg(40, 46, `
  <path d="M4 22 C4 8 12 2 20 2 C28 2 36 8 36 22 L36 44 L30 38 L25 44 L20 38 L15 44 L10 38 L4 44Z" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
  <ellipse cx="14" cy="20" rx="3.5" ry="5" fill="#1e293b"/><ellipse cx="26" cy="20" rx="3.5" ry="5" fill="#1e293b"/>
  <ellipse cx="20" cy="30" rx="4" ry="3" fill="#1e293b"/>`);

/** A floating space rock for Flap Bot to dodge. */
export const rock = svg(56, 70, `
  <path d="M10 8 L30 2 L50 12 L54 36 L46 62 L24 68 L6 56 L2 30Z" fill="#7c3aed" stroke="#2e1065" stroke-width="2.5"/>
  <path d="M14 16 L28 10 L40 18" fill="none" stroke="#c4b5fd" stroke-width="3" stroke-linecap="round"/>
  <circle cx="22" cy="40" r="6" fill="#5b21b6"/><circle cx="38" cy="50" r="4" fill="#5b21b6"/>`);
