import type { ReactNode } from 'react';
import './SplitScreenLayout.css';

export interface SplitScreenLayoutProps {
  /** Left panel — block editor (40%). */
  editor: ReactNode;
  /** Right panel — live 3D simulation (60%). */
  simulation: ReactNode;
  /** Optional className on the root shell. */
  className?: string;
}

/**
 * 40/60 KS2 split-screen shell for the Rainbow Road coding simulator.
 * Layout tokens mirror the Umbrella EdTech design spec (Tailwind-equivalent CSS).
 */
export function SplitScreenLayout({ editor, simulation, className }: SplitScreenLayoutProps) {
  const rootClass = ['split-screen-root', className].filter(Boolean).join(' ');

  return (
    <div className={rootClass} data-testid="split-screen-layout">
      <aside className="split-screen-editor" aria-label="Block coding editor">
        <div className="split-screen-editor-body">{editor}</div>
        <footer className="split-screen-editor-footer">
          <span className="split-screen-footer-brand">Umbrella Education Technology Solutions</span>
          <span className="split-screen-footer-tag">KS2 Block Coding · Rainbow Road Simulator</span>
        </footer>
      </aside>
      <main className="split-screen-simulation" aria-label="3D racing simulation">
        {simulation}
      </main>
    </div>
  );
}

export default SplitScreenLayout;
