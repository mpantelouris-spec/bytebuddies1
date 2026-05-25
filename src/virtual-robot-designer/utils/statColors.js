/** Dynamic stat bar colors per spec Section 7 */

export function statValueColor(value) {
  if (value >= 70) return '#00FF41';
  if (value >= 40) return '#FFD700';
  if (value >= 20) return '#FF8800';
  return '#FF006E';
}

export function statHealthLabel(value) {
  if (value >= 70) return { text: '✓ Optimal', color: '#00FF41' };
  if (value >= 40) return { text: '⚠ Acceptable', color: '#FFD700' };
  if (value >= 20) return { text: '⚠ Warning', color: '#FF8800' };
  return { text: '✗ Critical', color: '#FF006E' };
}

export function motorPowerFromSlider(val) {
  if (val >= 85) return 'turbo';
  if (val >= 60) return 'strong';
  if (val >= 35) return 'medium';
  return 'weak';
}

export function motorPowerToSlider(motor) {
  const map = { weak: 25, medium: 50, strong: 75, turbo: 95 };
  return map[motor] ?? 50;
}
