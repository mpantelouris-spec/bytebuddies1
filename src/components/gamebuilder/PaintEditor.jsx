import React, { useCallback, useEffect, useRef, useState } from 'react';
import { assetUrl } from '../../utils/assetUrl';
import ColorPicker, { PaintSwatch } from './ColorPicker';
import {
  colorCss, colorFromHex, cropOpaque, eraseRegion, fillRegion, fontCss, FONTS, makePaint,
  opaqueBox, removeBackground, stampPath, STAMPS, rgbToHex,
} from './paintKit';
import './paintEditor.css';
import { EmojiIcon } from '../ui/Icon.jsx';

const DEFAULT_SIZE = 640;

const TOOLS = [
  ['select', 'Select — move, resize, rotate', 'V'],
  ['brush', 'Brush', 'B'],
  ['eraser', 'Eraser', 'E'],
  ['fill', 'Fill (smart edges)', 'F'],
  ['text', 'Text', 'T'],
  ['line', 'Line (Shift = straight)', 'L'],
  ['oval', 'Circle (Shift = perfect)', 'O'],
  ['rect', 'Rectangle (Shift = square)', 'R'],
  ['stamp', 'Shapes — star, heart, bubble…', 'S'],
  ['wand', 'Magic eraser — click a colour to remove it', 'W'],
  ['eyedropper', 'Pick a colour', 'I'],
];

function ToolIcon({ id }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.85, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  switch (id) {
    case 'select': return <svg {...p}><path d="M5 3l5.5 17 2.2-6.3L19 11.5z" /></svg>;
    case 'brush': return <svg {...p}><path d="M14 4l6 6-9 9H5v-6l9-9z" /><path d="M12 6l6 6" /></svg>;
    case 'eraser': return <svg {...p}><path d="M4 16l8-8 6 6-8 8H4v-6z" /><path d="M8 20h12" /></svg>;
    case 'fill': return <svg {...p}><path d="M7 3l8 8-6 6-8-8 6-6z" /><path d="M16 14c2 0 4 1.6 4 3.5S16 22 16 22" /></svg>;
    case 'text': return <svg {...p}><path d="M5 6h14" /><path d="M12 6v14" /><path d="M8 20h8" /></svg>;
    case 'line': return <svg {...p}><path d="M5 19L19 5" /></svg>;
    case 'oval': return <svg {...p}><ellipse cx="12" cy="12" rx="8" ry="6" /></svg>;
    case 'rect': return <svg {...p}><rect x="5" y="6" width="14" height="12" rx="1.5" /></svg>;
    case 'stamp': return <svg {...p}><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z" /></svg>;
    case 'wand': return <svg {...p}><path d="M4 20L15 9" /><path d="M15 9l2-2" /><path d="M18 3v3M21 6h-3M19.5 4.5l-1 1" /></svg>;
    default: return <svg {...p}><path d="M7 14l3-8 3 8" /><circle cx="17" cy="17" r="3" /><path d="M10 14h6" /></svg>;
  }
}

function containDraw(g, img, width, height, margin = 0.16) {
  const iw = img.naturalWidth || img.width || width;
  const ih = img.naturalHeight || img.height || height;
  if (!iw || !ih) return;
  const scale = Math.min((width * (1 - margin * 2)) / iw, (height * (1 - margin * 2)) / ih);
  const dw = iw * scale; const dh = ih * scale;
  g.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
  return { w: dw, h: dh };
}

const DEFAULT_FILL = { mode: 'solid', c1: colorFromHex('#a855f7'), c2: colorFromHex('#ffffff') };
const DEFAULT_LINE = { mode: 'solid', c1: colorFromHex('#111111') };

/**
 * The costume / backdrop paint editor. Bitmap painting with a real Select tool
 * (move, resize, rotate, copy, paste), typed text, smart fill, gradients,
 * shape stamps, mirror drawing and background removal.
 */
export default function PaintEditor({
  sourceKey, sourceImage, onionImage, flipX = false, hue = 0, tilt = 0,
  transparent = true, onChange, name, onRename,
  width = DEFAULT_SIZE, height = DEFAULT_SIZE, nameLabel,
}) {
  // Costumes paint on a square canvas; backdrops use the stage's 4:3 shape
  const W = width;
  const H = height;
  const canvasRef = useRef(null);
  const onionRef = useRef(null);
  const uiRef = useRef(null);
  const wrapRef = useRef(null);
  const [tool, setTool] = useState('brush');
  const [fill, setFill] = useState(DEFAULT_FILL);
  const [line, setLine] = useState(DEFAULT_LINE);
  const [size, setSize] = useState(6);
  const [fillOn, setFillOn] = useState(true);
  const [outlineOn, setOutlineOn] = useState(true);
  const [stampKind, setStampKind] = useState('star');
  const [sides, setSides] = useState(6);
  const [font, setFont] = useState('Rounded');
  const [tolerance, setTolerance] = useState(40);
  const [mirror, setMirror] = useState(false);
  const [onion, setOnion] = useState(false);
  const [grid, setGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(0.7);
  const [panel, setPanel] = useState(null); // 'fill' | 'line' | null
  const [recent, setRecent] = useState([]);
  const [textBox, setTextBoxState] = useState(null); // { x, y, value }
  const textRef = useRef(null); // the open text box, read when committing so it is drawn exactly once
  const setTextBox = (v) => { textRef.current = v; setTextBoxState(v); };
  const [hasSelection, setHasSelection] = useState(false);
  const [pickTarget, setPickTarget] = useState(null);

  // Everything the pointer handlers need, without stale closures
  const S = useRef({}).current;
  Object.assign(S, { tool, fill, line, size, fillOn, outlineOn, stampKind, sides, tolerance, mirror, font, pickTarget });

  const ctx = () => canvasRef.current?.getContext('2d', { willReadFrequently: true });
  const undo = useRef([]);
  const redo = useRef([]);
  const clip = useRef(null);
  const sel = useRef(null); // floating selection { img, cx, cy, w, h, angle }
  const drag = useRef(null);
  const emitTimer = useRef(null);
  const baseRef = useRef(null); // size the loaded costume was drawn at, so edits keep its stage scale

  /* ── Output ── */
  const emit = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !onChange) return;
    clearTimeout(emitTimer.current);
    emitTimer.current = setTimeout(() => {
      const out = transparent ? cropOpaque(c) : { dataUrl: c.toDataURL('image/png'), w: W, h: H };
      onChange(out.dataUrl, { ...out, base: baseRef.current });
    }, 120);
  }, [onChange, transparent]);

  const snapshot = () => {
    const c = canvasRef.current;
    if (!c) return;
    undo.current.push(c.toDataURL('image/png'));
    if (undo.current.length > 40) undo.current.shift();
    redo.current = [];
  };
  const restoreUrl = (url) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const g = ctx();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, W, H);
      g.drawImage(img, 0, 0, W, H);
      emit();
      resolve();
    };
    img.src = url;
  });
  const remember = (c) => setRecent((r) => [c, ...r.filter((x) => colorCss(x) !== colorCss(c))].slice(0, 8));

  /* ── Load the costume ── */
  useEffect(() => {
    sel.current = null;
    setHasSelection(false);
    setTextBox(null);
    undo.current = [];
    redo.current = [];
    const g = ctx();
    if (!g) return;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, H);
    if (!transparent) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); }
    drawUi();
    baseRef.current = null;
    if (!sourceImage) return;
    const img = new Image();
    img.onload = () => {
      g.clearRect(0, 0, W, H);
      if (!transparent) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); }
      if (flipX) { g.save(); g.translate(W, 0); g.scale(-1, 1); }
      // A backdrop fills the whole canvas; a costume sits in the middle with room to draw
      if (transparent) baseRef.current = containDraw(g, img, W, H);
      else { g.drawImage(img, 0, 0, W, H); baseRef.current = { x: 0, y: 0, w: W, h: H }; }
      if (flipX) g.restore();
    };
    img.src = assetUrl(sourceImage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey, transparent, flipX]);

  useEffect(() => {
    const o = onionRef.current;
    if (!o) return;
    const g = o.getContext('2d');
    g.clearRect(0, 0, W, H);
    if (!onion || !onionImage) return;
    const img = new Image();
    img.onload = () => { g.globalAlpha = 0.28; containDraw(g, img, W, H); g.globalAlpha = 1; };
    img.src = assetUrl(onionImage);
  }, [onionImage, onion]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const measure = () => {
      const next = Math.min((el.clientWidth - 24) / W, (el.clientHeight - 24) / H);
      setFit(Number.isFinite(next) && next > 0.15 ? next : 0.5);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const css = Math.max(160, Math.round(W * fit * zoom));
  const cssH = Math.round((css * H) / W);
  const k = W / css; // canvas pixels per screen pixel (handle sizes)

  /* ── Floating selection ── */
  const drawSel = (g, s) => {
    g.save();
    g.translate(s.cx, s.cy);
    g.rotate(s.angle);
    g.drawImage(s.img, -s.w / 2, -s.h / 2, s.w, s.h);
    g.restore();
  };
  const toLocal = (s, p) => {
    const dx = p.x - s.cx; const dy = p.y - s.cy;
    const c = Math.cos(-s.angle); const sn = Math.sin(-s.angle);
    return { x: dx * c - dy * sn, y: dx * sn + dy * c };
  };
  const handlePoints = (s) => {
    const pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => ({ lx: (sx * s.w) / 2, ly: (sy * s.h) / 2, corner: [sx, sy] }));
    pts.push({ lx: 0, ly: -s.h / 2 - 34 * k, rotate: true });
    return pts;
  };
  const hitHandle = (s, p) => {
    const l = toLocal(s, p);
    return handlePoints(s).find((hp) => Math.hypot(l.x - hp.lx, l.y - hp.ly) <= 11 * k) || null;
  };
  const insideSel = (s, p) => { const l = toLocal(s, p); return Math.abs(l.x) <= s.w / 2 && Math.abs(l.y) <= s.h / 2; };

  const commitSel = () => {
    const s = sel.current;
    if (!s) return;
    drawSel(ctx(), s);
    sel.current = null;
    setHasSelection(false);
    drawUi();
    emit();
  };
  const liftRect = (x, y, w, h) => {
    x = Math.max(0, Math.round(x)); y = Math.max(0, Math.round(y));
    w = Math.min(W - x, Math.round(w)); h = Math.min(H - y, Math.round(h));
    if (w < 3 || h < 3) return;
    // Shrink the marquee to the drawing inside it so handles hug the picture
    const probe = document.createElement('canvas');
    probe.width = w; probe.height = h;
    probe.getContext('2d').drawImage(canvasRef.current, x, y, w, h, 0, 0, w, h);
    const box = opaqueBox(probe);
    if (!box) return;
    x += box.x; y += box.y; w = box.w; h = box.h;
    snapshot();
    const img = document.createElement('canvas');
    img.width = w; img.height = h;
    img.getContext('2d').drawImage(canvasRef.current, x, y, w, h, 0, 0, w, h);
    ctx().clearRect(x, y, w, h);
    sel.current = { img, cx: x + w / 2, cy: y + h / 2, w, h, angle: 0 };
    setHasSelection(true);
  };
  const selectAll = () => {
    commitSel();
    const box = opaqueBox(canvasRef.current);
    if (!box) return;
    setTool('select');
    liftRect(box.x, box.y, box.w, box.h);
    drawUi();
  };
  const pasteCanvas = (src) => {
    if (!src) return;
    commitSel();
    snapshot();
    const img = document.createElement('canvas');
    img.width = src.width; img.height = src.height;
    img.getContext('2d').drawImage(src, 0, 0);
    const scale = Math.min(1, (W * 0.8) / img.width, (H * 0.8) / img.height);
    sel.current = { img, cx: W / 2 + 18, cy: H / 2 + 18, w: img.width * scale, h: img.height * scale, angle: 0 };
    setTool('select');
    setHasSelection(true);
    drawUi();
  };
  const copySel = () => {
    const s = sel.current;
    if (!s) return false;
    const c = document.createElement('canvas');
    const bw = Math.max(1, Math.ceil(Math.abs(s.w * Math.cos(s.angle)) + Math.abs(s.h * Math.sin(s.angle))));
    const bh = Math.max(1, Math.ceil(Math.abs(s.w * Math.sin(s.angle)) + Math.abs(s.h * Math.cos(s.angle))));
    c.width = bw; c.height = bh;
    drawSel(c.getContext('2d'), { ...s, cx: bw / 2, cy: bh / 2 });
    clip.current = c;
    return true;
  };
  const deleteSel = () => {
    if (!sel.current) return;
    sel.current = null;
    setHasSelection(false);
    drawUi();
    emit();
  };
  const flipSel = (axis) => {
    const s = sel.current;
    const c = document.createElement('canvas');
    c.width = s.img.width; c.height = s.img.height;
    const g = c.getContext('2d');
    if (axis === 'h') { g.translate(c.width, 0); g.scale(-1, 1); } else { g.translate(0, c.height); g.scale(1, -1); }
    g.drawImage(s.img, 0, 0);
    s.img = c;
    drawUi();
  };

  /* ── Overlay: selection box, previews, mirror line ── */
  function drawUi(preview) {
    const ui = uiRef.current;
    if (!ui) return;
    const g = ui.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, H);
    if (S.mirror && (S.tool === 'brush' || S.tool === 'eraser')) {
      g.save();
      g.setLineDash([6 * k, 6 * k]);
      g.strokeStyle = 'rgba(99,102,241,.55)';
      g.lineWidth = 1.5 * k;
      g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.stroke();
      g.restore();
    }
    if (preview) preview(g);
    const s = sel.current;
    if (s) {
      drawSel(g, s);
      g.save();
      g.translate(s.cx, s.cy);
      g.rotate(s.angle);
      g.strokeStyle = '#6366f1';
      g.lineWidth = 1.5 * k;
      g.setLineDash([5 * k, 4 * k]);
      g.strokeRect(-s.w / 2, -s.h / 2, s.w, s.h);
      g.setLineDash([]);
      g.beginPath(); g.moveTo(0, -s.h / 2); g.lineTo(0, -s.h / 2 - 34 * k); g.stroke();
      handlePoints(s).forEach((hp) => {
        g.beginPath();
        g.arc(hp.lx, hp.ly, (hp.rotate ? 8 : 6.5) * k, 0, Math.PI * 2);
        g.fillStyle = hp.rotate ? '#22c55e' : '#ffffff';
        g.fill();
        g.lineWidth = 2 * k;
        g.strokeStyle = '#6366f1';
        g.stroke();
      });
      g.restore();
    }
  }
  useEffect(() => { drawUi(); }); // keep the overlay in step with zoom / mirror / tool

  /* ── Drawing ── */
  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const t = e.touches?.[0] || e.changedTouches?.[0];
    const cx = t ? t.clientX : e.clientX; const cy = t ? t.clientY : e.clientY;
    return { x: ((cx - r.left) * W) / r.width, y: ((cy - r.top) * H) / r.height };
  };
  const stroke = (g, pts, erase) => {
    g.save();
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.lineWidth = S.size;
    g.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
    g.strokeStyle = erase ? '#000' : colorCss(S.fill.c1);
    // Smooth: curve through the midpoints of the last three points
    const [a, b, c] = pts;
    g.beginPath();
    if (!b) { g.moveTo(a.x, a.y); g.lineTo(a.x + 0.01, a.y); } else if (!c) { g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); } else {
      g.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
      g.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
    }
    g.stroke();
    if (S.mirror) {
      g.beginPath();
      const m = (p) => ({ x: W - p.x, y: p.y });
      if (!b) { g.moveTo(m(a).x, a.y); g.lineTo(m(a).x - 0.01, a.y); } else if (!c) { g.moveTo(m(a).x, a.y); g.lineTo(m(b).x, b.y); } else {
        g.moveTo(W - (a.x + b.x) / 2, (a.y + b.y) / 2);
        g.quadraticCurveTo(W - b.x, b.y, W - (b.x + c.x) / 2, (b.y + c.y) / 2);
      }
      g.stroke();
    }
    g.restore();
  };
  const constrain = (a, b, shift, kind) => {
    if (!shift) return b;
    const dx = b.x - a.x; const dy = b.y - a.y;
    if (kind === 'line') {
      const ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
      const len = Math.hypot(dx, dy);
      return { x: a.x + Math.cos(ang) * len, y: a.y + Math.sin(ang) * len };
    }
    const m = Math.max(Math.abs(dx), Math.abs(dy));
    return { x: a.x + Math.sign(dx || 1) * m, y: a.y + Math.sign(dy || 1) * m };
  };
  const drawShape = (g, kind, a, b) => {
    const x = Math.min(a.x, b.x); const y = Math.min(a.y, b.y);
    const w = Math.abs(b.x - a.x); const h = Math.abs(b.y - a.y);
    g.save();
    g.lineWidth = S.size;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = makePaint(g, S.line, x, y, x + w, y + h);
    g.fillStyle = makePaint(g, S.fill, x, y, x + w, y + h);
    if (kind === 'line') {
      g.strokeStyle = colorCss(S.fill.c1);
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    } else {
      if (kind === 'rect') { g.beginPath(); g.rect(x, y, w, h); } else if (kind === 'oval') {
        g.beginPath(); g.ellipse(x + w / 2, y + h / 2, Math.max(0.5, w / 2), Math.max(0.5, h / 2), 0, 0, Math.PI * 2);
      } else stampPath(g, S.stampKind, x, y, w, h, S.sides);
      if (S.fillOn) g.fill();
      if (S.outlineOn) g.stroke();
    }
    g.restore();
  };

  const down = (e) => {
    if (e.button === 2) return;
    e.preventDefault();
    setPanel(null);
    const p = pos(e);
    const t = S.tool;
    if (S.pickTarget || t === 'eyedropper') {
      const px = ctx().getImageData(Math.round(p.x), Math.round(p.y), 1, 1).data;
      if (px[3] > 8) {
        const c = { ...colorFromHex(rgbToHex(px[0], px[1], px[2])), a: Math.round((px[3] / 255) * 100) / 100 };
        if ((S.pickTarget || 'fill') === 'line') setLine((l) => ({ ...l, c1: c })); else setFill((f) => ({ ...f, c1: c }));
        remember(c);
      }
      setPickTarget(null);
      if (t === 'eyedropper') setTool('brush');
      return;
    }
    if (t === 'select') {
      const s = sel.current;
      if (s) {
        const hnd = hitHandle(s, p);
        if (hnd?.rotate) { drag.current = { mode: 'rotate', start: p, angle0: s.angle, a0: Math.atan2(p.y - s.cy, p.x - s.cx) }; return; }
        if (hnd) { drag.current = { mode: 'scale', corner: hnd.corner, s0: { ...s }, start: p }; return; }
        if (insideSel(s, p)) { drag.current = { mode: 'move', start: p, cx0: s.cx, cy0: s.cy }; return; }
        commitSel();
      }
      drag.current = { mode: 'marquee', start: p, end: p };
      return;
    }
    if (t === 'text') {
      // An open text box commits itself on blur before this click arrives
      setTextBox({ x: p.x, y: p.y, value: '' });
      return;
    }
    if (t === 'fill') {
      snapshot();
      if (fillRegion(ctx(), p.x, p.y, S.fill, S.tolerance)) { remember(S.fill.c1); emit(); }
      return;
    }
    if (t === 'wand') {
      snapshot();
      if (eraseRegion(ctx(), [[p.x, p.y]], S.tolerance)) emit();
      return;
    }
    snapshot();
    if (t === 'brush' || t === 'eraser') {
      drag.current = { mode: 'draw', pts: [p] };
      stroke(ctx(), [p], t === 'eraser');
      if (t === 'brush') remember(S.fill.c1);
      return;
    }
    drag.current = { mode: 'shape', kind: t === 'stamp' ? 'stamp' : t, start: p, end: p };
  };

  const move = (e) => {
    const d = drag.current;
    if (!d) {
      // Show the right cursor over selection handles
      if (S.tool === 'select' && sel.current && canvasRef.current) {
        const p = pos(e);
        const hnd = hitHandle(sel.current, p);
        canvasRef.current.style.cursor = hnd?.rotate ? 'grab' : hnd ? 'nwse-resize' : insideSel(sel.current, p) ? 'move' : 'default';
      }
      return;
    }
    e.preventDefault();
    const p = pos(e);
    if (d.mode === 'draw') {
      d.pts.push(p);
      if (d.pts.length > 3) d.pts.shift();
      stroke(ctx(), d.pts, S.tool === 'eraser');
      return;
    }
    if (d.mode === 'shape') {
      d.end = constrain(d.start, p, e.shiftKey, d.kind);
      drawUi((g) => drawShape(g, d.kind, d.start, d.end));
      return;
    }
    if (d.mode === 'marquee') {
      d.end = p;
      drawUi((g) => {
        g.save();
        g.setLineDash([5 * k, 4 * k]);
        g.strokeStyle = '#6366f1';
        g.lineWidth = 1.5 * k;
        g.fillStyle = 'rgba(99,102,241,.08)';
        const x = Math.min(d.start.x, p.x); const y = Math.min(d.start.y, p.y);
        g.fillRect(x, y, Math.abs(p.x - d.start.x), Math.abs(p.y - d.start.y));
        g.strokeRect(x, y, Math.abs(p.x - d.start.x), Math.abs(p.y - d.start.y));
        g.restore();
      });
      return;
    }
    const s = sel.current;
    if (!s) return;
    if (d.mode === 'move') { s.cx = d.cx0 + p.x - d.start.x; s.cy = d.cy0 + p.y - d.start.y; }
    if (d.mode === 'rotate') {
      let a = d.angle0 + Math.atan2(p.y - s.cy, p.x - s.cx) - d.a0;
      if (e.shiftKey) a = Math.round(a / (Math.PI / 12)) * (Math.PI / 12); // 15° steps
      s.angle = a;
    }
    if (d.mode === 'scale') {
      const s0 = d.s0;
      const l = toLocal(s0, p);
      const [sx, sy] = d.corner;
      // Opposite corner stays put
      const ox = (-sx * s0.w) / 2; const oy = (-sy * s0.h) / 2;
      let nw = Math.max(6, (l.x - ox) * sx);
      let nh = Math.max(6, (l.y - oy) * sy);
      if (e.shiftKey) { const r = Math.max(nw / s0.w, nh / s0.h); nw = s0.w * r; nh = s0.h * r; }
      const mx = ox + (sx * nw) / 2; const my = oy + (sy * nh) / 2;
      const c = Math.cos(s0.angle); const sn = Math.sin(s0.angle);
      s.w = nw; s.h = nh;
      s.cx = s0.cx + mx * c - my * sn;
      s.cy = s0.cy + mx * sn + my * c;
    }
    drawUi();
  };

  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.mode === 'draw') emit();
    if (d.mode === 'shape') {
      if (Math.hypot(d.end.x - d.start.x, d.end.y - d.start.y) > 2) {
        drawShape(ctx(), d.kind, d.start, d.end);
        if (S.fillOn) remember(S.fill.c1);
        emit();
      } else undo.current.pop();
      drawUi();
    }
    if (d.mode === 'marquee') {
      const x = Math.min(d.start.x, d.end.x); const y = Math.min(d.start.y, d.end.y);
      liftRect(x, y, Math.abs(d.end.x - d.start.x), Math.abs(d.end.y - d.start.y));
      drawUi();
    }
  };

  /* ── Text typed on the canvas ── */
  const textSize = Math.max(14, size * 5);
  const commitText = () => {
    const tb = textRef.current;
    setTextBox(null);
    if (!tb || !tb.value.trim()) return;
    snapshot();
    const g = ctx();
    g.save();
    g.font = fontCss(font, textSize);
    g.textBaseline = 'top';
    g.fillStyle = makePaint(g, fill, tb.x, tb.y, tb.x + 200, tb.y + textSize);
    tb.value.split('\n').forEach((ln, i) => {
      if (outlineOn && size > 2) { g.lineWidth = Math.max(2, size / 2); g.strokeStyle = colorCss(line.c1); g.lineJoin = 'round'; g.strokeText(ln, tb.x, tb.y + i * textSize * 1.15); }
      g.fillText(ln, tb.x, tb.y + i * textSize * 1.15);
    });
    g.restore();
    remember(fill.c1);
    emit();
  };

  /* ── Whole-picture actions ── */
  const undoLast = async () => {
    setTextBox(null);
    if (sel.current) { sel.current = null; setHasSelection(false); }
    const url = undo.current.pop();
    if (!url) { drawUi(); return; }
    redo.current.push(canvasRef.current.toDataURL('image/png'));
    await restoreUrl(url);
    drawUi();
  };
  const redoLast = async () => {
    const url = redo.current.pop();
    if (!url) return;
    commitSel();
    undo.current.push(canvasRef.current.toDataURL('image/png'));
    await restoreUrl(url);
  };
  const flipAll = (axis) => {
    if (sel.current) { flipSel(axis); return; }
    snapshot();
    const tmp = document.createElement('canvas');
    tmp.width = W; tmp.height = H;
    const t = tmp.getContext('2d');
    if (axis === 'h') { t.translate(W, 0); t.scale(-1, 1); } else { t.translate(0, H); t.scale(1, -1); }
    t.drawImage(canvasRef.current, 0, 0);
    const g = ctx();
    g.clearRect(0, 0, W, H);
    g.drawImage(tmp, 0, 0);
    emit();
  };
  const clearAll = () => {
    commitSel();
    snapshot();
    const g = ctx();
    g.clearRect(0, 0, W, H);
    if (!transparent) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); }
    emit();
  };
  const autoRemoveBg = () => {
    commitSel();
    snapshot();
    if (removeBackground(ctx(), tolerance)) emit(); else undo.current.pop();
  };

  /* ── Keyboard ── */
  const keyRef = useRef(null);
  keyRef.current = (e) => {
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (!wrapRef.current?.isConnected) return;
    const mod = e.metaKey || e.ctrlKey;
    const key = e.key.toLowerCase();
    if (mod && key === 'z') { e.preventDefault(); if (e.shiftKey) redoLast(); else undoLast(); return; }
    if (mod && key === 'y') { e.preventDefault(); redoLast(); return; }
    if (mod && key === 'a') { e.preventDefault(); selectAll(); return; }
    if (mod && key === 'c') { if (copySel()) e.preventDefault(); return; }
    if (mod && key === 'x') { if (copySel()) { e.preventDefault(); deleteSel(); } return; }
    if (mod && key === 'v') { if (clip.current) { e.preventDefault(); pasteCanvas(clip.current); } return; }
    if (mod && key === 'd') { if (sel.current && copySel()) { e.preventDefault(); commitSel(); pasteCanvas(clip.current); } return; }
    if (sel.current) {
      if (key === 'delete' || key === 'backspace') { e.preventDefault(); deleteSel(); return; }
      if (key === 'enter' || key === 'escape') { e.preventDefault(); commitSel(); return; }
      const step = e.shiftKey ? 10 : 1;
      const nudge = { arrowleft: [-step, 0], arrowright: [step, 0], arrowup: [0, -step], arrowdown: [0, step] }[key];
      if (nudge) { e.preventDefault(); sel.current.cx += nudge[0]; sel.current.cy += nudge[1]; drawUi(); return; }
    }
    if (mod) return;
    const map = { v: 'select', b: 'brush', e: 'eraser', f: 'fill', l: 'line', r: 'rect', o: 'oval', t: 'text', i: 'eyedropper', s: 'stamp', w: 'wand' };
    if (map[key]) chooseTool(map[key]);
  };
  useEffect(() => {
    const onKey = (e) => keyRef.current?.(e);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const chooseTool = (id) => {
    if (id !== 'select') commitSel();
    setTool(id);
    setPanel(null);
  };

  const onWheel = (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(4, +(z * (e.deltaY < 0 ? 1.15 : 1 / 1.15)).toFixed(2))));
  };

  const shapeTool = ['oval', 'rect', 'stamp'].includes(tool);
  const tb = textBox;

  return (
    <div className="gb-paint-dock pe-root">
      <div className="gb-paint-chrome pe-chrome">
        <input className="gb-paint-name" value={name || ''} onChange={(e) => onRename?.(e.target.value)} placeholder={nameLabel || 'Costume name'} />
        <div className="pe-pop-wrap">
          <button type="button" className={panel === 'fill' ? 'gb-prop on' : 'gb-prop'} onClick={() => setPanel(panel === 'fill' ? null : 'fill')}>
            Fill <PaintSwatch fill={fill} />
          </button>
          {panel === 'fill' && <div className="pe-pop"><ColorPicker fill={fill} onChange={setFill} recent={recent} onPickFromCanvas={() => { setPickTarget('fill'); setPanel(null); }} /></div>}
        </div>
        <div className="pe-pop-wrap">
          <button type="button" className={panel === 'line' ? 'gb-prop on' : 'gb-prop'} onClick={() => setPanel(panel === 'line' ? null : 'line')}>
            Outline <PaintSwatch fill={line} />
          </button>
          {panel === 'line' && <div className="pe-pop"><ColorPicker fill={line} onChange={setLine} recent={recent} allowGradient={false} onPickFromCanvas={() => { setPickTarget('line'); setPanel(null); }} /></div>}
        </div>
        <label className="gb-prop gb-prop-thick">
          {tool === 'text' ? 'Size' : 'Thickness'}
          <input type="range" min={1} max={60} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          <b>{size}</b>
        </label>
        {shapeTool && (
          <>
            <button type="button" className={fillOn ? 'gb-prop on' : 'gb-prop'} onClick={() => setFillOn((v) => !v)} title="Fill the shape">◼ Filled</button>
            <button type="button" className={outlineOn ? 'gb-prop on' : 'gb-prop'} onClick={() => setOutlineOn((v) => !v)} title="Draw an outline">◻ Outline</button>
          </>
        )}
        {tool === 'stamp' && (
          <>
            <select className="gb-prop pe-select" value={stampKind} onChange={(e) => setStampKind(e.target.value)}>
              {STAMPS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
            {stampKind === 'polygon' && (
              <label className="gb-prop">Sides <input type="range" min={3} max={12} value={sides} onChange={(e) => setSides(Number(e.target.value))} /><b>{sides}</b></label>
            )}
          </>
        )}
        {tool === 'text' && (
          <select className="gb-prop pe-select" value={font} onChange={(e) => setFont(e.target.value)}>
            {FONTS.map(([f]) => <option key={f} value={f}>{f}</option>)}
          </select>
        )}
        {(tool === 'fill' || tool === 'wand') && (
          <label className="gb-prop" title="How different a colour can be and still count as the same area">
            Tolerance <input type="range" min={0} max={120} value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} /><b>{tolerance}</b>
          </label>
        )}
        {tool === 'wand' && transparent && <button type="button" className="gb-prop" onClick={autoRemoveBg} title="Erase the background around a photo"><EmojiIcon e="🪄" style={{ marginRight: '0.35em' }} />Remove background</button>}
        <span className="gb-chrome-gap" />
        {hasSelection && (
          <span className="pe-sel-actions">
            <button type="button" className="gb-icon-btn" title="Copy (Ctrl+C)" onClick={copySel}>⧉</button>
            <button type="button" className="gb-icon-btn" title="Duplicate (Ctrl+D)" onClick={() => { if (copySel()) { commitSel(); pasteCanvas(clip.current); } }}>⊕</button>
            <button type="button" className="gb-icon-btn" title="Delete selection" onClick={deleteSel}><EmojiIcon e="🗑" /></button>
            <button type="button" className="gb-icon-btn pe-done" title="Done (Enter)" onClick={commitSel}>✓</button>
          </span>
        )}
        <button type="button" className="gb-icon-btn" title="Undo (Ctrl+Z)" onClick={undoLast}>↶</button>
        <button type="button" className="gb-icon-btn" title="Redo (Ctrl+Shift+Z)" onClick={redoLast}>↷</button>
        <button type="button" className="gb-icon-btn" title={hasSelection ? 'Flip selection left-right' : 'Flip left-right'} onClick={() => flipAll('h')}>↔</button>
        <button type="button" className="gb-icon-btn" title={hasSelection ? 'Flip selection up-down' : 'Flip up-down'} onClick={() => flipAll('v')}>↕</button>
        <button type="button" className="gb-icon-btn" title="Clear everything" onClick={clearAll}>⌫</button>
      </div>
      <div className="gb-paint-body">
        <div className="gb-paint-rail">
          {TOOLS.map(([id, label, key]) => (
            <button key={id} type="button" title={`${label} (${key})`} className={tool === id ? 'gb-tool on' : 'gb-tool'} onClick={() => chooseTool(id)}>
              <ToolIcon id={id} />
            </button>
          ))}
          <span className="gb-rail-sep" />
          <button type="button" className={mirror ? 'gb-tool on' : 'gb-tool'} title="Mirror drawing — draw one side, get both" onClick={() => setMirror((v) => !v)}>🪞</button>
          <button type="button" className={onion ? 'gb-tool on' : 'gb-tool'} title="Onion skin — see the costume before this one" onClick={() => setOnion((v) => !v)}>🧅</button>
          <button type="button" className={grid ? 'gb-tool on' : 'gb-tool'} title="Grid" onClick={() => setGrid((v) => !v)}>#</button>
        </div>
        <div className="gb-paint-stage">
          <div ref={wrapRef} className={`gb-paint-canvas-wrap${zoom > 1 ? ' pe-scroll' : ''}`} onWheel={onWheel}>
            <div
              className={`gb-paint-canvas ${transparent ? 'checkered' : ''} ${grid ? 'grid' : ''}`}
              style={{ width: css, height: cssH, filter: hue ? `hue-rotate(${hue}deg)` : undefined, transform: tilt ? `rotate(${tilt}deg)` : undefined }}
            >
              <canvas ref={onionRef} className="gb-onion" width={W} height={H} style={{ width: css, height: cssH }} />
              <canvas
                ref={canvasRef}
                className="pe-main"
                width={W}
                height={H}
                style={{ width: css, height: cssH, cursor: pickTarget || tool === 'eyedropper' ? 'copy' : tool === 'select' ? 'default' : tool === 'text' ? 'text' : 'crosshair' }}
                onMouseDown={down}
                onMouseMove={move}
                onMouseUp={up}
                onMouseLeave={up}
                onTouchStart={down}
                onTouchMove={move}
                onTouchEnd={up}
                onContextMenu={(e) => e.preventDefault()}
              />
              <canvas ref={uiRef} className="pe-ui" width={W} height={H} style={{ width: css, height: cssH }} />
              {tb && (
                <textarea
                  autoFocus
                  className="pe-text"
                  value={tb.value}
                  placeholder="Type…"
                  onChange={(e) => setTextBox({ ...tb, value: e.target.value })}
                  onBlur={commitText}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') { e.preventDefault(); setTextBox(null); }
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitText(); }
                  }}
                  style={{
                    left: tb.x / k, top: tb.y / k,
                    font: fontCss(font, textSize / k),
                    color: colorCss(fill.c1),
                  }}
                />
              )}
            </div>
            {pickTarget && <div className="pe-hint">💧 Click the picture to pick a {pickTarget === 'line' ? 'outline' : 'fill'} colour</div>}
            <div className="gb-zoom-row">
              <button type="button" className="gb-icon-btn" onClick={() => setZoom((z) => Math.max(0.5, +(z / 1.25).toFixed(2)))}>−</button>
              <button type="button" className="pe-zoom-label" title="Back to 100%" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
              <button type="button" className="gb-icon-btn" onClick={() => setZoom((z) => Math.min(4, +(z * 1.25).toFixed(2)))}>+</button>
            </div>
          </div>
          <div className="gb-paint-colors pe-quick">
            {['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#7c2d12'].map((hex) => (
              <button key={hex} type="button" className="gb-paint-swatch" style={{ background: hex }}
                title={`Fill ${hex} (right-click for outline)`}
                onClick={() => setFill((f) => ({ ...f, mode: 'solid', c1: colorFromHex(hex) }))}
                onContextMenu={(e) => { e.preventDefault(); setLine({ mode: 'solid', c1: colorFromHex(hex) }); }} />
            ))}
            {recent.length > 0 && <span className="pe-quick-sep" />}
            {recent.slice(0, 6).map((rc, i) => (
              <button key={`r${i}`} type="button" className="gb-paint-swatch" style={{ background: colorCss(rc) }} title="Recent colour" onClick={() => setFill((f) => ({ ...f, mode: 'solid', c1: rc }))} />
            ))}
            <span className="pe-tip">{TIP[tool]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const TIP = {
  select: 'Drag a box to select · drag handles to resize · green dot rotates · Ctrl+C / Ctrl+V · Delete',
  brush: 'Draw freely · try 🪞 mirror for symmetrical robots',
  eraser: 'Rub out · 🪞 mirror works here too',
  fill: 'Click an area to fill it — smart edges, gradients in Fill',
  text: 'Click where the text goes, type, then Enter',
  line: 'Hold Shift for straight lines',
  oval: 'Hold Shift for a perfect circle',
  rect: 'Hold Shift for a perfect square',
  stamp: 'Pick a shape above, then drag · Shift keeps it even',
  wand: 'Click a colour to remove it · or 🪄 Remove background',
  eyedropper: 'Click the picture to pick its colour',
};
