import React, { useEffect } from 'react';

const pill = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#a5b4fc' };
const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px' };
const sectionLabel = { fontSize: 13, fontWeight: 700, letterSpacing: 2, color: '#6366f1', textTransform: 'uppercase', marginBottom: 12 };

export default function LandingPage({ onLogin, onSignup }) {
  useEffect(() => {
    const root = document.getElementById('root');
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyHeight = document.body.style.height;
    const prevRootOverflow = root ? root.style.overflow : '';
    const prevRootHeight = root ? root.style.height : '';

    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    if (root) { root.style.overflow = 'auto'; root.style.height = 'auto'; }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.height = prevBodyHeight;
      if (root) { root.style.overflow = prevRootOverflow; root.style.height = prevRootHeight; }
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a3e 50%, #0f1929 100%)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', color: '#fff' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>B</div>
          <span style={{ fontWeight: 800, fontSize: 20, background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ByteBuddies</span>
        </div>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: '#94a3b8' }}>
          {[['Features','features'],['For Schools','for-schools'],['Curriculum','curriculum-aligned'],['Pricing','pricing']].map(([l,id]) => (
            <a key={l} href={`#${id}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => { window.location.hash = 'whitepaper'; }} style={{ padding: '9px 22px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Research</button>
          <button onClick={onLogin} style={{ padding: '9px 22px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Log In</button>
          <button onClick={() => document.getElementById('book-demo')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '9px 22px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 8, color: '#818cf8', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Book a Demo</button>
          <button onClick={onSignup} style={{ padding: '9px 22px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 24px 80px', textAlign: 'center' }}>
        <div style={{ ...pill, marginBottom: 28 }}>🚀 The coding platform built for the next generation</div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, maxWidth: 800 }}>
          Build Games. Program{' '}
          <span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Robots.</span>{' '}
          Learn to Code.
        </h1>
        <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 600, lineHeight: 1.8, marginBottom: 16 }}>
          ByteBuddies is the all-in-one platform where students aged 8–18 go from zero to coding hero. Drag blocks, write real code, build games, and program actual robots — all in one place.
        </p>
        <p style={{ fontSize: 15, color: '#64748b', maxWidth: 500, lineHeight: 1.7, marginBottom: 48 }}>
          No downloads. No setup. Works in any browser. Free for students.
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={onSignup} style={{ padding: '16px 36px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700, boxShadow: '0 4px 32px rgba(99,102,241,0.5)' }}>
            Student Sign Up →
          </button>
          <button onClick={onLogin} style={{ padding: '16px 36px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>
            Teacher Login
          </button>
          <button onClick={() => document.getElementById('book-demo')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '16px 36px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 12, color: '#818cf8', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>
            Book School Demo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 64, flexWrap: 'wrap', padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
        {[['10,000+', 'Students'], ['500+', 'Schools'], ['6', 'Robot Types'], ['100%', 'Browser Based']].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* What is ByteBuddies */}
      <div id="features" style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
        <div style={sectionLabel}>What is ByteBuddies?</div>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, marginBottom: 20, lineHeight: 1.2 }}>Everything a student needs to learn coding</h2>
        <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8, marginBottom: 48, maxWidth: 680 }}>
          Most coding platforms teach one thing. ByteBuddies teaches everything — from your first drag-and-drop block all the way to writing Python and JavaScript, building games with real physics, and programming robots. It grows with the student.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {[
            { icon: '🧩', title: 'Block Coding', desc: 'Start with Scratch-style drag-and-drop blocks. Every block auto-generates real Python or JavaScript code in real time — so students learn actual syntax without even trying.', color: '#6366f1' },
            { icon: '🎮', title: 'Game Builder', desc: 'Build playable games with sprites, backdrops, physics, score tracking and keyboard controls. Export your game as a standalone HTML file to share with anyone — no account needed.', color: '#ec4899' },
            { icon: '🤖', title: 'Robot Lab', desc: 'Program 6 different virtual robots (Rover, Tank, Drone, Spider, Humanoid, Arm) on 8 different tracks and environments. Connect to real physical robots via Bluetooth.', color: '#22c55e' },
            { icon: '🏆', title: 'Challenges', desc: 'Timed coding challenges with XP rewards and leaderboards. Students level up, earn badges, and compete with classmates — making learning addictive.', color: '#f59e0b' },
            { icon: '🧠', title: 'AI Assistant', desc: 'An AI tutor that explains what your code does, suggests the next block, and helps debug problems in plain English. Like having a teacher available 24/7.', color: '#8b5cf6' },
            { icon: '📊', title: 'Skill Tracker', desc: 'Automatically tracks which coding concepts each student has actually used — loops, conditions, variables, functions — and shows mastery levels on their dashboard.', color: '#06b6d4' },
          ].map(f => (
            <div key={f.title} style={{ ...card, borderLeft: `3px solid ${f.color}` }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Mode teaser */}
      <div style={{ background: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%)', borderTop: '1px solid rgba(99,102,241,0.2)', borderBottom: '1px solid rgba(99,102,241,0.2)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ ...sectionLabel, marginBottom: 12 }}>🗺️ Only on ByteBuddies</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
              Mission Mode — Coding as a Story
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              Forget boring tutorials. ByteBuddies puts students inside a story. They're an astronaut fixing a spacecraft's broken code, or an ocean explorer navigating coral mazes with loops. Every mission teaches real coding concepts — students just think they're on an adventure.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {['🚀 Space Explorer — Sequences & Loops', '🌊 Ocean Deep — Conditions & Events', '🏙️ City Builder — Variables & Data', '⚡ Cyber Quest — Functions & AI'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#c7d2fe' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} /> {item}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#64748b' }}>
              <span style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 20, padding: '4px 12px', color: '#818cf8', fontWeight: 600 }}>20 missions</span>
              <span style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 20, padding: '4px 12px', color: '#818cf8', fontWeight: 600 }}>2,500 XP to earn</span>
              <span style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 20, padding: '4px 12px', color: '#818cf8', fontWeight: 600 }}>4 Certificates</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 280, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { emoji: '🚀', title: 'Space Explorer', sub: 'Beginner', color: '#6366f1', missions: 5 },
              { emoji: '🌊', title: 'Ocean Deep', sub: 'Intermediate', color: '#0ea5e9', missions: 5 },
              { emoji: '🏙️', title: 'City Builder', sub: 'Intermediate', color: '#f59e0b', missions: 5 },
              { emoji: '⚡', title: 'Cyber Quest', sub: 'Advanced', color: '#10b981', missions: 5 },
            ].map(c => (
              <div key={c.title} style={{ background: `linear-gradient(135deg, ${c.color}18, ${c.color}08)`, border: `1px solid ${c.color}30`, borderRadius: 14, padding: '18px 16px' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{c.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>{c.sub} · {c.missions} missions</div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array(c.missions).fill(0).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i === 0 ? c.color : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* vs competitors comparison */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
        <div style={sectionLabel}>Why ByteBuddies?</div>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, marginBottom: 12 }}>Built differently from the start</h2>
        <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 40 }}>Most platforms teach one thing. ByteBuddies teaches everything — and makes it feel like a game.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Feature</th>
                {['ByteBuddies', 'Code.org', 'Scratch', 'PictoBlox'].map(name => (
                  <th key={name} style={{ padding: '12px 16px', color: name === 'ByteBuddies' ? '#818cf8' : '#64748b', fontWeight: 700, fontSize: name === 'ByteBuddies' ? 15 : 13 }}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Story-based Mission Mode', '✅', '❌', '❌', '❌'],
                ['Block → Real Code (live)', '✅', '❌', '❌', '⚠️'],
                ['Game Builder with Physics', '✅', '❌', '⚠️', '❌'],
                ['Robot Lab (virtual + real)', '✅', '❌', '❌', '✅'],
                ['AI Coding Assistant', '✅', '❌', '❌', '⚠️'],
                ['UK National Curriculum Aligned', '✅', '⚠️', '❌', '❌'],
                ['Parent Progress Dashboard', '✅', '❌', '❌', '❌'],
                ['Printable Progress Reports', '✅', '⚠️', '❌', '❌'],
                ['Class Management for Teachers', '✅', '✅', '❌', '⚠️'],
                ['Student XP & Levelling', '✅', '❌', '❌', '❌'],
                ['Downloadable Certificates', '✅', '⚠️', '❌', '❌'],
                ['Free for Students', '✅', '✅', '✅', '⚠️'],
              ].map(([feat, ...vals], i) => (
                <tr key={feat} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{feat}</td>
                  {vals.map((v, vi) => (
                    <td key={vi} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 16 }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* For Schools */}
      <div id="for-schools" style={{ background: 'rgba(99,102,241,0.06)', borderTop: '1px solid rgba(99,102,241,0.15)', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={sectionLabel}>For Schools & Teachers</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, marginBottom: 20 }}>A full classroom management system</h2>
          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8, marginBottom: 48, maxWidth: 680 }}>
            ByteBuddies is built with teachers in mind. No other platform gives you this level of visibility into what your students are actually doing.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { icon: '📋', title: 'Assignments', desc: 'Create and assign coding projects with due dates, descriptions and templates' },
              { icon: '✅', title: 'Grading', desc: 'Review submissions inline with grade picker and quick feedback chips' },
              { icon: '📊', title: 'Progress Tracking', desc: 'See each student\'s XP, level, concept mastery and at-risk alerts in real time' },
              { icon: '📄', title: 'Progress Reports', desc: 'Generate and print professional progress reports for parents and school leadership — one click' },
              { icon: '🏅', title: 'Leaderboard', desc: 'Class leaderboard keeps students motivated and competing in healthy ways' },
              { icon: '📢', title: 'Announcements', desc: 'Pin important announcements to the top of every student\'s dashboard' },
              { icon: '🙋', title: 'Help Queue', desc: 'Students raise their hand digitally — teacher sees a live queue of who needs help' },
              { icon: '⏱️', title: 'Countdown Timer', desc: 'Built-in classroom timer with presets for timed activities and tests' },
              { icon: '📅', title: 'Attendance', desc: 'Mark attendance directly from the teacher dashboard' },
              { icon: '🔗', title: 'Google Classroom', desc: 'Sync your class roster from Google Classroom with one click — no manual entry needed' },
            ].map(f => (
              <div key={f.title} style={{ ...card, padding: '20px' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* UK Curriculum & Standards Alignment */}
      <div id="curriculum-aligned" style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
        <div style={sectionLabel}>Curriculum Aligned</div>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
          Mapped to the standards schools require
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8, marginBottom: 40, maxWidth: 680 }}>
          ByteBuddies is fully mapped to the UK National Curriculum for Computing (KS2 & KS3), CSTA K-12 Computer Science Standards, and supports the Cambridge Digital Literacy framework. No extra prep needed — every lesson, mission, and challenge is already aligned.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { badge: '🇬🇧', title: 'UK National Curriculum', sub: 'KS2 & KS3 Computing', color: '#3b82f6', points: ['Sequences, selection, repetition', 'Debugging & logical reasoning', 'Variables, inputs & outputs', 'Networks & data'] },
            { badge: '🌐', title: 'CSTA K-12 Standards', sub: 'Computer Science', color: '#8b5cf6', points: ['Algorithms & programming (AP)', 'Data & analysis (DA)', 'Computing systems (CS)', 'Impacts of computing (IC)'] },
            { badge: '📐', title: 'Cambridge Framework', sub: 'Digital Literacy', color: '#06b6d4', points: ['Computational thinking', 'Programming & development', 'Creative digital artefacts', 'Communication & collaboration'] },
            { badge: '🤖', title: 'AI & Future Skills', sub: 'Emerging Standards', color: '#10b981', points: ['Machine learning concepts', 'Ethical AI discussion', 'Data literacy', 'Problem decomposition'] },
          ].map(s => (
            <div key={s.title} style={{ ...card, borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.badge}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.sub}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {s.points.map(p => (
                  <li key={p} style={{ fontSize: 12, color: '#94a3b8', padding: '3px 0', display: 'flex', gap: 6 }}>
                    <span style={{ color: s.color, flexShrink: 0 }}>›</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Download our full Curriculum Map</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>A detailed PDF showing exactly how each ByteBuddies lesson, mission, and challenge maps to curriculum standards. Perfect for curriculum leads and inspections.</div>
          </div>
          <button onClick={() => { window.location.hash = 'whitepaper'; }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
            View Curriculum Map →
          </button>
        </div>
      </div>

      {/* Book a Demo — School CTA */}
      <div id="book-demo" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a1a4e 100%)', borderTop: '1px solid rgba(99,102,241,0.2)', borderBottom: '1px solid rgba(99,102,241,0.2)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ ...sectionLabel, marginBottom: 12 }}>For Schools</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
              Get a free school demo & pilot
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              We offer free 30-day pilot programmes for schools. Our team will set up your classes, train your teachers, and give you a live walkthrough — so you can see exactly how ByteBuddies fits into your curriculum before committing.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {['Free 30-day pilot — no credit card needed', 'Dedicated onboarding & teacher training session', 'Custom class setup done for you', 'Curriculum alignment report for your school', 'Google Classroom sync (available on request)'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#c7d2fe' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(99,102,241,0.3)', border: '1px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 280, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Book a free school demo</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Usually responds within 1 school day</div>
            {['School name', 'Your name & role', 'Email address', 'Number of students'].map((placeholder, i) => (
              <input key={i} placeholder={placeholder} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#fff', marginBottom: 12, boxSizing: 'border-box', outline: 'none' }} />
            ))}
            <textarea placeholder="Anything specific you'd like to see? (optional)" rows={3} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#fff', marginBottom: 16, boxSizing: 'border-box', outline: 'none', resize: 'vertical' }} />
            <button onClick={() => alert('Thank you! We will be in touch within 1 school day.')} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 24px rgba(99,102,241,0.4)' }}>
              Request a Free Demo →
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
        <div style={sectionLabel}>What Teachers Say</div>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, marginBottom: 48, lineHeight: 1.2 }}>Schools love ByteBuddies</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {[
            { quote: "My Year 5 students were building working games within the first lesson. The mission stories kept them engaged for the whole hour — no one asked to go to the toilet once!", name: 'Sarah M.', role: 'Year 5 Teacher, Manchester', avatar: 'SM' },
            { quote: "The teacher dashboard is the best I've seen on any platform. I can see exactly which student is struggling with loops vs. conditions and help them directly. No other tool gives me that.", name: 'James T.', role: 'Computing Coordinator, Bristol', avatar: 'JT' },
            { quote: "We piloted ByteBuddies across 3 year groups. Engagement tripled compared to our previous platform. The robot lab especially — kids come to my room at lunch to keep going.", name: 'Priya K.', role: 'STEM Lead, London', avatar: 'PK' },
            { quote: "The curriculum alignment with the UK National Curriculum made it very easy to get sign-off from our Head. Everything mapped perfectly to our computing scheme of work.", name: 'David R.', role: 'Deputy Head & CS Teacher, Edinburgh', avatar: 'DR' },
            { quote: "Parent evenings are so much easier now. I show parents the skill tracker on the parent dashboard and they immediately understand what their child has learned. It's brilliant.", name: 'Amelia F.', role: 'KS2 Computing Teacher, Birmingham', avatar: 'AF' },
            { quote: "My class has a leaderboard on the whiteboard every week. Students are logging in at home to do more missions. I've never seen that with any other platform.", name: 'Tom W.', role: 'Year 6 Teacher, Leeds', avatar: 'TW' },
          ].map(t => (
            <div key={t.name} style={{ ...card, position: 'relative' }}>
              <div style={{ fontSize: 36, color: '#6366f1', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: 12, opacity: 0.4 }}>"</div>
              <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.8, margin: '0 0 20px', fontStyle: 'italic' }}>{t.quote}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px' }}>
        <div style={sectionLabel}>How It Works</div>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, marginBottom: 48 }}>Up and running in minutes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          {[
            { step: '01', title: 'Create your account', desc: 'Sign up free as a student or teacher in under 30 seconds' },
            { step: '02', title: 'Pick what to build', desc: 'Choose from Game Builder, Robot Lab, Block Coding or a Challenge' },
            { step: '03', title: 'Start creating', desc: 'Drag blocks, write code, see results instantly in the browser' },
            { step: '04', title: 'Share & level up', desc: 'Export your game, submit to your teacher, or compete on the leaderboard' },
          ].map(f => (
            <div key={f.step} style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, margin: '0 auto 16px' }}>{f.step}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={sectionLabel}>Pricing</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, marginBottom: 16 }}>Simple, transparent pricing</h2>
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 48 }}>Affordable for every school.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 600, margin: '0 auto' }}>
            {[
              { name: 'Classroom', price: 'AED 44', period: '/student/year', desc: 'Per student billed annually', features: ['Full workspace', 'Game Builder', 'Robot Lab', 'Challenges & AI Assistant', 'Teacher dashboard', 'Assignments & grading', 'Progress tracking', 'Leaderboards'], color: '#8b5cf6', highlight: true },
              { name: 'School', price: 'AED 15,000', period: '/year', desc: 'Unlimited classrooms', features: ['Everything in Classroom', 'Unlimited teachers & students', 'Admin dashboard', 'Priority support', 'Custom branding', 'Onboarding session'], color: '#ec4899' },
            ].map(p => (
              <div key={p.name} style={{ ...card, border: p.highlight ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.08)', position: 'relative', padding: '32px 24px' }}>
                {p.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#6366f1', borderRadius: 100, padding: '4px 14px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
                <div style={{ fontSize: 14, fontWeight: 700, color: p.color, marginBottom: 12 }}>{p.name}</div>
                <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>{p.price}<span style={{ fontSize: 14, color: '#64748b', fontWeight: 400 }}>{p.period}</span></div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 24 }}>{p.desc}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left' }}>
                  {p.features.map(f => <li key={f} style={{ fontSize: 13, color: '#94a3b8', padding: '5px 0', display: 'flex', gap: 8 }}><span style={{ color: '#22c55e' }}>✓</span>{f}</li>)}
                </ul>
                <button onClick={onSignup} style={{ width: '100%', padding: '11px', background: p.highlight ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.07)', border: p.highlight ? 'none' : '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '80px 24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, marginBottom: 16 }}>Ready to start coding?</h2>
        <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 40 }}>Join thousands of students building games and robots today.</p>
        <button onClick={onSignup} style={{ padding: '16px 48px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 18, fontWeight: 700, boxShadow: '0 4px 32px rgba(99,102,241,0.5)' }}>
          Create Free Account →
        </button>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>B</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#94a3b8' }}>ByteBuddies</span>
        </div>
        <div style={{ fontSize: 13, color: '#475569' }}>© 2026 ByteBuddies · Built for the next generation of coders</div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#475569' }}>
          {['Privacy', 'Terms', 'Contact'].map(l => <span key={l} style={{ cursor: 'pointer' }}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}
