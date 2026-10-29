/**
 * Robot Workshop — children build their own robot from parts: a body shape stretched to
 * any size, a head and screen face, arms, a way of moving, paint, finish, pattern and
 * add-ons. (Or start from one of the Studio robots and customise it.) The result is a
 * normal Studio robot: it plays game modes, Live Lab and every arena from the Arena Maker.
 */
import React, { useEffect, useMemo, useState } from 'react';
import WorkshopPreview from './WorkshopPreview.jsx';
import { renderRobotThumb } from './robotThumbs.js';
import { PART_OPTIONS, DEFAULT_PARTS, partsPlayAs } from './partsRobot.js';
import { CHASSIS_DATA } from '../services/studio-robot-builder.js';
import { ADDON_SLOTS } from '../services/robotAddons.js';
import { getStudioRobotGroup, FAMILY_PICKER_LABEL } from '../data/primary-robot-studio.js';
import { EmojiIcon, IconText } from '../../components/ui/Icon.jsx';

const PART_STEPS = [
  { id: 'body', label: 'Body', icon: '🧱' },
  { id: 'head', label: 'Head', icon: '🙂' },
  { id: 'arms', label: 'Arms', icon: '🦾' },
  { id: 'move', label: 'Moves', icon: '🛞' },
  { id: 'paint', label: 'Paint', icon: '🎨' },
  { id: 'addons', label: 'Extras', icon: '🧩' },
];
const STUDIO_STEPS = [
  { id: 'studio', label: 'Robot', icon: '🤖' },
  { id: 'paint', label: 'Paint', icon: '🎨' },
  { id: 'addons', label: 'Extras', icon: '🧩' },
];
const FAMILY_ORDER = ['wheeled', 'walker', 'aerial', 'underwater', 'arm', 'footballbot', 'birdbot', 'arcade'];
const SWATCHES = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f8fafc', '#94a3b8', '#1f2937'];
const LIGHTS = ['#5eead4', '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#facc15', '#4ade80', '#fb7185'];
const FINISHES = [
  { id: 'matte', label: 'Matte', icon: '🧱', m: 0.05, r: 0.85, g: 0.9 },
  { id: 'glossy', label: 'Glossy', icon: '✨', m: 0.15, r: 0.25, g: 1 },
  { id: 'metal', label: 'Metallic', icon: '🔩', m: 0.75, r: 0.35, g: 1 },
  { id: 'chrome', label: 'Chrome', icon: '🪞', m: 0.95, r: 0.12, g: 1 },
  { id: 'neon', label: 'Neon glow', icon: '💡', m: 0.3, r: 0.35, g: 2.2 },
];
const NAMES = ['Sparky', 'Bolt', 'Pixel', 'Zippy', 'Captain Cog', 'Nova', 'Widget', 'Tinker', 'Robo-Rex', 'Gizmo', 'Comet', 'Turbo', 'Echo', 'Rusty', 'Blink', 'Chip'];
const MOVE_FROM_HINT = { wheels: 'wheels', wheels6: 'wheels6', tracks: 'tracks', legs: 'legs', flying: 'flying', hover: 'flying', swim: 'flying', jets: 'jets' };
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const SIZES = [['bodyW', 'Width'], ['bodyH', 'Height'], ['bodyL', 'Length']];

/** Workshop choices → a Robot Studio robot config. */
export function workshopConfig(w) {
  const fin = FINISHES.find((f) => f.id === w.finish) || FINISHES[1];
  const common = {
    id: w.id,
    name: w.name || 'My Robot',
    primaryColor: w.primary,
    accentColor: w.accent,
    trimColor: w.accent,
    ledColor: w.led,
    wheelColor: w.wheel || '#1a1a1a',
    materialMetalness: fin.m,
    materialRoughness: fin.r,
    materialGlow: fin.g,
    finish: fin.id,
    sensors: ['camera'],
    tools: [],
    socketAttachments: {},
    addons: { top: w.top || 'none', back: w.back || 'none', front: w.front || 'none' },
    plateText: (w.plate || 'BB 01').slice(0, 6).toUpperCase(),
    workshop: true,
  };
  if (w.mode === 'parts') {
    const play = partsPlayAs(w.parts);
    return { ...common, chassisId: play.chassisId, movementId: play.movementId, parts: { ...w.parts, finish: fin.id } };
  }
  const ch = CHASSIS_DATA.find((c) => c.id === w.chassisId) || CHASSIS_DATA[0];
  return { ...common, chassisId: ch.id, movementId: MOVE_FROM_HINT[ch.movementHint] || 'wheels' };
}

function fromConfig(cfg) {
  return {
    id: cfg?.id,
    mode: cfg?.workshop && !cfg?.parts ? 'studio' : 'parts',
    name: cfg?.name || pick(NAMES),
    parts: { ...DEFAULT_PARTS, ...(cfg?.parts || {}) },
    chassisId: cfg?.chassisId && CHASSIS_DATA.some((c) => c.id === cfg.chassisId) ? cfg.chassisId : 'rover',
    primary: cfg?.primaryColor || '#6366f1',
    accent: cfg?.accentColor || '#facc15',
    led: cfg?.ledColor || '#5eead4',
    wheel: cfg?.wheelColor || '#1a1a1a',
    finish: cfg?.finish || cfg?.parts?.finish || 'glossy',
    top: cfg?.addons?.top || 'antenna',
    back: cfg?.addons?.back || 'none',
    front: cfg?.addons?.front || 'none',
    plate: cfg?.plateText || 'BB 01',
  };
}

/** A tile that shows the robot as it would look with this option. */
function PreviewTile({ cfg, label, active, onPick, fallback }) {
  const [src, setSrc] = useState(null);
  const key = JSON.stringify(cfg);
  useEffect(() => {
    let live = true;
    renderRobotThumb(cfg).then((u) => { if (live) setSrc(u); });
    return () => { live = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <button type="button" className={`ws-body${active ? ' is-on' : ''}`} onClick={onPick} title={label}>
      <span className="ws-body-art">{src ? <img src={src} alt="" draggable={false} /> : <span className="ws-body-wait"><EmojiIcon e={fallback || '🤖'} /></span>}</span>
      <span className="ws-body-name">{label}</span>
    </button>
  );
}

function IconTile({ icon, label, active, onPick }) {
  return (
    <button type="button" className={`ws-tile${active ? ' is-on' : ''}`} onClick={onPick}>
      <span className="ws-tile-icon"><EmojiIcon e={icon} /></span><span>{label}</span>
    </button>
  );
}

function Swatches({ label, value, options, onPick }) {
  return (
    <div className="ws-swatch-row">
      <div className="cs-label">{label}</div>
      <div className="cs-swatches">
        {options.map((c) => <button key={c} type="button" aria-label={`${label} ${c}`} className={`cs-swatch${value === c ? ' is-on' : ''}`} style={{ background: c }} onClick={() => onPick(c)} />)}
        <label className="cs-swatch cs-swatch--custom" title="Pick any colour"><EmojiIcon e="🎨" /><input type="color" value={value} onChange={(e) => onPick(e.target.value)} /></label>
      </div>
    </div>
  );
}

export default function RobotWorkshop({ initial, onSave, onPlay, onBack }) {
  const [w, setW] = useState(() => fromConfig(initial));
  const [step, setStep] = useState(w.mode === 'parts' ? 'body' : 'studio');
  const [family, setFamily] = useState('all');
  const [bounce, setBounce] = useState(0);
  const [saved, setSaved] = useState(false);
  const set = (patch, pop = true) => { setW((x) => ({ ...x, ...patch })); setSaved(false); if (pop) setBounce((b) => b + 1); };
  const setPart = (patch, pop = true) => { setW((x) => ({ ...x, parts: { ...x.parts, ...patch } })); setSaved(false); if (pop) setBounce((b) => b + 1); };
  const config = useMemo(() => workshopConfig(w), [w]);
  const look = { primaryColor: w.primary, accentColor: w.accent, ledColor: w.led, wheelColor: w.wheel };
  /** The robot as it would be with one part swapped — for the picture on each choice. */
  const withPart = (patch) => ({ ...look, parts: { ...w.parts, ...patch, finish: w.finish }, chassisId: 'rover' });

  const bodies = useMemo(() => CHASSIS_DATA.filter((c) => c.id !== 'custom'), []);
  const families = useMemo(() => FAMILY_ORDER.filter((f) => bodies.some((c) => getStudioRobotGroup(c.id) === f)), [bodies]);
  const shown = family === 'all' ? bodies : bodies.filter((c) => getStudioRobotGroup(c.id) === family);
  const chassis = bodies.find((c) => c.id === w.chassisId) || bodies[0];
  const steps = w.mode === 'parts' ? PART_STEPS : STUDIO_STEPS;
  const playName = w.mode === 'parts' ? ({ droid: 'walking', spider: 'spider', drone: 'flying', rover: 'driving' })[config.chassisId] : chassis.name;

  const switchMode = (mode) => { set({ mode }); setStep(mode === 'parts' ? 'body' : 'studio'); };
  const surprise = () => {
    const rp = (k) => pick(PART_OPTIONS[k]).id;
    set({
      name: pick(NAMES), primary: pick(SWATCHES.slice(0, 9)), accent: pick(SWATCHES), led: pick(LIGHTS), finish: pick(FINISHES).id,
      top: pick(ADDON_SLOTS.top).id, back: pick(ADDON_SLOTS.back).id, front: pick(ADDON_SLOTS.front).id,
      ...(w.mode === 'parts'
        ? { parts: { body: rp('body'), head: rp('head'), face: rp('face'), arms: rp('arms'), move: rp('move'), pattern: Math.random() < 0.5 ? 'plain' : rp('pattern'), bodyW: 0.8 + Math.random() * 0.5, bodyH: 0.8 + Math.random() * 0.5, bodyL: 0.8 + Math.random() * 0.5, headSize: 0.85 + Math.random() * 0.35 } }
        : { chassisId: pick(bodies).id }),
    });
  };

  return (
    <div className="cs-designer ws-root">
      <div className="cs-topbar">
        <button className="cs-btn cs-btn--ghost" onClick={onBack}>← Create Studio</button>
        <div className="cs-topbar-title"><EmojiIcon e="🔧" style={{ marginRight: '0.35em' }} />Robot Workshop</div>
        <div className="ws-mode" role="tablist" aria-label="How to make your robot">
          <button role="tab" aria-selected={w.mode === 'parts'} className={w.mode === 'parts' ? 'is-on' : ''} onClick={() => switchMode('parts')}><EmojiIcon e="🔧" /> Build from parts</button>
          <button role="tab" aria-selected={w.mode === 'studio'} className={w.mode === 'studio' ? 'is-on' : ''} onClick={() => switchMode('studio')}><EmojiIcon e="🤖" /> Start from a Studio robot</button>
        </div>
        <button className="cs-btn" onClick={surprise}><EmojiIcon e="🎲" style={{ marginRight: '0.35em' }} />Surprise me!</button>
      </div>

      <div className="ws-body-grid">
        <aside className="cs-panel ws-options">
          <div className={`ws-steps ws-steps--${steps.length}`} role="tablist">
            {steps.map((s, i) => (
              <button key={s.id} role="tab" aria-selected={step === s.id} className={`ws-step${step === s.id ? ' is-on' : ''}`} onClick={() => setStep(s.id)}>
                <b>{i + 1}</b><EmojiIcon e={s.icon} /> {s.label}
              </button>
            ))}
          </div>

          <div className="ws-scroll">
            {step === 'body' && (
              <>
                <div className="cs-label" style={{ marginTop: 0 }}>Body shape</div>
                <div className="ws-bodies">
                  {PART_OPTIONS.body.map((o) => <PreviewTile key={o.id} cfg={withPart({ body: o.id })} label={o.label} fallback={o.icon} active={w.parts.body === o.id} onPick={() => setPart({ body: o.id })} />)}
                </div>
                <div className="cs-label">Size</div>
                {SIZES.map(([k, label]) => (
                  <label key={k} className="ws-slider"><span>{label}</span>
                    <input type="range" min="0.6" max="1.5" step="0.05" value={w.parts[k] || 1} onChange={(e) => setPart({ [k]: Number(e.target.value) }, false)} />
                  </label>
                ))}
              </>
            )}

            {step === 'head' && (
              <>
                <div className="cs-label" style={{ marginTop: 0 }}>Head</div>
                <div className="ws-bodies">
                  {PART_OPTIONS.head.map((o) => <PreviewTile key={o.id} cfg={withPart({ head: o.id })} label={o.label} fallback={o.icon} active={w.parts.head === o.id} onPick={() => setPart({ head: o.id })} />)}
                </div>
                <label className="ws-slider"><span>Head size</span>
                  <input type="range" min="0.7" max="1.4" step="0.05" value={w.parts.headSize || 1} onChange={(e) => setPart({ headSize: Number(e.target.value) }, false)} />
                </label>
                <div className="cs-label">Face</div>
                <div className="ws-tiles">
                  {PART_OPTIONS.face.map((o) => <IconTile key={o.id} icon={o.icon} label={o.label} active={w.parts.face === o.id} onPick={() => setPart({ face: o.id })} />)}
                </div>
              </>
            )}

            {step === 'arms' && (
              <>
                <div className="cs-label" style={{ marginTop: 0 }}>Arms</div>
                <div className="ws-bodies">
                  {PART_OPTIONS.arms.map((o) => <PreviewTile key={o.id} cfg={withPart({ arms: o.id })} label={o.label} fallback={o.icon} active={w.parts.arms === o.id} onPick={() => setPart({ arms: o.id })} />)}
                </div>
              </>
            )}

            {step === 'move' && (
              <>
                <div className="cs-label" style={{ marginTop: 0 }}>How it moves</div>
                <div className="ws-bodies">
                  {PART_OPTIONS.move.map((o) => <PreviewTile key={o.id} cfg={withPart({ move: o.id })} label={o.label} fallback={o.icon} active={w.parts.move === o.id} onPick={() => setPart({ move: o.id })} />)}
                </div>
                <p className="cs-muted" style={{ marginTop: 10 }}>Wheels and tracks drive, legs walk, propellers fly — your robot gets the right blocks for how it moves.</p>
              </>
            )}

            {step === 'studio' && (
              <>
                <div className="cs-chips ws-families">
                  <button className={`cs-chip${family === 'all' ? ' is-on' : ''}`} onClick={() => setFamily('all')}>All {bodies.length}</button>
                  {families.map((f) => <button key={f} className={`cs-chip${family === f ? ' is-on' : ''}`} onClick={() => setFamily(f)}>{FAMILY_PICKER_LABEL[f] || f}</button>)}
                </div>
                <div className="ws-bodies">
                  {shown.map((ch) => <PreviewTile key={ch.id} cfg={{ chassisId: ch.id, ...look }} label={ch.name} fallback={ch.icon} active={w.chassisId === ch.id} onPick={() => set({ chassisId: ch.id })} />)}
                </div>
              </>
            )}

            {step === 'paint' && (
              <div className="ws-paint">
                <Swatches label="Body colour" value={w.primary} options={SWATCHES} onPick={(c) => set({ primary: c })} />
                <Swatches label="Details" value={w.accent} options={SWATCHES} onPick={(c) => set({ accent: c })} />
                <Swatches label="Lights & face" value={w.led} options={LIGHTS} onPick={(c) => set({ led: c })} />
                <Swatches label="Wheels & tyres" value={w.wheel} options={['#1a1a1a', '#334155', '#f8fafc', '#ef4444', '#facc15', '#22c55e', '#0ea5e9', '#a855f7']} onPick={(c) => set({ wheel: c })} />
                <div className="cs-label">Finish</div>
                <div className="ws-tiles">
                  {FINISHES.map((f) => <IconTile key={f.id} icon={f.icon} label={f.label} active={w.finish === f.id} onPick={() => set({ finish: f.id })} />)}
                </div>
                {w.mode === 'parts' && (
                  <>
                    <div className="cs-label">Pattern</div>
                    <div className="ws-tiles">
                      {PART_OPTIONS.pattern.map((o) => <IconTile key={o.id} icon={o.icon} label={o.label} active={w.parts.pattern === o.id} onPick={() => setPart({ pattern: o.id })} />)}
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 'addons' && (
              <div className="ws-addons">
                {[['top', 'On top'], ['back', 'On the back'], ['front', 'On the front']].map(([slot, label]) => (
                  <div key={slot}>
                    <div className="cs-label">{label}</div>
                    <div className="ws-tiles">
                      {ADDON_SLOTS[slot].map((a) => <IconTile key={a.id} icon={a.icon} label={a.label} active={w[slot] === a.id} onPick={() => set({ [slot]: a.id })} />)}
                    </div>
                    {slot === 'front' && w.front === 'plate' && (
                      <input className="cs-input" style={{ marginTop: 8, maxWidth: 160, textTransform: 'uppercase' }} maxLength={6} value={w.plate} onChange={(e) => set({ plate: e.target.value }, false)} aria-label="Number plate text" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="cs-stage ws-stage">
          <div className="cs-namebar">
            <input className="cs-name" value={w.name} maxLength={20} onChange={(e) => set({ name: e.target.value }, false)} aria-label="Robot name" />
            <span className="ws-chip-body">{w.mode === 'parts' ? <><EmojiIcon e="🔧" /> Built by you</> : <><EmojiIcon e={chassis.icon || '🤖'} /> {chassis.name}</>}</span>
          </div>
          <WorkshopPreview config={config} bounce={bounce} />
          <p className="cs-hint">Drag to spin your robot</p>
        </section>

        <aside className="cs-panel cs-actions">
          <div className="cs-card-title">Ready to roll?</div>
          <p className="cs-muted">{w.mode === 'parts'
            ? <>Your robot plays the <b>{playName}</b> robot game modes — and every arena you build in the Arena Maker.</>
            : <>Your robot plays every <b>{chassis.name}</b> game mode — and every arena you build in the Arena Maker.</>}</p>
          <button className="cs-btn cs-btn--primary cs-btn--big" onClick={() => { const e = onSave(config); if (e?.id) set({ id: e.id }, false); setSaved(true); }}><IconText>{saved ? '✅ Saved!' : '💾 Save robot'}</IconText></button>
          <button className="cs-btn cs-btn--go cs-btn--big" onClick={() => onPlay(config)}><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Test drive</button>
        </aside>
      </div>
    </div>
  );
}
