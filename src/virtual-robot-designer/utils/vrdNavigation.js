/** Hash routes for Robotics Academy (#vrd, #vrd/test, #vrd/code). */

export function getAppPageFromHash() {
  const raw = (window.location.hash.replace('#', '') || 'dashboard').trim();
  return raw.split('/')[0].split('?')[0] || 'dashboard';
}

export function parseVrdAcademyView() {
  const raw = window.location.hash.replace('#', '').trim();
  const prefix = raw.split('/')[0].split('?')[0];
  if (prefix !== 'vrd' && prefix !== 'academy') return 'design';
  const path = raw.split('?')[0];
  const segment = path.split('/')[1];
  if (segment === 'test' || segment === 'code' || segment === 'design') return segment;
  const params = new URLSearchParams(raw.includes('?') ? raw.split('?').slice(1).join('?') : '');
  const view = params.get('view');
  if (view === 'test' || view === 'code') return view;
  return 'design';
}

export function setVrdAcademyHash(view) {
  const raw = window.location.hash.replace('#', '').trim();
  const prefix = raw.split('/')[0].split('?')[0];
  const base = prefix === 'academy' ? 'academy' : 'vrd';
  const map = { design: base, code: `${base}/code`, test: `${base}/test` };
  const next = map[view] || base;
  if (window.location.hash.replace('#', '') !== next) {
    window.location.hash = next;
  }
}
