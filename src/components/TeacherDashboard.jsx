import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import {
  localClasses, saveLocalClasses, localAssignments, saveLocalAssignments, makeInviteCode,
  saveClass, fetchClass, fetchTeacherClasses, fetchAssignments, saveAssignment, deleteAssignment as removeAssignment,
  updateRoster, postAnnouncement, replaceAnnouncements, resolveHelp, markSubmission, handIn,
  findSub, safeKey, statusFor, STATUS, dueLabel,
} from '../utils/classroomStore.js';
import {
  getGcSession, createCourseWork, createAnnouncement, syncGrades, openShareToClassroom, appLink,
} from '../utils/googleClassroom.js';
import { Modal, Avatar, Chip, GoogleClassroomLogo, useToast, copyText, timeAgo, classGradient, CLASS_COLORS, STICKERS } from './classroom/ui.jsx';
import { KIND_META, classroomHash } from './classroom/assignables.js';
import SetWorkModal from './classroom/SetWorkModal.jsx';
import GooglePanel, { GcErrorNote } from './classroom/GooglePanel.jsx';
import HandInView from './classroom/HandInView.jsx';

const YEARS = [
  { id: 'y3', label: 'Year 3' }, { id: 'y4', label: 'Year 4' }, { id: 'y5', label: 'Year 5' }, { id: 'y6', label: 'Year 6' }, { id: 'other', label: 'Other' },
];

/** Older assignments (before lessons/missions could be set) still show sensibly. */
function normAssignment(a) {
  if (a.kind) return a;
  if (a.assignType === 'blocks') return { ...a, kind: 'activity', target: { activity: 'gamebuilder' }, hash: 'gamebuilder', emoji: '🎮', handIn: 'project' };
  return { ...a, kind: 'task', target: {}, hash: 'classroom', emoji: '✏️', handIn: 'work' };
}

const TAB_IDS = ['classwork', 'stream', 'pupils', 'marking', 'google'];

function pupilKey(s) { return safeKey(s.email || s.id || s.name); }

function workSummary(w) {
  if (!w) return '';
  const bits = [];
  if (w.total != null) bits.push(`quiz ${w.score ?? 0}/${w.total}`);
  if (w.type === 'mission') bits.push(w.passed ? 'mission passed' : 'not passed yet');
  if (w.blocks?.length) bits.push(`${w.blocks.length} blocks`);
  if (w.checkTotal) bits.push(`check ${w.checkScore}/${w.checkTotal}`);
  if (w.attempts) bits.push(`${w.attempts} attempt${w.attempts === 1 ? '' : 's'}`);
  return bits.length ? ` · ${bits.join(', ')}` : '';
}

/* ─── Small modals ─── */

function CreateClassModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('y3');
  const [color, setColor] = useState(CLASS_COLORS[0]);
  return (
    <Modal icon="🏫" title="Create a class" onClose={onClose}
      footer={<><button className="cr-btn" onClick={onClose}>Cancel</button><button className="cr-btn cr-btn--primary" disabled={!name.trim()} onClick={() => onCreate({ name: name.trim(), year, color })}>Create class</button></>}>
      <div style={{ display: 'grid', gap: 14 }}>
        <div>
          <label className="cr-label" htmlFor="cc-name">Class name</label>
          <input id="cc-name" className="cr-input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 4 Oak or Coding Club"
            onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onCreate({ name: name.trim(), year, color }); }} />
        </div>
        <div>
          <span className="cr-label">Year group</span>
          <div className="cr-pills">{YEARS.map((y) => <button key={y.id} className="cr-pill" aria-pressed={year === y.id} onClick={() => setYear(y.id)}>{y.label}</button>)}</div>
        </div>
        <div>
          <span className="cr-label">Colour</span>
          <div className="cr-row">
            {CLASS_COLORS.map((c) => (
              <button key={c} aria-label={`Colour ${c}`} onClick={() => setColor(c)}
                style={{ width: 34, height: 34, borderRadius: '50%', background: c, border: color === c ? '3px solid var(--text-primary)' : '3px solid transparent', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function InviteModal({ cls, onClose, toast }) {
  const link = appLink(`classroom?join=${cls.inviteCode}`);
  return (
    <Modal icon="👋" title={`Invite pupils to ${cls.name}`} onClose={onClose} footer={<button className="cr-btn" onClick={onClose}>Done</button>}>
      <div style={{ textAlign: 'center', padding: '6px 0 16px' }}>
        <div className="cr-label">Class code</div>
        <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 46, fontWeight: 900, letterSpacing: 10, color: cls.color || 'var(--accent-primary)' }}>{cls.inviteCode}</div>
        <div className="cr-muted" style={{ fontSize: 13.5 }}>Pupils go to <b>Classroom</b> and type this code.</div>
      </div>
      <label className="cr-label" htmlFor="inv-link">Or share the join link</label>
      <div className="cr-row" style={{ flexWrap: 'nowrap' }}>
        <input id="inv-link" className="cr-input" readOnly value={link} onFocus={(e) => e.target.select()} />
        <button className="cr-btn" onClick={() => copyText(link).then(() => toast('Link copied'))}>Copy</button>
      </div>
      <button className="cr-btn cr-btn--google" style={{ width: '100%', marginTop: 14 }}
        onClick={() => openShareToClassroom({ url: link, title: `Join ${cls.name} on ByteBuddies`, body: `Class code: ${cls.inviteCode}`, itemtype: 'announcement' })}>
        <GoogleClassroomLogo size={20} /> Post the join link to Google Classroom
      </button>
    </Modal>
  );
}

function AddPupilsModal({ cls, onClose, onAdd }) {
  const [text, setText] = useState('');
  const rows = text.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const email = (l.match(/[^\s,<>]+@[^\s,<>]+/) || [''])[0].toLowerCase();
    const name = l.replace(email, '').replace(/[,<>]/g, ' ').trim() || email.split('@')[0];
    return { name, email };
  });
  return (
    <Modal icon="➕" title={`Add pupils to ${cls.name}`} onClose={onClose}
      footer={<><button className="cr-btn" onClick={onClose}>Cancel</button><button className="cr-btn cr-btn--primary" disabled={!rows.length} onClick={() => onAdd(rows)}>Add {rows.length || ''} pupil{rows.length === 1 ? '' : 's'}</button></>}>
      <p className="cr-muted" style={{ marginTop: 0, fontSize: 13.5, lineHeight: 1.5 }}>
        One pupil per line. Add their school email if they sign in with Google — they will join automatically.
      </p>
      <textarea className="cr-input" style={{ minHeight: 160 }} value={text} onChange={(e) => setText(e.target.value)}
        placeholder={'Amira Khan, amira.k@school.org\nLeo Smith\nZara Patel, zara.p@school.org'} />
    </Modal>
  );
}

function MarkModal({ cls, assignment, pupil, sub, onClose, onSave, onOpenProject }) {
  const [grade, setGrade] = useState(sub?.grade ?? '');
  const [feedback, setFeedback] = useState(sub?.feedback || '');
  const [sticker, setSticker] = useState(sub?.sticker || '⭐');
  const max = assignment.points || 10;
  return (
    <Modal wide icon="🖍️" title={`${pupil.name} — ${assignment.title}`} onClose={onClose}
      footer={<><button className="cr-btn" onClick={onClose}>Cancel</button><button className="cr-btn cr-btn--green" onClick={() => onSave({ grade, feedback, sticker })}>Return to pupil</button></>}>
      <div className="cr-two" style={{ gridTemplateColumns: 'minmax(0,1fr) 280px' }}>
        <div>
          <div className="cr-label">Their work · handed in {timeAgo(sub?.submittedAt)}</div>
          {sub ? <HandInView sub={sub} classId={cls.id} onOpenProject={onOpenProject} /> : <div className="cr-note cr-note--warn">Not handed in yet — you can still give feedback.</div>}
        </div>
        <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          <div>
            <label className="cr-label" htmlFor="mk-g">Score (out of {max})</label>
            <input id="mk-g" type="number" min="0" max={max} className="cr-input" value={grade} onChange={(e) => setGrade(e.target.value)} />
            <div className="cr-row" style={{ marginTop: 8, gap: 6 }}>
              {[max, Math.round(max * 0.8), Math.round(max * 0.6)].map((v) => (
                <button key={v} className="cr-btn cr-btn--sm" onClick={() => setGrade(v)}>{v}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="cr-label">Sticker</span>
            <div className="cr-row" style={{ gap: 6 }}>
              {STICKERS.map((s) => (
                <button key={s} onClick={() => setSticker(s)} aria-label={`Sticker ${s}`}
                  style={{ fontSize: 22, width: 40, height: 40, borderRadius: 12, cursor: 'pointer', border: sticker === s ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="cr-label" htmlFor="mk-f">Feedback</label>
            <textarea id="mk-f" className="cr-input" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What went well… Even better if…" />
            <div className="cr-row" style={{ marginTop: 6, gap: 6 }}>
              {['Brilliant debugging!', 'Great use of loops.', 'Try adding comments next time.'].map((t) => (
                <button key={t} className="cr-btn cr-btn--sm" onClick={() => setFeedback((f) => (f ? `${f} ${t}` : t))}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Page ─── */

export default function TeacherDashboard({ onNavigate, subPath = '' }) {
  const { user } = useUser();
  const [classes, setClasses] = useState(() => localClasses().filter((c) => !c.archived));
  const [selId, setSelId] = useState(() => localStorage.getItem('bb-cr-selected') || localClasses()[0]?.id || null);
  const [live, setLive] = useState(null); // freshest class doc (roster, progress, hand-ins, help)
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState(TAB_IDS.includes(subPath) ? subPath : 'classwork');
  const [modal, setModal] = useState(null);
  const [post, setPost] = useState('');
  const [postGc, setPostGc] = useState(false);
  const [markFor, setMarkFor] = useState(null); // assignment id for the marking tab
  const [gcError, setGcError] = useState(null);
  const [busy, setBusy] = useState('');
  const [toastEl, toast] = useToast();

  const cls = useMemo(() => {
    const base = classes.find((c) => c.id === selId) || classes[0] || null;
    return base && live?.id === base.id ? { ...base, ...live } : base;
  }, [classes, selId, live]);

  useEffect(() => { if (cls) localStorage.setItem('bb-cr-selected', cls.id); }, [cls?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (TAB_IDS.includes(subPath)) setTab(subPath); }, [subPath]);

  const persistClasses = useCallback((updater) => {
    setClasses((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveLocalClasses(next);
      return next;
    });
  }, []);

  // Bring back classes made on another device.
  useEffect(() => {
    fetchTeacherClasses(user.email).then((remote) => {
      if (!remote.length) return;
      persistClasses((prev) => {
        const map = new Map(prev.map((c) => [c.id, c]));
        remote.forEach((r) => map.set(r.id, { ...map.get(r.id), ...r }));
        return [...map.values()].filter((c) => !c.archived);
      });
      setSelId((id) => id || remote[0].id);
    });
  }, [user.email, persistClasses]);

  const refresh = useCallback(async () => {
    if (!cls) return;
    const [doc, asg] = await Promise.all([fetchClass(cls.id), fetchAssignments(cls.id)]);
    if (doc) setLive(doc);
    const local = localAssignments().filter((a) => a.classId === cls.id);
    const merged = new Map(local.map((a) => [a.id, a]));
    (asg || []).forEach((a) => merged.set(a.id, { ...merged.get(a.id), ...a }));
    setAssignments([...merged.values()].map(normAssignment).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
  }, [cls?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLive(null);
    setAssignments([]);
    refresh();
    const t = setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, 20000);
    return () => clearInterval(t);
  }, [cls?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Derived */
  const roster = useMemo(() => {
    if (!cls) return [];
    const list = (cls.students || []).map((s) => ({ ...s, key: pupilKey(s) }));
    const keys = new Set(list.map((s) => s.key));
    Object.entries(cls.progress || {}).forEach(([k, p]) => { if (!keys.has(k)) list.push({ id: p.email || p.name, name: p.name, email: p.email, key: k, joined: true }); });
    return list.map((s) => ({ ...s, progress: cls.progress?.[s.key] || null })).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [cls]);
  const subs = cls?.submissions || {};
  const openHelp = Object.values(cls?.help || {}).filter((h) => !h.resolved).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const statusOf = (a, p) => statusFor(a, findSub(subs, a.id, p.key), p.progress);
  const needsMarking = assignments.reduce((n, a) => n + roster.filter((p) => statusOf(a, p) === 'handed').length, 0);
  const activeThisWeek = roster.filter((p) => p.progress?.updatedAt && Date.now() - new Date(p.progress.updatedAt) < 7 * 86400000).length;
  const missingCount = assignments.reduce((n, a) => n + roster.filter((p) => statusOf(a, p) === 'late').length, 0);

  /* Actions */
  const createClass = async ({ name, year, color }) => {
    const c = {
      id: `${Date.now()}`, name, year, color, subject: 'Computing', grade: YEARS.find((y) => y.id === year)?.label || '',
      inviteCode: makeInviteCode(), students: [], rosterEmails: [], announcements: [],
      createdAt: new Date().toISOString(), teacherName: user.name || '', teacherEmail: user.email || '',
    };
    persistClasses((p) => [...p, c]);
    setSelId(c.id);
    setModal(null);
    setTab('classwork');
    toast(`${name} is ready — invite your pupils!`);
    try { await saveClass(c); } catch { toast('Saved on this device — will sync when online'); }
  };

  const importCourse = async (course, students) => {
    const roster = students.map((s) => ({ id: s.email || s.userId, name: s.name, email: s.email, photo: s.photo, source: 'google', joined: false }));
    const c = {
      id: `${Date.now()}`, name: course.name, year: 'other', color: CLASS_COLORS[classes.length % CLASS_COLORS.length], subject: 'Computing',
      grade: course.section || '', inviteCode: makeInviteCode(), students: roster, rosterEmails: roster.map((r) => r.email).filter(Boolean),
      announcements: [], gcCourseId: course.id, gcCourseName: course.name, gcLink: course.link,
      createdAt: new Date().toISOString(), teacherName: user.name || '', teacherEmail: user.email || '',
    };
    persistClasses((p) => [...p, c]);
    setSelId(c.id);
    await saveClass(c);
  };

  const mergeRoster = (existing, students) => {
    const byEmail = new Map(existing.map((s) => [(s.email || '').toLowerCase(), s]));
    students.forEach((s) => {
      const old = byEmail.get(s.email);
      byEmail.set(s.email, { ...(old || { joined: false }), id: old?.id || s.email || s.userId, name: old?.name || s.name, email: s.email, photo: s.photo, source: 'google' });
    });
    return [...byEmail.values()].filter((s) => s.email || s.name);
  };

  const linkCourse = async (c, course, students) => {
    const merged = mergeRoster(c.students || [], students);
    const patch = { gcCourseId: course.id, gcCourseName: course.name, gcLink: course.link, students: merged, rosterEmails: merged.map((s) => (s.email || '').toLowerCase()).filter(Boolean) };
    persistClasses((p) => p.map((x) => (x.id === c.id ? { ...x, ...patch } : x)));
    setLive((l) => (l?.id === c.id ? { ...l, ...patch } : l));
    await saveClass({ ...c, ...patch });
  };

  const refreshRoster = async (c, students) => {
    const merged = mergeRoster(c.students || [], students);
    await updateRoster(c.id, merged);
    persistClasses((p) => p.map((x) => (x.id === c.id ? { ...x, students: merged } : x)));
    setLive((l) => (l?.id === c.id ? { ...l, students: merged } : l));
    return merged.length;
  };

  const addPupils = async (rows) => {
    const existing = cls.students || [];
    const have = new Set(existing.map(pupilKey));
    const added = rows.map((r) => ({ id: r.email || r.name, name: r.name, email: r.email, joined: false })).filter((r) => !have.has(pupilKey(r)));
    const next = [...existing, ...added];
    await updateRoster(cls.id, next);
    persistClasses((p) => p.map((x) => (x.id === cls.id ? { ...x, students: next } : x)));
    setLive((l) => (l ? { ...l, students: next } : l));
    setModal(null);
    toast(`Added ${added.length} pupil${added.length === 1 ? '' : 's'}`);
  };

  const removePupil = async (pupil) => {
    if (!window.confirm(`Remove ${pupil.name} from ${cls.name}?`)) return;
    const next = (cls.students || []).filter((s) => pupilKey(s) !== pupil.key);
    await updateRoster(cls.id, next);
    persistClasses((p) => p.map((x) => (x.id === cls.id ? { ...x, students: next } : x)));
    setLive((l) => (l ? { ...l, students: next } : l));
  };

  const renamePupil = async (pupil) => {
    const name = window.prompt('Pupil name', pupil.name);
    if (!name?.trim()) return;
    const next = (cls.students || []).map((s) => (pupilKey(s) === pupil.key ? { ...s, name: name.trim() } : s));
    await updateRoster(cls.id, next);
    setLive((l) => (l ? { ...l, students: next } : l));
  };

  const archiveClass = async () => {
    if (!window.confirm(`Archive ${cls.name}? Pupils will no longer see it.`)) return;
    await saveClass({ ...cls, archived: true });
    persistClasses((p) => p.filter((x) => x.id !== cls.id));
    setSelId(null);
  };

  const setWork = async (data, { postToGc }) => {
    const a = { id: `${Date.now()}`, classId: cls.id, createdAt: new Date().toISOString(), ...data };
    if (postToGc) {
      setGcError(null);
      try {
        const cw = await createCourseWork(cls.gcCourseId, {
          title: a.title, description: a.description, link: appLink(classroomHash(a, cls)), dueDate: a.dueDate, maxPoints: a.points,
        });
        a.gc = { courseId: cls.gcCourseId, courseWorkId: cw.id, link: cw.link };
      } catch (e) {
        setGcError(e);
      }
    }
    saveLocalAssignments([...localAssignments(), a]);
    setAssignments((p) => [a, ...p]);
    setModal(null);
    toast(a.gc ? 'Set — and posted to Google Classroom ✓' : 'Work set ✓');
    try { await saveAssignment(a); } catch { /* local copy kept */ }
  };

  const postToGoogle = async (a) => {
    setGcError(null);
    setBusy(`gc${a.id}`);
    try {
      const cw = await createCourseWork(cls.gcCourseId, {
        title: a.title, description: a.description, link: appLink(classroomHash(a, cls)), dueDate: a.dueDate, maxPoints: a.points || 10,
      });
      const next = { ...a, gc: { courseId: cls.gcCourseId, courseWorkId: cw.id, link: cw.link } };
      setAssignments((p) => p.map((x) => (x.id === a.id ? next : x)));
      saveLocalAssignments(localAssignments().map((x) => (x.id === a.id ? next : x)));
      await saveAssignment(next);
      toast('Posted to Google Classroom ✓');
    } catch (e) { setGcError(e); }
    setBusy('');
  };

  const shareAssignment = (a) => openShareToClassroom({
    url: appLink(classroomHash(a, cls)), title: a.title, body: a.description || `${KIND_META[a.kind]?.label || 'Work'} on ByteBuddies`, itemtype: 'assignment', courseId: cls.gcCourseId,
  });

  const deleteWork = async (a) => {
    if (!window.confirm(`Delete "${a.title}"? Pupils' hand-ins stay in their history.`)) return;
    setAssignments((p) => p.filter((x) => x.id !== a.id));
    saveLocalAssignments(localAssignments().filter((x) => x.id !== a.id));
    await removeAssignment(a.id);
  };

  const sendGrades = async (a) => {
    setGcError(null);
    setBusy(`sg${a.id}`);
    try {
      const grades = {};
      roster.forEach((p) => {
        const s = findSub(subs, a.id, p.key);
        if (p.email && s?.grade != null) grades[p.email.toLowerCase()] = s.grade;
      });
      const { sent } = await syncGrades(a.gc.courseId, a.gc.courseWorkId, grades);
      toast(`Sent ${sent} grade${sent === 1 ? '' : 's'} to Google Classroom`);
    } catch (e) { setGcError(e); }
    setBusy('');
  };

  const sendPost = async () => {
    const text = post.trim();
    if (!text) return;
    const p = { id: `${Date.now()}`, text, author: user.name || 'Teacher', createdAt: new Date().toISOString(), pinned: false };
    setLive((l) => (l ? { ...l, announcements: [...(l.announcements || []), p] } : l));
    setPost('');
    await postAnnouncement(cls.id, p);
    if (postGc && cls.gcCourseId && getGcSession()) {
      try { await createAnnouncement(cls.gcCourseId, text, appLink('classroom')); toast('Posted here and in Google Classroom'); } catch (e) { setGcError(e); }
    } else toast('Posted to your class');
  };

  const editPosts = async (fn) => {
    const next = fn(cls.announcements || []);
    setLive((l) => (l ? { ...l, announcements: next } : l));
    await replaceAnnouncements(cls.id, next);
  };

  const saveMark = async (a, pupil, sub, mark) => {
    // Feedback without a hand-in: create a teacher-made entry so the pupil sees it.
    const entry = sub || await handIn(cls.id, a, { email: pupil.email, name: pupil.name }, { byTeacher: true });
    await markSubmission(cls.id, entry.id, mark);
    setModal(null);
    toast(`Returned to ${pupil.name}`);
    refresh();
  };

  const openProject = (project) => {
    try {
      localStorage.setItem('cv_gamebuilder_sprites', JSON.stringify(project.sprites || []));
      localStorage.setItem('cv_gamebuilder_bg', project.background || 'Space');
      sessionStorage.setItem('bb-viewing-submission', JSON.stringify({ studentName: modal?.pupil?.name || 'Pupil', assignmentTitle: modal?.a?.title || '' }));
    } catch { /* ignore */ }
    window.location.hash = 'gamebuilder';
  };

  /* ─── Render ─── */

  const gcLinked = Boolean(cls?.gcCourseId);
  const gcLive = Boolean(getGcSession());
  const markA = assignments.find((a) => a.id === markFor) || assignments.find((a) => roster.some((p) => statusOf(a, p) === 'handed')) || assignments[0];

  const header = (
    <div className="cr-top">
      <div>
        <div className="cr-muted" style={{ fontWeight: 700, fontSize: 13 }}>👩‍🏫 {user.name || 'Teacher'}</div>
        <h1 className="cr-title">Classroom</h1>
      </div>
      <div className="cr-row">
        <button className="cr-btn cr-btn--google" onClick={() => { setTab('google'); if (!classes.length) setModal(null); }}>
          <GoogleClassroomLogo size={18} /> Google Classroom
        </button>
        <button className="cr-btn cr-btn--primary" onClick={() => setModal({ type: 'create' })}>＋ New class</button>
      </div>
    </div>
  );

  if (!classes.length) {
    return (
      <div className="cr">
        {toastEl}
        {header}
        {modal?.type === 'create' && <CreateClassModal onClose={() => setModal(null)} onCreate={createClass} />}
        {tab === 'google' ? (
          <>
            <button className="cr-btn cr-btn--sm" style={{ marginBottom: 12 }} onClick={() => setTab('classwork')}>← Back</button>
            <GooglePanel cls={null} classes={classes} onImport={importCourse} onLink={linkCourse} onRefreshRoster={refreshRoster} toast={toast} />
          </>
        ) : (
          <>
            <div className="cr-banner" style={{ background: classGradient('#6366f1') }}>
              <h2>Set up your ByteBuddies class</h2>
              <p style={{ margin: '8px 0 0', opacity: 0.9, maxWidth: 560, lineHeight: 1.55 }}>
                Set lessons, missions and coding projects, see who has finished, mark work and give feedback — all in one place.
              </p>
            </div>
            <div className="cr-choices">
              <button className="cr-choice" onClick={() => setTab('google')}>
                <GoogleClassroomLogo size={44} />
                <h3>Import from Google Classroom</h3>
                <p>Bring in your classes and pupils in one click. Pupils sign in with Google — no codes to type.</p>
              </button>
              <button className="cr-choice" onClick={() => setModal({ type: 'create' })}>
                <span style={{ fontSize: 40 }}>🏫</span>
                <h3>Create a class</h3>
                <p>Get a 6-letter class code. Pupils type it in, or you share the join link anywhere.</p>
              </button>
            </div>
            <div className="cr-card" style={{ marginTop: 16 }}>
              <div className="cr-steps">
                <div className="cr-step"><i>1</i><span><b>Make a class</b> or import it from Google Classroom.</span></div>
                <div className="cr-step"><i>2</i><span><b>Set work</b> — any lesson, mission, game or robot challenge.</span></div>
                <div className="cr-step"><i>3</i><span><b>Watch progress</b> live, mark hand-ins and send grades back to Google.</span></div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  const TABS = [
    { id: 'classwork', label: '📋 Classwork' },
    { id: 'stream', label: '📣 Stream', badge: openHelp.length },
    { id: 'pupils', label: '👥 Pupils' },
    { id: 'marking', label: '🖍️ Marking', badge: needsMarking },
    { id: 'google', label: 'Google Classroom', icon: true },
  ];

  return (
    <div className="cr">
      {toastEl}
      {header}

      {modal?.type === 'create' && <CreateClassModal onClose={() => setModal(null)} onCreate={createClass} />}
      {modal?.type === 'invite' && <InviteModal cls={cls} onClose={() => setModal(null)} toast={toast} />}
      {modal?.type === 'add' && <AddPupilsModal cls={cls} onClose={() => setModal(null)} onAdd={addPupils} />}
      {modal?.type === 'setwork' && <SetWorkModal cls={cls} onClose={() => setModal(null)} onCreate={setWork} />}
      {modal?.type === 'mark' && (
        <MarkModal cls={cls} assignment={modal.a} pupil={modal.pupil} sub={modal.sub} onClose={() => setModal(null)}
          onSave={(m) => saveMark(modal.a, modal.pupil, modal.sub, m)} onOpenProject={openProject} />
      )}

      {classes.length > 1 && (
        <div className="cr-pills" style={{ marginBottom: 14 }}>
          {classes.map((c) => (
            <button key={c.id} className="cr-pill" aria-pressed={c.id === cls.id} onClick={() => setSelId(c.id)}>
              <span className="cr-dot" style={{ background: c.color || '#6366f1' }} /> {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="cr-banner" style={{ background: classGradient(cls.color || '#6366f1') }}>
        <div className="cr-row" style={{ alignItems: 'flex-start', gap: 16 }}>
          <div className="cr-grow">
            <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.85 }}>{[cls.grade, cls.subject].filter(Boolean).join(' · ') || 'Computing'}</div>
            <h2>{cls.name}</h2>
            <div className="cr-row" style={{ marginTop: 10, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>
              <span>👥 {roster.length} pupil{roster.length === 1 ? '' : 's'}</span>
              <span>📋 {assignments.length} piece{assignments.length === 1 ? '' : 's'} of work</span>
              {gcLinked && <span className="cr-row" style={{ gap: 5 }}><GoogleClassroomLogo size={16} /> {cls.gcCourseName}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.8, marginBottom: 4 }}>CLASS CODE</div>
            <button className="cr-code" title="Copy code" onClick={() => copyText(cls.inviteCode).then(() => toast('Class code copied'))}>{cls.inviteCode}</button>
          </div>
        </div>
        <div className="cr-row" style={{ marginTop: 16 }}>
          <button className="cr-btn cr-btn--sm" style={{ background: '#fff', color: '#111827' }} onClick={() => setModal({ type: 'setwork' })}>＋ Set work</button>
          <button className="cr-btn cr-btn--sm" onClick={() => setModal({ type: 'invite' })}>👋 Invite pupils</button>
          <button className="cr-btn cr-btn--sm" onClick={() => onNavigate?.('learn')}>📚 Teach a lesson</button>
          {gcLinked && cls.gcLink && <a className="cr-btn cr-btn--sm" href={cls.gcLink} target="_blank" rel="noopener noreferrer">Open in Google Classroom ↗</a>}
        </div>
      </div>

      <div className="cr-stats">
        <button className="cr-stat" onClick={() => setTab('pupils')}>
          <b>{activeThisWeek}<small> / {roster.length}</small></b><span>👥 Active this week</span>
        </button>
        <button className="cr-stat" onClick={() => setTab('marking')} data-hot={needsMarking > 0 || undefined} style={{ '--tone': '#6366f1' }}>
          <b>{needsMarking}</b><span>🖍️ Waiting to mark</span>
        </button>
        <button className="cr-stat" onClick={() => setTab('stream')} data-hot={openHelp.length > 0 || undefined} style={{ '--tone': '#f59e0b' }}>
          <b>{openHelp.length}</b><span>🙋 Asking for help</span>
        </button>
        <button className="cr-stat" onClick={() => setTab('pupils')} data-hot={missingCount > 0 || undefined} style={{ '--tone': '#ef4444' }}>
          <b>{missingCount}</b><span>⏰ Missing work</span>
        </button>
      </div>

      {openHelp.length > 0 && tab !== 'stream' && (
        <button className="cr-note cr-note--warn" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 14, color: 'inherit', font: 'inherit' }} onClick={() => setTab('stream')}>
          🙋 <b>{openHelp.length} pupil{openHelp.length === 1 ? '' : 's'} asked for help</b> — {openHelp.map((h) => h.name).slice(0, 3).join(', ')}. Tap to see.
        </button>
      )}

      <div className="cr-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" className="cr-tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.icon && <GoogleClassroomLogo size={16} />} {t.label} {t.badge > 0 && <span className="cr-badge">{t.badge}</span>}
          </button>
        ))}
      </div>

      <GcErrorNote error={gcError} />

      {/* ── Classwork ── */}
      {tab === 'classwork' && (
        <div>
          {assignments.length === 0 ? (
            <div className="cr-card cr-empty">
              <div className="cr-big">📋</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>No work set yet</h3>
              <p style={{ margin: '0 0 16px' }}>Pick a lesson, a mission, a game to build or a robot challenge.</p>
              <button className="cr-btn cr-btn--primary" onClick={() => setModal({ type: 'setwork' })}>＋ Set the first piece of work</button>
            </div>
          ) : assignments.map((a) => {
            const meta = KIND_META[a.kind] || KIND_META.task;
            const counts = { done: 0, handed: 0, marked: 0, late: 0, todo: 0 };
            roster.forEach((p) => { counts[statusOf(a, p)]++; });
            const finished = counts.done + counts.handed + counts.marked;
            const n = Math.max(1, roster.length);
            return (
              <div key={a.id} className="cr-work" style={{ borderLeftColor: meta.color }}>
                <div className="cr-work__icon" style={{ background: `${meta.color}1f` }}>{a.emoji || meta.emoji}</div>
                <div className="cr-grow">
                  <div className="cr-row" style={{ gap: 8 }}>
                    <div className="cr-work__title">{a.title}</div>
                    <Chip color={meta.color}>{meta.label}</Chip>
                    {a.gc && <a href={a.gc.link} target="_blank" rel="noopener noreferrer" title="Open in Google Classroom"><GoogleClassroomLogo size={18} /></a>}
                  </div>
                  <div className="cr-work__meta">
                    <span>📅 {dueLabel(a.dueDate)}</span>
                    <span>🏅 {a.points || 10} points</span>
                    <span>✅ {finished}/{roster.length} finished</span>
                    {counts.handed > 0 && <span style={{ color: '#6366f1', fontWeight: 700 }}>🖍️ {counts.handed} to mark</span>}
                  </div>
                  {a.description && <div style={{ fontSize: 13.5, marginTop: 6, lineHeight: 1.5 }}>{a.description}</div>}
                  <div className="cr-bar" style={{ marginTop: 10 }} title={`${finished} of ${roster.length} finished`}>
                    <span style={{ width: `${(counts.marked / n) * 100}%`, background: '#22c55e' }} />
                    <span style={{ width: `${((counts.done + counts.handed) / n) * 100}%`, background: '#6366f1' }} />
                    <span style={{ width: `${(counts.late / n) * 100}%`, background: '#ef4444' }} />
                  </div>
                </div>
                <div className="cr-work__actions">
                  <button className="cr-btn cr-btn--sm" onClick={() => { setMarkFor(a.id); setTab('marking'); }}>View work</button>
                  {a.kind !== 'task' && <button className="cr-btn cr-btn--sm" onClick={() => { window.location.hash = a.hash; }}>Preview</button>}
                  {gcLinked && gcLive && !a.gc && (
                    <button className="cr-btn cr-btn--sm cr-btn--google" disabled={busy === `gc${a.id}`} onClick={() => postToGoogle(a)}>
                      <GoogleClassroomLogo size={15} /> {busy === `gc${a.id}` ? 'Posting…' : 'Post'}
                    </button>
                  )}
                  {!a.gc && (
                    <button className="cr-btn cr-btn--sm cr-btn--google" onClick={() => shareAssignment(a)} title="Share to Google Classroom">
                      <GoogleClassroomLogo size={15} /> Share
                    </button>
                  )}
                  <button className="cr-btn cr-btn--sm cr-btn--ghost cr-btn--danger" onClick={() => deleteWork(a)} aria-label="Delete work">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Stream ── */}
      {tab === 'stream' && (
        <div className="cr-two">
          <div>
            <div className="cr-card" style={{ marginBottom: 14 }}>
              <textarea className="cr-input" value={post} onChange={(e) => setPost(e.target.value)} placeholder={`Share something with ${cls.name}…`} style={{ minHeight: 80 }} />
              <div className="cr-row" style={{ marginTop: 10 }}>
                {gcLinked && gcLive && (
                  <label className="cr-row" style={{ gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <input type="checkbox" checked={postGc} onChange={(e) => setPostGc(e.target.checked)} /> <GoogleClassroomLogo size={16} /> Also post in Google Classroom
                  </label>
                )}
                <button className="cr-btn cr-btn--primary cr-btn--sm" style={{ marginLeft: 'auto' }} disabled={!post.trim()} onClick={sendPost}>Post</button>
              </div>
            </div>
            {[...(cls.announcements || [])].sort((a, b) => (b.pinned - a.pinned) || b.createdAt.localeCompare(a.createdAt)).map((p) => (
              <div key={p.id} className="cr-post">
                <Avatar name={p.author} size={38} />
                <div className="cr-post__body" style={p.pinned ? { borderColor: 'var(--accent-primary)' } : undefined}>
                  <div className="cr-row" style={{ gap: 8 }}>
                    <b style={{ fontSize: 14 }}>{p.author}</b>
                    <span className="cr-muted" style={{ fontSize: 12 }}>{timeAgo(p.createdAt)}</span>
                    {p.pinned && <Chip color="#6366f1">📌 Pinned</Chip>}
                    <span style={{ marginLeft: 'auto' }} className="cr-row">
                      <button className="cr-btn cr-btn--sm cr-btn--ghost" onClick={() => editPosts((l) => l.map((x) => (x.id === p.id ? { ...x, pinned: !x.pinned } : x)))}>{p.pinned ? 'Unpin' : '📌'}</button>
                      <button className="cr-btn cr-btn--sm cr-btn--ghost" aria-label="Delete post" onClick={() => editPosts((l) => l.filter((x) => x.id !== p.id))}>🗑️</button>
                    </span>
                  </div>
                  <p>{p.text}</p>
                </div>
              </div>
            ))}
            {!(cls.announcements || []).length && <div className="cr-empty">Nothing posted yet. Say hello to your class! 👋</div>}
          </div>
          <div className="cr-card">
            <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 10 }}>🙋 Help requests</h3>
            {openHelp.length === 0 && <div className="cr-muted" style={{ fontSize: 13 }}>No one needs help right now.</div>}
            {openHelp.map((h) => (
              <div key={h.id} className="cr-sub" style={{ marginBottom: 8 }}>
                <div className="cr-row" style={{ gap: 8 }}><b style={{ fontSize: 13.5 }}>{h.name}</b><span className="cr-muted" style={{ fontSize: 11.5 }}>{timeAgo(h.createdAt)}</span></div>
                <div style={{ fontSize: 13.5, margin: '6px 0 8px', lineHeight: 1.45 }}>{h.message}</div>
                <button className="cr-btn cr-btn--sm cr-btn--green" onClick={async () => { await resolveHelp(cls.id, h.id); refresh(); }}>✓ Helped</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pupils ── */}
      {tab === 'pupils' && (
        <div className="cr-card">
          <div className="cr-row" style={{ marginBottom: 12 }}>
            <h3 className="cr-grow" style={{ fontSize: 16, fontWeight: 900 }}>Pupils & progress</h3>
            <button className="cr-btn cr-btn--sm" onClick={() => setModal({ type: 'add' })}>➕ Add pupils</button>
            <button className="cr-btn cr-btn--sm" onClick={() => setModal({ type: 'invite' })}>👋 Invite</button>
            <button className="cr-btn cr-btn--sm" onClick={() => printReport(cls, roster, assignments, statusOf, user)}>📄 Report</button>
          </div>
          {roster.length === 0 ? (
            <div className="cr-empty"><div className="cr-big">👥</div>No pupils yet — share the class code <b>{cls.inviteCode}</b> or add them by name.</div>
          ) : (
            <div className="cr-scroll">
              <table className="cr-table">
                <thead>
                  <tr>
                    <th>Pupil</th>
                    <th>Last seen</th>
                    <th>Lessons</th>
                    <th>Missions</th>
                    <th>XP</th>
                    {assignments.slice(0, 8).map((a) => <th key={a.id} title={a.title} style={{ textAlign: 'center' }}>{a.emoji || '📋'}</th>)}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {roster.map((p) => (
                    <tr key={p.key}>
                      <td>
                        <div className="cr-row" style={{ gap: 10, flexWrap: 'nowrap' }}>
                          <Avatar name={p.name} emoji={p.progress?.avatarEmoji || p.avatarEmoji} photo={p.photo} size={34} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 800 }}>{p.name}</div>
                            <div className="cr-muted" style={{ fontSize: 11.5 }}>{p.email || (p.joined ? 'Joined with code' : 'Not joined yet')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="cr-muted" style={{ whiteSpace: 'nowrap' }}>{p.progress ? timeAgo(p.progress.updatedAt) : (p.joined ? 'Joined' : '—')}</td>
                      <td><b>{p.progress?.lessonsDone?.length || 0}</b></td>
                      <td><b>{p.progress?.missionsDone?.length || 0}</b></td>
                      <td>⚡{p.progress?.xp || 0}</td>
                      {assignments.slice(0, 8).map((a) => {
                        const st = STATUS[statusOf(a, p)];
                        return (
                          <td key={a.id} style={{ textAlign: 'center' }}>
                            <button className="cr-cell" title={`${a.title}: ${st.label}`} style={{ background: `${st.color}22`, border: 'none', cursor: 'pointer' }}
                              onClick={() => setModal({ type: 'mark', a, pupil: p, sub: findSub(subs, a.id, p.key) })}>{st.icon}</button>
                          </td>
                        );
                      })}
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <button className="cr-btn cr-btn--sm cr-btn--ghost" onClick={() => renamePupil(p)} aria-label={`Rename ${p.name}`}>✏️</button>
                        <button className="cr-btn cr-btn--sm cr-btn--ghost" onClick={() => removePupil(p)} aria-label={`Remove ${p.name}`}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="cr-row" style={{ marginTop: 12, gap: 14, fontSize: 12 }}>
                {Object.entries(STATUS).map(([k, s]) => <span key={k} className="cr-muted">{s.icon} {s.label}</span>)}
              </div>
            </div>
          )}
          <div className="cr-row" style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
            <span className="cr-muted cr-grow" style={{ fontSize: 12.5 }}>Finished with this class at the end of the year?</span>
            <button className="cr-btn cr-btn--sm cr-btn--ghost cr-btn--danger" onClick={archiveClass}>Archive class</button>
          </div>
        </div>
      )}

      {/* ── Marking ── */}
      {tab === 'marking' && (
        assignments.length === 0 ? (
          <div className="cr-card cr-empty"><div className="cr-big">🖍️</div>Set some work first — hand-ins will appear here.</div>
        ) : (
          <div className="cr-card">
            <div className="cr-row" style={{ marginBottom: 14 }}>
              <select className="cr-input" style={{ maxWidth: 420 }} value={markA?.id || ''} onChange={(e) => setMarkFor(e.target.value)} aria-label="Choose work to mark">
                {assignments.map((a) => <option key={a.id} value={a.id}>{a.emoji} {a.title}</option>)}
              </select>
              {markA?.gc && (
                <button className="cr-btn cr-btn--sm cr-btn--google" style={{ marginLeft: 'auto' }} disabled={!gcLive || busy === `sg${markA.id}`}
                  title={gcLive ? '' : 'Connect Google Classroom first'} onClick={() => sendGrades(markA)}>
                  <GoogleClassroomLogo size={16} /> {busy === `sg${markA.id}` ? 'Sending…' : 'Send grades to Google Classroom'}
                </button>
              )}
            </div>
            {markA && roster.map((p) => {
              const sub = findSub(subs, markA.id, p.key);
              const stKey = statusOf(markA, p);
              const st = STATUS[stKey];
              return (
                <div key={p.key} className="cr-row" style={{ padding: '10px 4px', borderBottom: '1px solid var(--border-color)', gap: 12 }}>
                  <Avatar name={p.name} emoji={p.progress?.avatarEmoji} photo={p.photo} size={34} />
                  <div className="cr-grow">
                    <div style={{ fontWeight: 800 }}>{p.name}</div>
                    <div className="cr-muted" style={{ fontSize: 12 }}>
                      {sub ? `Handed in ${timeAgo(sub.submittedAt)}` : stKey === 'done' ? 'Finished in ByteBuddies' : 'Nothing yet'}
                      {workSummary(sub?.work)}
                      {sub?.feedback ? ` · “${sub.feedback.slice(0, 50)}${sub.feedback.length > 50 ? '…' : ''}”` : ''}
                    </div>
                  </div>
                  <Chip color={st.color}>{st.icon} {st.label}</Chip>
                  {sub?.grade != null && <b style={{ minWidth: 60, textAlign: 'right' }}>{sub.sticker} {sub.grade}/{markA.points || 10}</b>}
                  <button className={`cr-btn cr-btn--sm${stKey === 'handed' ? ' cr-btn--primary' : ''}`} onClick={() => setModal({ type: 'mark', a: markA, pupil: p, sub })}>
                    {stKey === 'handed' ? 'Mark' : sub ? 'Edit' : 'Feedback'}
                  </button>
                </div>
              );
            })}
            {markA && roster.length === 0 && <div className="cr-empty">No pupils in this class yet.</div>}
          </div>
        )
      )}

      {/* ── Google Classroom ── */}
      {tab === 'google' && (
        <GooglePanel cls={cls} classes={classes} onImport={importCourse} onLink={linkCourse} onRefreshRoster={refreshRoster} toast={toast} />
      )}
    </div>
  );
}

function printReport(cls, roster, assignments, statusOf, user) {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rows = roster.map((p) => `<tr><td>${esc(p.name)}</td><td>${p.progress?.lessonsDone?.length || 0}</td><td>${p.progress?.missionsDone?.length || 0}</td><td>${p.progress?.xp || 0}</td>${
    assignments.map((a) => { const s = STATUS[statusOf(a, p)]; return `<td style="color:${s.color}">${s.label}</td>`; }).join('')}</tr>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(cls.name)} — progress</title><style>
    body{font-family:system-ui,Segoe UI,Arial,sans-serif;color:#1e293b;padding:32px;max-width:1100px;margin:auto}
    h1{margin:0;color:${cls.color || '#6366f1'}}table{width:100%;border-collapse:collapse;margin-top:20px;font-size:12.5px}
    th,td{padding:8px;border-bottom:1px solid #e2e8f0;text-align:left}th{background:#f1f5f9;font-size:11px;text-transform:uppercase}
  </style></head><body><h1>${esc(cls.name)}</h1><p>ByteBuddies progress report · ${esc(user.name || '')} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  <table><thead><tr><th>Pupil</th><th>Lessons</th><th>Missions</th><th>XP</th>${assignments.map((a) => `<th>${esc(a.title)}</th>`).join('')}</tr></thead><tbody>${rows || '<tr><td>No pupils yet</td></tr>'}</tbody></table>
  <script>onload=()=>print()</script></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
