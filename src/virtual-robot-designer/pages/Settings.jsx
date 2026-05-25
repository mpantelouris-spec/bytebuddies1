import React, { useState, useEffect } from 'react';
import VirtualRobotDB from '../database/virtual-robot-db.js';
import { VRD_CONFIG, VRD_ACHIEVEMENTS } from '../config.js';
import { checkAchievements, computeDesignStats } from '../services/design-service.js';
import { migrateDesign } from '../config.js';

export default function SettingsPage() {
  const [settings, setSettings] = useState(VirtualRobotDB.getSettings());
  const [stats, setStats] = useState(VirtualRobotDB.getStats());

  useEffect(() => {
    const d = VirtualRobotDB.getCurrentDesign();
    if (d) {
      const s = computeDesignStats(migrateDesign(d));
      VirtualRobotDB.recordMaxSpeed(s.speed);
      checkAchievements(s, VirtualRobotDB.getStats()).forEach((id) => VirtualRobotDB.unlockAchievement(id));
    }
    setStats(VirtualRobotDB.getStats());
  }, []);

  const update = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    VirtualRobotDB.saveSettings(next);
  };

  const unlocked = stats.achievements || [];

  return (
    <div>
      <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>⚙️ Settings</h2>
      <p style={{ margin: '0 0 20px', color: 'rgba(240,230,255,0.6)', fontSize: 14 }}>Virtual Robot Designer — no hardware settings here.</p>

      <div className="vrd-grid-2">
        <div className="vrd-card">
          <h3 style={{ margin: '0 0 12px' }}>Your VRD Stats</h3>
          {[
            ['Designs created', stats.designs_created],
            ['Variants generated', stats.variants_generated],
            ['Simulations run', stats.simulations_run],
            ['Designs shared', stats.designs_shared],
            ['Likes received', stats.likes_received],
            ['Max speed achieved', `${stats.max_speed || 0}%`],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(139,0,255,0.15)', fontSize: 14 }}>
              <span style={{ color: 'rgba(240,230,255,0.6)' }}>{label}</span>
              <strong style={{ color: '#00FF41' }}>{val}</strong>
            </div>
          ))}
        </div>

        <div className="vrd-card">
          <h3 style={{ margin: '0 0 12px' }}>Preferences</h3>
          <label className="vrd-toggle"><input type="checkbox" checked={settings.notifications} onChange={(e) => update({ notifications: e.target.checked })} /> Notifications</label>
          <label className="vrd-toggle"><input type="checkbox" checked={settings.showTips} onChange={(e) => update({ showTips: e.target.checked })} /> Show design tips</label>
          <label className="vrd-toggle"><input type="checkbox" checked={settings.particles !== false} onChange={(e) => update({ particles: e.target.checked })} /> Particle effects</label>
          <label className="vrd-toggle"><input type="checkbox" checked={settings.soundEffects !== false} onChange={(e) => update({ soundEffects: e.target.checked })} /> UI sound effects (Tone.js)</label>
          <label className="vrd-toggle"><input type="checkbox" checked={settings.autoSave} onChange={(e) => update({ autoSave: e.target.checked })} /> Auto-save design</label>
          <label className="vrd-field-label">3D Preview Quality</label>
          <select className="vrd-select" style={{ width: '100%', marginBottom: 12 }} value={settings.previewQuality || 'high'} onChange={(e) => update({ previewQuality: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <label className="vrd-field-label">AI variants per generation</label>
          <select className="vrd-select" style={{ width: '100%' }} value={settings.aiVariantCount || 5} onChange={(e) => update({ aiVariantCount: Number(e.target.value) })}>
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>
      </div>

      <div className="vrd-card" style={{ marginTop: 20 }}>
        <h3 style={{ margin: '0 0 12px' }}>🏅 Achievements ({unlocked.length}/{VRD_ACHIEVEMENTS.length})</h3>
        {VRD_ACHIEVEMENTS.map((a) => {
          const done = unlocked.includes(a.id) || (stats[a.stat] || 0) >= a.target;
          return (
            <div key={a.id} className={`vrd-achievement ${done ? '' : 'locked'}`}>
              <span style={{ fontSize: 24 }}>{a.icon}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(240,230,255,0.5)' }}>{a.desc}</div>
              </div>
              {done && <span style={{ marginLeft: 'auto', color: '#00FF41' }}>✓</span>}
            </div>
          );
        })}
      </div>

      <div className="vrd-card" style={{ marginTop: 20 }}>
        <h3 style={{ margin: '0 0 8px' }}>Help</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(240,230,255,0.65)', lineHeight: 1.6 }}>{VRD_CONFIG.tagline}</p>
        <p style={{ margin: '12px 0 0', fontSize: 12, color: 'rgba(240,230,255,0.45)' }}>
          For real micro:bit programming, use <strong>Physical Robot Lab</strong> — completely separate from this app.
        </p>
      </div>
    </div>
  );
}
