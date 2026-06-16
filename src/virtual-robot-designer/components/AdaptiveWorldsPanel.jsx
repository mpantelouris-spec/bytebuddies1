/**
 * AdaptiveWorldsPanel
 *
 * The intelligent "what can my robot do?" sidebar shown inside the simulator.
 * Shows:
 *  - Smart recommendation banner
 *  - Available environments (worlds) for this robot type
 *  - Active mission card with objectives
 *  - Adaptive coding blocks palette
 *  - Expansion tips ("add a drill to unlock mining worlds!")
 */
import React, { useState } from 'react';
import { getAdaptiveWorldForDesign, getExpansionTips } from '../services/world-selector.js';
import '../styles/adaptive-worlds.css';

/* ── Mini sub-components ─────────────────────────────────────────────── */

function RecommendationBanner({ rec, profileId }) {
  return (
    <div className="aw-rec-banner" style={{ '--aw-accent': rec.color }}>
      <div className="aw-rec-icon">{rec.badge.split(' ')[0]}</div>
      <div className="aw-rec-body">
        <strong className="aw-rec-headline">{rec.headline}</strong>
        <p className="aw-rec-detail">{rec.detail}</p>
      </div>
      <span className="aw-rec-badge" style={{ background: rec.color }}>{rec.badge}</span>
    </div>
  );
}

function EnvironmentCard({ env, isActive, onSelect }) {
  return (
    <button
      type="button"
      className={`aw-env-card ${isActive ? 'aw-env-card--active' : ''} ${!env.unlocked ? 'aw-env-card--locked' : ''}`}
      style={{ '--aw-accent': env.color }}
      onClick={() => env.unlocked && onSelect(env.id)}
      title={env.unlocked ? env.desc : 'Add the right parts to unlock this world'}
      aria-pressed={isActive}
    >
      <span className="aw-env-icon">{env.unlocked ? env.icon : '🔒'}</span>
      <div className="aw-env-body">
        <span className="aw-env-label">{env.label}</span>
        <span className="aw-env-desc">{env.unlocked ? env.desc : 'Locked — add parts!'}</span>
      </div>
      {isActive && <span className="aw-env-active-dot" aria-hidden />}
    </button>
  );
}

function MissionCard({ mission, isActive, onSelect }) {
  const stars = ['', '★', '★★', '★★★'][mission.difficulty] || '';
  return (
    <button
      type="button"
      className={`aw-mission-card ${isActive ? 'aw-mission-card--active' : ''}`}
      onClick={() => onSelect(mission.id)}
      aria-pressed={isActive}
    >
      <span className="aw-mission-icon">{mission.icon}</span>
      <div className="aw-mission-body">
        <span className="aw-mission-label">{mission.label}</span>
        <span className="aw-mission-desc">{mission.desc}</span>
      </div>
      <span className="aw-mission-diff" title={`Difficulty: ${mission.difficulty}/3`}>{stars}</span>
    </button>
  );
}

function CodingBlockChip({ block }) {
  return (
    <div className="aw-block-chip" style={{ '--block-color': block.color }} title={block.label}>
      <span className="aw-block-chip-icon">{block.icon}</span>
      <span className="aw-block-chip-label">{block.label}</span>
    </div>
  );
}

function SpecialFeatureRow({ feat }) {
  return (
    <div className="aw-feature-row">
      <span className="aw-feature-icon">{feat.icon}</span>
      <div>
        <strong>{feat.label}</strong>
        <span>{feat.desc}</span>
      </div>
    </div>
  );
}

function ExpansionTip({ tip }) {
  return (
    <div className="aw-tip">
      <span>{tip.icon}</span>
      <p>{tip.text}</p>
    </div>
  );
}

/* ── Section toggle helper ───────────────────────────────────────────── */
function Section({ label, icon, defaultOpen = true, children, count }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="aw-section">
      <button type="button" className="aw-section-head" onClick={() => setOpen((o) => !o)}>
        <span className="aw-section-icon">{icon}</span>
        <span className="aw-section-label">{label}</span>
        {count != null && <span className="aw-section-count">{count}</span>}
        <span className="aw-section-chevron">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="aw-section-body">{children}</div>}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────── */

const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',   icon: '🟢', color: '#22c55e' },
  { id: 'medium', label: 'Medium', icon: '🟡', color: '#f59e0b' },
  { id: 'hard',   label: 'Hard',   icon: '🔴', color: '#ef4444' },
];

export default function AdaptiveWorldsPanel({
  design,
  activeEnvironmentId,
  activeMissionId,
  difficulty = 'easy',
  onSelectEnvironment,
  onSelectMission,
  onRunMission,
  onDifficultyChange,
  running,
  onStop,
}) {
  const worldData = getAdaptiveWorldForDesign(design);
  const tips = getExpansionTips(design);

  const {
    recommendation,
    environments,
    missions,
    codingBlocks,
    codingBlocksByCategory,
    specialFeatures,
  } = worldData;

  const activeEnvId = activeEnvironmentId || worldData.defaultEnvironmentId;
  const activeMsnId = activeMissionId || worldData.defaultMissionId;

  return (
    <div className="aw-panel">

      {/* Sticky run button */}
      <div className="aw-run-dock">
        <button
          type="button"
          className={`aw-run-btn ${running ? 'aw-run-btn--stop' : ''}`}
          onClick={running ? onStop : () => onRunMission?.(activeEnvId, activeMsnId)}
        >
          {running ? '⏹ Stop Mission' : '▶ Launch Mission!'}
        </button>
      </div>

      {/* Difficulty selector */}
      <div className="aw-diff-selector">
        <p className="aw-diff-label">Difficulty</p>
        <div className="aw-diff-btns">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`aw-diff-btn ${difficulty === d.id ? 'aw-diff-btn--active' : ''}`}
              style={{ '--diff-color': d.color }}
              onClick={() => !running && onDifficultyChange?.(d.id)}
              disabled={running}
              title={running ? 'Stop mission to change difficulty' : `Set difficulty to ${d.label}`}
            >
              {d.icon} {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Smart recommendation */}
      <RecommendationBanner rec={recommendation} profileId={worldData.profileId} />

      {/* Environments */}
      <Section label="Worlds" icon="🌍" count={environments.filter((e) => e.unlocked).length}>
        <div className="aw-env-list">
          {environments.map((env) => (
            <EnvironmentCard
              key={env.id}
              env={env}
              isActive={env.id === activeEnvId}
              onSelect={onSelectEnvironment || (() => {})}
            />
          ))}
        </div>
      </Section>

      {/* Missions */}
      <Section label="Missions" icon="🎯" count={missions.length}>
        <div className="aw-mission-list">
          {missions.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              isActive={m.id === activeMsnId}
              onSelect={onSelectMission || (() => {})}
            />
          ))}
        </div>
      </Section>

      {/* Coding blocks */}
      <Section label="My Coding Blocks" icon="🧩" count={codingBlocks.length} defaultOpen={false}>
        <p className="aw-block-subtitle">These blocks are available in Code Studio for this robot:</p>
        {Object.values(codingBlocksByCategory).map((cat) => (
          <div key={cat.id} className="aw-block-category">
            <div className="aw-block-cat-head" style={{ color: cat.color }}>
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </div>
            <div className="aw-block-chips">
              {cat.blocks.map((b) => <CodingBlockChip key={b.id} block={b} />)}
            </div>
          </div>
        ))}
      </Section>

      {/* Special features */}
      {specialFeatures.length > 0 && (
        <Section label="Special Features" icon="⚡" defaultOpen={false}>
          <div className="aw-features-list">
            {specialFeatures.map((f) => <SpecialFeatureRow key={f.label} feat={f} />)}
          </div>
        </Section>
      )}

      {/* Expansion tips */}
      {tips.length > 0 && (
        <div className="aw-tips">
          <p className="aw-tips-head">🔓 Unlock more worlds:</p>
          {tips.map((t) => <ExpansionTip key={t.text} tip={t} />)}
        </div>
      )}
    </div>
  );
}
