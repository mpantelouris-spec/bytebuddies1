/**
 * Kid-friendly customization — size, shape, material, movement tuning.
 */
import React from 'react';
import { migrateAssembly } from '../../services/assembly-service.js';
import { CHASSIS_TYPES } from '../../data/assembly-parts.js';
import { getRegistryPart } from '../../data/modular-parts-registry.js';

const SIZES = [
  { id: 'small', label: 'Small', scale: 0.85 },
  { id: 'medium', label: 'Medium', scale: 1 },
  { id: 'large', label: 'Large', scale: 1.15 },
  { id: 'xlarge', label: 'XL', scale: 1.3 },
];

const SHAPES = [
  { id: 'box', label: 'Box' },
  { id: 'wedge', label: 'Wedge' },
  { id: 'round', label: 'Round' },
  { id: 'hex', label: 'Hex' },
];

const MATERIALS = [
  { id: 'plastic', label: 'Plastic' },
  { id: 'metal', label: 'Metal' },
  { id: 'carbon', label: 'Carbon' },
  { id: 'rubber', label: 'Rubber' },
];

const MOVEMENT_TYPES = [
  { id: 'standard', partId: 'standard', label: 'Wheels', category: 'movement' },
  { id: 'tracks', partId: 'tracks', label: 'Tracks', category: 'movement' },
  { id: 'legs', partId: 'legs', label: 'Legs', category: 'movement' },
  { id: 'hover', partId: 'hover', label: 'Hover', category: 'movement' },
];

function sizeToScale(sizeId) {
  return SIZES.find((s) => s.id === sizeId)?.scale ?? 1;
}

function scaleToSize(scale) {
  if (scale <= 0.9) return 'small';
  if (scale >= 1.2) return 'large';
  if (scale >= 1.35) return 'xlarge';
  return 'medium';
}

export default function WorkshopCustomizePanel({
  design,
  onUpdateBase,
  onMountPart,
  onSetWheelCount,
}) {
  const asm = migrateAssembly(design);
  const base = asm.base || {};
  const chassisMeta = CHASSIS_TYPES.find((c) => c.id === base.chassisType) || CHASSIS_TYPES[0];
  const currentSize = base.chassisSize || scaleToSize(base.scale ?? 1);
  const movementSlot = asm.slots?.movement;
  const movementMeta = movementSlot
    ? getRegistryPart(movementSlot.category, movementSlot.partId)
    : null;
  const wheelCount = design?.wheels?.count ?? 4;

  const applySize = (sizeId) => {
    const s = sizeToScale(sizeId);
    const c = CHASSIS_TYPES.find((x) => x.id === base.chassisType) || chassisMeta;
    onUpdateBase?.({
      chassisSize: sizeId,
      scale: (c.scale ?? 1) * s,
      width: (c.width ?? 1) * s,
      height: (c.height ?? 0.62) * s,
      depth: (c.depth ?? 1.2) * s,
    });
  };

  return (
    <div className="iw-customize">
      <h3 className="iw-customize-title">Customize your robot</h3>

      <div className="iw-customize-section">
        <span className="iw-customize-label">Body size</span>
        <div className="iw-customize-btns">
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`iw-customize-btn ${currentSize === s.id ? 'active' : ''}`}
              onClick={() => applySize(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="iw-customize-section">
        <span className="iw-customize-label">Body shape</span>
        <div className="iw-customize-btns">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`iw-customize-btn ${base.shape === s.id ? 'active' : ''}`}
              onClick={() => onUpdateBase?.({ shape: s.id })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="iw-customize-section">
        <span className="iw-customize-label">Material</span>
        <div className="iw-customize-btns iw-customize-btns--wrap">
          {MATERIALS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`iw-customize-btn ${base.material === m.id ? 'active' : ''}`}
              onClick={() => onUpdateBase?.({ material: m.id })}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="iw-customize-section">
        <span className="iw-customize-label">Movement</span>
        <div className="iw-customize-btns">
          {MOVEMENT_TYPES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`iw-customize-btn ${movementSlot?.partId === m.partId ? 'active' : ''}`}
              onClick={() => onMountPart?.('movement', m.category, m.partId, m.label)}
            >
              {m.label}
            </button>
          ))}
        </div>
        {movementSlot && (movementMeta?.wheelType === 'standard' || design?.wheels?.type === 'standard') && (
          <div className="iw-customize-slider">
            <label htmlFor="wheel-count">Wheels: {wheelCount}</label>
            <input
              id="wheel-count"
              type="range"
              min={2}
              max={8}
              step={2}
              value={wheelCount}
              onChange={(e) => onSetWheelCount?.(Number(e.target.value))}
            />
          </div>
        )}
      </div>

      <p className="iw-customize-hint">
        Selected: <strong>{chassisMeta.label}</strong> — changes show instantly on your robot.
      </p>
    </div>
  );
}
