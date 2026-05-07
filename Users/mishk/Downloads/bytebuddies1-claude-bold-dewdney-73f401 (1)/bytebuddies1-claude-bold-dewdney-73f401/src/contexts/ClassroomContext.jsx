import React, { createContext, useContext, useState, useEffect } from 'react';

const ClassroomContext = createContext(null);

const defaultState = {
  classCode: 'CV-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
  className: 'My Class',
  students: [],
  assignments: [],
  submissions: {},   // [assignmentId][studentId] = { code, submittedAt, language, grade, feedback, reviewed }
  announcements: [],
  attendance: {},    // { 'YYYY-MM-DD': [studentId, ...] }
  liveLesson: null,  // { title, description, starterCode, timerSecs, startedAt }
  helpRequests: [],  // [{ id, studentId, message, createdAt, resolved }]
};

function loadState() {
  try {
    const saved = localStorage.getItem('cv-classroom');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new fields exist
      if (!parsed.announcements) parsed.announcements = [];
      if (!parsed.attendance) parsed.attendance = {};
      if (!parsed.liveLesson === undefined) parsed.liveLesson = null;
      if (!parsed.helpRequests) parsed.helpRequests = [];
      if (!parsed.className) parsed.className = defaultState.className;
      if (!parsed.students) parsed.students = [];
      return parsed;
    }
  } catch {}
  return { ...defaultState, classCode: 'CV-' + Math.random().toString(36).substring(2, 7).toUpperCase() };
}

export function ClassroomProvider({ children }) {
  const [classroom, setClassroom] = useState(loadState);

  useEffect(() => {
    localStorage.setItem('cv-classroom', JSON.stringify(classroom));
  }, [classroom]);

  const addAssignment = (a) =>
    setClassroom(p => ({ ...p, assignments: [...p.assignments, { id: Date.now(), ...a }] }));

  const deleteAssignment = (id) =>
    setClassroom(p => ({ ...p, assignments: p.assignments.filter(a => a.id !== id) }));

  const submitWork = (assignmentId, studentId, code, language) =>
    setClassroom(p => ({
      ...p,
      submissions: {
        ...p.submissions,
        [assignmentId]: {
          ...(p.submissions[assignmentId] || {}),
          [studentId]: { code, language, submittedAt: new Date().toISOString(), grade: null, feedback: '', reviewed: false },
        },
      },
    }));

  const reviewSubmission = (assignmentId, studentId, grade, feedback) =>
    setClassroom(p => ({
      ...p,
      submissions: {
        ...p.submissions,
        [assignmentId]: {
          ...(p.submissions[assignmentId] || {}),
          [studentId]: {
            ...(p.submissions[assignmentId]?.[studentId] || {}),
            grade, feedback, reviewed: true, reviewedAt: new Date().toISOString(),
          },
        },
      },
    }));

  const addAnnouncement = (text, pinned = false) =>
    setClassroom(p => ({
      ...p,
      announcements: [
        { id: Date.now(), text, author: 'Teacher', createdAt: new Date().toISOString(), pinned, emoji: '📢' },
        ...p.announcements,
      ],
    }));

  const deleteAnnouncement = (id) =>
    setClassroom(p => ({ ...p, announcements: p.announcements.filter(a => a.id !== id) }));

  const togglePinAnnouncement = (id) =>
    setClassroom(p => ({ ...p, announcements: p.announcements.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a) }));

  const markAttendance = (studentIds) => {
    const today = new Date().toISOString().split('T')[0];
    setClassroom(p => ({ ...p, attendance: { ...p.attendance, [today]: studentIds } }));
  };

  const startLiveLesson = (lesson) =>
    setClassroom(p => ({ ...p, liveLesson: { ...lesson, startedAt: new Date().toISOString() } }));

  const endLiveLesson = () =>
    setClassroom(p => ({ ...p, liveLesson: null }));

  const raiseHand = (studentId, message) =>
    setClassroom(p => ({
      ...p,
      helpRequests: [...p.helpRequests, { id: Date.now(), studentId, message, createdAt: new Date().toISOString(), resolved: false }],
    }));

  const resolveHelp = (id) =>
    setClassroom(p => ({ ...p, helpRequests: p.helpRequests.map(h => h.id === id ? { ...h, resolved: true } : h) }));

  const renameStudent = (id, newName) =>
    setClassroom(p => ({ ...p, students: p.students.map(s => s.id === id ? { ...s, name: newName } : s) }));

  const getSubmission = (aId, sId) => classroom.submissions?.[aId]?.[sId] || null;
  const getAssignmentSubmissions = (aId) => classroom.submissions?.[aId] || {};

  return (
    <ClassroomContext.Provider value={{
      classroom, addAssignment, deleteAssignment, submitWork, reviewSubmission,
      addAnnouncement, deleteAnnouncement, togglePinAnnouncement,
      markAttendance, startLiveLesson, endLiveLesson,
      raiseHand, resolveHelp, renameStudent,
      getSubmission, getAssignmentSubmissions,
    }}>
      {children}
    </ClassroomContext.Provider>
  );
}

export function useClassroom() {
  const ctx = useContext(ClassroomContext);
  if (!ctx) throw new Error('useClassroom must be inside ClassroomProvider');
  return ctx;
}
