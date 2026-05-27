/**
 * DevDebugPanel.jsx
 * Hidden developer diagnostics panel for ByteBuddies.
 * 
 * Activate: Click the ByteBuddies logo 5 times, OR press Shift+D
 * Close: Same shortcut, or press Escape
 * 
 * Children NEVER see this. It's for developers only.
 */
import React, { useState, useEffect, useCallback } from 'react';

function JsonTree({ data, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(depth > 1);
  if (data === null || data === undefined) return <span style={{ color: '#ef4444' }}>null</span>;
  if (typeof data === 'boolean') return <span style={{ color: '#f97316' }}>{String(data)}</span>;
  if (typeof data === 'number')  return <span style={{ color: '#60a5fa' }}>{data}</span>;
  if (typeof data === 'string')  return <span style={{ color: '#86efac' }}>"{data}"</span>;
  if (Array.isArray(data)) {
    if (data.length === 0) return <span style={{ color: '#94a3b8' }}>[]</span>;
    return (
      <span>
        <button onClick={() => setCollapsed(c => !c)} style={collapseBtn}>
          {collapsed ? '▶' : '▼'} [{data.length}]
        </button>
        {!collapsed && (
          <div style={{ marginLeft: 16, borderLeft: '1px solid #334155', paddingLeft: 8 }}>
            {data.map((item, i) => (
              <div key={i} style={{ marginBottom: 2 }}>
                <span style={{ color: '#475569' }}>{i}: </span>
                <JsonTree data={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) return <span style={{ color: '#94a3b8' }}>{'{}'}</span>;
    return (
      <span>
        <button onClick={() => setCollapsed(c => !c)} style={collapseBtn}>
          {collapsed ? '▶' : '▼'} {'{'}…{'}'}
        </button>
        {!collapsed && (
          <div style={{ marginLeft: 16, borderLeft: '1px solid #334155', paddingLeft: 8 }}>
            {keys.map(key => (
              <div key={key} style={{ marginBottom: 2 }}>
                <span style={{ color: '#94a3b8' }}>{key}: </span>
                <JsonTree data={data[key]} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }
  return <span style={{ color: '#cbd5e1' }}>{String(data)}</span>;
}

const collapseBtn = {
  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
  fontFamily: 'monospace', fontSize: 11, padding: '1px 4px',
};

const SEV_COLOR = { error: '#ef4444', warning: '#f97316', info: '#60a5fa', ok: '#22c55e' };
const SEV_ICON  = { error: '✕', warning: '⚠', info: 'ℹ', ok: '✓' };

export default function DevDebugPanel({ robotConfig, robotCode, robotValidation, codeValidation, preflight, fps, onClose }) {
  const [tab, setTab] = useState('overview');

  // Keyboard close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const tabs = [
    { id: 'overview',  label: '📊 Overview' },
    { id: 'robot',     label: '🤖 Robot' },
    { id: 'code',      label: '📝 Code' },
    { id: 'validate',  label: '✅ Validation' },
    { id: 'perf',      label: '⚡ Performance' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
      pointerEvents: 'none',
    }}>
      <div style={{
        width: 480, height: '85vh',
        background: '#0f172a',
        borderTop: '1px solid #1e293b',
        borderLeft: '1px solid #1e293b',
        borderTopLeftRadius: 12,
        display: 'flex', flexDirection: 'column',
        pointerEvents: 'all',
        fontFamily: 'monospace',
        fontSize: 11,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px',
          background: '#0f172a',
          borderBottom: '1px solid #1e293b',
          borderTopLeftRadius: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🔧</span>
            <span style={{ color: '#00d9ff', fontWeight: 700, fontSize: 13 }}>ByteBuddies DevTools</span>
            <span style={{
              background: '#7c3aed', color: '#fff',
              fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
            }}>DEV MODE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#475569', fontSize: 10 }}>Esc or Shift+D to close</span>
            <button onClick={onClose} style={{
              background: '#1e293b', border: 'none', color: '#94a3b8',
              borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12,
            }}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: '1px solid #1e293b',
          background: '#0f172a',
          overflowX: 'auto',
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderBottom: `2px solid ${tab === t.id ? '#7c3aed' : 'transparent'}`,
                background: 'transparent',
                color: tab === t.id ? '#fff' : '#64748b',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: tab === t.id ? 700 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>

          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Health grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <StatCard label="Robot Score" value={`${robotValidation?.score ?? '?'}%`}
                  color={robotValidation?.score >= 80 ? '#22c55e' : robotValidation?.score >= 50 ? '#f97316' : '#ef4444'} />
                <StatCard label="FPS" value={fps ? `${fps}` : '—'} color="#60a5fa" />
                <StatCard label="Code Blocks" value={robotCode?.length || 0} color="#a78bfa" />
                <StatCard label="Valid Config" value={robotValidation?.valid ? 'YES' : 'NO'}
                  color={robotValidation?.valid ? '#22c55e' : '#ef4444'} />
              </div>

              {/* Quick issues */}
              <div style={{ color: '#64748b', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Active Issues
              </div>
              {(preflight?.errors?.length === 0 && preflight?.warnings?.length === 0) ? (
                <div style={{ color: '#22c55e', fontSize: 11 }}>✓ No issues detected</div>
              ) : (
                [...(preflight?.errors || []), ...(preflight?.warnings || [])].slice(0, 6).map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 6, padding: '5px 8px',
                    background: '#1e293b', borderRadius: 6, marginBottom: 4,
                    borderLeft: `3px solid ${SEV_COLOR[r.severity]}`,
                  }}>
                    <span style={{ color: SEV_COLOR[r.severity], minWidth: 12 }}>{SEV_ICON[r.severity]}</span>
                    <span style={{ color: '#cbd5e1', lineHeight: 1.4 }}>{r.message}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'robot' && (
            <div>
              <div style={{ color: '#64748b', fontSize: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Robot Config (localStorage: bb-studio-robot)
              </div>
              <div style={{ background: '#1e293b', borderRadius: 8, padding: 10, lineHeight: 1.8 }}>
                <JsonTree data={robotConfig} depth={0} />
              </div>
            </div>
          )}

          {tab === 'code' && (
            <div>
              <div style={{ color: '#64748b', fontSize: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Code Program ({robotCode?.length || 0} blocks, localStorage: bb-studio-code)
              </div>
              {(robotCode || []).map((block, i) => (
                <div key={block.instanceId || i} style={{
                  background: '#1e293b', borderRadius: 6, padding: '6px 10px', marginBottom: 4,
                  borderLeft: `3px solid ${(codeValidation?.invalidBlockIds?.has(block.instanceId) ? '#ef4444' : '#334155')}`,
                }}>
                  <div style={{ color: '#fff', fontWeight: 700 }}>{i + 1}. {block.label}</div>
                  <div style={{ color: '#64748b' }}>
                    id: {block.id} | instanceId: {block.instanceId}
                    {block.paramValues && Object.keys(block.paramValues).length > 0 && (
                      <span> | params: {JSON.stringify(block.paramValues)}</span>
                    )}
                  </div>
                  {codeValidation?.invalidBlockIds?.has(block.instanceId) && (
                    <div style={{ color: '#ef4444', marginTop: 2 }}>⚠ This block has an error</div>
                  )}
                </div>
              ))}
              {(robotCode || []).length === 0 && (
                <div style={{ color: '#475569' }}>No code blocks added</div>
              )}
            </div>
          )}

          {tab === 'validate' && (
            <div>
              <div style={{ color: '#64748b', fontSize: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                All Validation Results
              </div>
              {[...(robotValidation?.results || []), ...(codeValidation?.results || [])].map((r, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, padding: '6px 8px',
                  background: '#1e293b', borderRadius: 6, marginBottom: 4,
                  borderLeft: `3px solid ${SEV_COLOR[r.severity]}`,
                }}>
                  <span style={{ color: SEV_COLOR[r.severity], minWidth: 14, fontSize: 12 }}>{SEV_ICON[r.severity]}</span>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: 9 }}>{r.severity.toUpperCase()} [{r.code}] area:{r.area}</div>
                    <div style={{ color: '#e2e8f0', lineHeight: 1.4 }}>{r.message}</div>
                  </div>
                </div>
              ))}
              {/* Preflight checklist */}
              <div style={{ color: '#64748b', fontSize: 10, marginTop: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Preflight Checklist
              </div>
              {(preflight?.checks || []).map((c, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, alignItems: 'center', padding: '5px 8px',
                  background: '#1e293b', borderRadius: 6, marginBottom: 3,
                }}>
                  <span style={{ color: c.pass ? '#22c55e' : c.warn ? '#f97316' : '#ef4444', minWidth: 14 }}>
                    {c.pass ? '✓' : c.warn ? '⚠' : '✕'}
                  </span>
                  <span style={{ color: '#e2e8f0', flex: 1 }}>{c.label}</span>
                  <span style={{ color: '#64748b', fontSize: 10 }}>{c.detail}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'perf' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <StatCard label="Current FPS" value={fps ?? '—'} color="#60a5fa" />
              <div style={{ color: '#64748b', fontSize: 10, marginTop: 4, lineHeight: 1.6 }}>
                Performance tips:
                <div style={{ color: '#475569', marginTop: 4 }}>
                  • FPS {'>'} 50: Excellent 🟢<br/>
                  • FPS 30-50: Good 🟡<br/>
                  • FPS {'<'} 30: Consider reducing parts 🔴
                </div>
              </div>
              <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 }}>
                Robot Complexity
              </div>
              <div style={{ background: '#1e293b', borderRadius: 8, padding: 10, lineHeight: 1.8 }}>
                <div style={{ color: '#94a3b8' }}>Sensors: <span style={{ color: '#60a5fa' }}>{robotConfig?.sensors?.length || 0}</span></div>
                <div style={{ color: '#94a3b8' }}>Tools: <span style={{ color: '#60a5fa' }}>{robotConfig?.tools?.length || 0}</span></div>
                <div style={{ color: '#94a3b8' }}>Code blocks: <span style={{ color: '#60a5fa' }}>{robotCode?.length || 0}</span></div>
                <div style={{ color: '#94a3b8' }}>Has arm: <span style={{ color: '#60a5fa' }}>{robotConfig?.armId ? 'yes' : 'no'}</span></div>
                <div style={{ color: '#94a3b8' }}>Has lights: <span style={{ color: '#60a5fa' }}>{robotConfig?.lightId ? 'yes' : 'no'}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#1e293b', borderRadius: 8, padding: '10px 12px',
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ color, fontSize: 20, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
