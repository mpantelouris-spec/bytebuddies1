/** Challenge courses for the Test Arena */
export const TEST_ARENA_COURSES = [
  { id: 'open', label: 'Open Field', icon: '🌐', desc: 'Free drive & experiment', color: '#1e90ff' },
  { id: 'obstacles', label: 'Obstacle Course', icon: '🚧', desc: 'Dodge & navigate safely', color: '#ff6b6b' },
  { id: 'linefollow', label: 'Line Follow', icon: '〰️', desc: 'Follow the glowing path', color: '#00c853' },
  { id: 'maze', label: 'Maze', icon: '🧩', desc: 'Solve the wall puzzle', color: '#8b5cf6' },
  { id: 'square', label: 'Race Track', icon: '🏁', desc: 'Speed around the loop', color: '#f59e0b' },
  { id: 'figure8', label: 'Figure 8', icon: '∞', desc: 'Crossing challenge', color: '#00d9ff' },
  { id: 'ramp', label: 'Ramp Course', icon: '⛰️', desc: 'Climb & physics test', color: '#f97316' },
  { id: 'collect', label: 'Object Pickup', icon: '📦', desc: 'Grab glowing targets', color: '#ec4899' },
  { id: 'delivery', label: 'Delivery Run', icon: '🎯', desc: 'Move between zones', color: '#14b8a6' },
];

export function getCourseMeta(id) {
  return TEST_ARENA_COURSES.find((c) => c.id === id) || TEST_ARENA_COURSES[0];
}
