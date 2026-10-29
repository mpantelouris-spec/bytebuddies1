/**
 * Fighting Arenas hub — boxing plus the fighting worlds (castle, dojo, pirate ship,
 * wizard tower, space), each in its own section with its own colours.
 */
import React from 'react';
import { FIGHTING_COURSES } from '../data/fighting-courses.js';
import { FIGHT_WORLD_LIST } from '../data/fight-worlds.js';
import { getRingSkinIndex, RING_SKIN_COLORS, RING_SKIN_NAMES } from './CombatRingSkins.js';
import { getFightCareer, isFightUnlocked, getFightUnlockLabel } from '../services/fight-career-progress.js';
import { EmojiIcon, IconText } from '../../components/ui/Icon.jsx';

/** Card colours: a world's own colour, or (for boxing) the colours of the ring it's fought in. */
function cardLook(course, sec) {
  if (course.fightWorld) return { a: '#0b1020', b: sec.color, place: sec.name };
  const i = getRingSkinIndex(course);
  return { a: RING_SKIN_COLORS[i].card[0], b: RING_SKIN_COLORS[i].card[1], place: RING_SKIN_NAMES[i] };
}

export function FightingHub({ courses = FIGHTING_COURSES, currentId, onSelect, onClose, career = getFightCareer() }) {
  const boxing = courses.filter((c) => !c.fightWorld);
  const sections = [
    ...(boxing.length ? [{ id: 'boxing', name: 'Robot Boxing', icon: '🥊', color: '#ef4444', blurb: 'Gloves on — ten different rings, from the Colosseum to the Lava Pit.', courses: boxing }] : []),
    ...FIGHT_WORLD_LIST.map((w) => ({ id: w.id, name: w.name, icon: w.icon, color: w.color, blurb: `${w.hero.label} vs ${w.rival.label} — ${w.blurb}`, courses: courses.filter((c) => c.fightWorld === w.id) }))
      .filter((sec) => sec.courses.length),
  ];
  return (
    <div className="fight-hub-overlay" role="dialog" aria-label="Fighting arenas">
      <div className="fight-hub-panel">
        <header className="fight-hub-header">
          <div>
            <span className="fight-hub-icon"><EmojiIcon e="⚔️" /></span>
            <h2>Fighting Arenas</h2>
            <p>Boxing, castles, dojos, pirate ships, wizard towers and space</p>
          </div>
          <button type="button" className="fight-hub-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="fight-hub-stats">
          <span>Lv {career.level}</span>
          <span><EmojiIcon e="🪙" style={{ marginRight: '0.35em' }} />{career.coins}</span>
          <span>W {career.wins} · L {career.losses}</span>
          {career.belts?.length > 0 && (
            <span className="fight-hub-belts"><IconText>{career.belts.map((b) => (b === 'champion' ? '🏆' : '🥇')).join(' ')}</IconText></span>
          )}
        </div>

        {sections.map((sec) => (
          <section key={sec.id} className="fight-hub-section">
            <div className="fight-hub-section-head" style={{ '--sec': sec.color }}>
              <span className="fight-hub-section-icon"><EmojiIcon e={sec.icon} /></span>
              <div>
                <h3>{sec.name}</h3>
                <p>{sec.blurb}</p>
              </div>
            </div>
            <div className="fight-hub-grid">
              {sec.courses.map((c) => {
                const unlocked = isFightUnlocked(c.id);
                const cleared = career.cleared?.includes(c.id);
                const lockHint = !unlocked ? getFightUnlockLabel(c.id) : null;
                const look = cardLook(c, sec);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`fight-hub-card${currentId === c.id ? ' active' : ''}${!unlocked ? ' locked' : ''}${cleared ? ' cleared' : ''}`}
                    style={{ '--card-a': look.a, '--card-b': look.b }}
                    disabled={!unlocked}
                    onClick={() => unlocked && onSelect(c)}
                  >
                    <span className="fight-hub-card-band" aria-hidden="true"><EmojiIcon e={c.icon} /><span>{look.place}</span></span>
                    <strong>{c.name}</strong>
                    <span className="fight-hub-card-tag">{c.shortName || c.fightMode}</span>
                    <span className="fight-hub-card-desc">{c.tagline || c.desc}</span>
                    {cleared && <span className="fight-hub-cleared">✓ Cleared</span>}
                    {lockHint && <span className="fight-hub-lock"><EmojiIcon e="🔒" style={{ marginRight: '0.35em' }} />{lockHint}</span>}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        <footer className="fight-hub-footer">
          <span>Code your moves with blocks or Python, then press ▶ Simulate</span>
        </footer>
      </div>
    </div>
  );
}

export default FightingHub;
