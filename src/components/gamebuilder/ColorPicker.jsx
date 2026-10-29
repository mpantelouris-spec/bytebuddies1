import React from 'react';
import { colorCss, colorFromHex, colorHex, hsvToRgb } from './paintKit';

export const SWATCHES = [
  '#000000', '#4b5563', '#9ca3af', '#ffffff', '#ef4444', '#f97316', '#eab308', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#7c2d12',
  '#fca5a5', '#fdba74', '#fde68a', '#86efac', '#93c5fd', '#c4b5fd', '#f9a8d4', '#d6b38a',
];

const checker = 'repeating-conic-gradient(#cbd5e1 0% 25%, #ffffff 0% 50%) 50% / 10px 10px';

/** A small swatch that also shows transparency and gradients. */
export function PaintSwatch({ fill, size = 18 }) {
  const c1 = fill?.c1 || fill;
  const bg = !fill?.mode || fill.mode === 'solid'
    ? colorCss(c1)
    : `${fill.mode === 'radial' ? 'radial' : 'linear'}-gradient(${fill.mode === 'radial' ? 'circle' : '90deg'}, ${colorCss(fill.c1)}, ${colorCss(fill.c2)})`;
  return <span className="pe-swatch-mini" style={{ width: size, height: size, background: `${bg}, ${checker}` }} />;
}

function Slider({ label, value, max, onChange, track, suffix = '' }) {
  return (
    <label className="pe-slider">
      <span>{label}<b>{Math.round(value)}{suffix}</b></span>
      <input type="range" min={0} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ background: track }} />
    </label>
  );
}

/**
 * Colour panel: hue / saturation / brightness / see-through sliders, swatches, recent
 * colours and (for fills) gradient modes with a second colour.
 */
export default function ColorPicker({ fill, onChange, recent = [], allowGradient = true, onPickFromCanvas }) {
  const isGradient = fill.mode && fill.mode !== 'solid';
  const [which, setWhich] = React.useState('c1');
  const c = (isGradient && which === 'c2') ? fill.c2 : fill.c1;
  const set = (patch) => {
    const next = { ...c, ...patch };
    onChange(isGradient && which === 'c2' ? { ...fill, c2: next } : { ...fill, c1: next });
  };
  const hueTrack = 'linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)';
  const [r0, g0, b0] = hsvToRgb(c.h, 0, c.v);
  const [r1, g1, b1] = hsvToRgb(c.h, 1, c.v);
  const satTrack = `linear-gradient(90deg,rgb(${r0},${g0},${b0}),rgb(${r1},${g1},${b1}))`;
  const [r2, g2, b2] = hsvToRgb(c.h, c.s, 1);
  const valTrack = `linear-gradient(90deg,#000,rgb(${r2},${g2},${b2}))`;
  const alphaTrack = `linear-gradient(90deg,transparent,${colorHex(c)}), ${checker}`;

  return (
    <div className="pe-color" onMouseDown={(e) => e.stopPropagation()}>
      {allowGradient && (
        <div className="pe-modes">
          {[['solid', 'Solid'], ['linear', 'Gradient ↔'], ['radial', 'Gradient ◎']].map(([m, label]) => (
            <button key={m} type="button" className={(fill.mode || 'solid') === m ? 'on' : ''}
              onClick={() => onChange({ ...fill, mode: m, c2: fill.c2 || colorFromHex('#ffffff') })}>{label}</button>
          ))}
        </div>
      )}
      {isGradient && (
        <div className="pe-modes pe-which">
          <button type="button" className={which === 'c1' ? 'on' : ''} onClick={() => setWhich('c1')}><PaintSwatch fill={fill.c1} /> Colour 1</button>
          <button type="button" className={which === 'c2' ? 'on' : ''} onClick={() => setWhich('c2')}><PaintSwatch fill={fill.c2} /> Colour 2</button>
          <button type="button" title="Swap colours" onClick={() => onChange({ ...fill, c1: fill.c2, c2: fill.c1 })}>⇄</button>
        </div>
      )}
      <Slider label="Colour" value={c.h} max={360} onChange={(h) => set({ h })} track={hueTrack} />
      <Slider label="Saturation" value={c.s * 100} max={100} onChange={(v) => set({ s: v / 100 })} track={satTrack} suffix="%" />
      <Slider label="Brightness" value={c.v * 100} max={100} onChange={(v) => set({ v: v / 100 })} track={valTrack} suffix="%" />
      <Slider label="See-through" value={(1 - (c.a ?? 1)) * 100} max={100} onChange={(v) => set({ a: 1 - v / 100 })} track={alphaTrack} suffix="%" />
      <div className="pe-grid">
        {SWATCHES.map((hex) => (
          <button key={hex} type="button" title={hex} style={{ background: hex }}
            className={colorHex(c) === hex && (c.a ?? 1) === 1 ? 'on' : ''}
            onClick={() => set(colorFromHex(hex, c.a ?? 1))} />
        ))}
      </div>
      {recent.length > 0 && (
        <>
          <div className="pe-sub">Recent</div>
          <div className="pe-grid">
            {recent.map((rc, i) => <button key={i} type="button" style={{ background: `${colorCss(rc)}, ${checker}` }} onClick={() => set(rc)} />)}
          </div>
        </>
      )}
      <div className="pe-color-foot">
        <input type="color" value={colorHex(c)} onChange={(e) => set(colorFromHex(e.target.value, c.a ?? 1))} title="Any colour" />
        <code>{colorHex(c)}{(c.a ?? 1) < 1 ? ` · ${Math.round((c.a ?? 1) * 100)}%` : ''}</code>
        {onPickFromCanvas && <button type="button" onClick={onPickFromCanvas} title="Pick a colour from the picture">💧 Pick</button>}
      </div>
    </div>
  );
}
