import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { saveClassToFirestore, getClassStudents, updateStudentName, saveAssignmentToFirestore, getSubmissionsForAssignment, deleteAssignmentFromFirestore } from '../firebase';

const statCard = {
  background: 'var(--bg-secondary)',
  borderRadius: 16,
  border: '1px solid var(--border-color)',
  padding: 24,
  textAlign: 'center',
  flex: 1,
  minWidth: 140,
};

const sectionCard = {
  background: 'var(--bg-secondary)',
  borderRadius: 16,
  border: '1px solid var(--border-color)',
  padding: 24,
};

const inputStyle = {
  width: '100%',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  color: 'var(--text-primary)',
  boxSizing: 'border-box',
  outline: 'none',
};

const labelStyle = { fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 };

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 20, width: '100%', maxWidth: 480, border: '1px solid var(--border-color)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function CreateClassModal({ onClose, onCreated, teacher }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return setError('Class name is required');
    const newClass = {
      id: Date.now().toString(),
      name: name.trim(),
      subject: subject.trim() || 'General',
      grade: grade.trim() || 'All grades',
      inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      students: [],
      assignments: [],
      createdAt: new Date().toISOString(),
      teacherName: teacher?.name || '',
      teacherEmail: teacher?.email || '',
    };
    const saved = JSON.parse(localStorage.getItem('bb-classes') || '[]');
    localStorage.setItem('bb-classes', JSON.stringify([...saved, newClass]));
    saveClassToFirestore(newClass);
    onCreated(newClass);
  };

  return (
    <Modal title="✏️ Create New Class" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ padding: 10, borderRadius: 8, background: '#ef444420', color: '#ef4444', fontSize: 13 }}>{error}</div>}
        <div>
          <label style={labelStyle}>Class Name *</label>
          <input style={inputStyle} placeholder="e.g. Year 7 Coding" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <label style={labelStyle}>Subject</label>
          <input style={inputStyle} placeholder="e.g. Computer Science" value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Year / Grade</label>
          <input style={inputStyle} placeholder="e.g. Year 7" value={grade} onChange={e => setGrade(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '10px 20px' }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} style={{ padding: '10px 20px' }}>Create Class</button>
        </div>
      </div>
    </Modal>
  );
}

function CreateAssignmentModal({ classes, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [assignType, setAssignType] = useState('blocks');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return setError('Assignment title is required');
    if (!classId) return setError('Please select a class');
    const assignment = {
      id: Date.now().toString(),
      title: title.trim(),
      classId,
      dueDate,
      description: description.trim(),
      assignType,
      createdAt: new Date().toISOString(),
      submissions: 0,
    };
    const saved = JSON.parse(localStorage.getItem('bb-assignments') || '[]');
    localStorage.setItem('bb-assignments', JSON.stringify([...saved, assignment]));
    saveAssignmentToFirestore(assignment);
    onCreated(assignment);
  };

  return (
    <Modal title="📋 Create Assignment" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && <div style={{ padding: 10, borderRadius: 8, background: '#ef444420', color: '#ef4444', fontSize: 13 }}>{error}</div>}
        {classes.length === 0 && (
          <div style={{ padding: 12, borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: 'var(--text-secondary)', fontSize: 13 }}>
            You need to create a class first before adding assignments.
          </div>
        )}
        <div>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} placeholder="e.g. Build a Quiz Game" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
        </div>
        <div>
          <label style={labelStyle}>Class *</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={classId} onChange={e => setClassId(e.target.value)}>
            {classes.length === 0 ? <option value="">No classes yet</option> : classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Due Date</label>
          <input style={inputStyle} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Instructions for students..." value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Assignment Type</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={assignType} onChange={e => setAssignType(e.target.value)}>
            <option value="blocks">🧩 Block Coding</option>
            <option value="code">💻 Text Coding</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '10px 20px' }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={classes.length === 0} style={{ padding: '10px 20px', opacity: classes.length === 0 ? 0.5 : 1 }}>Create</button>
        </div>
      </div>
    </Modal>
  );
}

function InviteStudentsModal({ classes, onClose }) {
  const [selectedClass, setSelectedClass] = useState(classes[0] || null);
  const [copied, setCopied] = useState(false);

  const inviteLink = selectedClass ? `${window.location.origin}?join=${selectedClass.inviteCode}` : '';

  const copyCode = () => {
    navigator.clipboard.writeText(selectedClass?.inviteCode || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal title="👥 Invite Students" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {classes.length === 0 ? (
          <div style={{ padding: 16, borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
            Create a class first to get an invite code for students.
          </div>
        ) : (
          <>
            <div>
              <label style={labelStyle}>Select Class</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={selectedClass?.id || ''} onChange={e => setSelectedClass(classes.find(c => c.id === e.target.value))}>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {selectedClass && (
              <>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Invite Code</div>
                  <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 8, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{selectedClass.inviteCode}</div>
                  <button className="btn btn-secondary" onClick={copyCode} style={{ marginTop: 12, padding: '8px 20px', fontSize: 13 }}>
                    {copied ? '✅ Copied!' : '📋 Copy Code'}
                  </button>
                </div>

                <div>
                  <label style={labelStyle}>Or share this link</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input style={{ ...inputStyle, flex: 1, fontSize: 12, color: 'var(--text-muted)' }} value={inviteLink} readOnly />
                    <button className="btn btn-secondary" onClick={copyLink} style={{ padding: '10px 14px', whiteSpace: 'nowrap', fontSize: 13 }}>
                      Copy
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                  Share this code or link with your students. They'll enter it when signing up to join <strong>{selectedClass.name}</strong>.
                </p>
              </>
            )}
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '10px 20px' }}>Close</button>
        </div>
      </div>
    </Modal>
  );
}

function StudentsModal({ cls, onClose, onUpdate }) {
  const [students, setStudents] = useState(cls.students || []);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = (s) => { setEditingId(s.id); setEditName(s.name); };

  const saveEdit = async (studentId) => {
    if (!editName.trim()) return;
    setSaving(true);
    await updateStudentName(cls.id, studentId, editName.trim());
    const updated = students.map(s => s.id === studentId ? { ...s, name: editName.trim() } : s);
    setStudents(updated);
    onUpdate(cls.id, updated);
    setEditingId(null);
    setSaving(false);
  };

  return (
    <Modal title={`👥 Students — ${cls.name}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 340 }}>
        {students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            No students have joined yet.
          </div>
        ) : students.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {s.name.slice(0, 2).toUpperCase()}
            </div>
            {editingId === s.id ? (
              <>
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(s.id); if (e.key === 'Escape') setEditingId(null); }}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--accent-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13 }}
                />
                <button onClick={() => saveEdit(s.id)} disabled={saving} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                  {saving ? '...' : 'Save'}
                </button>
                <button onClick={() => setEditingId(null)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>✕</button>
              </>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</div>
                </div>
                <button onClick={() => startEdit(s)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>✏️ Rename</button>
              </>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}

function SubmissionsModal({ assignment, onClose }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = () => {
    setLoading(true);
    getSubmissionsForAssignment(assignment.id, assignment.classId).then(subs => {
      setSubmissions(subs);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assignment.id, assignment.classId]);

  const loadInGameBuilder = (sub) => {
    try {
      localStorage.setItem('cv_gamebuilder_sprites', JSON.stringify(sub.sprites || []));
      localStorage.setItem('cv_gamebuilder_bg', sub.background || 'Space');
      sessionStorage.setItem('bb-viewing-submission', JSON.stringify({ studentName: sub.studentName, assignmentTitle: assignment.title }));
    } catch {}
    window.location.hash = 'gamebuilder';
    onClose();
  };

  return (
    <Modal title={`📋 Submissions — ${assignment.title}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={fetchSubmissions} disabled={loading} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)' }}>
            {loading ? '⏳ Loading…' : '🔄 Refresh'}
          </button>
        </div>
        {loading && <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>Loading...</div>}
        {!loading && submissions.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>No submissions yet.</div>
        )}
        {submissions.map(sub => (
          <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {(sub.studentName || 'S').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{sub.studentName || sub.studentId}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Submitted {new Date(sub.submittedAt).toLocaleString()}</div>
            </div>
            {sub.assignType === 'blocks' && sub.sprites ? (
              <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => loadInGameBuilder(sub)}>
                🎮 View Project
              </button>
            ) : sub.assignType === 'blocks' ? (
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => {
                try {
                  const data = JSON.parse(sub.code || '{}');
                  if (data.screenshot) {
                    const w = window.open('', '_blank');
                    w.document.write(`<img src="${data.screenshot}" style="max-width:100%" /><p>${data.notes || ''}</p>`);
                  } else {
                    alert('No project data available.');
                  }
                } catch { alert('No project data available.'); }
              }}>
                📸 View Screenshot
              </button>
            ) : (
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => alert(sub.code)}>
                💻 View Code
              </button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default function TeacherDashboard({ onNavigate }) {
  const { user } = useUser();
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [managingClass, setManagingClass] = useState(null);
  const [showGClassroomModal, setShowGClassroomModal] = useState(false);

  useEffect(() => {
    const savedClasses = JSON.parse(localStorage.getItem('bb-classes') || '[]');
    setClasses(savedClasses);
    setAssignments(JSON.parse(localStorage.getItem('bb-assignments') || '[]'));
    savedClasses.forEach(async (cls) => {
      const students = await getClassStudents(cls.id);
      if (students.length > 0) {
        setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, students } : c));
      }
    });
  }, []);

  const handleClassCreated = (newClass) => {
    setClasses(prev => [...prev, newClass]);
    setShowCreateClass(false);
  };

  const handleAssignmentCreated = (a) => {
    setAssignments(prev => [...prev, a]);
    setShowCreateAssignment(false);
  };

  const deleteAssignment = (id) => {
    const updated = assignments.filter(a => a.id !== id);
    setAssignments(updated);
    localStorage.setItem('bb-assignments', JSON.stringify(updated));
    deleteAssignmentFromFirestore(id);
  };

  const deleteClass = (id) => {
    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);
    localStorage.setItem('bb-classes', JSON.stringify(updated));
  };

  const stats = [
    { label: 'Total Students', value: classes.reduce((s, c) => s + (c.students?.length || 0), 0), icon: '👥' },
    { label: 'Active Classes', value: classes.length, icon: '🏫' },
    { label: 'Assignments Due', value: assignments.filter(a => a.dueDate && new Date(a.dueDate) >= new Date()).length, icon: '📋' },
    { label: 'Avg. Class XP', value: 0, icon: '⭐' },
  ];

  const generateProgressReport = () => {
    const totalStudents = classes.reduce((s, c) => s + (c.students?.length || 0), 0);
    const totalAssignments = assignments.length;
    const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const classRows = classes.map(cls => {
      const clsAssignments = assignments.filter(a => a.classId === cls.id);
      const students = cls.students || [];
      const studentRows = students.length > 0
        ? students.map(s => `
          <tr>
            <td>${s.name || 'Student'}</td>
            <td>${s.email || '—'}</td>
            <td style="text-align:center">${s.xp || 0} XP</td>
            <td style="text-align:center">Level ${s.level || 1}</td>
            <td style="text-align:center">${s.streak || 0} days</td>
            <td style="text-align:center; color:${(s.xp || 0) >= 500 ? '#16a34a' : (s.xp || 0) >= 100 ? '#d97706' : '#dc2626'}">
              ${(s.xp || 0) >= 500 ? 'On Track' : (s.xp || 0) >= 100 ? 'Progressing' : 'Needs Support'}
            </td>
          </tr>`).join('')
        : '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:16px">No students enrolled yet</td></tr>';

      return `
        <div class="class-section">
          <h3>${cls.name} <span class="badge">${cls.grade}</span></h3>
          <p style="color:#64748b;font-size:13px;margin:0 0 16px">${cls.subject} · ${students.length} student${students.length !== 1 ? 's' : ''} · ${clsAssignments.length} assignment${clsAssignments.length !== 1 ? 's' : ''} · Invite code: <strong>${cls.inviteCode}</strong></p>
          <table>
            <thead>
              <tr><th>Student</th><th>Email</th><th>XP Earned</th><th>Level</th><th>Streak</th><th>Status</th></tr>
            </thead>
            <tbody>${studentRows}</tbody>
          </table>
          ${clsAssignments.length > 0 ? `
          <h4 style="margin-top:20px">Assignments</h4>
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>
              ${clsAssignments.map(a => `
                <tr>
                  <td>${a.title}</td>
                  <td>${a.assignType === 'blocks' ? 'Block Coding' : 'Text Coding'}</td>
                  <td>${a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-GB') : 'No due date'}</td>
                  <td style="color:${a.dueDate && new Date(a.dueDate) < new Date() ? '#dc2626' : '#16a34a'}">${a.dueDate && new Date(a.dueDate) < new Date() ? 'Overdue' : 'Active'}</td>
                </tr>`).join('')}
            </tbody>
          </table>` : ''}
        </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>ByteBuddies Progress Report — ${user?.name || 'Teacher'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; max-width: 960px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 32px; }
    .logo { font-size: 22px; font-weight: 800; color: #6366f1; }
    .report-title { font-size: 14px; color: #64748b; margin-top: 4px; }
    .meta { text-align: right; font-size: 13px; color: #64748b; }
    .summary { display: flex; gap: 16px; margin-bottom: 36px; }
    .stat-box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: center; }
    .stat-box .val { font-size: 28px; font-weight: 800; color: #6366f1; }
    .stat-box .lbl { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .class-section { margin-bottom: 40px; background: #fafbff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; break-inside: avoid; }
    .class-section h3 { font-size: 17px; color: #1e293b; margin-bottom: 4px; }
    .badge { background: #ede9fe; color: #6366f1; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 100px; margin-left: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
    th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    tr:last-child td { border-bottom: none; }
    .footer { margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">ByteBuddies</div>
      <div class="report-title">Student Progress Report</div>
    </div>
    <div class="meta">
      <div><strong>${user?.name || 'Teacher'}</strong></div>
      <div>${user?.email || ''}</div>
      <div>Generated: ${now}</div>
    </div>
  </div>
  <div class="summary">
    <div class="stat-box"><div class="val">${classes.length}</div><div class="lbl">Classes</div></div>
    <div class="stat-box"><div class="val">${totalStudents}</div><div class="lbl">Students</div></div>
    <div class="stat-box"><div class="val">${totalAssignments}</div><div class="lbl">Assignments</div></div>
    <div class="stat-box"><div class="val">${assignments.filter(a => a.dueDate && new Date(a.dueDate) >= new Date()).length}</div><div class="lbl">Active Tasks</div></div>
  </div>
  ${classes.length === 0 ? '<p style="text-align:center;color:#94a3b8;padding:40px">No classes created yet.</p>' : classRows}
  <div class="footer">
    <span>ByteBuddies · Aligned to UK National Curriculum (Computing) · bytebuddies.io</span>
    <span>Confidential — for school use only</span>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  };

  const resources = [
    { icon: '📖', title: 'Lesson Plans', desc: 'Download ready-made lesson plans aligned to UK National Curriculum for every ByteBuddies unit', action: 'View', onClick: () => { window.location.hash = 'whitepaper'; } },
    { icon: '🎯', title: 'Curriculum Guide', desc: 'Full mapping of ByteBuddies content to UK NC Computing, CSTA, and Cambridge Digital Literacy frameworks', action: 'View', onClick: () => { window.location.hash = 'whitepaper'; } },
    { icon: '📊', title: 'Progress Reports', desc: 'Generate a printable progress report for all your classes — perfect for parents evenings and school leadership', action: 'Generate Report', onClick: generateProgressReport, active: true },
  ];

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {showCreateClass && <CreateClassModal onClose={() => setShowCreateClass(false)} onCreated={handleClassCreated} teacher={user} />}
      {showCreateAssignment && <CreateAssignmentModal classes={classes} onClose={() => setShowCreateAssignment(false)} onCreated={handleAssignmentCreated} />}
      {showInvite && <InviteStudentsModal classes={classes} onClose={() => setShowInvite(false)} />}
      {managingClass && <StudentsModal cls={managingClass} onClose={() => setManagingClass(null)} onUpdate={(classId, updated) => setClasses(prev => prev.map(c => c.id === classId ? { ...c, students: updated } : c))} />}
      {viewingSubmissions && <SubmissionsModal assignment={viewingSubmissions} onClose={() => setViewingSubmissions(null)} />}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Welcome back, {user.name}! 👩‍🏫
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
          Manage your classes and track student progress
        </p>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {stats.map(stat => (
          <div key={stat.label} style={statCard}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={sectionCard}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600 }} onClick={() => setShowCreateClass(true)}>
            ＋ Create Class
          </button>
          <button className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600 }} onClick={() => setShowCreateAssignment(true)}>
            📋 Create Assignment
          </button>
          <button className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600 }} onClick={() => setShowInvite(true)}>
            👥 Invite Students
          </button>
          <button className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600 }} onClick={generateProgressReport}>
            📄 Export Report
          </button>
          <button style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(66,133,244,0.12)', border: '1px solid rgba(66,133,244,0.3)', borderRadius: 8, color: '#4285F4', cursor: 'pointer' }} onClick={() => setShowGClassroomModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
              <path d="M8 9h8v6H8z" fill="white"/>
              <path d="M10 11h4v2h-4z" fill="#4285F4"/>
            </svg>
            Google Classroom
          </button>
        </div>
      </div>

      {/* Google Classroom Modal */}
      {showGClassroomModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowGClassroomModal(false)}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 20, width: '100%', maxWidth: 440, border: '1px solid var(--border-color)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(66,133,244,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔗</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Google Classroom Sync</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Import your class roster automatically</div>
              </div>
              <button onClick={() => setShowGClassroomModal(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ background: 'rgba(66,133,244,0.08)', border: '1px solid rgba(66,133,244,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: '#4285F4', fontWeight: 600, marginBottom: 6 }}>How it works</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Sign in with your school Google account', 'Select which Classroom class to import', 'Students are added automatically — no invite codes needed', 'Assignments can be pushed back to Google Classroom'].map((s, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                    <span style={{ color: '#4285F4', fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#f59e0b' }}>
              Google Classroom integration is available on the School plan. Contact us to enable it for your school.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowGClassroomModal(false)} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>Close</button>
              <button onClick={() => { alert('Contact us at hello@bytebuddies.io to enable Google Classroom for your school.'); setShowGClassroomModal(false); }} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Contact Us →</button>
            </div>
          </div>
        </div>
      )}

      {/* My Classes */}
      <div style={sectionCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Classes</h2>
          {classes.length > 0 && (
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => setShowCreateClass(true)}>
              ＋ New Class
            </button>
          )}
        </div>

        {classes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏫</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>No classes yet</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.6 }}>
              Create your first class to start managing students and assignments
            </p>
            <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600 }} onClick={() => setShowCreateClass(true)}>
              Create your first class
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {classes.map(cls => (
              <div key={cls.id} style={{ background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-color)', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{cls.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{cls.subject} · {cls.grade}</div>
                  </div>
                  <button onClick={() => deleteClass(cls.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: 4 }} title="Delete class">🗑️</button>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>👥 {cls.students?.length || 0} students</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📋 {assignments.filter(a => a.classId === cls.id).length} assignments</div>
                  <button onClick={() => setManagingClass(cls)} style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'none', color: 'var(--accent-primary)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    ✏️ Manage Students
                  </button>
                </div>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Invite code:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 14, color: 'var(--accent-primary)', letterSpacing: 2 }}>{cls.inviteCode}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignments */}
      {assignments.length > 0 && (
        <div style={sectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Assignments</h2>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => setShowCreateAssignment(true)}>＋ New</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {assignments.map(a => {
              const cls = classes.find(c => c.id === a.classId);
              const isOverdue = a.dueDate && new Date(a.dueDate) < new Date();
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 20 }}>📋</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{cls?.name || 'Unknown class'}</div>
                  </div>
                  {a.dueDate && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: isOverdue ? '#ef4444' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {isOverdue ? '⚠️ Overdue' : `Due ${new Date(a.dueDate).toLocaleDateString()}`}
                    </div>
                  )}
                  <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px', flexShrink: 0 }} onClick={() => setViewingSubmissions(a)}>
                    👁️ Submissions
                  </button>
                  <button onClick={() => { if (window.confirm(`Delete "${a.title}"?`)) deleteAssignment(a.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, padding: '4px 6px', flexShrink: 0 }} title="Delete assignment">🗑️</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Student Activity */}
      <div style={sectionCard}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px' }}>Recent Student Activity</h2>
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
          <p style={{ fontSize: 13, margin: 0 }}>No students enrolled yet. Share your class invite code to get started.</p>
        </div>
      </div>

      {/* Resources for Teachers */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Resources for Teachers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {resources.map(r => (
            <div key={r.title} style={sectionCard}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{r.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>{r.title}</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>{r.desc}</p>
              {r.active ? (
                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600 }} onClick={r.onClick}>
                  {r.action}
                </button>
              ) : (
                <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600 }} onClick={r.onClick}>
                  {r.action}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
