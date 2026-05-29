/**
 * AppMode: Global mode detection and management system
 * Determines what "mode" the application is in based on current route
 * Used to control block availability and scope
 */

export const MODES = {
  GAME_BUILDER: 'GAME_BUILDER',
  WORKSPACE: 'WORKSPACE',
  LEARN: 'LEARN',
  COMMUNITY: 'COMMUNITY',
  CLASSROOM: 'CLASSROOM',
  CHALLENGES: 'CHALLENGES',
  VRD: 'VRD',
  ROBOT: 'ROBOT',
  ADMIN: 'ADMIN',
  MISSIONS: 'MISSIONS',
  PARENT: 'PARENT',
  PORTFOLIO: 'PORTFOLIO',
  SETTINGS: 'SETTINGS',
  DASHBOARD: 'DASHBOARD',
};

export class AppMode {
  static currentMode = null;
  static listeners = new Set();

  /**
   * Get current mode from page/hash
   * Maps page identifier to mode constant
   */
  static getCurrentMode(page) {
    const raw = String(page || window.location.hash.replace('#', '') || 'dashboard').toLowerCase();
    const p = raw.split('/')[0].split('?')[0];

    switch (p) {
      case 'gamebuilder':
        return MODES.GAME_BUILDER;
      case 'workspace':
        return MODES.WORKSPACE;
      case 'learn':
        return MODES.LEARN;
      case 'community':
        return MODES.COMMUNITY;
      case 'classroom':
        return MODES.CLASSROOM;
      case 'challenges':
        return MODES.CHALLENGES;
      case 'vrd':
        return MODES.VRD;
      case 'robot':
        return MODES.ROBOT;
      case 'admin':
        return MODES.ADMIN;
      case 'missions':
        return MODES.MISSIONS;
      case 'parent':
        return MODES.PARENT;
      case 'portfolio':
        return MODES.PORTFOLIO;
      case 'settings':
        return MODES.SETTINGS;
      case 'dashboard':
        return MODES.DASHBOARD;
      default:
        return MODES.DASHBOARD;
    }
  }

  /**
   * Check if currently in Game Builder mode
   */
  static isGameBuilder(page) {
    return this.getCurrentMode(page) === MODES.GAME_BUILDER;
  }

  /**
   * Check if blocks should be active in this mode
   * ONLY Game Builder allows blocks
   */
  static areBlocksAllowed(page) {
    const mode = this.getCurrentMode(page);
    return mode === MODES.GAME_BUILDER;
  }

  /**
   * Check if current mode allows block execution
   */
  static canExecuteBlocks(page) {
    return this.areBlocksAllowed(page);
  }

  /**
   * List of modes that are allowed to have blocks
   */
  static getAllowedBlockModes() {
    return [MODES.GAME_BUILDER];
  }

  /**
   * Guard: Throw error if trying to execute blocks outside Game Builder
   */
  static guardBlockExecution(page) {
    if (!this.areBlocksAllowed(page)) {
      const mode = this.getCurrentMode(page);
      throw new Error(
        `Blocks can only execute in Game Builder mode. Current mode: ${mode}`
      );
    }
  }

  /**
   * Guard: Return true if safe to render block UI
   */
  static shouldRenderBlockUI(page) {
    return this.areBlocksAllowed(page);
  }

  /**
   * Register listener for mode changes
   */
  static onModeChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of mode change
   */
  static notifyModeChange(oldMode, newMode, newPage) {
    this.listeners.forEach(listener => {
      try {
        listener({ oldMode, newMode, page: newPage });
      } catch (err) {
        console.error('Error in AppMode listener:', err);
      }
    });
  }

  /**
   * Get human-readable mode name
   */
  static getModeName(mode) {
    const names = {
      [MODES.GAME_BUILDER]: 'Game Builder',
      [MODES.WORKSPACE]: 'Workspace',
      [MODES.LEARN]: 'Learn Hub',
      [MODES.COMMUNITY]: 'Community',
      [MODES.CLASSROOM]: 'Classroom',
      [MODES.CHALLENGES]: 'Challenges',
      [MODES.VRD]: 'Virtual Robot Designer',
      [MODES.ROBOT]: 'Physical Robot Lab',
      [MODES.ADMIN]: 'Admin Panel',
      [MODES.MISSIONS]: 'Missions',
      [MODES.PARENT]: 'Parent Dashboard',
      [MODES.PORTFOLIO]: 'Portfolio',
      [MODES.SETTINGS]: 'Settings',
      [MODES.DASHBOARD]: 'Dashboard',
    };
    return names[mode] || String(mode);
  }
}

export default AppMode;
