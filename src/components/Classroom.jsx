import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { useClassroom } from '../contexts/ClassroomContext';
import { getAssignmentsForClass, getClassData, saveSubmissionToFirestore } from '../firebase';

/* ─── helpers ─── */
const diffColor  = d => d === 'Easy' ? '#22c55e' : d === 'Medium' ? '#f59e0b' : '#ef4444';
const gradeColor = g => g?.startsWith('A') ? '#22c55e' : g?.startsWith('B') ? '#6366f1' : g?.startsWith('C') ? '#f59e0b' : '#ef4444';
const fmtDate    = iso => iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
const fmtTime    = iso => iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';

function Avatar({ emoji, size = 36, color = '#6366f1' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}22`, border: `2px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.55, flexShrink: 0,
    }}>{emoji}</div>
  );
}

function StatCard({ icon, value, label, color = '#6366f1', sub }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
      borderRadius: 14, padding: '16px 20px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ProgressRing({ pct, size = 48, color = '#6366f1' }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+4} textAnchor="middle" fontSize={11} fontWeight="700" fill={color}>{pct}%</text>
    </svg>
  );
}

/* ─── Code viewer with feedback panel ─── */
function CodeReviewer({ submission, student, assignment, onClose, onSave }) {
  const [grade, setGrade]       = useState(submission?.grade || '');
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const grades = ['A+','A','A-','B+','B','B-','C+','C','C-','D','F'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 820, width: '96vw' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ marginBottom: 2 }}>📄 {assignment?.title}</h2>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{student?.name} · {submission?.language} · Submitted {fmtDate(submission?.submittedAt)} {fmtTime(submission?.submittedAt)}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: 0, display: 'flex', gap: 0 }}>
          {/* code pane */}
          <pre style={{
            flex: 1, margin: 0, padding: '16px 20px',
            background: 'var(--bg-tertiary)', fontFamily: 'var(--font-mono)',
            fontSize: 13, lineHeight: 1.7, overflowX: 'auto',
            maxHeight: '55vh', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            borderRight: '1px solid var(--border-color)',
          }}>{submission?.code || '// No code submitted'}</pre>
          {/* feedback pane */}
          <div style={{ width: 260, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Grade</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {grades.map(g => (
                  <button key={g} onClick={() => setGrade(g)} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                    border: `2px solid ${grade === g ? gradeColor(g) : 'var(--border-color)'}`,
                    background: grade === g ? `${gradeColor(g)}22` : 'var(--bg-secondary)',
                    color: grade === g ? gradeColor(g) : 'var(--text-muted)', cursor: 'pointer',
                  }}>{g}</button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Feedback</div>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                placeholder="Write feedback for the student…"
                style={{
                  width: '100%', minHeight: 140, padding: 10, borderRadius: 8,
                  background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)', fontSize: 12, lineHeight: 1.6, resize: 'vertical',
                  fontFamily: 'var(--font-sans)',
                }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Quick feedback</div>
              {['Great work! 🌟','Needs more comments 💬','Check your logic 🧠','Almost there! 💪','Excellent solution! 🏆'].map(q => (
                <button key={q} onClick={() => setFeedback(f => f ? f + '\n' + q : q)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px', marginBottom: 4, borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(grade, feedback); onClose(); }}>
            ✅ Save Review
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Assignment templates ─── */
const TEMPLATES = [
  { title: 'Hello World', desc: 'Write a program that prints "Hello, World!" and your name.', language: 'Python', difficulty: 'Easy', points: 10, type: 'coding' },
  { title: 'Number Guessing Game', desc: 'Create a game where the computer picks a random number and the player guesses it.', language: 'Python', difficulty: 'Medium', points: 30, type: 'coding' },
  { title: 'Build a Calculator', desc: 'Create a working calculator using variables and arithmetic operators (+, -, ×, ÷).', language: 'Python', difficulty: 'Easy', points: 20, type: 'coding' },
  { title: 'Personal Profile Page', desc: 'Design your own webpage with a photo, about me section, hobbies list, and favourite links.', language: 'HTML/CSS', difficulty: 'Easy', points: 25, type: 'project' },
  { title: 'Interactive Quiz', desc: 'Build a 5-question quiz on any topic with a score counter and final result.', language: 'JavaScript', difficulty: 'Medium', points: 40, type: 'project' },
  { title: 'Platformer Game', desc: 'Create a side-scrolling platformer with player movement, platforms, and collectibles.', language: 'JavaScript', difficulty: 'Hard', points: 60, type: 'project' },
  { title: 'Data Analysis', desc: 'Analyse a dataset of your choice, produce 3 graphs, and write a summary of findings.', language: 'Python', difficulty: 'Hard', points: 50, type: 'project' },
  { title: 'API Weather App', desc: 'Build a web app that fetches weather data and displays it nicely with icons.', language: 'JavaScript', difficulty: 'Hard', points: 55, type: 'project' },
];

/* ─── New assignment modal ─── */
function NewAssignmentModal({ onClose, onSubmit }) {
  const [tab, setTab] = useState('template'); // 'template' | 'custom'
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [lang, setLang] = useState('Python');
  const [due, setDue] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [points, setPoints] = useState('20');
  const [type, setType] = useState('coding');

  const submit = (data) => {
    if (!data.title?.trim()) return;
    onSubmit({ ...data, due: data.due || '2026-05-01' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 700, width: '95vw' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ New Assignment</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 4 }}>
          {[['template','📚 Templates'],['custom','✏️ Custom']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: tab === id ? 700 : 400, color: tab === id ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: tab === id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              fontSize: 13,
            }}>{label}</button>
          ))}
        </div>
        {tab === 'template' ? (
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {TEMPLATES.map(t => (
                <button key={t.title} onClick={() => submit({ ...t, due: '' })}
                  style={{
                    textAlign: 'left', padding: 14, borderRadius: 12,
                    border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>{t.desc}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: `${diffColor(t.difficulty)}22`, color: diffColor(t.difficulty), fontWeight: 700 }}>{t.difficulty}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{t.language}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#6366f122', color: '#6366f1' }}>🏆 {t.points}pts</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Title *</label>
              <input className="input" placeholder="e.g. Build a Calculator" value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Description</label>
              <textarea className="input" placeholder="What should students build?" rows={3} value={desc} onChange={e => setDesc(e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Language</label>
                <select className="select w-full" value={lang} onChange={e => setLang(e.target.value)}>
                  <option>Python</option><option>JavaScript</option><option>HTML/CSS</option><option>Blocks</option>
                </select></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Due Date</label>
                <input className="input" type="date" value={due} onChange={e => setDue(e.target.value)} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Difficulty</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Easy','Medium','Hard'].map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: `2px solid ${difficulty === d ? diffColor(d) : 'var(--border-color)'}`, background: difficulty === d ? `${diffColor(d)}22` : 'var(--bg-secondary)', color: difficulty === d ? diffColor(d) : 'var(--text-muted)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      {d}
                    </button>
                  ))}
                </div></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Points</label>
                <input className="input" type="number" value={points} onChange={e => setPoints(e.target.value)} min="1" max="100" /></div>
            </div>
          </div>
        )}
        {tab === 'custom' && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => submit({ title, desc, language: lang, due, difficulty, points: parseInt(points) || 20, type })}>Create</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Countdown Timer widget ─── */
function CountdownTimer({ seconds: initialSecs }) {
  const [secs, setSecs] = useState(initialSecs);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running && secs > 0) {
      ref.current = setInterval(() => setSecs(s => {
        if (s <= 1) { clearInterval(ref.current); setRunning(false); return 0; }
        return s - 1;
      }), 1000);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  const pct = initialSecs > 0 ? ((initialSecs - secs) / initialSecs) * 100 : 0;
  const col = secs < 30 ? '#ef4444' : secs < 120 ? '#f59e0b' : '#22c55e';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 0' }}>
      <div style={{ fontSize: 52, fontWeight: 900, fontFamily: 'monospace', color: col, letterSpacing: 2 }}>{m}:{s}</div>
      <div style={{ width: 200, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: col, transition: 'width 1s linear, background 0.3s' }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className={`btn btn-sm ${running ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setRunning(r => !r)}>{running ? '⏸ Pause' : '▶ Start'}</button>
        <button className="btn btn-secondary btn-sm" onClick={() => { setSecs(initialSecs); setRunning(false); }}>↺ Reset</button>
        {[300, 600, 900, 1800].map(t => (
          <button key={t} className="btn btn-ghost btn-sm" onClick={() => { setSecs(t); setRunning(false); }}>{t/60}m</button>
        ))}
      </div>
    </div>
  );
}

/* ─── Student card (expanded) ─── */
function StudentCard({ student, assignments, submissions, onClose }) {
  const mySubmissions = assignments.map(a => ({
    ...a,
    sub: submissions[a.id]?.[student.id] || null,
  }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600, width: '95vw' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar emoji={student.avatarEmoji} size={52} color={gradeColor(student.grade)} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{student.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Joined {fmtDate(student.joinedDate)} · Last active {fmtDate(student.lastActive)}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Grade', value: student.grade, color: gradeColor(student.grade) },
              { label: 'Progress', value: `${student.progress}%`, color: '#6366f1' },
              { label: 'XP', value: `${student.xp}`, color: '#f59e0b' },
              { label: 'Streak', value: `🔥 ${student.streak}d`, color: '#ef4444' },
            ].map(st => (
              <div key={st.label} style={{ textAlign: 'center', padding: 12, background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: st.color }}>{st.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{st.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Assignment Progress</div>
          {mySubmissions.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: 18 }}>{a.sub ? '✅' : '⭕'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                {a.sub?.feedback && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>"{a.sub.feedback}"</div>}
              </div>
              {a.sub?.grade && (
                <span style={{ fontWeight: 800, fontSize: 14, color: gradeColor(a.sub.grade) }}>{a.sub.grade}</span>
              )}
              {!a.sub && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Not submitted</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TEACHER VIEW
═══════════════════════════════════════════════════════════════════════ */
function TeacherView({ viewMode, setViewMode }) {
  const { classroom, addAssignment, deleteAssignment, reviewSubmission,
          addAnnouncement, deleteAnnouncement, togglePinAnnouncement,
          markAttendance, resolveHelp, renameStudent, getAssignmentSubmissions } = useClassroom();

  const [tab, setTab] = useState('overview');
  const [showNewAssignment, setShowNewAssignment] = useState(false);
  const [reviewing, setReviewing]   = useState(null); // { submission, student, assignment }
  const [viewingStudent, setViewingStudent] = useState(null);
  const [search, setSearch]         = useState('');
  const [annText, setAnnText]       = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal]   = useState('');
  const [annPinned, setAnnPinned]   = useState(false);
  const [attendanceToday, setAttendanceToday] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return new Set(classroom.attendance[today] || classroom.students.map(s => s.id));
  });
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  const filteredStudents = useMemo(() =>
    classroom.students.filter(s => s.name.toLowerCase().includes(search.toLowerCase())),
    [classroom.students, search]
  );

  // Compute class stats
  const totalSubmissions = Object.values(classroom.submissions).reduce((n, byStudent) => n + Object.keys(byStudent).length, 0);
  const atRisk = classroom.students.filter(s => s.streak <= 1 || s.progress < 60);
  const avgProgress = Math.round(classroom.students.reduce((s, st) => s + st.progress, 0) / (classroom.students.length || 1));
  const classHealth = Math.round((1 - atRisk.length / Math.max(classroom.students.length, 1)) * 100);

  const TABS = [
    { id: 'overview',     label: 'Overview',     icon: '📊' },
    { id: 'students',     label: 'Students',     icon: '👩‍🎓' },
    { id: 'assignments',  label: 'Assignments',  icon: '📋' },
    { id: 'submissions',  label: 'Submissions',  icon: '📤' },
    { id: 'grades',       label: 'Grades',       icon: '🏆' },
    { id: 'leaderboard',  label: 'Leaderboard',  icon: '🥇' },
    { id: 'announcements',label: 'Announcements',icon: '📣' },
    { id: 'tools',        label: 'Tools',        icon: '🛠️' },
  ];

  return (
    <div className="page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* View toggle */}
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>🏫 {classroom.className}</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Class code: <strong style={{ color: 'var(--accent-primary)', letterSpacing: 2, fontSize: 15 }}>{classroom.classCode}</strong>
            <span style={{ marginLeft: 16 }}>{classroom.students.length} students</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewAssignment(true)}>➕ New Assignment</button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            fontWeight: tab === t.id ? 700 : 400, fontSize: 13,
            color: tab === t.id ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: tab === t.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <StatCard icon="👩‍🎓" value={classroom.students.length} label="Students" color="#6366f1" />
            <StatCard icon="📋" value={classroom.assignments.length} label="Assignments" color="#f59e0b" />
            <StatCard icon="📤" value={totalSubmissions} label="Total Submissions" color="#22c55e" />
            <StatCard icon="❤️" value={`${classHealth}%`} label="Class Health" color={classHealth >= 80 ? '#22c55e' : classHealth >= 60 ? '#f59e0b' : '#ef4444'}
              sub={`${atRisk.length} at risk`} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* At-risk students */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚠️</span> At-Risk Students
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>Low streak or progress below 60%</span>
              </div>
              {atRisk.length === 0 ? (
                <div style={{ color: '#22c55e', fontSize: 13, padding: '12px 0' }}>✅ All students on track!</div>
              ) : atRisk.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                  onClick={() => setViewingStudent(s)}>
                  <Avatar emoji={s.avatarEmoji} size={32} color="#ef4444" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Progress: {s.progress}% · Streak: {s.streak}d</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#ef444422', color: '#ef4444', fontWeight: 700 }}>
                    {s.progress < 60 ? 'Low progress' : 'No streak'}
                  </span>
                </div>
              ))}
            </div>

            {/* Class progress overview */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📈 Class Progress</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Average Progress</span>
                  <span style={{ fontWeight: 700 }}>{avgProgress}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-tertiary)' }}>
                  <div style={{ width: `${avgProgress}%`, height: '100%', borderRadius: 4, background: 'var(--accent-primary)', transition: 'width 0.6s' }} />
                </div>
              </div>
              {classroom.students.slice().sort((a, b) => b.progress - a.progress).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}
                  onClick={() => setViewingStudent(s)}>
                  <span style={{ fontSize: 16 }}>{s.avatarEmoji}</span>
                  <span style={{ fontSize: 12, width: 100, flexShrink: 0 }}>{s.name.split(' ')[0]}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)' }}>
                    <div style={{ width: `${s.progress}%`, height: '100%', borderRadius: 3, background: s.progress >= 80 ? '#22c55e' : s.progress >= 60 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 32, textAlign: 'right' }}>{s.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment submission overview */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📋 Assignment Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {classroom.assignments.map(a => {
                const subs = getAssignmentSubmissions(a.id);
                const count = Object.keys(subs).length;
                const reviewed = Object.values(subs).filter(s => s.reviewed).length;
                const pct = Math.round((count / Math.max(classroom.students.length, 1)) * 100);
                const overdue = new Date(a.due) < new Date();
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <ProgressRing pct={pct} size={44} color={pct === 100 ? '#22c55e' : '#6366f1'} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</span>
                        {overdue && count < classroom.students.length && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: '#ef444422', color: '#ef4444' }}>Overdue</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {count}/{classroom.students.length} submitted · {reviewed} reviewed · Due {fmtDate(a.due)}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab('submissions')}>View →</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── STUDENTS ── */}
      {tab === 'students' && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>All Students</span>
            <input className="input" placeholder="🔍 Search…" style={{ width: 200, fontSize: 12 }} value={search} onChange={e => setSearch(e.target.value)} />
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{filteredStudents.length} students</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr', padding: '10px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <span>Student</span><span>Progress</span><span>Grade</span><span>XP</span><span>Tasks</span><span>Streak</span>
          </div>
          {filteredStudents.map((s, i) => (
            <div key={s.id} onClick={() => setViewingStudent(s)}
              style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr', padding: '14px 20px', borderTop: '1px solid var(--border-color)', alignItems: 'center', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 18 }}>#{i + 1}</span>
                <Avatar emoji={s.avatarEmoji} size={36} color={gradeColor(s.grade)} />
                <div>
                  {renamingId === s.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        className="input"
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { renameStudent(s.id, renameVal.trim() || s.name); setRenamingId(null); }
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        style={{ fontSize: 12, padding: '3px 8px', width: 130 }}
                      />
                      <button onClick={() => { renameStudent(s.id, renameVal.trim() || s.name); setRenamingId(null); }}
                        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer' }}>✓</button>
                      <button onClick={() => setRenamingId(null)}
                        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: 'none', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer' }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                      <button
                        title="Assign name"
                        onClick={e => { e.stopPropagation(); setRenamingId(s.id); setRenameVal(s.name); }}
                        style={{ fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, opacity: 0.6 }}
                      >✏️</button>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last active {fmtDate(s.lastActive)}</div>
                </div>
                {s.streak <= 1 && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: '#ef444422', color: '#ef4444' }}>At risk</span>}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', maxWidth: 80 }}>
                    <div style={{ width: `${s.progress}%`, height: '100%', borderRadius: 3, background: s.progress >= 80 ? '#22c55e' : s.progress >= 60 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <span style={{ fontSize: 11 }}>{s.progress}%</span>
                </div>
              </div>
              <span style={{ fontWeight: 700, color: gradeColor(s.grade) }}>{s.grade}</span>
              <span style={{ fontSize: 12 }}>⚡ {s.xp}</span>
              <span style={{ fontSize: 12 }}>{s.completed}</span>
              <span style={{ fontSize: 12 }}>🔥 {s.streak}d</span>
            </div>
          ))}
        </div>
      )}

      {/* ── ASSIGNMENTS ── */}
      {tab === 'assignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {classroom.assignments.map(a => {
            const subs = getAssignmentSubmissions(a.id);
            const count = Object.keys(subs).length;
            const reviewed = Object.values(subs).filter(s => s.reviewed).length;
            const overdue = new Date(a.due) < new Date();
            return (
              <div key={a.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <ProgressRing pct={Math.round(count / Math.max(classroom.students.length, 1) * 100)} size={56} color="#6366f1" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{a.title}</h3>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `${diffColor(a.difficulty)}22`, color: diffColor(a.difficulty), fontWeight: 700 }}>{a.difficulty}</span>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{a.language}</span>
                      {a.points && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#6366f122', color: '#6366f1', fontWeight: 700 }}>🏆 {a.points} pts</span>}
                      {overdue && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#ef444422', color: '#ef4444' }}>Overdue</span>}
                    </div>
                    {a.desc && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 10px' }}>{a.desc}</p>}
                    <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>📅 Due {fmtDate(a.due)}</span>
                      <span>📤 {count}/{classroom.students.length} submitted</span>
                      <span>✅ {reviewed} reviewed</span>
                      <span>⏳ {classroom.students.length - count} pending</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setTab('submissions')}>View Submissions</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-danger)' }} onClick={() => deleteAssignment(a.id)}>🗑️</button>
                  </div>
                </div>
                {/* Student submission chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                  {classroom.students.map(s => {
                    const sub = subs[s.id];
                    return (
                      <div key={s.id} title={sub ? `${s.name} — submitted` : `${s.name} — not submitted`}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: sub ? (sub.reviewed ? '#22c55e22' : '#6366f122') : 'var(--bg-tertiary)',
                          color: sub ? (sub.reviewed ? '#22c55e' : '#6366f1') : 'var(--text-muted)',
                          border: `1px solid ${sub ? (sub.reviewed ? '#22c55e44' : '#6366f144') : 'var(--border-color)'}`,
                        }}>
                        {s.avatarEmoji} {s.name.split(' ')[0]}
                        {sub && <span>{sub.reviewed ? ' ✅' : ' •'}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {classroom.assignments.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>📝</div>
              <p>No assignments yet.</p>
              <button className="btn btn-primary" onClick={() => setShowNewAssignment(true)}>➕ Create First Assignment</button>
            </div>
          )}
        </div>
      )}

      {/* ── SUBMISSIONS ── */}
      {tab === 'submissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {classroom.assignments.map(a => {
            const subs = getAssignmentSubmissions(a.id);
            const entries = Object.entries(subs);
            const pending = classroom.students.filter(s => !subs[s.id]);
            return (
              <div key={a.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{a.title}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{entries.length} submitted · {pending.length} pending</span>
                </div>
                {entries.length === 0 ? (
                  <div style={{ padding: '20px', fontSize: 13, color: 'var(--text-muted)' }}>No submissions yet.</div>
                ) : entries.map(([studentId, sub]) => {
                  const student = classroom.students.find(s => String(s.id) === String(studentId));
                  return (
                    <div key={studentId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
                      <Avatar emoji={student?.avatarEmoji || '🧑‍💻'} size={36} color={gradeColor(sub.grade)} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{student?.name || 'Student'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {sub.language} · {fmtDate(sub.submittedAt)} {fmtTime(sub.submittedAt)}
                          {sub.reviewed && <span style={{ color: '#22c55e', marginLeft: 8 }}>✅ Reviewed</span>}
                        </div>
                        {sub.feedback && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontStyle: 'italic' }}>"{sub.feedback}"</div>}
                      </div>
                      {sub.grade && (
                        <span style={{ fontWeight: 800, fontSize: 16, color: gradeColor(sub.grade), width: 36, textAlign: 'center' }}>{sub.grade}</span>
                      )}
                      <button className="btn btn-primary btn-sm" onClick={() => setReviewing({ submission: sub, student, assignment: a })}>
                        {sub.reviewed ? '✏️ Edit' : '📝 Review'}
                      </button>
                    </div>
                  );
                })}
                {pending.length > 0 && (
                  <div style={{ padding: '12px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Awaiting: </span>
                    {pending.map(s => (
                      <span key={s.id} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                        {s.avatarEmoji} {s.name.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── GRADES ── */}
      {tab === 'grades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Grade distribution */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Grade Distribution</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
              {['A','B','C','D','F'].map(g => {
                const count = classroom.students.filter(s => s.grade.startsWith(g)).length;
                const col = gradeColor(g + '+');
                return (
                  <div key={g} style={{ textAlign: 'center', padding: 16, background: `${col}11`, borderRadius: 12, border: `1px solid ${col}33` }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: col }}>{count}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: col }}>Grade {g}</div>
                  </div>
                );
              })}
            </div>
            {/* Bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, padding: '0 10px' }}>
              {['A+','A','A-','B+','B','B-','C+','C','C-','D','F'].map(g => {
                const count = classroom.students.filter(s => s.grade === g).length;
                return (
                  <div key={g} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', background: gradeColor(g), borderRadius: '4px 4px 0 0', height: count * 24, minHeight: count > 0 ? 8 : 0, transition: 'height 0.3s' }} />
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{g}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Per-student grades */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: 15 }}>Individual Grades</div>
            <div style={{ display: 'grid', gridTemplateColumns: `2fr repeat(${Math.min(classroom.assignments.length, 3)}, 1fr) 1fr`, padding: '10px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <span>Student</span>
              {classroom.assignments.slice(0, 3).map(a => <span key={a.id} title={a.title}>{a.title.substring(0,12)}…</span>)}
              <span>Overall</span>
            </div>
            {classroom.students.map(s => {
              const grades = classroom.assignments.slice(0, 3).map(a => classroom.submissions[a.id]?.[s.id]?.grade || null);
              return (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: `2fr repeat(${Math.min(classroom.assignments.length, 3)}, 1fr) 1fr`, padding: '12px 20px', borderTop: '1px solid var(--border-color)', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{s.avatarEmoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                  </div>
                  {grades.map((g, i) => (
                    <span key={i} style={{ fontWeight: 700, color: g ? gradeColor(g) : 'var(--text-muted)', fontSize: 13 }}>{g || '—'}</span>
                  ))}
                  <span style={{ fontWeight: 800, color: gradeColor(s.grade), fontSize: 15 }}>{s.grade}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LEADERBOARD ── */}
      {tab === 'leaderboard' && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>🏆 Class Leaderboard</h3>
            <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: 13 }}>Ranked by XP earned</p>
          </div>
          {classroom.students.slice().sort((a, b) => b.xp - a.xp).map((s, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
            return (
              <div key={s.id} onClick={() => setViewingStudent(s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                  borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
                  background: i < 3 ? `rgba(99,102,241,${0.04 * (3 - i)})` : '',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                onMouseLeave={e => { e.currentTarget.style.background = i < 3 ? `rgba(99,102,241,${0.04 * (3 - i)})` : ''; }}
              >
                <div style={{ width: 36, textAlign: 'center', fontSize: medal ? 24 : 14, fontWeight: 700, color: 'var(--text-muted)' }}>
                  {medal || `#${i + 1}`}
                </div>
                <Avatar emoji={s.avatarEmoji} size={44} color={gradeColor(s.grade)} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Grade {s.grade} · {s.completed} tasks · 🔥 {s.streak}d streak
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>⚡{s.xp}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>XP</div>
                </div>
                <div style={{ width: 100 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}><span>Progress</span><span>{s.progress}%</span></div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-tertiary)' }}>
                    <div style={{ width: `${s.progress}%`, height: '100%', borderRadius: 2, background: 'var(--accent-primary)' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ANNOUNCEMENTS ── */}
      {tab === 'announcements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Post form */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>📣 Post Announcement</div>
            <textarea value={annText} onChange={e => setAnnText(e.target.value)}
              placeholder="Write a message to the class…"
              style={{ width: '100%', minHeight: 80, padding: 12, borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6, resize: 'vertical', marginBottom: 10, fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={annPinned} onChange={e => setAnnPinned(e.target.checked)} />
                📌 Pin to top
              </label>
              <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}
                onClick={() => { if (annText.trim()) { addAnnouncement(annText.trim(), annPinned); setAnnText(''); setAnnPinned(false); } }}>
                Post
              </button>
            </div>
          </div>
          {/* Announcements list */}
          {[...classroom.announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(ann => (
            <div key={ann.id} style={{
              background: 'var(--bg-secondary)', border: `1px solid ${ann.pinned ? '#6366f1' : 'var(--border-color)'}`,
              borderRadius: 14, padding: 18,
              borderLeft: ann.pinned ? '4px solid #6366f1' : undefined,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  {ann.pinned && <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', display: 'block', marginBottom: 6 }}>📌 PINNED</span>}
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{ann.text}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                    {ann.author} · {fmtDate(ann.createdAt)} {fmtTime(ann.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => togglePinAnnouncement(ann.id)} title={ann.pinned ? 'Unpin' : 'Pin'}>
                    {ann.pinned ? '📌' : '📍'}
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-danger)' }} onClick={() => deleteAnnouncement(ann.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
          {classroom.announcements.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No announcements yet.</div>}
        </div>
      )}

      {/* ── TOOLS ── */}
      {tab === 'tools' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Countdown timer */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>⏱️ Class Timer</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Timed activities &amp; tests</div>
            <CountdownTimer seconds={600} />
          </div>
          {/* Attendance */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>📋 Today's Attendance</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Mark who is present today</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {classroom.students.map(s => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <input type="checkbox"
                    checked={attendanceToday.has(s.id)}
                    onChange={e => setAttendanceToday(prev => {
                      const next = new Set(prev);
                      e.target.checked ? next.add(s.id) : next.delete(s.id);
                      return next;
                    })} />
                  <span style={{ fontSize: 18 }}>{s.avatarEmoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                </label>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: '100%' }}
              onClick={() => { markAttendance([...attendanceToday]); setAttendanceSaved(true); setTimeout(() => setAttendanceSaved(false), 3000); }}>
              {attendanceSaved ? '✅ Saved!' : 'Save Attendance'}
            </button>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
              {attendanceToday.size}/{classroom.students.length} present
            </div>
          </div>
          {/* Help requests */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 24, gridColumn: '1 / -1' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🙋 Help Requests</div>
            {classroom.helpRequests.filter(h => !h.resolved).length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>✅ No pending help requests</div>
            ) : classroom.helpRequests.filter(h => !h.resolved).map(h => {
              const student = classroom.students.find(s => s.id === h.studentId);
              return (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 22 }}>{student?.avatarEmoji || '🧑‍💻'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{student?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.message}</div>
                  </div>
                  <button className="btn btn-success btn-sm" onClick={() => resolveHelp(h.id)}>✅ Done</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {showNewAssignment && <NewAssignmentModal onClose={() => setShowNewAssignment(false)} onSubmit={addAssignment} />}
      {reviewing && (
        <CodeReviewer
          submission={reviewing.submission}
          student={reviewing.student}
          assignment={reviewing.assignment}
          onClose={() => setReviewing(null)}
          onSave={(grade, feedback) => reviewSubmission(reviewing.assignment.id, reviewing.student.id, grade, feedback)}
        />
      )}
      {viewingStudent && (
        <StudentCard
          student={viewingStudent}
          assignments={classroom.assignments}
          submissions={classroom.submissions}
          onClose={() => setViewingStudent(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STUDENT VIEW
═══════════════════════════════════════════════════════════════════════ */
function StudentView({ viewMode, setViewMode }) {
  const { user } = useUser();
  const { classroom, submitWork, getSubmission, raiseHand } = useClassroom();
  const [tab, setTab] = useState('assignments');
  const [submitting, setSubmitting] = useState(null);
  const [viewingOwn, setViewingOwn] = useState(null);
  const [helpMsg, setHelpMsg] = useState('');
  const [helpSent, setHelpSent] = useState(false);
  const [realAssignments, setRealAssignments] = useState(null);
  const [realClass, setRealClass] = useState(null);

  useEffect(() => {
    if (user.classroomId) {
      getAssignmentsForClass(user.classroomId).then(setRealAssignments);
      getClassData(user.classroomId).then(setRealClass);
    }
  }, [user.classroomId]);

  const assignments = realAssignments ?? classroom.assignments;
  const className = realClass?.name ?? classroom.className;
  const classStudents = realClass?.students ?? classroom.students;

  const studentId = 1;

  const myAssignments = assignments.map(a => ({
    ...a,
    submission: getSubmission(a.id, studentId),
  }));

  const submitted = myAssignments.filter(a => a.submission).length;
  const reviewed = myAssignments.filter(a => a.submission?.reviewed).length;

  const TABS = [
    { id: 'assignments', label: 'My Work', icon: '📝' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'announcements', label: 'Announcements', icon: '📣' },
    { id: 'help', label: 'Ask for Help', icon: '🙋' },
  ];

  const myRank = classStudents.slice().sort((a, b) => b.xp - a.xp).findIndex(s => s.id === studentId) + 1;

  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* View toggle */}
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1>🏫 {className}</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Class code: <strong style={{ color: 'var(--accent-primary)', letterSpacing: 2 }}>{classroom.classCode}</strong></div>
        </div>
      </div>

      {/* My stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard icon="⚡" value={`Lv.${user.level}`} label="Your Level" color="#f59e0b" />
        <StatCard icon="📤" value={`${submitted}/${myAssignments.length}`} label="Submitted" color="#22c55e" />
        <StatCard icon="✅" value={reviewed} label="Reviewed" color="#6366f1" />
        <StatCard icon="🏆" value={`#${myRank}`} label="Class Rank" color="#ec4899" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: tab === t.id ? 700 : 400, fontSize: 13,
            color: tab === t.id ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderBottom: tab === t.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Assignments */}
      {tab === 'assignments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myAssignments.map(a => {
            const sub = a.submission;
            const overdue = !sub && new Date(a.due) < new Date();
            const daysLeft = Math.ceil((new Date(a.due) - new Date()) / 86400000);
            return (
              <div key={a.id} style={{
                background: 'var(--bg-secondary)', border: `1px solid ${sub ? (sub.reviewed ? '#22c55e44' : '#6366f144') : overdue ? '#ef444444' : 'var(--border-color)'}`,
                borderRadius: 14, padding: 20,
                borderLeft: `4px solid ${sub ? (sub.reviewed ? '#22c55e' : '#6366f1') : overdue ? '#ef4444' : '#f59e0b'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ fontSize: 32 }}>{sub ? (sub.reviewed ? '✅' : '⏳') : overdue ? '⚠️' : '📝'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>{a.title}</h3>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${diffColor(a.difficulty)}22`, color: diffColor(a.difficulty), fontWeight: 700 }}>{a.difficulty}</span>
                      {a.points && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#f59e0b22', color: '#f59e0b' }}>🏆 {a.points} pts</span>}
                    </div>
                    {a.desc && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: 1.5 }}>{a.desc}</p>}
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>{a.language}</span>
                      {!sub && !overdue && <span style={{ color: daysLeft <= 3 ? '#ef4444' : 'var(--text-muted)' }}>📅 {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}</span>}
                      {overdue && !sub && <span style={{ color: '#ef4444' }}>⚠️ Overdue</span>}
                      {sub && <span style={{ color: 'var(--accent-success)' }}>✓ Submitted {fmtDate(sub.submittedAt)}</span>}
                    </div>
                    {/* Teacher feedback */}
                    {sub?.reviewed && (
                      <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-tertiary)', borderRadius: 10, borderLeft: `3px solid ${gradeColor(sub.grade)}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, color: gradeColor(sub.grade), fontSize: 16 }}>Grade: {sub.grade}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· Reviewed {fmtDate(sub.reviewedAt)}</span>
                        </div>
                        {sub.feedback && <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>"{sub.feedback}"</p>}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {sub && <button className="btn btn-ghost btn-sm" onClick={() => setViewingOwn({ code: sub.code, language: sub.language })}>👁️ View</button>}
                    <button className={`btn btn-sm ${sub ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setSubmitting(a)}>
                      {sub ? '🔄 Resubmit' : '📤 Submit'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {myAssignments.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No assignments yet — check back later!</div>}
        </div>
      )}

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>🏆 Class Leaderboard</h3>
            <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: 13 }}>Your rank: #{myRank} of {classStudents.length}</p>
          </div>
          {classStudents.slice().sort((a, b) => b.xp - a.xp).map((s, i) => {
            const isMe = s.id === studentId;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
            return (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                borderBottom: '1px solid var(--border-color)',
                background: isMe ? '#6366f111' : '',
                borderLeft: isMe ? '3px solid #6366f1' : '3px solid transparent',
              }}>
                <div style={{ width: 32, textAlign: 'center', fontSize: medal ? 22 : 13, fontWeight: 700, color: 'var(--text-muted)' }}>{medal || `#${i+1}`}</div>
                <Avatar emoji={s.avatarEmoji} size={40} color={gradeColor(s.grade)} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: isMe ? 800 : 600, fontSize: 14 }}>{s.name}{isMe && ' (you)'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.completed} tasks · 🔥 {s.streak}d</div>
                </div>
                <div style={{ fontWeight: 900, fontSize: 20, color: '#f59e0b' }}>⚡{s.xp}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Announcements */}
      {tab === 'announcements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[...classroom.announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt)).map(ann => (
            <div key={ann.id} style={{
              background: 'var(--bg-secondary)', border: `1px solid ${ann.pinned ? '#6366f1' : 'var(--border-color)'}`,
              borderRadius: 14, padding: 18,
              borderLeft: ann.pinned ? '4px solid #6366f1' : undefined,
            }}>
              {ann.pinned && <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', display: 'block', marginBottom: 6 }}>📌 PINNED</span>}
              <p style={{ margin: '0 0 8px', fontSize: 14, lineHeight: 1.6 }}>{ann.text}</p>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ann.author} · {fmtDate(ann.createdAt)} {fmtTime(ann.createdAt)}</div>
            </div>
          ))}
          {classroom.announcements.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No announcements yet.</div>}
        </div>
      )}

      {/* Help */}
      {tab === 'help' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12, textAlign: 'center' }}>🙋</div>
            <h3 style={{ textAlign: 'center', marginBottom: 6 }}>Need help?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20 }}>Send a message to your teacher and they'll come help you.</p>
            <textarea value={helpMsg} onChange={e => setHelpMsg(e.target.value)}
              placeholder="What do you need help with? e.g. 'I'm stuck on the calculator assignment — I don't know how to handle division by zero'"
              style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6, resize: 'vertical', marginBottom: 12, fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }} />
            {helpSent ? (
              <div style={{ textAlign: 'center', padding: 16, background: '#22c55e22', borderRadius: 10, color: '#22c55e', fontWeight: 700 }}>✅ Help request sent! Your teacher will be with you shortly.</div>
            ) : (
              <button className="btn btn-primary" style={{ width: '100%' }}
                onClick={() => { if (helpMsg.trim()) { raiseHand(studentId, helpMsg); setHelpMsg(''); setHelpSent(true); setTimeout(() => setHelpSent(false), 5000); } }}>
                🙋 Raise Hand
              </button>
            )}
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>💡 Quick Tips</div>
            {['Try reading the error message carefully — it often tells you exactly what went wrong.','Google is your friend! Search for the error message.','Break the problem into smaller pieces.','Ask a classmate to look at your code.','Check the Learn section for tutorials on this topic.'].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                <span style={{ color: '#6366f1', fontWeight: 700, flexShrink: 0 }}>{i+1}.</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit modal */}
      {submitting && (
        <SubmitModal
          assignment={submitting}
          existing={getSubmission(submitting.id, studentId)}
          onClose={() => setSubmitting(null)}
          onSubmit={code => {
            submitWork(submitting.id, studentId, code, submitting.language);
            const realStudentId = user.email || user.name || 'student';
            saveSubmissionToFirestore(submitting.id, realStudentId, {
              code,
              studentId: realStudentId,
              studentName: user.name,
              classId: submitting.classId,
              assignType: submitting.assignType || 'code',
              language: submitting.language,
            });
          }}
        />
      )}
      {viewingOwn && (
        <div className="modal-overlay" onClick={() => setViewingOwn(null)}>
          <div className="modal" style={{ maxWidth: 680, width: '95vw' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 My Submission</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewingOwn(null)}>✕</button>
            </div>
            <pre style={{ margin: 0, padding: 20, background: 'var(--bg-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6, overflowX: 'auto', maxHeight: '60vh', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{viewingOwn.code || '// No code'}</pre>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setViewingOwn(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Submit work modal ─── */
function SubmitModal({ assignment, onClose, onSubmit, existing }) {
  const isBlocks = assignment.assignType === 'blocks';
  const [code, setCode] = useState(existing?.code || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [screenshot, setScreenshot] = useState(existing?.screenshot || null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (isBlocks) {
      onSubmit(JSON.stringify({ notes, screenshot }));
    } else {
      onSubmit(code);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680, width: '95vw' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📤 Submit: {assignment.title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {isBlocks ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 16, background: 'rgba(99,102,241,0.1)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)' }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>🧩 Build your project in Game Builder, then take a screenshot and upload it below.</p>
                <button className="btn btn-primary" style={{ fontSize: 13 }}
                  onClick={() => {
                    sessionStorage.setItem('bb-pending-assignment', JSON.stringify({ id: assignment.id, title: assignment.title, classId: assignment.classId }));
                    window.location.hash = 'gamebuilder';
                    onClose();
                  }}>
                  🎮 Open Game Builder
                </button>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>📸 Screenshot of your project *</label>
                <input type="file" accept="image/*" onChange={handleImage} style={{ fontSize: 13, color: 'var(--text-primary)' }} />
                {screenshot && <img src={screenshot} alt="preview" style={{ marginTop: 10, maxWidth: '100%', maxHeight: 200, borderRadius: 8, border: '1px solid var(--border-color)' }} />}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>📝 Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Describe what you built..."
                  style={{ width: '100%', minHeight: 80, padding: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, color: 'var(--text-primary)', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          ) : (
            <textarea value={code} onChange={e => setCode(e.target.value)}
              placeholder={`# Paste your code here…\n# Make sure it runs correctly before submitting!`}
              style={{ width: '100%', minHeight: 280, padding: 20, background: 'var(--bg-tertiary)', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}
            disabled={isBlocks && !screenshot}>
            📤 Submit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── View toggle banner ─── */
function ViewToggle({ viewMode, setViewMode }) {
  if (!setViewMode) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
      borderRadius: 50, padding: 4, width: 'fit-content', margin: '0 auto 24px',
    }}>
      {[
        { id: 'teacher', icon: '👩‍🏫', label: 'Teacher View' },
        { id: 'student', icon: '🎒', label: 'Student View' },
      ].map(v => (
        <button key={v.id} onClick={() => setViewMode(v.id)} style={{
          padding: '8px 22px', borderRadius: 50, border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
          background: viewMode === v.id ? (v.id === 'teacher' ? '#6366f1' : '#22c55e') : 'transparent',
          color: viewMode === v.id ? '#fff' : 'var(--text-muted)',
          boxShadow: viewMode === v.id ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
        }}>{v.icon} {v.label}</button>
      ))}
    </div>
  );
}

/* ─── Main export ─── */
export default function Classroom() {
  const { user } = useUser();
  const isTeacher = user.role === 'teacher';
  const [viewMode, setViewMode] = React.useState('teacher');

  if (!isTeacher) return <StudentView viewMode="student" setViewMode={null} />;
  if (viewMode === 'teacher') return <TeacherView viewMode={viewMode} setViewMode={setViewMode} />;
  return <StudentView viewMode={viewMode} setViewMode={setViewMode} />;
}
