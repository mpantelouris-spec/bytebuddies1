export const BLOCK_CATEGORY_COLORS = {
  events: '#FFBF00',
  event: '#FFBF00',
  motion: '#4C97FF',
  looks: '#9966FF',
  sound: '#CF63CF',
  control: '#FFAB19',
  loops: '#FFAB19',
  loop: '#FFAB19',
  logic: '#59C059',
  sensing: '#5CB1D6',
  operators: '#40BF4A',
  operator: '#40BF4A',
  math: '#40BF4A',
  variables: '#FF8C1A',
  variable: '#FF8C1A',
  'input/output': '#607d8b',
  action: '#607d8b',
  list: '#3498db',
  text: '#009688',
  myblocks: '#ff6680',
  physics: '#455a64',
  game: '#e74c3c',
  ai: '#7b1fa2',
  ml: '#c084fc',
  chat: '#fb7185',
  robot: '#10b981',
  music: '#d946ef',
  sprite: '#4C97FF',
  function: '#ff6680',
  custom: '#94a3b8',
};

export function resolveBlockCategoryColor(category) {
  const key = String(category || '').toLowerCase();
  return BLOCK_CATEGORY_COLORS[key] || BLOCK_CATEGORY_COLORS.motion;
}
