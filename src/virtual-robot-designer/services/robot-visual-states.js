/**
 * robot-visual-states.js — Robot PERSONALITY system
 *
 * The robot should feel ALIVE.
 * Children should say "my robot is happy" or "my robot is sad."
 *
 * States:
 *  IDLE        — Curious look-around, heartbeat LEDs, gentle bob
 *  ACTIVE      — Alert scan, bright LEDs, eager lean
 *  EXECUTING   — Forward lean, fast LED pulse, micro-vibration
 *  ERROR       — Droops sadly, red flicker, shakes then slumps
 *  SUCCESS     — Full 360° celebration spin, jump, rainbow LEDs
 *  LOW_BATTERY — Exhausted side-sway, dim amber flicker, head droop
 */
import * as THREE from 'three';
import { STATE_COLORS } from './art-direction.js';

export const ROBOT_STATES = {
  IDLE:        'idle',
  ACTIVE:      'active',
  EXECUTING:   'executing',
  ERROR:       'error',
  SUCCESS:     'success',
  LOW_BATTERY: 'low_battery',
};

const _col = new THREE.Color();

function setSensorGlow(sensors, hex, intensity) {
  sensors.forEach(mesh => {
    const m = mesh.material;
    if (!m?.emissive) return;
    if (!mesh.userData.lockEmissiveColor) m.emissive.setHex(hex);
    m.emissiveIntensity = (mesh.userData.baseEmissive ?? 0.5) * intensity;
  });
}

function setRainbowGlow(sensors, t) {
  _col.setHSL((t * 0.45) % 1, 1.0, 0.62);
  sensors.forEach(mesh => {
    const m = mesh.material;
    if (!m?.emissive) return;
    if (!mesh.userData.lockEmissiveColor) m.emissive.copy(_col);
    m.emissiveIntensity = 1.6;
  });
}

export function createRobotStateController(robot) {
  let state        = ROBOT_STATES.IDLE;
  let stateTimer   = 0;
  let errorShake   = 0;
  let successPulse = 0;
  let successSpin  = 0;   // accumulated Y rotation for victory spin
  let droopY       = 0;   // smooth droop-down on error

  const sensors    = robot.userData.sensorMeshes || [];
  const baseScaleY = robot.scale.y;

  // Collect head-tagged groups placed by robot builder
  const heads = [];
  robot.traverse(o => { if (o.userData?.isHead) heads.push(o); });

  const allHeads = heads;

  return {
    get state() { return state; },

    setState(next) {
      if (next === state && next !== ROBOT_STATES.ERROR && next !== ROBOT_STATES.SUCCESS) return;
      if (next === ROBOT_STATES.ERROR) {
        errorShake = 0.40;
        droopY     = 0;
        stateTimer = 0.95;
      }
      if (next === ROBOT_STATES.SUCCESS) {
        successPulse = 1.4;
        successSpin  = 0;
        stateTimer   = 2.4;
      }
      state = next;
    },

    onCollision()  { this.setState(ROBOT_STATES.ERROR); },
    onSuccess()    { this.setState(ROBOT_STATES.SUCCESS); },
    onLowBattery() {
      if (state !== ROBOT_STATES.ERROR && state !== ROBOT_STATES.SUCCESS)
        state = ROBOT_STATES.LOW_BATTERY;
    },

    /** Returns visual offsets applied per frame. rotY is ADDED to rs.angle. */
    apply(t, dt, mode) {
      // Auto state from simulation mode
      if (mode === 'running' || mode === 'step') {
        if (state !== ROBOT_STATES.ERROR && state !== ROBOT_STATES.SUCCESS)
          state = ROBOT_STATES.EXECUTING;
      } else if (state === ROBOT_STATES.EXECUTING) {
        state = ROBOT_STATES.IDLE;
      }

      if (stateTimer > 0) {
        stateTimer -= dt;
        if (stateTimer <= 0 && (state === ROBOT_STATES.ERROR || state === ROBOT_STATES.SUCCESS)) {
          state       = (mode === 'running' || mode === 'step') ? ROBOT_STATES.EXECUTING : ROBOT_STATES.IDLE;
          successSpin = 0;
          droopY      = 0;
        }
      }

      let yOff   = 0;
      let rotZ   = 0;
      let rotY   = 0;   // added to rs.angle (not absolute)
      let rotX   = 0;
      let scaleY = 1;

      switch (state) {

        /* ── IDLE: curious, alive, heartbeat ──────────────────────────── */
        case ROBOT_STATES.IDLE: {
          yOff = Math.sin(t * 2.2) * 0.018;
          rotY = 0;
          // Head looks independently further
          allHeads.forEach(h => {
            h.rotation.y = Math.sin(t * 0.80 + 0.4) * 0.38;
            h.rotation.x = Math.sin(t * 0.38) * 0.045;
          });
          // Heartbeat: fast-fast–pause (lub-dub)
          const p = (t % 1.8) / 1.8;
          const hb = p < 0.07 ? 2.2 : p < 0.14 ? 0.3 : p < 0.22 ? 1.8 : p < 0.30 ? 0.3 : 0.35;
          setSensorGlow(sensors, STATE_COLORS.idle, hb * 0.75);
          break;
        }

        /* ── ACTIVE: alert, scanning eagerly ──────────────────────────── */
        case ROBOT_STATES.ACTIVE: {
          yOff = Math.sin(t * 2.8) * 0.022;
          rotY = Math.sin(t * 1.6) * 0.18;
          allHeads.forEach(h => {
            h.rotation.y = Math.sin(t * 2.1) * 0.48;
            h.rotation.x = 0.06 + Math.sin(t * 0.9) * 0.04;
          });
          setSensorGlow(sensors, STATE_COLORS.active, 0.85 + Math.sin(t * 6) * 0.28);
          break;
        }

        /* ── EXECUTING: leaning forward, focused ──────────────────────── */
        case ROBOT_STATES.EXECUTING: {
          yOff   = Math.sin(t * 8) * 0.010;
          rotX   = 0.045;
          scaleY = 1 + Math.sin(t * 10) * 0.012;
          allHeads.forEach(h => {
            h.rotation.y = 0;
            h.rotation.x = 0.07;  // head angled forward
          });
          setSensorGlow(sensors, STATE_COLORS.executing, 1.0 + Math.sin(t * 8) * 0.45);
          break;
        }

        /* ── ERROR: droops, shakes, sad red flicker ────────────────────── */
        case ROBOT_STATES.ERROR: {
          droopY  = Math.min(droopY + dt * 0.28, 0.12);
          yOff    = -droopY;
          rotZ    = Math.sin(t * 28) * errorShake;
          errorShake *= errorShake > 0.015 ? 0.90 : 0;
          // Head hangs forward
          const hang = Math.min(droopY * 2.5, 0.38);
          allHeads.forEach(h => {
            h.rotation.y = 0;
            h.rotation.x = hang;
          });
          // Flicker red — random drops to near-zero mimic short circuits
          const flicker = Math.random() > 0.12
            ? (0.55 + Math.sin(t * 18) * 0.45)
            : 0.08;
          setSensorGlow(sensors, STATE_COLORS.error, flicker);
          break;
        }

        /* ── SUCCESS: full spin, jump, rainbow celebration ─────────────── */
        case ROBOT_STATES.SUCCESS: {
          successSpin += dt * 9.0;
          rotY   = successSpin;  // full spinning Y
          yOff   = Math.abs(Math.sin(t * 7)) * 0.32 * Math.min(successPulse, 1.0);
          scaleY = 1 + Math.sin(t * 10) * 0.07 * successPulse;
          successPulse *= 0.975;
          // Head spins faster (excited)
          allHeads.forEach(h => {
            h.rotation.y = t * 3.5;
            h.rotation.x = -0.12;  // look slightly up — victorious!
          });
          setRainbowGlow(sensors, t);
          break;
        }

        /* ── LOW_BATTERY: exhausted, labored, dim amber ────────────────── */
        case ROBOT_STATES.LOW_BATTERY: {
          yOff = -0.05 + Math.sin(t * 0.7) * 0.014;
          rotZ = Math.sin(t * 0.85) * 0.065;  // tired side-sway
          rotY = Math.sin(t * 0.32) * 0.09;   // very slow look
          allHeads.forEach(h => {
            h.rotation.x = 0.20;              // head drooping
            h.rotation.y = Math.sin(t * 0.5) * 0.08;
          });
          // Erratic dim flicker — dying battery
          const dim = Math.random() > 0.06
            ? (0.18 + Math.sin(t * 2.2) * 0.14)
            : 0.04;
          setSensorGlow(sensors, 0xff9500, dim);
          break;
        }

        default: break;
      }

      robot.scale.y = baseScaleY * scaleY;

      // Update robot's ambient glow light
      if (robot.userData.robotGlow) {
        const glow = robot.userData.robotGlow;
        if (state === ROBOT_STATES.SUCCESS) {
          _col.setHSL((t * 0.5) % 1, 1.0, 0.6);
          glow.color.copy(_col);
          glow.intensity = 0.85;
        } else {
          glow.color.setHex(
            state === ROBOT_STATES.ERROR       ? 0xff2020 :
            state === ROBOT_STATES.LOW_BATTERY ? 0xff8800 :
            state === ROBOT_STATES.EXECUTING   ? 0x44aaff :
            0xfff8e8  // warm neutral for idle — preserves robot's true colors
          );
          glow.intensity =
            state === ROBOT_STATES.EXECUTING   ? 0.45 :
            state === ROBOT_STATES.ERROR       ? 0.70 :
            state === ROBOT_STATES.LOW_BATTERY ? (0.18 + Math.random() * 0.12) :
            0.18;
        }
      }

      return { yOff, rotZ, rotY, rotX };
    },
  };
}

/** Attach a soft ambient glow point light that shifts color with state */
export function attachRobotAccentGlow(robot) {
  // Warm neutral fill light — doesn't tint the robot's base color
  const pl = new THREE.PointLight(0xfff8e8, 0.18, 3.5);
  pl.position.set(0, 0.85, 0);
  robot.add(pl);
  robot.userData.robotGlow = pl;
  return pl;
}
