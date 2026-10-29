/**
 * StudioCoach — the learning built into Robot Studio play (not a lesson).
 *
 * Every game mode quietly practises one computing concept (KS2):
 *   - Code challenges tick off live as blocks are added. Simulate stays
 *     locked until the pupil has changed the example code, so nobody can
 *     just press play.
 *   - An optional "How it works" tip card with a worked example.
 *   - After a win, a short badge quiz plus "explain your code".
 * Finishing earns the Coder badge and unlocks free driving with the keyboard.
 * The program, goals, answers and explanation go to the work log so the
 * teacher sees the real work when marking.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MODE_SKILLS } from '../data/primary-robot-studio.js';
import { readWork, recordWork, describeBlocks } from '../../utils/workLog.js';
import { EmojiIcon, IconText } from '../../components/ui/Icon.jsx';

/* ─── Block classification ─── */

const LOOP = /^(repeat|forever|repeat_until|repeat_until_goal|repeat_while)$/;
const IF = /^if_|^if$/;
const SENSOR = /scan|sensor|sonar|obstacle_ahead|see_object|^check_|^detect_|^race_(on_track|dist|speed|current)|line_below|distance_to_pipe|^gap_|bird_height|is_falling|mine_ahead|read_altitude|wind_speed|if_distance|if_color/;
const WAIT = /^wait/;
const TURN = /^turn|^curve_|^bank_|u_turn|rotate_|spin/;
const NOT_ACTION = /^when_|^(else|end)$/;

const actions = (bs) => bs.filter((b) => b?.id && !NOT_ACTION.test(b.id));
const has = (bs, re) => bs.some((b) => re.test(b?.id || ''));
const count = (bs, re) => bs.filter((b) => re.test(b?.id || '')).length;
const sig = (b) => `${b.id}|${JSON.stringify(b.paramValues || {})}`;

/** How many blocks differ from the example (added + removed + edited). */
function changesFrom(script, starter) {
  const left = new Map();
  (starter || []).filter((b) => b.id !== 'when_start').forEach((b) => left.set(sig(b), (left.get(sig(b)) || 0) + 1));
  let added = 0;
  script.forEach((b) => {
    const k = sig(b);
    if (left.get(k)) left.set(k, left.get(k) - 1); else added++;
  });
  const removed = [...left.values()].reduce((n, v) => n + v, 0);
  return added + removed;
}

/* ─── Concepts ─── */

const CONCEPTS = {
  sequence: {
    name: 'Sequence', emoji: '📋',
    learn: 'A program is a list of instructions. The robot follows them one at a time, from top to bottom — so the order really matters.',
    example: ['Move forward 2', 'Turn right 90°', 'Move forward 2'],
    exampleNote: 'This robot drives, turns the corner, then drives on. Swap the first two blocks and it turns before it moves!',
    word: 'sequence',
    check: [
      { q: 'Your program is: Move forward → Turn right → Move forward. What does the robot do second?', options: ['Move forward', 'Turn right', 'Stop'], answer: 1, why: 'Blocks run from top to bottom, so the second block — Turn right — runs second.' },
      { q: 'Why does the order of your blocks matter?', options: ['The robot does them one at a time, in order', 'The robot picks an order at random', 'It doesn’t matter'], answer: 0, why: 'A computer follows a sequence exactly, in the order you wrote it.' },
      { q: 'Your robot turned before it moved, but it should move first. How do you debug it?', options: ['Swap the two blocks round', 'Add more Move blocks', 'Press Simulate again and hope'], answer: 0, why: 'The bug is the order, so fixing the order fixes the bug.' },
    ],
  },
  turns: {
    name: 'Turns and angles', emoji: '↪️',
    learn: 'Robots can only go straight unless you tell them to turn. A quarter turn is a right angle: 90 degrees. Two quarter turns make 180 degrees — facing the other way.',
    example: ['Move forward 2', 'Turn right 90°', 'Move forward 3'],
    exampleNote: 'Move, turn a right angle, move again: that is how the robot gets round a corner.',
    word: 'angle',
    check: [
      { q: 'Your robot needs to go round a corner. Which block goes between the two Move blocks?', options: ['Turn', 'Wait', 'Repeat'], answer: 0, why: 'Without a Turn the robot carries straight on.' },
      { q: 'How many degrees is a quarter turn (a right angle)?', options: ['45°', '90°', '180°'], answer: 1, why: 'A full turn is 360°, so a quarter turn is 360 ÷ 4 = 90°.' },
      { q: 'The robot turned the wrong way at the corner. What should you change?', options: ['Use Turn left instead of Turn right', 'Move further first', 'Add a Wait'], answer: 0, why: 'The direction of the turn is the bug.' },
    ],
  },
  loops: {
    name: 'Loops (repetition)', emoji: '🔁',
    learn: 'When you need to do the same thing again and again, put it inside a loop. Repeat runs the blocks a set number of times. Forever keeps going until the game ends. Loops make code shorter and easier to fix.',
    example: ['Repeat 4 times', '   Move forward 2', '   Turn right 90°'],
    exampleNote: 'Four sides and four turns — this little loop draws a whole square, instead of writing 8 blocks.',
    word: 'loop',
    check: [
      { q: 'Repeat 4 times: Move forward 2. How many steps does the robot move altogether?', options: ['4', '6', '8'], answer: 2, why: '4 repeats × 2 steps = 8 steps.' },
      { q: 'Why do coders use loops?', options: ['To repeat blocks without writing them out again', 'To make the robot stop', 'To change the robot’s colour'], answer: 0, why: 'A loop repeats code, so the program is shorter and easier to change.' },
      { q: 'What is the difference between Repeat 3 and Forever?', options: ['Repeat 3 stops after 3 goes; Forever keeps going', 'They are exactly the same', 'Forever only runs once'], answer: 0, why: 'A count-controlled loop stops; a forever loop keeps checking for the whole game.' },
    ],
  },
  sensors: {
    name: 'Sensors (input)', emoji: '📡',
    learn: 'A sensor is an input: it tells the robot about the world — how far away a wall is, what colour is underneath, or what is ahead. Your code can use that information to decide what to do.',
    example: ['Scan ahead', 'If obstacle ahead then', '   Turn right 90°', 'Move forward 2'],
    exampleNote: 'The robot looks first, then only turns if something is in the way.',
    word: 'sensor',
    check: [
      { q: 'What does a sensor do?', options: ['Gives the robot information about the world', 'Makes the robot go faster', 'Paints the robot'], answer: 0, why: 'Sensors are inputs — they collect information.' },
      { q: 'Which of these is a sensor on a real robot?', options: ['An ultrasonic distance sensor', 'A wheel', 'A battery'], answer: 0, why: 'A distance sensor measures how far away things are. Wheels are outputs.' },
      { q: 'Your robot keeps bumping into walls. What would help most?', options: ['Check a sensor and turn if something is ahead', 'Make it go faster', 'Delete all the blocks'], answer: 0, why: 'Using sensor input lets the robot react before it crashes.' },
    ],
  },
  timing: {
    name: 'Timing', emoji: '⏱️',
    learn: 'Computers are very fast. Sometimes your robot needs to pause — to let a gate open, or a platform arrive. A Wait block pauses the program before the next instruction.',
    example: ['Move forward 2', 'Wait 1 second', 'Move forward 3'],
    exampleNote: 'The robot stops for one second in the middle, then carries on.',
    word: 'wait',
    check: [
      { q: 'What does a Wait block do?', options: ['Pauses before the next block runs', 'Makes the robot go backwards', 'Repeats the blocks'], answer: 0, why: 'Wait holds the program for a moment, then carries on.' },
      { q: 'A gate opens every 2 seconds. Why add a Wait before driving through?', options: ['So the robot goes when the gate is open', 'To save battery', 'It isn’t needed'], answer: 0, why: 'Timing your code to the world stops the crash.' },
    ],
  },
  selection: {
    name: 'Selection (If)', emoji: '🔀',
    learn: 'An If block lets the program choose. It checks a condition — “is the enemy close?”, “do I have the ball?” — and only runs the blocks inside when the answer is yes. Put your If blocks inside Forever so the robot keeps checking all game.',
    example: ['Forever', '   If I have the ball then', '      Dribble toward goal', '   If in shooting range then', '      Shoot'],
    exampleNote: 'Every moment of the game, the robot asks two questions and picks the right action.',
    word: 'condition',
    check: [
      { q: '“If enemy close then Block.” When does the robot Block?', options: ['Only when the enemy is close', 'All the time', 'Never'], answer: 0, why: 'The blocks inside an If only run when the condition is true.' },
      { q: 'Using If is called selection. Why?', options: ['The program selects what to do depending on a condition', 'It selects a robot colour', 'It selects the fastest robot'], answer: 0, why: 'Selection means choosing between actions.' },
      { q: 'Why put your If blocks inside a Forever loop?', options: ['So the robot keeps checking again and again', 'So it only checks once at the start', 'To slow the game down'], answer: 0, why: 'The situation keeps changing, so the robot must keep checking.' },
    ],
  },
  events: {
    name: 'Events', emoji: '⚡',
    learn: 'An event is something that happens — a key is pressed, the bird hits a pipe, a gap is passed. Event blocks start with “When…” and run their code every time that thing happens.',
    example: ['When space pressed', '   Flap', 'Forever', '   If falling then', '      Flap'],
    exampleNote: 'The bird flaps when you press space, and also checks for itself if it is falling.',
    word: 'event',
    check: [
      { q: '“When space pressed → Flap.” What makes the bird flap?', options: ['The event: pressing space', 'A timer', 'Nothing'], answer: 0, why: 'The code under an event runs when that event happens.' },
      { q: 'What is an event in a program?', options: ['Something that happens that the program reacts to', 'A kind of loop', 'A sound effect'], answer: 0, why: 'Programs can wait for events and react to them.' },
    ],
  },
  algorithm: {
    name: 'Algorithms', emoji: '🗺️',
    learn: 'An algorithm is a precise list of steps to solve a problem. A race lap is an algorithm: drive straight, curve left this much, curve right that much… Read the Route guide, then turn each part of the track into blocks. If the car leaves the track, find the step that went wrong and debug it.',
    example: ['When race starts', 'Set speed 60', 'Move forward 4', 'Curve left 30°, 3 steps', 'Curve right 25°, 3 steps'],
    exampleNote: 'Each bend of the track becomes one block — in the same order you meet them.',
    word: 'algorithm',
    check: [
      { q: 'A race lap is an algorithm. What does that mean?', options: ['A precise list of steps to complete the lap', 'A random route', 'A type of car'], answer: 0, why: 'An algorithm is an exact, ordered set of steps.' },
      { q: 'Your car leaves the track at the second bend. Where is the bug?', options: ['In the blocks for the second bend', 'In the very first block', 'There is no bug'], answer: 0, why: 'Find where it goes wrong, then fix that step — that is debugging.' },
      { q: 'Why switch off “Follow track automatically”?', options: ['So my code decides the route, not the autopilot', 'To drive slower', 'To change the car colour'], answer: 0, why: 'You are the programmer: your algorithm drives the car.' },
    ],
  },
  capstone: {
    name: 'Putting it together', emoji: '🏆',
    learn: 'Real programs mix everything: a sequence of steps, loops to repeat, sensors to look, and If to decide. Plan first, build a little, test it, and debug one step at a time with ⏭ Step.',
    example: ['Forever', '   Scan ahead', '   If obstacle ahead then', '      Turn right 90°', '   Move forward 1'],
    exampleNote: 'A loop, a sensor and a choice — the robot can now explore by itself.',
    word: 'debug',
    check: [
      { q: 'Your program doesn’t work. What is the best first step?', options: ['Run it step by step to find the block that goes wrong', 'Delete everything', 'Give up'], answer: 0, why: 'Stepping through the code shows you exactly where the bug is.' },
      { q: 'Which part of this program makes a decision? “Forever → If wall ahead → Turn”', options: ['If wall ahead', 'Forever', 'Turn'], answer: 0, why: 'If is selection — it decides.' },
      { q: 'Which part repeats? “Forever → If wall ahead → Turn”', options: ['Forever', 'If wall ahead', 'Turn'], answer: 0, why: 'Forever is a loop — it repeats.' },
    ],
  },
};

const SKILL_TO_CONCEPT = {
  Sequence: 'sequence', Turns: 'turns', Loops: 'loops', Sensors: 'sensors', Timing: 'timing',
  'If / else': 'selection', 'Moving puzzle': 'timing', 'Pattern puzzle': 'loops', Capstone: 'capstone',
};

/* ─── Goals ─── */

const gYourOwn = (starter) => ({
  id: 'own', gate: true,
  label: 'Make it your own: change at least 2 blocks of the example',
  hint: 'Add, remove or edit blocks — the example is only a start.',
  test: (bs) => changesFrom(bs, starter) >= 2,
});
const gActions = (n) => ({ id: `act${n}`, label: `Write at least ${n} instruction blocks`, test: (bs) => actions(bs).length >= n });
const gLoop = { id: 'loop', label: 'Use a loop (Repeat or Forever)', hint: 'Find Repeat or Forever in Loops or Logic.', test: (bs) => has(bs, LOOP) };
const gIf = (n = 1) => ({ id: `if${n}`, label: n > 1 ? `Use at least ${n} If checks` : 'Use an If block to make a choice', hint: 'If blocks are in Logic.', test: (bs) => count(bs, IF) >= n });
const gSensor = { id: 'sensor', label: 'Use a sensor block to look at the world', hint: 'Try Scan, Sonar or a Check block.', test: (bs) => has(bs, SENSOR) };
const gWait = { id: 'wait', label: 'Use a Wait block to get the timing right', test: (bs) => has(bs, WAIT) };
const gTurn = (n = 1) => ({ id: `turn${n}`, label: n > 1 ? `Use at least ${n} Turn or Curve blocks` : 'Use a Turn block', test: (bs) => count(bs, TURN) >= n });
const gVariety = { id: 'variety', label: 'Use at least 2 different kinds of block', test: (bs) => new Set(actions(bs).map((b) => b.id)).size >= 2 };
const gNoAutopilot = { id: 'noauto', gate: true, label: 'Switch off the autopilot — no “Follow track automatically”', hint: 'Remove that block and drive with your own code.', test: (bs) => !has(bs, /^follow_track_on$/) };
const gIfOrSensor = { id: 'decide', label: 'Use an If or a sensor so the robot can react', test: (bs) => has(bs, IF) || has(bs, SENSOR) };

function skillGoals(concept) {
  switch (concept) {
    case 'turns': return [gTurn(1), gActions(4)];
    case 'loops': return [gLoop, gActions(4)];
    case 'sensors': return [gSensor, gActions(4)];
    case 'timing': return [gWait, gActions(4)];
    case 'selection': return [gIf(1), gActions(4)];
    case 'capstone': return [gLoop, gIfOrSensor, gActions(6)];
    default: return [gActions(4), gVariety];
  }
}

/** The learning plan for whatever the pupil is playing. */
export function getCoachPlan({ kind, challenge, starter }) {
  const skill = challenge?.skillLearned || MODE_SKILLS[(challenge?.modeIndex || 1) - 1]?.skill || 'Sequence';
  const skillConcept = SKILL_TO_CONCEPT[skill] || 'sequence';
  let concept = skillConcept;
  let goals;
  if (kind === 'race') {
    concept = 'algorithm';
    const extra = skillConcept === 'loops' ? [gLoop] : skillConcept === 'selection' || skillConcept === 'sensors' ? [gIfOrSensor] : [];
    goals = [gNoAutopilot, gTurn(3), gActions(6), ...extra];
  } else if (kind === 'football' || kind === 'fight') {
    concept = 'selection';
    goals = [gLoop, gIf(2), gActions(5)];
  } else if (kind === 'flappy') {
    concept = 'events';
    goals = [{ id: 'event', label: 'Use an event block (When…) or a Forever loop', test: (bs) => has(bs, /^when_(?!start)/) || has(bs, /^forever$/) }, gIf(1), gActions(3)];
  } else if (kind === 'craft') {
    concept = 'loops';
    goals = [gLoop, gActions(4)];
  } else {
    goals = skillGoals(concept);
  }
  return { concept, info: CONCEPTS[concept], goals: [gYourOwn(starter), ...goals] };
}

/* ─── Progress ─── */

const LS = 'bb-studio-coach';
const readAll = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch { return {}; } };
const save = (key, patch) => {
  try {
    const all = readAll();
    all[key] = { ...(all[key] || {}), ...patch };
    localStorage.setItem(LS, JSON.stringify(all));
  } catch { /* ignore */ }
};

/* ─── UI ─── */

const FONT = '"Nunito", "Inter", system-ui, sans-serif';
const card = {
  background: 'rgba(17, 24, 39, 0.96)', color: '#f8fafc', borderRadius: 18,
  border: '1px solid rgba(167, 139, 250, 0.45)', boxShadow: '0 18px 50px rgba(0,0,0,0.45)', fontFamily: FONT,
};
const btn = (bg = '#7c3aed') => ({
  border: 'none', borderRadius: 12, padding: '10px 16px', fontWeight: 900, fontSize: 14,
  background: bg, color: '#fff', cursor: 'pointer', fontFamily: FONT,
});

function ExampleBlocks({ lines }) {
  return (
    <div style={{ display: 'grid', gap: 3, margin: '8px 0 6px' }}>
      {lines.map((l, i) => {
        const indent = (l.match(/^\s*/)[0].length / 3) | 0;
        const text = l.trim();
        const loop = /^(Repeat|Forever)/.test(text);
        const cond = /^If/.test(text);
        const ev = /^When/.test(text);
        const bg = loop ? '#f59e0b' : cond ? '#8b5cf6' : ev ? '#ef4444' : /^(Scan|Sonar|Check)/.test(text) ? '#10b981' : /^Wait/.test(text) ? '#64748b' : '#3b82f6';
        return (
          <div key={i} style={{ marginLeft: indent * 22, justifySelf: 'start', padding: '4px 10px', borderRadius: 8, background: bg, color: '#fff', fontWeight: 800, fontSize: 12.5 }}>
            {text}
          </div>
        );
      })}
    </div>
  );
}

function GoalList({ goals, met, highlight }) {
  return (
    <div style={{ display: 'grid', gap: 2 }}>
      {goals.map((g) => {
        const ok = met[g.id];
        return (
          <div key={g.id} style={{
            display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 12, lineHeight: 1.3,
            padding: '3px 6px', borderRadius: 8,
            background: !ok && highlight === g.id ? 'rgba(250, 204, 21, 0.18)' : 'transparent',
            outline: !ok && highlight === g.id ? '2px solid #facc15' : 'none',
          }}>
            <span aria-hidden="true" style={{ fontSize: 12 }}><IconText>{ok ? '✅' : '⬜'}</IconText></span>
            <span>
              <span style={{ fontWeight: 800, color: ok ? '#86efac' : '#f8fafc' }}>{g.label}</span>
              <span style={{ position: 'absolute', left: -9999 }}>{ok ? ' — done' : ' — not yet'}</span>
              {!ok && g.hint && highlight === g.id && <span style={{ display: 'block', color: '#fde68a', fontSize: 11 }}>{g.hint}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LearnCard({ plan, robotName, courseName, onStart }) {
  const c = plan.info;
  const wrapRef = useRef(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => { if (wrapRef.current) wrapRef.current.scrollTop = 0; });
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div ref={wrapRef} role="dialog" aria-label={`How it works: ${c.name}`} style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', overflowY: 'auto', background: 'rgba(2, 6, 23, 0.55)', padding: 16 }}>
      <div style={{ ...card, width: 'min(560px, 100%)', margin: 'auto', padding: '16px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, color: '#c4b5fd' }}><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />CODER TIP · {courseName?.toUpperCase?.() || robotName?.toUpperCase?.() || 'ROBOT STUDIO'}</div>
        <h2 style={{ margin: '4px 0 6px', fontSize: 20, fontWeight: 900 }}>{c.emoji} {c.name}</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{c.learn}</p>
        <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: '#a5b4fc' }}>TRY SOMETHING LIKE THIS</div>
          <ExampleBlocks lines={c.example} />
          <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.45 }}>{c.exampleNote}</div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12.5, color: '#cbd5e1' }}>
          Stuck? Press <b><EmojiIcon e="⏭" /></b> to run one block at a time and find the bug.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          <button type="button" style={btn()} onClick={onStart}>Got it →</button>
        </div>
      </div>
    </div>
  );
}

function CheckCard({ plan, onDone, onClose }) {
  const qs = plan.info.check;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [explain, setExplain] = useState('');
  const done = i >= qs.length;
  const q = qs[i];
  const score = answers.filter((a) => a.ok).length;
  return (
    <div role="dialog" aria-label="Coder badge challenge" style={{ position: 'absolute', inset: 0, zIndex: 61, display: 'flex', overflowY: 'auto', background: 'rgba(2, 6, 23, 0.55)', padding: 16 }}>
      <div style={{ ...card, width: 'min(540px, 100%)', margin: 'auto', padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, fontSize: 12, fontWeight: 900, letterSpacing: 1.2, color: '#c4b5fd' }}>
            <EmojiIcon e="🏅" style={{ marginRight: '0.35em' }} />CODER BADGE CHALLENGE{!done && ` · ${i + 1} OF ${qs.length}`}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ ...btn('transparent'), padding: 4, color: '#94a3b8' }}>✕</button>
        </div>
        {!done ? (
          <>
            <h3 style={{ margin: '10px 0 12px', fontSize: 18, lineHeight: 1.4 }}>{q.q}</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {q.options.map((o, oi) => {
                const show = picked != null;
                const right = oi === q.answer;
                return (
                  <button key={oi} type="button" disabled={show}
                    onClick={() => { setPicked(oi); setAnswers((a) => [...a, { q: q.q, chosen: o, correct: q.options[q.answer], ok: right }]); }}
                    style={{
                      textAlign: 'left', padding: '11px 14px', borderRadius: 12, fontSize: 14.5, fontWeight: 700, fontFamily: FONT, cursor: show ? 'default' : 'pointer',
                      color: '#f8fafc', border: `2px solid ${show && right ? '#22c55e' : show && oi === picked ? '#f59e0b' : 'rgba(255,255,255,0.15)'}`,
                      background: show && right ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.05)',
                    }}>
                    <IconText>{show && right ? '✅ ' : show && oi === picked ? '🤔 ' : ''}</IconText>{o}
                  </button>
                );
              })}
            </div>
            {picked != null && (
              <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.5, color: picked === q.answer ? '#86efac' : '#fde68a' }}>
                {picked === q.answer ? 'Yes! ' : 'Not quite — '}{q.why}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <button type="button" style={btn()} disabled={picked == null} onClick={() => { setI(i + 1); setPicked(null); }}>
                {i + 1 < qs.length ? 'Next question →' : 'Nearly done →'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ margin: '12px 0 10px', fontSize: 18, fontWeight: 900 }}>You got {score} out of {qs.length} 🎉</div>
            <label htmlFor="coach-explain" style={{ display: 'block', fontSize: 14, fontWeight: 800, marginBottom: 6 }}>
              Explain how your code works. Try to use the word “{plan.info.word}”.
            </label>
            <textarea id="coach-explain" value={explain} onChange={(e) => setExplain(e.target.value)} rows={4}
              placeholder={`My code… I used a ${plan.info.word} because…`}
              style={{ width: '100%', boxSizing: 'border-box', borderRadius: 12, padding: 10, fontSize: 14, fontFamily: FONT, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc' }} />
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Your teacher can read this.</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <button type="button" style={btn('#16a34a')} disabled={explain.trim().length < 10}
                onClick={() => onDone({ answers, score, total: qs.length, explanation: explain.trim() })}>
                <EmojiIcon e="🏅" style={{ marginRight: '0.35em' }} />Earn my Coder badge
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Hook used by the Live Lab. Returns the overlay UI, a gate for Simulate,
 * a run recorder and whether free (keyboard) play is unlocked.
 */
export function useStudioCoach({ kind, challenge, chassisId, robotName, starter, scriptRef, victory }) {
  const courseId = challenge?.id || challenge?.arenaType || 'lab';
  const key = `${chassisId || 'robot'}:${courseId}`;
  const workKey = `studio:${key}`;
  const starterSig = (starter || []).map(sig).join(',');
  const plan = useMemo(() => getCoachPlan({ kind, challenge, starter }), [kind, courseId, challenge?.modeIndex, challenge?.skillLearned, starterSig]); // eslint-disable-line react-hooks/exhaustive-deps
  const [saved, setSaved] = useState(() => readAll()[key] || {});
  const [showLearn, setShowLearn] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(null);
  const [nudge, setNudge] = useState('');
  const [met, setMet] = useState({});
  const [runs, setRuns] = useState(() => readWork(workKey)?.runs || 0);
  const sigRef = useRef('');

  useEffect(() => {
    const s = readAll()[key] || {};
    setSaved(s);
    setShowLearn(false);
    setShowCheck(false);
    setNudge('');
    setHighlight(null);
    setOpen(false);
    setRuns(readWork(workKey)?.runs || 0);
    sigRef.current = '';
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const evaluate = useCallback(() => {
    const bs = (scriptRef?.current || []).filter((b) => b?.id && b.id !== 'when_start');
    const next = {};
    plan.goals.forEach((g) => { next[g.id] = !!g.test(bs); });
    return { bs, next };
  }, [plan, scriptRef]);

  useEffect(() => {
    const tick = () => {
      const { bs, next } = evaluate();
      const s = bs.map(sig).join(',') + JSON.stringify(next);
      if (s === sigRef.current) return;
      sigRef.current = s;
      setMet(next);
    };
    tick();
    const t = setInterval(tick, 600);
    return () => clearInterval(t);
  }, [evaluate]);

  const allMet = plan.goals.every((g) => met[g.id]);
  const badge = !!saved.badge;

  const writeWork = useCallback((patch) => {
    const { bs, next } = evaluate();
    recordWork(workKey, {
      type: 'studio',
      title: `${robotName || 'Robot'} — ${challenge?.name || challenge?.shortName || 'Robot Studio'}`,
      concept: plan.info.name,
      goals: plan.goals.map((g) => ({ label: g.label, ok: !!next[g.id] })),
      blocks: describeBlocks(bs, (b) => b.label).slice(0, 80),
      ...patch,
    });
  }, [evaluate, workKey, robotName, challenge?.name, challenge?.shortName, plan]);

  const pendingGateRef = useRef(null);

  /** Called by Simulate. Never blocks the run; UI updates are flushed after the robot starts. */
  const gate = useCallback(() => {
    const { next } = evaluate();
    const blocker = plan.goals.find((g) => g.gate && !next[g.id]);
    pendingGateRef.current = {
      nudge: blocker ? 'Try a challenge to make the code your own!' : '',
      highlight: (blocker || plan.goals.find((g) => !next[g.id]))?.id || null,
      runs: runs + 1,
    };
    return true;
  }, [evaluate, plan, runs]);

  const flushGate = useCallback(() => {
    const p = pendingGateRef.current;
    if (!p) return;
    pendingGateRef.current = null;
    setNudge(p.nudge);
    setOpen(false);
    setHighlight(p.highlight);
    setRuns(p.runs);
    writeWork({ runs: p.runs });
  }, [writeWork]);

  useEffect(() => {
    if (!victory) return;
    writeWork({ won: true });
    if (allMet && !badge) setShowCheck(true);
  }, [victory]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishCheck = useCallback(({ answers, score, total, explanation }) => {
    const patch = { badge: true, checkScore: score, checkTotal: total };
    save(key, patch);
    setSaved((s) => ({ ...s, ...patch }));
    writeWork({ check: answers, checkScore: score, checkTotal: total, explanation });
    setShowCheck(false);
  }, [key, writeWork]);

  const startCoding = () => {
    save(key, { learned: true });
    setSaved((s) => ({ ...s, learned: true }));
    setShowLearn(false);
  };

  const metCount = plan.goals.filter((g) => met[g.id]).length;
  const nextGoal = plan.goals.find((g) => !met[g.id]) || null;
  const keyboardGame = kind === 'race' || kind === 'football';

  const ui = (
    <>
      {showLearn && <LearnCard plan={plan} robotName={robotName} courseName={challenge?.name} onStart={startCoding} />}
      {showCheck && <CheckCard plan={plan} onDone={finishCheck} onClose={() => setShowCheck(false)} />}
      <div style={{ position: 'absolute', left: 12, top: kind === 'race' ? 132 : 12, zIndex: 40, width: open ? 250 : 'auto', maxWidth: 'min(280px, calc(100% - 24px))' }}>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Code challenges, ${metCount} of ${plan.goals.length} done. Show challenges`}
            title={nextGoal ? `Next: ${nextGoal.label}` : 'Show code challenges'}
            style={{ ...card, ...btn('rgba(17,24,39,0.9)'), border: `1px solid ${nudge ? '#facc15' : 'rgba(167,139,250,0.5)'}`, padding: '5px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, maxWidth: '100%' }}
          >
            <span aria-hidden="true"><IconText>{badge ? '🏅' : allMet ? '✅' : '🎯'}</IconText></span>
            <span style={{ fontWeight: 900 }}>{metCount}/{plan.goals.length}</span>
            {(badge || allMet || nextGoal) && (
              <span style={{ fontWeight: 600, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {badge ? 'Coder badge earned' : allMet ? (runs > 0 ? 'Win your badge!' : 'Press ▶ Simulate') : nextGoal.label.split(':')[0]}
              </span>
            )}
            <span aria-hidden="true" style={{ color: '#94a3b8' }}>▸</span>
          </button>
        ) : (
          <div style={{ ...card, padding: '8px 10px', maxHeight: 'min(360px, 60vh)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ flex: 1, fontSize: 12.5, fontWeight: 900 }}>
                {plan.info.emoji} {plan.info.name} <span style={{ color: '#c4b5fd' }}>· {metCount}/{plan.goals.length}</span>
              </div>
              <button type="button" onClick={() => setShowLearn(true)} title={`Coder word: ${plan.info.word}. How this kind of code works, with an example`} style={{ ...btn('rgba(255,255,255,0.1)'), padding: '3px 7px', fontSize: 11 }}><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />Tip</button>
              <button type="button" onClick={() => { setOpen(false); setNudge(''); }} aria-label="Hide code challenges" style={{ ...btn('transparent'), padding: '2px 4px', color: '#94a3b8' }}>✕</button>
            </div>
            {nudge && <div role="status" style={{ fontSize: 12, fontWeight: 800, color: '#fde68a', marginBottom: 4 }}><EmojiIcon e="✋" style={{ marginRight: '0.35em' }} />{nudge}</div>}
            <GoalList goals={plan.goals} met={met} highlight={highlight} />
            {badge && (
              <div style={{ marginTop: 6, fontSize: 11.5, color: '#cbd5e1' }}>
                <EmojiIcon e="🏅" style={{ marginRight: '0.35em' }} />Coder badge earned{saved.checkTotal ? ` (${saved.checkScore}/${saved.checkTotal})` : ''}.{keyboardGame ? ' Keyboard driving unlocked!' : ''}
              </div>
            )}
            {allMet && runs > 0 && !badge && (
              <button type="button" style={{ ...btn('#16a34a'), width: '100%', marginTop: 6, padding: '6px 10px', fontSize: 12.5 }} onClick={() => setShowCheck(true)}><EmojiIcon e="🏅" style={{ marginRight: '0.35em' }} />Win my Coder badge</button>
            )}
          </div>
        )}
      </div>
    </>
  );

  return { ui, gate, flushGate, freePlay: badge, plan };
}
