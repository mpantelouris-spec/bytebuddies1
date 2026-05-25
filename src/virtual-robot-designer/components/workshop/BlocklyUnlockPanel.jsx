/**
 * Shows which coding blocks are unlocked by parts on the robot — kid-friendly.
 */
import React from 'react';
import { getBlocklyUnlockReport } from '../../services/block-unlocks.js';

export default function BlocklyUnlockPanel({ design, onGoDesign }) {
  const report = getBlocklyUnlockReport(design);

  return (
    <div className="al-unlock-panel">
      <p className="al-unlock-progress">
        {report.unlockedCount} of {report.totalCount} blocks unlocked
      </p>

      {report.mountedParts.length > 0 && (
        <div className="al-unlock-group">
          <h3>🤖 On your robot</h3>
          {report.mountedParts.slice(0, 5).map((p) => (
            <div key={`${p.slot}-${p.label}`} className="al-unlock-item unlocked">
              <span className="al-unlock-icon">{p.icon}</span>
              <div>
                <strong>{p.label}</strong>
                <div className="al-unlock-hint">{p.slot}</div>
              </div>
            </div>
          ))}
          {report.mountedParts.length > 5 && (
            <p className="al-unlock-hint">+{report.mountedParts.length - 5} more parts</p>
          )}
        </div>
      )}

      {report.groups.map((group) => (
        <div key={group.id} className="al-unlock-group">
          <h3>
            {group.icon} {group.label}
          </h3>
          {group.items.slice(0, 6).map((item) => (
            <div key={item.id} className={`al-unlock-item ${item.unlocked ? 'unlocked' : 'locked'}`}>
              <span className="al-unlock-icon">{item.unlocked ? '✓' : '🔒'}</span>
              <div>
                <strong>{item.label}</strong>
                <div className="al-unlock-hint">{item.hint}</div>
              </div>
            </div>
          ))}
          {group.items.length > 6 && (
            <p className="al-unlock-hint">+{group.items.length - 6} more in Blockly</p>
          )}
        </div>
      ))}

      <button type="button" className="al-btn al-btn--primary" style={{ width: '100%', marginTop: 8 }} onClick={onGoDesign}>
        ← Add parts in Lab
      </button>
    </div>
  );
}
