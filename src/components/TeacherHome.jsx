import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import {
  localClasses, localAssignments, fetchClass, fetchAssignments, fetchTeacherClasses,
  findSub, safeKey, statusFor, dueLabel,
} from '../utils/classroomStore.js';
import { KIND_META } from './classroom/assignables.js';
import { classGradient, GoogleClassroomLogo, timeAgo } from './classroom/ui.jsx';
import './TeacherHome.css';
import { EmojiIcon } from './ui/Icon.jsx';

const WEEK_MS = 7 * 86400000;

function rosterOf(cls) {
  const list = (cls.students || []).map((s) => ({ ...s, key: safeKey(s.email || s.id || s.name) }));
  const keys = new Set(list.map((s) => s.key));
  Object.entries(cls.progress || {}).forEach(([k, p]) => { if (!keys.has(k)) list.push({ name: p.name, email: p.email, key: k }); });
  return list.map((s) => ({ ...s, progress: cls.progress?.[s.key] || null }));
}

/** Per-class numbers the home page needs: who is active, what to mark, who needs help. */
function summarise(cls, assignments) {
  const roster = rosterOf(cls);
  const subs = cls.submissions || {};
  let toMark = 0;
  let missing = 0;
  const work = assignments.map((a) => {
    const counts = { done: 0, handed: 0, marked: 0, late: 0, todo: 0 };
    roster.forEach((p) => { counts[statusFor(a, findSub(subs, a.id, p.key), p.progress)]++; });
    toMark += counts.handed;
    missing += counts.late;
    return { a, counts, finished: counts.done + counts.handed + counts.marked };
  });
  const active = roster.filter((p) => p.progress?.updatedAt && Date.now() - new Date(p.progress.updatedAt) < WEEK_MS).length;
  const help = Object.values(cls.help || {}).filter((h) => !h.resolved);
  return { roster, work, toMark, missing, active, help, helpCount: help.length };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TeacherHome({ onNavigate }) {
  const { user } = useUser();
  const [classes, setClasses] = useState(() => localClasses().filter((c) => !c.archived));
  const [assignments, setAssignments] = useState(() => localAssignments());
  const [loading, setLoading] = useState(true);

  // Freshen every class with its live doc (roster, progress, hand-ins, help) and its work.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remote = user.email ? await fetchTeacherClasses(user.email).catch(() => []) : [];
        const map = new Map(localClasses().map((c) => [c.id, c]));
        remote.forEach((r) => map.set(r.id, { ...map.get(r.id), ...r }));
        const base = [...map.values()].filter((c) => !c.archived);
        const live = await Promise.all(base.map(async (c) => {
          const [doc, asg] = await Promise.all([fetchClass(c.id).catch(() => null), fetchAssignments(c.id).catch(() => [])]);
          return { cls: doc ? { ...c, ...doc } : c, asg: asg || [] };
        }));
        if (cancelled) return;
        const merged = new Map(localAssignments().map((a) => [a.id, a]));
        live.forEach(({ asg }) => asg.forEach((a) => merged.set(a.id, { ...merged.get(a.id), ...a })));
        setClasses(live.map((l) => l.cls));
        setAssignments([...merged.values()]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user.email]);

  const summaries = useMemo(() => classes.map((cls) => ({
    cls, ...summarise(cls, assignments.filter((a) => a.classId === cls.id)),
  })), [classes, assignments]);

  const totals = summaries.reduce((t, s) => ({
    pupils: t.pupils + s.roster.length,
    active: t.active + s.active,
    toMark: t.toMark + s.toMark,
    missing: t.missing + s.missing,
    help: t.help + s.help.length,
  }), { pupils: 0, active: 0, toMark: 0, missing: 0, help: 0 });

  const upcoming = summaries
    .flatMap((s) => s.work.map((w) => ({ ...w, cls: s.cls, n: s.roster.length })))
    .filter(({ a }) => a.dueDate && new Date(`${a.dueDate}T23:59:59`) >= new Date())
    .sort((x, y) => x.a.dueDate.localeCompare(y.a.dueDate))
    .slice(0, 5);

  const helpList = summaries.flatMap((s) => s.help.map((h) => ({ ...h, cls: s.cls })))
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
    .slice(0, 4);

  const openClass = (cls, sub = '') => {
    try { localStorage.setItem('bb-cr-selected', cls.id); } catch { /* ignore */ }
    onNavigate(sub ? `classroom/${sub}` : 'classroom');
  };

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const allClear = classes.length > 0 && !totals.toMark && !totals.help && !totals.missing;

  const attention = [
    { key: 'mark', icon: '🖍️', value: totals.toMark, label: 'to mark', hint: 'Hand-ins waiting for feedback', tone: 'indigo', count: 'toMark', tab: 'marking' },
    { key: 'help', icon: '🙋', value: totals.help, label: totals.help === 1 ? 'help request' : 'help requests', hint: 'Pupils asking for a hand', tone: 'amber', count: 'helpCount', tab: 'stream' },
    { key: 'missing', icon: '⏰', value: totals.missing, label: 'missing', hint: 'Past the due date, not done', tone: 'red', count: 'missing', tab: 'pupils' },
  ];

  const tools = [
    { icon: '📚', title: 'Teach a lesson', desc: '152 KS2 computing lessons, ready to project', page: 'learn' },
    { icon: '🎮', title: 'Game Builder', desc: 'Block coding for live demos', page: 'gamebuilder' },
    { icon: '🚀', title: 'Missions', desc: 'Story-led coding campaigns', page: 'missions' },
    { icon: '🤖', title: 'Robot Studio', desc: 'Design and test virtual robots', page: 'studio' },
    { icon: '🌍', title: 'Community', desc: 'See what pupils are sharing', page: 'community' },
    { icon: '⚙️', title: 'Settings', desc: 'Profile, theme and accessibility', page: 'settings' },
  ];

  return (
    <div className="th">
      {/* ─── Header ─── */}
      <header className="th-head">
        <div>
          <div className="th-date">{today}</div>
          <h1>{greeting()}, {user.name || 'Teacher'}</h1>
          <p>
            {classes.length === 0
              ? 'Create your first class to start setting work.'
              : allClear
                ? 'You’re all caught up — nothing needs you right now.'
                : 'Here’s what needs you today.'}
          </p>
        </div>
        <div className="th-head-actions">
          <button className="th-btn" onClick={() => onNavigate('learn')}><EmojiIcon e="📚" style={{ marginRight: '0.35em' }} />Teach a lesson</button>
          <button className="th-btn" onClick={() => onNavigate('classroom/add')}><EmojiIcon e="➕" style={{ marginRight: '0.35em' }} />Add pupils</button>
          <button className="th-btn th-btn--primary" onClick={() => onNavigate('classroom')}>
            {classes.length ? '＋ Set work' : '＋ Create a class'}
          </button>
        </div>
      </header>

      {/* ─── Needs attention ─── */}
      {classes.length > 0 && (
        <section className="th-attention" aria-label="Needs your attention">
          {attention.map((t) => (
            <button
              key={t.key}
              className={`th-attn th-attn--${t.tone}${t.value ? ' is-hot' : ''}`}
              onClick={() => openClass((summaries.find((s) => s[t.count]) || summaries[0]).cls, t.tab)}
            >
              <span className="th-attn-icon"><EmojiIcon e={t.icon} /></span>
              <span className="th-attn-copy">
                <b>{loading && !t.value ? '–' : t.value}</b> <span>{t.label}</span>
                <small>{t.value ? t.hint : 'All clear ✓'}</small>
              </span>
              <span className="th-attn-arrow">→</span>
            </button>
          ))}
          <div className="th-attn th-attn--stat">
            <span className="th-attn-icon"><EmojiIcon e="👥" /></span>
            <span className="th-attn-copy">
              <b>{totals.active}</b> <span>of {totals.pupils} active</span>
              <small>Pupils who worked this week</small>
            </span>
          </div>
        </section>
      )}

      {/* ─── Classes ─── */}
      <section>
        <div className="th-section-head">
          <h2>Your classes</h2>
          {classes.length > 0 && <button className="th-link" onClick={() => onNavigate('classroom')}>Manage classes →</button>}
        </div>
        {classes.length === 0 ? (
          <div className="th-empty-grid">
            <button className="th-empty-card" onClick={() => onNavigate('classroom')}>
              <span className="th-empty-icon"><EmojiIcon e="🏫" /></span>
              <b>Create a class</b>
              <small>Get a 6-letter code your pupils type in to join.</small>
            </button>
            <button className="th-empty-card" onClick={() => onNavigate('classroom/add')}>
              <span className="th-empty-icon"><EmojiIcon e="➕" /></span>
              <b>Add pupils</b>
              <small>Create a class, then enter pupil school emails to assign their places.</small>
            </button>
            <button className="th-empty-card" onClick={() => onNavigate('classroom/google')}>
              <span className="th-empty-icon"><GoogleClassroomLogo size={34} /></span>
              <b>Import from Google Classroom</b>
              <small>Bring classes and pupils across in one click.</small>
            </button>
          </div>
        ) : (
          <div className="th-classes">
            {summaries.map(({ cls, roster, work, toMark, active, help }) => (
              <button key={cls.id} className="th-class" onClick={() => openClass(cls)}>
                <div className="th-class-band" style={{ background: classGradient(cls.color || '#6366f1') }}>
                  <div>
                    <small>{[cls.grade, cls.subject].filter(Boolean).join(' · ') || 'Computing'}</small>
                    <strong>{cls.name}</strong>
                  </div>
                  <span className="th-class-code">{cls.inviteCode}</span>
                </div>
                <div className="th-class-body">
                  <div className="th-class-stats">
                    <span><b>{roster.length}</b> pupils</span>
                    <span><b>{active}</b> active</span>
                    <span><b>{work.length}</b> set</span>
                  </div>
                  <div className="th-class-flags">
                    {toMark > 0 && <span className="th-flag th-flag--indigo"><EmojiIcon e="🖍️" style={{ marginRight: '0.35em' }} />{toMark} to mark</span>}
                    {help.length > 0 && <span className="th-flag th-flag--amber"><EmojiIcon e="🙋" style={{ marginRight: '0.35em' }} />{help.length} need help</span>}
                    {cls.gcCourseId && <span className="th-flag"><GoogleClassroomLogo size={13} /> Linked</span>}
                    {!toMark && !help.length && !cls.gcCourseId && <span className="th-flag th-flag--ok">✓ All caught up</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {classes.length > 0 && (
        <section className="th-two">
          {/* ─── Deadlines ─── */}
          <div className="th-card">
            <div className="th-section-head th-section-head--card">
              <h2>Coming up</h2>
              <button className="th-link" onClick={() => onNavigate('classroom')}>All work →</button>
            </div>
            {upcoming.length === 0 ? (
              <div className="th-empty">
                <div><EmojiIcon e="📋" /></div>
                <p>No upcoming deadlines.</p>
                <button className="th-btn th-btn--sm" onClick={() => onNavigate('classroom')}>＋ Set some work</button>
              </div>
            ) : upcoming.map(({ a, cls, finished, n }) => {
              const meta = KIND_META[a.kind] || KIND_META.task;
              const pct = n ? Math.round((finished / n) * 100) : 0;
              return (
                <button key={a.id} className="th-row" onClick={() => openClass(cls)}>
                  <span className="th-row-icon" style={{ background: `${meta.color}1f` }}>{a.emoji || meta.emoji}</span>
                  <span className="th-row-copy">
                    <b>{a.title}</b>
                    <small><span className="th-dot" style={{ background: cls.color || '#6366f1' }} />{cls.name} · {dueLabel(a.dueDate)}</small>
                    <span className="th-meter"><i style={{ width: `${pct}%` }} /></span>
                  </span>
                  <span className="th-row-end">{finished}/{n}<small>done</small></span>
                </button>
              );
            })}
          </div>

          {/* ─── Help requests ─── */}
          <div className="th-card">
            <div className="th-section-head th-section-head--card">
              <h2>Help requests</h2>
              {helpList.length > 0 && <span className="th-count">{totals.help}</span>}
            </div>
            {helpList.length === 0 ? (
              <div className="th-empty">
                <div><EmojiIcon e="🙌" /></div>
                <p>No one needs help right now.</p>
              </div>
            ) : helpList.map((h) => (
              <button key={`${h.cls.id}-${h.id}`} className="th-row" onClick={() => openClass(h.cls, 'stream')}>
                <span className="th-row-icon th-row-icon--round">{(h.name || '?').slice(0, 1).toUpperCase()}</span>
                <span className="th-row-copy">
                  <b>{h.name}</b>
                  <small>{h.cls.name} · {timeAgo(h.createdAt)}</small>
                  <span className="th-quote">{h.message}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ─── Google Classroom ─── */}
      {!classes.some((c) => c.gcCourseId) && (
        <button className="th-google" onClick={() => onNavigate('classroom/google')}>
          <GoogleClassroomLogo size={40} />
          <span className="th-google-copy">
            <b>Connect Google Classroom</b>
            <small>Import classes and pupils, post work and send grades back. Pupils sign in with Google.</small>
          </span>
          <span className="th-btn th-btn--sm">Connect →</span>
        </button>
      )}

      {/* ─── Teaching tools ─── */}
      <section>
        <div className="th-section-head"><h2>Teaching tools</h2></div>
        <div className="th-tools">
          {tools.map((t) => (
            <button key={t.title} className="th-tool" onClick={() => onNavigate(t.page)}>
              <span className="th-tool-icon"><EmojiIcon e={t.icon} /></span>
              <span><b>{t.title}</b><small>{t.desc}</small></span>
            </button>
          ))}
          {user.role === 'admin' && (
            <button className="th-tool" onClick={() => onNavigate('admin')}>
              <span className="th-tool-icon"><EmojiIcon e="🛡️" /></span>
              <span><b>Admin panel</b><small>All users and classes</small></span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
