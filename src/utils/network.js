/**
 * How fast is this pupil's connection? Used to pick lighter downloads on slow school Wi-Fi.
 * Browsers without the Network Information API (Safari, Firefox) are treated as normal.
 */
export function isSlowConnection() {
  try {
    const c = typeof navigator !== 'undefined' && (navigator.connection || navigator.mozConnection || navigator.webkitConnection);
    if (!c) return false;
    if (c.saveData) return true;
    if (['slow-2g', '2g', '3g'].includes(c.effectiveType)) return true;
    return typeof c.downlink === 'number' && c.downlink > 0 && c.downlink < 3;
  } catch {
    return false;
  }
}
