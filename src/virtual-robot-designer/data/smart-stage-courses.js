/**
 * Robot-specific Test Arena courses — each profile unlocks tailored challenges.
 */
export const SMART_STAGE_COURSES = [
  /* ── Wheeled / rover ── */
  { id: 'obstacles', profileIds: ['wheeled', 'inventor', 'battle', 'companion'], recommended: true, mission: 'Avoid obstacles and reach the finish' },
  { id: 'linefollow', profileIds: ['wheeled', 'inventor'], recommended: true, mission: 'Follow the glowing path' },
  { id: 'delivery', profileIds: ['wheeled', 'inventor', 'mech'], recommended: true, mission: 'Deliver cargo between zones' },
  { id: 'square', profileIds: ['wheeled', 'battle'], recommended: false, mission: 'Race around the track loop' },
  { id: 'open', profileIds: ['wheeled', 'inventor', 'companion'], recommended: false, mission: 'Free drive and experiment' },

  /* ── Tank / crawler ── */
  { id: 'ramp', profileIds: ['tank', 'mech'], recommended: true, mission: 'Climb ramps and rough terrain' },
  { id: 'obstacles', profileIds: ['tank'], recommended: true, mission: 'Push through the obstacle field' },
  { id: 'rough_terrain', profileIds: ['tank'], recommended: true, mission: 'Cross rocky construction site' },
  { id: 'collect', profileIds: ['tank', 'mech'], recommended: false, mission: 'Rescue heavy cargo crates' },
  { id: 'delivery', profileIds: ['tank'], recommended: false, mission: 'Transport supplies to the depot' },

  /* ── Drone / aerial ── */
  { id: 'sky_rings', profileIds: ['drone', 'jet', 'helicopter'], recommended: true, mission: 'Fly through aerial rings' },
  { id: 'sky_maze', profileIds: ['drone', 'jet'], recommended: true, mission: 'Navigate the sky obstacle field' },
  { id: 'figure8', profileIds: ['jet', 'drone'], recommended: true, mission: 'Complete the aerial race circuit' },
  { id: 'open', profileIds: ['drone', 'helicopter'], recommended: false, mission: 'Free flight practice' },

  /* ── Spider / walker ── */
  { id: 'terrain_climb', profileIds: ['spider', 'humanoid'], recommended: true, mission: 'Climb towers and cross gaps' },
  { id: 'maze', profileIds: ['spider', 'humanoid'], recommended: true, mission: 'Explore the cave maze' },
  { id: 'ramp', profileIds: ['spider'], recommended: false, mission: 'Scale rocky paths' },

  /* ── Humanoid ── */
  { id: 'balance_beam', profileIds: ['humanoid'], recommended: true, mission: 'Walk the balance course' },
  { id: 'obstacles', profileIds: ['humanoid'], recommended: false, mission: 'Training gym obstacle run' },

  /* ── Factory / arm ── */
  { id: 'factory_sort', profileIds: ['arm'], recommended: true, mission: 'Sort boxes by color on the line' },
  { id: 'collect', profileIds: ['arm'], recommended: true, mission: 'Pick up and stack targets' },
  { id: 'delivery', profileIds: ['arm', 'mech'], recommended: false, mission: 'Move cargo on conveyors' },

  /* ── Underwater ── */
  { id: 'underwater_reef', profileIds: ['submarine'], recommended: true, mission: 'Collect reef samples' },
  { id: 'underwater_cave', profileIds: ['submarine'], recommended: true, mission: 'Map the underwater cave' },
  { id: 'open', profileIds: ['submarine'], recommended: false, mission: 'Deep-sea free explore' },

  /* ── Hover ── */
  { id: 'hover_course', profileIds: ['hover'], recommended: true, mission: 'Cross floating energy bridges' },
  { id: 'figure8', profileIds: ['hover'], recommended: false, mission: 'Neon hover race' },

  /* ── Drill / mining ── */
  { id: 'mining_tunnel', profileIds: ['drill'], recommended: true, mission: 'Drill through tunnel walls' },
  { id: 'collect', profileIds: ['drill'], recommended: true, mission: 'Collect crystal minerals' },

  /* ── LEGO ── */
  { id: 'lego_park', profileIds: ['lego'], recommended: true, mission: 'Complete the block obstacle park' },
  { id: 'open', profileIds: ['lego', 'inventor'], recommended: false, mission: 'Creative sandbox drive' },

  /* ── AI / stealth ── */
  { id: 'ai_patrol', profileIds: ['companion', 'battle'], recommended: true, mission: 'Patrol and detect targets' },
  { id: 'maze', profileIds: ['companion'], recommended: false, mission: 'Autonomous navigation puzzle' },
];

/** Display metadata for every course id (including legacy Test Arena ids). */
export const COURSE_DISPLAY = {
  open: { label: 'Open Field', icon: '🌐', desc: 'Free drive & experiment', color: '#1e90ff' },
  obstacles: { label: 'Obstacle Course', icon: '🚧', desc: 'Dodge & navigate safely', color: '#ff6b6b' },
  linefollow: { label: 'Line Follow', icon: '〰️', desc: 'Follow the glowing path', color: '#00c853' },
  maze: { label: 'Maze', icon: '🧩', desc: 'Solve the wall puzzle', color: '#8b5cf6' },
  square: { label: 'Race Track', icon: '🏁', desc: 'Speed around the loop', color: '#f59e0b' },
  figure8: { label: 'Figure 8', icon: '∞', desc: 'Crossing challenge', color: '#00d9ff' },
  ramp: { label: 'Ramp Course', icon: '⛰️', desc: 'Climb & physics test', color: '#f97316' },
  collect: { label: 'Object Pickup', icon: '📦', desc: 'Grab glowing targets', color: '#ec4899' },
  delivery: { label: 'Delivery Run', icon: '🎯', desc: 'Move between zones', color: '#14b8a6' },
  rough_terrain: { label: 'Rough Terrain', icon: '🪨', desc: 'Rocky construction zone', color: '#78716c' },
  sky_rings: { label: 'Sky Rings', icon: '💫', desc: 'Fly through floating rings', color: '#0ea5e9' },
  sky_maze: { label: 'Sky Maze', icon: '🌩️', desc: 'Aerial obstacle field', color: '#6366f1' },
  terrain_climb: { label: 'Terrain Climb', icon: '🧗', desc: 'Vertical climbing challenge', color: '#10b981' },
  balance_beam: { label: 'Balance Course', icon: '⚖️', desc: 'Walk the balance beams', color: '#a855f7' },
  factory_sort: { label: 'Sorting Line', icon: '🏭', desc: 'Factory color sort', color: '#0ea5e9' },
  underwater_reef: { label: 'Coral Reef', icon: '🐠', desc: 'Underwater sample hunt', color: '#06b6d4' },
  underwater_cave: { label: 'Deep Cave', icon: '🌊', desc: 'Sonar through caves', color: '#0284c7' },
  hover_course: { label: 'Hover Bridges', icon: '🛸', desc: 'Cross floating platforms', color: '#c026d3' },
  mining_tunnel: { label: 'Mining Tunnel', icon: '⛏️', desc: 'Drill and collect ore', color: '#a16207' },
  lego_park: { label: 'LEGO Park', icon: '🧱', desc: 'Block obstacle adventure', color: '#f97316' },
  ai_patrol: { label: 'AI Patrol', icon: '🧠', desc: 'Smart target detection', color: '#8b5cf6' },
};

export function getCourseDisplay(id) {
  return COURSE_DISPLAY[id] || COURSE_DISPLAY.open;
}

export function getCoursesForProfile(profileId) {
  const matched = SMART_STAGE_COURSES.filter((c) => c.profileIds.includes(profileId));
  const seen = new Set();
  const courses = [];
  for (const entry of matched) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    const meta = getCourseDisplay(entry.id);
    courses.push({
      id: entry.id,
      label: meta.label,
      icon: meta.icon,
      desc: meta.desc,
      color: meta.color,
      mission: entry.mission,
      recommended: entry.recommended,
    });
  }
  if (!courses.length) {
    return ['open', 'obstacles'].map((id) => {
      const meta = getCourseDisplay(id);
      return {
        id,
        ...meta,
        mission: id === 'open' ? 'Explore freely' : 'Try the obstacle course',
        recommended: true,
      };
    });
  }
  const recommended = courses.filter((c) => c.recommended);
  const other = courses.filter((c) => !c.recommended);
  return [...recommended, ...other];
}
