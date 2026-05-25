/**
 * VRD API layer — /api/vrd/* client (local-first, no hardware endpoints)
 */
import VirtualRobotDB from '../database/virtual-robot-db.js';
import { DEFAULT_ROBOT_DESIGN } from '../config.js';
import { buildRichVariants } from '../services/design-service.js';

const API_PREFIX = '/api/vrd';

export const vrdApi = {
  prefix: API_PREFIX,

  async getDesigns(userId) {
    return VirtualRobotDB.listDesigns(userId);
  },

  async getDesign(id) {
    const all = VirtualRobotDB.listDesigns();
    return all.find((d) => d.id === id) || null;
  },

  async createDesign(design, userId) {
    const result = VirtualRobotDB.saveDesign({ ...DEFAULT_ROBOT_DESIGN, ...design }, userId);
    if (!result.ok) throw new Error(result.error || 'save_failed');
    return result.design;
  },

  async updateDesign(id, patch) {
    const existing = await this.getDesign(id);
    if (!existing) throw new Error('Design not found');
    const result = VirtualRobotDB.saveDesign({ ...existing, ...patch, id });
    if (!result.ok) throw new Error(result.error || 'save_failed');
    return result.design;
  },

  async deleteDesign(id) {
    VirtualRobotDB.deleteDesign(id);
    return { ok: true };
  },

  async generateVariants(designId, baseDesign) {
    const messages = ['Feeding your design to AI…', 'Cooking up something wild…', 'Amplifying the chaos…'];
    for (let i = 0; i < messages.length; i++) {
      await new Promise((r) => setTimeout(r, 500));
    }
    const variants = buildRichVariants(baseDesign);
    return VirtualRobotDB.saveVariants(designId, variants);
  },

  async runSimulation({ designId, arenaType, robotType }) {
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 800));
    const stats = {
      distance: Math.round(80 + Math.random() * 120),
      avgSpeed: Math.round(30 + Math.random() * 50),
      duration: ((Date.now() - start) / 1000).toFixed(1),
    };
    return VirtualRobotDB.saveSimulationRun({
      design_id: designId,
      arena_type: arenaType,
      robot_type: robotType,
      end_time: new Date().toISOString(),
      statistics: stats,
    });
  },

  async getGallery(filter) {
    return VirtualRobotDB.getGallery(filter);
  },

  async likeDesign(id) {
    return VirtualRobotDB.likeDesign(id);
  },

  async shareDesign(id) {
    return VirtualRobotDB.publishDesign(id);
  },

  async remixDesign(id) {
    const original = await this.getDesign(id);
    if (!original) throw new Error('Design not found');
    const result = VirtualRobotDB.saveDesign({
      ...original,
      id: undefined,
      name: `${original.name} (Remix)`,
      is_public: false,
    });
    if (!result.ok) throw new Error(result.error || 'save_failed');
    VirtualRobotDB.incrementStat('remixes_count');
    return result.design;
  },
};

export default vrdApi;
