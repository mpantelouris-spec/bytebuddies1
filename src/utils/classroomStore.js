/**
 * Classroom data shared by the teacher and pupil pages.
 *
 * Firestore `classes/{id}` holds the class, its roster, stream posts,
 * help requests, pupil progress and hand-ins (all keyed maps so pupils can
 * write their own entry with a dot-path update). Assignments live in the
 * `assignments` collection. Teachers also keep a local copy (bb-classes /
 * bb-assignments) so the page opens instantly and works offline.
 */
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, arrayUnion, deleteField } from 'firebase/firestore';
import { db } from '../firebase';
import { workForAssignment } from './workLog.js';

export const safeKey = (s) => String(s || 'pupil').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
export const pupilId = (user) => safeKey(user?.email || user?.name || 'pupil');

// Class and assignment docs are open to signed-out visitors, so no extra sign-in is needed.
async function ensureAuth() {}

const readLocal = (k, fb) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? fb; } catch { return fb; } };
const writeLocal = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

export const localClasses = () => readLocal('bb-classes', []);

/* Demo mode (local dev server only): classes live in this browser instead of
   Firestore, so a sales demo or a recording never touches real school data. */
const DEMO = () => { try { return !!import.meta.env.DEV && localStorage.getItem('bb-demo') === '1'; } catch { return false; } };
const demoClass = (id) => readLocal('bb-classes', []).find((c) => c.id === id) || null;
const demoPatch = (id, fn) => writeLocal('bb-classes', readLocal('bb-classes', []).map((c) => (c.id === id ? fn(c) : c)));
export const localAssignments = () => readLocal('bb-assignments', []);
export const saveLocalClasses = (list) => writeLocal('bb-classes', list);
export const saveLocalAssignments = (list) => writeLocal('bb-assignments', list);

export function makeInviteCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => A[Math.floor(Math.random() * A.length)]).join('');
}

/* ─── Classes ─── */

export async function saveClass(cls) {
  if (DEMO()) return;
  await ensureAuth();
  const { assignments, ...rest } = cls;
  await setDoc(doc(db, 'classes', cls.id), { ...rest, inviteCode: cls.inviteCode.toUpperCase() }, { merge: true });
}

export async function fetchClass(id) {
  if (DEMO()) return demoClass(id);
  await ensureAuth();
  try {
    const snap = await getDoc(doc(db, 'classes', id));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn('[classroom] fetchClass', e);
    return undefined; // could not reach Firestore (null means the class does not exist)
  }
}

export async function fetchTeacherClasses(email) {
  if (DEMO()) return [];
  if (!email) return [];
  await ensureAuth();
  try {
    const snap = await getDocs(query(collection(db, 'classes'), where('teacherEmail', '==', email)));
    return snap.docs.map((d) => d.data()).filter((c) => !c.archived);
  } catch (e) {
    console.warn('[classroom] fetchTeacherClasses', e);
    return [];
  }
}

/** Archived classes are kept on this device too, so Manage classes can show them offline. */
export const localArchivedClasses = () => readLocal('bb-classes-archived', []);
export function rememberArchived(cls, archived) {
  const rest = readLocal('bb-classes-archived', []).filter((c) => c.id !== cls.id);
  writeLocal('bb-classes-archived', archived ? [...rest, { ...cls, archived: true }] : rest);
}

/** Archived classes too — for the teacher's Manage classes list (restore or delete). */
export async function fetchAllTeacherClasses(email) {
  if (DEMO() || !email) return readLocal('bb-classes', []);
  await ensureAuth();
  try {
    const snap = await getDocs(query(collection(db, 'classes'), where('teacherEmail', '==', email)));
    return snap.docs.map((d) => d.data());
  } catch (e) {
    console.warn('[classroom] fetchAllTeacherClasses', e);
    return [];
  }
}

/** Delete a class for good: the class (roster, posts, hand-ins) and the work set for it. */
export async function deleteClass(id) {
  writeLocal('bb-classes', readLocal('bb-classes', []).filter((c) => c.id !== id));
  writeLocal('bb-classes-archived', readLocal('bb-classes-archived', []).filter((c) => c.id !== id));
  writeLocal('bb-assignments', readLocal('bb-assignments', []).filter((a) => a.classId !== id));
  if (DEMO()) return;
  await ensureAuth();
  const work = await getDocs(query(collection(db, 'assignments'), where('classId', '==', id))).catch(() => null);
  await Promise.all((work?.docs || []).map((d) => deleteDoc(d.ref).catch(() => {})));
  await deleteDoc(doc(db, 'classes', id));
}

export async function findClassByCode(code) {
  if (DEMO()) return readLocal('bb-classes', []).find((c) => c.inviteCode === String(code).toUpperCase().trim()) || null;
  await ensureAuth();
  try {
    const snap = await getDocs(query(collection(db, 'classes'), where('inviteCode', '==', String(code).toUpperCase().trim())));
    return snap.empty ? null : snap.docs[0].data();
  } catch (e) {
    console.warn('[classroom] findClassByCode', e);
    return null;
  }
}

/** Classes whose Google Classroom roster includes this email. */
export async function findClassesForEmail(email) {
  if (DEMO()) return readLocal('bb-classes', []).filter((c) => (c.rosterEmails || []).includes((email || '').toLowerCase()));
  if (!email) return [];
  await ensureAuth();
  try {
    const snap = await getDocs(query(collection(db, 'classes'), where('rosterEmails', 'array-contains', email.toLowerCase())));
    return snap.docs.map((d) => d.data()).filter((c) => !c.archived);
  } catch (e) {
    console.warn('[classroom] findClassesForEmail', e);
    return [];
  }
}

export async function findClassByGoogleCourse(courseId) {
  if (DEMO()) return null;
  await ensureAuth();
  try {
    const snap = await getDocs(query(collection(db, 'classes'), where('gcCourseId', '==', courseId)));
    return snap.empty ? null : snap.docs[0].data();
  } catch {
    return null;
  }
}

export async function joinClass(cls, user) {
  if (DEMO()) return demoClass(cls.id) || cls;
  await ensureAuth();
  const ref = doc(db, 'classes', cls.id);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : cls;
  const id = pupilId(user);
  const students = data.students || [];
  const email = (user.email || '').toLowerCase();
  const idx = students.findIndex((s) => safeKey(s.id) === id || (email && (s.email || '').toLowerCase() === email));
  const me = {
    ...(idx >= 0 ? students[idx] : {}),
    id: user.email || user.name,
    name: (idx >= 0 && students[idx].name) || user.name || 'Pupil',
    email,
    avatarEmoji: user.avatarEmoji || '',
    joinedAt: (idx >= 0 && students[idx].joinedAt) || new Date().toISOString(),
    joined: true,
  };
  const next = idx >= 0 ? students.map((s, i) => (i === idx ? me : s)) : [...students, me];
  await setDoc(ref, { students: next }, { merge: true });
  return { ...data, students: next };
}

export async function updateRoster(classId, students) {
  if (DEMO()) return;
  await ensureAuth();
  const rosterEmails = [...new Set(students.map((s) => (s.email || '').toLowerCase()).filter(Boolean))];
  await setDoc(doc(db, 'classes', classId), { students, rosterEmails }, { merge: true });
}

/* ─── Stream ─── */

export async function postAnnouncement(classId, post) {
  if (DEMO()) { demoPatch(classId, (c) => ({ ...c, announcements: [...(c.announcements || []), post] })); return; }
  await ensureAuth();
  await updateDoc(doc(db, 'classes', classId), { announcements: arrayUnion(post) });
}

export async function replaceAnnouncements(classId, list) {
  if (DEMO()) { demoPatch(classId, (c) => ({ ...c, announcements: list })); return; }
  await ensureAuth();
  await updateDoc(doc(db, 'classes', classId), { announcements: list });
}

/* ─── Help ─── */

export async function raiseHand(classId, user, message) {
  if (DEMO()) return;
  await ensureAuth();
  const id = `${Date.now()}_${pupilId(user)}`;
  await updateDoc(doc(db, 'classes', classId), {
    [`help.${id}`]: { id, studentId: pupilId(user), name: user.name, message, createdAt: new Date().toISOString(), resolved: false },
  });
}

export async function resolveHelp(classId, id) {
  if (DEMO()) { demoPatch(classId, (c) => ({ ...c, help: { ...(c.help || {}), [id]: { ...(c.help || {})[id], resolved: true } } })); return; }
  await ensureAuth();
  await updateDoc(doc(db, 'classes', classId), { [`help.${id}.resolved`]: true });
}

/* ─── Progress (pupils push, teachers read) ─── */

export function readMyProgress() {
  const lessonsDone = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const m = /^bb_world_(y\d)_l(\d+)$/.exec(localStorage.key(i) || '');
      if (m && localStorage.getItem(localStorage.key(i)) === '1') lessonsDone.push(`${m[1]}:${m[2]}`);
    }
  } catch { /* ignore */ }
  const mp = readLocal('bb-mission-progress', {});
  const missionsDone = Object.values(mp || {}).flatMap((c) => c?.completed || []);
  return { lessonsDone: lessonsDone.sort(), missionsDone };
}

let lastPush = 0;
export async function pushMyProgress(classId, user, { force = false } = {}) {
  if (DEMO()) return;
  if (!classId || !user) return;
  if (!force && Date.now() - lastPush < 45_000) return;
  lastPush = Date.now();
  const p = readMyProgress();
  await ensureAuth();
  try {
    await updateDoc(doc(db, 'classes', classId), {
      [`progress.${pupilId(user)}`]: {
        name: user.name || 'Pupil',
        email: (user.email || '').toLowerCase(),
        avatarEmoji: user.avatarEmoji || '',
        xp: user.xp || 0,
        level: user.level || 1,
        streak: user.streak || 0,
        ...p,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.warn('[classroom] pushMyProgress', e);
  }
}

/* ─── Assignments ─── */

export async function saveAssignment(a) {
  if (DEMO()) return;
  await ensureAuth();
  await setDoc(doc(db, 'assignments', a.id), a, { merge: true });
}

export async function deleteAssignment(id) {
  if (DEMO()) return;
  await ensureAuth();
  try {
    await deleteDoc(doc(db, 'assignments', id));
  } catch (e) {
    console.warn('[classroom] deleteAssignment', e);
  }
}

export async function fetchAssignments(classId) {
  if (DEMO()) return readLocal('bb-assignments', []).filter((a) => a.classId === classId);
  await ensureAuth();
  try {
    const snap = await getDocs(query(collection(db, 'assignments'), where('classId', '==', classId)));
    return snap.docs.map((d) => d.data());
  } catch (e) {
    console.warn('[classroom] fetchAssignments', e);
    return null;
  }
}

/* ─── Hand-ins & marking ─── */

export const submissionId = (assignmentId, user) => `${assignmentId}_${pupilId(user)}`;

/** Find a pupil's hand-in (older Game Builder hand-ins keep the email's case). */
export function findSub(submissions, assignmentId, key) {
  return Object.values(submissions || {}).find((s) => s && s.assignmentId === assignmentId
    && (s.studentKey === key || safeKey(s.studentId) === key)) || null;
}

/* Big hand-in parts (screenshots, game projects) live in their own doc so the
   class doc stays well under Firestore's 1 MB limit. */
const fileDocId = (classId, subId) => `${classId}__hi__${subId}`;

export async function loadHandInFile(classId, subId) {
  if (DEMO()) return null;
  try {
    const snap = await getDoc(doc(db, 'classes', fileDocId(classId, subId)));
    return snap.exists() ? snap.data().file || null : null;
  } catch {
    return null;
  }
}

export async function handIn(classId, assignment, user, data) {
  if (DEMO()) return { id: submissionId(assignment.id, user), assignmentId: assignment.id, ...data };
  await ensureAuth();
  const id = submissionId(assignment.id, user);
  if (data.file) {
    await setDoc(doc(db, 'classes', fileDocId(classId, id)), { kind: 'handin-file', classId, subId: id, file: data.file });
    data = { ...data, file: null, hasFile: true };
  }
  const payload = {
    id,
    assignmentId: assignment.id,
    studentId: user.email || user.name,
    studentKey: pupilId(user),
    studentName: user.name || 'Pupil',
    classId,
    ...data,
    submittedAt: new Date().toISOString(),
  };
  await updateDoc(doc(db, 'classes', classId), { [`submissions.${id}`]: payload });
  return payload;
}

export async function updateSubWork(classId, subId, work) {
  if (DEMO()) return;
  await ensureAuth();
  await updateDoc(doc(db, 'classes', classId), { [`submissions.${subId}.work`]: work });
}

/**
 * Send the pupil's real work (quiz answers, mission code) for set lessons and
 * missions: finished ones are handed in automatically, and later attempts
 * refresh what the teacher sees.
 */
let lastWorkSync = 0;
export async function syncMyWork(classId, user, { force = false, cls: known = null, assignments: knownAsg = null } = {}) {
  if (DEMO() || !classId || !user) return;
  if (!force && Date.now() - lastWorkSync < 60_000) return;
  lastWorkSync = Date.now();
  try {
    const [cls, asg] = await Promise.all([known || fetchClass(classId), knownAsg || fetchAssignments(classId)]);
    if (!cls || !asg) return;
    const progress = readMyProgress();
    const me = pupilId(user);
    for (const a of asg) {
      if (a.kind !== 'lesson' && a.kind !== 'mission') continue;
      const work = workForAssignment(a);
      const sub = findSub(cls.submissions, a.id, me);
      if (!sub) {
        if (autoDone(a, progress)) await handIn(classId, a, user, { auto: true, ...(work ? { work } : {}) });
      } else if (work && sub.work?.updatedAt !== work.updatedAt) {
        await updateSubWork(classId, sub.id, work);
      }
    }
  } catch (e) {
    console.warn('[classroom] syncMyWork', e);
  }
}

export async function unsubmit(classId, subId) {
  if (DEMO()) return;
  await ensureAuth();
  await updateDoc(doc(db, 'classes', classId), { [`submissions.${subId}`]: deleteField() });
}

/** Shrink a photo to a small JPEG data URL before it is stored. */
export function shrinkImage(file, max = 900, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

export async function markSubmission(classId, subId, { grade, feedback, sticker }) {
  if (DEMO()) { demoPatch(classId, (c) => ({ ...c, submissions: { ...(c.submissions || {}), [subId]: { ...(c.submissions || {})[subId], grade: grade === '' || grade == null ? null : Number(grade), feedback: feedback || '', sticker: sticker || '', markedAt: new Date().toISOString() } } })); return; }
  await ensureAuth();
  await updateDoc(doc(db, 'classes', classId), {
    [`submissions.${subId}.grade`]: grade === '' || grade == null ? null : Number(grade),
    [`submissions.${subId}.feedback`]: feedback || '',
    [`submissions.${subId}.sticker`]: sticker || '',
    [`submissions.${subId}.markedAt`]: new Date().toISOString(),
  });
}

/* ─── Status helpers ─── */

/** Is this ByteBuddies assignment complete according to a progress record? */
export function autoDone(a, progress) {
  if (!progress || !a?.target) return false;
  if (a.kind === 'lesson') return (progress.lessonsDone || []).includes(`${a.target.yr}:${a.target.idx}`);
  if (a.kind === 'mission') return (progress.missionsDone || []).includes(a.target.mission);
  return false;
}

export function statusFor(a, sub, progress) {
  if (sub && sub.grade != null) return 'marked';
  if (sub?.auto) return 'done';
  if (sub && !sub.byTeacher) return 'handed';
  if (autoDone(a, progress)) return 'done';
  if (a.dueDate && new Date(`${a.dueDate}T23:59:59`) < new Date()) return 'late';
  return 'todo';
}

export const STATUS = {
  todo: { label: 'To do', color: '#f59e0b', icon: '📝' },
  late: { label: 'Missing', color: '#ef4444', icon: '⏰' },
  done: { label: 'Completed', color: '#10b981', icon: '✅' },
  handed: { label: 'Handed in', color: '#6366f1', icon: '📤' },
  marked: { label: 'Marked', color: '#22c55e', icon: '⭐' },
};

export function dueLabel(dateStr) {
  if (!dateStr) return 'No due date';
  const due = new Date(`${dateStr}T23:59:59`);
  const days = Math.ceil((due - new Date()) / 86400000);
  if (days < 0) return `Was due ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days < 7) return `Due ${due.toLocaleDateString('en-GB', { weekday: 'long' })}`;
  return `Due ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
}
