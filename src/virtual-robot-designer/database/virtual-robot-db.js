/**
 * VirtualRobotDB — localStorage-backed store (separate from Physical Robot Lab)
 * Keys prefixed cv_vrd_* — never shared with cv_robotlab_* / cv_prl_*
 */

const KEYS = {
  designs: 'cv_vrd_designs',
  current: 'cv_vrd_current_design',
  variants: 'cv_vrd_variants',
  simulations: 'cv_vrd_sim_runs',
  gallery: 'cv_vrd_gallery',
  favorites: 'cv_vrd_favorites',
  settings: 'cv_vrd_settings',
  stats: 'cv_vrd_stats',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const VirtualRobotDB = {
  KEYS,

  getCurrentDesign() {
    return read(KEYS.current, null);
  },

  setCurrentDesign(design) {
    write(KEYS.current, design);
  },

  listDesigns(userId = 'local') {
    const all = read(KEYS.designs, []);
    return all.filter((d) => d.user_id === userId);
  },

  saveDesign(design, userId = 'local') {
    const all = read(KEYS.designs, []);
    const isNew = !design.id || !all.some((d) => d.id === design.id);
    const entry = {
      ...design,
      id: design.id || `vrd-${Date.now()}`,
      user_id: userId,
      updated_date: new Date().toISOString(),
      created_date: design.created_date || new Date().toISOString(),
      likes_count: design.likes_count || 0,
      remixes_count: design.remixes_count || 0,
      test_runs: design.test_runs || 0,
      is_public: design.is_public || false,
      tags: design.tags || [],
      description: design.description || '',
    };
    const idx = all.findIndex((d) => d.id === entry.id);
    if (idx >= 0) all[idx] = entry;
    else all.unshift(entry);
    write(KEYS.designs, all.slice(0, 100));
    this.setCurrentDesign(entry);
    if (isNew) this.incrementStat('designs_created');
    return entry;
  },

  deleteDesign(id) {
    const all = read(KEYS.designs, []).filter((d) => d.id !== id);
    write(KEYS.designs, all);
  },

  listVariants(designId) {
    const all = read(KEYS.variants, []);
    return all.filter((v) => v.original_design_id === designId);
  },

  saveVariants(designId, variants) {
    const all = read(KEYS.variants, []).filter((v) => v.original_design_id !== designId);
    const entries = variants.map((v, i) => ({
      id: v.id || `var-${designId}-${i}-${Date.now()}`,
      original_design_id: designId,
      variant_name: v.variant_name || v.name,
      robot_config: v.robot_config,
      modifications: v.modifications || v.mods,
      changes: v.changes,
      personality: v.personality,
      useCase: v.useCase,
      coolness: v.coolness,
      statComparison: v.statComparison,
      created_date: new Date().toISOString(),
      test_results: null,
    }));
    write(KEYS.variants, [...entries, ...all].slice(0, 200));
    this.incrementStat('variants_generated', variants.length);
    return entries;
  },

  saveSimulationRun(run) {
    const all = read(KEYS.simulations, []);
    const entry = {
      id: `sim-${Date.now()}`,
      ...run,
      start_time: run.start_time || new Date().toISOString(),
    };
    write(KEYS.simulations, [entry, ...all].slice(0, 50));
    this.incrementStat('simulations_run');
    return entry;
  },

  listSimulationRuns() {
    return read(KEYS.simulations, []);
  },

  getGallery(filter = 'newest') {
    const publicDesigns = read(KEYS.designs, []).filter((d) => d.is_public);
    if (filter === 'liked') return [...publicDesigns].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    if (filter === 'trending') return [...publicDesigns].sort((a, b) => (b.remixes_count || 0) - (a.remixes_count || 0));
    return [...publicDesigns].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  },

  publishDesign(id) {
    const all = read(KEYS.designs, []);
    const idx = all.findIndex((d) => d.id === id);
    if (idx < 0) return null;
    all[idx] = { ...all[idx], is_public: true };
    write(KEYS.designs, all);
    this.incrementStat('designs_shared');
    return all[idx];
  },

  likeDesign(id) {
    const all = read(KEYS.designs, []);
    const idx = all.findIndex((d) => d.id === id);
    if (idx < 0) return null;
    all[idx] = { ...all[idx], likes_count: (all[idx].likes_count || 0) + 1 };
    write(KEYS.designs, all);
    return all[idx];
  },

  toggleFavorite(id) {
    const favs = read(KEYS.favorites, []);
    const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    write(KEYS.favorites, next);
    return next;
  },

  getFavorites() {
    return read(KEYS.favorites, []);
  },

  getSettings() {
    return read(KEYS.settings, {
      notifications: true, theme: 'neon', showTips: true,
      previewQuality: 'high', animationFps: 60, autoSave: true,
      particles: true, aiVariantCount: 5,
    });
  },

  saveSettings(settings) {
    write(KEYS.settings, { ...this.getSettings(), ...settings });
  },

  getStats() {
    return read(KEYS.stats, {
      designs_created: 0,
      variants_generated: 0,
      simulations_run: 0,
      designs_shared: 0,
      likes_received: 0,
      max_speed: 0,
      achievements: [],
    });
  },

  recordMaxSpeed(speed) {
    const stats = this.getStats();
    if (speed > (stats.max_speed || 0)) {
      stats.max_speed = speed;
      write(KEYS.stats, stats);
    }
  },

  getAchievementsUnlocked() {
    return this.getStats().achievements || [];
  },

  unlockAchievement(id) {
    const stats = this.getStats();
    if (!stats.achievements) stats.achievements = [];
    if (!stats.achievements.includes(id)) {
      stats.achievements.push(id);
      write(KEYS.stats, stats);
    }
  },

  incrementStat(key, amount = 1) {
    const stats = this.getStats();
    stats[key] = (stats[key] || 0) + amount;
    write(KEYS.stats, stats);
  },
};

export default VirtualRobotDB;
