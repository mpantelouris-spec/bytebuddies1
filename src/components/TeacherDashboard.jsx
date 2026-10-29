import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import {
  localClasses, saveLocalClasses, localAssignments, saveLocalAssignments, makeInviteCode,
  saveClass, fetchClass, fetchTeacherClasses, fetchAllTeacherClasses, deleteClass, localArchivedClasses, rememberArchived, fetchAssignments, saveAssignment, deleteAssignment as removeAssignment,
  updateRoster, postAnnouncement, replaceAnnouncements, resolveHelp, markSubmission, handIn,
  findSub, safeKey, statusFor, STATUS, dueLabel,
} from '../utils/classroomStore.js';
import {
  getGcSession, createCourseWork, syncGrades, openShareToClassroom, appLink,
} from '../utils/googleClassroom.js';
import { Modal, Avatar, Chip, GoogleClassroomLogo, useToast, copyText, timeAgo, classGradient, CLASS_COLORS, STICKERS } from './classroom/ui.jsx';
import { KIND_META, classroomHash } from './classroom/assignables.js';
import SetWorkModal from './classroom/SetWorkModal.jsx';
import GooglePanel, { GcErrorNote } from './classroom/GooglePanel.jsx';
import HandInView from './classroom/HandInView.jsx';
import { provisionPupilLicenses } from '../firebase.js';
import { EmojiIcon, IconText } from './ui/Icon.jsx';

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

function CreateClassModal({ onClose, onCreate, addPupilsAfter = false }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('y3');
  const [color, setColor] = useState(CLASS_COLORS[0]);
  return (
    <Modal icon="🏫" title="Create a class" onClose={onClose}
      footer={<><button className="cr-btn" onClick={onClose}>Cancel</button><button className="cr-btn cr-btn--primary" disabled={!name.trim()} onClick={() => onCreate({ name: name.trim(), year, color })}>Create class</button></>}>
      <div style={{ display: 'grid', gap: 14 }}>
        {addPupilsAfter && <p className="cr-muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5 }}>First name your class. Next, you’ll enter pupil school emails and assign their places.</p>}
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

/** Every class this teacher has made (archived ones too): open, archive / restore, or delete. */
function ManageClassesModal({ teacherEmail, current, onOpen, onArchive, onRestore, onDelete, onClose }) {
  const [list, setList] = useState(null);
  const [busy, setBusy] = useState('');
  const load = useCallback(() => {
    fetchAllTeacherClasses(teacherEmail).then((remote) => {
      const map = new Map([...localClasses(), ...localArchivedClasses()].map((c) => [c.id, c]));
      remote.forEach((r) => map.set(r.id, { ...map.get(r.id), ...r }));
      setList([...map.values()].sort((a, b) => Number(!!a.archived) - Number(!!b.archived) || String(a.name).localeCompare(String(b.name))));
    });
  }, [teacherEmail]);
  useEffect(() => { load(); }, [load]);
  const act = async (c, fn) => { setBusy(c.id); try { await fn(c); } finally { setBusy(''); load(); } };
  return (
    <Modal wide icon="🗂️" title="Manage classes" onClose={onClose} footer={<button className="cr-btn" onClick={onClose}>Done</button>}>
      {!list ? <p className="cr-muted">Loading your classes…</p> : !list.length ? <p className="cr-muted">You haven’t made any classes yet.</p> : (
        <div className="cr-manage">
          {list.map((c) => (
            <div key={c.id} className={`cr-manage-row${c.archived ? ' is-archived' : ''}`}>
              <span className="cr-dot" style={{ background: c.color || '#6366f1' }} />
              <div className="cr-grow">
                <b>{c.name}</b>{c.id === current ? <span className="cr-muted"> · open now</span> : null}
                <div className="cr-muted" style={{ fontSize: 12 }}>{(c.students || []).length} pupil{(c.students || []).length === 1 ? '' : 's'}{c.archived ? ' · archived (pupils can’t see it)' : ''}{c.gcCourseName ? ` · Google Classroom: ${c.gcCourseName}` : ''}</div>
              </div>
              {c.archived
                ? <button className="cr-btn cr-btn--sm" disabled={busy === c.id} onClick={() => act(c, onRestore)}>↩ Restore</button>
                : <>
                  <button className="cr-btn cr-btn--sm" onClick={() => onOpen(c)}>Open</button>
                  <button className="cr-btn cr-btn--sm cr-btn--ghost" disabled={busy === c.id} onClick={() => act(c, onArchive)}>Archive</button>
                </>}
              <button className="cr-btn cr-btn--sm cr-btn--danger" disabled={busy === c.id} onClick={() => act(c, onDelete)}><EmojiIcon e="🗑" style={{ marginRight: '0.3em' }} />Delete</button>
            </div>
          ))}
        </div>
      )}
      <p className="cr-muted" style={{ fontSize: 12, marginTop: 12 }}>
        <b>Archive</b> hides a class from pupils but keeps everything, so you can restore it. <b>Delete</b> removes the class, its posts, hand-ins and the work set for it for good.
        Pupils keep their ByteBuddies sign-in place either way.
      </p>
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
        <div className="cr-muted" style={{ fontSize: 13.5 }}>Add pupils by school email first so their paid place is assigned, then they can sign in and join with this code.</div>
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

function AddPupilsModal({ cls, onClose, onAdd, teacherEmail }) {
  const [pupils, setPupils] = useState(() => Array.from({ length: 30 }, () => ({ name: '', email: '' })));
  const rows = pupils.map(({ name, email }) => ({ name: name.trim(), email: email.trim().toLowerCase() }))
    .filter((row) => row.name || row.email);
  const incompleteRows = rows.some((row) => !row.name || !row.email);
  const invalidEmails = rows.some((row) => row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email));
  const includesTeacher = rows.some((row) => row.email && row.email === String(teacherEmail || '').trim().toLowerCase());
  const updatePupil = (index, field, value) => setPupils((current) => current.map((pupil, i) => i === index ? { ...pupil, [field]: value } : pupil));
  return (
    <Modal wide icon="➕" title={`Add pupils to ${cls.name}`} onClose={onClose}
      footer={<><button className="cr-btn" onClick={onClose}>Cancel</button><button className="cr-btn cr-btn--primary" disabled={!rows.length || incompleteRows || invalidEmails || includesTeacher} onClick={() => onAdd(rows)}>Add {rows.length || ''} pupil{rows.length === 1 ? '' : 's'}</button></>}>
      <p className="cr-muted" style={{ marginTop: 0, fontSize: 13.5, lineHeight: 1.5 }}>
        Enter each pupil’s name and their own school email. Adding them assigns one of your school’s pupil places.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '42px minmax(0,1fr) minmax(0,1fr)', gap: '8px 12px', alignItems: 'center', maxHeight: 'min(52vh, 520px)', overflowY: 'auto', padding: '2px 8px 2px 2px' }}>
        <span className="cr-label" style={{ margin: 0 }}>#</span>
        <span className="cr-label" style={{ margin: 0 }}>Pupil name</span>
        <span className="cr-label" style={{ margin: 0 }}>School email</span>
        {pupils.map((pupil, index) => (
          <React.Fragment key={index}>
            <span aria-hidden="true" className="cr-muted" style={{ textAlign: 'center', fontSize: 12 }}>{index + 1}</span>
            <input className="cr-input" aria-label={`Pupil ${index + 1} name`} autoComplete="off" value={pupil.name} onChange={(e) => updatePupil(index, 'name', e.target.value)} placeholder="e.g. Amira Khan" />
            <input className="cr-input" aria-label={`Pupil ${index + 1} school email`} type="email" autoComplete="off" value={pupil.email} onChange={(e) => updatePupil(index, 'email', e.target.value)} placeholder="e.g. amira@school.org" />
          </React.Fragment>
        ))}
      </div>
      <div className="cr-muted" style={{ fontSize: 12.5, marginTop: 10 }}>{rows.length} of 30 pupils entered. Pupils choose Student, sign in with the Google account matching the school email entered here, then enter your class code.</div>
      {incompleteRows && <div className="cr-note cr-note--warn" role="alert" style={{ marginTop: 10 }}>Fill in both the name and school email for every row you started.</div>}
      {invalidEmails && <div className="cr-note cr-note--warn" role="alert" style={{ marginTop: 10 }}>Check that each school email address is valid.</div>}
      {includesTeacher && <div className="cr-note cr-note--warn" role="alert" style={{ marginTop: 10 }}>
        This is your teacher sign-in email. Enter each pupil’s own school email instead; a teacher account can’t also be added as a pupil.
      </div>}
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
  const { user, accountLicense } = useUser();
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
  useEffect(() => {
    if (subPath !== 'add') return;
    setTab('pupils');
    setModal(classes.length ? { type: 'add' } : { type: 'create', addPupilsAfter: true });
  }, [subPath, classes.length]);

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
  const pupilSeatLimit = Number(accountLicense?.studentLimit) || 0;
  const pupilSeatsUsed = Array.isArray(accountLicense?.pupilEmails) ? accountLicense.pupilEmails.length : 0;
  const pupilSeatsLeft = Math.max(0, pupilSeatLimit - pupilSeatsUsed);

  /**
   * Give imported pupils a sign-in place on the teacher's licence, so they can log in straight away.
   * Pupils who already have a place are skipped; a missing email or a full licence never blocks the import.
   */
  const givePlaces = async (students) => {
    const lower = (e) => String(e || '').trim().toLowerCase();
    const teacherEmail = lower(user.email);
    const assigned = new Set((accountLicense?.pupilEmails || []).map(lower));
    const valid = (students || []).filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower(s.email)) && lower(s.email) !== teacherEmail);
    const noEmail = (students || []).length - valid.length;
    const missing = [...new Map(valid.filter((s) => !assigned.has(lower(s.email))).map((s) => [lower(s.email), { ...s, email: lower(s.email) }])).values()];
    const result = { given: 0, waiting: 0, noEmail, error: '' };
    if (!missing.length) return result;
    if (!pupilSeatLimit) return { ...result, waiting: missing.length, error: 'Your school’s pupil places haven’t been set up yet — ask your administrator.' };
    const fit = missing.slice(0, pupilSeatsLeft);
    result.waiting = missing.length - fit.length;
    for (let i = 0; i < fit.length; i += 200) {
      try { result.given += (await provisionPupilLicenses(fit.slice(i, i + 200))).length; } catch (error) {
        result.waiting += fit.length - i; result.error = error?.message || 'Could not assign pupil places.'; break;
      }
    }
    return result;
  };
  const placesNote = (r) => [
    r.given ? `${r.given} pupil${r.given === 1 ? '' : 's'} can now sign in` : '',
    r.waiting ? `${r.waiting} still need a place${r.error ? ` (${r.error})` : ' — your licence is full'}` : '',
    r.noEmail ? `${r.noEmail} had no email in Google Classroom` : '',
  ].filter(Boolean).join(' · ');

  /* Actions */
  const createClass = async ({ name, year, color }, addPupilsAfter = false) => {
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
    if (addPupilsAfter) setModal({ type: 'add' });
  };

  const importCourse = async (course, students) => {
    const places = await givePlaces(students);
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
    return placesNote(places);
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
    const places = await givePlaces(students);
    const merged = mergeRoster(c.students || [], students);
    const patch = { gcCourseId: course.id, gcCourseName: course.name, gcLink: course.link, students: merged, rosterEmails: merged.map((s) => (s.email || '').toLowerCase()).filter(Boolean) };
    persistClasses((p) => p.map((x) => (x.id === c.id ? { ...x, ...patch } : x)));
    setLive((l) => (l?.id === c.id ? { ...l, ...patch } : l));
    await saveClass({ ...c, ...patch });
    return placesNote(places);
  };

  const refreshRoster = async (c, students) => {
    const places = await givePlaces(students);
    const merged = mergeRoster(c.students || [], students);
    await updateRoster(c.id, merged);
    persistClasses((p) => p.map((x) => (x.id === c.id ? { ...x, students: merged } : x)));
    setLive((l) => (l?.id === c.id ? { ...l, students: merged } : l));
    return { count: merged.length, note: placesNote(places) };
  };

  // Pupils on the teacher's class lists who have no sign-in place yet — e.g. imported from
  // Google Classroom before imports gave out places. They are shown in a notice and given a
  // place automatically. (Retries whenever the class lists finish loading or change.)
  const lowerEmail = (e) => String(e || '').trim().toLowerCase();
  const withoutPlace = useMemo(() => {
    if (!accountLicense || accountLicense.role !== 'teacher') return [];
    const assigned = new Set((accountLicense.pupilEmails || []).map(lowerEmail));
    const me = lowerEmail(user.email);
    const seen = new Map();
    classes.forEach((c) => (c.students || []).forEach((st) => {
      const e = lowerEmail(st.email);
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e !== me && !assigned.has(e)) seen.set(e, { ...st, email: e });
    }));
    return [...seen.values()];
  }, [classes, accountLicense, user.email]); // eslint-disable-line react-hooks/exhaustive-deps
  const [placesBusy, setPlacesBusy] = useState(false);
  const placesTried = useRef('');
  const catchUpPlaces = useCallback(async (manual = false) => {
    if (!withoutPlace.length || placesBusy) return;
    setPlacesBusy(true);
    try {
      const r = await givePlaces(withoutPlace);
      if (manual || r.given || r.waiting) toast(placesNote(r) || 'Every pupil already has a place');
    } catch (error) {
      if (manual) toast(error?.message || 'Could not assign pupil places.');
    } finally { setPlacesBusy(false); }
  }, [withoutPlace, placesBusy]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!pupilSeatLimit || !withoutPlace.length) return;
    const sig = withoutPlace.map((p) => p.email).sort().join(',');
    if (placesTried.current === sig) return;
    placesTried.current = sig;
    catchUpPlaces(false);
  }, [withoutPlace, pupilSeatLimit]); // eslint-disable-line react-hooks/exhaustive-deps

  const addPupils = async (rows) => {
    if (rows.some((row) => !row.email)) {
      toast('Add a school email for every pupil so they can use their licensed account.');
      return;
    }
    if (rows.some((row) => row.email.toLowerCase() === String(user.email || '').trim().toLowerCase())) {
      toast('Your teacher sign-in email cannot also be a pupil. Enter the pupil’s own school email.');
      return;
    }
    const existing = cls.students || [];
    const have = new Set(existing.map(pupilKey));
    const uniqueAdded = rows.map((r) => ({ id: r.email || r.name, name: r.name, email: r.email, joined: false })).filter((r) => !have.has(pupilKey(r)));
    const allocatedEmails = new Set(accountLicense?.pupilEmails || []);
    const needsPlace = uniqueAdded.filter((row) => !allocatedEmails.has(row.email));
    const placeAllowed = new Set((pupilSeatLimit ? needsPlace.slice(0, pupilSeatsLeft) : needsPlace).map((row) => row.email));
    const added = uniqueAdded.filter((row) => allocatedEmails.has(row.email) || placeAllowed.has(row.email));
    if (pupilSeatLimit && needsPlace.length > pupilSeatsLeft) toast(`Only ${pupilSeatsLeft} pupil place${pupilSeatsLeft === 1 ? '' : 's'} left on your school's licence`);
    if (!added.length && uniqueAdded.length) { setModal(null); return; }
    let newlyLicensed = [];
    try {
      newlyLicensed = await provisionPupilLicenses(added);
    } catch (error) {
      toast(error?.message || 'Could not assign pupil places. Check your school licence and try again.');
      return;
    }
    const next = [...existing, ...added];
    await updateRoster(cls.id, next);
    persistClasses((p) => p.map((x) => (x.id === cls.id ? { ...x, students: next } : x)));
    setLive((l) => (l ? { ...l, students: next } : l));
    setModal(null);
    toast(`Added ${added.length} pupil${added.length === 1 ? '' : 's'} · ${newlyLicensed.length} new place${newlyLicensed.length === 1 ? '' : 's'} assigned`);
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

  const archiveClass = async (c = cls) => {
    if (!window.confirm(`Archive ${c.name}? Pupils will no longer see it. You can restore it from Manage classes.`)) return;
    await saveClass({ ...c, archived: true });
    rememberArchived(c, true);
    persistClasses((p) => p.filter((x) => x.id !== c.id));
    if (c.id === cls?.id) setSelId(null);
    toast(`${c.name} archived`);
  };
  const restoreClass = async (c) => {
    const back = { ...c, archived: false };
    await saveClass(back);
    rememberArchived(c, false);
    persistClasses((p) => [...p.filter((x) => x.id !== c.id), back]);
    toast(`${c.name} is back`);
  };
  /** Delete a class for good (after a clear warning). */
  const removeClass = async (c = cls) => {
    const n = (c.students || []).length;
    if (!window.confirm(`Delete ${c.name} for good?\n\nIts pupil list${n ? ` (${n} pupil${n === 1 ? '' : 's'})` : ''}, posts, hand-ins and the work set for it will be removed. This can’t be undone.\n\nPupils keep their ByteBuddies sign-in.`)) return;
    try {
      await deleteClass(c.id);
    } catch (e) {
      toast('Could not delete the class — check your connection and try again.');
      return;
    }
    persistClasses((p) => p.filter((x) => x.id !== c.id));
    if (c.id === cls?.id) setSelId(null);
    toast(`${c.name} deleted`);
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
    // Google Classroom copy goes through Google's own Share page (opened straight from the click,
    // so it isn't blocked). It needs no extra Classroom permission — ByteBuddies never posts
    // announcements through the API.
    const shareGc = postGc && cls.gcCourseId;
    if (shareGc) {
      openShareToClassroom({ url: appLink('classroom'), title: `${cls.name} — update`, body: text, itemtype: 'announcement', courseId: cls.gcCourseId });
    }
    setLive((l) => (l ? { ...l, announcements: [...(l.announcements || []), p] } : l));
    setPost('');
    await postAnnouncement(cls.id, p);
    toast(shareGc ? 'Posted to your class — finish posting in the Google Classroom window' : 'Posted to your class');
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
      if (project.levels) localStorage.setItem('cv_gamebuilder_levels', JSON.stringify(project.levels));
      if (project.gameMode !== undefined) localStorage.setItem('bb_gb_game_mode', JSON.stringify(project.gameMode));
      if (project.backdrops) localStorage.setItem('cv_gamebuilder_backdrops', JSON.stringify(project.backdrops));
      if (project.customBackdrops) localStorage.setItem('cv_gamebuilder_custom_bgs', JSON.stringify(project.customBackdrops));
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
        <div className="cr-muted" style={{ fontWeight: 700, fontSize: 13 }}><EmojiIcon e="👩‍🏫" style={{ marginRight: '0.35em' }} />{user.name || 'Teacher'}</div>
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
        <div className="cr-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14, border: '1px solid rgba(99,102,241,.38)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900 }}><EmojiIcon e="🎟️" style={{ marginRight: '0.35em' }} />Pupil places</div>
            <div className="cr-muted" style={{ fontSize: 13, marginTop: 4 }}>
              {pupilSeatLimit ? `0 of ${pupilSeatLimit} places used · ${pupilSeatLimit} available` : 'Your school’s pupil places will appear here once your administrator sets them.'}
            </div>
          </div>
          <div className="cr-row" style={{ gap: 8 }}>
            <button className="cr-btn" onClick={() => setModal({ type: 'create' })}><EmojiIcon e="🏫" style={{ marginRight: '0.35em' }} />New class</button>
            <button className="cr-btn cr-btn--primary" disabled={pupilSeatLimit > 0 && pupilSeatsLeft < 1}
              onClick={() => setModal({ type: 'create', addPupilsAfter: true })}><EmojiIcon e="➕" style={{ marginRight: '0.35em' }} />Add pupils</button>
          </div>
        </div>
        {modal?.type === 'create' && <CreateClassModal onClose={() => setModal(null)} addPupilsAfter={modal.addPupilsAfter}
          onCreate={(data) => createClass(data, modal.addPupilsAfter)} />}
        {modal?.type === 'add' && cls && <AddPupilsModal cls={cls} teacherEmail={user.email} onClose={() => setModal(null)} onAdd={addPupils} />}
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
                <span style={{ fontSize: 40 }}><EmojiIcon e="🏫" /></span>
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

      <div className="cr-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14, border: '1px solid rgba(99,102,241,.38)' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 900 }}><EmojiIcon e="🎟️" style={{ marginRight: '0.35em' }} />Pupil places</div>
          <div className="cr-muted" style={{ fontSize: 13, marginTop: 4 }}>
      {pupilSeatLimit ? `${pupilSeatsUsed} of ${pupilSeatLimit} places used · ${pupilSeatsLeft} available` : 'Your school’s pupil places will appear here once your administrator sets them.'}
          </div>
        </div>
        <button className="cr-btn cr-btn--primary" onClick={() => { setTab('pupils'); setModal({ type: 'add' }); }} disabled={pupilSeatLimit > 0 && pupilSeatsLeft < 1}><EmojiIcon e="➕" style={{ marginRight: '0.35em' }} />Add pupils</button>
      </div>

      {withoutPlace.length > 0 && (
        <div className="cr-card" role="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 14, border: '1px solid rgba(245,158,11,.55)', background: 'rgba(245,158,11,.08)' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 900 }}><EmojiIcon e="⚠️" style={{ marginRight: '0.35em' }} />{withoutPlace.length} pupil{withoutPlace.length === 1 ? '' : 's'} can’t sign in yet</div>
            <div className="cr-muted" style={{ fontSize: 13, marginTop: 4 }}>
              {!pupilSeatLimit
                ? 'Your school’s pupil places haven’t been set up yet — ask your ByteBuddies administrator to add places to your licence.'
                : pupilSeatsLeft < withoutPlace.length
                  ? `They need a pupil place on your licence, but only ${pupilSeatsLeft} ${pupilSeatsLeft === 1 ? 'is' : 'are'} left — ask your administrator for more places.`
                  : 'They are on your class lists but don’t have a pupil place on your licence yet.'}
              {' '}<span title={withoutPlace.map((p) => p.email).join(', ')}>({withoutPlace.slice(0, 3).map((p) => p.name || p.email).join(', ')}{withoutPlace.length > 3 ? ` and ${withoutPlace.length - 3} more` : ''})</span>
            </div>
          </div>
          <button className="cr-btn cr-btn--primary" disabled={placesBusy || !pupilSeatLimit || pupilSeatsLeft < 1} onClick={() => catchUpPlaces(true)}>
            <EmojiIcon e="🎟️" style={{ marginRight: '0.35em' }} />{placesBusy ? 'Giving places…' : 'Give them places'}
          </button>
        </div>
      )}

      {modal?.type === 'create' && <CreateClassModal onClose={() => setModal(null)} onCreate={createClass} />}
      {modal?.type === 'invite' && <InviteModal cls={cls} onClose={() => setModal(null)} toast={toast} />}
      {modal?.type === 'add' && <AddPupilsModal cls={cls} teacherEmail={user.email} onClose={() => setModal(null)} onAdd={addPupils} />}
      {modal?.type === 'setwork' && <SetWorkModal cls={cls} onClose={() => setModal(null)} onCreate={setWork} />}
      {modal?.type === 'mark' && (
        <MarkModal cls={cls} assignment={modal.a} pupil={modal.pupil} sub={modal.sub} onClose={() => setModal(null)}
          onSave={(m) => saveMark(modal.a, modal.pupil, modal.sub, m)} onOpenProject={openProject} />
      )}

      {modal?.type === 'manage' && (
        <ManageClassesModal teacherEmail={user.email} current={cls?.id} onClose={() => setModal(null)}
          onOpen={(c) => { setSelId(c.id); setModal(null); }}
          onArchive={(c) => archiveClass(c)} onRestore={restoreClass} onDelete={(c) => removeClass(c)} />
      )}
      <div className="cr-pills" style={{ marginBottom: 14 }}>
        {classes.length > 1 && classes.map((c) => (
          <button key={c.id} className="cr-pill" aria-pressed={c.id === cls.id} onClick={() => setSelId(c.id)}>
            <span className="cr-dot" style={{ background: c.color || '#6366f1' }} /> {c.name}
          </button>
        ))}
        <button className="cr-pill" onClick={() => setModal({ type: 'manage' })} title="Open, archive, restore or delete classes"><EmojiIcon e="🗂️" style={{ marginRight: '0.35em' }} />Manage classes</button>
      </div>

      <div className="cr-banner" style={{ background: classGradient(cls.color || '#6366f1') }}>
        <div className="cr-row" style={{ alignItems: 'flex-start', gap: 16 }}>
          <div className="cr-grow">
            <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.85 }}>{[cls.grade, cls.subject].filter(Boolean).join(' · ') || 'Computing'}</div>
            <h2>{cls.name}</h2>
            <div className="cr-row" style={{ marginTop: 10, fontSize: 13.5, fontWeight: 700, opacity: 0.95 }}>
              <span><EmojiIcon e="👥" style={{ marginRight: '0.35em' }} />{roster.length} pupil{roster.length === 1 ? '' : 's'}</span>
              <span><EmojiIcon e="📋" style={{ marginRight: '0.35em' }} />{assignments.length} piece{assignments.length === 1 ? '' : 's'} of work</span>
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
          <button className="cr-btn cr-btn--sm" onClick={() => setModal({ type: 'invite' })}><EmojiIcon e="👋" style={{ marginRight: '0.35em' }} />Invite pupils</button>
          <button className="cr-btn cr-btn--sm" onClick={() => onNavigate?.('learn')}><EmojiIcon e="📚" style={{ marginRight: '0.35em' }} />Teach a lesson</button>
          {gcLinked && cls.gcLink && <a className="cr-btn cr-btn--sm" href={cls.gcLink} target="_blank" rel="noopener noreferrer">Open in Google Classroom ↗</a>}
          <span className="cr-grow" />
          <button className="cr-btn cr-btn--sm" onClick={() => removeClass(cls)} title="Delete this class"><EmojiIcon e="🗑" style={{ marginRight: '0.35em' }} />Delete class</button>
        </div>
      </div>

      <div className="cr-stats">
        <button className="cr-stat" onClick={() => setTab('pupils')}>
          <b>{activeThisWeek}<small> / {roster.length}</small></b><span><EmojiIcon e="👥" style={{ marginRight: '0.35em' }} />Active this week</span>
        </button>
        <button className="cr-stat" onClick={() => setTab('marking')} data-hot={needsMarking > 0 || undefined} style={{ '--tone': '#6366f1' }}>
          <b>{needsMarking}</b><span><EmojiIcon e="🖍️" style={{ marginRight: '0.35em' }} />Waiting to mark</span>
        </button>
        <button className="cr-stat" onClick={() => setTab('stream')} data-hot={openHelp.length > 0 || undefined} style={{ '--tone': '#f59e0b' }}>
          <b>{openHelp.length}</b><span><EmojiIcon e="🙋" style={{ marginRight: '0.35em' }} />Asking for help</span>
        </button>
        <button className="cr-stat" onClick={() => setTab('pupils')} data-hot={missingCount > 0 || undefined} style={{ '--tone': '#ef4444' }}>
          <b>{missingCount}</b><span><EmojiIcon e="⏰" style={{ marginRight: '0.35em' }} />Missing work</span>
        </button>
      </div>

      {openHelp.length > 0 && tab !== 'stream' && (
        <button className="cr-note cr-note--warn" style={{ width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 14, color: 'inherit', font: 'inherit' }} onClick={() => setTab('stream')}>
          <EmojiIcon e="🙋" style={{ marginRight: '0.4em' }} /><b>{openHelp.length} pupil{openHelp.length === 1 ? '' : 's'} asked for help</b> — {openHelp.map((h) => h.name).slice(0, 3).join(', ')}. Tap to see.
        </button>
      )}

      <div className="cr-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" className="cr-tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.icon && <GoogleClassroomLogo size={16} />} <IconText>{t.label}</IconText> {t.badge > 0 && <span className="cr-badge">{t.badge}</span>}
          </button>
        ))}
      </div>

      <GcErrorNote error={gcError} />

      {/* ── Classwork ── */}
      {tab === 'classwork' && (
        <div>
          {assignments.length === 0 ? (
            <div className="cr-card cr-empty">
              <div className="cr-big"><EmojiIcon e="📋" /></div>
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
                    <span><EmojiIcon e="📅" style={{ marginRight: '0.35em' }} />{dueLabel(a.dueDate)}</span>
                    <span><EmojiIcon e="🏅" style={{ marginRight: '0.35em' }} />{a.points || 10} points</span>
                    <span><EmojiIcon e="✅" style={{ marginRight: '0.35em' }} />{finished}/{roster.length} finished</span>
                    {counts.handed > 0 && <span style={{ color: '#6366f1', fontWeight: 700 }}><EmojiIcon e="🖍️" style={{ marginRight: '0.35em' }} />{counts.handed} to mark</span>}
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
                  <button className="cr-btn cr-btn--sm cr-btn--ghost cr-btn--danger" onClick={() => deleteWork(a)} aria-label="Delete work"><EmojiIcon e="🗑️" /></button>
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
                {gcLinked && (
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
                    {p.pinned && <Chip color="#6366f1"><EmojiIcon e="📌" style={{ marginRight: '0.35em' }} />Pinned</Chip>}
                    <span style={{ marginLeft: 'auto' }} className="cr-row">
                      <button className="cr-btn cr-btn--sm cr-btn--ghost" onClick={() => editPosts((l) => l.map((x) => (x.id === p.id ? { ...x, pinned: !x.pinned } : x)))}><IconText>{p.pinned ? 'Unpin' : '📌'}</IconText></button>
                      <button className="cr-btn cr-btn--sm cr-btn--ghost" aria-label="Delete post" onClick={() => editPosts((l) => l.filter((x) => x.id !== p.id))}><EmojiIcon e="🗑️" /></button>
                    </span>
                  </div>
                  <p>{p.text}</p>
                </div>
              </div>
            ))}
            {!(cls.announcements || []).length && <div className="cr-empty">Nothing posted yet. Say hello to your class!</div>}
          </div>
          <div className="cr-card">
            <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 10 }}><EmojiIcon e="🙋" style={{ marginRight: '0.35em' }} />Help requests</h3>
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
            <button className="cr-btn cr-btn--sm" onClick={() => setModal({ type: 'add' })}><EmojiIcon e="➕" style={{ marginRight: '0.35em' }} />Add pupils</button>
            <button className="cr-btn cr-btn--sm" onClick={() => setModal({ type: 'invite' })}><EmojiIcon e="👋" style={{ marginRight: '0.35em' }} />Invite</button>
            <button className="cr-btn cr-btn--sm" onClick={() => printReport(cls, roster, assignments, statusOf, user)}><EmojiIcon e="📄" style={{ marginRight: '0.35em' }} />Report</button>
          </div>
          {roster.length === 0 ? (
            <div className="cr-empty"><div className="cr-big"><EmojiIcon e="👥" /></div>No pupils yet — share the class code <b>{cls.inviteCode}</b> or add them by name.</div>
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
                    {assignments.slice(0, 8).map((a) => <th key={a.id} title={a.title} style={{ textAlign: 'center' }}><IconText>{a.emoji || '📋'}</IconText></th>)}
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
                      <td><EmojiIcon e="⚡" color="#f59e0b" style={{ marginRight: 3 }} />{p.progress?.xp || 0}</td>
                      {assignments.slice(0, 8).map((a) => {
                        const st = STATUS[statusOf(a, p)];
                        return (
                          <td key={a.id} style={{ textAlign: 'center' }}>
                            <button className="cr-cell" title={`${a.title}: ${st.label}`} style={{ background: `${st.color}22`, border: 'none', cursor: 'pointer' }}
                              onClick={() => setModal({ type: 'mark', a, pupil: p, sub: findSub(subs, a.id, p.key) })}><EmojiIcon e={st.icon} /></button>
                          </td>
                        );
                      })}
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <button className="cr-btn cr-btn--sm cr-btn--ghost" onClick={() => renamePupil(p)} aria-label={`Rename ${p.name}`}><EmojiIcon e="✏️" /></button>
                        <button className="cr-btn cr-btn--sm cr-btn--ghost" onClick={() => removePupil(p)} aria-label={`Remove ${p.name}`}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="cr-row" style={{ marginTop: 12, gap: 14, fontSize: 12 }}>
                {Object.entries(STATUS).map(([k, s]) => <span key={k} className="cr-muted"><EmojiIcon e={s.icon} style={{ marginRight: '0.35em' }} />{s.label}</span>)}
              </div>
            </div>
          )}
          <div className="cr-row" style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
            <span className="cr-muted cr-grow" style={{ fontSize: 12.5 }}>Finished with this class at the end of the year?</span>
            <button className="cr-btn cr-btn--sm cr-btn--ghost" onClick={() => archiveClass(cls)}>Archive class</button>
            <button className="cr-btn cr-btn--sm cr-btn--danger" onClick={() => removeClass(cls)}><EmojiIcon e="🗑" style={{ marginRight: '0.35em' }} />Delete class</button>
          </div>
        </div>
      )}

      {/* ── Marking ── */}
      {tab === 'marking' && (
        assignments.length === 0 ? (
          <div className="cr-card cr-empty"><div className="cr-big"><EmojiIcon e="🖍️" /></div>Set some work first — hand-ins will appear here.</div>
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
                  <Chip color={st.color}><EmojiIcon e={st.icon} style={{ marginRight: '0.35em' }} />{st.label}</Chip>
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
