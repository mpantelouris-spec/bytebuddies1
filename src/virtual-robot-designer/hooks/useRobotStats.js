import { useMemo } from 'react';
import { computeDesignStats } from '../services/design-service.js';

/** Derived robot stats from current design (memoized) */
export function useRobotStats(design) {
  return useMemo(() => computeDesignStats(design), [design]);
}

export function statBarColor(value, good = 60, warn = 35) {
  if (value >= good) return '#00FF41';
  if (value >= warn) return '#FF8C00';
  return '#ef4444';
}
