/**
 * ByteBuddies Robotics Academy — Invention Workshop (robot-first, kid-friendly).
 */

import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import InventionWorkshop from '../pages/InventionWorkshop.jsx';
import Simulator from '../pages/Simulator.jsx';
import { parseVrdAcademyView, setVrdAcademyHash } from '../utils/vrdNavigation.js';
import { useRobotStore } from '../store/robotStore.js';
import '../styles/invention-workshop.css';
import '../styles/test-arena.css';

const CodeStudio = lazy(() => import('../pages/CodeStudio.jsx'));
const MyCreations = lazy(() => import('../pages/MyCreations.jsx'));
const Gallery = lazy(() => import('../pages/Gallery.jsx'));

function ViewFallback({ label }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: 40 }}>
      Loading {label}…
    </div>
  );
}

export default function AcademyExperience() {
  const [view, setViewState] = useState(() => parseVrdAcademyView());

  const setView = useCallback((next) => {
    setViewState(next);
    setVrdAcademyHash(next);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const sub = parseVrdAcademyView();
      setViewState(sub);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (useRobotStore.getState().simAutoRun) {
      setView('test');
    }
  }, [setView]);

  if (view === 'code') {
    return (
      <Suspense fallback={<ViewFallback label="Code Studio" />}>
        <CodeStudio onGoDesign={() => setView('design')} onGoSimulator={() => setView('test')} />
      </Suspense>
    );
  }
  if (view === 'test') {
    return (
      <Simulator onGoDesign={() => setView('design')} onGoCode={() => setView('code')} />
    );
  }
  if (view === 'creations') {
    return (
      <Suspense fallback={<ViewFallback label="My Creations" />}>
        <MyCreations onGoDesign={() => setView('design')} onGoSimulator={() => setView('test')} />
      </Suspense>
    );
  }
  if (view === 'gallery') {
    return (
      <Suspense fallback={<ViewFallback label="Gallery" />}>
        <Gallery onBack={() => setView('design')} />
      </Suspense>
    );
  }

  return (
    <InventionWorkshop
      onGoCode={() => setView('code')}
      onGoSimulator={() => setView('test')}
      onGoCreations={() => setView('creations')}
      onGoGallery={() => setView('gallery')}
      onBack={() => { window.location.hash = 'dashboard'; }}
    />
  );
}
