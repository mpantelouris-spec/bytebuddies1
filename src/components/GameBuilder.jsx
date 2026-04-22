import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BLOCK_DEFS, SIDEBAR_TO_TYPE, createBlockFromDrop, BlockContent } from '../utils/blocks';
import { getBlockStyle, getCategoryVars } from '../utils/categoryColors';
import { saveSubmissionToFirestore } from '../firebase';
import { useUser } from '../contexts/UserContext';

const STAGE_W = 480;
const STAGE_H = 360;

/* ─── Sprite Library (SVG-based characters) ─── */
const SPRITE_LIBRARY = [
  {
    category: 'People',
    items: [
      { name: 'Cat', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="cat_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="cat_bg" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fef3c7"/><stop offset="60%" stop-color="${c||'#f59e0b'}"/><stop offset="100%" stop-color="#b45309"/></radialGradient><radialGradient id="cat_body" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fde68a"/><stop offset="55%" stop-color="${c||'#f59e0b'}"/><stop offset="100%" stop-color="#92400e"/></radialGradient></defs><g filter="url(#cat_f1)"><polygon points="14,22 8,4 24,18" fill="${c||'#f59e0b'}"/><polygon points="50,22 56,4 40,18" fill="${c||'#f59e0b'}"/><polygon points="15,21 11,8 22,18" fill="#fca5a5" opacity="0.75"/><polygon points="49,21 53,8 42,18" fill="#fca5a5" opacity="0.75"/><ellipse cx="32" cy="44" rx="18" ry="16" fill="url(#cat_body)"/><circle cx="32" cy="28" r="18" fill="url(#cat_bg)"/><ellipse cx="24" cy="26" rx="5" ry="5.5" fill="#fff"/><ellipse cx="40" cy="26" rx="5" ry="5.5" fill="#fff"/><ellipse cx="24" cy="27" rx="3" ry="4" fill="#1a0a00"/><ellipse cx="40" cy="27" rx="3" ry="4" fill="#1a0a00"/><circle cx="23" cy="26" r="1.2" fill="#fff"/><circle cx="39" cy="26" r="1.2" fill="#fff"/><ellipse cx="32" cy="33" rx="3" ry="2" fill="#f9a8d4"/><path d="M29 34 Q32 37 35 34" stroke="#be185d" stroke-width="1.5" fill="none"/><line x1="10" y1="32" x2="25" y2="34" stroke="#9ca3af" stroke-width="1.2" stroke-linecap="round"/><line x1="10" y1="35" x2="25" y2="36" stroke="#9ca3af" stroke-width="1.2" stroke-linecap="round"/><line x1="54" y1="32" x2="39" y2="34" stroke="#9ca3af" stroke-width="1.2" stroke-linecap="round"/><line x1="54" y1="35" x2="39" y2="36" stroke="#9ca3af" stroke-width="1.2" stroke-linecap="round"/><path d="M48 55 Q60 48 58 38 Q56 30 52 35" stroke="${c||'#f59e0b'}" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="25" cy="20" rx="5" ry="2.5" fill="#fff" opacity="0.4"/></g></svg>`, color: '#f59e0b' },
      { name: 'Boy', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="24" r="16" fill="#fde68a"/><rect x="22" y="38" width="20" height="24" rx="4" fill="${c||'#3b82f6'}"/><circle cx="26" cy="22" r="2" fill="#222"/><circle cx="38" cy="22" r="2" fill="#222"/><path d="M28 28 Q32 32 36 28" stroke="#222" fill="none" stroke-width="1.5"/><rect x="16" y="8" width="32" height="12" rx="4" fill="#8B4513"/></svg>`, color: '#3b82f6' },
      { name: 'Girl', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="24" r="16" fill="#fde68a"/><rect x="22" y="38" width="20" height="24" rx="4" fill="${c||'#ec4899'}"/><circle cx="26" cy="22" r="2" fill="#222"/><circle cx="38" cy="22" r="2" fill="#222"/><path d="M28 28 Q32 32 36 28" stroke="#222" fill="none" stroke-width="1.5"/><path d="M12 20 Q16 4 32 8 Q48 4 52 20 L50 32 Q46 28 42 30 L40 22 Q32 16 24 22 L22 30 Q18 28 14 32 Z" fill="#4a2810"/></svg>`, color: '#ec4899' },
      { name: 'Robot', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="rh1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></linearGradient><linearGradient id="rb1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#64748b"/><stop offset="100%" stop-color="#1e293b"/></linearGradient><radialGradient id="re1" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="${c||'#67e8f9'}"/><stop offset="100%" stop-color="#0891b2"/></radialGradient></defs><line x1="32" y1="6" x2="32" y2="14" stroke="#64748b" stroke-width="2"/><circle cx="32" cy="5" r="3.5" fill="#f0abfc"/><rect x="14" y="13" width="36" height="28" rx="6" fill="url(#rh1)" stroke="#334155" stroke-width="1"/><rect x="18" y="19" width="11" height="8" rx="3" fill="url(#re1)"/><rect x="35" y="19" width="11" height="8" rx="3" fill="url(#re1)"/><rect x="20" y="21" width="4" height="4" rx="1" fill="#fff" opacity="0.5"/><rect x="37" y="21" width="4" height="4" rx="1" fill="#fff" opacity="0.5"/><rect x="18" y="31" width="28" height="6" rx="2" fill="#1e293b"/><line x1="22" y1="31" x2="22" y2="37" stroke="#475569" stroke-width="1"/><line x1="27" y1="31" x2="27" y2="37" stroke="#475569" stroke-width="1"/><line x1="32" y1="31" x2="32" y2="37" stroke="#475569" stroke-width="1"/><line x1="37" y1="31" x2="37" y2="37" stroke="#475569" stroke-width="1"/><line x1="42" y1="31" x2="42" y2="37" stroke="#475569" stroke-width="1"/><rect x="27" y="41" width="10" height="5" rx="2" fill="#475569"/><rect x="10" y="46" width="44" height="16" rx="5" fill="url(#rb1)" stroke="#334155" stroke-width="1"/><rect x="20" y="50" width="24" height="8" rx="3" fill="#1e293b"/><circle cx="26" cy="54" r="2.5" fill="#22d3ee"/><circle cx="32" cy="54" r="2.5" fill="#f0abfc"/><circle cx="38" cy="54" r="2.5" fill="#4ade80"/><rect x="2" y="46" width="8" height="12" rx="3" fill="#64748b" stroke="#475569" stroke-width="1"/><rect x="54" y="46" width="8" height="12" rx="3" fill="#64748b" stroke="#475569" stroke-width="1"/></svg>`, color: '#94a3b8' },
      { name: 'Wizard', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="14" fill="#fde68a"/><polygon points="32,2 22,24 42,24" fill="${c||'#6366f1'}"/><polygon points="30,2 34,2 36,8 28,8" fill="#f59e0b"/><circle cx="27" cy="30" r="2" fill="#222"/><circle cx="37" cy="30" r="2" fill="#222"/><path d="M14 36 Q16 24 22 26 L20 42 Q16 44 14 36Z" fill="#fff"/><rect x="22" y="42" width="20" height="20" rx="4" fill="${c||'#6366f1'}"/></svg>`, color: '#6366f1' },
      { name: 'Ninja', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="22" r="12" fill="#fde68a"/><rect x="20" y="18" width="24" height="7" rx="3" fill="${c||'#1e293b'}"/><rect x="22" y="24" width="20" height="4" rx="1" fill="${c||'#374151'}"/><circle cx="26" cy="20" r="2" fill="#222"/><circle cx="38" cy="20" r="2" fill="#222"/><rect x="22" y="34" width="20" height="24" rx="3" fill="${c||'#1e293b'}"/><polygon points="10,42 22,36 22,52" fill="${c||'#1e293b'}"/><polygon points="54,42 42,36 42,52" fill="${c||'#1e293b'}"/></svg>`, color: '#1e293b' },
      { name: 'Pirate', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="26" r="14" fill="#fde68a"/><path d="M18 16 Q18 4 32 6 Q46 4 46 16 L44 10 L20 10Z" fill="${c||'#111827'}"/><rect x="16" y="10" width="32" height="6" rx="2" fill="${c||'#111827'}"/><circle cx="26" cy="24" r="2" fill="#222"/><rect x="35" y="22" width="5" height="5" rx="1" fill="${c||'#111827'}"/><path d="M26 32 Q32 36 38 32" stroke="#222" fill="none" stroke-width="2"/><rect x="22" y="38" width="20" height="24" rx="3" fill="${c||'#dc2626'}"/></svg>`, color: '#dc2626' },
      { name: 'Princess', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="22" r="13" fill="#fde68a"/><polygon points="20,14 24,4 32,8 40,4 44,14 40,16 32,12 24,16" fill="#f59e0b"/><circle cx="27" cy="20" r="2" fill="#222"/><circle cx="37" cy="20" r="2" fill="#222"/><path d="M28 28 Q32 32 36 28" stroke="#222" fill="none" stroke-width="1.5"/><path d="M14 62 Q16 40 22 38 L32 40 L42 38 Q48 40 50 62Z" fill="${c||'#ec4899'}"/><rect x="24" y="34" width="16" height="8" rx="2" fill="${c||'#f472b6'}"/></svg>`, color: '#ec4899' },
      { name: 'Superhero', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="sh_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="sh_face" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fef3c7"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#92400e"/></radialGradient><radialGradient id="sh_suit" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="55%" stop-color="${c||'#ef4444'}"/><stop offset="100%" stop-color="#7f1d1d"/></radialGradient></defs><g filter="url(#sh_f1)"><path d="M32 0 L34 8 L32 6 L30 8 Z" fill="#fbbf24"/><circle cx="32" cy="22" r="14" fill="url(#sh_face)"/><ellipse cx="24" cy="20" rx="4.5" ry="5" fill="#fff"/><ellipse cx="40" cy="20" rx="4.5" ry="5" fill="#fff"/><circle cx="24" cy="21" r="3" fill="#1e3a5f"/><circle cx="40" cy="21" r="3" fill="#1e3a5f"/><circle cx="23" cy="20" r="1.2" fill="#fff"/><circle cx="39" cy="20" r="1.2" fill="#fff"/><path d="M22 16 Q27 14 32 16" stroke="#92400e" stroke-width="1.8" fill="none"/><path d="M32 16 Q37 14 42 16" stroke="#92400e" stroke-width="1.8" fill="none"/><path d="M27 28 Q32 32 37 28" stroke="#c2410c" stroke-width="1.5" fill="none"/><rect x="27" y="35" width="10" height="5" fill="url(#sh_face)"/><rect x="12" y="40" width="40" height="20" rx="4" fill="url(#sh_suit)"/><path d="M20 40 L32 50 L44 40" fill="#b91c1c"/><rect x="2" y="40" width="10" height="14" rx="4" fill="url(#sh_suit)"/><rect x="52" y="40" width="10" height="14" rx="4" fill="url(#sh_suit)"/><text x="27" y="55" font-size="12" fill="#fbbf24" font-weight="bold">S</text><ellipse cx="25" cy="13" rx="5" ry="2.5" fill="#fff" opacity="0.4"/></g></svg>`, color: '#ef4444' },
      { name: 'Astronaut', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="ast_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="ast_suit" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#f1f5f9"/><stop offset="55%" stop-color="${c||'#e2e8f0'}"/><stop offset="100%" stop-color="#64748b"/></radialGradient><radialGradient id="ast_helm" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="60%" stop-color="${c||'#0ea5e9'}"/><stop offset="100%" stop-color="#0369a1"/></radialGradient></defs><g filter="url(#ast_f1)"><circle cx="32" cy="22" r="16" fill="url(#ast_suit)" stroke="#94a3b8" stroke-width="1.5"/><rect x="18" y="14" width="28" height="16" rx="8" fill="#1e293b"/><rect x="20" y="15" width="24" height="13" rx="7" fill="url(#ast_helm)" opacity="0.85"/><circle cx="27" cy="20" r="3" fill="#fff" opacity="0.35"/><circle cx="31" cy="17" r="2" fill="#fff" opacity="0.25"/><rect x="12" y="36" width="40" height="22" rx="6" fill="url(#ast_suit)" stroke="#94a3b8" stroke-width="1"/><rect x="20" y="40" width="24" height="12" rx="3" fill="#1e293b"/><circle cx="26" cy="46" r="3" fill="#22d3ee"/><circle cx="32" cy="46" r="3" fill="#f0abfc"/><circle cx="38" cy="46" r="3" fill="#4ade80"/><rect x="2" y="36" width="10" height="16" rx="4" fill="url(#ast_suit)" stroke="#94a3b8" stroke-width="1"/><rect x="52" y="36" width="10" height="16" rx="4" fill="url(#ast_suit)" stroke="#94a3b8" stroke-width="1"/><rect x="18" y="58" width="10" height="6" rx="3" fill="url(#ast_suit)"/><rect x="36" y="58" width="10" height="6" rx="3" fill="url(#ast_suit)"/><ellipse cx="22" cy="38" rx="5" ry="2.5" fill="#fff" opacity="0.4"/></g></svg>`, color: '#e2e8f0' },
    ]
  },
  {
    category: 'Animals',
    items: [
      { name: 'Bird', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="36" rx="16" ry="14" fill="${c||'#ef4444'}"/><circle cx="32" cy="26" r="10" fill="${c||'#ef4444'}"/><circle cx="36" cy="24" r="2.5" fill="#fff"/><circle cx="37" cy="24" r="1.2" fill="#222"/><polygon points="42,26 56,22 56,28" fill="#f59e0b"/><path d="M16 36 Q4 28 10 44" fill="${c||'#dc2626'}" stroke="${c||'#dc2626'}" stroke-width="1"/><path d="M48 36 Q60 28 54 44" fill="${c||'#dc2626'}" stroke="${c||'#dc2626'}" stroke-width="1"/><line x1="28" y1="50" x2="28" y2="58" stroke="#f59e0b" stroke-width="2.5"/><line x1="36" y1="50" x2="36" y2="58" stroke="#f59e0b" stroke-width="2.5"/></svg>`, color: '#ef4444' },
      { name: 'Fish', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="32" rx="20" ry="12" fill="${c||'#06b6d4'}"/><polygon points="50,32 62,20 62,44" fill="${c||'#0891b2'}"/><circle cx="20" cy="28" r="3" fill="#fff"/><circle cx="21" cy="28" r="1.5" fill="#222"/><path d="M16 36 Q22 40 28 36" stroke="#fff" fill="none" stroke-width="1.5"/><path d="M30 20 Q36 14 40 20" fill="${c||'#0891b2'}"/></svg>`, color: '#06b6d4' },
      { name: 'Butterfly', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="36" rx="3" ry="12" fill="#422006"/><ellipse cx="20" cy="28" rx="12" ry="14" fill="${c||'#c084fc'}" opacity="0.85" transform="rotate(-15 20 28)"/><ellipse cx="44" cy="28" rx="12" ry="14" fill="${c||'#c084fc'}" opacity="0.85" transform="rotate(15 44 28)"/><ellipse cx="22" cy="42" rx="8" ry="10" fill="${c||'#f0abfc'}" opacity="0.85" transform="rotate(-10 22 42)"/><ellipse cx="42" cy="42" rx="8" ry="10" fill="${c||'#f0abfc'}" opacity="0.85" transform="rotate(10 42 42)"/><circle cx="20" cy="26" r="3" fill="#fff" opacity="0.5"/><circle cx="44" cy="26" r="3" fill="#fff" opacity="0.5"/><line x1="30" y1="24" x2="24" y2="14" stroke="#422006" stroke-width="1.5"/><line x1="34" y1="24" x2="40" y2="14" stroke="#422006" stroke-width="1.5"/></svg>`, color: '#c084fc' },
      { name: 'Frog', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="40" rx="22" ry="16" fill="${c||'#22c55e'}"/><circle cx="20" cy="22" r="8" fill="${c||'#22c55e'}"/><circle cx="44" cy="22" r="8" fill="${c||'#22c55e'}"/><circle cx="20" cy="20" r="4" fill="#fff"/><circle cx="44" cy="20" r="4" fill="#fff"/><circle cx="21" cy="20" r="2" fill="#222"/><circle cx="45" cy="20" r="2" fill="#222"/><path d="M22 44 Q32 52 42 44" stroke="#166534" fill="none" stroke-width="2"/></svg>`, color: '#22c55e' },
      { name: 'Snake', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M8 52 Q16 52 20 44 Q24 36 32 36 Q40 36 44 44 Q48 52 56 52" fill="none" stroke="${c||'#22c55e'}" stroke-width="12" stroke-linecap="round"/><circle cx="8" cy="52" r="7" fill="${c||'#15803d'}"/><circle cx="5" cy="50" r="1.5" fill="#fff"/><circle cx="11" cy="50" r="1.5" fill="#fff"/><circle cx="5.5" cy="50.5" r="0.8" fill="#222"/><circle cx="11.5" cy="50.5" r="0.8" fill="#222"/><path d="M3 55 L1 58 M5 56 L3 59" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round"/></svg>`, color: '#22c55e' },
      { name: 'Spider', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="36" r="12" fill="${c||'#374151'}"/><circle cx="32" cy="22" r="8" fill="${c||'#374151'}"/><circle cx="28" cy="20" r="2" fill="#ef4444"/><circle cx="36" cy="20" r="2" fill="#ef4444"/><line x1="20" y1="34" x2="4" y2="26" stroke="${c||'#374151'}" stroke-width="2.5"/><line x1="20" y1="38" x2="2" y2="36" stroke="${c||'#374151'}" stroke-width="2.5"/><line x1="20" y1="42" x2="4" y2="52" stroke="${c||'#374151'}" stroke-width="2.5"/><line x1="44" y1="34" x2="60" y2="26" stroke="${c||'#374151'}" stroke-width="2.5"/><line x1="44" y1="38" x2="62" y2="36" stroke="${c||'#374151'}" stroke-width="2.5"/><line x1="44" y1="42" x2="60" y2="52" stroke="${c||'#374151'}" stroke-width="2.5"/></svg>`, color: '#374151' },
      { name: 'Shark', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="36" rx="22" ry="10" fill="${c||'#64748b'}"/><polygon points="50,36 62,30 62,42" fill="${c||'#475569'}"/><polygon points="30,26 36,14 42,26" fill="${c||'#64748b'}"/><circle cx="18" cy="32" r="3" fill="#fff"/><circle cx="19" cy="32" r="1.5" fill="#222"/><path d="M12 38 Q18 44 24 40" stroke="#fff" fill="none" stroke-width="1.5"/><polygon points="14,38 18,42 20,38" fill="#fff" opacity="0.7"/></svg>`, color: '#64748b' },
      { name: 'Bear', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="40" rx="20" ry="18" fill="${c||'#92400e'}"/><circle cx="32" cy="24" r="14" fill="${c||'#92400e'}"/><circle cx="20" cy="14" r="8" fill="${c||'#78350f'}"/><circle cx="44" cy="14" r="8" fill="${c||'#78350f'}"/><circle cx="26" cy="22" r="3" fill="#fff"/><circle cx="38" cy="22" r="3" fill="#fff"/><circle cx="27" cy="23" r="1.5" fill="#222"/><circle cx="39" cy="23" r="1.5" fill="#222"/><ellipse cx="32" cy="30" rx="5" ry="3" fill="#fde68a"/></svg>`, color: '#92400e' },
      { name: 'Dog', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="dog_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="dog_head" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fde68a"/><stop offset="55%" stop-color="${c||'#d97706'}"/><stop offset="100%" stop-color="#78350f"/></radialGradient><radialGradient id="dog_body" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fbbf24"/><stop offset="55%" stop-color="${c||'#d97706'}"/><stop offset="100%" stop-color="#92400e"/></radialGradient></defs><g filter="url(#dog_f1)"><ellipse cx="14" cy="30" rx="7" ry="12" fill="${c||'#d97706'}" transform="rotate(-15 14 30)"/><ellipse cx="50" cy="30" rx="7" ry="12" fill="${c||'#d97706'}" transform="rotate(15 50 30)"/><ellipse cx="32" cy="46" rx="17" ry="14" fill="url(#dog_body)"/><circle cx="32" cy="28" r="18" fill="url(#dog_head)"/><ellipse cx="32" cy="34" rx="9" ry="7" fill="#fef9ee"/><circle cx="24" cy="24" r="5" fill="#fff"/><circle cx="40" cy="24" r="5" fill="#fff"/><circle cx="24" cy="25" r="3" fill="#3d1a00"/><circle cx="40" cy="25" r="3" fill="#3d1a00"/><circle cx="23" cy="24" r="1.2" fill="#fff"/><circle cx="39" cy="24" r="1.2" fill="#fff"/><ellipse cx="32" cy="31" rx="4" ry="3" fill="#1a0a00"/><circle cx="31" cy="30" r="1" fill="#4d4d4d"/><path d="M28 35 Q32 39 36 35" stroke="#92400e" stroke-width="1.5" fill="none"/><ellipse cx="32" cy="38" rx="4" ry="3" fill="#f87171"/><path d="M46 54 Q58 46 56 36" stroke="${c||'#d97706'}" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="25" cy="18" rx="5" ry="2.5" fill="#fff" opacity="0.4"/></g></svg>`, color: '#d97706' },
      { name: 'Dragon', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="drg_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="drg_body" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#e9d5ff"/><stop offset="55%" stop-color="${c||'#a855f7'}"/><stop offset="100%" stop-color="#581c87"/></radialGradient><radialGradient id="drg_wing" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#f3e8ff"/><stop offset="100%" stop-color="${c||'#a855f7'}" stop-opacity="0.6"/></radialGradient></defs><g filter="url(#drg_f1)"><path d="M32 26 Q12 10 8 20 Q10 30 22 28 Z" fill="url(#drg_wing)" stroke="#7e22ce" stroke-width="1"/><path d="M32 26 Q52 10 56 20 Q54 30 42 28 Z" fill="url(#drg_wing)" stroke="#7e22ce" stroke-width="1"/><ellipse cx="32" cy="44" rx="14" ry="12" fill="url(#drg_body)"/><ellipse cx="32" cy="28" rx="13" ry="15" fill="url(#drg_body)"/><ellipse cx="32" cy="36" rx="8" ry="10" fill="#f3e8ff" opacity="0.6"/><polygon points="28,14 30,6 32,14" fill="#7e22ce"/><polygon points="31,13 33,5 35,13" fill="#7e22ce"/><polygon points="34,14 36,7 38,15" fill="#7e22ce"/><ellipse cx="25" cy="24" rx="5" ry="5.5" fill="#fef08a"/><ellipse cx="39" cy="24" rx="5" ry="5.5" fill="#fef08a"/><ellipse cx="25" cy="25" rx="2" ry="3.5" fill="#422006"/><ellipse cx="39" cy="25" rx="2" ry="3.5" fill="#422006"/><circle cx="24" cy="23" r="1.2" fill="#fff" opacity="0.8"/><circle cx="38" cy="23" r="1.2" fill="#fff" opacity="0.8"/><path d="M32 34 Q28 40 24 42 Q30 40 32 44 Q34 40 40 42 Q36 40 32 34Z" fill="#f97316" opacity="0.9"/><path d="M32 36 Q30 41 28 43 Q31 41 32 44 Q33 41 36 43 Q34 41 32 36Z" fill="#fbbf24"/><path d="M42 52 Q58 56 60 48 Q58 40 52 44" stroke="${c||'#a855f7'}" stroke-width="5" fill="none" stroke-linecap="round"/><polygon points="58,47 62,43 60,50" fill="${c||'#a855f7'}"/><ellipse cx="26" cy="18" rx="5" ry="2.5" fill="#fff" opacity="0.4"/></g></svg>`, color: '#a855f7' },
      { name: 'Unicorn', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="uni_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="uni_body" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fdf2f8"/><stop offset="55%" stop-color="${c||'#f0abfc'}"/><stop offset="100%" stop-color="#a21caf"/></radialGradient><radialGradient id="uni_mane" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fbbf24"/><stop offset="50%" stop-color="#f0abfc"/><stop offset="100%" stop-color="#67e8f9"/></radialGradient></defs><g filter="url(#uni_f1)"><polygon points="32,2 28,18 36,18" fill="#fbbf24"/><line x1="29" y1="14" x2="33" y2="6" stroke="#d97706" stroke-width="0.8" opacity="0.6"/><line x1="31" y1="17" x2="35" y2="9" stroke="#d97706" stroke-width="0.8" opacity="0.6"/><path d="M18 14 Q14 24 16 34 Q20 28 22 22 Q24 28 26 22 Q28 28 30 24" fill="url(#uni_mane)" opacity="0.9"/><ellipse cx="32" cy="46" rx="16" ry="13" fill="url(#uni_body)"/><circle cx="32" cy="26" r="17" fill="url(#uni_body)"/><ellipse cx="25" cy="24" rx="5" ry="5.5" fill="#fff"/><ellipse cx="39" cy="24" rx="5" ry="5.5" fill="#fff"/><circle cx="25" cy="25" r="3" fill="#3d1a5c"/><circle cx="39" cy="25" r="3" fill="#3d1a5c"/><circle cx="24" cy="24" r="1.2" fill="#fff"/><circle cx="38" cy="24" r="1.2" fill="#fff"/><circle cx="20" cy="30" r="4" fill="#f9a8d4" opacity="0.4"/><circle cx="44" cy="30" r="4" fill="#f9a8d4" opacity="0.4"/><ellipse cx="32" cy="34" rx="3" ry="2" fill="#fca5a5"/><path d="M29 36 Q32 38 35 36" stroke="#be185d" stroke-width="1.2" fill="none"/><path d="M44 55 Q58 52 56 40" stroke="url(#uni_mane)" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="25" cy="17" rx="5" ry="2.5" fill="#fff" opacity="0.4"/></g></svg>`, color: '#f0abfc' },
      { name: 'Penguin', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="pen_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="pen_body" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#475569"/><stop offset="55%" stop-color="#1e293b"/><stop offset="100%" stop-color="#020617"/></radialGradient><radialGradient id="pen_belly" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fff"/><stop offset="70%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#cbd5e1"/></radialGradient></defs><g filter="url(#pen_f1)"><ellipse cx="32" cy="44" rx="16" ry="16" fill="url(#pen_body)"/><circle cx="32" cy="26" r="14" fill="url(#pen_body)"/><ellipse cx="32" cy="38" rx="10" ry="14" fill="url(#pen_belly)"/><ellipse cx="24" cy="24" rx="5" ry="6" fill="#fff"/><ellipse cx="40" cy="24" rx="5" ry="6" fill="#fff"/><circle cx="24" cy="25" r="3.5" fill="#1a0a00"/><circle cx="40" cy="25" r="3.5" fill="#1a0a00"/><circle cx="23" cy="24" r="1.2" fill="#fff"/><circle cx="39" cy="24" r="1.2" fill="#fff"/><ellipse cx="32" cy="33" rx="5" ry="3" fill="${c||'#f59e0b'}"/><path d="M28 35 Q32 38 36 35" stroke="#d97706" stroke-width="1.5" fill="none"/><ellipse cx="17" cy="42" rx="8" ry="5" fill="url(#pen_body)" transform="rotate(-30 17 42)"/><ellipse cx="47" cy="42" rx="8" ry="5" fill="url(#pen_body)" transform="rotate(30 47 42)"/><ellipse cx="24" cy="58" rx="7" ry="4" fill="${c||'#f59e0b'}"/><ellipse cx="40" cy="58" rx="7" ry="4" fill="${c||'#f59e0b'}"/><ellipse cx="26" cy="17" rx="5" ry="2.5" fill="#fff" opacity="0.4"/></g></svg>`, color: '#1e293b' },
      { name: 'Fox', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="fox_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="fox_body" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fed7aa"/><stop offset="55%" stop-color="${c||'#ea580c'}"/><stop offset="100%" stop-color="#7c2d12"/></radialGradient><radialGradient id="fox_face" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="70%" stop-color="#fef3c7"/><stop offset="100%" stop-color="#fde68a"/></radialGradient></defs><g filter="url(#fox_f1)"><polygon points="16,24 10,4 28,20" fill="${c||'#ea580c'}"/><polygon points="48,24 54,4 36,20" fill="${c||'#ea580c'}"/><polygon points="17,22 13,8 26,20" fill="#fef9c3" opacity="0.85"/><polygon points="47,22 51,8 38,20" fill="#fef9c3" opacity="0.85"/><ellipse cx="32" cy="40" rx="18" ry="16" fill="url(#fox_body)"/><circle cx="32" cy="26" r="18" fill="url(#fox_body)"/><ellipse cx="32" cy="32" rx="10" ry="8" fill="url(#fox_face)"/><ellipse cx="24" cy="24" rx="5" ry="5.5" fill="#fff"/><ellipse cx="40" cy="24" rx="5" ry="5.5" fill="#fff"/><ellipse cx="24" cy="25" rx="2.8" ry="3.5" fill="#1a0a00"/><ellipse cx="40" cy="25" rx="2.8" ry="3.5" fill="#1a0a00"/><circle cx="23" cy="24" r="1.2" fill="#fff"/><circle cx="39" cy="24" r="1.2" fill="#fff"/><ellipse cx="32" cy="32" rx="3" ry="2" fill="#1a0a00"/><path d="M28 34 Q32 37 36 34" stroke="#92400e" stroke-width="1.5" fill="none"/><path d="M46 52 Q60 46 58 34" stroke="${c||'#ea580c'}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="57" cy="33" r="4" fill="#fff"/><ellipse cx="25" cy="17" rx="5" ry="2.5" fill="#fff" opacity="0.4"/></g></svg>`, color: '#ea580c' },
      { name: 'Panda', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="pan_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="pan_white" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fff"/><stop offset="60%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#cbd5e1"/></radialGradient><radialGradient id="pan_black" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#475569"/><stop offset="55%" stop-color="#1e293b"/><stop offset="100%" stop-color="#020617"/></radialGradient></defs><g filter="url(#pan_f1)"><ellipse cx="32" cy="42" rx="18" ry="16" fill="url(#pan_white)"/><circle cx="32" cy="26" r="18" fill="url(#pan_white)"/><ellipse cx="20" cy="20" rx="8" ry="8" fill="url(#pan_black)"/><ellipse cx="44" cy="20" rx="8" ry="8" fill="url(#pan_black)"/><ellipse cx="22" cy="22" rx="5" ry="5" fill="#fff"/><ellipse cx="42" cy="22" rx="5" ry="5" fill="#fff"/><circle cx="22" cy="23" r="3" fill="#0f172a"/><circle cx="42" cy="23" r="3" fill="#0f172a"/><circle cx="21" cy="22" r="1.2" fill="#fff"/><circle cx="41" cy="22" r="1.2" fill="#fff"/><ellipse cx="32" cy="32" rx="5" ry="4" fill="#cbd5e1"/><ellipse cx="32" cy="31" rx="3.5" ry="2.5" fill="#0f172a"/><path d="M28 36 Q32 40 36 36" stroke="#475569" stroke-width="1.5" fill="none"/><ellipse cx="14" cy="46" rx="6" ry="4" fill="url(#pan_black)"/><ellipse cx="50" cy="46" rx="6" ry="4" fill="url(#pan_black)"/><ellipse cx="26" cy="16" rx="5" ry="2.5" fill="#fff" opacity="0.45"/></g></svg>`, color: '#f8fafc' },
    ]
  },
  {
    category: 'Objects',
    items: [
      { name: 'Star', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="str_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="str_fill" cx="35%" cy="28%" r="70%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="55%" stop-color="${c||'#f59e0b'}"/><stop offset="100%" stop-color="#92400e"/></radialGradient></defs><g filter="url(#str_f1)"><polygon points="32,4 40,24 60,24 44,38 50,58 32,46 14,58 20,38 4,24 24,24" fill="url(#str_fill)"/><ellipse cx="26" cy="18" rx="6" ry="3" fill="#fff" opacity="0.4"/></g></svg>`, color: '#f59e0b' },
      { name: 'Heart', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 56 Q8 36 8 20 Q8 8 20 8 Q28 8 32 16 Q36 8 44 8 Q56 8 56 20 Q56 36 32 56Z" fill="${c||'#ef4444'}"/></svg>`, color: '#ef4444' },
      { name: 'Gem', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,4 52,20 44,58 20,58 12,20" fill="${c||'#8b5cf6'}"/><polygon points="32,4 24,20 40,20" fill="${c||'#a78bfa'}" opacity="0.6"/><polygon points="24,20 20,58 32,58 32,20" fill="${c||'#7c3aed'}" opacity="0.3"/></svg>`, color: '#8b5cf6' },
      { name: 'Key', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="22" r="12" fill="none" stroke="${c||'#f59e0b'}" stroke-width="5"/><rect x="30" y="19" width="28" height="6" rx="2" fill="${c||'#f59e0b'}"/><rect x="50" y="25" width="6" height="10" rx="1" fill="${c||'#f59e0b'}"/><rect x="42" y="25" width="6" height="8" rx="1" fill="${c||'#f59e0b'}"/></svg>`, color: '#f59e0b' },
      { name: 'Coin', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="24" fill="${c||'#fbbf24'}"/><circle cx="32" cy="32" r="20" fill="none" stroke="${c||'#f59e0b'}" stroke-width="2"/><text x="32" y="40" text-anchor="middle" font-size="24" font-weight="bold" fill="${c||'#92400e'}">$</text></svg>`, color: '#fbbf24' },
      { name: 'Bomb', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="38" r="20" fill="${c||'#374151'}"/><rect x="28" y="10" width="8" height="14" rx="2" fill="#78716c"/><path d="M36 10 Q44 4 46 8" stroke="#f59e0b" fill="none" stroke-width="2"/><circle cx="46" cy="6" r="4" fill="#ef4444" opacity="0.8"/><circle cx="22" cy="32" r="4" fill="#fff" opacity="0.15"/></svg>`, color: '#374151' },
      { name: 'Trophy', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M18 12 h28 v4 Q46 36 38 36 h-12 Q18 36 18 16Z" fill="${c||'#f59e0b'}"/><rect x="28" y="36" width="8" height="10" fill="${c||'#d97706'}"/><rect x="22" y="46" width="20" height="6" rx="2" fill="${c||'#d97706'}"/><path d="M18 16 Q8 16 10 26 Q12 32 18 30" fill="${c||'#fbbf24'}"/><path d="M46 16 Q56 16 54 26 Q52 32 46 30" fill="${c||'#fbbf24'}"/></svg>`, color: '#f59e0b' },
      { name: 'Platform', svg: (c) => `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg"><defs><filter id="plat_f1" x="-5%" y="-20%" width="115%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="plat_top" cx="35%" cy="28%" r="70%"><stop offset="0%" stop-color="#e7e5e4"/><stop offset="55%" stop-color="${c||'#78716c'}"/><stop offset="100%" stop-color="#44403c"/></radialGradient></defs><g filter="url(#plat_f1)"><rect x="0" y="0" width="128" height="32" rx="4" fill="url(#plat_top)"/><rect x="0" y="0" width="128" height="8" rx="4" fill="#a8a29e" opacity="0.35"/><rect x="0" y="24" width="128" height="8" rx="4" fill="#292524" opacity="0.3"/><rect x="2" y="2" width="30" height="14" rx="2" fill="#a8a29e" opacity="0.3"/><rect x="64" y="2" width="30" height="14" rx="2" fill="#a8a29e" opacity="0.3"/><rect x="12" y="4" width="28" height="4" rx="1" fill="#fff" opacity="0.18"/></g></svg>`, color: '#78716c', defaultW: 128, defaultH: 24 },
      { name: 'Spike', svg: (c) => `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><polygon points="0,32 8,4 16,32 24,4 32,32 40,4 48,32 56,4 64,32" fill="${c||'#dc2626'}"/></svg>`, color: '#dc2626', defaultW: 64, defaultH: 24 },
      { name: 'Sword', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="6" width="4" height="38" rx="1" fill="${c||'#cbd5e1'}"/><polygon points="30,6 34,6 32,2" fill="#e2e8f0"/><rect x="20" y="40" width="24" height="5" rx="2" fill="#f59e0b"/><rect x="29" y="45" width="6" height="14" rx="3" fill="#92400e"/></svg>`, color: '#cbd5e1' },
      { name: 'Diamond', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,6 56,26 32,60 8,26" fill="${c||'#38bdf8'}"/><polygon points="32,6 56,26 44,26 32,12" fill="#7dd3fc" opacity="0.7"/><polygon points="8,26 32,60 20,26" fill="#0284c7" opacity="0.3"/><polygon points="20,26 32,18 44,26" fill="#e0f2fe" opacity="0.5"/></svg>`, color: '#38bdf8' },
      { name: 'Potion', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="28" y="4" width="8" height="12" rx="3" fill="#78716c"/><rect x="26" y="12" width="12" height="4" rx="1" fill="#a8a29e"/><ellipse cx="32" cy="40" rx="16" ry="20" fill="${c||'#a855f7'}"/><ellipse cx="32" cy="40" rx="13" ry="17" fill="${c||'#d946ef'}" opacity="0.4"/><circle cx="24" cy="34" r="5" fill="#fff" opacity="0.15"/><circle cx="38" cy="28" r="4" fill="#fff" opacity="0.12"/></svg>`, color: '#a855f7' },
      { name: 'Chest', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="30" width="48" height="28" rx="3" fill="${c||'#92400e'}"/><path d="M8 30 Q8 18 32 18 Q56 18 56 30Z" fill="${c||'#78350f'}"/><rect x="8" y="28" width="48" height="4" fill="#f59e0b"/><rect x="26" y="34" width="12" height="10" rx="2" fill="#f59e0b"/></svg>`, color: '#92400e' },
      { name: 'Rocket', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="rkt_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="rkt_body" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fef2f2"/><stop offset="55%" stop-color="${c||'#ef4444'}"/><stop offset="100%" stop-color="#7f1d1d"/></radialGradient><radialGradient id="rkt_window" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="60%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0369a1"/></radialGradient></defs><g filter="url(#rkt_f1)"><path d="M32 2 Q40 14 40 34 L24 34 Q24 14 32 2 Z" fill="url(#rkt_body)"/><circle cx="32" cy="22" r="6" fill="url(#rkt_window)" stroke="#bae6fd" stroke-width="1"/><circle cx="30" cy="20" r="2" fill="#fff" opacity="0.45"/><path d="M24 34 L14 44 L24 42 Z" fill="${c||'#ef4444'}"/><path d="M40 34 L50 44 L40 42 Z" fill="${c||'#ef4444'}"/><rect x="26" y="34" width="12" height="12" rx="2" fill="#b91c1c"/><path d="M26 46 Q28 56 32 58 Q36 56 38 46" fill="#f97316" opacity="0.9"/><path d="M28 50 Q30 60 32 62 Q34 60 36 50" fill="#fbbf24"/><ellipse cx="28" cy="12" rx="4" ry="2" fill="#fff" opacity="0.4"/></g></svg>`, color: '#ef4444' },
      { name: 'Ghost', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="gst_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="gst_body" cx="35%" cy="28%" r="70%"><stop offset="0%" stop-color="#fff"/><stop offset="60%" stop-color="${c||'#e2e8f0'}"/><stop offset="100%" stop-color="#94a3b8"/></radialGradient><radialGradient id="gst_eye" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#818cf8"/><stop offset="100%" stop-color="#3730a3"/></radialGradient></defs><g filter="url(#gst_f1)"><path d="M12 30 Q12 12 32 10 Q52 12 52 30 L52 54 Q46 48 40 54 Q36 48 32 54 Q28 48 24 54 Q18 48 12 54 Z" fill="url(#gst_body)" stroke="#c7d2fe" stroke-width="1"/><ellipse cx="24" cy="28" rx="6" ry="7" fill="#1e1b4b"/><ellipse cx="40" cy="28" rx="6" ry="7" fill="#1e1b4b"/><ellipse cx="24" cy="27" rx="3" ry="4" fill="url(#gst_eye)"/><ellipse cx="40" cy="27" rx="3" ry="4" fill="url(#gst_eye)"/><circle cx="23" cy="26" r="1.5" fill="#c7d2fe"/><circle cx="39" cy="26" r="1.5" fill="#c7d2fe"/><ellipse cx="32" cy="38" rx="6" ry="5" fill="#1e1b4b"/><ellipse cx="32" cy="38" rx="4" ry="3.5" fill="#312e81"/><path d="M16 30 Q14 22 20 18" stroke="#e0e7ff" stroke-width="1.5" fill="none" opacity="0.4"/><ellipse cx="24" cy="15" rx="6" ry="3" fill="#fff" opacity="0.4"/></g></svg>`, color: '#e2e8f0' },
      { name: 'Mushroom', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="msh_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="msh_cap" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="55%" stop-color="${c||'#ef4444'}"/><stop offset="100%" stop-color="#7f1d1d"/></radialGradient><radialGradient id="msh_stem" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fff"/><stop offset="70%" stop-color="#fef9c3"/><stop offset="100%" stop-color="#fbbf24"/></radialGradient></defs><g filter="url(#msh_f1)"><rect x="24" y="42" width="16" height="18" rx="3" fill="url(#msh_stem)" stroke="#fbbf24" stroke-width="1"/><path d="M8 44 Q8 18 32 14 Q56 18 56 44 Z" fill="url(#msh_cap)"/><ellipse cx="32" cy="44" rx="24" ry="6" fill="url(#msh_stem)"/><circle cx="22" cy="28" r="5" fill="#fff" opacity="0.9"/><circle cx="36" cy="22" r="4" fill="#fff" opacity="0.9"/><circle cx="48" cy="30" r="6" fill="#fff" opacity="0.9"/><circle cx="16" cy="36" r="3" fill="#fff" opacity="0.7"/><circle cx="42" cy="36" r="3" fill="#fff" opacity="0.7"/><ellipse cx="22" cy="20" rx="5" ry="2.5" fill="#fff" opacity="0.4"/></g></svg>`, color: '#ef4444' },
      { name: 'Ice Cream', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><filter id="ic_f1" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/></filter><radialGradient id="ic_cone" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fef3c7"/><stop offset="60%" stop-color="#d97706"/><stop offset="100%" stop-color="#92400e"/></radialGradient><radialGradient id="ic_scoop1" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#fdf2f8"/><stop offset="55%" stop-color="${c||'#f0abfc'}"/><stop offset="100%" stop-color="#a21caf"/></radialGradient><radialGradient id="ic_scoop2" cx="35%" cy="28%" r="65%"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="55%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0369a1"/></radialGradient></defs><g filter="url(#ic_f1)"><polygon points="32,62 16,36 48,36" fill="url(#ic_cone)"/><line x1="24" y1="58" x2="32" y2="36" stroke="#92400e" stroke-width="1" opacity="0.4"/><line x1="32" y1="58" x2="32" y2="36" stroke="#92400e" stroke-width="1" opacity="0.4"/><line x1="40" y1="58" x2="32" y2="36" stroke="#92400e" stroke-width="1" opacity="0.4"/><circle cx="32" cy="28" r="14" fill="url(#ic_scoop1)"/><circle cx="20" cy="24" r="11" fill="url(#ic_scoop2)"/><circle cx="44" cy="24" r="11" fill="url(#ic_scoop1)"/><circle cx="32" cy="14" r="10" fill="url(#ic_scoop2)"/><ellipse cx="26" cy="20" rx="5" ry="2.5" fill="#fff" opacity="0.4"/><ellipse cx="19" cy="17" rx="4" ry="2" fill="#fff" opacity="0.35"/><path d="M26 10 Q32 6 38 10" stroke="${c||'#f0abfc'}" stroke-width="2" fill="none"/><circle cx="32" cy="6" r="3" fill="${c||'#f0abfc'}"/></g></svg>`, color: '#f0abfc' },
    ]
  },
  {
    category: 'Effects',
    items: [
      { name: 'Explosion', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,2 38,22 58,16 42,30 60,42 40,38 38,60 32,42 26,60 24,38 4,42 22,30 6,16 26,22" fill="${c||'#f97316'}"/><circle cx="32" cy="32" r="10" fill="${c||'#fbbf24'}"/></svg>`, color: '#f97316' },
      { name: 'Lightning', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="36,2 20,30 30,30 24,62 48,26 36,26" fill="${c||'#facc15'}"/></svg>`, color: '#facc15' },
      { name: 'Shield', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 6 L54 16 L54 34 Q54 52 32 60 Q10 52 10 34 L10 16Z" fill="${c||'#3b82f6'}" opacity="0.85"/><path d="M32 14 L46 22 L46 34 Q46 46 32 52 Q18 46 18 34 L18 22Z" fill="none" stroke="#fff" stroke-width="2" opacity="0.4"/></svg>`, color: '#3b82f6' },
      { name: 'Sparkle', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,4 36,24 56,20 40,32 52,52 32,40 12,52 24,32 8,20 28,24" fill="${c||'#fde68a'}"/><circle cx="32" cy="32" r="5" fill="#fff" opacity="0.8"/></svg>`, color: '#fde68a' },
      { name: 'Fire', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 4 Q44 20 44 36 Q44 52 32 58 Q20 52 20 36 Q20 20 32 4Z" fill="${c||'#ef4444'}"/><path d="M32 20 Q38 28 38 38 Q38 48 32 52 Q26 48 26 38 Q26 28 32 20Z" fill="#f59e0b"/><ellipse cx="32" cy="42" rx="4" ry="6" fill="#fde68a"/></svg>`, color: '#ef4444' },
      { name: 'Rain', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="20" rx="20" ry="12" fill="${c||'#94a3b8'}"/><line x1="20" y1="36" x2="16" y2="50" stroke="#60a5fa" stroke-width="2"/><line x1="32" y1="38" x2="28" y2="52" stroke="#60a5fa" stroke-width="2"/><line x1="44" y1="36" x2="40" y2="50" stroke="#60a5fa" stroke-width="2"/><line x1="26" y1="40" x2="22" y2="54" stroke="#60a5fa" stroke-width="2"/><line x1="38" y1="40" x2="34" y2="54" stroke="#60a5fa" stroke-width="2"/></svg>`, color: '#94a3b8' },
    ]
  },
  {
    category: 'Fantasy',
    items: [
      { name: 'Dragon', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="drag1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c||'#4ade80'}"/><stop offset="100%" stop-color="#15803d"/></linearGradient><linearGradient id="dwin1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#86efac" stop-opacity="0.8"/><stop offset="100%" stop-color="#15803d" stop-opacity="0.4"/></linearGradient></defs><path d="M32 26 Q12 10 8 20 Q10 30 22 28 Z" fill="url(#dwin1)" stroke="#166534" stroke-width="1"/><path d="M32 26 Q52 10 56 20 Q54 30 42 28 Z" fill="url(#dwin1)" stroke="#166534" stroke-width="1"/><ellipse cx="32" cy="44" rx="14" ry="12" fill="url(#drag1)"/><ellipse cx="32" cy="28" rx="13" ry="15" fill="url(#drag1)"/><ellipse cx="32" cy="36" rx="8" ry="10" fill="#bbf7d0" opacity="0.7"/><polygon points="28,14 30,6 32,14" fill="#15803d"/><polygon points="31,13 33,5 35,13" fill="#15803d"/><polygon points="34,14 36,7 38,15" fill="#15803d"/><ellipse cx="25" cy="24" rx="5" ry="5.5" fill="#fef08a"/><ellipse cx="39" cy="24" rx="5" ry="5.5" fill="#fef08a"/><ellipse cx="25" cy="25" rx="2" ry="3.5" fill="#422006"/><ellipse cx="39" cy="25" rx="2" ry="3.5" fill="#422006"/><circle cx="24" cy="23" r="1.2" fill="#fff" opacity="0.8"/><circle cx="38" cy="23" r="1.2" fill="#fff" opacity="0.8"/><circle cx="29" cy="32" r="1.5" fill="#166534"/><circle cx="35" cy="32" r="1.5" fill="#166534"/><path d="M32 34 Q28 40 24 42 Q30 40 32 44 Q34 40 40 42 Q36 40 32 34Z" fill="#f97316" opacity="0.9"/><path d="M32 36 Q30 41 28 43 Q31 41 32 44 Q33 41 36 43 Q34 41 32 36Z" fill="#fbbf24"/><path d="M42 52 Q58 56 60 48 Q58 40 52 44" stroke="#15803d" stroke-width="5" fill="none" stroke-linecap="round"/><polygon points="58,47 62,43 60,50" fill="#15803d"/></svg>`, color: '#16a34a' },
      { name: 'Unicorn', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="ub1" cx="40%" cy="35%" r="60%"><stop offset="0%" stop-color="#fce7f3"/><stop offset="100%" stop-color="#fbcfe8"/></radialGradient><linearGradient id="uh1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient><linearGradient id="um1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c||'#a78bfa'}"/><stop offset="50%" stop-color="#f0abfc"/><stop offset="100%" stop-color="#67e8f9"/></linearGradient></defs><polygon points="32,2 28,18 36,18" fill="url(#uh1)"/><line x1="29" y1="14" x2="33" y2="6" stroke="#d97706" stroke-width="0.8" opacity="0.5"/><line x1="31" y1="17" x2="35" y2="9" stroke="#d97706" stroke-width="0.8" opacity="0.5"/><path d="M18 14 Q14 24 16 34 Q20 28 22 22 Q24 28 26 22 Q28 28 30 24" fill="url(#um1)" opacity="0.9"/><ellipse cx="32" cy="46" rx="16" ry="13" fill="url(#ub1)"/><circle cx="32" cy="26" r="17" fill="url(#ub1)"/><ellipse cx="25" cy="24" rx="5" ry="5.5" fill="#fff"/><ellipse cx="39" cy="24" rx="5" ry="5.5" fill="#fff"/><circle cx="25" cy="25" r="3" fill="#3d1a5c"/><circle cx="39" cy="25" r="3" fill="#3d1a5c"/><circle cx="24" cy="24" r="1.2" fill="#fff"/><circle cx="38" cy="24" r="1.2" fill="#fff"/><circle cx="20" cy="30" r="4" fill="#f9a8d4" opacity="0.4"/><circle cx="44" cy="30" r="4" fill="#f9a8d4" opacity="0.4"/><ellipse cx="32" cy="34" rx="3" ry="2" fill="#fca5a5"/><path d="M29 36 Q32 38 35 36" stroke="#be185d" stroke-width="1.2" fill="none"/><path d="M44 55 Q58 52 56 40" stroke="url(#um1)" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`, color: '#f0abfc' },
      { name: 'Ghost', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="gb1" cx="40%" cy="30%" r="70%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#c7d2fe" stop-opacity="0.9"/></radialGradient></defs><path d="M12 30 Q12 12 32 10 Q52 12 52 30 L52 54 Q46 48 40 54 Q36 48 32 54 Q28 48 24 54 Q18 48 12 54 Z" fill="url(#gb1)" stroke="#c7d2fe" stroke-width="1"/><ellipse cx="24" cy="28" rx="6" ry="7" fill="#1e1b4b"/><ellipse cx="40" cy="28" rx="6" ry="7" fill="#1e1b4b"/><ellipse cx="24" cy="27" rx="3" ry="4" fill="${c||'#818cf8'}"/><ellipse cx="40" cy="27" rx="3" ry="4" fill="${c||'#818cf8'}"/><circle cx="23" cy="26" r="1.5" fill="#c7d2fe"/><circle cx="39" cy="26" r="1.5" fill="#c7d2fe"/><ellipse cx="32" cy="38" rx="6" ry="5" fill="#1e1b4b"/><ellipse cx="32" cy="38" rx="4" ry="3.5" fill="#312e81"/><path d="M16 30 Q14 22 20 18" stroke="#e0e7ff" stroke-width="1.5" fill="none" opacity="0.4"/><path d="M48 30 Q50 22 44 18" stroke="#e0e7ff" stroke-width="1.5" fill="none" opacity="0.4"/></svg>`, color: '#e2e8f0' },
      { name: 'Fairy', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="24" r="10" fill="#fde68a"/><rect x="26" y="34" width="12" height="16" rx="3" fill="${c||'#a78bfa'}"/><circle cx="28" cy="22" r="1.5" fill="#222"/><circle cx="36" cy="22" r="1.5" fill="#222"/><ellipse cx="18" cy="30" rx="10" ry="14" fill="${c||'#c4b5fd'}" opacity="0.5" transform="rotate(-20 18 30)"/><ellipse cx="46" cy="30" rx="10" ry="14" fill="${c||'#c4b5fd'}" opacity="0.5" transform="rotate(20 46 30)"/><circle cx="32" cy="14" r="3" fill="#fde68a" opacity="0.8"/></svg>`, color: '#a78bfa' },
      { name: 'Slime', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="44" rx="24" ry="14" fill="${c||'#4ade80'}" opacity="0.7"/><ellipse cx="32" cy="36" rx="20" ry="18" fill="${c||'#4ade80'}"/><circle cx="24" cy="32" r="4" fill="#fff"/><circle cx="40" cy="32" r="4" fill="#fff"/><circle cx="25" cy="33" r="2" fill="#222"/><circle cx="41" cy="33" r="2" fill="#222"/><path d="M28 40 Q32 44 36 40" stroke="#166534" fill="none" stroke-width="2"/></svg>`, color: '#4ade80' },
      { name: 'Knight', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="22" y="4" width="20" height="22" rx="4" fill="${c||'#94a3b8'}"/><rect x="28" y="12" width="8" height="10" rx="1" fill="#1e293b" opacity="0.5"/><rect x="20" y="26" width="24" height="22" rx="3" fill="${c||'#64748b'}"/><rect x="10" y="28" width="10" height="4" rx="2" fill="${c||'#94a3b8'}"/><rect x="44" y="28" width="10" height="4" rx="2" fill="${c||'#94a3b8'}"/><rect x="24" y="48" width="6" height="12" rx="2" fill="${c||'#64748b'}"/><rect x="34" y="48" width="6" height="12" rx="2" fill="${c||'#64748b'}"/><line x1="8" y1="30" x2="4" y2="20" stroke="${c||'#94a3b8'}" stroke-width="3"/></svg>`, color: '#94a3b8' },
    ]
  },
  {
    category: 'Vehicles',
    items: [
      { name: 'Car', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="28" width="52" height="16" rx="4" fill="${c||'#ef4444'}"/><path d="M16 28 L22 14 L42 14 L48 28" fill="${c||'#dc2626'}"/><rect x="24" y="16" width="8" height="10" rx="1" fill="#bfdbfe" opacity="0.7"/><rect x="34" y="16" width="8" height="10" rx="1" fill="#bfdbfe" opacity="0.7"/><circle cx="16" cy="46" r="6" fill="#374151"/><circle cx="48" cy="46" r="6" fill="#374151"/><circle cx="16" cy="46" r="3" fill="#9ca3af"/><circle cx="48" cy="46" r="3" fill="#9ca3af"/></svg>`, color: '#ef4444', defaultW: 64, defaultH: 48 },
      { name: 'Rocket', svg: (c) => '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="rk1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e0e7ff"/><stop offset="100%" stop-color="' + (c||'#6366f1') + '"/></linearGradient><radialGradient id="rw1" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#67e8f9"/><stop offset="100%" stop-color="#0891b2"/></radialGradient></defs><path d="M32 2 Q40 14 40 34 L24 34 Q24 14 32 2 Z" fill="url(#rk1)"/><circle cx="32" cy="22" r="6" fill="url(#rw1)" stroke="#c7d2fe" stroke-width="1.5"/><circle cx="30" cy="20" r="2" fill="#fff" opacity="0.5"/><path d="M24 34 L14 44 L24 42 Z" fill="' + (c||'#6366f1') + '"/><path d="M40 34 L50 44 L40 42 Z" fill="' + (c||'#6366f1') + '"/><rect x="26" y="34" width="12" height="12" rx="2" fill="#4f46e5"/><path d="M26 46 Q28 56 32 58 Q36 56 38 46" fill="#f97316" opacity="0.9"/><path d="M28 50 Q30 60 32 62 Q34 60 36 50" fill="#fbbf24"/></svg>', color: '#6366f1' },
      { name: 'Boat', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="8,40 16,56 48,56 56,40" fill="${c||'#92400e'}"/><rect x="28" y="12" width="4" height="28" fill="#78716c"/><polygon points="32,14 54,34 32,38" fill="#fff"/><line x1="8" y1="58" x2="56" y2="58" stroke="#38bdf8" stroke-width="3"/></svg>`, color: '#92400e' },
      { name: 'Plane', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="32" rx="24" ry="6" fill="${c||'#e2e8f0'}"/><polygon points="56,32 62,28 62,36" fill="${c||'#94a3b8'}"/><polygon points="8,32 4,24 4,40" fill="${c||'#ef4444'}"/><polygon points="26,26 18,10 38,26" fill="${c||'#94a3b8'}"/><polygon points="26,38 18,54 38,38" fill="${c||'#94a3b8'}"/><circle cx="44" cy="30" r="3" fill="#bfdbfe" opacity="0.7"/><circle cx="36" cy="30" r="3" fill="#bfdbfe" opacity="0.7"/></svg>`, color: '#e2e8f0', defaultW: 64, defaultH: 40 },
      { name: 'UFO', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="36" rx="28" ry="8" fill="${c||'#94a3b8'}"/><ellipse cx="32" cy="28" rx="16" ry="14" fill="${c||'#6366f1'}"/><ellipse cx="32" cy="24" rx="10" ry="8" fill="#bfdbfe" opacity="0.5"/><circle cx="14" cy="38" r="3" fill="#22d3ee"/><circle cx="32" cy="40" r="3" fill="#22d3ee"/><circle cx="50" cy="38" r="3" fill="#22d3ee"/></svg>`, color: '#6366f1' },
    ]
  },
  {
    category: 'Food',
    items: [
      { name: 'Apple', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="36" r="20" fill="${c||'#ef4444'}"/><rect x="30" y="8" width="4" height="12" rx="2" fill="#92400e"/><ellipse cx="38" cy="14" rx="6" ry="4" fill="#22c55e" transform="rotate(30 38 14)"/><circle cx="24" cy="30" r="4" fill="#fff" opacity="0.2"/></svg>`, color: '#ef4444' },
      { name: 'Pizza', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 6 L8 56 L56 56 Z" fill="${c||'#f59e0b'}"/><path d="M32 12 L12 52 L52 52 Z" fill="#fde68a"/><circle cx="28" cy="34" r="4" fill="#ef4444"/><circle cx="38" cy="40" r="4" fill="#ef4444"/><circle cx="30" cy="46" r="3" fill="#22c55e"/></svg>`, color: '#f59e0b' },
      { name: 'Cupcake', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M16 36 Q16 24 32 20 Q48 24 48 36Z" fill="${c||'#ec4899'}"/><path d="M14 36 L18 58 L46 58 L50 36Z" fill="#f59e0b"/><circle cx="32" cy="16" r="4" fill="#ef4444"/><rect x="14" y="36" width="36" height="4" rx="2" fill="#fde68a"/></svg>`, color: '#ec4899' },
      { name: 'Banana', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M20 8 Q8 32 24 56 Q32 56 28 48 Q16 28 28 8Z" fill="${c||'#fde68a'}"/><path d="M26 10 Q30 8 28 8" fill="#92400e"/></svg>`, color: '#fde68a' },
      { name: 'Cherry', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="44" r="12" fill="${c||'#ef4444'}"/><circle cx="42" cy="44" r="12" fill="${c||'#dc2626'}"/><path d="M22 32 Q26 10 34 8 Q38 10 42 32" fill="none" stroke="#16a34a" stroke-width="2.5"/><ellipse cx="34" cy="10" rx="6" ry="4" fill="#22c55e"/><circle cx="18" cy="38" r="3" fill="#fff" opacity="0.3"/><circle cx="38" cy="38" r="3" fill="#fff" opacity="0.3"/></svg>`, color: '#ef4444' },
      { name: 'Ice Cream', svg: (c) => '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="cn1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#d97706"/></linearGradient><radialGradient id="sc1" cx="40%" cy="35%" r="60%"><stop offset="0%" stop-color="' + (c||'#fca5a5') + '"/><stop offset="100%" stop-color="#f87171"/></radialGradient><radialGradient id="sc2" cx="40%" cy="35%" r="60%"><stop offset="0%" stop-color="#a5f3fc"/><stop offset="100%" stop-color="#22d3ee"/></radialGradient></defs><polygon points="32,62 16,36 48,36" fill="url(#cn1)"/><line x1="24" y1="58" x2="32" y2="36" stroke="#d97706" stroke-width="1" opacity="0.5"/><line x1="32" y1="58" x2="32" y2="36" stroke="#d97706" stroke-width="1" opacity="0.5"/><line x1="40" y1="58" x2="32" y2="36" stroke="#d97706" stroke-width="1" opacity="0.5"/><circle cx="32" cy="28" r="14" fill="url(#sc1)"/><circle cx="20" cy="24" r="11" fill="url(#sc2)"/><circle cx="44" cy="24" r="11" fill="url(#sc1)"/><circle cx="32" cy="14" r="10" fill="url(#sc2)"/><circle cx="19" cy="17" r="4" fill="#fff" opacity="0.3"/><circle cx="43" cy="17" r="4" fill="#fff" opacity="0.3"/><path d="M26 10 Q32 6 38 10" stroke="#f87171" stroke-width="2" fill="none"/><circle cx="32" cy="6" r="3" fill="#ef4444"/></svg>', color: '#f87171' },
    ]
  },
  {
    category: 'Nature',
    items: [
      { name: 'Tree', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="28" y="40" width="8" height="20" rx="2" fill="#92400e"/><polygon points="32,6 12,32 20,32 10,44 54,44 44,32 52,32" fill="${c||'#22c55e'}"/></svg>`, color: '#22c55e' },
      { name: 'Flower', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="36" width="4" height="24" rx="2" fill="#16a34a"/><circle cx="32" cy="24" r="8" fill="${c||'#f59e0b'}"/><circle cx="22" cy="30" r="8" fill="${c||'#ec4899'}"/><circle cx="42" cy="30" r="8" fill="${c||'#ec4899'}"/><circle cx="24" cy="20" r="8" fill="${c||'#a78bfa'}"/><circle cx="40" cy="20" r="8" fill="${c||'#a78bfa'}"/><circle cx="32" cy="24" r="5" fill="#fde68a"/></svg>`, color: '#ec4899' },
      { name: 'Cloud', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="32" rx="20" ry="12" fill="${c||'#e2e8f0'}"/><ellipse cx="20" cy="34" rx="12" ry="10" fill="${c||'#e2e8f0'}"/><ellipse cx="44" cy="34" rx="12" ry="10" fill="${c||'#e2e8f0'}"/><ellipse cx="28" cy="26" rx="10" ry="10" fill="${c||'#f1f5f9'}"/><ellipse cx="38" cy="28" rx="8" ry="8" fill="${c||'#f1f5f9'}"/></svg>`, color: '#e2e8f0' },
      { name: 'Sun', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="14" fill="${c||'#fbbf24'}"/><line x1="32" y1="4" x2="32" y2="14" stroke="${c||'#f59e0b'}" stroke-width="3" stroke-linecap="round"/><line x1="32" y1="50" x2="32" y2="60" stroke="${c||'#f59e0b'}" stroke-width="3" stroke-linecap="round"/><line x1="4" y1="32" x2="14" y2="32" stroke="${c||'#f59e0b'}" stroke-width="3" stroke-linecap="round"/><line x1="50" y1="32" x2="60" y2="32" stroke="${c||'#f59e0b'}" stroke-width="3" stroke-linecap="round"/><line x1="12" y1="12" x2="19" y2="19" stroke="${c||'#f59e0b'}" stroke-width="3" stroke-linecap="round"/><line x1="45" y1="45" x2="52" y2="52" stroke="${c||'#f59e0b'}" stroke-width="3" stroke-linecap="round"/><line x1="52" y1="12" x2="45" y2="19" stroke="${c||'#f59e0b'}" stroke-width="3" stroke-linecap="round"/><line x1="19" y1="45" x2="12" y2="52" stroke="${c||'#f59e0b'}" stroke-width="3" stroke-linecap="round"/></svg>`, color: '#fbbf24' },
      { name: 'Moon', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="28" cy="32" r="20" fill="${c||'#fde68a'}"/><circle cx="38" cy="26" r="16" fill="#0c0c2e"/><circle cx="20" cy="24" r="2" fill="#d4d4d8" opacity="0.4"/><circle cx="24" cy="40" r="3" fill="#d4d4d8" opacity="0.3"/><circle cx="16" cy="34" r="1.5" fill="#d4d4d8" opacity="0.5"/></svg>`, color: '#fde68a' },
      { name: 'Rock', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="10,48 18,24 32,18 48,22 56,38 50,52 14,52" fill="${c||'#78716c'}"/><polygon points="18,24 32,18 36,30 22,34" fill="${c||'#a8a29e'}" opacity="0.4"/></svg>`, color: '#78716c' },
      { name: 'Mushroom', svg: (c) => '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="mc1" cx="40%" cy="30%" r="60%"><stop offset="0%" stop-color="' + (c||'#f87171') + '"/><stop offset="100%" stop-color="#dc2626"/></radialGradient></defs><rect x="24" y="42" width="16" height="18" rx="3" fill="#fef9c3" stroke="#fbbf24" stroke-width="1"/><path d="M8 44 Q8 18 32 14 Q56 18 56 44 Z" fill="url(#mc1)"/><ellipse cx="32" cy="44" rx="24" ry="6" fill="#fef9c3"/><circle cx="22" cy="28" r="5" fill="#fff" opacity="0.9"/><circle cx="36" cy="22" r="4" fill="#fff" opacity="0.9"/><circle cx="48" cy="30" r="6" fill="#fff" opacity="0.9"/><circle cx="16" cy="36" r="3" fill="#fff" opacity="0.7"/><circle cx="42" cy="36" r="3" fill="#fff" opacity="0.7"/></svg>', color: '#ef4444' },
    ]
  },
  {
    category: 'Sports',
    items: [
      { name: 'Soccer Ball', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="26" fill="#fff" stroke="#374151" stroke-width="1.5"/><polygon points="32,8 40,18 36,28 28,28 24,18" fill="#374151"/><polygon points="8,28 18,22 24,28 20,38 8,36" fill="#374151"/><polygon points="56,28 46,22 40,28 44,38 56,36" fill="#374151"/><polygon points="20,50 24,40 28,44 28,54 18,52" fill="#374151"/><polygon points="44,50 40,40 36,44 36,54 46,52" fill="#374151"/></svg>`, color: '#f5f5f5' },
      { name: 'Basketball', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="26" fill="${c||'#f97316'}"/><path d="M32 6 L32 58" stroke="#1e293b" stroke-width="1.5" fill="none"/><path d="M6 32 L58 32" stroke="#1e293b" stroke-width="1.5" fill="none"/><path d="M12 14 Q26 32 12 50" stroke="#1e293b" stroke-width="1.5" fill="none"/><path d="M52 14 Q38 32 52 50" stroke="#1e293b" stroke-width="1.5" fill="none"/></svg>`, color: '#f97316' },
      { name: 'Tennis Ball', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="26" fill="${c||'#a3e635'}"/><path d="M14 10 Q32 24 50 10" stroke="#fff" stroke-width="3.5" fill="none"/><path d="M14 54 Q32 40 50 54" stroke="#fff" stroke-width="3.5" fill="none"/></svg>`, color: '#a3e635' },
      { name: 'Bowling Ball', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="26" fill="${c||'#4f46e5'}"/><circle cx="26" cy="24" r="3.5" fill="#1e1b4b"/><circle cx="36" cy="22" r="3.5" fill="#1e1b4b"/><circle cx="22" cy="30" r="3.5" fill="#1e1b4b"/><circle cx="22" cy="22" r="5" fill="#e0e7ff" opacity="0.15"/></svg>`, color: '#4f46e5' },
      { name: 'Medal', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="26" y="4" width="12" height="18" rx="2" fill="${c||'#f59e0b'}"/><polygon points="26,4 38,4 40,6 32,1 24,6" fill="${c||'#d97706'}"/><circle cx="32" cy="44" r="18" fill="${c||'#fbbf24'}"/><circle cx="32" cy="44" r="15" fill="none" stroke="${c||'#f59e0b'}" stroke-width="2"/><text x="32" y="50" text-anchor="middle" font-size="16" font-weight="bold" fill="#92400e">1</text></svg>`, color: '#f59e0b' },
    ]
  },
  {
    category: 'Monsters',
    items: [
      { name: 'Vampire', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="24" r="14" fill="#e2e8f0"/><path d="M18 18 Q14 4 22 8 L22 20Z" fill="${c||'#374151'}"/><path d="M46 18 Q50 4 42 8 L42 20Z" fill="${c||'#374151'}"/><circle cx="27" cy="22" r="2" fill="#dc2626"/><circle cx="37" cy="22" r="2" fill="#dc2626"/><path d="M27 30 Q32 34 37 30" stroke="#dc2626" fill="none" stroke-width="2"/><line x1="29" y1="32" x2="29" y2="36" stroke="#e2e8f0" stroke-width="1.5"/><line x1="35" y1="32" x2="35" y2="36" stroke="#e2e8f0" stroke-width="1.5"/><path d="M18 38 L22 62 L32 52 L42 62 L46 38 Q42 48 32 50 Q22 48 18 38Z" fill="${c||'#374151'}"/></svg>`, color: '#374151' },
      { name: 'Zombie', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="22" r="14" fill="#86efac"/><circle cx="26" cy="20" r="2" fill="#fff"/><circle cx="39" cy="20" r="3" fill="#fff"/><circle cx="26" cy="20" r="1" fill="#222"/><circle cx="39.5" cy="19.5" r="1.5" fill="#222"/><path d="M26 28 Q32 32 38 28" stroke="#166534" fill="none" stroke-width="2"/><rect x="22" y="36" width="20" height="24" rx="2" fill="${c||'#4ade80'}"/><line x1="22" y1="38" x2="4" y2="30" stroke="${c||'#4ade80'}" stroke-width="5" stroke-linecap="round"/><line x1="42" y1="38" x2="56" y2="30" stroke="${c||'#4ade80'}" stroke-width="5" stroke-linecap="round"/></svg>`, color: '#4ade80' },
      { name: 'Mummy', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="22" r="14" fill="${c||'#fde68a'}"/><circle cx="26" cy="20" r="2.5" fill="#dc2626"/><circle cx="38" cy="20" r="2.5" fill="#dc2626"/><path d="M18 10 Q22 26 32 24 Q42 26 46 10" stroke="#fff" stroke-width="2.5" fill="none"/><path d="M20 16 Q32 22 44 16" stroke="#fff" stroke-width="2" fill="none"/><rect x="22" y="36" width="20" height="24" rx="2" fill="${c||'#fef3c7'}"/><path d="M22 36 Q27 42 32 40 Q37 42 42 36" stroke="#fff" stroke-width="2" fill="none"/><path d="M22 48 Q27 54 32 52 Q37 54 42 48" stroke="#fff" stroke-width="2" fill="none"/></svg>`, color: '#fde68a' },
      { name: 'Cyclops', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="38" rx="20" ry="18" fill="${c||'#7c3aed'}"/><circle cx="32" cy="22" r="14" fill="${c||'#7c3aed'}"/><circle cx="32" cy="20" r="8" fill="#fff"/><circle cx="32" cy="20" r="5" fill="#22d3ee"/><circle cx="33" cy="20" r="3" fill="#222"/><circle cx="34" cy="19" r="1.2" fill="#fff"/><path d="M24 30 Q32 36 40 30" stroke="#4c1d95" fill="none" stroke-width="2"/><polygon points="24,8 32,2 40,8" fill="${c||'#6d28d9'}"/></svg>`, color: '#7c3aed' },
      { name: 'Yeti', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="42" rx="20" ry="18" fill="${c||'#e2e8f0'}"/><circle cx="32" cy="22" r="16" fill="${c||'#f1f5f9'}"/><circle cx="20" cy="14" r="8" fill="${c||'#e2e8f0'}"/><circle cx="44" cy="14" r="8" fill="${c||'#e2e8f0'}"/><circle cx="24" cy="20" r="3" fill="#222"/><circle cx="38" cy="20" r="3" fill="#222"/><ellipse cx="32" cy="28" rx="6" ry="4" fill="#94a3b8"/><path d="M10 50 L22 40 L22 56Z" fill="${c||'#e2e8f0'}"/><path d="M54 50 L42 40 L42 56Z" fill="${c||'#e2e8f0'}"/></svg>`, color: '#e2e8f0' },
    ]
  },
  {
    category: 'Buildings',
    items: [
      { name: 'Castle', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="18" width="36" height="46" fill="${c||'#78716c'}"/><rect x="14" y="10" width="8" height="10" fill="${c||'#78716c'}"/><rect x="28" y="8" width="8" height="12" fill="${c||'#78716c'}"/><rect x="42" y="10" width="8" height="10" fill="${c||'#78716c'}"/><rect x="14" y="8" width="36" height="4" fill="${c||'#57534e'}"/><rect x="26" y="38" width="12" height="26" rx="2" fill="#1e293b"/><rect x="20" y="22" width="10" height="12" rx="2" fill="#7dd3fc" opacity="0.5"/><rect x="34" y="22" width="10" height="12" rx="2" fill="#7dd3fc" opacity="0.5"/></svg>`, color: '#78716c' },
      { name: 'Crate', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="52" height="52" rx="3" fill="${c||'#92400e'}"/><rect x="6" y="6" width="52" height="8" rx="3" fill="${c||'#78350f'}"/><rect x="6" y="50" width="52" height="8" rx="3" fill="${c||'#78350f'}"/><rect x="6" y="6" width="8" height="52" rx="3" fill="${c||'#78350f'}"/><rect x="50" y="6" width="8" height="52" rx="3" fill="${c||'#78350f'}"/><line x1="6" y1="6" x2="58" y2="58" stroke="${c||'#78350f'}" stroke-width="2.5" opacity="0.5"/><line x1="58" y1="6" x2="6" y2="58" stroke="${c||'#78350f'}" stroke-width="2.5" opacity="0.5"/></svg>`, color: '#92400e' },
      { name: 'Barrel', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="10" width="36" height="46" rx="8" fill="${c||'#92400e'}"/><ellipse cx="32" cy="10" rx="18" ry="6" fill="${c||'#78350f'}"/><ellipse cx="32" cy="56" rx="18" ry="6" fill="${c||'#78350f'}"/><rect x="12" y="24" width="40" height="5" rx="2" fill="#78350f"/><rect x="12" y="36" width="40" height="5" rx="2" fill="#78350f"/></svg>`, color: '#92400e' },
      { name: 'Block', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="60" height="60" rx="5" fill="${c||'#f59e0b'}"/><rect x="2" y="2" width="60" height="10" rx="5" fill="#fbbf24"/><rect x="2" y="52" width="60" height="10" rx="5" fill="#d97706"/><text x="32" y="46" text-anchor="middle" font-size="32" font-weight="900" fill="#92400e">?</text></svg>`, color: '#f59e0b' },
      { name: 'Ladder', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="4" width="8" height="56" rx="3" fill="${c||'#a16207'}"/><rect x="48" y="4" width="8" height="56" rx="3" fill="${c||'#a16207'}"/><rect x="8" y="14" width="48" height="6" rx="2" fill="${c||'#92400e'}"/><rect x="8" y="28" width="48" height="6" rx="2" fill="${c||'#92400e'}"/><rect x="8" y="42" width="48" height="6" rx="2" fill="${c||'#92400e'}"/></svg>`, color: '#a16207' },
      { name: 'Sign', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="28" y="34" width="8" height="28" rx="2" fill="#92400e"/><rect x="8" y="6" width="48" height="30" rx="4" fill="${c||'#fbbf24'}"/><rect x="10" y="8" width="44" height="26" rx="3" fill="${c||'#fde68a'}"/><rect x="14" y="14" width="36" height="4" rx="2" fill="${c||'#d97706'}"/><rect x="18" y="22" width="28" height="4" rx="2" fill="${c||'#d97706'}"/></svg>`, color: '#f59e0b' },
    ]
  },
  {
    category: 'Space',
    items: [
      { name: 'Alien', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="32" rx="16" ry="20" fill="${c||'#4ade80'}"/><ellipse cx="20" cy="18" rx="6" ry="9" fill="${c||'#4ade80'}" transform="rotate(-20 20 18)"/><ellipse cx="44" cy="18" rx="6" ry="9" fill="${c||'#4ade80'}" transform="rotate(20 44 18)"/><ellipse cx="24" cy="26" rx="6" ry="5" fill="#111"/><ellipse cx="40" cy="26" rx="6" ry="5" fill="#111"/><ellipse cx="25" cy="26" rx="3" ry="2.5" fill="#7dd3fc"/><ellipse cx="41" cy="26" rx="3" ry="2.5" fill="#7dd3fc"/><path d="M26 38 Q32 42 38 38" stroke="#166534" fill="none" stroke-width="2"/><line x1="16" y1="40" x2="4" y2="46" stroke="${c||'#4ade80'}" stroke-width="3"/><line x1="48" y1="40" x2="60" y2="46" stroke="${c||'#4ade80'}" stroke-width="3"/></svg>`, color: '#4ade80' },
      { name: 'Planet', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="32" rx="28" ry="8" fill="none" stroke="${c||'#f59e0b'}" stroke-width="5" opacity="0.65" transform="rotate(-20 32 32)"/><circle cx="32" cy="32" r="18" fill="${c||'#6366f1'}"/><ellipse cx="26" cy="28" rx="8" ry="5" fill="${c||'#818cf8'}" opacity="0.5"/><ellipse cx="38" cy="36" rx="6" ry="4" fill="${c||'#4f46e5'}" opacity="0.4"/></svg>`, color: '#6366f1' },
      { name: 'Meteor', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M50 4 Q62 20 54 48 Q46 62 32 58" stroke="#f97316" stroke-width="3" fill="none" opacity="0.5"/><path d="M54 6 Q64 22 56 46" stroke="#fbbf24" stroke-width="2" fill="none" opacity="0.3"/><circle cx="28" cy="42" r="16" fill="${c||'#78716c'}"/><circle cx="22" cy="36" r="5" fill="#57534e" opacity="0.5"/><circle cx="32" cy="46" r="3" fill="#57534e" opacity="0.4"/></svg>`, color: '#78716c' },
      { name: 'Satellite', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="26" y="26" width="12" height="12" rx="2" fill="${c||'#e2e8f0'}"/><rect x="4" y="28" width="22" height="8" rx="2" fill="#3b82f6" opacity="0.8"/><rect x="38" y="28" width="22" height="8" rx="2" fill="#3b82f6" opacity="0.8"/><circle cx="32" cy="32" r="4" fill="#22d3ee"/></svg>`, color: '#e2e8f0' },
      { name: 'Black Hole', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="32" rx="30" ry="10" fill="none" stroke="#a855f7" stroke-width="3" opacity="0.7"/><circle cx="32" cy="32" r="12" fill="#0f0f1a"/><circle cx="32" cy="32" r="12" fill="none" stroke="${c||'#7c3aed'}" stroke-width="3"/><ellipse cx="32" cy="32" rx="22" ry="7" fill="none" stroke="#a78bfa" stroke-width="1.5" opacity="0.5"/><circle cx="20" cy="26" r="1.5" fill="#fff" opacity="0.6"/><circle cx="44" cy="24" r="1" fill="#fff" opacity="0.4"/></svg>`, color: '#7c3aed' },
      { name: 'Astronaut', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="22" r="14" fill="${c||'#e2e8f0'}"/><rect x="24" y="18" width="16" height="12" rx="3" fill="#93c5fd" opacity="0.7"/><rect x="20" y="36" width="24" height="22" rx="4" fill="${c||'#cbd5e1'}"/><rect x="20" y="36" width="24" height="6" rx="3" fill="#94a3b8"/><rect x="8" y="38" width="12" height="6" rx="2" fill="${c||'#e2e8f0'}"/><rect x="44" y="38" width="12" height="6" rx="2" fill="${c||'#e2e8f0'}"/><rect x="27" y="58" width="5" height="6" rx="2" fill="${c||'#cbd5e1'}"/><rect x="33" y="58" width="5" height="6" rx="2" fill="${c||'#cbd5e1'}"/></svg>`, color: '#e2e8f0' },
    ]
  },
];

/* ─── Background Library ─── */
const BACKGROUNDS = [
  { name: 'Sky', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#87CEEB'); g.addColorStop(1,'#e0f2fe'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#22c55e'; ctx.fillRect(0,h*0.75,w,h*0.25); for(let i=0;i<3;i++){ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(80+i*160,60+i*20,50,18,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(100+i*160,55+i*20,40,16,0,0,Math.PI*2);ctx.fill();}}},
  { name: 'Space', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#0c0c2e'); g.addColorStop(1,'#1a1a4e'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#fff'; for(let i=0;i<80;i++){const x=(i*73+17)%w;const y=(i*41+29)%h;const r=((i%3)+0.5);ctx.globalAlpha=0.3+Math.random()*0.7;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();} ctx.globalAlpha=1;}},
  { name: 'City', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#1e293b'); g.addColorStop(0.6,'#334155'); g.addColorStop(1,'#475569'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); const bldgs=[[20,180],[60,240],[120,160],[170,280],[240,200],[300,260],[360,180],[400,220],[440,300]]; bldgs.forEach(([x,bh])=>{ctx.fillStyle='#1e293b';ctx.fillRect(x,h-bh,50,bh);for(let wy=h-bh+10;wy<h-10;wy+=25){for(let wx=x+8;wx<x+42;wx+=14){ctx.fillStyle=Math.random()>0.3?'#fde68a':'#334155';ctx.fillRect(wx,wy,8,12);}}});}},
  { name: 'Ocean', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#bae6fd'); g.addColorStop(0.4,'#38bdf8'); g.addColorStop(1,'#0369a1'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=2; for(let i=0;i<6;i++){ctx.beginPath();for(let x=0;x<w;x+=4){ctx.lineTo(x,120+i*45+Math.sin(x*0.02+i)*12);}ctx.stroke();}}},
  { name: 'Forest', draw: (ctx, w, h) => { ctx.fillStyle='#86efac'; ctx.fillRect(0,0,w,h); const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#bbf7d0'); g.addColorStop(1,'#4ade80'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); for(let i=0;i<12;i++){const tx=i*42+10;const th=80+Math.random()*60;ctx.fillStyle='#92400e';ctx.fillRect(tx+12,h-th,8,th);ctx.fillStyle='#16a34a';ctx.beginPath();ctx.moveTo(tx+16,h-th-40);ctx.lineTo(tx-6,h-th+20);ctx.lineTo(tx+38,h-th+20);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(tx+16,h-th-20);ctx.lineTo(tx-2,h-th+30);ctx.lineTo(tx+34,h-th+30);ctx.closePath();ctx.fill();}}},
  { name: 'Desert', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#fed7aa'); g.addColorStop(0.5,'#fdba74'); g.addColorStop(1,'#c2410c'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#ea580c'; for(let i=0;i<3;i++){const dx=80+i*170;ctx.beginPath();ctx.moveTo(dx,h*0.5);ctx.lineTo(dx+40,h*0.2);ctx.lineTo(dx+80,h*0.5);ctx.fill();} ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(w-60,50,30,0,Math.PI*2); ctx.fill();}},
  { name: 'Underwater', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#0ea5e9'); g.addColorStop(1,'#0c4a6e'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='rgba(255,255,255,0.06)'; for(let i=0;i<20;i++){const bx=(i*47+13)%w;const by=(i*89+37)%h;const br=2+i%4;ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.fill();} ctx.fillStyle='#166534'; for(let i=0;i<8;i++){const sx=i*65+10;ctx.beginPath();for(let y=h;y>h-60-i*8;y-=2){ctx.lineTo(sx+Math.sin(y*0.08)*8,y);}ctx.lineTo(sx,h);ctx.fill();}}},
  { name: 'White', draw: (ctx, w, h) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }},
  { name: 'Sunset', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#1e1b4b'); g.addColorStop(0.3,'#7c3aed'); g.addColorStop(0.5,'#f97316'); g.addColorStop(0.7,'#fbbf24'); g.addColorStop(1,'#fde68a'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(w/2,h*0.55,40,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#0c0c2e'; ctx.fillRect(0,h*0.8,w,h*0.2);}},
  { name: 'Snow', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#e0f2fe'); g.addColorStop(1,'#f0f9ff'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#fff'; ctx.fillRect(0,h*0.7,w,h*0.3); ctx.fillStyle='rgba(255,255,255,0.8)'; for(let i=0;i<40;i++){ctx.beginPath();ctx.arc((i*67+11)%w,(i*43+7)%h,1.5+i%2,0,Math.PI*2);ctx.fill();}}},
  { name: 'Jungle', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#064e3b'); g.addColorStop(0.5,'#065f46'); g.addColorStop(1,'#047857'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#022c22'; for(let i=0;i<8;i++){const bx=i*65; ctx.beginPath();ctx.moveTo(bx,h);ctx.lineTo(bx+10,h-80-i*10);ctx.lineTo(bx+20,h);ctx.fill(); ctx.fillStyle='#065f46';ctx.beginPath();ctx.ellipse(bx+10,h-60-i*10,18,30,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#022c22';}}},
  { name: 'Cave', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#1c1917'); g.addColorStop(0.5,'#292524'); g.addColorStop(1,'#1c1917'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#44403c'; for(let i=0;i<6;i++){const sx=(i*83+20)%w; ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx+15,30+i*8);ctx.lineTo(sx+30,0);ctx.fill();ctx.beginPath();ctx.moveTo(sx+40,h);ctx.lineTo(sx+55,h-25-i*6);ctx.lineTo(sx+70,h);ctx.fill();} ctx.fillStyle='#78716c'; for(let i=0;i<15;i++){ctx.beginPath();ctx.arc((i*53+7)%w,(i*71+13)%(h-20)+10,1+i%2,0,Math.PI*2);ctx.fill();}}},
  { name: 'Lava', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#450a0a'); g.addColorStop(0.5,'#7f1d1d'); g.addColorStop(1,'#ef4444'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#f97316'; for(let i=0;i<4;i++){ctx.beginPath();for(let x=0;x<w;x+=4){ctx.lineTo(x,h*0.75+Math.sin(x*0.03+i*2)*12+i*8);}ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();ctx.fillStyle='#fbbf24';}}},
  { name: 'Candy', draw: (ctx, w, h) => { ctx.fillStyle='#fce7f3'; ctx.fillRect(0,0,w,h); const colors=['#f9a8d4','#c084fc','#67e8f9','#86efac','#fde68a']; for(let i=0;i<10;i++){ctx.fillStyle=colors[i%colors.length]; ctx.beginPath();ctx.arc((i*97+30)%w,(i*61+20)%h,20+i%3*8,0,Math.PI*2);ctx.globalAlpha=0.2;ctx.fill();} ctx.globalAlpha=1; ctx.fillStyle='#22c55e'; ctx.fillRect(0,h*0.8,w,h*0.2);}},
  { name: 'Dungeon', draw: (ctx, w, h) => { ctx.fillStyle='#1c1917'; ctx.fillRect(0,0,w,h); for(let row=0;row<h;row+=24){const offset=row%48===0?0:24;for(let col=offset;col<w+48;col+=48){ctx.fillStyle='#44403c';ctx.fillRect(col,row,45,22);}} ctx.fillStyle='#f97316';ctx.globalAlpha=0.1;ctx.beginPath();ctx.arc(w/2,h/2,90,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}},
  { name: 'Kingdom', draw: (ctx, w, h) => { const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#1e3a5f');g.addColorStop(1,'#1e293b');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff';for(let i=0;i<50;i++){ctx.globalAlpha=0.15+i%3*0.1;ctx.beginPath();ctx.arc((i*71+13)%w,(i*47+9)%(h*0.65),1+i%2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;[[10,130],[70,160],[160,120],[250,170],[340,130],[430,170]].forEach(([tx,th])=>{ctx.fillStyle='#1e293b';ctx.fillRect(tx,h-th,50,th);for(let c=tx;c<tx+50;c+=14){ctx.fillStyle='#334155';ctx.fillRect(c,h-th-14,10,14);}for(let wy=h-th+10;wy<h-6;wy+=20){for(let wx=tx+6;wx<tx+44;wx+=12){ctx.fillStyle=(wx+wy)%2===0?'#fde68a':'#1e293b';ctx.fillRect(wx,wy,8,10);}}}); ctx.fillStyle='#0f172a';ctx.fillRect(0,h*0.86,w,h*0.14);}},
  { name: 'Neon City', draw: (ctx, w, h) => { ctx.fillStyle='#030712';ctx.fillRect(0,0,w,h);const cols=['#f0abfc','#818cf8','#22d3ee','#34d399','#fb7185'];[[0,220],[50,180],[100,250],[150,160],[200,240],[250,200],[300,230],[350,170],[400,260],[430,190],[460,220]].forEach(([bx,bh],i)=>{const col=cols[i%cols.length];ctx.fillStyle='#0f172a';ctx.fillRect(bx,h-bh,50,bh);ctx.strokeStyle=col;ctx.lineWidth=1;ctx.globalAlpha=0.5;ctx.strokeRect(bx,h-bh,50,bh);ctx.globalAlpha=1;for(let wy=h-bh+6;wy<h-4;wy+=18){for(let wx=bx+6;wx<bx+44;wx+=12){if((wx+wy)%3!==0){ctx.fillStyle=col;ctx.globalAlpha=0.18;ctx.fillRect(wx,wy,8,10);ctx.globalAlpha=1;}}}ctx.fillStyle=col;ctx.globalAlpha=0.35;ctx.fillRect(bx,h-bh,50,3);ctx.globalAlpha=1;});}},
  { name: 'Mountain', draw: (ctx, w, h) => { const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#bfdbfe');g.addColorStop(0.65,'#7dd3fc');g.addColorStop(1,'#38bdf8');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='#64748b';ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(80,h*0.35);ctx.lineTo(180,h*0.6);ctx.lineTo(260,h*0.22);ctx.lineTo(360,h*0.5);ctx.lineTo(440,h*0.14);ctx.lineTo(w,h*0.42);ctx.lineTo(w,h);ctx.closePath();ctx.fill();ctx.fillStyle='#e2e8f0';ctx.beginPath();ctx.moveTo(220,h*0.3);ctx.lineTo(260,h*0.22);ctx.lineTo(300,h*0.3);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(400,h*0.22);ctx.lineTo(440,h*0.14);ctx.lineTo(480,h*0.22);ctx.closePath();ctx.fill();ctx.fillStyle='#4ade80';ctx.fillRect(0,h*0.72,w,h*0.28);}},
  { name: 'Rainbow', draw: (ctx, w, h) => { const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#bfdbfe');g.addColorStop(1,'#dbeafe');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);['#ef4444','#f97316','#fbbf24','#4ade80','#60a5fa','#818cf8','#c084fc'].forEach((col,i)=>{ctx.strokeStyle=col;ctx.lineWidth=7;ctx.beginPath();ctx.arc(w/2,h+30,(7-i)*42+20,Math.PI,Math.PI*2);ctx.stroke();});ctx.fillStyle='#22c55e';ctx.fillRect(0,h*0.8,w,h*0.2);for(let i=0;i<3;i++){ctx.fillStyle='#fff';ctx.globalAlpha=0.85;ctx.beginPath();ctx.ellipse(60+i*190,64,44,16,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(84+i*190,52,34,16,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}}},
  { name: 'Graveyard', draw: (ctx, w, h) => { const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#1a1a2e');g.addColorStop(1,'#0d1117');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff';for(let i=0;i<60;i++){ctx.globalAlpha=0.05+i%3*0.06;ctx.beginPath();ctx.arc((i*73+17)%w,(i*41+29)%(h*0.7),0.8+i%2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.fillStyle='#14532d';ctx.fillRect(0,h*0.72,w,h*0.28);for(let i=0;i<7;i++){const gx=30+i*72;ctx.fillStyle='#78716c';ctx.beginPath();ctx.rect(gx-10,h*0.52,20,34);ctx.fill();ctx.beginPath();ctx.arc(gx,h*0.52,10,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#57534e';ctx.fillRect(gx-2,h*0.57,4,10);ctx.fillRect(gx-7,h*0.61,14,4);}}},
];

function findSpriteTemplate(name) {
  for (const cat of SPRITE_LIBRARY) {
    const found = cat.items.find(i => i.name === name);
    if (found) return found;
  }
  return null;
}

function renderSvgToImage(svgString, w, h) {
  return new Promise((resolve) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

function SpriteThumb({ svgKey, color, customImage, size = 32 }) {
  if (customImage) return <img src={customImage} alt="custom" width={size} height={size} style={{ imageRendering: 'auto', objectFit: 'contain' }} />;
  const tpl = findSpriteTemplate(svgKey);
  if (!tpl) return <span style={{ fontSize: size * 0.6 }}>❓</span>;
  const svgStr = tpl.svg(color || tpl.color);
  const encoded = btoa(unescape(encodeURIComponent(svgStr)));
  return <img src={`data:image/svg+xml;base64,${encoded}`} alt={svgKey} width={size} height={size} style={{ imageRendering: 'auto' }} />;
}

/* ─── Default sprites with blocks (not dropdown scripts) ─── */
const defaultSprites = [
  {
    id: 1, name: 'Cat', svgKey: 'Cat', category: 'People',
    x: 180, y: 240, w: 48, h: 48, rotation: 0, visible: true, color: null, layer: 1,
    blocks: [
      { id: 101, type: 'event-keypress', ...BLOCK_DEFS['event-keypress'], params: { key: 'ArrowRight' }, x: 30, y: 20 },
      { id: 102, type: 'sprite-changex', ...BLOCK_DEFS['sprite-changex'], params: { amount: '10' }, x: 30, y: 80 },
      { id: 103, type: 'event-keypress', ...BLOCK_DEFS['event-keypress'], params: { key: 'ArrowLeft' }, x: 30, y: 160 },
      { id: 104, type: 'sprite-changex', ...BLOCK_DEFS['sprite-changex'], params: { amount: '-10' }, x: 30, y: 220 },
      { id: 105, type: 'event-keypress', ...BLOCK_DEFS['event-keypress'], params: { key: 'ArrowUp' }, x: 30, y: 300 },
      { id: 106, type: 'sprite-changey', ...BLOCK_DEFS['sprite-changey'], params: { amount: '-10' }, x: 30, y: 360 },
      { id: 107, type: 'event-keypress', ...BLOCK_DEFS['event-keypress'], params: { key: 'ArrowDown' }, x: 30, y: 440 },
      { id: 108, type: 'sprite-changey', ...BLOCK_DEFS['sprite-changey'], params: { amount: '10' }, x: 30, y: 500 },
    ],
  },
  {
    id: 2, name: 'Star', svgKey: 'Star', category: 'Objects',
    x: 350, y: 100, w: 36, h: 36, rotation: 0, visible: true, color: null, layer: 1,
    blocks: [
      { id: 201, type: 'event-start', ...BLOCK_DEFS['event-start'], params: {}, x: 30, y: 20 },
      { id: 202, type: 'sprite-goto', ...BLOCK_DEFS['sprite-goto'], params: { x: '350', y: '100' }, x: 30, y: 80 },
    ],
  },
  {
    id: 3, name: 'Platform', svgKey: 'Platform', category: 'Objects',
    x: 100, y: 300, w: 160, h: 24, rotation: 0, visible: true, color: null, layer: 0,
    blocks: [],
  },
];

/* ═══════════════════════════════════════════════════
   Game Builder — Scratch-like Layout
   Left: Block coding area (per sprite)
   Right: Stage + Sprite pane
   ═══════════════════════════════════════════════════ */
export default function GameBuilder() {
  const { user } = useUser();
  const canvasRef = useRef(null);
  const blockAreaRef = useRef(null);
  const [sprites, setSprites] = useState(() => {
    try { const s = localStorage.getItem('cv_gamebuilder_sprites'); return s ? JSON.parse(s) : defaultSprites; } catch { return defaultSprites; }
  });
  const [selected, setSelected] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [background, setBackground] = useState(() => {
    try { return localStorage.getItem('cv_gamebuilder_bg') || 'Space'; } catch { return 'Space'; }
  });
  const [savedFlash, setSavedFlash] = useState(false);
  const [submitFlash, setSubmitFlash] = useState(false);
  const [pendingAssignment] = useState(() => {
    try { const a = sessionStorage.getItem('bb-pending-assignment'); return a ? JSON.parse(a) : null; } catch { return null; }
  });
  const [viewingSubmission] = useState(() => {
    try { const v = sessionStorage.getItem('bb-viewing-submission'); return v ? JSON.parse(v) : null; } catch { return null; }
  });
  const [exporting, setExporting] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libCategory, setLibCategory] = useState('People');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [score, setScore] = useState(0);
  const [draggingSprite, setDraggingSprite] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const animRef = useRef(null);
  const playSpritesRef = useRef([]);
  const imgCacheRef = useRef({});
  const [customBackgrounds, setCustomBackgrounds] = useState([]);
  const spriteUploadRef = useRef(null);
  const bgUploadRef = useRef(null);
  const stageFsRef = useRef(null);
  const [stageFs, setStageFs] = useState(false);

  useEffect(() => {
    const handler = () => setStageFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleStageFs = () => {
    if (!stageFs) stageFsRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  // Block editing state
  const [draggingBlock, setDraggingBlock] = useState(null);
  const [blockDragOffset, setBlockDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredBlock, setHoveredBlock] = useState(null);

  const selectedSprite = sprites.find(s => s.id === selected);

  const saveProject = () => {
    try {
      localStorage.setItem('cv_gamebuilder_sprites', JSON.stringify(sprites));
      localStorage.setItem('cv_gamebuilder_bg', background);
    } catch {}
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  const exportGame = () => {
    setExporting(true);
    try {
      // Serialize sprite SVGs as base64 data URLs
      const spriteData = sprites.filter(s => s.visible !== false).map(s => {
        let dataUrl = '';
        if (s.customImage) {
          dataUrl = s.customImage;
        } else {
          const tpl = findSpriteTemplate(s.svgKey);
          if (tpl) {
            const svgStr = tpl.svg(s.color || tpl.color);
            const encoded = btoa(unescape(encodeURIComponent(svgStr)));
            dataUrl = `data:image/svg+xml;base64,${encoded}`;
          }
        }
        // Extract movement blocks
        const moveBlocks = (s.blocks || []).map(b => ({ type: b.type, params: b.params || {} }));
        return { id: s.id, name: s.name, x: s.x, y: s.y, w: s.w || 48, h: s.h || 48, rotation: s.rotation || 0, dataUrl, moveBlocks };
      });

      // Build background drawing code string for the exported HTML
      const bgMap = {
        Sky: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#87CEEB');g.addColorStop(1,'#e0f2fe');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#22c55e';ctx.fillRect(0,H*.75,W,H*.25);for(var i=0;i<3;i++){ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(80+i*160,60+i*20,50,18,0,0,Math.PI*2);ctx.fill();}`,
        Space: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0c0c2e');g.addColorStop(1,'#1a1a4e');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';for(var i=0;i<80;i++){var x=(i*73+17)%W,y=(i*41+29)%H,r=((i%3)+0.5);ctx.globalAlpha=0.5;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;`,
        City: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1e293b');g.addColorStop(0.6,'#334155');g.addColorStop(1,'#475569');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var bldgs=[[20,180],[60,240],[120,160],[170,280],[240,200],[300,260],[360,180],[400,220],[440,300]];bldgs.forEach(function(b){ctx.fillStyle='#1e293b';ctx.fillRect(b[0],H-b[1],50,b[1]);});`,
        Ocean: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#bae6fd');g.addColorStop(0.4,'#38bdf8');g.addColorStop(1,'#0369a1');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Forest: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#bbf7d0');g.addColorStop(1,'#4ade80');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Desert: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fed7aa');g.addColorStop(0.5,'#fdba74');g.addColorStop(1,'#c2410c');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Underwater: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0ea5e9');g.addColorStop(1,'#0c4a6e');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        White: `ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);`,
        Sunset: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1e1b4b');g.addColorStop(0.3,'#7c3aed');g.addColorStop(0.5,'#f97316');g.addColorStop(0.7,'#fbbf24');g.addColorStop(1,'#fde68a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Snow: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#e0f2fe');g.addColorStop(1,'#f0f9ff');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,H*.7,W,H*.3);`,
        Jungle: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#064e3b');g.addColorStop(1,'#047857');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Cave: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1c1917');g.addColorStop(1,'#1c1917');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Lava: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#450a0a');g.addColorStop(0.5,'#7f1d1d');g.addColorStop(1,'#ef4444');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Candy: `ctx.fillStyle='#fce7f3';ctx.fillRect(0,0,W,H);`,
        Dungeon: `ctx.fillStyle='#1c1917';ctx.fillRect(0,0,W,H);`,
        Kingdom: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1e3a5f');g.addColorStop(1,'#1e293b');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        'Neon City': `ctx.fillStyle='#030712';ctx.fillRect(0,0,W,H);`,
        Mountain: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#bfdbfe');g.addColorStop(1,'#38bdf8');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#64748b';ctx.fillRect(0,H*.5,W,H*.5);`,
        Rainbow: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#bfdbfe');g.addColorStop(1,'#dbeafe');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Graveyard: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a1a2e');g.addColorStop(1,'#0d1117');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#14532d';ctx.fillRect(0,H*.72,W,H*.28);`,
      };
      const bgCode = bgMap[background] || bgMap['Space'];

      const htmlString = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ByteBuddies Game</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Segoe UI', Arial, sans-serif; color: #fff; }
  #title-bar { font-size: 22px; font-weight: 700; letter-spacing: 1px; margin-bottom: 10px; color: #a78bfa; text-shadow: 0 0 12px #7c3aed88; }
  #canvas-wrap { position: relative; border-radius: 10px; overflow: hidden; box-shadow: 0 0 40px #7c3aed55, 0 8px 32px #0008; border: 2px solid #7c3aed88; }
  canvas { display: block; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 480px; margin-top: 8px; }
  #score-display { font-size: 16px; font-weight: 600; color: #fbbf24; }
  #fs-btn { background: #7c3aed; color: #fff; border: none; border-radius: 6px; padding: 4px 14px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  #fs-btn:hover { background: #6d28d9; }
  #overlay { position: absolute; inset: 0; background: rgba(15,23,42,0.88); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; z-index: 10; border-radius: 8px; }
  #overlay h2 { font-size: 28px; font-weight: 800; color: #a78bfa; text-shadow: 0 0 16px #7c3aed; }
  #overlay p { font-size: 15px; color: #cbd5e1; }
  #start-btn { background: linear-gradient(135deg,#7c3aed,#4f46e5); color: #fff; border: none; border-radius: 8px; padding: 10px 32px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 16px #7c3aed55; transition: transform 0.1s; }
  #start-btn:hover { transform: scale(1.05); }
  #made-with { font-size: 11px; color: #475569; margin-top: 16px; }
</style>
</head>
<body>
<div id="title-bar">🎮 ByteBuddies Game</div>
<div id="canvas-wrap">
  <canvas id="c" width="480" height="360"></canvas>
  <div id="overlay">
    <h2>🎮 ByteBuddies Game</h2>
    <p>Use Arrow Keys or WASD to move</p>
    <button id="start-btn">▶ Play Game</button>
    <div id="made-with">Made with ByteBuddies</div>
  </div>
</div>
<div id="hud">
  <span id="score-display">Score: 0</span>
  <button id="fs-btn" onclick="toggleFs()">⛶ Fullscreen</button>
</div>
<script>
(function(){
var W=480,H=360;
var canvas=document.getElementById('c');
var ctx=canvas.getContext('2d');
var score=0;
var running=false;
var keys={};
var SPRITES=${JSON.stringify(spriteData)};
var imgs={};
var loaded=0;

function drawBg(){${bgCode}}

function drawSprites(){
  SPRITES.forEach(function(s){
    var img=imgs[s.id];
    if(!img||!img.complete)return;
    ctx.save();
    ctx.translate(s.x+s.w/2,s.y+s.h/2);
    if(s.rotation)ctx.rotate(s.rotation*Math.PI/180);
    ctx.drawImage(img,-s.w/2,-s.h/2,s.w,s.h);
    ctx.restore();
  });
}

function applyBlocks(){
  SPRITES.forEach(function(s){
    var spd=3;
    var hasKeyBlock=s.moveBlocks.some(function(b){return b.type&&b.type.indexOf('keypress')>=0;});
    if(hasKeyBlock){
      s.moveBlocks.forEach(function(b,i){
        if(b.type==='event-keypress'){
          var k=b.params&&b.params.key;
          if(keys[k]||keys[k&&k.toLowerCase()]){
            var next=s.moveBlocks[i+1];
            if(next){
              if(next.type==='sprite-changex') s.x+=parseFloat(next.params&&next.params.amount||0);
              if(next.type==='sprite-changey') s.y+=parseFloat(next.params&&next.params.amount||0);
              if(next.type==='sprite-move') { s.x+=Math.cos((s.rotation||0)*Math.PI/180)*parseFloat(next.params&&next.params.steps||0); s.y+=Math.sin((s.rotation||0)*Math.PI/180)*parseFloat(next.params&&next.params.steps||0); }
              if(next.type==='sprite-turn') s.rotation=(s.rotation||0)+parseFloat(next.params&&next.params.degrees||0);
            }
          }
        }
      });
    } else {
      // fallback arrow key movement for sprites with no key blocks
      if(s.id===SPRITES[0]&&SPRITES[0]){
        if(keys['ArrowLeft']||keys['a'])s.x-=spd;
        if(keys['ArrowRight']||keys['d'])s.x+=spd;
        if(keys['ArrowUp']||keys['w'])s.y-=spd;
        if(keys['ArrowDown']||keys['s'])s.y+=spd;
      }
    }
    // Clamp to stage
    s.x=Math.max(0,Math.min(W-s.w,s.x));
    s.y=Math.max(0,Math.min(H-s.h,s.y));
  });
}

function checkCollisions(){
  if(SPRITES.length<2)return;
  var hero=SPRITES[0];
  for(var i=1;i<SPRITES.length;i++){
    var other=SPRITES[i];
    if(!other.dataUrl)continue;
    var touching=(hero.x<other.x+other.w&&hero.x+hero.w>other.x&&hero.y<other.y+other.h&&hero.y+hero.h>other.y);
    if(touching&&!other._hit){
      other._hit=true;
      score++;
      document.getElementById('score-display').textContent='Score: '+score;
      // reset other sprite position
      other.x=Math.floor(Math.random()*(W-other.w));
      other.y=Math.floor(Math.random()*(H-other.h*2));
      setTimeout(function(o){o._hit=false;}(other),400);
    }
  }
}

function loop(){
  if(!running)return;
  applyBlocks();
  checkCollisions();
  drawBg();
  drawSprites();
  requestAnimationFrame(loop);
}

function loadImages(cb){
  if(SPRITES.length===0){cb();return;}
  SPRITES.forEach(function(s){
    if(!s.dataUrl){loaded++;if(loaded===SPRITES.length)cb();return;}
    var img=new Image();
    img.onload=function(){loaded++;if(loaded===SPRITES.length)cb();};
    img.onerror=function(){loaded++;if(loaded===SPRITES.length)cb();};
    img.src=s.dataUrl;
    imgs[s.id]=img;
  });
}

document.addEventListener('keydown',function(e){keys[e.key]=true;keys[e.key.toLowerCase()]=true;});
document.addEventListener('keyup',function(e){keys[e.key]=false;keys[e.key.toLowerCase()]=false;});

document.getElementById('start-btn').addEventListener('click',function(){
  document.getElementById('overlay').style.display='none';
  running=true;
  loop();
});

window.toggleFs=function(){
  var wrap=document.getElementById('canvas-wrap');
  if(!document.fullscreenElement){wrap.requestFullscreen&&wrap.requestFullscreen();}
  else{document.exitFullscreen&&document.exitFullscreen();}
};

// Draw initial background on load
loadImages(function(){
  drawBg();
  drawSprites();
});
})();
</script>
</body>
</html>`;

      const blob = new Blob([htmlString], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bytebuddies-game.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveProject(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sprites, background]);

  // Resize canvas to native screen size when fullscreen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (stageFs) {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      canvas.width  = STAGE_W;
      canvas.height = STAGE_H;
    }
  }, [stageFs]);

  /* ─── Drawing ─── */
  const draw = useCallback(async (spritesToDraw) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Scale to logical STAGE_W×STAGE_H space (native resolution in fullscreen)
    const sx = canvas.width / STAGE_W, sy = canvas.height / STAGE_H;
    ctx.save();
    ctx.scale(sx, sy);

    // Draw background (custom image or built-in)
    const customBg = customBackgrounds.find(b => b.name === background);
    if (customBg) {
      const bgKey = '__bg__' + customBg.name;
      if (!imgCacheRef.current[bgKey]) {
        const bgImg = new Image();
        await new Promise(r => { bgImg.onload = r; bgImg.onerror = r; bgImg.src = customBg.dataUrl; });
        imgCacheRef.current[bgKey] = bgImg;
      }
      const bgImg = imgCacheRef.current[bgKey];
      if (bgImg && bgImg.complete && bgImg.naturalWidth) ctx.drawImage(bgImg, 0, 0, STAGE_W, STAGE_H);
      else { ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0, 0, STAGE_W, STAGE_H); }
    } else {
      const bg = BACKGROUNDS.find(b => b.name === background) || BACKGROUNDS[0];
      bg.draw(ctx, STAGE_W, STAGE_H);
    }

    if (!isPlaying) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < STAGE_W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, STAGE_H); ctx.stroke(); }
      for (let y = 0; y < STAGE_H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(STAGE_W, y); ctx.stroke(); }
    }

    const sorted = [...spritesToDraw].sort((a, b) => (a.layer || 0) - (b.layer || 0));
    for (const sprite of sorted) {
      if (!sprite.visible) continue;

      let img;
      if (sprite.customImage) {
        const cacheKey = '__custom__' + sprite.id + sprite.w + sprite.h;
        if (!imgCacheRef.current[cacheKey]) {
          const cImg = new Image();
          await new Promise(r => { cImg.onload = r; cImg.onerror = r; cImg.src = sprite.customImage; });
          imgCacheRef.current[cacheKey] = cImg;
        }
        img = imgCacheRef.current[cacheKey];
      } else {
        const tpl = findSpriteTemplate(sprite.svgKey);
        if (!tpl) continue;
        const svgStr = tpl.svg(sprite.color || tpl.color);
        const cacheKey = sprite.svgKey + (sprite.color || '') + sprite.w + sprite.h;
        if (!imgCacheRef.current[cacheKey]) {
          imgCacheRef.current[cacheKey] = await renderSvgToImage(svgStr, sprite.w, sprite.h);
        }
        img = imgCacheRef.current[cacheKey];
      }
      if (img) {
        ctx.save();
        ctx.translate(sprite.x + sprite.w / 2, sprite.y + sprite.h / 2);
        ctx.rotate((sprite.rotation || 0) * Math.PI / 180);
        ctx.drawImage(img, -sprite.w / 2, -sprite.h / 2, sprite.w, sprite.h);
        ctx.restore();
      }

      // Selection box
      if (selected === sprite.id && !isPlaying) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(sprite.x - 3, sprite.y - 3, sprite.w + 6, sprite.h + 6);
        ctx.setLineDash([]);
      }

      // Speech bubble
      if (sprite._sayText && sprite._sayUntil > Date.now()) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        const tw = ctx.measureText(sprite._sayText).width + 16;
        const bx = sprite.x + sprite.w / 2 - tw / 2;
        const by = sprite.y - 30;
        ctx.beginPath();
        ctx.roundRect(bx, by, tw, 24, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#222';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sprite._sayText, sprite.x + sprite.w / 2, by + 12);
      }
    }

    if (isPlaying) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, STAGE_W, 32);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Score: ${score}`, 10, 16);
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Use blocks to control sprites', STAGE_W - 10, 16);
    }
    ctx.restore(); // pop scale transform
  }, [selected, isPlaying, score, background, customBackgrounds, stageFs]);

  useEffect(() => { draw(sprites); }, [sprites, draw]);

  /* ─── Runtime: Interpret blocks for each sprite ─── */
  useEffect(() => {
    if (!isPlaying) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }

    // Build runtime state from sprites' blocks
    playSpritesRef.current = sprites.map(s => ({
      ...s, vx: 0, vy: 0, _sayText: null, _sayUntil: 0,
    }));
    const keys = {};
    let localScore = 0;
    const vars = {}; // shared variables

    const gameKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'w', 'a', 's', 'd']);
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      keys[e.key] = true;
      if (gameKeys.has(e.key)) e.preventDefault();
    };
    const handleKeyUp = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      keys[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Parse blocks into script chains per sprite
    function buildScriptChains(blocks) {
      if (!blocks || blocks.length === 0) return [];
      const sorted = [...blocks].sort((a, b) => a.y - b.y);
      const chains = [];
      let current = null;

      for (const block of sorted) {
        if (block.type.startsWith('event-')) {
          if (current) chains.push(current);
          current = { trigger: block, body: [] };
        } else if (current) {
          current.body.push(block);
        }
      }
      if (current) chains.push(current);
      return chains;
    }

    // Execute a block on a sprite
    function execBlock(block, sprite) {
      const p = block.params || {};
      switch (block.type) {
        case 'sprite-move': sprite.x += parseFloat(p.steps) || 0; break;
        case 'sprite-changex': sprite.x += parseFloat(p.amount) || 0; break;
        case 'sprite-changey': sprite.y += parseFloat(p.amount) || 0; break;
        case 'sprite-goto': sprite.x = parseFloat(p.x) || 0; sprite.y = parseFloat(p.y) || 0; break;
        case 'sprite-turn': sprite.rotation = (sprite.rotation || 0) + (parseFloat(p.degrees) || 0); break;
        case 'sprite-setsize': {
          const pct = (parseFloat(p.size) || 100) / 100;
          const tpl = findSpriteTemplate(sprite.svgKey);
          sprite.w = Math.round((tpl?.defaultW || 48) * pct);
          sprite.h = Math.round((tpl?.defaultH || 48) * pct);
          break;
        }
        case 'sprite-show': sprite.visible = true; break;
        case 'sprite-hide': sprite.visible = false; break;
        case 'sprite-say':
          sprite._sayText = (p.text || '').replace(/"/g, '');
          sprite._sayUntil = Date.now() + (parseFloat(p.secs) || 2) * 1000;
          break;
        case 'var-create':
        case 'var-set': vars[p.name] = parseFloat(p.value) || 0; break;
        case 'var-change': vars[p.name] = (vars[p.name] || 0) + (parseFloat(p.amount) || 0); break;
        case 'action-print': sprite._sayText = (p.message || '').replace(/"/g, ''); sprite._sayUntil = Date.now() + 2000; break;
        default: break;
      }

      // Keep sprite in bounds
      sprite.x = Math.max(0, Math.min(STAGE_W - sprite.w, sprite.x));
      sprite.y = Math.max(0, Math.min(STAGE_H - sprite.h, sprite.y));
    }

    function execBody(body, sprite) {
      for (let i = 0; i < body.length; i++) {
        const blk = body[i];
        if (blk.type === "loop-repeat") {
          const times = Math.min(parseInt(blk.params && blk.params.times) || 1, 200);
          const rest = body.slice(i + 1);
          for (let t = 0; t < times; t++) rest.forEach(function(b) { execBlock(b, sprite); });
          return;
        }
        execBlock(blk, sprite);
      }
    }

    // Pre-build chains for runtime
    const spriteChains = playSpritesRef.current.map(s => ({
      sprite: s,
      chains: buildScriptChains(s.blocks),
    }));

    // Run "event-start" chains once
    spriteChains.forEach(({ sprite, chains }) => {
      chains.filter(c => c.trigger.type === 'event-start').forEach(chain => {
        execBody(chain.body, sprite);
      });
    });

    let running = true;
    const loop = () => {
      if (!running) return;
      const ps = playSpritesRef.current;

      // Process keypress scripts
      spriteChains.forEach(({ sprite, chains }) => {
        chains.filter(c => c.trigger.type === 'event-keypress').forEach(chain => {
          const triggerKey = chain.trigger.params?.key || '';
          if (keys[triggerKey]) {
            execBody(chain.body, sprite);
          }
        });
      });

      // Collision detection: check all pairs
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i], b = ps[j];
          if (!a.visible || !b.visible) continue;
          if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) {
            [a, b].forEach(function(sprite) {
              var other = sprite === a ? b : a;
              var sc = spriteChains.find(function(s) { return s.sprite.id === sprite.id; });
              if (!sc) return;
              sc.chains.filter(function(c) { return c.trigger.type === 'event-collision'; }).forEach(function(chain) {
                var withName = ((chain.trigger.params && chain.trigger.params.with) || 'any').toLowerCase();
                if (withName === 'any' || other.name.toLowerCase() === withName) execBody(chain.body, sprite);
              });
            });
          }
        }
      }

      draw(ps);
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, sprites, draw]);

  /* ─── Canvas interaction ─── */
  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (STAGE_W / rect.width), y: (e.clientY - rect.top) * (STAGE_H / rect.height) };
  };

  const handleCanvasMouseDown = (e) => {
    if (isPlaying) {
      const { x, y } = getCanvasPos(e);
      const ps = playSpritesRef.current;
      const clicked = [...ps].reverse().find(s => s.visible !== false && x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);
      if (clicked) {
        const body = [];
        let capturing = false;
        for (const b of clicked.blocks) {
          if (b.type === 'event-click') { capturing = true; continue; }
          if (capturing) { if (b.type.startsWith('event-')) break; body.push(b); }
        }
        const vars = {};
        body.forEach(b => { const p = b.params || {};
          switch(b.type) {
            case 'sprite-move': clicked.x += parseFloat(p.steps)||0; break;
            case 'sprite-changex': clicked.x += parseFloat(p.amount)||0; break;
            case 'sprite-changey': clicked.y += parseFloat(p.amount)||0; break;
            case 'sprite-show': clicked.visible = true; break;
            case 'sprite-hide': clicked.visible = false; break;
            case 'sprite-say': clicked._sayText=(p.text||'').replace(/"/g,''); clicked._sayUntil=Date.now()+(parseFloat(p.secs)||2)*1000; break;
            case 'action-print': clicked._sayText=(p.message||'').replace(/"/g,''); clicked._sayUntil=Date.now()+2000; break;
            default: break;
          }
          clicked.x = Math.max(0, Math.min(STAGE_W - clicked.w, clicked.x));
          clicked.y = Math.max(0, Math.min(STAGE_H - clicked.h, clicked.y));
        });
      }
      return;
    }
    const { x, y } = getCanvasPos(e);
    const clicked = [...sprites].reverse().find(s => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);
    if (clicked) {
      setSelected(clicked.id);
      setDraggingSprite(clicked.id);
      setDragOffset({ x: x - clicked.x, y: y - clicked.y });
    } else {
      setSelected(null);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!draggingSprite || isPlaying) return;
    const { x, y } = getCanvasPos(e);
    setSprites(prev => prev.map(s => s.id === draggingSprite ? {
      ...s,
      x: Math.max(0, Math.min(STAGE_W - s.w, x - dragOffset.x)),
      y: Math.max(0, Math.min(STAGE_H - s.h, y - dragOffset.y)),
    } : s));
  };

  const handleCanvasMouseUp = () => { setDraggingSprite(null); };

  /* ─── Sprite management ─── */
  const addSprite = (template, cat) => {
    const newSprite = {
      id: Date.now(), name: template.name, svgKey: template.name, category: cat,
      x: STAGE_W / 2 - 24, y: STAGE_H / 2 - 24,
      w: template.defaultW || 48, h: template.defaultH || 48,
      rotation: 0, visible: true, color: null, layer: 1,
      blocks: [],
    };
    imgCacheRef.current = {};
    setSprites(prev => [...prev, newSprite]);
    setSelected(newSprite.id);
    setShowLibrary(false);
  };

  const deleteSprite = (id) => {
    setSprites(prev => prev.filter(s => s.id !== id));
    if (selected === id) setSelected(sprites.length > 1 ? sprites.find(s => s.id !== id)?.id : null);
  };

  const handleSpriteUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const name = file.name.replace(/\.[^.]+$/, '').slice(0, 16) || 'Custom';
      const newSprite = {
        id: Date.now(), name, svgKey: null, category: 'Custom',
        customImage: dataUrl,
        x: STAGE_W / 2 - 24, y: STAGE_H / 2 - 24,
        w: 48, h: 48, rotation: 0, visible: true, color: null, layer: 1,
        blocks: [],
      };
      imgCacheRef.current = {};
      setSprites(prev => [...prev, newSprite]);
      setSelected(newSprite.id);
      setShowLibrary(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const name = file.name.replace(/\.[^.]+$/, '').slice(0, 16) || 'Custom BG';
      setCustomBackgrounds(prev => [...prev, { name, dataUrl }]);
      setBackground(name);
      imgCacheRef.current = {};
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /* ─── Block editing for selected sprite ─── */
  const STACK_X = 30;
  const STACK_START_Y = 20;
  const STACK_GAP = 56;
  const normalizeStack = (blocks) =>
    [...blocks]
      .sort((a, b) => a.y - b.y)
      .map((b, i) => ({ ...b, x: STACK_X, y: STACK_START_Y + (i * STACK_GAP) }));
  const reorderStackForDrop = (blocks, movingId) => {
    const moving = blocks.find(b => b.id === movingId);
    if (!moving) return normalizeStack(blocks);
    const ordered = blocks.filter(b => b.id !== movingId).sort((a, b) => a.y - b.y);
    const rawIndex = Math.round((moving.y - STACK_START_Y) / STACK_GAP);
    const insertIndex = Math.max(0, Math.min(ordered.length, rawIndex));
    ordered.splice(insertIndex, 0, moving);
    return ordered.map((b, i) => ({ ...b, x: STACK_X, y: STACK_START_Y + (i * STACK_GAP) }));
  };

  const handleBlockParamChange = useCallback((blockId, paramKey, value) => {
    setSprites(prev => prev.map(s => {
      if (s.id !== selected) return s;
      return { ...s, blocks: s.blocks.map(b => b.id === blockId ? { ...b, params: { ...b.params, [paramKey]: value } } : b) };
    }));
  }, [selected]);

  const deleteBlock = useCallback((blockId) => {
    setSprites(prev => prev.map(s => {
      if (s.id !== selected) return s;
      return { ...s, blocks: s.blocks.filter(b => b.id !== blockId) };
    }));
  }, [selected]);

  const handleBlockMouseDown = (e, block) => {
    if (e.target.tagName === 'INPUT') return;
    const rect = blockAreaRef.current.getBoundingClientRect();
    setDraggingBlock(block.id);
    setBlockDragOffset({ x: e.clientX - rect.left - block.x, y: e.clientY - rect.top - block.y });
  };

  const handleBlockMouseMove = useCallback((e) => {
    if (!draggingBlock || !blockAreaRef.current) return;
    const rect = blockAreaRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - blockDragOffset.x);
    const y = Math.max(0, e.clientY - rect.top - blockDragOffset.y);
    setSprites(prev => prev.map(s => {
      if (s.id !== selected) return s;
      return { ...s, blocks: s.blocks.map(b => b.id === draggingBlock ? { ...b, x, y } : b) };
    }));
  }, [draggingBlock, blockDragOffset, selected]);

  const handleBlockMouseUp = useCallback(() => {
    if (!draggingBlock) return;
    setSprites(prev => prev.map(s => {
      if (s.id !== selected) return s;
      const moving = s.blocks.find(b => b.id === draggingBlock);
      if (!moving) return s;
      const snap = s.blocks
        .filter(b => b.id !== draggingBlock)
        .map(b => ({
          block: b,
          dx: Math.abs(b.x - moving.x),
          dy: Math.abs((b.y + STACK_GAP) - moving.y),
        }))
        .filter(t => t.dx <= 80 && t.dy <= 50)
        .sort((a, b) => (a.dx + a.dy) - (b.dx + b.dy))[0]?.block;
      if (!snap) return s;
      return {
        ...s,
        blocks: s.blocks.map(b =>
          b.id === draggingBlock ? { ...b, x: snap.x, y: snap.y + STACK_GAP } : b
        ),
      };
    }));
    setDraggingBlock(null);
  }, [draggingBlock, selected]);

  const handleBlockDrop = (e) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    if (!text || !blockAreaRef.current) return;
    const newBlock = createBlockFromDrop(text, 30, 20);
    setSprites(prev => prev.map(s => {
      if (s.id !== selected) return s;
      const lastBlock = s.blocks.length ? [...s.blocks].sort((a, b) => b.y - a.y)[0] : null;
      const x = lastBlock ? lastBlock.x : STACK_X;
      const y = lastBlock ? lastBlock.y + STACK_GAP : STACK_START_Y;
      return { ...s, blocks: [...s.blocks, { ...newBlock, x, y }] };
    }));
  };

  /* ═══ Render ═══ */
  const submitToAssignment = async () => {
    if (!pendingAssignment) return;
    const ok = await saveSubmissionToFirestore(pendingAssignment.id, user?.email || user?.name || 'student', {
      sprites,
      background,
      studentId: user?.email || user?.name,
      studentName: user?.name,
      classId: pendingAssignment.classId,
      assignType: 'blocks',
    });
    if (ok) {
      sessionStorage.removeItem('bb-pending-assignment');
      setSubmitFlash(true);
      setTimeout(() => setSubmitFlash(false), 3000);
    } else {
      alert('Submission failed — please check your connection and try again.');
    }
  };

  return (
    <div className="workspace-page" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Assignment submit banner */}
      {pendingAssignment && (
        <div style={{ background: submitFlash ? '#16a34a' : '#4f46e5', color: '#fff', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>📋 Assignment: {pendingAssignment.title}</span>
          <button
            onClick={submitToAssignment}
            style={{ marginLeft: 'auto', background: submitFlash ? '#15803d' : '#ffffff33', border: '1px solid #ffffff55', color: '#fff', borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            {submitFlash ? '✅ Submitted!' : '📤 Submit Project'}
          </button>
          <button onClick={() => { sessionStorage.removeItem('bb-pending-assignment'); window.location.hash = 'classroom'; }}
            style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.7, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
      )}
      {/* Teacher viewing student project banner */}
      {viewingSubmission && (
        <div style={{ background: '#0f766e', color: '#fff', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>👁️ Viewing: {viewingSubmission.studentName}'s project — {viewingSubmission.assignmentTitle}</span>
          <button onClick={() => { sessionStorage.removeItem('bb-viewing-submission'); window.location.hash = 'dashboard'; }}
            style={{ marginLeft: 'auto', background: '#ffffff33', border: '1px solid #ffffff55', color: '#fff', borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            ← Back to Dashboard
          </button>
        </div>
      )}
      {/* Toolbar */}
      <div className="workspace-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>🎮 Game Builder</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          {isPlaying && <span className="tag tag-warning" style={{ fontSize: 12 }}>Score: {score}</span>}
          <button
            onClick={saveProject}
            style={{ background: savedFlash ? '#22c55e' : '#334155', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.3s', minWidth: 80 }}
          >
            {savedFlash ? '✓ Saved!' : '💾 Save'}
          </button>
          <button onClick={exportGame} disabled={exporting} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', minWidth: 90, opacity: exporting ? 0.7 : 1 }}>
            📤 Export
          </button>
          <button
            className={`btn btn-sm ${isPlaying ? 'btn-danger' : 'btn-success'}`}
            onClick={() => { setIsPlaying(!isPlaying); setScore(0); imgCacheRef.current = {}; }}
          >
            {isPlaying ? '⏹ Stop' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* Main content: Block area (left) + Stage/Sprites (right) */}
      <div className="panel-container" style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* ════════ LEFT: Block Coding Area ════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, borderRight: '1px solid var(--border-color)' }}>
          {/* Sprite name tab bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
            background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)',
            fontSize: 12, fontWeight: 600,
          }}>
            <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>Coding for:</span>
            {selectedSprite ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'var(--accent-primary)22', padding: '3px 10px', borderRadius: 6,
                border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)',
              }}>
                <SpriteThumb svgKey={selectedSprite.svgKey} color={selectedSprite.color} size={18} />
                {selectedSprite.name}
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Select a sprite</span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>
              Drag blocks from sidebar →
            </span>
          </div>

          {/* Block canvas */}
          <div
            ref={blockAreaRef}
            style={{
              flex: 1, position: 'relative', overflow: 'auto',
              background: 'var(--bg-primary)',
              backgroundImage: 'radial-gradient(circle, var(--border-color) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              cursor: draggingBlock ? 'grabbing' : 'default',
              minHeight: 0,
            }}
            onMouseMove={handleBlockMouseMove}
            onMouseUp={handleBlockMouseUp}
            onMouseLeave={handleBlockMouseUp}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleBlockDrop}
          >
            {selectedSprite && selectedSprite.blocks.map(block => {
              return (
              <div
                key={block.id}
                className="block"
                data-category={block.category}
                onMouseDown={(e) => handleBlockMouseDown(e, block)}
                onMouseEnter={() => setHoveredBlock(block.id)}
                onMouseLeave={() => setHoveredBlock(null)}
                style={{
                  position: 'absolute',
                  left: block.x,
                  top: block.y,
                  transform: draggingBlock === block.id ? 'scale(1.05)' : 'scale(1)',
                  transition: draggingBlock === block.id ? 'none' : 'transform 0.15s, box-shadow 0.15s',
                  zIndex: draggingBlock === block.id ? 100 : 1,
                }}
              >
                <BlockContent block={block} onParamChange={handleBlockParamChange} />

                {/* Delete button */}
                <button
                  onMouseDown={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                  style={{
                    position: 'absolute', top: 3, right: 3,
                    width: 20, height: 20, borderRadius: '50%', border: 'none',
                    background: hoveredBlock === block.id ? '#ef4444' : 'transparent',
                    color: hoveredBlock === block.id ? '#fff' : 'transparent',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s', lineHeight: 1, padding: 0,
                  }}
                  title="Delete block"
                >×</button>

              </div>
            );
            })}

            {(!selectedSprite || (selectedSprite.blocks || []).length === 0) && (
              <div className="empty-state" style={{ height: '100%', pointerEvents: 'none' }}>
                <div className="empty-state-icon">🧩</div>
                <h3>{selectedSprite ? 'Drag blocks here to code this sprite' : 'Select a sprite first'}</h3>
                <p>{selectedSprite ? 'Use the sidebar to pick event, motion, and logic blocks' : 'Click a sprite below the stage to select it'}</p>
              </div>
            )}
          </div>
        </div>

        {/* ════════ RIGHT: Stage + Sprite Pane ════════ */}
        <div style={{ width: 380, display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', flexShrink: 0 }}>

          {/* Stage */}
          <div ref={stageFsRef} style={{
            padding: stageFs ? 0 : 8,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            ...(stageFs ? { background: '#0d0b1e', width: '100vw', height: '100vh' } : {}),
          }}>
            {/* Fullscreen toggle */}
            <button
              onClick={toggleStageFs}
              title={stageFs ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
              style={{
                position: 'absolute', top: stageFs ? 16 : 8, right: stageFs ? 16 : 8, zIndex: 20,
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                fontSize: 15, lineHeight: 1, backdropFilter: 'blur(4px)',
              }}
            >{stageFs ? '✕ Exit' : '⛶'}</button>

            {/* Fullscreen play/stop controls */}
            {stageFs && (
              <div style={{
                position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
                zIndex: 20, display: 'flex', gap: 12, alignItems: 'center',
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                borderRadius: 40, padding: '8px 20px',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              }}>
                {/* Play / Stop */}
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  title={isPlaying ? 'Stop' : 'Play'}
                  style={{
                    width: 52, height: 52, borderRadius: '50%', border: 'none',
                    background: isPlaying
                      ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
                      : 'linear-gradient(135deg,#22c55e,#16a34a)',
                    color: '#fff', fontSize: 22, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isPlaying
                      ? '0 0 20px rgba(239,68,68,0.5)'
                      : '0 0 20px rgba(34,197,94,0.5)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isPlaying ? '⏹' : '▶'}
                </button>
                {/* Reset */}
                <button
                  onClick={() => { setIsPlaying(false); setScore(0); setSprites(prev => prev.map(s => ({ ...s, x: s._startX ?? s.x, y: s._startY ?? s.y }))); }}
                  title="Reset"
                  style={{
                    width: 40, height: 40, borderRadius: '50%', border: 'none',
                    background: 'rgba(255,255,255,0.12)', color: '#fff',
                    fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >↺</button>
                {/* Score display */}
                {isPlaying && (
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, minWidth: 70, textAlign: 'center' }}>
                    Score: {score}
                  </span>
                )}
              </div>
            )}
            <canvas
              ref={canvasRef}
              width={STAGE_W}
              height={STAGE_H}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              style={{
                borderRadius: stageFs ? 0 : 8,
                border: stageFs ? 'none' : '2px solid var(--border-color)',
                cursor: draggingSprite ? 'grabbing' : 'default',
                width: stageFs ? '100%' : '100%',
                height: stageFs ? '100%' : 'auto',
                maxWidth: stageFs ? '100%' : 360,
                display: 'block',
                boxShadow: stageFs ? 'none' : 'var(--shadow-md)',
              }}
            />
          </div>

          {/* ─── Sprite Pane (like Scratch's bottom-right) ─── */}
          <div style={{
            flex: 1, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
            minHeight: 0,
          }}>
            {/* Pane header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Sprites
              </span>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginLeft: 'auto', padding: '3px 8px', fontSize: 11 }}
                onClick={() => setShowLibrary(true)}
              >
                ➕ Add
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '3px 8px', fontSize: 11 }}
                onClick={() => setShowBgPicker(!showBgPicker)}
              >
                🖼 Backdrop
              </button>
            </div>

            {/* Backdrop picker */}
            {showBgPicker && (
              <div style={{
                display: 'flex', gap: 4, padding: '6px 8px', flexWrap: 'wrap',
                borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)',
              }}>
                {BACKGROUNDS.map(bg => (
                  <button key={bg.name} onClick={() => { setBackground(bg.name); imgCacheRef.current = {}; }}
                    style={{
                      padding: '3px 8px', borderRadius: 4, border: background === bg.name ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: background === bg.name ? 'var(--accent-primary)22' : 'var(--bg-input)',
                      color: 'var(--text-primary)', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    }}
                  >{bg.name}</button>
                ))}
                {customBackgrounds.map(bg => (
                  <button key={bg.name} onClick={() => { setBackground(bg.name); imgCacheRef.current = {}; }}
                    style={{
                      padding: '3px 8px', borderRadius: 4, border: background === bg.name ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: background === bg.name ? 'var(--accent-primary)22' : 'var(--bg-input)',
                      color: 'var(--text-primary)', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    }}
                  >📷 {bg.name}</button>
                ))}
                <button onClick={() => bgUploadRef.current?.click()}
                  style={{
                    padding: '3px 8px', borderRadius: 4, border: '1px dashed var(--accent-primary)',
                    background: 'transparent', color: 'var(--accent-primary)', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  }}
                >⬆ Upload</button>
                <input ref={bgUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
              </div>
            )}

            {/* Sprite thumbnails */}
            <div style={{ flex: 1, overflow: 'auto', padding: 6, display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start' }}>
              {sprites.map(s => (
                <div
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  style={{
                    width: 72, height: 84, borderRadius: 8, cursor: 'pointer',
                    background: selected === s.id ? 'var(--accent-primary)15' : 'var(--bg-primary)',
                    border: selected === s.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 2, position: 'relative', transition: 'all 0.15s',
                  }}
                >
                  <SpriteThumb svgKey={s.svgKey} color={s.color} customImage={s.customImage} size={36} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {s.name}
                  </span>
                  <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>
                    ({Math.round(s.x)}, {Math.round(s.y)})
                  </span>
                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSprite(s.id); }}
                    style={{
                      position: 'absolute', top: 2, right: 2,
                      width: 16, height: 16, borderRadius: '50%', border: 'none',
                      background: 'transparent', color: 'var(--text-muted)', fontSize: 11,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >×</button>
                </div>
              ))}
            </div>

            {/* Selected sprite properties (compact) */}
            {selectedSprite && (
              <div style={{
                padding: '6px 10px', borderTop: '1px solid var(--border-color)',
                display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, flexShrink: 0,
                background: 'var(--bg-primary)',
              }}>
                <SpriteThumb svgKey={selectedSprite.svgKey} color={selectedSprite.color} customImage={selectedSprite.customImage} size={22} />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedSprite.name}</span>
                <label style={{ color: 'var(--text-muted)' }}>x</label>
                <input className="input" type="number" value={Math.round(selectedSprite.x)}
                  onChange={(e) => setSprites(prev => prev.map(s => s.id === selected ? { ...s, x: +e.target.value } : s))}
                  style={{ width: 50, fontSize: 11, padding: '2px 4px' }} />
                <label style={{ color: 'var(--text-muted)' }}>y</label>
                <input className="input" type="number" value={Math.round(selectedSprite.y)}
                  onChange={(e) => setSprites(prev => prev.map(s => s.id === selected ? { ...s, y: +e.target.value } : s))}
                  style={{ width: 50, fontSize: 11, padding: '2px 4px' }} />
                <label style={{ color: 'var(--text-muted)' }}>size</label>
                <input className="input" type="number" value={selectedSprite.w}
                  onChange={(e) => { const v = Math.max(8, +e.target.value); setSprites(prev => prev.map(s => s.id === selected ? { ...s, w: v, h: v } : s)); imgCacheRef.current = {}; }}
                  style={{ width: 40, fontSize: 11, padding: '2px 4px' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Sprite Library Modal ─── */}
      {showLibrary && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLibrary(false); }}>
          <div style={{
            width: 580, maxWidth: '90vw', maxHeight: '80vh', background: 'var(--bg-secondary)',
            borderRadius: 16, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>🎭 Choose a Sprite</span>
              <button onClick={() => setShowLibrary(false)} style={{
                width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--bg-primary)',
                color: 'var(--text-primary)', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>
            <div style={{ display: 'flex', gap: 4, padding: '6px 14px', borderBottom: '1px solid var(--border-color)' }}>
              {SPRITE_LIBRARY.map(cat => (
                <button key={cat.category} onClick={() => setLibCategory(cat.category)}
                  style={{
                    padding: '4px 10px', borderRadius: 16, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: libCategory === cat.category ? 'var(--accent-primary)' : 'var(--bg-primary)',
                    color: libCategory === cat.category ? '#fff' : 'var(--text-primary)',
                  }}>
                  {cat.category}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
              {SPRITE_LIBRARY.find(c => c.category === libCategory)?.items.map(item => (
                <button key={item.name} onClick={() => addSprite(item, libCategory)}
                  style={{
                    padding: 10, borderRadius: 10, border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <SpriteThumb svgKey={item.name} size={48} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                </button>
              ))}
            </div>
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => spriteUploadRef.current?.click()}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
              >⬆ Upload Your Own Sprite</button>
              <input ref={spriteUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSpriteUpload} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
