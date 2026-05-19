import React, { useEffect, useState } from 'react';

const pill = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#a5b4fc' };
const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px' };
const sectionLabel = { fontSize: 12, fontWeight: 700, letterSpacing: 3, color: '#6366f1', textTransform: 'uppercase', marginBottom: 14 };
const gradText = { background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };

export default function LandingPage({ onLogin, onSignup }) {
  const [xp, setXp] = useState(340);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    const t = setInterval(() => setXp(x => x < 500 ? x + 1 : 340), 60);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #080812 0%, #0f0f23 40%, #0a1628 100%)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', color: '#fff' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: 'rgba(8,8,18,0.9)', backdropFilter: 'blur(16px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>B</div>
          <span style={{ fontWeight: 900, fontSize: 20, ...gradText }}>ByteBuddies</span>
        </div>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: '#64748b' }}>
          {[['How It Works', 'how-it-works'], ['Results', 'outcomes'], ['For Schools', 'book-demo'], ['Pricing', 'pricing']].map(([l, id]) => (
            <a key={l} href={`#${id}`} style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#a5b4fc'}
              onMouseLeave={e => e.target.style.color = '#64748b'}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onLogin} style={{ padding: '9px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Log In</button>
          <button onClick={onSignup} style={{ padding: '9px 22px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>Start Free</button>
        </div>
      </nav>

      {/* ── 1. HERO ── */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '110px 24px 90px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ ...pill, marginBottom: 28, fontSize: 13 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Now accepting students — limited cohort spots remaining
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 900, lineHeight: 1.08, marginBottom: 28, maxWidth: 860, letterSpacing: '-1.5px' }}>
          Your child spends 7 hours a day on screens.<br />
          <span style={gradText}>Make every minute count.</span>
        </h1>

        <p style={{ fontSize: 19, color: '#94a3b8', maxWidth: 580, lineHeight: 1.75, marginBottom: 12 }}>
          ByteBuddies turns screen time into building time. Kids aged 7–16 go from passive scrollers to confident creators — building real games, apps, and AI projects in weeks, not years.
        </p>
        <p style={{ fontSize: 14, color: '#6366f1', fontWeight: 600, marginBottom: 36, letterSpacing: 0.3 }}>
          Trusted by 12,000+ families and 400+ schools worldwide
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
          <button onClick={onSignup} style={{ padding: '18px 44px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 14, color: '#fff', cursor: 'pointer', fontSize: 18, fontWeight: 800, boxShadow: '0 8px 40px rgba(99,102,241,0.55)', letterSpacing: '-0.3px' }}>
            Claim Your Free First Lesson
          </button>
          <button onClick={() => document.getElementById('outcomes').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '18px 32px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, color: '#cbd5e1', cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>
            See What Kids Build →
          </button>
        </div>

        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['No credit card required', '30-day money-back guarantee', 'Cancel any time'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#475569' }}>
              <span style={{ color: '#22c55e', fontSize: 15 }}>✓</span>{t}
            </div>
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[['12,000+', 'Students'], ['50,000+', 'Projects Built'], ['400+', 'Schools'], ['98%', 'Parent Satisfaction'], ['7–16', 'Age Range']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 900, fontSize: 22, ...gradText }}>{n}</div>
              <div style={{ fontSize: 12, color: '#475569', letterSpacing: 0.5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. PROBLEM ── */}
      <section style={{ padding: '90px 24px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <div style={sectionLabel}>The Problem</div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, marginBottom: 20, lineHeight: 1.15, letterSpacing: '-0.5px' }}>
          Your child's generation will either build the future — or be replaced by it.
        </h2>
        <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.8, marginBottom: 60, maxWidth: 640, margin: '0 auto 60px' }}>
          The gap between kids who code and kids who don't is widening every year. Right now, most kids are on the wrong side of it.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            { icon: '📱', color: '#ef4444', title: '7 hours of screen time a day', body: 'The average child spends more time watching strangers play games than learning anything that will matter in 10 years. Passive content is designed to be consumed, not created.' },
            { icon: '🏫', color: '#f59e0b', title: 'Schools are a decade behind', body: "Most computing classes still teach spreadsheets and PowerPoint. By the time your child graduates, AI will have automated 40% of entry-level jobs. School isn't preparing them for that reality." },
            { icon: '😟', color: '#8b5cf6', title: 'Parents are left guessing', body: "You know coding matters. You've tried YouTube tutorials and free apps. They lose interest in 20 minutes. You're left wondering: is there something out there that actually works?" },
          ].map(p => (
            <div key={p.title} style={{ ...card, textAlign: 'left', borderTop: `3px solid ${p.color}20`, background: 'rgba(255,255,255,0.025)' }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{p.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10, color: '#e2e8f0' }}>{p.title}</div>
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.75 }}>{p.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. SOLUTION ── */}
      <section style={{ background: 'linear-gradient(160deg, #0c0c28 0%, #111132 100%)', borderTop: '1px solid rgba(99,102,241,0.12)', borderBottom: '1px solid rgba(99,102,241,0.12)', padding: '90px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={sectionLabel}>The ByteBuddies Difference</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-0.5px' }}>
            This is not another coding app.<br /><span style={gradText}>This is a launchpad.</span>
          </h2>
          <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.8, marginBottom: 60, maxWidth: 600, margin: '0 auto 60px' }}>
            Kids don't learn to code by watching videos or completing checkbox exercises. They learn by building things they actually care about — and sharing them with people they know.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 20 }}>
            {[
              { icon: '🎮', color: '#6366f1', title: 'Real projects from day one', body: 'Every child builds a working game in their first session. Not a tutorial. Not a demo. Something they made, that they can share.' },
              { icon: '💻', color: '#8b5cf6', title: 'Real code, not just blocks', body: 'We start with visual blocks and progressively introduce Python and JavaScript. By month three, your child writes real code.' },
              { icon: '🤖', color: '#06b6d4', title: 'AI, cybersecurity, game dev', body: 'Exposure to the skills that actually matter: machine learning concepts, ethical hacking basics, and professional game development.' },
              { icon: '🛡️', color: '#10b981', title: 'Safe and structured', body: 'Every lesson has a goal. Every project has a mentor path. Kids always know what to do next, and parents always know what kids are learning.' },
            ].map(s => (
              <div key={s.title} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}25`, borderRadius: 16, padding: '28px 22px', textAlign: 'left' }}>
                <div style={{ width: 48, height: 48, background: `${s.color}18`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10, color: '#e2e8f0' }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.75 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. OUTCOMES ── */}
      <section id="outcomes" style={{ padding: '90px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={sectionLabel}>Transformation Timeline</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-0.5px' }}>
            What will your child be able to do?
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 60, lineHeight: 1.7 }}>
            Not features. Not lessons completed. Actual skills your child will have.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            {[
              {
                period: '7 Days', color: '#6366f1', glow: 'rgba(99,102,241,0.2)',
                headline: 'First game, first win.',
                outcomes: [
                  'Build and share their first playable game',
                  'Understand what code actually does',
                  'Feel the confidence shift: "I made this"',
                  'Parents notice the change in energy',
                ],
              },
              {
                period: '30 Days', color: '#ec4899', glow: 'rgba(236,72,153,0.2)',
                headline: 'Real skills, visible progress.',
                outcomes: [
                  'Build interactive apps with real logic',
                  'Write their first lines of Python',
                  'Share a project portfolio with family',
                  'Understand variables, loops, and conditions',
                ],
              },
              {
                period: '90 Days', color: '#10b981', glow: 'rgba(16,185,129,0.2)',
                headline: 'They are now a creator.',
                outcomes: [
                  'Publish a portfolio of games and apps',
                  'Compete in coding challenges and win badges',
                  'Explore AI, cybersecurity, and game design',
                  'Ahead of 95% of their classmates',
                ],
              },
            ].map(t => (
              <div key={t.period} style={{ background: `radial-gradient(ellipse at top, ${t.glow}, transparent 70%), rgba(255,255,255,0.03)`, border: `1px solid ${t.color}30`, borderRadius: 20, padding: '36px 28px', textAlign: 'left', position: 'relative' }}>
                <div style={{ display: 'inline-block', background: t.color, color: '#fff', borderRadius: 8, padding: '4px 14px', fontSize: 12, fontWeight: 800, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>{t.period}</div>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, color: '#f1f5f9', lineHeight: 1.3 }}>{t.headline}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {t.outcomes.map(o => (
                    <div key={o} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
                      <span style={{ color: t.color, marginTop: 1, flexShrink: 0 }}>→</span>{o}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. DASHBOARD / GAMIFICATION ── */}
      <section style={{ background: 'linear-gradient(160deg, #0a0a22 0%, #0f1a32 100%)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '90px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={sectionLabel}>Inside the Platform</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, marginBottom: 18, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              Built to keep kids coming back — for the right reasons.
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.8, marginBottom: 32 }}>
              We borrowed the best parts of gaming — XP, levels, streaks, and rewards — and put them in service of real learning. Kids don't even realize how much they're absorbing.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '⚡', title: 'XP & Levelling System', desc: 'Earn XP for every project, challenge, and line of code. Level up from Coder Cadet to Code Master.' },
                { icon: '🔥', title: 'Daily Streaks', desc: 'Streak counters reward consistency. Kids learn that showing up every day is the real superpower.' },
                { icon: '🏅', title: '60+ Skill Badges', desc: 'Earn badges for Python, JavaScript, AI, Cybersecurity, Game Dev and more. Each badge means something real.' },
                { icon: '🏆', title: 'Live Leaderboards', desc: 'Friendly competition with classmates drives motivation without pressure. Updated in real time.' },
              ].map(f => (
                <div key={f.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(99,102,241,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 3 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview Card */}
          <div style={{ flex: 1, minWidth: 300, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ background: 'rgba(99,102,241,0.12)', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>A</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Alex, Age 11</div>
                <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>Level 7 — Game Dev Specialist</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '4px 10px' }}>
                <span style={{ fontSize: 14 }}>🔥</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#ef4444' }}>14</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>day streak</span>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, fontSize: 12 }}>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>XP Progress — Level 7 → 8</span>
                  <span style={{ color: '#6366f1', fontWeight: 700 }}>{xp} / 500 XP</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(xp / 500) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 100, transition: 'width 0.3s ease' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Projects Built', value: '23', color: '#6366f1' },
                  { label: 'Challenges Won', value: '8', color: '#10b981' },
                  { label: 'Badges Earned', value: '14', color: '#f59e0b' },
                  { label: 'Lines of Code', value: '1,240', color: '#ec4899' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Recent Badges</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Python Pro', color: '#3b82f6' },
                    { label: 'Game Dev', color: '#8b5cf6' },
                    { label: 'AI Explorer', color: '#06b6d4' },
                    { label: '10-Day Streak', color: '#ef4444' },
                    { label: 'Bug Hunter', color: '#10b981' },
                  ].map(b => (
                    <div key={b.label} style={{ background: `${b.color}18`, border: `1px solid ${b.color}35`, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: b.color }}>{b.label}</div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#a5b4fc' }}>
                Next mission: Build a multiplayer game with real-time chat. <span style={{ color: '#6366f1', fontWeight: 700, cursor: 'pointer' }}>Start now →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. SOCIAL PROOF ── */}
      <section style={{ padding: '90px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={sectionLabel}>Real Families, Real Results</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.5px' }}>
              Don't take our word for it.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 48 }}>
            {[
              { quote: "My son was glued to his iPad doing absolutely nothing. Within two weeks of ByteBuddies, he built a game that his whole class plays. I cried a little, honestly.", name: 'Sarah T.', role: 'Parent of Jake, 10', avatar: 'ST', color: '#6366f1' },
              { quote: "I made my own game in a week! It's called Space Crusher and 40 people have played it. I want to be a game developer now.", name: 'Maya', role: 'Student, Age 11', avatar: 'M', color: '#ec4899' },
              { quote: "We tried three other platforms. The kids were bored in a week. With ByteBuddies they're logging in at home without being asked. That has never happened before.", name: 'Priya K.', role: 'Parent of two, Ages 9 & 13', avatar: 'PK', color: '#10b981' },
              { quote: "I didn't think I'd be into coding but the missions are like a game. I've already finished Python level 3 and now I'm learning about AI. It's actually cool.", name: 'Ethan', role: 'Student, Age 13', avatar: 'E', color: '#f59e0b' },
              { quote: "As a teacher, the dashboard is a game-changer. I can see exactly who's stuck on loops vs. conditions and help them in real time. No other tool does this.", name: 'James M.', role: 'Computing Teacher, Bristol', avatar: 'JM', color: '#8b5cf6' },
              { quote: "My daughter asked me to extend her screen time for the first time in her life — because she was halfway through a game she was building. That is the ByteBuddies effect.", name: 'David R.', role: 'Parent of Lily, 12', avatar: 'DR', color: '#06b6d4' },
            ].map(t => (
              <div key={t.name} style={{ ...card, textAlign: 'left', background: 'rgba(255,255,255,0.025)', position: 'relative' }}>
                <div style={{ fontSize: 40, color: t.color, fontFamily: 'Georgia, serif', lineHeight: 0.8, marginBottom: 16, opacity: 0.35 }}>"</div>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.8, margin: '0 0 20px', fontStyle: 'italic' }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Example Projects */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 13, color: '#475569', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>Projects Built by Real Students</div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { name: 'Space Crusher', by: 'Maya, 11', type: 'Game', color: '#6366f1' },
                { name: 'Quiz Master Pro', by: 'Ethan, 13', type: 'App', color: '#8b5cf6' },
                { name: 'AI Story Writer', by: 'Lily, 12', type: 'AI Project', color: '#06b6d4' },
                { name: 'Maze Runner', by: 'Jake, 10', type: 'Game', color: '#10b981' },
                { name: 'Weather Bot', by: 'Priya, 14', type: 'App', color: '#ec4899' },
              ].map(p => (
                <div key={p.name} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${p.color}25`, borderRadius: 12, padding: '16px 20px', minWidth: 150, textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, background: `${p.color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto 10px' }}>
                    {p.type === 'Game' ? '🎮' : p.type === 'AI Project' ? '🤖' : '📱'}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>{p.type}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>by {p.by}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. UNIQUE POSITIONING ── */}
      <section style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '90px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={sectionLabel}>Why ByteBuddies</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 16 }}>
              Not just another coding site.
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
              There are hundreds of coding platforms. Most teach the basics and stop there. ByteBuddies is built for where the world is going, not where it's been.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { title: 'Others', icon: '❌', items: ['Drag-and-drop only — no real code', 'Toy projects that go nowhere', 'No progression after the basics', 'No AI, no cybersecurity, no game dev', 'Kids lose interest within a month'], bad: true },
              { title: 'ByteBuddies', icon: '✓', items: ['Blocks → Python → JavaScript progression', 'Real projects kids actually share', 'Clear path from beginner to advanced', 'Game Dev, AI, and Cybersecurity tracks', 'Gamified to keep kids coming back'], bad: false },
            ].map(col => (
              <div key={col.title} style={{ background: col.bad ? 'rgba(239,68,68,0.04)' : 'rgba(99,102,241,0.06)', border: col.bad ? '1px solid rgba(239,68,68,0.15)' : '2px solid rgba(99,102,241,0.25)', borderRadius: 16, padding: '28px 24px' }}>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 20, color: col.bad ? '#ef4444' : '#818cf8' }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.items.map(item => (
                    <div key={item} style={{ display: 'flex', gap: 10, fontSize: 14, color: col.bad ? '#475569' : '#94a3b8', lineHeight: 1.5 }}>
                      <span style={{ color: col.bad ? '#ef4444' : '#22c55e', flexShrink: 0, fontWeight: 700 }}>{col.bad ? '✕' : '✓'}</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CURRICULUM ALIGNMENT ── */}
      <section id="how-it-works" style={{ maxWidth: 960, margin: '0 auto', padding: '90px 24px' }}>
        <div style={sectionLabel}>Curriculum Aligned</div>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.15 }}>
          Mapped to what schools actually require
        </h2>
        <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, marginBottom: 48, maxWidth: 640 }}>
          ByteBuddies is fully mapped to the UK National Curriculum for Computing (KS2 & KS3), CSTA K-12 Computer Science Standards, and the Cambridge Digital Literacy framework. No extra prep needed.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 40 }}>
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
                  <li key={p} style={{ fontSize: 12, color: '#64748b', padding: '3px 0', display: 'flex', gap: 6 }}>
                    <span style={{ color: s.color, flexShrink: 0 }}>›</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Download our full Curriculum Map</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>A detailed PDF showing exactly how each lesson, mission, and challenge maps to curriculum standards. Perfect for computing leads and inspections.</div>
          </div>
          <button onClick={() => { window.location.hash = 'whitepaper'; }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>
            View Curriculum Map →
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={sectionLabel}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900 }}>Up and running in under 5 minutes</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up free as a student, parent, or teacher. No credit card. No commitment. Under 30 seconds.' },
              { step: '02', title: 'Pick what to build', desc: 'Choose from Game Builder, Robot Lab, Block Coding, AI Projects, or a guided Challenge.' },
              { step: '03', title: 'Start creating', desc: 'Write code, build projects, see results instantly. Every lesson has a clear goal and a reward at the end.' },
              { step: '04', title: 'Level up and share', desc: 'Earn XP and badges, publish your project, compete on the leaderboard, and keep building.' },
            ].map(f => (
              <div key={f.step} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, margin: '0 auto 18px', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>{f.step}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SCHOOL DEMO ── */}
      <div id="book-demo" style={{ background: 'linear-gradient(160deg, #08101e 0%, #0f1a3a 100%)', borderTop: '1px solid rgba(99,102,241,0.15)', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '90px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={sectionLabel}>For Schools</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
              Free 30-day school pilot — no hoops, no cost.
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              We set up your classes, train your teachers, and give you a live walkthrough. You see exactly how ByteBuddies fits your curriculum before committing to anything.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {[
                'Free 30-day pilot — no credit card needed',
                'Dedicated onboarding and teacher training',
                'Custom class setup done for you',
                'Curriculum alignment report for your school',
                'Google Classroom sync available on request',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#94a3b8' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, color: '#818cf8' }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 280, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 32 }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Book a free school demo</div>
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 24 }}>Usually responds within 1 school day</div>
            {['School name', 'Your name and role', 'Email address', 'Number of students'].map((placeholder, i) => (
              <input key={i} placeholder={placeholder} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#fff', marginBottom: 12, boxSizing: 'border-box', outline: 'none' }} />
            ))}
            <textarea placeholder="Anything specific you would like to see? (optional)" rows={3} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#fff', marginBottom: 16, boxSizing: 'border-box', outline: 'none', resize: 'vertical' }} />
            <button onClick={() => alert('Thank you! We will be in touch within 1 school day.')} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 24px rgba(99,102,241,0.4)' }}>
              Request a Free Demo →
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Testimonials */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
        <div style={sectionLabel}>What Teachers Say</div>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, marginBottom: 48, lineHeight: 1.2 }}>Schools love ByteBuddies</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {[
            { quote: "My Year 5 students were building working games within the first lesson. The mission stories kept them engaged for the whole hour — no one asked to go to the toilet once!", name: 'Sarah M.', role: 'Year 5 Teacher, Manchester', avatar: 'SM' },
            { quote: "The teacher dashboard is the best I've seen on any platform. I can see exactly which student is struggling with loops vs. conditions and help them directly.", name: 'James T.', role: 'Computing Coordinator, Bristol', avatar: 'JT' },
            { quote: "We piloted ByteBuddies across 3 year groups. Engagement tripled compared to our previous platform. Kids come to my room at lunch to keep going.", name: 'Priya K.', role: 'STEM Lead, London', avatar: 'PK' },
            { quote: "The curriculum alignment made it very easy to get sign-off from our Head. Everything mapped perfectly to our computing scheme of work.", name: 'David R.', role: 'Deputy Head & CS Teacher, Edinburgh', avatar: 'DR' },
            { quote: "Parent evenings are so much easier now. I show parents the skill tracker and they immediately understand what their child has learned.", name: 'Amelia F.', role: 'KS2 Computing Teacher, Birmingham', avatar: 'AF' },
            { quote: "My class has a leaderboard on the whiteboard every week. Students are logging in at home to do more missions. Never seen that with any other platform.", name: 'Tom W.', role: 'Year 6 Teacher, Leeds', avatar: 'TW' },
          ].map(t => (
            <div key={t.name} style={{ ...card, position: 'relative', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: 36, color: '#6366f1', fontFamily: 'Georgia, serif', lineHeight: 1, marginBottom: 12, opacity: 0.35 }}>"</div>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.8, margin: '0 0 20px', fontStyle: 'italic' }}>{t.quote}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '90px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <div style={sectionLabel}>Pricing</div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.5px' }}>Simple. Transparent. Affordable.</h2>
          <p style={{ color: '#475569', fontSize: 16, marginBottom: 52, lineHeight: 1.7 }}>Start free. No credit card. No commitment. Cancel any time.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 620, margin: '0 auto' }}>
            {[
              {
                name: 'Classroom', price: 'AED 44', period: '/student/year', desc: 'Billed annually per student',
                features: ['Full workspace & Game Builder', 'Robot Lab & Block Coding', 'AI Assistant & Challenges', 'Teacher dashboard & grading', 'Progress tracking & leaderboards', 'XP, badges & gamification'],
                color: '#8b5cf6', highlight: true,
              },
              {
                name: 'School', price: 'AED 15,000', period: '/year', desc: 'Unlimited classrooms and students',
                features: ['Everything in Classroom', 'Unlimited teachers and students', 'Admin dashboard', 'Priority support', 'Custom branding', 'Onboarding and training session'],
                color: '#ec4899',
              },
            ].map(p => (
              <div key={p.name} style={{ ...card, border: p.highlight ? '2px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)', position: 'relative', padding: '36px 26px', background: p.highlight ? 'rgba(99,102,241,0.07)' : 'rgba(255,255,255,0.03)' }}>
                {p.highlight && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 100, padding: '5px 16px', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: 0.5 }}>MOST POPULAR</div>}
                <div style={{ fontSize: 13, fontWeight: 800, color: p.color, marginBottom: 14, letterSpacing: 0.5 }}>{p.name.toUpperCase()}</div>
                <div style={{ fontSize: 38, fontWeight: 900, marginBottom: 4, letterSpacing: '-1px' }}>{p.price}<span style={{ fontSize: 14, color: '#475569', fontWeight: 400 }}>{p.period}</span></div>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 28 }}>{p.desc}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', textAlign: 'left' }}>
                  {p.features.map(f => <li key={f} style={{ fontSize: 13, color: '#94a3b8', padding: '6px 0', display: 'flex', gap: 9 }}><span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>{f}</li>)}
                </ul>
                <button onClick={onSignup} style={{ width: '100%', padding: '12px', background: p.highlight ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.07)', border: p.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: p.highlight ? '0 4px 20px rgba(99,102,241,0.35)' : 'none' }}>
                  Get Started Free
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7. FINAL OFFER / CTA ── */}
      <div style={{ textAlign: 'center', padding: '100px 24px', background: 'linear-gradient(160deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.08) 100%)', borderTop: '1px solid rgba(99,102,241,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={sectionLabel}>Get Started Today</div>
        <h2 style={{ fontSize: 'clamp(30px, 5vw, 56px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.1 }}>
          Your child's first lesson<br /><span style={gradText}>is completely free.</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: 17, marginBottom: 16, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 20px' }}>
          No credit card. No commitment. If your child doesn't build something in their first session, we'll refund every penny — no questions asked.
        </p>
        <p style={{ color: '#f59e0b', fontWeight: 700, fontSize: 14, marginBottom: 40, letterSpacing: 0.3 }}>
          Cohort spots are limited. We cap class sizes to keep quality high.
        </p>
        <button onClick={onSignup} style={{ padding: '20px 56px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 16, color: '#fff', cursor: 'pointer', fontSize: 20, fontWeight: 900, boxShadow: '0 8px 48px rgba(99,102,241,0.6)', letterSpacing: '-0.3px', marginBottom: 24 }}>
          Claim Your Free Lesson →
        </button>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['First lesson free', '30-day money-back guarantee', 'No credit card required'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#475569' }}>
              <span style={{ color: '#22c55e', fontSize: 15 }}>✓</span>{t}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>B</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#475569' }}>ByteBuddies</span>
        </div>
        <div style={{ fontSize: 13, color: '#334155' }}>© 2026 ByteBuddies · Built for the next generation of creators</div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#334155' }}>
          {['Privacy', 'Terms', 'Contact'].map(l => <span key={l} style={{ cursor: 'pointer' }}>{l}</span>)}
        </div>
      </div>

    </div>
  );
}
