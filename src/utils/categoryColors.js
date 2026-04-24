/**
 * SCRATCH-STYLE DYNAMIC Category Color System
 * Soft, muted colors with automatic hue assignment
 * NO hardcoded category names
 */

const GOLDEN_ANGLE = 137.508;
const categoryHueCache = new Map();
let categoryCounter = 0;

/**
 * Get unique hue for a category
 * Uses golden angle for optimal color distribution
 */
export function getCategoryHue(category) {
  if (!category) return 0;
  const key = String(category).toLowerCase();
  if (!categoryHueCache.has(key)) {
    const hue = (categoryCounter * GOLDEN_ANGLE) % 360;
    categoryHueCache.set(key, hue);
    categoryCounter++;
  }
  return categoryHueCache.get(key);
}

/**
 * Scratch-style color palette (soft, muted)
 */
const SCRATCH_COLORS = {
  events: '#FF9F1C',
  motion: '#4C97FF',
  looks: '#9966FF',
  sound: '#CF63CF',
  control: '#FF7043',
  sensing: '#00BCD4',
  operators: '#59C059',
  variables: '#FF9800',
  functions: '#6B5B95',
  physics: '#455A64',
  game: '#FF6B6B',
  ai: '#7B1FA2',
  face: '#c2410c',
  objdet: '#9f1239',
  action: '#607D8B',
  loops: '#8D6E63',
  logic: '#5C6BC0',
  math: '#43A047',
  text: '#009688',
  list: '#1E88E5',
};

/**
 * Get block color (uses Scratch palette or generates from hue)
 */
export function getCategoryColor(category, fallbackToHue = true) {
  const key = String(category).toLowerCase();

  // Check Scratch palette first
  if (SCRATCH_COLORS[key]) {
    return SCRATCH_COLORS[key];
  }

  // Fall back to dynamic HSL
  if (fallbackToHue) {
    const hue = getCategoryHue(category);
    return `hsl(${hue}, 70%, 55%)`;
  }

  return '#4C97FF'; // Default blue
}

/**
 * Scratch-style block styling with connectors
 */
export function getBlockStyle(category) {
  const color = getCategoryColor(category);

  return {
    backgroundColor: color,
    background: `linear-gradient(180deg, ${lightenColor(color, 0.1)} 0%, ${color} 100%)`,
    color: '#fff',
    fontWeight: 700,
    fontSize: '13px',
    boxShadow: '0 3px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
    borderRadius: '12px',
  };
}

/**
 * Lighten a hex color
 */
function lightenColor(hex, amount = 0.1) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.round((num >> 16) * (1 + amount)));
  const g = Math.min(255, Math.round(((num >> 8) & 0xff) * (1 + amount)));
  const b = Math.min(255, Math.round((num & 0xff) * (1 + amount)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Sidebar category styling
 */
export function getSidebarItemStyle(category, isActive = false) {
  const color = getCategoryColor(category);

  return {
    padding: '10px 12px 10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: isActive ? 700 : 600,
    fontSize: '13px',
    userSelect: 'none',
    transition: 'all 0.2s ease',
    background: isActive ? `${color}14` : 'transparent',
    borderLeft: `4px solid ${isActive ? color : 'transparent'}`,
    color: isActive ? '#1a1a1a' : '#666',
  };
}

/**
 * Category indicator dot
 */
export function getCategoryIndicatorStyle(category) {
  const color = getCategoryColor(category);

  return {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: color,
    marginRight: '8px',
    verticalAlign: 'middle',
  };
}

/**
 * CSS variables for a category
 */
export function getCategoryVars(category) {
  const color = getCategoryColor(category);
  return {
    '--cat-color': color,
    '--cat-color-light': lightenColor(color, 0.1),
    '--cat-color-dark': darkenColor(color, 0.15),
  };
}

/**
 * Darken a hex color
 */
function darkenColor(hex, amount = 0.15) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round((num >> 16) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 0xff) * (1 - amount)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Initialize categories
 */
export function initializeCategories(categories = []) {
  categories.forEach(cat => {
    const key = String(cat).toLowerCase();
    if (!categoryHueCache.has(key)) {
      getCategoryHue(cat);
    }
  });
}

/**
 * Reset cache (testing)
 */
export function resetCategoryCache() {
  categoryHueCache.clear();
  categoryCounter = 0;
}
