import React, { useMemo, useState } from 'react';
import RobotPreview from './RobotPreview.jsx';
import { DESIGN_OPTIONS, DEFAULT_DESIGN, randomDesign } from './designedRobot.js';
import { EmojiIcon, IconText } from '../../components/ui/Icon.jsx';

const SECTIONS = [
  { id: 'body', label: 'Body', icon: '🧱' },
  { id: 'head', label: 'Head', icon: '🙂' },
  { id: 'eyes', label: 'Eyes', icon: '👀' },
  { id: 'arms', label: 'Arms', icon: '🦾' },
  { id: 'move', label: 'Moves', icon: '🛞' },
  { id: 'top', label: 'Top', icon: '👑' },
  { id: 'pattern', label: 'Pattern', icon: '🎨' },
  { id: 'colours', label: 'Colours', icon: '🖌️' },
];
const SWATCHES = ['#6366f1', '#ef4444', '#f97316', '#facc15', '#22c55e', '#14b8a6', '#0ea5e9', '#a855f7', '#ec4899', '#f8fafc', '#94a3b8', '#1f2937'];
const NAMES = ['Sparky', 'Bolt', 'Pixel', 'Zippy', 'Captain Cog', 'Nova', 'Widget', 'Tinker', 'Robo-Rex', 'Gizmo', 'Byte', 'Comet'];
const MOVE_TO_ID = { wheels: 'wheels', tracks: 'tracks', legs: 'legs', hover: 'flying', spring: 'legs', propeller: 'flying' };

export function designToRobotConfig({ name, design, primary, accent, led, id }) {
  return {
    id: id || `designed-${Date.now()}`,
    name: name || 'My Robot',
    chassisId: 'custom',
    chassisBuildKey: 'designer',
    design,
    primaryColor: primary,
    accentColor: accent,
    trimColor: accent,
    ledColor: led,
    movementId: MOVE_TO_ID[design.move] || 'wheels',
    sensors: ['camera'],
    tools: [],
    socketAttachments: {},
    designed: true,
  };
}

export default function RobotDesigner({ initial, onSave, onPlay, onBack }) {
  const [name, setName] = useState(initial?.name || NAMES[Math.floor(Math.random() * NAMES.length)]);
  const [design, setDesign] = useState(initial?.design || DEFAULT_DESIGN);
  const [primary, setPrimary] = useState(initial?.primaryColor || '#6366f1');
  const [accent, setAccent] = useState(initial?.accentColor || '#facc15');
  const [led, setLed] = useState(initial?.ledColor || '#5eead4');
  const [section, setSection] = useState('body');
  const [bounce, setBounce] = useState(0);
  const [saved, setSaved] = useState(false);

  const choose = (key, id) => { setDesign((d) => ({ ...d, [key]: id })); setBounce((b) => b + 1); setSaved(false); };
  const surprise = () => {
    setDesign(randomDesign());
    setPrimary(SWATCHES[Math.floor(Math.random() * 9)]);
    setAccent(SWATCHES[Math.floor(Math.random() * 9)]);
    setName(NAMES[Math.floor(Math.random() * NAMES.length)]);
    setBounce((b) => b + 1);
    setSaved(false);
  };
  const config = useMemo(() => designToRobotConfig({ name, design, primary, accent, led, id: initial?.id }), [name, design, primary, accent, led, initial?.id]);
  const summary = SECTIONS.filter((s) => s.id !== 'colours').map((s) => DESIGN_OPTIONS[s.id].find((o) => o.id === design[s.id])?.emoji).join(' ');

  return (
    <div className="cs-designer">
      <div className="cs-topbar">
        <button className="cs-btn cs-btn--ghost" onClick={onBack}>← Create Studio</button>
        <div className="cs-topbar-title"><EmojiIcon e="🤖" style={{ marginRight: '0.35em' }} />Robot Designer</div>
        <button className="cs-btn" onClick={surprise}><EmojiIcon e="🎲" style={{ marginRight: '0.35em' }} />Surprise me!</button>
      </div>
      <div className="cs-designer-body">
        <aside className="cs-panel cs-options">
          <div className="cs-sections" role="tablist">
            {SECTIONS.map((s) => (
              <button key={s.id} role="tab" aria-selected={section === s.id} className={`cs-section${section === s.id ? ' is-on' : ''}`} onClick={() => setSection(s.id)}>
                <span><EmojiIcon e={s.icon} /></span>{s.label}
              </button>
            ))}
          </div>
          {section !== 'colours' ? (
            <div className="cs-tiles">
              {DESIGN_OPTIONS[section].map((o) => (
                <button key={o.id} className={`cs-tile${design[section] === o.id ? ' is-on' : ''}`} onClick={() => choose(section, o.id)}>
                  <span className="cs-tile-emoji">{o.emoji}</span>
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="cs-colours">
              {[['Body', primary, setPrimary], ['Details', accent, setAccent], ['Lights', led, setLed]].map(([label, val, set]) => (
                <div key={label}>
                  <div className="cs-label">{label}</div>
                  <div className="cs-swatches">
                    {SWATCHES.map((c) => (
                      <button key={c} aria-label={`${label} ${c}`} className={`cs-swatch${val === c ? ' is-on' : ''}`} style={{ background: c }} onClick={() => { set(c); setSaved(false); }} />
                    ))}
                    <label className="cs-swatch cs-swatch--custom" title="Pick any colour">
                      🎨<input type="color" value={val} onChange={(e) => { set(e.target.value); setSaved(false); }} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        <section className="cs-stage">
          <div className="cs-namebar">
            <input className="cs-name" value={name} maxLength={20} onChange={(e) => { setName(e.target.value); setSaved(false); }} aria-label="Robot name" />
            <span className="cs-summary">{summary}</span>
          </div>
          <RobotPreview design={design} primary={primary} accent={accent} led={led} bounce={bounce} />
          <p className="cs-hint">Drag to spin your robot</p>
        </section>

        <aside className="cs-panel cs-actions">
          <div className="cs-card-title">Ready to roll?</div>
          <p className="cs-muted">Save your robot to <b>My Robots</b>, then take it on an adventure — including arenas you build yourself!</p>
          <button className="cs-btn cs-btn--primary cs-btn--big" onClick={() => { onSave(config); setSaved(true); }}><IconText>{saved ? '✅ Saved!' : '💾 Save robot'}</IconText></button>
          <button className="cs-btn cs-btn--go cs-btn--big" onClick={() => onPlay(config)}><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Play Arena Quest</button>
          <div className="cs-stats">
            {[['Speed', design.move === 'hover' || design.move === 'wheels' ? 85 : design.move === 'propeller' ? 90 : 60], ['Strength', design.body === 'tank' ? 95 : design.arms === 'grabbers' ? 80 : 65], ['Style', 70 + (design.pattern !== 'plain' ? 15 : 0) + (design.top !== 'none' ? 10 : 0)]].map(([l, v]) => (
              <div key={l} className="cs-stat"><span>{l}</span><div className="cs-bar"><i style={{ width: `${Math.min(100, v)}%` }} /></div></div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
