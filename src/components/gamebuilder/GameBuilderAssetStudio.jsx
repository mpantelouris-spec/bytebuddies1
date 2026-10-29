import React, { useEffect, useRef, useState } from 'react';
import { applyCostumeToSprite } from '../../utils/looksRuntime';
import {
  defaultCostumesForSprite,
  isLegacyBakedPack,
  isPlaceholderCostumeList,
  loadCostumeDimensions,
  nextSurpriseCostume,
} from '../../utils/spriteCostumePack';
import { playBlockSound } from '../../utils/blockSounds';
import { playSpriteSound } from '../../utils/soundRuntime';
import { SOUND_LIBRARY, nextSurpriseSound } from '../../data/soundLibrary';
import { assetUrl } from '../../utils/assetUrl';
import PaintEditor from './PaintEditor';
import { EmojiIcon, IconText } from '../ui/Icon.jsx';

function uniqueName(base, existing) {
  const names = new Set((existing || []).map((n) => String(n).toLowerCase()));
  let n = String(base || 'item').trim() || 'item';
  if (!names.has(n.toLowerCase())) return n;
  let i = 2;
  while (names.has(`${n}${i}`.toLowerCase()) || names.has(`${n} ${i}`.toLowerCase())) i += 1;
  return `${n} ${i}`;
}

function costumeThumb(c) {
  return c?.customImage || null;
}

async function gifFramesFromFile(file) {
  if (typeof ImageDecoder === 'undefined' || file.type !== 'image/gif') return [];
  try {
    const decoder = new ImageDecoder({ data: await file.arrayBuffer(), type: 'image/gif' });
    await decoder.tracks.ready;
    const track = decoder.tracks.selectedTrack;
    const count = Math.min(track?.frameCount || 1, 24);
    const frames = [];
    for (let i = 0; i < count; i += 1) {
      const { image } = await decoder.decode({ frameIndex: i });
      const c = document.createElement('canvas');
      c.width = 480;
      c.height = 360;
      const g = c.getContext('2d');
      const scale = Math.min(480 / image.displayWidth, 360 / image.displayHeight, 1);
      const dw = image.displayWidth * scale;
      const dh = image.displayHeight * scale;
      g.drawImage(image, (480 - dw) / 2, (360 - dh) / 2, dw, dh);
      image.close?.();
      frames.push(c.toDataURL('image/png'));
    }
    decoder.close?.();
    return frames;
  } catch {
    return [];
  }
}

function SoundWave({ dataUrl }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!dataUrl || !ref.current) return;
    let gone = false;
    (async () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const buf = await (await fetch(dataUrl)).arrayBuffer();
        const audio = await ctx.decodeAudioData(buf);
        if (gone) return;
        const ch = audio.getChannelData(0);
        const c = ref.current;
        const g = c.getContext('2d');
        const w = c.width;
        const h = c.height;
        g.clearRect(0, 0, w, h);
        g.fillStyle = '#312e81';
        g.fillRect(0, 0, w, h);
        g.strokeStyle = '#a5b4fc';
        g.beginPath();
        const step = Math.max(1, Math.floor(ch.length / w));
        for (let x = 0; x < w; x += 1) {
          let max = 0;
          const start = x * step;
          for (let i = 0; i < step; i += 1) max = Math.max(max, Math.abs(ch[start + i] || 0));
          const y = (1 - max) * (h / 2);
          g.lineTo(x, y);
        }
        g.stroke();
        ctx.close();
      } catch { /* ignore */ }
    })();
    return () => { gone = true; };
  }, [dataUrl]);
  return <canvas ref={ref} className="gb-wave" width={520} height={88} />;
}

function SoundLibraryPanel({ query, onQuery, category, onCategory, onPlay, onAdd, showSearch = true }) {
  const q = String(query || '').trim().toLowerCase();
  const active = category || SOUND_LIBRARY[0].category;
  const items = (SOUND_LIBRARY.find((c) => c.category === active)?.items || [])
    .filter((item) => !q || item.label.toLowerCase().includes(q) || item.id.includes(q));
  const searched = q
    ? SOUND_LIBRARY.flatMap((c) => c.items.map((item) => ({ ...item, category: c.category })))
      .filter((item) => item.label.toLowerCase().includes(q) || item.id.includes(q) || item.category.toLowerCase().includes(q))
    : items;

  return (
    <div className="gb-sound-lib">
      <div className="sprite-library-categories-wrap">
        <div className="sprite-library-categories">
          {SOUND_LIBRARY.map((cat) => (
            <button
              key={cat.category}
              type="button"
              onClick={() => onCategory(cat.category)}
              style={{
                padding: '4px 10px',
                borderRadius: 16,
                border: 'none',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                background: !q && active === cat.category ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: !q && active === cat.category ? '#fff' : 'var(--text-primary)',
              }}
            >
              {cat.category}
            </button>
          ))}
        </div>
      </div>
      {showSearch && onQuery && (
        <input
          className="gb-paint-name gb-sound-search"
          placeholder="Search animals, drums, coin…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      )}
      <div className="gb-sound-grid">
        {searched.map((item) => (
          <div key={`${item.category || active}-${item.id}`} className="gb-sound-card">
            <button type="button" className="gb-sound-play" title="Preview" onClick={() => onPlay(item)}><EmojiIcon e="▶" /></button>
            <div className="gb-sound-card-body">
              <span className="gb-sound-ico"><EmojiIcon e={item.icon} /></span>
              <strong>{item.label}</strong>
              {q ? <em>{item.category}</em> : null}
            </div>
            <button type="button" className="gb-asset-primary" onClick={() => onAdd(item)}>Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GameBuilderAssetStudio({
  tab,
  sprite,
  spriteLibrary = [],
  onUpdateSprite,
  onSaveBackdrop,
}) {
  const [picker, setPicker] = useState(null);
  const [libQuery, setLibQuery] = useState('');
  const [libCat, setLibCat] = useState('');
  const [soundCat, setSoundCat] = useState(SOUND_LIBRARY[0].category);
  const [addOpen, setAddOpen] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [recErr, setRecErr] = useState('');
  const [recording, setRecording] = useState(false);
  const [recLevel, setRecLevel] = useState(0);
  const [soundIndex, setSoundIndex] = useState(0);
  const [backdropPaint, setBackdropPaint] = useState(null);
  const [menuFor, setMenuFor] = useState(null); // costume index whose ⋯ menu is open
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [realSize, setRealSize] = useState({}); // image src → "w × h"
  const [animOpen, setAnimOpen] = useState(false);
  const [animFps, setAnimFps] = useState(6);
  const [animFrame, setAnimFrame] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const paintScaleRef = useRef({ key: null, scale: 1 });
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const meterRef = useRef(null);
  const fileImgRef = useRef(null);
  const fileAudRef = useRef(null);

  const costumes = Array.isArray(sprite?.costumes) ? sprite.costumes : [];
  const sounds = sprite?.sounds || [];
  const current = Math.max(0, Math.min(sprite?.currentCostumeIndex ?? 0, Math.max(0, costumes.length - 1)));
  const selectedSound = sounds[Math.min(soundIndex, Math.max(0, sounds.length - 1))] || null;

  useEffect(() => () => {
    stopCam();
    if (meterRef.current) cancelAnimationFrame(meterRef.current);
  }, []);

  useEffect(() => {
    if (!sprite) return;
    const list = Array.isArray(sprite.costumes) ? sprite.costumes : [];
    if (!isPlaceholderCostumeList(list, sprite) && !isLegacyBakedPack(list, sprite)) return;
    const pack = defaultCostumesForSprite(sprite);
    const nextSprite = { ...sprite, costumes: pack, currentCostumeIndex: 0 };
    applyCostumeToSprite(nextSprite, 0, null);
    onUpdateSprite(nextSprite);
  }, [sprite?.id]);

  const patch = (partial) => {
    if (!sprite) return;
    onUpdateSprite({ ...sprite, ...partial });
  };

  const setCostumes = (next, currentIndex = current) => {
    const idx = Math.max(0, Math.min(currentIndex, next.length - 1));
    const nextSprite = { ...sprite, costumes: next, currentCostumeIndex: idx };
    applyCostumeToSprite(nextSprite, idx, null);
    onUpdateSprite(nextSprite);
  };

  const addCostumes = (entries, selectLast = true) => {
    let names = costumes.map((c) => c.name);
    const next = [...costumes];
    entries.forEach((entry) => {
      const name = uniqueName(entry.name || 'costume', names);
      names = [...names, name];
      next.push({ ...entry, name });
    });
    setCostumes(next, selectLast ? next.length - 1 : current);
    setPicker(null);
  };

  const addCostume = (entry) => addCostumes([entry]);

  /* Costume list actions: reorder, duplicate, export */
  const moveCostume = (from, to) => {
    if (from == null || to == null || from === to) return;
    const next = [...costumes];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    // Keep the same costume selected after the move
    let sel = current;
    if (current === from) sel = to;
    else if (from < current && to >= current) sel = current - 1;
    else if (from > current && to <= current) sel = current + 1;
    setCostumes(next, sel);
  };
  const duplicateCostume = (i) => {
    const c = costumes[i];
    const next = [...costumes];
    next.splice(i + 1, 0, { ...c, name: uniqueName(c.name, costumes.map((x) => x.name)) });
    setCostumes(next, i + 1);
  };
  const deleteCostume = (i) => {
    if (costumes.length <= 1) return;
    setCostumes(costumes.filter((_, j) => j !== i), i <= current ? Math.max(0, current - 1) : current);
  };
  const exportCostume = async (i) => {
    const c = costumes[i];
    if (!c?.customImage) return;
    // Draw to a canvas so library pictures, SVGs and data URLs all save as PNG
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = img.naturalWidth || 256;
      cv.height = img.naturalHeight || 256;
      const g = cv.getContext('2d');
      if (c.flipX) { g.translate(cv.width, 0); g.scale(-1, 1); }
      g.drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.href = cv.toDataURL('image/png');
      a.download = `${(c.name || 'costume').replace(/[^\w -]+/g, '')}.png`;
      a.click();
    };
    img.src = assetUrl(c.customImage);
  };

  /* Animation preview: flick through the costumes like a flip-book */
  useEffect(() => {
    if (!animOpen || costumes.length < 2) return undefined;
    const id = setInterval(() => setAnimFrame((f) => (f + 1) % costumes.length), 1000 / animFps);
    return () => clearInterval(id);
  }, [animOpen, animFps, costumes.length]);
  useEffect(() => {
    if (menuFor == null) return undefined;
    const close = () => setMenuFor(null);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [menuFor]);

  const replaceCostumeImage = (dataUrl, dims = {}) => {
    const nw = dims.w || 48;
    const nh = dims.h || 48;
    // Keep the costume's size on stage: work out stage pixels per editor pixel once per load
    const cur = costumes[current];
    const key = dims.base && `${sprite.id}-${current}-${Math.round(dims.base.w)}x${Math.round(dims.base.h)}`;
    if (key && paintScaleRef.current.key !== key && cur?.w) {
      paintScaleRef.current = { key, scale: cur.w / Math.max(1, dims.base.w) };
    }
    const scale = key && paintScaleRef.current.key === key
      ? paintScaleRef.current.scale
      : 200 / Math.max(nw, nh, 1);
    const w = Math.max(16, Math.round(nw * scale));
    const h = Math.max(16, Math.round(nh * scale));
    if (!costumes.length) {
      addCostume({ name: 'costume1', customImage: dataUrl, w, h });
      return;
    }
    const next = costumes.map((c, i) => (
      i === current ? { ...c, customImage: dataUrl, svgKey: c.svgKey || null, w, h, flipX: false } : c
    ));
    setCostumes(next, current);
  };

  const stopCam = () => {
    streamRef.current?.getTracks()?.forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  };

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      setCamOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setRecErr('Camera is blocked. Allow camera, or upload a picture.');
    }
  };

  const snapCam = () => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement('canvas');
    c.width = 480;
    c.height = 360;
    const ctx = c.getContext('2d');
    const scale = Math.max(480 / (v.videoWidth || 480), 360 / (v.videoHeight || 360));
    const dw = (v.videoWidth || 480) * scale;
    const dh = (v.videoHeight || 360) * scale;
    ctx.drawImage(v, (480 - dw) / 2, (360 - dh) / 2, dw, dh);
    addCostume({ name: 'camera', customImage: c.toDataURL('image/png'), w: 48, h: 48 });
    stopCam();
  };

  const importImages = async (files) => {
    const list = Array.from(files || []);
    for (const file of list) {
      if (file.type === 'image/gif') {
        const frames = await gifFramesFromFile(file);
        if (frames.length > 1) {
          addCostumes(frames.map((dataUrl, i) => ({
            name: `${file.name.replace(/\.[^.]+$/, '') || 'gif'} ${i + 1}`,
            customImage: dataUrl,
            w: 48,
            h: 48,
          })));
          continue;
        }
      }
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.readAsDataURL(file);
      });
      addCostume({ name: file.name.replace(/\.[^.]+$/, '').slice(0, 18) || 'upload', customImage: dataUrl, w: 48, h: 48 });
    }
  };

  const addLibraryItem = async (item) => {
    const dims = item.customImage ? await loadCostumeDimensions(item.customImage) : { w: 48, h: 48 };
    addCostume({
      name: item.name,
      svgKey: item.name,
      color: item.color,
      customImage: item.customImage,
      w: dims.w,
      h: dims.h,
    });
  };

  const surprise = () => {
    addCostume(nextSurpriseCostume(sprite, costumes, current));
  };

  const addLibrarySound = (item, close = true) => {
    const name = uniqueName(item.label, sounds.map((s) => s.name));
    const next = [...sounds, { name, id: item.id, duration: item.duration, category: item.category }];
    patch({ sounds: next });
    setSoundIndex(next.length - 1);
    if (close) setPicker(null);
  };

  const surpriseSound = () => {
    addLibrarySound(nextSurpriseSound(sounds), false);
  };

  const startRecord = async () => {
    setRecErr('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const src = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (let i = 0; i < data.length; i += 1) peak = Math.max(peak, Math.abs(data[i] - 128));
        setRecLevel(peak / 128);
        meterRef.current = requestAnimationFrame(tick);
      };
      tick();
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        cancelAnimationFrame(meterRef.current);
        setRecLevel(0);
        stream.getTracks().forEach((t) => t.stop());
        actx.close?.();
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const name = uniqueName('recording', sounds.map((s) => s.name));
          const next = [...sounds, { name, dataUrl: reader.result, duration: 4, id: name }];
          patch({ sounds: next });
          setSoundIndex(next.length - 1);
        };
        reader.readAsDataURL(blob);
        setRecording(false);
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      setTimeout(() => {
        if (recRef.current && recRef.current.state === 'recording') recRef.current.stop();
      }, 8000);
    } catch {
      setRecErr('Microphone is blocked. Allow the mic, or upload a sound.');
    }
  };

  const stopRecord = () => {
    if (recRef.current && recRef.current.state === 'recording') recRef.current.stop();
  };

  if (!sprite) {
    return <div className="gb-asset-empty">Select a sprite to edit costumes and sounds.</div>;
  }

  const onionSrc = current > 0 ? costumes[current - 1]?.customImage : null;
  const activeCat = libCat || spriteLibrary[0]?.category || '';
  const q = libQuery.trim().toLowerCase();
  const catItems = (spriteLibrary.find((c) => c.category === activeCat)?.items || [])
    .filter((item) => !q || item.name.toLowerCase().includes(q));

  return (
    <div className="gb-asset-studio">
      {tab === 'costumes' && (
        <div className="gb-scratch-layout">
          <aside className="gb-costume-rail">
            {costumes.length > 1 && (
              <button type="button" className={animOpen ? 'gb-anim-btn on' : 'gb-anim-btn'} onClick={() => { setAnimFrame(current); setAnimOpen((v) => !v); }} title="Play the costumes as an animation">
                <IconText>{animOpen ? '■ Stop' : '▶ Animate'}</IconText>
              </button>
            )}
            <div className="gb-rail-list">
              {costumes.map((c, i) => (
                <div
                  key={`${c.name}-${i}`}
                  className={['gb-rail-item', i === current ? 'on' : '', dragOver === i && dragFrom !== i ? 'drop' : '', dragFrom === i ? 'dragging' : ''].filter(Boolean).join(' ')}
                  onClick={() => setCostumes(costumes, i)}
                  draggable
                  onDragStart={(e) => { setDragFrom(i); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                  onDragLeave={() => setDragOver((d) => (d === i ? null : d))}
                  onDrop={(e) => { e.preventDefault(); moveCostume(dragFrom, i); setDragFrom(null); setDragOver(null); }}
                  onDragEnd={() => { setDragFrom(null); setDragOver(null); }}
                  onContextMenu={(e) => { e.preventDefault(); setMenuFor(i); }}
                  title="Drag to reorder · right-click for more"
                >
                  <span className="gb-rail-num">{i + 1}</span>
                  <button
                    type="button"
                    className="gb-rail-more"
                    title="More"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === i ? null : i); }}
                  >⋯</button>
                  {menuFor === i && (
                    <div className="gb-rail-menu" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => { duplicateCostume(i); setMenuFor(null); }}>⧉ Duplicate</button>
                      <button type="button" onClick={() => { exportCostume(i); setMenuFor(null); }} disabled={!c.customImage}><EmojiIcon e="⬇" style={{ marginRight: '0.35em' }} />Export PNG</button>
                      <button type="button" className="danger" onClick={() => { deleteCostume(i); setMenuFor(null); }} disabled={costumes.length <= 1}><EmojiIcon e="🗑" style={{ marginRight: '0.35em' }} />Delete</button>
                    </div>
                  )}
                  {costumeThumb(c)
                    ? (
                      <img
                        src={assetUrl(c.customImage)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        onLoad={(e) => {
                          const v = `${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight}`;
                          setRealSize((m) => (m[c.customImage] === v ? m : { ...m, [c.customImage]: v }));
                        }}
                        style={{
                          transform: [c.flipX ? 'scaleX(-1)' : '', c.tilt ? `rotate(${c.tilt}deg)` : ''].filter(Boolean).join(' ') || undefined,
                          filter: c.hue ? `hue-rotate(${c.hue}deg)` : undefined,
                        }}
                      />
                    )
                    : <div className="gb-asset-placeholder">{(c.name || '?')[0]}</div>}
                  <div className="gb-rail-meta">
                    <strong>{c.name}</strong>
                    <span>{c.customImage ? (realSize[c.customImage] || '…') : 'empty'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="gb-rail-fab-wrap">
              {addOpen && (
                <div className="gb-add-menu">
                  <button type="button" onClick={() => { setAddOpen(false); addCostume({ name: 'costume', customImage: undefined, w: 48, h: 48 }); }}>Paint</button>
                  <button type="button" onClick={() => { setAddOpen(false); surprise(); }}>Surprise</button>
                  <button type="button" onClick={() => { setAddOpen(false); fileImgRef.current?.click(); }}>Upload</button>
                  <button type="button" onClick={() => {
                    setAddOpen(false);
                    setLibCat(sprite.category || spriteLibrary[0]?.category || '');
                    setLibQuery('');
                    setPicker('costume');
                  }}>Choose</button>
                  <button type="button" onClick={() => { setAddOpen(false); startCam(); }}>Camera</button>
                </div>
              )}
              <button type="button" className="gb-add-fab" title="Add a costume" onClick={() => setAddOpen((v) => !v)}>+</button>
              <input ref={fileImgRef} type="file" accept="image/*,.gif" multiple hidden onChange={(e) => { importImages(e.target.files); e.target.value = ''; }} />
            </div>
            <div className="gb-rail-backdrops">
              <button type="button" onClick={() => {
                const c = document.createElement('canvas');
                c.width = 480;
                c.height = 360;
                const g = c.getContext('2d');
                g.fillStyle = '#7dd3fc';
                g.fillRect(0, 0, 480, 360);
                onSaveBackdrop?.(c.toDataURL('image/png'));
              }}>Sky</button>
              <button type="button" onClick={() => setBackdropPaint('new')}>Paint stage</button>
            </div>
          </aside>
          {animOpen && costumes.length > 1 && (
            <div className="gb-anim-preview">
              <div className="gb-anim-frame checkered">
                {costumes[animFrame % costumes.length]?.customImage && (
                  <img
                    src={assetUrl(costumes[animFrame % costumes.length].customImage)}
                    alt=""
                    style={{ transform: costumes[animFrame % costumes.length].flipX ? 'scaleX(-1)' : undefined }}
                  />
                )}
              </div>
              <div className="gb-anim-row">
                <span>{(animFrame % costumes.length) + 1} / {costumes.length}</span>
                <label>Speed <input type="range" min={1} max={20} value={animFps} onChange={(e) => setAnimFps(Number(e.target.value))} /> <b>{animFps} fps</b></label>
              </div>
              <div className="gb-anim-tip">Use <b>next costume</b> + <b>wait {(1 / animFps).toFixed(2)}</b> in a loop to animate like this.</div>
            </div>
          )}
          <PaintEditor
            sourceKey={`${sprite.id}-${current}`}
            name={costumes[current]?.name || 'costume1'}
            onRename={(name) => setCostumes(costumes.map((c, i) => (i === current ? { ...c, name } : c)), current)}
            sourceImage={costumes[current]?.customImage}
            flipX={!!costumes[current]?.flipX}
            hue={costumes[current]?.hue || 0}
            tilt={costumes[current]?.tilt || 0}
            onionImage={onionSrc}
            transparent
            onChange={replaceCostumeImage}
          />
        </div>
      )}

      {tab === 'sounds' && (
        <div className="gb-scratch-layout">
          <aside className="gb-costume-rail">
            <div className="gb-rail-list">
              {sounds.map((s, i) => (
                <div
                  key={`${s.name}-${i}`}
                  className={i === soundIndex ? 'gb-rail-item on' : 'gb-rail-item'}
                  onClick={() => setSoundIndex(i)}
                >
                  <span className="gb-rail-num">{i + 1}</span>
                  {i === soundIndex && sounds.length > 0 && (
                    <button
                      type="button"
                      className="gb-rail-x"
                      title="Delete sound"
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = sounds.filter((_, j) => j !== i);
                        patch({ sounds: next });
                        setSoundIndex(Math.max(0, i - 1));
                      }}
                    >×</button>
                  )}
                  <button type="button" className="gb-sound-thumb" onClick={(e) => { e.stopPropagation(); playSpriteSound({ ...sprite, sounds }, s.name); }}><EmojiIcon e="▶" /></button>
                  <div className="gb-rail-meta">
                    <strong>{s.name}</strong>
                    <span>{s.dataUrl ? 'recorded' : (s.category || 'library')}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="gb-rail-fab-wrap">
              {addOpen && (
                <div className="gb-add-menu">
                  <button type="button" onClick={() => { setAddOpen(false); setLibQuery(''); setPicker('sound'); }}>Library</button>
                  <button type="button" onClick={() => { setAddOpen(false); surpriseSound(); }}>Surprise</button>
                  <button type="button" onClick={() => { setAddOpen(false); fileAudRef.current?.click(); }}>Upload</button>
                  <button type="button" onClick={() => { setAddOpen(false); recording ? stopRecord() : startRecord(); }}>{recording ? 'Stop' : 'Record'}</button>
                </div>
              )}
              <button type="button" className="gb-add-fab" title="Add a sound" onClick={() => setAddOpen((v) => !v)}>+</button>
              <input ref={fileAudRef} type="file" accept="audio/*" hidden onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const name = uniqueName(file.name.replace(/\.[^.]+$/, '').slice(0, 18) || 'sound', sounds.map((s) => s.name));
                  const next = [...sounds, { name, dataUrl: reader.result, duration: 2, id: name }];
                  patch({ sounds: next });
                  setSoundIndex(next.length - 1);
                };
                reader.readAsDataURL(file);
              }} />
            </div>
            {recording && (
              <div className="gb-meter"><div style={{ width: `${Math.round(recLevel * 100)}%` }} /></div>
            )}
            {recErr && <p className="gb-asset-error">{recErr}</p>}
          </aside>
          <div className="gb-sound-stage">
            {selectedSound ? (
              <>
                <input
                  className="gb-paint-name"
                  value={selectedSound.name}
                  onChange={(e) => patch({
                    sounds: sounds.map((s, i) => (i === soundIndex ? { ...s, name: e.target.value.slice(0, 24) } : s)),
                  })}
                />
                {selectedSound.dataUrl
                  ? <SoundWave dataUrl={selectedSound.dataUrl} />
                  : (
                    <div className="gb-synth-wave">
                      <span><IconText>{SOUND_LIBRARY.flatMap((c) => c.items).find((x) => x.id === selectedSound.id)?.icon || '🔊'}</IconText></span>
                      <strong>{selectedSound.name}</strong>
                    </div>
                  )}
                <div className="gb-asset-actions">
                  <button type="button" className="gb-asset-primary" onClick={() => playSpriteSound(sprite, selectedSound.name)}>Play</button>
                  <button type="button" className="gb-asset-chip" onClick={() => { setLibQuery(''); setPicker('sound'); }}>Sound library</button>
                </div>
                <p className="gb-asset-hint">Use <b>start sound {selectedSound.name}</b> in Code. Library sounds are built-in — upload or record for your own clips.</p>
              </>
            ) : (
              <SoundLibraryPanel
                query={libQuery}
                onQuery={setLibQuery}
                category={soundCat}
                onCategory={setSoundCat}
                onPlay={(item) => playBlockSound(item.id)}
                onAdd={(item) => addLibrarySound(item, false)}
              />
            )}
          </div>
        </div>
      )}

      {picker === 'costume' && (
        <div className="gb-picker-overlay" onClick={() => setPicker(null)}>
          <div className="sprite-library-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sprite-library-header">
              <span style={{ fontWeight: 700, fontSize: 15 }}>Choose a Costume</span>
              <input
                className="gb-paint-name"
                placeholder="Search…"
                value={libQuery}
                onChange={(e) => setLibQuery(e.target.value)}
                style={{ maxWidth: 200 }}
              />
              <button type="button" className="gb-asset-ghost" onClick={() => setPicker(null)}>×</button>
            </div>
            <div className="sprite-library-categories-wrap">
              <div className="sprite-library-categories">
                {spriteLibrary.map((cat) => (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => setLibCat(cat.category)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 16,
                      border: 'none',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: activeCat === cat.category ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: activeCat === cat.category ? '#fff' : 'var(--text-primary)',
                    }}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>
            </div>
            <div className="sprite-library-grid">
              {catItems.map((item) => (
                <button
                  key={`${activeCat}-${item.name}`}
                  type="button"
                  className="gb-asset-card"
                  onClick={() => addLibraryItem(item)}
                >
                  {item.customImage
                    ? <img src={assetUrl(item.customImage)} alt="" loading="lazy" decoding="async" />
                    : <div className="gb-asset-placeholder">{item.name[0]}</div>}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
            <div className="sprite-library-footer">
              Adds a look to <b>{sprite.name}</b> — then use switch costume / next costume in Code.
            </div>
          </div>
        </div>
      )}

      {picker === 'sound' && (
        <div className="gb-picker-overlay" onClick={() => setPicker(null)}>
          <div className="sprite-library-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sprite-library-header">
              <span style={{ fontWeight: 700, fontSize: 15 }}>Choose a Sound</span>
              <input
                className="gb-paint-name"
                placeholder="Search…"
                value={libQuery}
                onChange={(e) => setLibQuery(e.target.value)}
                style={{ maxWidth: 200 }}
              />
              <button type="button" className="gb-asset-ghost" onClick={() => setPicker(null)}>×</button>
            </div>
            <SoundLibraryPanel
              query={libQuery}
              onQuery={setLibQuery}
              category={soundCat}
              onCategory={setSoundCat}
              onPlay={(item) => playBlockSound(item.id)}
              onAdd={addLibrarySound}
              showSearch={false}
            />
            <div className="sprite-library-footer">
              Adds a sound to <b>{sprite.name}</b> — then use start sound / play sound until done in Code.
            </div>
          </div>
        </div>
      )}

      {camOn && (
        <div className="gb-picker-overlay" onClick={stopCam}>
          <div className="gb-picker gb-picker-sm" onClick={(e) => e.stopPropagation()}>
            <div className="gb-paint-head">
              <strong>Camera costume</strong>
              <button type="button" className="gb-asset-ghost" onClick={stopCam}>×</button>
            </div>
            <video ref={videoRef} autoPlay playsInline muted className="gb-cam-video" />
            <div className="gb-paint-foot">
              <button type="button" className="gb-asset-ghost" onClick={stopCam}>Cancel</button>
              <button type="button" className="gb-asset-primary" onClick={snapCam}>Use photo</button>
            </div>
          </div>
        </div>
      )}

      {backdropPaint && (
        <div className="gb-picker-overlay" onClick={() => setBackdropPaint(null)}>
          <div className="gb-picker" style={{ width: 'min(920px, 96vw)' }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-paint-head">
              <strong>Paint backdrop</strong>
              <button type="button" className="gb-asset-ghost" onClick={() => setBackdropPaint(null)}>×</button>
            </div>
            <PaintEditor
              sourceKey="backdrop-new"
              name="backdrop"
              sourceImage={null}
              transparent={false}
              onChange={(dataUrl) => { setBackdropPaint(dataUrl); }}
            />
            <div className="gb-paint-foot">
              <button type="button" className="gb-asset-ghost" onClick={() => setBackdropPaint(null)}>Cancel</button>
              <button
                type="button"
                className="gb-asset-primary"
                onClick={() => {
                  if (typeof backdropPaint === 'string' && backdropPaint.startsWith('data:')) onSaveBackdrop?.(backdropPaint);
                  setBackdropPaint(null);
                }}
              >
                Save backdrop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { uniqueName };
