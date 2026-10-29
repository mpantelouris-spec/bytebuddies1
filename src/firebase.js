import { initializeApp } from 'firebase/app';
import {
  initializeAuth, getAuth, GoogleAuthProvider,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  signOut, signInAnonymously,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, updateProfile,
  browserLocalPersistence, indexedDBLocalPersistence, browserPopupRedirectResolver,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, onSnapshot, writeBatch, runTransaction } from 'firebase/firestore';

function resolveAuthDomain() {
  // Google OAuth is configured with Firebase's hosted callback URI. Using the
  // custom site host here sends a different redirect_uri and causes Error 400.
  // Keep this aligned with the Google Classroom auth instance below.
  return 'connectr-5b7a4.firebaseapp.com';
}

export const firebaseConfig = {
  apiKey: "AIzaSyAoqJVmEDjOArx47FayS7gEyCd-8IIjT5k",
  authDomain: resolveAuthDomain(),
  projectId: "connectr-5b7a4",
  storageBucket: "connectr-5b7a4.firebasestorage.app",
  messagingSenderId: "175950389999",
  appId: "1:175950389999:web:e1f85b35fcea421900311a",
  measurementId: "G-VPP0NG9DNF"
};

const app = initializeApp(firebaseConfig);

function createAuth() {
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const LICENSE_ADMIN_EMAILS = ['mpantelouris@britishschool.sch.ae', 'fudoh@britishschool.sch.ae'];
const licenseEmailId = (email) => String(email || '').trim().toLowerCase();

export function isLicenseAdmin(email) {
  return LICENSE_ADMIN_EMAILS.includes(licenseEmailId(email));
}

async function waitForFirebaseAuth() {
  // Auth persistence is restored asynchronously on page load. Wait for that
  // initial restore before gating licence operations on auth.currentUser.
  if (typeof auth.authStateReady === 'function') await auth.authStateReady();
  return auth.currentUser;
}

export function watchAccountLicense(email, callback) {
  const normalizedEmail = licenseEmailId(email);
  if (!normalizedEmail) {
    callback(null, new Error('A signed-in email is required to check access.'));
    return () => {};
  }
  return onSnapshot(doc(db, 'licenses', normalizedEmail), (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() : null, null);
  }, (error) => callback(null, error));
}

export async function listAccountLicenses() {
  const currentUser = await waitForFirebaseAuth();
  if (!isLicenseAdmin(currentUser?.email)) throw new Error('Only a ByteBuddies administrator can manage licences.');
  const snapshot = await getDocs(collection(db, 'licenses'));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => String(a.organization || a.email).localeCompare(String(b.organization || b.email)));
}

export async function saveAccountLicenses({ emails, organization, expiresAt = '', notes = '', status = 'active', studentLimit = 0 }) {
  const currentUser = await waitForFirebaseAuth();
  if (!isLicenseAdmin(currentUser?.email)) throw new Error('Only a ByteBuddies administrator can change licences.');
  if (!['active', 'suspended'].includes(status)) throw new Error('Choose active or suspended access.');
  const normalizedEmails = [...new Set((emails || []).map(licenseEmailId).filter(Boolean))];
  if (!normalizedEmails.length || normalizedEmails.length > 200 || normalizedEmails.some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw new Error('Enter between 1 and 200 valid account email addresses.');
  }
  const seatLimit = Math.floor(Number(studentLimit));
  if (normalizedEmails.length !== 1 || !Number.isInteger(seatLimit) || seatLimit < 1 || seatLimit > 5000) {
    throw new Error('Set up one teacher at a time and enter between 1 and 5,000 pupil places.');
  }
  const refs = normalizedEmails.map(email => doc(db, 'licenses', email));
  const existing = await Promise.all(refs.map(getDoc));
  const usedSeats = existing[0].exists() && Array.isArray(existing[0].data().pupilEmails) ? existing[0].data().pupilEmails.length : 0;
  if (seatLimit < usedSeats) throw new Error(`This teacher already has ${usedSeats} assigned pupil places. The limit cannot be set below that.`);
  const updatedAt = new Date().toISOString();
  const batch = writeBatch(db);
  refs.forEach((ref, index) => {
    const email = normalizedEmails[index];
    batch.set(ref, {
      email,
      organization: String(organization || '').trim().slice(0, 120),
      status,
      role: 'teacher',
      studentLimit: seatLimit,
      expiresAt: expiresAt || '',
      notes: String(notes || '').trim().slice(0, 500),
      updatedAt,
      updatedBy: currentUser.email,
      ...(existing[index].exists() ? {} : { createdAt: updatedAt }),
    }, { merge: true });
  });
  await batch.commit();
}

export async function saveAccountLicense({ email, ...license }) {
  return saveAccountLicenses({ ...license, emails: [email] });
}

/** Reserve a paid pupil place and provision that pupil's sign-in licence. */
export async function provisionPupilLicenses(pupils) {
  const currentUser = await waitForFirebaseAuth();
  const teacherEmail = licenseEmailId(currentUser?.email);
  if (!teacherEmail) throw new Error('Sign in with your teacher account before adding pupils.');
  const rows = [...new Map((pupils || []).map((pupil) => {
    const email = licenseEmailId(pupil.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error(`Enter a valid school email for ${pupil.name || 'each pupil'}.`);
    return [email, { ...pupil, email }];
  })).values()];
  if (!rows.length) return [];
  if (rows.length > 200) throw new Error('Add no more than 200 pupils in one batch.');

  const teacherRef = doc(db, 'licenses', teacherEmail);
  const pupilRefs = rows.map((pupil) => doc(db, 'licenses', pupil.email));
  return runTransaction(db, async (transaction) => {
    const teacherSnapshot = await transaction.get(teacherRef);
    if (!teacherSnapshot.exists()) throw new Error('Your teacher licence could not be found. Ask your administrator to activate it.');
    const teacherLicense = teacherSnapshot.data();
    if (teacherLicense.status !== 'active' || teacherLicense.role !== 'teacher') throw new Error('Your teacher licence is not active.');
    const expiry = teacherLicense.expiresAt ? new Date(teacherLicense.expiresAt) : null;
    if (expiry && expiry.getTime() < Date.now()) throw new Error('Your school licence has expired.');

    const assigned = Array.isArray(teacherLicense.pupilEmails) ? teacherLicense.pupilEmails.map(licenseEmailId) : [];
    const newRows = rows.filter((pupil) => !assigned.includes(pupil.email));
    const limit = Math.max(0, Number(teacherLicense.studentLimit) || 0);
    if (assigned.length + newRows.length > limit) {
      throw new Error(`Your licence has ${limit} pupil places and ${assigned.length} are already assigned.`);
    }
    const updatedAt = new Date().toISOString();
    transaction.update(teacherRef, { pupilEmails: [...assigned, ...newRows.map((pupil) => pupil.email)], updatedAt });
    newRows.forEach((pupil) => {
      transaction.set(pupilRefs[rows.indexOf(pupil)], {
        email: pupil.email,
        role: 'student',
        status: 'active',
        organization: teacherLicense.organization || '',
        teacherEmail,
        expiresAt: teacherLicense.expiresAt || '',
        updatedAt,
        createdAt: updatedAt,
      });
    });
    return newRows.map((pupil) => pupil.email);
  });
}

const AUTH_ROLE_KEY = 'bb_auth_role';
const AUTH_REDIRECT_KEY = 'bb_auth_redirect';

export function rememberAuthRole(role) {
  try { sessionStorage.setItem(AUTH_ROLE_KEY, role || 'student'); } catch { /* ignore */ }
}

export function readRememberedAuthRole() {
  try { return sessionStorage.getItem(AUTH_ROLE_KEY) || 'student'; } catch { return 'student'; }
}

function profileFromUser(user) {
  const name = user.displayName || user.email?.split('@')[0] || 'Coder';
  return {
    name,
    email: user.email,
    avatar: name.slice(0, 2).toUpperCase(),
    photoURL: user.photoURL,
  };
}

function isChromebookLike() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /CrOS/i.test(ua) || /Chromebook/i.test(ua);
}

function isPopupAuthFailure(err) {
  const code = err?.code || '';
  return code === 'auth/popup-blocked'
    || code === 'auth/popup-closed-by-user'
    || code === 'auth/cancelled-popup-request'
    || code === 'auth/operation-not-supported-in-this-environment';
}

let redirectResultPromise = null;
export function completeGoogleRedirect() {
  if (!redirectResultPromise) {
    redirectResultPromise = getRedirectResult(auth)
      .then((result) => {
        if (!result?.user) return null;
        try { sessionStorage.removeItem(AUTH_REDIRECT_KEY); } catch { /* ignore */ }
        return profileFromUser(result.user);
      })
      .catch((e) => {
        console.error('[Auth] Google redirect result failed:', e);
        throw e;
      });
  }
  return redirectResultPromise;
}

export async function signInWithGoogle() {
  const pending = await completeGoogleRedirect();
  if (pending) return pending;

  const useRedirectFirst = isChromebookLike();
  if (!useRedirectFirst) {
    try {
      const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      return profileFromUser(result.user);
    } catch (e) {
      if (!isPopupAuthFailure(e)) throw e;
    }
  }
  try { sessionStorage.setItem(AUTH_REDIRECT_KEY, '1'); } catch { /* ignore */ }
  await signInWithRedirect(auth, googleProvider, browserPopupRedirectResolver);
  return new Promise(() => {});
}

export async function firebaseSignOut() {
  await signOut(auth);
}

export function onFirebaseAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signUpWithEmail(email, password, displayName) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
}

export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export function firebaseUserToProfile(fbUser) {
  if (!fbUser) return null;
  const name = fbUser.displayName || fbUser.email?.split('@')[0] || 'Coder';
  return {
    name,
    email: fbUser.email || '',
    avatar: name.slice(0, 2).toUpperCase(),
    photoURL: fbUser.photoURL,
  };
}

export async function saveClassToFirestore(classData) {
  try {
    await setDoc(doc(db, 'classes', classData.id), {
      id: classData.id,
      name: classData.name,
      inviteCode: classData.inviteCode.toUpperCase(),
      createdAt: classData.createdAt,
    });
    console.log('[Firestore] Class saved:', classData.inviteCode);
  } catch (e) {
    console.error('[Firestore] Save failed:', e);
  }
}

export async function lookupClassByCode(code) {
  try {
    console.log('[Firestore] Looking up code:', code.toUpperCase().trim());
    const q = query(collection(db, 'classes'), where('inviteCode', '==', code.toUpperCase().trim()));
    const snap = await getDocs(q);
    console.log('[Firestore] Results found:', snap.size);
    if (!snap.empty) return snap.docs[0].data();
  } catch (e) {
    console.error('[Firestore] Lookup failed:', e);
  }
  return null;
}

export async function addStudentToClass(classId, student) {
  try {
    console.log('[Firestore] addStudentToClass classId:', classId, 'student:', student.name);
    const classRef = doc(db, 'classes', classId);
    const snap = await getDoc(classRef);
    if (!snap.exists()) {
      console.error('[Firestore] Class doc not found:', classId);
      return;
    }
    const existing = snap.data().students || [];
    if (existing.find(s => s.id === student.id)) {
      console.log('[Firestore] Student already in class');
      return;
    }
    await setDoc(classRef, { students: [...existing, student] }, { merge: true });
    console.log('[Firestore] Student added successfully');
  } catch (e) {
    console.error('[Firestore] addStudentToClass failed:', e);
  }
}

export async function getClassStudents(classId) {
  try {
    const snap = await getDoc(doc(db, 'classes', classId));
    if (snap.exists()) {
      const students = snap.data().students || [];
      console.log('[Firestore] getClassStudents:', classId, '->', students.length, 'students');
      return students;
    }
    console.log('[Firestore] getClassStudents: doc not found for', classId);
  } catch (e) {
    console.error('[Firestore] getClassStudents failed:', e);
  }
  return [];
}

export async function updateStudentName(classId, studentId, newName) {
  try {
    const classRef = doc(db, 'classes', classId);
    const snap = await getDoc(classRef);
    if (!snap.exists()) return;
    const students = (snap.data().students || []).map(s =>
      s.id === studentId ? { ...s, name: newName } : s
    );
    await setDoc(classRef, { students }, { merge: true });
  } catch (e) {
    console.error('[Firestore] updateStudentName failed:', e);
  }
}

export async function saveAssignmentToFirestore(assignment) {
  try {
    await setDoc(doc(db, 'assignments', assignment.id), assignment);
  } catch (e) {
    console.error('[Firestore] saveAssignment failed:', e);
  }
}

export async function getAssignmentsForClass(classId) {
  try {
    const q = query(collection(db, 'assignments'), where('classId', '==', classId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  } catch (e) {
    console.error('[Firestore] getAssignmentsForClass failed:', e);
  }
  return [];
}

export async function getClassData(classId) {
  try {
    const snap = await getDoc(doc(db, 'classes', classId));
    if (snap.exists()) return snap.data();
  } catch (e) {
    console.error('[Firestore] getClassData failed:', e);
  }
  return null;
}

async function ensureAuth() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.warn('[Firebase] Anonymous auth failed:', e.message);
    }
  }
}

export async function saveSubmissionToFirestore(assignmentId, studentId, data) {
  await ensureAuth();
  const classId = data.classId;
  const safeStudentId = studentId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const id = `${assignmentId}_${safeStudentId}`;
  const payload = {
    id, assignmentId, studentId,
    ...data,
    submittedAt: new Date().toISOString(),
  };

  // Store inside the classes document using dot-notation field update.
  // The classes collection is proven accessible to both teacher and student
  // (students already write to it when joining). This avoids needing separate
  // Firestore rules for a submissions collection.
  if (classId) {
    try {
      await updateDoc(doc(db, 'classes', classId), {
        [`submissions.${id}`]: payload,
      });
      console.log('[Firestore] Submission saved inside class doc');
      return true;
    } catch (e) {
      console.error('[Firestore] class doc submission save failed:', e);
    }
  }

  // Fallback: top-level submissions collection
  try {
    await setDoc(doc(db, 'submissions', id), payload);
    console.log('[Firestore] Submission saved to top-level submissions');
    return true;
  } catch (e) {
    console.error('[Firestore] saveSubmission failed:', e);
    return false;
  }
}

export async function getSubmissionsForAssignment(assignmentId, classId) {
  await ensureAuth();

  // Primary: read submissions stored inside the class document
  if (classId) {
    try {
      const snap = await getDoc(doc(db, 'classes', classId));
      if (snap.exists()) {
        const allSubs = snap.data().submissions || {};
        const results = Object.values(allSubs).filter(s => s.assignmentId === assignmentId);
        if (results.length > 0) return results;
      }
    } catch (e) {
      console.error('[Firestore] class doc submission read failed:', e);
    }
  }

  // Fallback: top-level submissions collection
  try {
    const q = query(collection(db, 'submissions'), where('assignmentId', '==', assignmentId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  } catch (e) {
    console.error('[Firestore] getSubmissions fallback failed:', e);
  }

  return [];
}

export async function saveStudioToFirestore(studio) {
  await ensureAuth();
  try {
    await setDoc(doc(db, 'studios', studio.id), studio, { merge: true });
    console.log('[Firestore] Studio saved:', studio.id);
    return true;
  } catch (e) {
    console.error('[Firestore] saveStudio failed:', e);
    return false;
  }
}

export async function getAllStudios() {
  await ensureAuth();
  try {
    const snap = await getDocs(collection(db, 'studios'));
    return snap.docs.map(d => d.data());
  } catch (e) {
    console.error('[Firestore] getAllStudios failed:', e);
    return [];
  }
}

export async function deleteStudioFromFirestore(studioId) {
  try {
    await deleteDoc(doc(db, 'studios', studioId));
  } catch (e) {
    console.error('[Firestore] deleteStudio failed:', e);
  }
}

// Public Community gallery. Keep the project payload separate from the small
// listing document so browsing the gallery never downloads every shared game.
export async function getCommunityProjectsFromFirestore() {
  await ensureAuth();
  const snap = await getDocs(collection(db, 'communityProjects'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
}

async function decodeCommunityProject(data) {
  if (data.encoding !== 'gzip-base64') return JSON.parse(data.payload);
  const binary = atob(data.payload);
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(stream).text());
}

async function encodeCommunityProject(project) {
  const json = JSON.stringify(project);
  if (typeof CompressionStream !== 'undefined') {
    const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
    const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return { payload: btoa(binary), encoding: 'gzip-base64' };
  }
  return { payload: json, encoding: 'json' };
}

export async function getCommunityProjectData(projectId) {
  await ensureAuth();
  const snap = await getDoc(doc(db, 'communityProjects', projectId, 'data', 'project'));
  if (!snap.exists()) throw new Error('This shared project is no longer available.');
  return decodeCommunityProject(snap.data());
}

export async function publishCommunityProject(project, details) {
  await ensureAuth();
  if (!auth.currentUser) throw new Error('Sign in before sharing a project.');
  const shareText = `${details.title || ''} ${details.author || ''} ${details.description || ''}`;
  if (/@|https?:\/\/|\bwww\.|(?:\+?\d[\d\s().-]{7,}\d)/i.test(shareText)) {
    throw new Error('Remove email addresses, phone numbers, and web links before publishing.');
  }
  const packed = await encodeCommunityProject(project);
  const sizeBytes = new Blob([packed.payload]).size;
  if (sizeBytes > 850 * 1024) throw new Error('This project is too large to share yet. Remove some large custom images or sounds and try again.');

  const id = `cp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const publishedAt = new Date().toISOString();
  const listing = {
    id,
    title: String(details.title || 'My Game').trim().slice(0, 48),
    description: String(details.description || '').trim().slice(0, 220),
    author: String(details.author || 'Coder').trim().slice(0, 24),
    type: 'game',
    preview: details.preview || '🎮',
    likes: 0,
    views: 0,
    remixes: 0,
    ownerUid: auth.currentUser.uid,
    createdAt: publishedAt,
  };
  try {
    await setDoc(doc(db, 'communityProjects', id), listing);
    await setDoc(doc(db, 'communityProjects', id, 'data', 'project'), packed);
    return listing;
  } catch (error) {
    try { await deleteDoc(doc(db, 'communityProjects', id)); } catch { /* best effort rollback */ }
    throw error;
  }
}

export async function deleteCommunityProject(projectId) {
  await ensureAuth();
  const listingRef = doc(db, 'communityProjects', projectId);
  const listing = await getDoc(listingRef);
  if (!listing.exists()) return;
  if (!auth.currentUser || listing.data().ownerUid !== auth.currentUser.uid) {
    throw new Error('Only the creator can remove this project.');
  }
  await deleteDoc(doc(db, 'communityProjects', projectId, 'data', 'project'));
  await deleteDoc(listingRef);
}

export async function updateCommunityProjectCount(projectId, field) {
  if (!['views', 'remixes'].includes(field)) return;
  try {
    const ref = doc(db, 'communityProjects', projectId);
    const snap = await getDoc(ref);
    if (snap.exists()) await updateDoc(ref, { [field]: Number(snap.data()[field] || 0) + 1 });
  } catch (e) {
    console.warn(`[Community] Could not update ${field} count:`, e.message);
  }
}

export async function toggleCommunityProjectLike(projectId) {
  await ensureAuth();
  if (!auth.currentUser) throw new Error('Sign in to like a project.');
  const ref = doc(db, 'communityProjects', projectId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('This project is no longer available.');
    const data = snap.data();
    const likedBy = Array.isArray(data.likedBy) ? data.likedBy : [];
    const uid = auth.currentUser.uid;
    const next = likedBy.includes(uid) ? likedBy.filter(id => id !== uid) : [...likedBy, uid];
    tx.update(ref, { likedBy: next, likes: next.length });
    return { liked: next.includes(uid), likes: next.length };
  });
}

export async function deleteAssignmentFromFirestore(assignmentId) {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));
  } catch (e) {
    console.error('[Firestore] deleteAssignment failed:', e);
  }
}

export async function saveUserProfile(userData) {
  if (!userData?.email) return;
  try {
    const id = userData.email.replace(/[^a-zA-Z0-9_-]/g, '_');
    await setDoc(doc(db, 'users', id), {
      id,
      name: userData.name || '',
      email: userData.email,
      role: userData.role || 'student',
      avatarEmoji: userData.avatarEmoji || '',
      level: userData.level || 1,
      xp: userData.xp || 0,
      streak: userData.streak || 0,
      joinDate: userData.joinDate || new Date().toISOString().split('T')[0],
      lastSeen: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.error('[Firestore] saveUserProfile failed:', e);
  }
}

export async function getAllUsers() {
  // Collect students from class documents (proven accessible path)
  const userMap = new Map();
  try {
    const snap = await getDocs(collection(db, 'classes'));
    snap.docs.forEach(d => {
      const data = d.data();
      (data.students || []).forEach(s => {
        if (s.id) userMap.set(s.id, { ...s, role: s.role || 'student' });
      });
      // Also capture teacher from class metadata if present
      if (data.teacherEmail) {
        userMap.set(data.teacherEmail, {
          id: data.teacherEmail,
          name: data.teacherName || data.teacherEmail,
          email: data.teacherEmail,
          role: 'teacher',
        });
      }
    });
  } catch (e) {
    console.error('[Firestore] getAllUsers failed:', e);
  }
  return Array.from(userMap.values());
}
