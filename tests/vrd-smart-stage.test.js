/**
 * Smart stage + robot profile system tests
 */
import { createFreshRobotDesign } from '../src/virtual-robot-designer/utils/initRobotDesign.js';
import { migrateDesign } from '../src/virtual-robot-designer/config.js';
import { placePartOnSlot, updateAssemblyBase } from '../src/virtual-robot-designer/services/assembly-service.js';
import { analyzeRobot, resolveProfileId } from '../src/virtual-robot-designer/services/robot-profile.js';
import { getAvailableBlocks } from '../src/virtual-robot-designer/services/program-executor.js';
import { getCoursesForProfile } from '../src/virtual-robot-designer/data/smart-stage-courses.js';
import { buildDemoProgram } from '../src/virtual-robot-designer/services/design-service.js';
import { ARENA_OBSTACLES } from '../src/virtual-robot-designer/services/robot-runtime.js';

function fresh() {
  return migrateDesign(createFreshRobotDesign());
}

describe('analyzeRobot / smart stage', () => {
  test('wheeled rover gets ground courses and drive blocks', () => {
    let d = fresh();
    d = placePartOnSlot(d, 'movement', 'movement', 'wheels_standard', 'Wheels');
    const profile = analyzeRobot(d);
    expect(profile.profileId).toBe('wheeled');
    expect(profile.arenaTheme).toBe('ground');
    expect(profile.courses.some((c) => c.id === 'obstacles')).toBe(true);
    const blocks = getAvailableBlocks(d);
    expect(blocks.motion.some((b) => b.id === 'forward')).toBe(true);
    expect(blocks.motion.some((b) => b.id === 'takeoff')).toBe(false);
  });

  test('drone gets sky courses and flight blocks', () => {
    let d = fresh();
    d = updateAssemblyBase(d, { chassisType: 'drone', shape: 'round' });
    d = placePartOnSlot(d, 'movement', 'movement', 'quad_props', 'Rotors');
    d = { ...d, wheels: { ...d.wheels, type: 'hover' } };
    const profile = analyzeRobot(d);
    expect(['drone', 'hover', 'helicopter']).toContain(profile.profileId);
    expect(profile.isAerial).toBe(true);
    const blocks = getAvailableBlocks(d);
    expect(blocks.motion.some((b) => ['takeoff', 'hover', 'fly_up'].includes(b.id))).toBe(true);
    expect(blocks.motion.some((b) => b.id === 'forward')).toBe(false);
  });

  test('tank gets rough courses and tank blocks', () => {
    let d = fresh();
    d = updateAssemblyBase(d, { chassisType: 'tank' });
    d = placePartOnSlot(d, 'movement', 'movement', 'tracks', 'Tracks');
    d = { ...d, wheels: { ...d.wheels, type: 'tracks' } };
    const profile = analyzeRobot(d);
    expect(profile.profileId).toBe('tank');
    const blocks = getAvailableBlocks(d);
    expect(blocks.motion.some((b) => b.id === 'tank_steer')).toBe(true);
    expect(profile.courses.some((c) => c.recommended && c.id === 'ramp')).toBe(true);
  });

  test('arm robot gets factory theme', () => {
    let d = fresh();
    d = updateAssemblyBase(d, { chassisType: 'arm', shape: 'arm' });
    d = placePartOnSlot(d, 'tool', 'tools', 'grabber_claw', 'Claw');
    const profile = analyzeRobot(d);
    expect(profile.profileId).toBe('arm');
    expect(profile.arenaTheme).toBe('factory');
    const blocks = getAvailableBlocks(d);
    expect(blocks.motion.some((b) => b.id === 'rotate_arm')).toBe(true);
  });

  test('demo program matches profile', () => {
    let d = fresh();
    d = updateAssemblyBase(d, { chassisType: 'drone' });
    d = placePartOnSlot(d, 'movement', 'movement', 'hover', 'Hover');
    d = { ...d, wheels: { ...d.wheels, type: 'hover' } };
    const steps = buildDemoProgram(d);
    expect(steps.some((s) => s.id === 'takeoff' || s.id === 'fly_up')).toBe(true);
  });

  test('smart courses exist for all profile ids', () => {
    const ids = ['wheeled', 'tank', 'drone', 'spider', 'arm', 'submarine', 'lego'];
    ids.forEach((id) => {
      const courses = getCoursesForProfile(id);
      expect(courses.length).toBeGreaterThan(0);
    });
  });

  test('new arena obstacle layouts are defined', () => {
    expect(ARENA_OBSTACLES.sky_rings?.length).toBeGreaterThan(0);
    expect(ARENA_OBSTACLES.underwater_reef?.length).toBeGreaterThan(0);
    expect(ARENA_OBSTACLES.factory_sort?.length).toBeGreaterThan(0);
  });
});
