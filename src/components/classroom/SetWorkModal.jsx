import React, { useEffect, useMemo, useState } from 'react';
import { Modal, GoogleClassroomLogo } from './ui.jsx';
import { ACTIVITIES, KIND_META, loadLibrary } from './assignables.js';
import { getGcSession } from '../../utils/googleClassroom.js';
import { EmojiIcon } from '../ui/Icon.jsx';

const TABS = [
  { id: 'lesson', label: '📚 Lessons' },
  { id: 'mission', label: '🚀 Missions' },
  { id: 'activity', label: '🧩 Activities' },
  { id: 'task', label: '✏️ Written task' },
];

function nextFriday() {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

export default function SetWorkModal({ cls, onClose, onCreate }) {
  const [tab, setTab] = useState('lesson');
  const [lib, setLib] = useState(null);
  const [yr, setYr] = useState(() => (/^y[3-6]$/.test(cls.year || '') ? cls.year : 'y3'));
  const [camp, setCamp] = useState('space');
  const [picked, setPicked] = useState(null);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState(nextFriday);
  const [points, setPoints] = useState(10);
  const [postToGc, setPostToGc] = useState(Boolean(cls.gcCourseId && getGcSession()));
  const [busy, setBusy] = useState(false);
  const gcReady = Boolean(cls.gcCourseId && getGcSession());

  useEffect(() => { loadLibrary().then(setLib); }, []);

  const choose = (item) => {
    setPicked(item);
    setTitle(item.title);
    setInstructions(item.blurb || '');
  };

  const year = lib?.years.find((y) => y.yr === yr);
  const campaign = lib?.campaigns.find((c) => c.id === camp);
  const ready = tab === 'task' ? title.trim() : picked && title.trim();

  const lessonGroups = useMemo(() => {
    if (!year) return [];
    const terms = year.terms.length ? year.terms : [{ name: 'All lessons', range: [0, year.lessons.length - 1] }];
    return terms.map((t) => ({ ...t, lessons: year.lessons.slice(t.range[0], t.range[1] + 1) }));
  }, [year]);

  const submit = async () => {
    if (!ready || busy) return;
    setBusy(true);
    const base = tab === 'task'
      ? { kind: 'task', target: {}, hash: 'classroom', emoji: '✏️' }
      : { kind: picked.kind, target: picked.target, hash: picked.hash, emoji: picked.emoji };
    await onCreate({
      ...base,
      title: title.trim(),
      description: instructions.trim(),
      dueDate,
      points: Number(points) || 10,
      handIn: tab === 'task' ? 'work' : tab === 'activity' ? picked.handIn : 'auto',
    }, { postToGc: gcReady && postToGc });
    setBusy(false);
  };

  return (
    <Modal
      wide
      icon="📋"
      title={`Set work for ${cls.name}`}
      onClose={onClose}
      footer={(
        <>
          {gcReady ? (
            <label className="cr-row" style={{ marginRight: 'auto', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
              <input type="checkbox" checked={postToGc} onChange={(e) => setPostToGc(e.target.checked)} />
              <GoogleClassroomLogo size={18} /> Also post to Google Classroom ({cls.gcCourseName})
            </label>
          ) : (
            <span className="cr-muted" style={{ marginRight: 'auto', fontSize: 12.5, alignSelf: 'center' }}>
              You can share it to Google Classroom after it is set.
            </span>
          )}
          <button className="cr-btn" onClick={onClose}>Cancel</button>
          <button className="cr-btn cr-btn--primary" disabled={!ready || busy} onClick={submit}>{busy ? 'Setting…' : 'Set work'}</button>
        </>
      )}
    >
      <div className="cr-tabs" role="tablist" style={{ marginTop: -6 }}>
        {TABS.map((t) => (
          <button key={t.id} role="tab" className="cr-tab" aria-selected={tab === t.id} onClick={() => { setTab(t.id); setPicked(null); if (t.id !== 'task') { setTitle(''); setInstructions(''); } }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab !== 'task' && !lib && <div className="cr-empty">Loading the library…</div>}

      {tab === 'lesson' && lib && (
        <>
          <div className="cr-pills" style={{ marginBottom: 12 }}>
            {lib.years.map((y) => (
              <button key={y.yr} className="cr-pill" aria-pressed={yr === y.yr} onClick={() => setYr(y.yr)}><EmojiIcon e={y.icon} style={{ marginRight: '0.35em' }} />{y.label}</button>
            ))}
          </div>
          <div style={{ maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
            {lessonGroups.map((g) => (
              <div key={g.name} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: g.color || 'var(--text-muted)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {g.name}{g.focus ? ` · ${g.focus}` : ''}
                </div>
                <div className="cr-lib">
                  {g.lessons.map((l) => (
                    <button key={l.key} className="cr-lib-item" aria-pressed={picked?.key === l.key} onClick={() => choose(l)}>
                      <span style={{ fontSize: 22 }}>{l.emoji}</span>
                      <span><b>Week {l.week}: {l.title}</b><small>{l.minutes} min · ticks off when finished</small></span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'mission' && lib && (
        <>
          <div className="cr-pills" style={{ marginBottom: 12 }}>
            {lib.campaigns.map((c) => (
              <button key={c.id} className="cr-pill" aria-pressed={camp === c.id} onClick={() => setCamp(c.id)}>{c.emoji} {c.title}</button>
            ))}
          </div>
          {campaign && (
            <div className="cr-lib">
              {campaign.missions.map((m, i) => (
                <button key={m.key} className="cr-lib-item" aria-pressed={picked?.key === m.key} onClick={() => choose(m)}>
                  <span style={{ fontSize: 22 }}>{m.emoji}</span>
                  <span><b>{i + 1}. {m.shortTitle}</b><small>{campaign.concept}</small></span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'activity' && (
        <div className="cr-lib">
          {ACTIVITIES.map((a) => {
            const item = { kind: 'activity', key: `activity:${a.id}`, title: a.title, emoji: a.emoji, blurb: a.blurb, target: { activity: a.id }, hash: a.hash, handIn: a.handIn };
            return (
              <button key={a.id} className="cr-lib-item" aria-pressed={picked?.key === item.key} onClick={() => choose(item)}>
                <span style={{ fontSize: 26 }}>{a.emoji}</span>
                <span><b>{a.title}</b><small>{a.blurb}</small></span>
              </button>
            );
          })}
        </div>
      )}

      {(tab === 'task' || picked) && (
        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          {picked && (
            <div className="cr-note cr-note--info">
              {KIND_META[picked.kind].emoji} <b>{KIND_META[picked.kind].label}</b> —{' '}
              {KIND_META[picked.kind].auto ? 'pupils open it with one tap and it ticks off by itself when they finish.' : 'pupils open it with one tap, then hand in their work for you to mark.'}
            </div>
          )}
          <div>
            <label className="cr-label" htmlFor="sw-title">Title</label>
            <input id="sw-title" className="cr-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Design your own robot dance" />
          </div>
          <div>
            <label className="cr-label" htmlFor="sw-ins">Instructions for pupils</label>
            <textarea id="sw-ins" className="cr-input" value={instructions} onChange={(e) => setInstructions(e.target.value)}
              placeholder={tab === 'task' ? 'What should pupils write, build or explain?' : 'Optional — add anything extra you want them to do.'} />
          </div>
          <div className="cr-row" style={{ gap: 12 }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="cr-label" htmlFor="sw-due">Due</label>
              <input id="sw-due" type="date" className="cr-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div style={{ width: 140 }}>
              <label className="cr-label" htmlFor="sw-pts">Points</label>
              <input id="sw-pts" type="number" min="1" max="100" className="cr-input" value={points} onChange={(e) => setPoints(e.target.value)} />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
