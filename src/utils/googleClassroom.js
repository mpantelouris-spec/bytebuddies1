/**
 * Google Classroom for ByteBuddies.
 *
 * Two ways in:
 *  1. Share links (shareToClassroomUrl) — work for every teacher straight away.
 *     Google's own share page lets the teacher pick a class and post the
 *     ByteBuddies link as an assignment, material or announcement.
 *  2. The Classroom API (connectGoogleClassroom …) — import classes and pupils,
 *     post assignments, read a pupil's Classroom work and send grades back.
 *     Sign-in runs in a separate Firebase app so it never replaces the user's
 *     ByteBuddies session. The access token lives in sessionStorage only.
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver } from 'firebase/auth';
import { firebaseConfig } from '../firebase';

const API = 'https://classroom.googleapis.com/v1';
const TOKEN_KEY = 'bb-gc-session';

export const GC_SCOPES = {
  teacher: [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly',
    'https://www.googleapis.com/auth/classroom.profile.emails',
    'https://www.googleapis.com/auth/classroom.coursework.students',
  ],
  student: [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  ],
};

/** Public link for any ByteBuddies page, e.g. appLink('classroom?join=ABC123'). */
export function appLink(hash) {
  const origin = typeof window !== 'undefined' && !/localhost|127\.0\.0\.1/.test(window.location.host)
    ? window.location.origin
    : 'https://bytebuddies.technology';
  return `${origin}/#${hash}`;
}

/** Google's share-to-Classroom page. itemtype: assignment | material | announcement | question */
export function shareToClassroomUrl({ url, title = '', body = '', itemtype = 'assignment', courseId } = {}) {
  const p = new URLSearchParams({ url });
  if (title) p.set('title', title);
  if (body) p.set('body', body);
  if (itemtype) p.set('itemtype', itemtype);
  if (courseId) p.set('courseid', courseId);
  return `https://classroom.google.com/share?${p.toString()}`;
}

export function openShareToClassroom(opts) {
  window.open(shareToClassroomUrl(opts), 'bb-gc-share', 'width=640,height=640,noopener');
}

/* ─── Session ─── */

export function getGcSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || 'null');
    if (s && s.token && s.exp > Date.now() + 30_000) return s;
  } catch { /* ignore */ }
  return null;
}

export function disconnectGoogleClassroom() {
  try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

function gcAuth() {
  const existing = getApps().find((a) => a.name === 'bb-gclassroom');
  if (existing) return getAuth(existing);
  // Classroom OAuth must use Firebase's registered handler. The main app uses
  // bytebuddies.technology as authDomain (Chromebooks), but Google's OAuth
  // client only allows https://connectr-5b7a4.firebaseapp.com/__/auth/handler
  // — that mismatch was Error 400: redirect_uri_mismatch.
  const app = initializeApp({
    ...firebaseConfig,
    authDomain: 'connectr-5b7a4.firebaseapp.com',
  }, 'bb-gclassroom');
  return getAuth(app);
}

/* ─── Hidden test route: Google sign-in in the same tab ───
   Open https://bytebuddies.technology/?gcdemo=1#classroom and "Connect Google Classroom"
   goes to Google in the same tab (no pop-up) and comes back to /gc-callback with the
   Classroom token. Used to record Google's verification video; everyone else keeps the pop-up. */
const GC_CLIENT_ID = '175950389999-tege9fhcl3497kq5kir4pmdlgeolbo8a.apps.googleusercontent.com';
export const GC_REDIRECT_PATH = '/gc-callback';
const DEMO_KEY = 'bb-gc-demo';
const STATE_KEY = 'bb-gc-state';

export function isGcDemoMode() {
  try {
    if (new URLSearchParams(window.location.search).get('gcdemo') === '1') sessionStorage.setItem(DEMO_KEY, '1');
    return sessionStorage.getItem(DEMO_KEY) === '1';
  } catch { return false; }
}

function connectWithRedirect(role) {
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
  try { sessionStorage.setItem(STATE_KEY, JSON.stringify({ state, role, back: window.location.hash || '#classroom' })); } catch { /* ignore */ }
  const params = new URLSearchParams({
    client_id: GC_CLIENT_ID,
    redirect_uri: `${window.location.origin}${GC_REDIRECT_PATH}`,
    response_type: 'token',
    scope: (GC_SCOPES[role] || GC_SCOPES.teacher).join(' '),
    include_granted_scopes: 'true',
    prompt: 'select_account consent',
    state,
  });
  window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  return new Promise(() => {}); // the page is leaving
}

/** Runs before the app starts when Google sends the browser back to /gc-callback. */
export async function completeGcRedirect() {
  if (window.location.pathname !== GC_REDIRECT_PATH) return false;
  const h = new URLSearchParams(window.location.hash.slice(1));
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}') || {}; sessionStorage.removeItem(STATE_KEY); } catch { /* ignore */ }
  const token = h.get('access_token');
  if (token && h.get('state') && h.get('state') === saved.state) {
    let email = ''; let name = '';
    try {
      const r = await fetch(`${API}/userProfiles/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const me = await r.json(); email = me.emailAddress || ''; name = me.name?.fullName || ''; }
    } catch { /* ignore */ }
    const session = {
      token, email, name, photo: '', role: saved.role || 'teacher',
      exp: Date.now() + (Number(h.get('expires_in')) || 3600) * 1000 - 60_000,
    };
    try { sessionStorage.setItem(TOKEN_KEY, JSON.stringify(session)); } catch { /* ignore */ }
  }
  window.history.replaceState(null, '', `/${saved.back || '#classroom'}`);
  return true;
}

/** Opens Google sign-in asking for Classroom access. Must be called from a click. */
export async function connectGoogleClassroom(role = 'teacher') {
  if (isGcDemoMode()) return connectWithRedirect(role);
  const provider = new GoogleAuthProvider();
  (GC_SCOPES[role] || GC_SCOPES.teacher).forEach((s) => provider.addScope(s));
  provider.setCustomParameters({ prompt: 'select_account', include_granted_scopes: 'true' });
  let result;
  try {
    result = await signInWithPopup(gcAuth(), provider, browserPopupRedirectResolver);
  } catch (e) {
    throw friendly(e);
  }
  const cred = GoogleAuthProvider.credentialFromResult(result);
  if (!cred?.accessToken) throw new GcError('no-token', 'Google did not return Classroom access. Please try again.');
  const session = {
    token: cred.accessToken,
    exp: Date.now() + 55 * 60 * 1000,
    email: result.user.email || '',
    name: result.user.displayName || '',
    photo: result.user.photoURL || '',
    role,
  };
  try { sessionStorage.setItem(TOKEN_KEY, JSON.stringify(session)); } catch { /* ignore */ }
  return session;
}

/* ─── Errors ─── */

export class GcError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

function friendly(e) {
  const code = e?.code || '';
  const msg = String(e?.message || '');
  if (code === 'auth/popup-blocked') return new GcError('popup', 'Your browser blocked the Google window. Allow pop-ups for this site and try again.');
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return new GcError('cancelled', 'Google sign-in was closed before it finished.');
  if (code === 'auth/unauthorized-domain') return new GcError('domain', 'This web address is not allowed to use Google sign-in yet.');
  if (/redirect_uri_mismatch|invalid-oauth-client|auth\/invalid-oauth-client|Error 400/i.test(`${code} ${msg}`)) {
    return new GcError('redirect', 'Google’s OAuth client is missing ByteBuddies’ Firebase callback URL. Add the callback shown below in Google Cloud Console, then try Connect again.');
  }
  if (code === 'auth/admin-restricted-operation' || /access_denied|admin_policy/i.test(msg)) {
    return new GcError('admin', 'Your school\'s Google admin has not allowed ByteBuddies yet. Ask your IT team to trust ByteBuddies in the Google Admin console.');
  }
  return new GcError('unknown', msg || 'Could not connect to Google Classroom.');
}

async function gcFetch(path, { method = 'GET', body } = {}) {
  const s = getGcSession();
  if (!s) throw new GcError('expired', 'Please connect Google Classroom again.');
  const res = await fetch(path.startsWith('http') ? path : `${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${s.token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.ok) return res.status === 204 ? {} : res.json();
  let err = {};
  try { err = (await res.json()).error || {}; } catch { /* ignore */ }
  const reason = JSON.stringify(err.details || '') + (err.message || '');
  if (res.status === 401) { disconnectGoogleClassroom(); throw new GcError('expired', 'Your Google session ended. Connect again.'); }
  if (/SERVICE_DISABLED|accessNotConfigured|has not been used in project/i.test(reason)) {
    throw new GcError('api-disabled', 'The Google Classroom API is not switched on for ByteBuddies yet. Share links still work.');
  }
  if (/ProjectPermissionDenied|@ProjectPermissionDenied/i.test(reason)) {
    throw new GcError('project', 'Google only lets an app change work that the same app created. Post the work from ByteBuddies first.');
  }
  if (res.status === 403) throw new GcError('denied', err.message || 'Google Classroom said no to that request.');
  if (res.status === 404) throw new GcError('missing', 'That class or piece of work no longer exists in Google Classroom.');
  throw new GcError('http', err.message || `Google Classroom error ${res.status}`);
}

async function pages(path, key) {
  const out = [];
  let token = '';
  for (let i = 0; i < 20; i++) {
    const sep = path.includes('?') ? '&' : '?';
    const data = await gcFetch(`${path}${sep}pageSize=100${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`);
    out.push(...(data[key] || []));
    token = data.nextPageToken;
    if (!token) break;
  }
  return out;
}

/* ─── Courses & rosters ─── */

export async function listCourses(role = 'teacher') {
  const who = role === 'student' ? 'studentId=me' : 'teacherId=me';
  const courses = await pages(`/courses?${who}&courseStates=ACTIVE`, 'courses');
  return courses.map((c) => ({
    id: c.id,
    name: c.name,
    section: c.section || '',
    room: c.room || '',
    link: c.alternateLink,
    enrollmentCode: c.enrollmentCode || '',
  }));
}

export async function listStudents(courseId) {
  const students = await pages(`/courses/${courseId}/students`, 'students');
  return students.map((s) => ({
    userId: s.userId,
    name: s.profile?.name?.fullName || s.profile?.emailAddress || 'Pupil',
    email: (s.profile?.emailAddress || '').toLowerCase(),
    photo: s.profile?.photoUrl ? (s.profile.photoUrl.startsWith('//') ? `https:${s.profile.photoUrl}` : s.profile.photoUrl) : '',
  }));
}

/* ─── Coursework ─── */

function dueParts(dateStr) {
  if (!dateStr) return {};
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return {};
  // 23:59 UK-ish time expressed in UTC (Classroom stores due times in UTC)
  return { dueDate: { year: y, month: m, day: d }, dueTime: { hours: 22, minutes: 59 } };
}

export async function createCourseWork(courseId, { title, description = '', link, dueDate, maxPoints = 100 }) {
  const body = {
    title: title.slice(0, 3000),
    description,
    workType: 'ASSIGNMENT',
    state: 'PUBLISHED',
    maxPoints,
    materials: link ? [{ link: { url: link, title: `Open in ByteBuddies — ${title}`.slice(0, 200) } }] : [],
    ...dueParts(dueDate),
  };
  const cw = await gcFetch(`/courses/${courseId}/courseWork`, { method: 'POST', body });
  return { id: cw.id, link: cw.alternateLink };
}

export async function listMyByteBuddiesWork(courses) {
  const all = [];
  for (const c of courses) {
    let work = [];
    try { work = await pages(`/courses/${c.id}/courseWork?courseWorkStates=PUBLISHED`, 'courseWork'); } catch (e) {
      if (e.code === 'api-disabled' || e.code === 'expired') throw e;
      continue;
    }
    work.forEach((w) => {
      const bbLink = (w.materials || []).map((m) => m.link?.url).find((u) => u && /bytebuddies|localhost/i.test(u));
      if (!bbLink) return;
      all.push({
        id: w.id,
        courseId: c.id,
        courseName: c.name,
        title: w.title,
        description: w.description || '',
        link: bbLink,
        gcLink: w.alternateLink,
        due: w.dueDate ? `${w.dueDate.year}-${String(w.dueDate.month).padStart(2, '0')}-${String(w.dueDate.day).padStart(2, '0')}` : '',
      });
    });
  }
  return all;
}

/**
 * Send ByteBuddies grades back to Google Classroom.
 * gradesByEmail: { 'pupil@school.org': 85, ... }  (numbers out of the coursework's maxPoints)
 */
export async function syncGrades(courseId, courseWorkId, gradesByEmail) {
  const roster = await listStudents(courseId);
  const emailById = Object.fromEntries(roster.map((r) => [r.userId, r.email]));
  const subs = await pages(`/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`, 'studentSubmissions');
  let sent = 0;
  const skipped = [];
  for (const s of subs) {
    const email = emailById[s.userId];
    const grade = email != null ? gradesByEmail[email] : undefined;
    if (grade == null || Number.isNaN(Number(grade))) continue;
    try {
      await gcFetch(`/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${s.id}?updateMask=assignedGrade,draftGrade`, {
        method: 'PATCH',
        body: { assignedGrade: Number(grade), draftGrade: Number(grade) },
      });
      sent++;
    } catch (e) {
      if (e.code === 'project' || e.code === 'expired' || e.code === 'api-disabled') throw e;
      skipped.push(email);
    }
  }
  return { sent, skipped };
}
