import React, { useEffect, useState } from 'react';
import { isSlowConnection } from '../utils/network.js';
import { EmojiIcon } from './ui/Icon.jsx';

const pill = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#a5b4fc' };
const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px' };
const sectionLabel = { fontSize: 12, fontWeight: 700, letterSpacing: 3, color: '#6366f1', textTransform: 'uppercase', marginBottom: 14 };
const gradText = { background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };

export const CONTACT_EMAIL = 'bytebuddies.technology@gmail.com';
// Slow connections get the 480p copy (4 MB) instead of 1080p (26 MB)
const DEMO_VIDEO = isSlowConnection() ? '/media/bytebuddies-tour-480p.mp4?v=2026-10' : '/media/bytebuddies-tour.mp4?v=2026-10';
const DEMO_POSTER = '/media/bytebuddies-tour-poster.jpg?v=2026-10';
const fieldStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#fff', marginBottom: 12, boxSizing: 'border-box', outline: 'none' };

const RESPONSIVE_CSS = `
  .lp-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 72px;
    padding: 0 clamp(16px, 4vw, 48px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    position: sticky;
    top: 0;
    background: rgba(8,8,18,0.92);
    backdrop-filter: blur(16px);
    z-index: 100;
    gap: clamp(12px, 2vw, 28px);
  }
  .lp-nav-links {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    background: rgba(255,255,255,0.035);
    font-size: 14px;
    color: #a8b0c2;
  }
  .lp-nav-links a {
    padding: 9px 12px;
    border-radius: 8px;
    color: #a8b0c2;
    text-decoration: none;
    transition: color 0.15s, background 0.15s;
    white-space: nowrap;
    font-weight: 600;
  }
  .lp-nav-links a:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .lp-nav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .lp-nav-actions button {
    min-height: 40px;
    border-radius: 9px;
    cursor: pointer;
    font-family: inherit;
    transition: transform 0.15s, background 0.15s, border-color 0.15s;
  }
  .lp-nav-actions button:hover { transform: translateY(-1px); }
  .lp-nav-login {
    padding: 0 16px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.16);
    color: #d4d9e5;
    font-size: 13px;
    font-weight: 650;
  }
  .lp-nav-login:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.28); }
  .lp-nav-signup {
    padding: 0 18px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: 1px solid rgba(196,181,253,0.35);
    color: #fff;
    font-size: 13px;
    font-weight: 750;
    box-shadow: 0 5px 18px rgba(99,102,241,0.24);
  }
  .lp-nav-signup:hover { box-shadow: 0 7px 22px rgba(99,102,241,0.34); }
  .lp-nav-actions .lp-nav-dev {
    min-height: 34px;
    padding: 0 10px;
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.22);
    color: #6ee7b7;
    font-size: 11px;
    font-weight: 700;
  }
  .lp-hamburger {
    display: none;
    background: none;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px;
    color: #e2e8f0;
    cursor: pointer;
    width: 42px;
    height: 42px;
    padding: 0;
    font-size: 18px;
    line-height: 1;
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s;
  }
  .lp-hamburger:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.28); }
  .lp-mobile-menu {
    display: none;
    flex-direction: column;
    gap: 0;
    background: rgba(8,8,18,0.98);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 8px 0;
  }
  .lp-mobile-menu.open { display: flex; }
  .lp-mobile-menu a {
    display: block;
    padding: 14px 24px;
    color: #94a3b8;
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .lp-mobile-menu a:hover { color: #a5b4fc; background: rgba(99,102,241,0.06); }
  .lp-mobile-menu-actions {
    display: flex;
    gap: 10px;
    padding: 14px 24px 18px;
  }
  .lp-footer {
    border-top: 1px solid rgba(255,255,255,0.05);
    padding: 32px 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  .lp-section-pad { padding: 90px 24px; }
  .lp-trust-bar {
    gap: 48px;
    padding: 20px 24px;
  }
  .lp-two-col {
    display: flex;
    gap: 60px;
    align-items: center;
    flex-wrap: wrap;
  }

  @media (max-width: 900px) {
    .lp-nav { gap: 12px; }
    .lp-nav-links { font-size: 12px; }
    .lp-nav-links a { padding: 8px 9px; }
    .lp-nav-actions { gap: 6px; }
    .lp-section-pad { padding: 64px 20px; }
    .lp-trust-bar { gap: 28px; }
    .lp-two-col { gap: 36px; }
    .lp-footer { padding: 28px 24px; }
  }

  @media (max-width: 880px) {
    .lp-nav-links { display: none; }
    .lp-hamburger { display: flex; align-items: center; justify-content: center; }
    .lp-section-pad { padding: 48px 16px; }
    .lp-trust-bar { gap: 20px; padding: 16px; }
    .lp-two-col { gap: 28px; }
    .lp-footer { padding: 24px 16px; flex-direction: column; text-align: center; }
  }

  @media (max-width: 560px) {
    .lp-nav-actions { display: none; }
  }
  @media (max-width: 420px) {
    .lp-section-pad { padding: 36px 14px; }
    .lp-trust-bar { padding: 14px; }
  }
`;

export default function LandingPage({ onLogin, onTeacherLogin, onSignup, onDevGuest }) {
  const [xp, setXp] = useState(340);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [enquiry, setEnquiry] = useState({ type: 'Book a demo', school: '', name: '', email: '', pupils: '', country: '', message: '' });
  const [enquiryState, setEnquiryState] = useState({ sent: false, error: '' });
  const setField = (k) => (e) => { setEnquiry((q) => ({ ...q, [k]: e.target.value })); setEnquiryState({ sent: false, error: '' }); };
  const askFor = (type) => { setEnquiry((q) => ({ ...q, type })); document.getElementById('book-demo')?.scrollIntoView({ behavior: 'smooth' }); };
  const sendEnquiry = () => {
    const q = enquiry;
    if (!q.school.trim() || !q.name.trim()) { setEnquiryState({ sent: false, error: 'Please add your school and your name.' }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q.email.trim())) { setEnquiryState({ sent: false, error: 'Please add a valid email address so we can reply.' }); return; }
    const body = [
      `Enquiry: ${q.type}`,
      `School: ${q.school}`,
      `Name and role: ${q.name}`,
      `Email: ${q.email}`,
      `Number of pupils: ${q.pupils || '-'}`,
      `Country / city: ${q.country || '-'}`,
      '',
      q.message || '',
    ].join('\n');
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`ByteBuddies: ${q.type} - ${q.school}`)}&body=${encodeURIComponent(body)}`;
    setEnquiryState({ sent: true, error: '' });
  };

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

  const navLinks = [['Watch Demo', 'demo-video'], ['Curriculum', 'how-it-works'], ['For Schools', 'book-demo'], ['Pricing', 'pricing']];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #080812 0%, #0f0f23 40%, #0a1628 100%)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
      <style>{RESPONSIVE_CSS}</style>

      {/* NAV */}
      <nav className="lp-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>B</div>
          <span style={{ fontWeight: 900, fontSize: 20, ...gradText }}>ByteBuddies</span>
        </div>

        <div className="lp-nav-links">
          {navLinks.map(([l, id]) => (
            <a key={l} href={`#${id}`}>{l}</a>
          ))}
        </div>

        <div className="lp-nav-actions">
          {onDevGuest && (
            <button type="button" onClick={onDevGuest} title="Local dev only — no Firebase"
              className="lp-nav-dev">
              Dev guest
            </button>
          )}
          <button className="lp-nav-login" onClick={onTeacherLogin || onLogin}>Teacher sign in</button>
          <button className="lp-nav-login" onClick={onLogin}>Log In</button>
          <button className="lp-nav-signup" onClick={onSignup}>Start Free</button>
        </div>

        <button className="lp-hamburger" onClick={() => setMobileMenuOpen(o => !o)} aria-label="Menu" aria-expanded={mobileMenuOpen} aria-controls="lp-mobile-menu">
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div id="lp-mobile-menu" className={`lp-mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
        {navLinks.map(([l, id]) => (
          <a key={l} href={`#${id}`} onClick={() => setMobileMenuOpen(false)}>{l}</a>
        ))}
        <div className="lp-mobile-menu-actions">
          <button onClick={() => { setMobileMenuOpen(false); (onTeacherLogin || onLogin)(); }} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 8, color: '#6ee7b7', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Teacher sign in</button>
          <button onClick={() => { setMobileMenuOpen(false); onLogin(); }} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Log In</button>
          <button onClick={() => { setMobileMenuOpen(false); onSignup(); }} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Start Free</button>
        </div>
      </div>

      {/* ── 1. HERO ── */}
      <section className="lp-section-pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ ...pill, marginBottom: 28, fontSize: 13 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Now booking free school pilots for 2026–27
        </div>

        <h1 style={{ fontSize: 'clamp(32px, 7vw, 76px)', fontWeight: 900, lineHeight: 1.08, marginBottom: 24, maxWidth: 860, letterSpacing: '-1.5px' }}>
          Your child spends 7 hours a day on screens.<br />
          <span style={gradText}>Make every minute count.</span>
        </h1>

        <p style={{ fontSize: 'clamp(15px, 2.5vw, 19px)', color: '#94a3b8', maxWidth: 580, lineHeight: 1.75, marginBottom: 12 }}>
          ByteBuddies turns screen time into building time. Kids aged 7–16 go from passive scrollers to confident creators — building real games, apps, and AI projects in weeks, not years.
        </p>
        <p style={{ fontSize: 14, color: '#6366f1', fontWeight: 600, marginBottom: 32, letterSpacing: 0.3 }}>
          Built for British curriculum schools worldwide · KS2 Computing, Years 3–6
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          <button onClick={onSignup} style={{ padding: 'clamp(14px,3vw,18px) clamp(24px,5vw,44px)', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 14, color: '#fff', cursor: 'pointer', fontSize: 'clamp(15px,2.5vw,18px)', fontWeight: 800, boxShadow: '0 8px 40px rgba(99,102,241,0.55)', letterSpacing: '-0.3px' }}>
            Claim Your Free First Lesson
          </button>
          <button onClick={() => { window.location.hash = 'learn/y3/w01'; }} style={{ padding: 'clamp(14px,3vw,18px) clamp(18px,3vw,32px)', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 14, color: '#6ee7b7', cursor: 'pointer', fontSize: 'clamp(14px,2vw,16px)', fontWeight: 700 }}>
            <EmojiIcon e="📚" style={{ marginRight: '0.35em' }} />Open Year 3 Week 1 (no login)
          </button>
          <button onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: 'clamp(14px,3vw,18px) clamp(18px,3vw,32px)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, color: '#cbd5e1', cursor: 'pointer', fontSize: 'clamp(14px,2vw,16px)', fontWeight: 600 }}>
            <EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Watch the Demo
          </button>
        </div>

        <div style={{ display: 'flex', gap: 'clamp(12px,3vw,28px)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Free school pilot', 'No robot kits needed', 'Runs in any browser'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#475569' }}>
              <span style={{ color: '#22c55e', fontSize: 15 }}>✓</span>{t}
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 920, margin: '0 auto 8px', padding: '0 16px 8px' }}>
        <div style={{ borderRadius: 22, padding: '22px 22px 18px', background: 'linear-gradient(160deg, rgba(16,185,129,0.14), rgba(99,102,241,0.1))', border: '1px solid rgba(52,211,153,0.4)', textAlign: 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.4, color: '#6ee7b7', marginBottom: 6 }}>NEW · GLOBAL PRIMARY COMPUTING · DETAILED EDITION</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>152 classroom-ready lessons · Years 3–6</div>
          <p style={{ fontSize: 15, color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 14px' }}>
            There are 38 lessons in each year group (Years 3–6), 152 across the full KS2 path. Week 1 is live: <b>Welcome to ByteBuddies — safe, smart computing</b>, with teacher notes, vocabulary, activities, and a quiz.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {['Device charter', 'Password vs PIN', 'Dot the robot', 'Quiz with why'].map((t) => (
              <span key={t} style={{ fontSize: 12, fontWeight: 700, padding: '6px 10px', borderRadius: 10, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.12)' }}>{t}</span>
            ))}
          </div>
          <button type="button" onClick={() => { window.location.hash = 'learn/y3/w01'; }} style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: '#10b981', color: '#042f2e', fontWeight: 800, cursor: 'pointer', fontSize: 15 }}>
            Start Week 1 now →
          </button>
        </div>
      </section>

      {/* ── DEMO VIDEO ── */}
      <section id="demo-video" className="lp-section-pad" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={sectionLabel}>See It In Action</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 44px)', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.5px' }}>
            A 2½-minute tour of ByteBuddies
          </h2>
          <p style={{ color: '#64748b', fontSize: 'clamp(13px,2vw,16px)', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 28px' }}>
            See everything pupils, teachers and parents get: KS2 lessons, story missions, Game Builder, 3D Robot Studio, Robot Lab, Classroom, Google Classroom, the staff planner and the parent view, with a full voiceover.
          </p>
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(99,102,241,0.35)', boxShadow: '0 20px 80px rgba(99,102,241,0.25)', background: '#000', aspectRatio: '16 / 9' }}>
            <video src={DEMO_VIDEO} poster={DEMO_POSTER} controls playsInline preload="none" aria-label="Narrated tour of ByteBuddies for pupils and teachers" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', background: '#000' }}>
              Your browser cannot play this video.
            </video>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
            <button onClick={() => askFor('Book a demo')} style={{ padding: '13px 26px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 800 }}>Book a live demo →</button>
            <button onClick={() => askFor('Free school pilot')} style={{ padding: '13px 26px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 12, color: '#6ee7b7', cursor: 'pointer', fontSize: 15, fontWeight: 700 }}>Start a free pilot</button>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', padding: '20px 16px' }}>
        <div className="lp-trust-bar" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {[['152', 'KS2 lessons'], ['Years 3–6', 'Ready to teach'], ['18', '3D robots to code'], ['37', 'Game worlds'], ['Blocks → Python', 'One platform']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center', padding: '4px 8px' }}>
              <div style={{ fontWeight: 900, fontSize: 'clamp(18px,3vw,22px)', ...gradText }}>{n}</div>
              <div style={{ fontSize: 12, color: '#475569', letterSpacing: 0.5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. PROBLEM ── */}
      <section className="lp-section-pad" style={{ textAlign: 'center', maxWidth: 860, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={sectionLabel}>The Problem</div>
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 46px)', fontWeight: 900, marginBottom: 20, lineHeight: 1.15, letterSpacing: '-0.5px' }}>
          Your child's generation will either build the future — or be replaced by it.
        </h2>
        <p style={{ fontSize: 'clamp(14px,2vw,17px)', color: '#64748b', lineHeight: 1.8, marginBottom: 40, maxWidth: 640, margin: '0 auto 40px' }}>
          The gap between kids who code and kids who don't is widening every year. Right now, most kids are on the wrong side of it.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            { icon: '📱', color: '#ef4444', title: '7 hours of screen time a day', body: 'The average child spends more time watching strangers play games than learning anything that will matter in 10 years. Passive content is designed to be consumed, not created.' },
            { icon: '🏫', color: '#f59e0b', title: 'Schools are a decade behind', body: "Most computing classes still teach spreadsheets and PowerPoint. By the time your child graduates, AI will have automated 40% of entry-level jobs. School isn't preparing them for that reality." },
            { icon: '😟', color: '#8b5cf6', title: 'Parents are left guessing', body: "You know coding matters. You've tried YouTube tutorials and free apps. They lose interest in 20 minutes. You're left wondering: is there something out there that actually works?" },
          ].map(p => (
            <div key={p.title} style={{ ...card, textAlign: 'left', borderTop: `3px solid ${p.color}20`, background: 'rgba(255,255,255,0.025)' }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}><EmojiIcon e={p.icon} /></div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10, color: '#e2e8f0' }}>{p.title}</div>
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.75 }}>{p.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. SOLUTION ── */}
      <section className="lp-section-pad" style={{ background: 'linear-gradient(160deg, #0c0c28 0%, #111132 100%)', borderTop: '1px solid rgba(99,102,241,0.12)', borderBottom: '1px solid rgba(99,102,241,0.12)', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={sectionLabel}>The ByteBuddies Difference</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 48px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-0.5px' }}>
            This is not another coding app.<br /><span style={gradText}>This is a launchpad.</span>
          </h2>
          <p style={{ fontSize: 'clamp(14px,2vw,17px)', color: '#64748b', lineHeight: 1.8, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
            Kids don't learn to code by watching videos or completing checkbox exercises. They learn by building things they actually care about — and sharing them with people they know.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { icon: '🎮', color: '#6366f1', title: 'Real projects from day one', body: 'Every child builds a working game in their first session. Not a tutorial. Not a demo. Something they made, that they can share.' },
              { icon: '💻', color: '#8b5cf6', title: 'Real code, not just blocks', body: 'We start with visual blocks and progressively introduce Python and JavaScript. By month three, your child writes real code.' },
              { icon: '🤖', color: '#06b6d4', title: 'AI, cybersecurity, game dev', body: 'Exposure to the skills that actually matter: machine learning concepts, ethical hacking basics, and professional game development.' },
              { icon: '🛡️', color: '#10b981', title: 'Safe and structured', body: 'Every lesson has a goal. Every project has a mentor path. Kids always know what to do next, and parents always know what kids are learning.' },
            ].map(s => (
              <div key={s.title} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}25`, borderRadius: 16, padding: '28px 22px', textAlign: 'left' }}>
                <div style={{ width: 48, height: 48, background: `${s.color}18`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}><EmojiIcon e={s.icon} /></div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10, color: '#e2e8f0' }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.75 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. OUTCOMES ── */}
      <section id="outcomes" className="lp-section-pad" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={sectionLabel}>Transformation Timeline</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 48px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-0.5px' }}>
            What will your child be able to do?
          </h2>
          <p style={{ fontSize: 'clamp(13px,2vw,16px)', color: '#64748b', marginBottom: 48, lineHeight: 1.7 }}>
            Not features. Not lessons completed. Actual skills your child will have.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { period: '7 Days', color: '#6366f1', glow: 'rgba(99,102,241,0.2)', headline: 'First game, first win.', outcomes: ['Build and share their first playable game', 'Understand what code actually does', 'Feel the confidence shift: "I made this"', 'Parents notice the change in energy'] },
              { period: '30 Days', color: '#ec4899', glow: 'rgba(236,72,153,0.2)', headline: 'Real skills, visible progress.', outcomes: ['Build interactive apps with real logic', 'Write their first lines of Python', 'Share a project portfolio with family', 'Understand variables, loops, and conditions'] },
              { period: '90 Days', color: '#10b981', glow: 'rgba(16,185,129,0.2)', headline: 'They are now a creator.', outcomes: ['Publish a portfolio of games and apps', 'Compete in coding challenges and win badges', 'Explore AI, cybersecurity, and game design', 'Ahead of 95% of their classmates'] },
            ].map(t => (
              <div key={t.period} style={{ background: `radial-gradient(ellipse at top, ${t.glow}, transparent 70%), rgba(255,255,255,0.03)`, border: `1px solid ${t.color}30`, borderRadius: 20, padding: '32px 24px', textAlign: 'left', position: 'relative' }}>
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

      {/* ── DASHBOARD / GAMIFICATION ── */}
      <section className="lp-section-pad" style={{ background: 'linear-gradient(160deg, #0a0a22 0%, #0f1a32 100%)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="lp-two-col" style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={sectionLabel}>Inside the Platform</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 44px)', fontWeight: 900, marginBottom: 18, letterSpacing: '-0.5px', lineHeight: 1.15 }}>
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
                  <div style={{ width: 40, height: 40, background: 'rgba(99,102,241,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}><EmojiIcon e={f.icon} /></div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 3 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview Card */}
          <div style={{ flex: 1, minWidth: 280, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ background: 'rgba(99,102,241,0.12)', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>A</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Alex, Age 11</div>
                <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>Level 7 — Game Dev Specialist</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '4px 10px' }}>
                <span style={{ fontSize: 14 }}><EmojiIcon e="🔥" /></span>
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

      {/* ── 5. WHAT PUPILS BUILD ── */}
      <section className="lp-section-pad">
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={sectionLabel}>Inside Robot Studio</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 12 }}>
              Not basic 3D. Real games, coded by pupils.
            </h2>
            <p style={{ fontSize: 'clamp(13px,2vw,16px)', color: '#64748b', maxWidth: 620, margin: '0 auto', lineHeight: 1.75 }}>
              Most 3D coding sites give you one robot in an empty room. In ByteBuddies the world is the game, and code is how pupils play it.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { icon: '🏟️', color: '#6366f1', title: 'Arena Quest', body: 'Guide a robot through mazes of lava, keys, doors, portals and bugs using loops, sensors and if-statements.' },
              { icon: '🛠️', color: '#10b981', title: 'Build your own arena', body: 'Pupils design levels in 37 themed worlds (coral reef, moon base, jungle temple and more), then share them with a code.' },
              { icon: '🤖', color: '#ec4899', title: 'Design your own robot', body: 'Choose body, head, eyes, arms, wheels or legs, gadgets and colours, then code it in 3D.' },
              { icon: '👾', color: '#f59e0b', title: 'Classic arcade, in 3D', body: 'Space Raiders, Pac-Bot, Brick Bot, Hop Bot and Snake Bot, each played by writing code, not pressing keys.' },
              { icon: '⚽', color: '#06b6d4', title: 'Sport and racing', body: 'Football, kart racing on cup tracks, drones and jets. Sensors and maths with an instant reason to care.' },
              { icon: '🔌', color: '#8b5cf6', title: 'Real hardware when you have it', body: 'The same skills flash straight to micro:bit, Arduino and mBot. Kits are optional, never required.' },
            ].map(f => (
              <div key={f.title} style={{ ...card, textAlign: 'left', background: 'rgba(255,255,255,0.025)', borderTop: `3px solid ${f.color}` }}>
                <div style={{ fontSize: 30, marginBottom: 12 }}><EmojiIcon e={f.icon} /></div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: '#e2e8f0' }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. UNIQUE POSITIONING ── */}
      <section className="lp-section-pad" style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={sectionLabel}>Why ByteBuddies</div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 16 }}>
              Not just another coding site.
            </h2>
            <p style={{ fontSize: 'clamp(13px,2vw,16px)', color: '#64748b', maxWidth: 560, margin: '0 auto', lineHeight: 1.75 }}>
              There are hundreds of coding platforms. Most teach the basics and stop there. ByteBuddies is built for where the world is going, not where it's been.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
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

      {/* ── CURRICULUM ── */}
      <section id="how-it-works" className="lp-section-pad" style={{ maxWidth: 960, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={sectionLabel}>Curriculum Aligned</div>
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 42px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.15 }}>
          Mapped to what schools actually require
        </h2>
        <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, marginBottom: 40, maxWidth: 640 }}>
          ByteBuddies is fully mapped to the UK National Curriculum for Computing (KS2 & KS3), CSTA K-12 Computer Science Standards, and the Cambridge Digital Literacy framework.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
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
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Download our full Curriculum Map</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>A detailed PDF showing exactly how each lesson maps to curriculum standards.</div>
          </div>
          <button onClick={() => { window.location.hash = 'whitepaper'; }} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>
            View Curriculum Map →
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <div className="lp-section-pad" style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={sectionLabel}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 40px)', fontWeight: 900 }}>Up and running in under 5 minutes</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            {[
              { step: '01', title: 'Arrange school access', desc: 'Agree a school quote with us. We activate your teacher account with the pupil places included, and you add pupils from your classroom.' },
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
      <div id="book-demo" className="lp-section-pad" style={{ background: 'linear-gradient(160deg, #08101e 0%, #0f1a3a 100%)', borderTop: '1px solid rgba(99,102,241,0.15)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="lp-two-col" style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={sectionLabel}>For Schools</div>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 40px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
              Free one-term school pilot — no hoops, no cost.
            </h2>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              We set up your classes, train your teachers, and give you a live walkthrough. You see exactly how ByteBuddies fits your curriculum before committing to anything.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {['Free one-term pilot for one class', 'Dedicated onboarding and teacher training', 'Custom class setup done for you', 'Curriculum alignment report for your school', 'Google Classroom sync available on request'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#94a3b8' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, color: '#818cf8' }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 260, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 28 }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Book a demo or request a quote</div>
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 20 }}>Usually responds within 1 school day</div>
            <select value={enquiry.type} onChange={setField('type')} aria-label="What would you like?" style={{ ...fieldStyle, appearance: 'auto', background: '#121a33' }}>
              {['Book a demo', 'Request a quote', 'Free school pilot', 'School group / multiple schools', 'Something else'].map(o => <option key={o}>{o}</option>)}
            </select>
            {[['school', 'School name *'], ['name', 'Your name and role *'], ['email', 'Email address *', 'email'], ['pupils', 'Number of pupils'], ['country', 'Country / city']].map(([k, placeholder, type]) => (
              <input key={k} type={type || 'text'} value={enquiry[k]} onChange={setField(k)} placeholder={placeholder} aria-label={placeholder} style={fieldStyle} />
            ))}
            <textarea value={enquiry.message} onChange={setField('message')} placeholder="Anything specific you would like to see? (optional)" rows={3} style={{ ...fieldStyle, marginBottom: 16, resize: 'vertical', fontFamily: 'inherit' }} />
            {enquiryState.error && <div role="alert" style={{ color: '#fca5a5', fontSize: 13, marginBottom: 12 }}>{enquiryState.error}</div>}
            <button onClick={sendEnquiry} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 24px rgba(99,102,241,0.4)' }}>
              Send enquiry →
            </button>
            {enquiryState.sent ? (
              <div role="status" style={{ marginTop: 14, fontSize: 13, color: '#6ee7b7', lineHeight: 1.6 }}>
                ✓ Your email app should now open with your enquiry ready to send. If it doesn't, email us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#a5b4fc' }}>{CONTACT_EMAIL}</a>.
              </div>
            ) : (
              <div style={{ marginTop: 14, fontSize: 12, color: '#475569', textAlign: 'center' }}>
                Or email us directly: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#a5b4fc' }}>{CONTACT_EMAIL}</a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" className="lp-section-pad" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', textAlign: 'center' }}>
          <div style={sectionLabel}>Pricing</div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 44px)', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.5px' }}>Priced for your school</h2>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 44, lineHeight: 1.7, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
            Every school is different, so we quote by school size and the year groups you teach. Get in touch and we'll send a tailored quote, usually within one school day.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            {[
              {
                name: 'Free Pilot', tag: 'One class · one term', cta: 'Start a free pilot', type: 'Free school pilot', color: '#10b981',
                features: ['Full platform for one class', 'Teacher setup and walkthrough', 'KS2 lessons, Robot Studio and Create Studio', 'Progress report at the end of the pilot'],
              },
              {
                name: 'Whole School', tag: 'Most schools choose this', cta: 'Request a quote', type: 'Request a quote', color: '#8b5cf6', highlight: true,
                features: ['Every teacher and pupil in your school', '152-lesson KS2 scheme, Years 3–6', '18 robots, 37 worlds, arcade and arena games', 'Teacher dashboard, marking and hand-ins', 'Google Classroom sync and parent view', 'Staff training and onboarding'],
              },
              {
                name: 'School Groups', tag: 'Multiple campuses', cta: 'Talk to us', type: 'School group / multiple schools', color: '#ec4899',
                features: ['Everything in Whole School', 'Group-wide pricing', 'Shared reporting across schools', 'Priority support and custom branding'],
              },
            ].map(p => (
              <div key={p.name} style={{ ...card, border: p.highlight ? '2px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)', position: 'relative', padding: '32px 24px', background: p.highlight ? 'rgba(99,102,241,0.07)' : 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column' }}>
                {p.highlight && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 100, padding: '5px 16px', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: 0.5 }}>MOST POPULAR</div>}
                <div style={{ fontSize: 13, fontWeight: 800, color: p.color, marginBottom: 10, letterSpacing: 0.5 }}>{p.name.toUpperCase()}</div>
                <div style={{ fontSize: 'clamp(22px,4vw,28px)', fontWeight: 900, marginBottom: 4 }}>{p.name === 'Free Pilot' ? 'Free' : 'Contact us'}</div>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 22 }}>{p.tag}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', textAlign: 'left', flex: 1 }}>
                  {p.features.map(f => <li key={f} style={{ fontSize: 13, color: '#94a3b8', padding: '6px 0', display: 'flex', gap: 9 }}><span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>{f}</li>)}
                </ul>
                <button onClick={() => askFor(p.type)} style={{ width: '100%', padding: '12px', background: p.highlight ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.07)', border: p.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: p.highlight ? '0 4px 20px rgba(99,102,241,0.35)' : 'none' }}>
                  {p.cta} →
                </button>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 28, fontSize: 13, color: '#64748b' }}>
            Prefer email? <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('ByteBuddies quote request')}`} style={{ color: '#a5b4fc' }}>{CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div className="lp-section-pad" style={{ textAlign: 'center', background: 'linear-gradient(160deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.08) 100%)', borderTop: '1px solid rgba(99,102,241,0.15)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={sectionLabel}>Get Started Today</div>
        <h2 style={{ fontSize: 'clamp(26px, 5vw, 56px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.1 }}>
          Try ByteBuddies with your pupils<br /><span style={gradText}>free for a whole term.</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: 'clamp(14px,2.5vw,17px)', marginBottom: 16, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 16px' }}>
          We set up a class, train the teacher and send you a progress report at the end. No cost, no commitment.
        </p>
        <p style={{ color: '#f59e0b', fontWeight: 700, fontSize: 14, marginBottom: 36, letterSpacing: 0.3 }}>
          Now booking pilots for the 2026–27 school year.
        </p>
        <button onClick={() => askFor('Free school pilot')} style={{ padding: 'clamp(14px,3vw,20px) clamp(28px,6vw,56px)', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: 16, color: '#fff', cursor: 'pointer', fontSize: 'clamp(16px,3vw,20px)', fontWeight: 900, boxShadow: '0 8px 48px rgba(99,102,241,0.6)', letterSpacing: '-0.3px', marginBottom: 24 }}>
          Book a Free School Pilot →
        </button>
        <div style={{ display: 'flex', gap: 'clamp(12px,3vw,28px)', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['One class, one term, free', 'Teacher training included', 'Google Classroom ready'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#475569' }}>
              <span style={{ color: '#22c55e', fontSize: 15 }}>✓</span>{t}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="lp-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>B</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#475569' }}>ByteBuddies</span>
        </div>
        <div style={{ fontSize: 13, color: '#334155' }}>© 2026 ByteBuddies · Built for the next generation of creators</div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#334155' }}>
          <a href="/privacy.html" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy &amp; Google data</a>
          <a href="/terms.html" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#334155', textDecoration: 'none' }}>Contact</a>
        </div>
      </div>

    </div>
  );
}
