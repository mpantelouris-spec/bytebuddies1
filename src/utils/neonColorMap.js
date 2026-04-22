/**
 * Neon Design System Color Mapping
 * Maps block categories to CSS custom properties for the neon aesthetic
 */

export const CATEGORY_TO_NEON = {
  event: {
    className: 'category-event',
    colorVar: '--color-event',
    darkVar: '--color-event-dark',
    lightVar: '--color-event-light',
    glowVar: '--glow-event',
    label: 'Event'
  },
  motion: {
    className: 'category-motion',
    colorVar: '--color-motion',
    darkVar: '--color-motion-dark',
    lightVar: '--color-motion-light',
    glowVar: '--glow-motion',
    label: 'Motion'
  },
  looks: {
    className: 'category-looks',
    colorVar: '--color-looks',
    darkVar: '--color-looks-dark',
    lightVar: '--color-looks-light',
    glowVar: '--glow-looks',
    label: 'Looks'
  },
  control: {
    className: 'category-control',
    colorVar: '--color-control',
    darkVar: '--color-control-dark',
    lightVar: '--color-control-light',
    glowVar: '--glow-control',
    label: 'Control'
  },
  sensing: {
    className: 'category-sensing',
    colorVar: '--color-sensing',
    darkVar: '--color-sensing-dark',
    lightVar: '--color-sensing-light',
    glowVar: '--glow-sensing',
    label: 'Sensing'
  },
  sound: {
    className: 'category-sound',
    colorVar: '--color-sound',
    darkVar: '--color-sound-dark',
    lightVar: '--color-sound-light',
    glowVar: '--glow-sound',
    label: 'Sound'
  },
  variables: {
    className: 'category-variables',
    colorVar: '--color-variables',
    darkVar: '--color-variables-dark',
    lightVar: '--color-variables-light',
    glowVar: '--glow-variables',
    label: 'Variables'
  },
  math: {
    className: 'category-math',
    colorVar: '--color-math',
    darkVar: '--color-math-dark',
    lightVar: '--color-math-light',
    glowVar: '--glow-math',
    label: 'Math'
  },
  game: {
    className: 'category-game',
    colorVar: '--color-game',
    darkVar: '--color-game-dark',
    lightVar: '--color-game-light',
    glowVar: '--glow-game',
    label: 'Game'
  },
  physics: {
    className: 'category-physics',
    colorVar: '--color-physics',
    darkVar: '--color-physics-dark',
    lightVar: '--color-physics-light',
    glowVar: '--glow-physics',
    label: 'Physics'
  },
  action: {
    className: 'category-action',
    colorVar: '--color-action',
    darkVar: '--color-action-dark',
    lightVar: '--color-action-light',
    glowVar: '--glow-action',
    label: 'Action'
  },
  // Map other category variations
  variable: 'variables',
  logic: 'motion',
  loop: 'control',
  function: 'motion',
  sprite: 'motion',
  text: 'math',
  list: 'math',
  myblocks: 'motion',
  ai: 'action',
};

/**
 * Get neon color mapping for a category
 * @param {string} category - The block category
 * @returns {object} Color mapping object with className and CSS variables
 */
export function getNeonColor(category) {
  let cat = category?.toLowerCase() || 'event';

  // Resolve category alias to main category
  if (typeof CATEGORY_TO_NEON[cat] === 'string') {
    cat = CATEGORY_TO_NEON[cat];
  }

  return CATEGORY_TO_NEON[cat] || CATEGORY_TO_NEON.event;
}

/**
 * Get CSS class name for a category
 * @param {string} category - The block category
 * @returns {string} CSS class name
 */
export function getCategoryClass(category) {
  return getNeonColor(category).className;
}

/**
 * Get the primary neon color for a category (as CSS variable reference)
 * @param {string} category - The block category
 * @returns {string} CSS variable reference
 */
export function getCategoryColorVar(category) {
  return `var(${getNeonColor(category).colorVar})`;
}
