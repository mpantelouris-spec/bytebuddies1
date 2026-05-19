import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAoqJVmEDjOArx47FayS7gEyCd-8IIjT5k",
  authDomain: "connectr-5b7a4.firebaseapp.com",
  projectId: "connectr-5b7a4",
  storageBucket: "connectr-5b7a4.firebasestorage.app",
  messagingSenderId: "175950389999",
  appId: "1:175950389999:web:e1f85b35fcea421900311a",
  measurementId: "G-VPP0NG9DNF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  return {
    name: user.displayName || user.email.split('@')[0],
    email: user.email,
    avatar: user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'U',
    photoURL: user.photoURL,
  };
}

export async function firebaseSignOut() {
  await signOut(auth);
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
