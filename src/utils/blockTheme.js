export const BLOCK_CATEGORY_COLORS = {
  events: '#FFBF00',
  motion: '#4C97FF',
  looks: '#9966FF',
  sound: '#CF63CF',
  control: '#FFAB19',
  loops: '#FFAB19',
  logic: '#59C059',
  sensing: '#5CB1D6',
  operators: '#40BF4A',
  variables: '#FF8C1A',
};

export function resolveBlockCategoryColor(category) {
  const key = String(category || '').toLowerCase();
  if (key === 'event') return BLOCK_CATEGORY_COLORS.events;
  if (key === 'variable') return BLOCK_CATEGORY_COLORS.variables;
  if (key === 'loop') return BLOCK_CATEGORY_COLORS.loops;
  if (key === 'operator' || key === 'math') return BLOCK_CATEGORY_COLORS.operators;
  return BLOCK_CATEGORY_COLORS[key] || BLOCK_CATEGORY_COLORS.motion;
}
