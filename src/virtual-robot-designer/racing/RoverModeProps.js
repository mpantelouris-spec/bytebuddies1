/**
 * RoverModeProps.js — Per-mode mission props on Rainbow Road (same track, different challenges).
 */
import * as THREE from 'three';
import { placeAtTrack } from './GameWorldBuilder.js';
import { buildCheckpointArch } from './RacingTrackSystem.js';

function addCone(group, curve, t, side, color = 0xff6600) {
  const { pos } = placeAtTrack(curve, t, side, 0);
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.85, 8),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35 }),
  );
  mesh.position.copy(pos);
  mesh.position.y += 0.42;
  group.add(mesh);
  return mesh;
}

function addPylon(group, curve, t, side, color) {
  const { pos } = placeAtTrack(curve, t, side, 0);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 2.4, 8),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 }),
  );
  pole.position.copy(pos);
  pole.position.y += 1.2;
  group.add(pole);
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 8, 8),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8 }),
  );
  top.position.copy(pole.position);
  top.position.y += 1.35;
  group.add(top);
}

function addZoneRing(group, curve, t, color, radius = 3.5) {
  const { pos } = placeAtTrack(curve, t, 0, 0);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius - 0.2, radius, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.copy(pos);
  ring.position.y += 0.08;
  group.add(ring);
  const glow = new THREE.PointLight(color, 0.6, 12);
  glow.position.copy(pos);
  glow.position.y += 1.5;
  group.add(glow);
}

function addTrafficLight(group, curve, t) {
  const { pos } = placeAtTrack(curve, t, 4.5, 0);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x333344 }),
  );
  pole.position.copy(pos);
  pole.position.y += 2;
  group.add(pole);
  const housing = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 1.6, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x222233 }),
  );
  housing.position.copy(pole.position);
  housing.position.y += 2.2;
  group.add(housing);
  const red = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff0000, emissiveIntensity: 0.9 }),
  );
  red.position.copy(housing.position);
  red.position.y += 0.45;
  group.add(red);
  const green = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x22ff66, emissive: 0x00ff44, emissiveIntensity: 0.4 }),
  );
  green.position.copy(housing.position);
  green.position.y -= 0.45;
  group.add(green);
}

function addVelocityGate(root, curve, t, halfWidth, index, is3D) {
  const arch = buildCheckpointArch(curve, t, halfWidth, 0x00ffaa, index, is3D);
  root.add(arch);
}

const PROP_BUILDERS = {
  cones_15: (g, curve, { halfWidth }) => {
    for (let i = 0; i < 15; i++) {
      const t = 0.06 + (i / 15) * 0.82;
      addCone(g, curve, t, (i % 2 ? 1 : -1) * (halfWidth + 0.7));
    }
  },
  barriers_3: (g, curve, { halfWidth }) => {
    [0.22, 0.48, 0.72].forEach((t) => {
      const { pos, frame } = placeAtTrack(curve, t, halfWidth + 0.3, 0);
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 1.1, 3.2),
        new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 0.3 }),
      );
      bar.position.copy(pos);
      bar.position.y += 0.55;
      bar.rotation.y = frame.rot;
      g.add(bar);
    });
  },
  checkpoint_arches: () => {},
  velocity_gates: (g, curve, { halfWidth, root, is3D }) => {
    [0.18, 0.38, 0.58, 0.78].forEach((t, i) => addVelocityGate(root || g, curve, t, halfWidth, i + 1, is3D));
  },
  distance_markers: (g, curve) => {
    [0.2, 0.4, 0.6, 0.8].forEach((t, i) => {
      const { pos } = placeAtTrack(curve, t, -5, 0);
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.8, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaccff, emissiveIntensity: 0.2 }),
      );
      sign.position.copy(pos);
      sign.position.y += 1.2;
      g.add(sign);
    });
  },
  cargo_box: (g, curve) => {
    const { pos } = placeAtTrack(curve, 0.25, 0, 0);
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.2, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 0.4 }),
    );
    box.position.copy(pos);
    box.position.y += 0.6;
    g.add(box);
  },
  loading_bay_a: (g, curve) => addZoneRing(g, curve, 0.22, 0xff2244, 4),
  dropoff_b: (g, curve) => addZoneRing(g, curve, 0.62, 0x8844ff, 4),
  parked_cars_4: (g, curve, { halfWidth }) => {
    [-1, 1, -1, 1].forEach((side, i) => {
      const t = 0.45 + i * 0.04;
      const { pos, frame } = placeAtTrack(curve, t, side * (halfWidth + 2.8), 0);
      const car = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.9, 3.6),
        new THREE.MeshStandardMaterial({ color: i === 1 ? 0x4488ff : 0x666677 }),
      );
      car.position.copy(pos);
      car.position.y += 0.45;
      car.rotation.y = frame.rot;
      g.add(car);
    });
  },
  target_bay: (g, curve) => addZoneRing(g, curve, 0.52, 0xffff00, 3.2),
  curbs: () => {},
  tunnel_lights: (g, curve) => {
    for (let i = 0; i < 8; i++) {
      const t = 0.3 + (i / 8) * 0.35;
      const side = (i % 2 ? 1 : -1) * 3.5;
      const { pos } = placeAtTrack(curve, t, side, 0);
      const light = new THREE.PointLight(0x88ccff, 0.5, 8);
      light.position.copy(pos);
      light.position.y += 2;
      g.add(light);
    }
  },
  tunnel_barriers: (g, curve, { halfWidth }) => {
    for (let i = 0; i < 6; i++) {
      const t = 0.32 + (i / 6) * 0.3;
      addCone(g, curve, t, halfWidth + 0.4, 0xff0044);
      addCone(g, curve, t, -(halfWidth + 0.4), 0xff0044);
    }
  },
  pylons_red_blue_10: (g, curve, { halfWidth }) => {
    for (let i = 0; i < 10; i++) {
      const t = 0.1 + (i / 10) * 0.75;
      const side = (i % 2 ? 1 : -1) * (halfWidth + 1.2);
      addPylon(g, curve, t, side, i % 2 ? 0xff2244 : 0x2244ff);
    }
  },
  energy_hud: () => {},
  elevation_markers: (g, curve) => {
    [0.25, 0.5, 0.75].forEach((t) => addZoneRing(g, curve, t, 0x00aaff, 2.5));
  },
  tow_hitch: (g, curve) => {
    const { pos } = placeAtTrack(curve, 0.35, 0, 0);
    const hitch = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, emissive: 0xffffff, emissiveIntensity: 0.2 }),
    );
    hitch.position.copy(pos);
    hitch.position.y += 0.5;
    g.add(hitch);
  },
  heavy_trailer: (g, curve) => {
    const { pos, frame } = placeAtTrack(curve, 0.38, -3, 0);
    const trailer = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.4, 4.5),
      new THREE.MeshStandardMaterial({ color: 0x556677 }),
    );
    trailer.position.copy(pos);
    trailer.position.y += 0.7;
    trailer.rotation.y = frame.rot;
    g.add(trailer);
  },
  traffic_lights_4: (g, curve) => {
    [0.2, 0.4, 0.6, 0.8].forEach((t) => addTrafficLight(g, curve, t));
  },
  stop_lines: (g, curve, { halfWidth }) => {
    [0.2, 0.4, 0.6, 0.8].forEach((t) => {
      const { pos, frame } = placeAtTrack(curve, t, 0, 0);
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(halfWidth * 2.2, 0.05, 0.3),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
      );
      line.position.copy(pos);
      line.position.y += 0.06;
      line.rotation.y = frame.rot;
      g.add(line);
    });
  },
  all_sections: (g, curve, opts) => {
    PROP_BUILDERS.cones_15(g, curve, opts);
    PROP_BUILDERS.pylons_red_blue_10(g, curve, opts);
    PROP_BUILDERS.traffic_lights_4(g, curve);
  },
  confetti: () => {},
  leaderboard: () => {},
};

/** Place mission-specific props along the Rainbow Road curve. */
export function buildRoverModeProps(root, curve, challenge, { halfWidth = 3.5, is3D = true } = {}) {
  const props = challenge?.campusMode?.props;
  if (!props?.length) return null;

  const group = new THREE.Group();
  group.name = `rover-mode-props-${challenge.id}`;
  const opts = { halfWidth, is3D, root, curve };

  props.forEach((propId) => {
    const build = PROP_BUILDERS[propId];
    if (build) build(group, curve, opts);
  });

  if (group.children.length) {
    root.add(group);
    return group;
  }
  return null;
}
