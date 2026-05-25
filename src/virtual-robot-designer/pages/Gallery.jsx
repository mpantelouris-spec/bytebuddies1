import React, { useState, useEffect } from 'react';
import vrdApi from '../apis/vrd-api.js';
import { SIM_ROBOTS } from '../simulator/virtualRobotEngine.jsx';

const FILTERS = [
  { id: 'newest', label: 'Newest' },
  { id: 'liked', label: 'Most Liked' },
  { id: 'trending', label: 'Most Tested' },
];

export default function GalleryPage({ onRemix, onGoSimulator }) {
  const [filter, setFilter] = useState('newest');
  const [designs, setDesigns] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const refresh = async () => setDesigns(await vrdApi.getGallery(filter));
  useEffect(() => { refresh(); }, [filter]);

  const filtered = designs.filter((d) =>
    !search.trim() || (d.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>🌐 Design Gallery</h2>
      <p style={{ margin: '0 0 16px', color: 'rgba(240,230,255,0.6)', fontSize: 14 }}>Browse, like, remix, and test designs from your class.</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={`vrd-nav-btn ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
        <input className="vrd-input" style={{ marginLeft: 'auto', marginBottom: 0, maxWidth: 220 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search designs…" />
      </div>

      {filtered.length === 0 ? (
        <div className="vrd-card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'rgba(240,230,255,0.6)' }}>No public designs yet. Share yours from My Creations!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map((d) => {
            const meta = SIM_ROBOTS.find((r) => r.id === d.template) || SIM_ROBOTS[0];
            return (
              <div key={d.id} className="vrd-card" style={{ cursor: 'pointer' }} onClick={() => setSelected(d)}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{meta.icon}</div>
                <div style={{ fontWeight: 700 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(240,230,255,0.5)' }}>by {d.user_id || 'student'}</div>
                <div style={{ marginTop: 8, fontSize: 12 }}>❤️ {d.likes_count || 0} · 🔄 {d.remixes_count || 0}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="vrd-btn vrd-btn-primary" style={{ fontSize: 11, padding: '6px 10px' }} onClick={() => vrdApi.likeDesign(d.id).then(refresh)}>Like</button>
                  <button type="button" className="vrd-btn vrd-btn-secondary" style={{ fontSize: 11, padding: '6px 10px' }}
                    onClick={async () => { const remix = await vrdApi.remixDesign(d.id); onRemix?.(remix); }}>Remix</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="vrd-modal-overlay" onClick={() => setSelected(null)}>
          <div className="vrd-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selected.name}</h3>
            <p style={{ fontSize: 13, color: 'rgba(240,230,255,0.65)' }}>{selected.description || 'No description'}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="button" className="vrd-btn vrd-btn-secondary" onClick={() => { onRemix?.(selected); setSelected(null); }}>Load / Remix</button>
              <button type="button" className="vrd-btn vrd-btn-primary" onClick={() => { onGoSimulator?.(); setSelected(null); }}>Test in Simulator</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
