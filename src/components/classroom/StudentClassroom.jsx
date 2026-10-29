import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import {
  fetchClass, fetchAssignments, findClassByCode, findClassesForEmail, findClassByGoogleCourse, joinClass,
  pushMyProgress, syncMyWork, readMyProgress, handIn, unsubmit, raiseHand, shrinkImage,
  findSub, pupilId, statusFor, STATUS, dueLabel,
} from '../../utils/classroomStore.js';
import { workForAssignment, workImage } from '../../utils/workLog.js';
import { connectGoogleClassroom, getGcSession, listCourses, listMyByteBuddiesWork } from '../../utils/googleClassroom.js';
import { Modal, Avatar, Chip, GoogleClassroomLogo, GoogleG, useToast, timeAgo, classGradient } from './ui.jsx';
import { KIND_META, openHash } from './assignables.js';
import { GcErrorNote } from './GooglePanel.jsx';
import { EmojiIcon, IconText } from '../ui/Icon.jsx';

function normAssignment(a) {
  if (a.kind) return a;
  if (a.assignType === 'blocks') return { ...a, kind: 'activity', target: { activity: 'gamebuilder' }, hash: 'gamebuilder', emoji: '🎮', handIn: 'project' };
  return { ...a, kind: 'task', target: {}, hash: 'classroom', emoji: '✏️', handIn: 'work' };
}

function hashParams() {
  const q = (window.location.hash.split('?')[1] || '');
  return new URLSearchParams(q);
}

/* ─── Hand-in ─── */

function HandInModal({ a, existing, onClose, onSend }) {
  const isCode = a.kind === 'activity' && ['robot', 'workspace'].includes(a.target?.activity);
  const [answer, setAnswer] = useState(existing?.answer || '');
  const [code, setCode] = useState(existing?.code && !existing.code.startsWith('{') ? existing.code : '');
  const [link, setLink] = useState(existing?.link || '');
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);
  const work = useMemo(() => workForAssignment(a), [a]);
  const workPic = useMemo(() => workImage(a), [a]);

  const pick = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try { setImage(await shrinkImage(f)); } catch { setErr('That picture could not be opened. Try a PNG or JPG.'); }
  };
  const ok = answer.trim() || code.trim() || link.trim() || image || work;

  const send = async () => {
    setBusy(true);
    setErr('');
    try {
      const pic = image || workPic;
      await onSend({
        answer: answer.trim(), code: code.trim(), link: link.trim(),
        ...(work ? { work } : {}),
        ...(pic ? { file: { image: pic } } : {}),
      });
    } catch (e) {
      setErr('Could not hand in — check your internet and try again.');
      setBusy(false);
    }
  };

  return (
    <Modal icon="📤" title={`Hand in: ${a.title}`} onClose={onClose}
      footer={<><button className="cr-btn" onClick={onClose}>Not yet</button><button className="cr-btn cr-btn--green" disabled={!ok || busy} onClick={send}><IconText>{busy ? 'Handing in…' : '📤 Hand in'}</IconText></button></>}>
      <div style={{ display: 'grid', gap: 12 }}>
        {a.description && <div className="cr-note cr-note--info">{a.description}</div>}
        {work && (
          <div className="cr-note cr-note--ok">
            <EmojiIcon e="✅" style={{ marginRight: '0.35em' }} />Your work from <b>{work.title || 'ByteBuddies'}</b> will be sent too
            {work.blocks?.length ? ` (${work.blocks.length} blocks of code)` : ''}.
          </div>
        )}
        <div>
          <label className="cr-label" htmlFor="hi-a">{a.kind === 'task' ? 'Your answer' : 'Tell your teacher what you made'}</label>
          <textarea id="hi-a" className="cr-input" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="I made… The tricky bit was… Next time I would…" />
        </div>
        {(isCode || a.kind === 'task') && (
          <div>
            <label className="cr-label" htmlFor="hi-c">Paste your code (optional)</label>
            <textarea id="hi-c" className="cr-input" style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13 }} value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
        )}
        <div className="cr-row" style={{ gap: 10 }}>
          <button className="cr-btn cr-btn--sm" onClick={() => fileRef.current?.click()}>📸 {image ? 'Change photo' : 'Add a photo or screenshot'}</button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={pick} />
          <input className="cr-input cr-grow" style={{ minWidth: 180 }} value={link} onChange={(e) => setLink(e.target.value)} placeholder="🔗 Or paste a link (optional)" aria-label="Link to your work" />
        </div>
        {image && <img src={image} alt="Your upload" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 12, justifySelf: 'start' }} />}
        {err && <div className="cr-note cr-note--err">{err}</div>}
      </div>
    </Modal>
  );
}

/* ─── Join ─── */

function JoinScreen({ user, onJoined, toast }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [found, setFound] = useState([]);
  const [gcErr, setGcErr] = useState(null);

  useEffect(() => { findClassesForEmail(user.email).then(setFound); }, [user.email]);

  const tryCode = async () => {
    const c = code.trim().toUpperCase();
    if (c.length < 4) return;
    setBusy('code');
    setErr('');
    const cls = await findClassByCode(c);
    if (!cls) { setErr('We could not find that class. Check the code with your teacher.'); setBusy(''); return; }
    await onJoined(cls);
    setBusy('');
  };

  const viaGoogle = async () => {
    setGcErr(null);
    setBusy('google');
    try {
      const s = await connectGoogleClassroom('student');
      const byEmail = await findClassesForEmail(s.email);
      if (byEmail[0]) { await onJoined(byEmail[0]); setBusy(''); return; }
      const courses = await listCourses('student');
      for (const c of courses) {
        const cls = await findClassByGoogleCourse(c.id);
        if (cls) { await onJoined(cls); setBusy(''); return; }
      }
      toast('No ByteBuddies class found yet — ask your teacher for the class code.');
    } catch (e) { setGcErr(e); }
    setBusy('');
  };

  return (
    <div className="cr-join">
      <div style={{ fontSize: 60 }}><EmojiIcon e="🏫" /></div>
      <h1 className="cr-title" style={{ margin: '6px 0 6px' }}>Join your class</h1>
      <p className="cr-muted" style={{ margin: '0 0 22px', fontSize: 15 }}>Type the code your teacher gave you.</p>

      {found.length > 0 && (
        <div className="cr-card" style={{ marginBottom: 16, textAlign: 'left' }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}><EmojiIcon e="🎉" style={{ marginRight: '0.35em' }} />Your teacher added you!</div>
          {found.map((c) => (
            <div key={c.id} className="cr-row" style={{ marginTop: 6 }}>
              <span className="cr-dot" style={{ background: c.color || '#6366f1' }} />
              <b className="cr-grow">{c.name}</b>
              <button className="cr-btn cr-btn--green cr-btn--sm" onClick={() => onJoined(c)}>Join</button>
            </div>
          ))}
        </div>
      )}

      <div className="cr-card">
        <input className="cr-input cr-join__code" maxLength={8} value={code} placeholder="ABC123" aria-label="Class code"
          onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setErr(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') tryCode(); }} />
        {err && <div className="cr-note cr-note--err" style={{ marginTop: 10 }}>{err}</div>}
        <button className="cr-btn cr-btn--primary cr-btn--lg" style={{ width: '100%', marginTop: 12 }} disabled={code.length < 4 || busy === 'code'} onClick={tryCode}>
          {busy === 'code' ? 'Finding your class…' : 'Join class →'}
        </button>
        <div className="cr-row" style={{ margin: '16px 0', gap: 10 }}>
          <span style={{ flex: 1, height: 1, background: 'var(--border-color)' }} /><span className="cr-muted" style={{ fontSize: 12, fontWeight: 700 }}>OR</span><span style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
        </div>
        <button className="cr-btn cr-btn--google" style={{ width: '100%' }} disabled={busy === 'google'} onClick={viaGoogle}>
          <GoogleG /> {busy === 'google' ? 'Checking Google Classroom…' : 'Find my class with Google Classroom'}
        </button>
        <GcErrorNote error={gcErr} />
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function StudentClassroom() {
  const { user, setUser } = useUser();
  const [cls, setCls] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [tab, setTab] = useState('todo');
  const [handing, setHanding] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpMsg, setHelpMsg] = useState('');
  const [focusId, setFocusId] = useState(() => hashParams().get('assign'));
  const [gcWork, setGcWork] = useState(null);
  const [gcErr, setGcErr] = useState(null);
  const [toastEl, toast] = useToast();
  const me = pupilId(user);
  const progress = useMemo(() => readMyProgress(), [cls]); // re-read whenever the class reloads

  const load = useCallback(async (id) => {
    if (!id) { setCls(null); setLoading(false); return null; }
    let [doc, asg] = await Promise.all([fetchClass(id), fetchAssignments(id)]);
    if (doc === undefined) {
      await new Promise((r) => setTimeout(r, 1500));
      [doc, asg] = await Promise.all([fetchClass(id), fetchAssignments(id)]);
    }
    if (doc === undefined) {
      setOffline(true);
      setLoading(false);
      return null;
    }
    setOffline(false);
    if (!doc || doc.archived) { setCls(null); setLoading(false); return null; }
    setCls(doc);
    setAssignments((asg || []).map(normAssignment).sort((a, b) => (a.dueDate || '9').localeCompare(b.dueDate || '9')));
    setLoading(false);
    return { doc, asg: asg || [] };
  }, []);

  const join = useCallback(async (c) => {
    const data = await joinClass(c, user);
    setUser((u) => ({ ...u, classroomId: c.id }));
    setCls(data);
    toast(`Welcome to ${c.name}! 🎉`);
    load(c.id);
  }, [user, setUser, load, toast]);

  // First load: a join link wins, then the saved class.
  useEffect(() => {
    (async () => {
      const code = hashParams().get('join');
      if (code) {
        const c = await findClassByCode(code);
        if (c && c.id !== user.classroomId) { await join(c); return; }
        if (!c && !user.classroomId) toast('That class link has expired — ask your teacher for the code.');
      }
      load(user.classroomId);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the teacher up to date, and tick off finished lessons/missions.
  useEffect(() => {
    if (!cls) return undefined;
    pushMyProgress(cls.id, user, { force: true });
    syncMyWork(cls.id, user, { force: true, cls, assignments });
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(cls.id); }, 30000);
    return () => clearInterval(t);
  }, [cls?.id, assignments.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`work-${focusId}`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => setFocusId(null), 4000); }
  }, [focusId, assignments.length]);

  const start = (a) => {
    if (a.kind === 'activity' && a.target?.activity === 'gamebuilder') {
      sessionStorage.setItem('bb-pending-assignment', JSON.stringify({ id: a.id, title: a.title, classId: cls.id }));
    }
    if (a.kind === 'task') { setHanding(a); return; }
    window.location.hash = openHash(a);
  };

  const sendHandIn = async (a, data) => {
    await handIn(cls.id, a, user, data);
    setHanding(null);
    toast('Handed in! 🎉 Your teacher can see it now.');
    load(cls.id);
  };

  const sendHelp = async () => {
    if (!helpMsg.trim()) return;
    await raiseHand(cls.id, user, helpMsg.trim());
    setHelpMsg('');
    setHelpOpen(false);
    toast('🙋 Your teacher has been told — they will be with you soon.');
  };

  const loadGcWork = async (connect) => {
    setGcErr(null);
    try {
      if (connect) await connectGoogleClassroom('student');
      const courses = await listCourses('student');
      setGcWork(await listMyByteBuddiesWork(courses));
    } catch (e) { setGcErr(e); }
  };

  if (loading) return <div className="cr"><div className="cr-empty">Loading your class…</div></div>;
  if (offline && !cls) {
    return (
      <div className="cr">
        <div className="cr-card cr-empty" style={{ maxWidth: 480, margin: '40px auto' }}>
          <div className="cr-big"><EmojiIcon e="📡" /></div>
          <b style={{ color: 'var(--text-primary)' }}>We can't reach your class right now.</b>
          <div style={{ margin: '6px 0 16px' }}>Check the internet connection and try again.</div>
          <button className="cr-btn cr-btn--primary" onClick={() => { setLoading(true); load(user.classroomId); }}>Try again</button>
        </div>
      </div>
    );
  }
  if (!cls) return <div className="cr">{toastEl}<JoinScreen user={user} onJoined={join} toast={toast} /></div>;

  const items = assignments.map((a) => {
    const sub = findSub(cls.submissions, a.id, me);
    return { a, sub, st: statusFor(a, sub, progress) };
  });
  const todo = items.filter((x) => x.st === 'todo' || x.st === 'late');
  const done = items.filter((x) => !(x.st === 'todo' || x.st === 'late'));
  const stars = items.filter((x) => x.sub?.grade != null).length;
  const posts = [...(cls.announcements || [])].sort((a, b) => (b.pinned - a.pinned) || b.createdAt.localeCompare(a.createdAt));
  const firstName = (user.name || 'there').split(' ')[0];

  const card = ({ a, sub, st }) => {
    const meta = KIND_META[a.kind] || KIND_META.task;
    const s = STATUS[st];
    const canHandIn = a.kind === 'task' || a.kind === 'activity';
    return (
      <div key={a.id} id={`work-${a.id}`} className="cr-work"
        style={{ borderLeftColor: s.color, ...(focusId === a.id ? { boxShadow: '0 0 0 3px var(--accent-primary)' } : {}) }}>
        <div className="cr-work__icon" style={{ background: `${meta.color}1f` }}>{a.emoji || meta.emoji}</div>
        <div className="cr-grow">
          <div className="cr-row" style={{ gap: 8 }}>
            <div className="cr-work__title">{a.title}</div>
            <Chip color={s.color}><EmojiIcon e={s.icon} style={{ marginRight: '0.35em' }} />{s.label}</Chip>
          </div>
          <div className="cr-work__meta">
            <span>{meta.emoji} {meta.label}</span>
            <span style={{ color: st === 'late' ? '#ef4444' : undefined, fontWeight: st === 'late' ? 800 : undefined }}><EmojiIcon e="📅" style={{ marginRight: '0.35em' }} />{dueLabel(a.dueDate)}</span>
            <span><EmojiIcon e="🏅" style={{ marginRight: '0.35em' }} />{a.points || 10} points</span>
          </div>
          {a.description && <div style={{ fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>{a.description}</div>}
          {(sub?.feedback || sub?.grade != null) && (
            <div className="cr-note cr-note--ok" style={{ marginTop: 10 }}>
              <div className="cr-row" style={{ gap: 8 }}>
                <span style={{ fontSize: 26 }}>{sub.sticker || '⭐'}</span>
                {sub.grade != null && <b style={{ fontSize: 16 }}>{sub.grade}/{a.points || 10}</b>}
                <span className="cr-muted" style={{ fontSize: 12 }}>from your teacher</span>
              </div>
              {sub.feedback && <div style={{ marginTop: 4, fontSize: 14 }}>“{sub.feedback}”</div>}
            </div>
          )}
        </div>
        <div className="cr-work__actions">
          {a.kind !== 'task' && (
            <button className={`cr-btn cr-btn--sm${st === 'todo' || st === 'late' ? ' cr-btn--primary' : ''}`} onClick={() => start(a)}>
              <IconText>{st === 'todo' || st === 'late' ? '▶ Start' : '↻ Open again'}</IconText>
            </button>
          )}
          {canHandIn && !sub?.grade && (
            sub && !sub.byTeacher
              ? <button className="cr-btn cr-btn--sm cr-btn--ghost" onClick={async () => { await unsubmit(cls.id, sub.id); load(cls.id); }}>Unsubmit</button>
              : <button className={`cr-btn cr-btn--sm${a.kind === 'task' ? ' cr-btn--primary' : ' cr-btn--green'}`} onClick={() => setHanding(a)}><EmojiIcon e="📤" style={{ marginRight: '0.35em' }} />Hand in</button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="cr">
      {toastEl}
      {handing && <HandInModal a={handing} existing={findSub(cls.submissions, handing.id, me)} onClose={() => setHanding(null)} onSend={(d) => sendHandIn(handing, d)} />}
      {helpOpen && (
        <Modal icon="🙋" title="Ask your teacher for help" onClose={() => setHelpOpen(false)}
          footer={<><button className="cr-btn" onClick={() => setHelpOpen(false)}>Cancel</button><button className="cr-btn cr-btn--green" disabled={!helpMsg.trim()} onClick={sendHelp}>Send</button></>}>
          <div className="cr-row" style={{ gap: 6, marginBottom: 10 }}>
            {['I am stuck on a step', 'My code will not run', 'I finished — what next?', 'My robot will not connect'].map((t) => (
              <button key={t} className="cr-btn cr-btn--sm" onClick={() => setHelpMsg(t)}>{t}</button>
            ))}
          </div>
          <textarea className="cr-input" autoFocus value={helpMsg} onChange={(e) => setHelpMsg(e.target.value)} placeholder="What do you need help with?" />
        </Modal>
      )}

      <div className="cr-banner" style={{ background: classGradient(cls.color || '#10b981') }}>
        <div className="cr-row" style={{ gap: 16 }}>
          <Avatar name={user.name} emoji={user.avatarEmoji} size={58} />
          <div className="cr-grow">
            <div style={{ fontSize: 13.5, fontWeight: 800, opacity: 0.9 }}>{cls.name}{cls.teacherName ? ` · ${cls.teacherName}` : ''}</div>
            <h2>Hi {firstName}! 👋</h2>
            <div style={{ marginTop: 4, fontSize: 15, opacity: 0.95 }}>
              {todo.length === 0 ? 'You are all caught up — amazing work! 🎉' : `You have ${todo.length} thing${todo.length === 1 ? '' : 's'} to do.`}
            </div>
          </div>
        </div>
      </div>

      <div className="cr-stats">
        <div className="cr-stat"><b style={{ color: '#f59e0b' }}>{todo.length}</b><span>To do</span></div>
        <div className="cr-stat"><b style={{ color: '#10b981' }}>{done.length}</b><span>Done</span></div>
        <div className="cr-stat"><b style={{ color: '#ec4899' }}>{stars}</b><span>Marked by teacher</span></div>
        <div className="cr-stat"><b style={{ color: '#6366f1' }}>⚡{user.xp || 0}</b><span>My XP</span></div>
      </div>

      <div className="cr-tabs" role="tablist">
        {[
          { id: 'todo', label: `📝 To do${todo.length ? ` (${todo.length})` : ''}` },
          { id: 'done', label: '✅ Done' },
          { id: 'stream', label: '📣 Class news' },
          { id: 'google', label: 'Google Classroom', icon: true },
        ].map((t) => (
          <button key={t.id} role="tab" className="cr-tab" aria-selected={tab === t.id} onClick={() => { setTab(t.id); if (t.id === 'google' && getGcSession() && !gcWork) loadGcWork(false); }}>
            {t.icon && <GoogleClassroomLogo size={16} />} {t.label}
          </button>
        ))}
      </div>

      {tab === 'todo' && (todo.length ? todo.map(card) : (
        <div className="cr-card cr-empty"><div className="cr-big"><EmojiIcon e="🌟" /></div><b style={{ color: 'var(--text-primary)' }}>Nothing to do right now!</b><div style={{ marginTop: 6 }}>Why not try a <a href="#missions">mission</a> or carry on with <a href="#learn">Learn</a>?</div></div>
      ))}
      {tab === 'done' && (done.length ? done.map(card) : <div className="cr-card cr-empty">Finished work will appear here.</div>)}

      {tab === 'stream' && (
        posts.length ? posts.map((p) => (
          <div key={p.id} className="cr-post">
            <Avatar name={p.author} size={38} />
            <div className="cr-post__body" style={p.pinned ? { borderColor: 'var(--accent-primary)' } : undefined}>
              <div className="cr-row" style={{ gap: 8 }}>
                <b style={{ fontSize: 14 }}>{p.author}</b>
                <span className="cr-muted" style={{ fontSize: 12 }}>{timeAgo(p.createdAt)}</span>
                {p.pinned && <Chip color="#6366f1"><EmojiIcon e="📌" style={{ marginRight: '0.35em' }} />Pinned</Chip>}
              </div>
              <p>{p.text}</p>
            </div>
          </div>
        )) : <div className="cr-card cr-empty"><div className="cr-big"><EmojiIcon e="📣" /></div>No class news yet.</div>
      )}

      {tab === 'google' && (
        <div className="cr-card">
          <div className="cr-row" style={{ gap: 14, marginBottom: 12 }}>
            <GoogleClassroomLogo size={40} />
            <div className="cr-grow">
              <h3 style={{ fontSize: 17, fontWeight: 900 }}>ByteBuddies work in Google Classroom</h3>
              <div className="cr-muted" style={{ fontSize: 13.5 }}>See coding work your teachers set in Google Classroom and open it here.</div>
            </div>
            {!gcWork && <button className="cr-btn cr-btn--google" onClick={() => loadGcWork(!getGcSession())}><GoogleG /> {getGcSession() ? 'Load my work' : 'Connect'}</button>}
          </div>
          <GcErrorNote error={gcErr} />
          {gcWork && gcWork.length === 0 && <div className="cr-muted">No ByteBuddies work in your Google Classroom classes yet.</div>}
          {gcWork && gcWork.map((w) => (
            <div key={w.id} className="cr-sub cr-row" style={{ marginTop: 8 }}>
              <div className="cr-grow">
                <div style={{ fontWeight: 800 }}>{w.title}</div>
                <div className="cr-muted" style={{ fontSize: 12.5 }}>{w.courseName}{w.due ? ` · ${dueLabel(w.due)}` : ''}</div>
              </div>
              <a className="cr-btn cr-btn--sm cr-btn--primary" href={w.link}><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Open</a>
              {w.gcLink && <a className="cr-btn cr-btn--sm" href={w.gcLink} target="_blank" rel="noopener noreferrer">Turn in ↗</a>}
            </div>
          ))}
        </div>
      )}

      <div className="cr-row" style={{ marginTop: 26, justifyContent: 'center' }}>
        <button className="cr-btn cr-btn--sm cr-btn--ghost" onClick={() => { if (window.confirm(`Leave ${cls.name}?`)) { setUser((u) => ({ ...u, classroomId: null })); setCls(null); } }}>
          Switch class
        </button>
      </div>

      <button className="cr-btn cr-btn--green cr-help-fab" onClick={() => setHelpOpen(true)}><EmojiIcon e="🙋" style={{ marginRight: '0.35em' }} />I need help</button>
    </div>
  );
}
