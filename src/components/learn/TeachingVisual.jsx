/**
 * TeachingVisual — the worked-example picture on a lesson slide.
 *
 * Types: blocks · code · steps · compare · table · bars · grid · flow
 * (see src/data/teaching/*.js for the data shapes).
 */
import React from 'react';
import LabBuddy from './CodingLab/LabBuddy.jsx';
import { IconText } from '../ui/Icon.jsx';

const INK = '#0f172a';
const MUTED = '#475569';

// Scratch-style category colours, chosen from the first word of the block.
const CATS = [
  [/^(when|broadcast)/i, '#ffab19', '#cf8b17'],
  [/^(move|turn|go to|glide|point|change x|change y|set x|set y|if on edge)/i, '#4c97ff', '#3373cc'],
  [/^(say|think|switch costume|next costume|show|hide|change size|set size)/i, '#9966ff', '#774dcb'],
  [/^(play sound|stop all sounds|change volume)/i, '#cf63cf', '#bd42bd'],
  [/^(repeat|forever|if|else|wait|end|stop|create clone)/i, '#ffbf00', '#cf9700'],
  [/^(set|change|show variable|hide variable|add|delete|insert|replace)/i, '#ff8c1a', '#db6e00'],
  [/^(pen|erase|stamp)/i, '#0fbd8c', '#0b8e69'],
  [/^(ask|touching|key|distance|answer|timer|reset timer)/i, '#5cb1d6', '#2e8eb8'],
];
function catFor(text) {
  const t = text.trim();
  for (const [re, fill, edge] of CATS) if (re.test(t)) return { fill, edge };
  return { fill: '#59c059', edge: '#389438' };
}

export function BlockStack({ blocks = [], size = 15 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      {blocks.map((line, i) => {
        const depth = (line.match(/^ */)[0].length / 2) | 0;
        const text = line.trim();
        const { fill, edge } = catFor(text);
        const isHat = /^when/i.test(text);
        const isEnd = text === 'end';
        return (
          <div key={i} style={{ marginLeft: depth * 22, display: 'flex' }}>
            <div style={{
              background: fill, color: '#fff', fontWeight: 700, fontSize: size,
              padding: isEnd ? '2px 12px' : '7px 12px', minWidth: isEnd ? 60 : undefined,
              borderRadius: isHat ? '16px 16px 6px 6px' : 6,
              boxShadow: `inset 0 -3px 0 ${edge}`, whiteSpace: 'pre',
              opacity: isEnd ? 0.9 : 1,
            }}>
              <IconText>{isEnd ? ' ' : text.replace(/▶/g, '🏁')}</IconText>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Code({ code }) {
  return (
    <pre style={{
      margin: 0, background: '#0f172a', color: '#e2e8f0', borderRadius: 12, padding: '14px 16px',
      fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: 16, lineHeight: 1.6, overflowX: 'auto',
    }}>
      {code.split('\n').map((ln, i) => (
        <div key={i}><span style={{ color: '#64748b', userSelect: 'none', marginRight: 14 }}>{String(i + 1).padStart(2, ' ')}</span>{highlight(ln)}</div>
      ))}
    </pre>
  );
}

function highlight(line) {
  const parts = line.split(/(#.*$|"[^"]*"|'[^']*'|\b(?:def|for|in|if|elif|else|while|return|and|or|not|True|False|import|print|range|len|input)\b|\b\d+\b)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith('#')) return <span key={i} style={{ color: '#94a3b8', fontStyle: 'italic' }}>{p}</span>;
    if (/^["']/.test(p)) return <span key={i} style={{ color: '#86efac' }}>{p}</span>;
    if (/^\d+$/.test(p)) return <span key={i} style={{ color: '#fdba74' }}>{p}</span>;
    if (/^(print|range|len|input)$/.test(p)) return <span key={i} style={{ color: '#7dd3fc' }}>{p}</span>;
    if (/^(def|for|in|if|elif|else|while|return|and|or|not|True|False|import)$/.test(p)) return <span key={i} style={{ color: '#f0abfc', fontWeight: 700 }}>{p}</span>;
    return p;
  });
}

function Steps({ items, accent }) {
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
      {items.map((s, i) => (
        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#fff', border: '2px solid #e2e8f0', borderRadius: 12, padding: '10px 12px', fontSize: 18 }}>
          <b style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 15 }}>{i + 1}</b>
          <span style={{ paddingTop: 2 }}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Compare({ left, right }) {
  const col = (side, tone) => (
    <div style={{ background: tone.bg, border: `2px solid ${tone.border}`, borderRadius: 14, padding: 14, minWidth: 0 }}>
      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10, color: tone.ink }}>{side.label}</div>
      {side.blocks ? <BlockStack blocks={side.items} size={16} /> : (
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 17, lineHeight: 1.5 }}>
          {side.items.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      )}
    </div>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
      {col(left, { bg: '#fff5f5', border: '#ffc9c9', ink: '#c92a2a' })}
      {col(right, { bg: '#ebfbee', border: '#b2f2bb', ink: '#2b8a3e' })}
    </div>
  );
}

function Table({ head, rows, accent }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 17, border: '2px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <thead>
          <tr>{head.map((h, i) => <th key={i} style={{ background: accent, color: '#fff', textAlign: 'left', padding: '10px 12px' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} style={{ background: ri % 2 ? '#f8fafc' : '#fff' }}>
              {r.map((c, ci) => <td key={ci} style={{ padding: '9px 12px', borderTop: '1px solid #e2e8f0', fontWeight: ci === 0 ? 700 : 400 }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarChart({ data, accent }) {
  const max = Math.max(...data.map((d) => d[1]), 1);
  const top = Math.max(5, Math.ceil(max / 5) * 5);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8 }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 13, color: MUTED, height: 220, textAlign: 'right' }}>
        <span>{top}</span><span>{top / 2}</span><span>0</span>
      </div>
      <div style={{ height: 220, display: 'flex', gap: 10, alignItems: 'flex-end', borderLeft: '2px solid #94a3b8', borderBottom: '2px solid #94a3b8', padding: '0 10px',
        backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '100% 50%' }}>
        {data.map(([label, v]) => (
          <div key={label} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
            <b style={{ fontSize: 14, marginBottom: 2 }}>{v}</b>
            <div style={{ width: '72%', height: `${(v / top) * 100}%`, background: accent, borderRadius: '6px 6px 0 0' }} />
          </div>
        ))}
      </div>
      <span />
      <div style={{ display: 'flex', gap: 10, padding: '0 10px' }}>
        {data.map(([label]) => <span key={label} style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>{label}</span>)}
      </div>
    </div>
  );
}

const DIRS = { right: 0, up: -90, left: 180, down: 90 };
function Grid({ cols, rows, start, dir = 'right', path = [], walls = [], program, accent, large }) {
  const cell = Math.min(large ? 76 : 54, Math.floor((large ? 520 : 330) / cols));
  const end = path[path.length - 1] || start;
  const pts = path.map(([c, r]) => `${c * cell + cell / 2},${r * cell + cell / 2}`).join(' ');
  const wallSet = new Set(walls.map(([c, r]) => `${c},${r}`));
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {program && <BlockStack blocks={program} size={16} />}
      <div style={{ position: 'relative', width: cols * cell, height: rows * cell, borderRadius: 10, overflow: 'hidden', border: '3px solid #2b8a3e', flexShrink: 0 }}>
        {Array.from({ length: cols * rows }, (_, n) => {
          const c = n % cols; const r = Math.floor(n / cols);
          return (
            <div key={n} style={{ position: 'absolute', left: c * cell, top: r * cell, width: cell, height: cell,
              background: wallSet.has(`${c},${r}`) ? '#868e96' : (c + r) % 2 ? '#b2f2bb' : '#d3f9d8',
              display: 'grid', placeItems: 'center', fontSize: cell * 0.5 }}>
              <IconText>{wallSet.has(`${c},${r}`) ? '🧱' : ''}</IconText>
            </div>
          );
        })}
        <svg width={cols * cell} height={rows * cell} style={{ position: 'absolute', inset: 0 }}>
          <polyline points={pts} fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 9" />
        </svg>
        <div style={{ position: 'absolute', left: end[0] * cell, top: end[1] * cell, width: cell, height: cell, display: 'grid', placeItems: 'center', fontSize: cell * 0.55 }}>⭐</div>
        <div style={{ position: 'absolute', left: start[0] * cell, top: start[1] * cell, width: cell, height: cell, display: 'grid', placeItems: 'center' }}>
          <LabBuddy size={cell * 0.9} />
          <span style={{ position: 'absolute', right: -2, top: '50%', width: 0, height: 0, transformOrigin: `${-cell / 2 + 2}px 0`,
            transform: `translateY(-50%) rotate(${DIRS[dir] || 0}deg)`, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '9px solid #f59f00' }} />
        </div>
      </div>
    </div>
  );
}

function Flow({ question, yes, no, blocks, accent }) {
  const box = (text, bg, border) => (
    <div style={{ background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '10px 12px', fontSize: 16, fontWeight: 700, textAlign: 'center' }}>{text}</div>
  );
  return (
    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ flex: '1 1 260px', display: 'grid', gap: 10, justifyItems: 'center' }}>
        <div style={{ width: 210, height: 120, display: 'grid', placeItems: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', width: 120, height: 120, background: '#fff9db', border: `3px solid ${accent}`, transform: 'rotate(45deg)', borderRadius: 10 }} />
          <div style={{ position: 'relative', fontWeight: 900, fontSize: 15, textAlign: 'center', maxWidth: 150 }}>{question}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
          <div style={{ display: 'grid', gap: 6 }}><b style={{ color: '#2b8a3e', textAlign: 'center' }}>YES ↓</b>{box(yes, '#ebfbee', '#8ce99a')}</div>
          <div style={{ display: 'grid', gap: 6 }}><b style={{ color: '#c92a2a', textAlign: 'center' }}>NO ↓</b>{box(no, '#fff5f5', '#ffa8a8')}</div>
        </div>
      </div>
      {blocks && <div style={{ flex: '0 1 auto' }}><BlockStack blocks={blocks} size={16} /></div>}
    </div>
  );
}

export default function TeachingVisual({ example, accent = '#0f766e', large = false }) {
  if (!example) return null;
  const e = example;
  let body = null;
  if (e.type === 'blocks') body = <BlockStack blocks={e.blocks} size={large ? 18 : 15} />;
  else if (e.type === 'code') body = <Code code={e.code} />;
  else if (e.type === 'steps') body = <Steps items={e.items} accent={accent} />;
  else if (e.type === 'compare') body = <Compare left={e.left} right={e.right} />;
  else if (e.type === 'table') body = <Table head={e.head} rows={e.rows} accent={accent} />;
  else if (e.type === 'bars') body = <BarChart data={e.data} accent={accent} />;
  else if (e.type === 'grid') body = <Grid {...e} accent={accent} large={large} />;
  else if (e.type === 'flow') body = <Flow {...e} accent={accent} />;
  return (
    <figure style={{ margin: 0, color: INK }}>
      {e.title && <figcaption style={{ fontWeight: 900, fontSize: 19, marginBottom: 12 }}>{e.title}</figcaption>}
      {body}
      {e.caption && <p style={{ margin: '12px 0 0', fontSize: 16, color: MUTED, lineHeight: 1.5 }}>{e.caption}</p>}
    </figure>
  );
}

