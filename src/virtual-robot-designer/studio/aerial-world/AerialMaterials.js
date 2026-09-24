/**
 * AerialMaterials — rich PBR materials for sky_aerial courses.
 */
import * as THREE from 'three';

export const AERIAL_COLORS = {
  rock_sandstone: 0xc4703a,
  rock_warm: 0xd4824a,
  rock_dark: 0x8b4513,
  rock_moss: 0x4a6741,
  concrete_roof: 0x6b7280,
  glass_window: 0x1e3a5f,
  neon_cyan: 0x06b6d4,
  neon_gold: 0xfbbf24,
  neon_red: 0xef4444,
  safety_yellow: 0xfacc15,
  cloud_puff: 0xffffff,
  grass_green: 0x5d8a48,
  grass_light: 0x8bc34a,
  water_blue: 0x3b82f6,
  vine_green: 0x3d6b35,
};

export function rockSandstoneMat() {
  return new THREE.MeshStandardMaterial({
    color: AERIAL_COLORS.rock_sandstone,
    roughness: 0.88,
    metalness: 0.02,
    flatShading: true,
  });
}
export function rockWarmMat() {
  return new THREE.MeshStandardMaterial({
    color: AERIAL_COLORS.rock_warm,
    roughness: 0.82,
    metalness: 0.01,
    flatShading: true,
  });
}
export function rockDarkMat() {
  return new THREE.MeshStandardMaterial({
    color: AERIAL_COLORS.rock_dark,
    roughness: 0.92,
    metalness: 0,
    flatShading: true,
  });
}
export function rockMossMat() {
  return new THREE.MeshStandardMaterial({
    color: AERIAL_COLORS.rock_moss,
    roughness: 0.95,
    metalness: 0,
    flatShading: true,
  });
}
export function grassMat() {
  return new THREE.MeshStandardMaterial({
    color: AERIAL_COLORS.grass_green,
    roughness: 0.92,
    metalness: 0,
  });
}
export function grassLightMat() {
  return new THREE.MeshStandardMaterial({
    color: AERIAL_COLORS.grass_light,
    roughness: 0.88,
    metalness: 0,
  });
}
export function waterMat(opacity = 0.7) {
  return new THREE.MeshStandardMaterial({
    color: AERIAL_COLORS.water_blue,
    emissive: 0x1e40af,
    emissiveIntensity: 0.15,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity,
  });
}
export function concreteRoofMat() {
  return new THREE.MeshStandardMaterial({ color: AERIAL_COLORS.concrete_roof, roughness: 0.78, metalness: 0.12 });
}
export function glassWindowMat() {
  return new THREE.MeshStandardMaterial({
    color: AERIAL_COLORS.glass_window, emissive: AERIAL_COLORS.neon_gold, emissiveIntensity: 0.35,
    roughness: 0.4, metalness: 0.2,
  });
}
export function neonCyanMat(intensity = 1.4) {
  return new THREE.MeshStandardMaterial({
    color: AERIAL_COLORS.neon_cyan, emissive: AERIAL_COLORS.neon_cyan, emissiveIntensity: intensity,
    metalness: 0.85, roughness: 0.25,
  });
}
export function neonGoldMat(intensity = 1.5) {
  return new THREE.MeshStandardMaterial({
    color: AERIAL_COLORS.neon_gold, emissive: AERIAL_COLORS.neon_gold, emissiveIntensity: intensity,
    metalness: 0.85, roughness: 0.25,
  });
}
export function neonRedMat(intensity = 1.6) {
  return new THREE.MeshStandardMaterial({
    color: AERIAL_COLORS.neon_red, emissive: AERIAL_COLORS.neon_red, emissiveIntensity: intensity,
    metalness: 0.85, roughness: 0.25,
  });
}
export function cloudPuffMat(opacity = 0.48) {
  return new THREE.MeshBasicMaterial({
    color: AERIAL_COLORS.cloud_puff, transparent: true, opacity, depthWrite: false, fog: false,
  });
}
export function safetyYellowMat() {
  return new THREE.MeshStandardMaterial({ color: AERIAL_COLORS.safety_yellow, roughness: 0.7, metalness: 0.1 });
}
export function vineMat() {
  return new THREE.MeshStandardMaterial({
    color: AERIAL_COLORS.vine_green, roughness: 0.9, metalness: 0,
  });
}
