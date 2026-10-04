const EVENT = 'bb-teacher-lesson-content';

function key(yr, idx) {
  return `bb_teacher_lesson_${yr}_${idx}`;
}

export function emptyTeacherContent() {
  return {
    notes: '',
    showOnBoard: true,
    slides: [],
    tasks: [],
    resources: [],
    homework: '',
  };
}

function clip(str, max) {
  return String(str || '').slice(0, max);
}

export function normalizeTeacherContent(raw) {
  const base = emptyTeacherContent();
  if (!raw || typeof raw !== 'object') return base;
  return {
    notes: clip(raw.notes, 12000),
    showOnBoard: raw.showOnBoard !== false,
    slides: Array.isArray(raw.slides)
      ? raw.slides.slice(0, 20).map((s, i) => ({
        id: String(s?.id || `s${i}`),
        title: clip(s?.title, 120) || `Your slide ${i + 1}`,
        body: clip(s?.body, 4000),
      }))
      : [],
    tasks: Array.isArray(raw.tasks)
      ? raw.tasks.slice(0, 12).map((t, i) => ({
        id: String(t?.id || `t${i}`),
        title: clip(t?.title, 120) || `Your task ${i + 1}`,
        mins: Math.min(60, Math.max(1, Number(t?.mins) || 10)),
        steps: Array.isArray(t?.steps)
          ? t.steps.map((s) => clip(s, 400)).filter(Boolean).slice(0, 12)
          : String(t?.steps || '').split('\n').map((s) => clip(s, 400)).filter(Boolean).slice(0, 12),
      }))
      : [],
    resources: Array.isArray(raw.resources)
      ? raw.resources.map((r) => clip(r, 300)).filter(Boolean).slice(0, 20)
      : String(raw.resources || '').split('\n').map((r) => clip(r, 300)).filter(Boolean).slice(0, 20),
    homework: clip(raw.homework, 2000),
  };
}

export function loadTeacherContent(yr, idx) {
  try {
    const raw = localStorage.getItem(key(yr, idx));
    if (!raw) return emptyTeacherContent();
    return normalizeTeacherContent(JSON.parse(raw));
  } catch {
    return emptyTeacherContent();
  }
}

export function saveTeacherContent(yr, idx, data) {
  const next = normalizeTeacherContent(data);
  try {
    if (!hasMeaningfulContent(next)) localStorage.removeItem(key(yr, idx));
    else localStorage.setItem(key(yr, idx), JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { yr, idx, data: next } }));
  return next;
}

export function hasMeaningfulContent(data) {
  const d = normalizeTeacherContent(data);
  return Boolean(
    d.notes.trim()
    || d.homework.trim()
    || d.slides.some((s) => s.title.trim() || s.body.trim())
    || d.tasks.some((t) => t.title.trim() || t.steps.length)
    || d.resources.length,
  );
}

export function hasTeacherContent(yr, idx) {
  return hasMeaningfulContent(loadTeacherContent(yr, idx));
}

export function newSlide() {
  return { id: `s${Date.now()}`, title: '', body: '' };
}

export function newTask() {
  return { id: `t${Date.now()}`, title: '', mins: 10, steps: [''] };
}

export function subscribeTeacherContent(yr, idx, onChange) {
  function handle(e) {
    if (e.type === 'storage') {
      if (e.key && e.key !== key(yr, idx)) return;
      onChange(loadTeacherContent(yr, idx));
      return;
    }
    if (e.detail?.yr === yr && e.detail?.idx === idx) {
      onChange(e.detail.data || loadTeacherContent(yr, idx));
    }
  }
  window.addEventListener('storage', handle);
  window.addEventListener(EVENT, handle);
  return () => {
    window.removeEventListener('storage', handle);
    window.removeEventListener(EVENT, handle);
  };
}
