import React, { useState, useEffect, useMemo } from 'react';
import VirtualRobotDB from '../database/virtual-robot-db.js';
import { SIM_ROBOTS } from '../simulator/virtualRobotEngine.jsx';
import vrdApi from '../apis/vrd-api.js';
import { migrateDesign } from '../config.js';

const FILTERS = ['all', 'favorites', 'shared'];
const SORTS = [{ id: 'newest', label: 'Newest' }, { id: 'tested', label: 'Most Tested' }, { id: 'name', label: 'Name' }];

export default function MyCreationsPage({ onLoadDesign, onGoDesign, onGoSimulator }) {
  const [designs, setDesigns] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  const refresh = () => {
    setDesigns(VirtualRobotDB.listDesigns());
    setFavorites(VirtualRobotDB.getFavorites());
  };

  useEffect(() => { refresh(); }, []);

  const simCounts = useMemo(() => {
    const runs = VirtualRobotDB.listSimulationRuns();
    const map = {};
    runs.forEach((r) => { map[r.design_id] = (map[r.design_id] || 0) + 1; });
    return map;
  }, [designs]);

  const filtered = useMemo(() => {
    let list = [...designs];
    if (filter === 'favorites') list = list.filter((d) => favorites.includes(d.id));
    if (filter === 'shared') list = list.filter((d) => d.is_public);
    if (sort === 'newest') list.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
    if (sort === 'tested') list.sort((a, b) => (simCounts[b.id] || 0) - (simCounts[a.id] || 0));
    if (sort === 'name') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  }, [designs, filter, sort, favorites, simCounts]);

  const handleLoad = (d) => {
    onLoadDesign?.(migrateDesign(d));
    onGoDesign?.();
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>📁 My Creations</h2>
      <p style={{ margin: '0 0 16px', color: 'rgba(240,230,255,0.6)', fontSize: 14 }}>Your designs, variants, and favorites.</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {FILTERS.map((f) => (
          <button key={f} type="button" className={`vrd-nav-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'favorites' ? 'Favorites' : 'Shared'}
          </button>
        ))}
        {SORTS.map((s) => (
          <button key={s.id} type="button" className={`vrd-nav-btn ${sort === s.id ? 'active' : ''}`} onClick={() => setSort(s.id)}>{s.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="vrd-card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 56 }}>🤖</div>
          <p style={{ color: 'rgba(240,230,255,0.6)' }}>No designs yet. Create something amazing!</p>
          <button type="button" className="vrd-btn vrd-btn-primary" style={{ marginTop: 16 }} onClick={onGoDesign}>🎨 Start Designing</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((d) => {
            const meta = SIM_ROBOTS.find((r) => r.id === d.template) || SIM_ROBOTS[0];
            const tests = simCounts[d.id] || d.test_runs || 0;
            return (
              <div key={d.id} className="vrd-card vrd-creation-card">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 40 }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(240,230,255,0.5)', marginTop: 4 }}>{d.description || meta.desc}</div>
                    <div style={{ fontSize: 11, color: 'rgba(240,230,255,0.4)', marginTop: 6 }}>
                      Created {new Date(d.created_date).toLocaleDateString()} · {tests} test runs
                    </div>
                    {d.is_public && <span style={{ fontSize: 10, color: '#00FF41', fontWeight: 700 }}>🌍 Public</span>}
                  </div>
                  <button type="button" style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
                    onClick={() => { VirtualRobotDB.toggleFavorite(d.id); refresh(); }}>
                    {favorites.includes(d.id) ? '⭐' : '☆'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                  <button type="button" className="vrd-btn vrd-btn-primary" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => handleLoad(d)}>Load</button>
                  <button type="button" className="vrd-btn vrd-btn-secondary" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => { handleLoad(d); onGoSimulator?.(); }}>Test</button>
                  {!d.is_public && (
                    <button type="button" className="vrd-btn" style={{ fontSize: 11, padding: '6px 12px', background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }}
                      onClick={() => { vrdApi.shareDesign(d.id); refresh(); }}>Share</button>
                  )}
                  <button type="button" className="vrd-btn" style={{ fontSize: 11, padding: '6px 12px', background: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                    onClick={() => { if (window.confirm('Delete?')) { VirtualRobotDB.deleteDesign(d.id); refresh(); } }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
