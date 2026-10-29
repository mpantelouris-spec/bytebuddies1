/**
 * "Who's driving?" — pick any robot before playing an arena or racing a track:
 * the pre-made Studio robots or one of your own built robots.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { CHASSIS_DATA } from '../services/studio-robot-builder.js';
import { STARTER_CHASSIS_IDS, RETIRED_CHASSIS_IDS, getPrimaryRobotDisplay } from '../data/primary-robot-studio.js';
import { loadRobotLibrary, isCreatedRobot } from '../services/studio-robot-store.js';
import { ChassisThumb } from '../studio/BuildPage.jsx';
import { renderRobotThumb } from './robotThumbs.js';
import { EmojiIcon } from '../../components/ui/Icon.jsx';

/** Robots that can't drive round an arena or a track (the robot arm stays bolted to its bench). */
const CANT_DRIVE = new Set(['robotarm', 'custom']);

function MadeThumb({ robot }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let live = true;
    renderRobotThumb(robot).then((u) => { if (live) setSrc(u); }).catch(() => {});
    return () => { live = false; };
  }, [robot]);
  return <span className="bb-chassis-thumb">{src ? <img src={src} alt="" draggable={false} /> : <span className="bb-chassis-icon">🤖</span>}</span>;
}

export default function RobotPicker({ title, current, onPick, onClose }) {
  const [more, setMore] = useState(false);
  const made = useMemo(() => loadRobotLibrary().filter(isCreatedRobot), []);
  const studio = useMemo(() => {
    const byId = new Map(CHASSIS_DATA.map((c) => [c.id, c]));
    const starters = STARTER_CHASSIS_IDS.filter((id) => !CANT_DRIVE.has(id)).map((id) => byId.get(id)).filter(Boolean);
    const extra = CHASSIS_DATA.filter((c) => !CANT_DRIVE.has(c.id) && !RETIRED_CHASSIS_IDS.has(c.id) && !STARTER_CHASSIS_IDS.includes(c.id));
    return { starters, extra };
  }, []);
  const usingMade = isCreatedRobot(current);
  const name = (ch) => getPrimaryRobotDisplay(ch.id)?.name || ch.name;

  useEffect(() => {
    const key = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);

  return (
    <div className="cs-modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cs-modal rp" role="dialog" aria-label="Choose your robot">
        <div className="cs-modal-head">
          <b><EmojiIcon e="🤖" style={{ marginRight: '0.35em' }} />Who's driving?</b>
          <span className="cs-muted">{title}</span>
          <button className="cs-btn cs-btn--ghost cs-btn--sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="rp-body">
          {current && (
            <button className="rp-keep" onClick={() => onPick({ keep: true })}>
              <EmojiIcon e="▶" style={{ marginRight: '0.4em' }} />Keep <b>{current.name || name({ id: current.chassisId })}</b>
            </button>
          )}
          {made.length > 0 && (
            <>
              <div className="cs-label">Robots you built</div>
              <div className="rp-grid">
                {made.map((r) => (
                  <button key={r.id} className={`bb-chassis-card${usingMade && current?.id === r.id ? ' selected' : ''}`} onClick={() => onPick({ made: r })}>
                    <MadeThumb robot={r} />
                    <span className="bb-chassis-name">{r.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="cs-label">Studio robots</div>
          <div className="rp-grid">
            {[...studio.starters, ...(more ? studio.extra : [])].map((ch) => (
              <button key={ch.id} className={`bb-chassis-card${!usingMade && current?.chassisId === ch.id ? ' selected' : ''}`} onClick={() => onPick({ chassis: ch })}>
                <ChassisThumb ch={ch} />
                <span className="bb-chassis-name">{name(ch)}</span>
              </button>
            ))}
          </div>
          {studio.extra.length > 0 && (
            <button className="cs-btn cs-btn--sm cs-btn--ghost" style={{ marginTop: 10 }} onClick={() => setMore((v) => !v)}>
              {more ? 'Fewer robots' : `More robots (${studio.extra.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
