/**
 * PictoBlox-style AI / ML extension commands and reads (not generic "classify text").
 * Mutates extension state object `S` from extensionEngine.js
 */

function logOut(output, msg) {
  if (output && typeof output.push === 'function') output.push(msg);
}

/** @param {Record<string, unknown>} S */
export function dispatchAiMlExtension(S, parts, output) {
  const a = (parts[0] || '').toLowerCase();
  const b = (parts[1] || '').toLowerCase();
  const c = parts[2] || '';
  const rest = parts.slice(2).join('|');

  switch (`${a}|${b}`) {
    case 'body|analyse': {
      S.body.t = (S.body.t || 0) + 1;
      S.body.visible = !!(S.face?.visible) || S.face?.count > 0;
      const vw = S.face?.video?.videoWidth || 640;
      const vh = S.face?.video?.videoHeight || 480;
      const faces = S.face?.lastFaces || [];
      if (faces.length) {
        const f = faces[0];
        S.body.noseNormX = (f.x + f.w * 0.5) / Math.max(1, vw);
        S.body.noseNormY = (f.y + f.h * 0.35) / Math.max(1, vh);
      } else {
        S.body.noseNormX = 0.48 + Math.sin(S.body.t / 7) * 0.08;
        S.body.noseNormY = 0.38 + Math.cos(S.body.t / 9) * 0.06;
        S.body.visible = S.body.t % 14 !== 0;
      }
      logOut(output, `[Body] Analysed → nose ~(${(S.body.noseNormX * 100).toFixed(0)}%, ${(S.body.noseNormY * 100).toFixed(0)}%)`);
      return true;
    }
    case 'ml|train': {
      S.ml.ready = true;
      const pool = ['cat', 'dog', 'tree', 'person', 'cup', 'phone'];
      S.ml.topClass = pool[Math.floor(Math.random() * pool.length)];
      S.ml.confidence = 0.55 + Math.random() * 0.4;
      logOut(output, `[ML] Train step (sim) → best class “${S.ml.topClass}”.`);
      return true;
    }
    case 'txtml|add': {
      const cls = (c || 'positive').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'positive';
      const text = parts.slice(3).join('|').trim() || 'example';
      if (!S.txtml.examples) S.txtml.examples = {};
      if (!Array.isArray(S.txtml.examples[cls])) S.txtml.examples[cls] = [];
      S.txtml.examples[cls].push(text.slice(0, 200));
      logOut(output, `[TC] Added example to “${cls}”: ${text.slice(0, 60)}${text.length > 60 ? '…' : ''}`);
      return true;
    }
    case 'txtml|classify': {
      const text = parts.slice(2).join('|').trim() || 'text';
      const buckets = S.txtml.examples && Object.keys(S.txtml.examples);
      if (buckets?.length) {
        let best = buckets[0];
        let bestScore = -1;
        for (const k of buckets) {
          const arr = S.txtml.examples[k] || [];
          let sc = 0;
          for (const ex of arr) {
            const words = new Set(ex.toLowerCase().split(/\W+/).filter(Boolean));
            for (const w of text.toLowerCase().split(/\W+/)) {
              if (words.has(w)) sc += 1;
            }
          }
          if (sc > bestScore) {
            bestScore = sc;
            best = k;
          }
        }
        S.txtml.lastLabel = bestScore > 0 ? best : 'unknown';
        S.txtml.lastScore = bestScore > 0 ? Math.min(0.99, 0.35 + bestScore * 0.08) : 0.25;
      } else {
        S.txtml.lastLabel = /^(hi|hello|hey)/i.test(text) ? 'positive' : text.length > 40 ? 'neutral' : 'negative';
        S.txtml.lastScore = 0.5 + Math.random() * 0.2;
      }
      logOut(output, `[TC] Classified → “${S.txtml.lastLabel}” (${(S.txtml.lastScore * 100).toFixed(0)}% conf.)`);
      return true;
    }
    case 'imgml|analyse': {
      const objs = S.objdet?.lastObjects || [];
      if (objs.length) {
        S.imgml.topClass = objs[0].label || 'none';
        S.imgml.confidence = typeof objs[0].score === 'number' ? objs[0].score : 0.7;
      } else {
        S.imgml.topClass = ['person', 'keyboard', 'mouse', 'book'][Math.floor(Math.random() * 4)];
        S.imgml.confidence = 0.4 + Math.random() * 0.35;
      }
      logOut(output, `[IC] Frame analysed → ${S.imgml.topClass}`);
      return true;
    }
    case 'poseml|capture': {
      S.poseml.label = ['T-pose', 'hands up', 'wave', 'crouch'][Math.floor(Math.random() * 4)];
      S.poseml.score = 0.45 + Math.random() * 0.5;
      logOut(output, `[PC] Pose sample → ${S.poseml.label}`);
      return true;
    }
    case 'audioml|listen': {
      const labs = ['clap', 'snap', 'speech', 'silence', 'whistle'];
      S.audioml.label = labs[Math.floor(Math.random() * labs.length)];
      logOut(output, `[AC] Classified sound → ${S.audioml.label}`);
      return true;
    }
    case 'numml|train': {
      S.numml.prediction = Math.round(10 + Math.random() * 90);
      logOut(output, `[NR] Regression train (sim) → baseline ${S.numml.prediction}`);
      return true;
    }
    case 'nlp|analyse': {
      const text = rest.replace(/^\|/, '').trim() || 'hello';
      const happy = (text.match(/good|great|love|happy|yes|awesome/gi) || []).length;
      const sad = (text.match(/sad|bad|hate|no|angry|awful/gi) || []).length;
      S.nlp.sentiment = Math.max(0, Math.min(1, 0.5 + (happy - sad) * 0.12 + (Math.random() - 0.5) * 0.05));
      logOut(output, `[NLP] Sentiment ≈ ${S.nlp.sentiment.toFixed(2)}`);
      return true;
    }
    case 'tr|translate': {
      const to = (c || 'es').toLowerCase().slice(0, 5);
      const text = parts.slice(3).join('|').trim() || 'Hello';
      const fake = { es: `[ES] ${text}`, fr: `[FR] ${text}`, de: `[DE] ${text}`, ja: `[JA] ${text}` };
      S.tr.last = fake[to] || `[${to.toUpperCase()}] ${text}`;
      logOut(output, `[TR] → ${S.tr.last.slice(0, 80)}`);
      return true;
    }
    case 'ocr|scan': {
      const hints = ['HELLO', 'BYTEBUDDIES', 'CODE', '2026', ''];
      S.ocr.text = hints[Math.floor(Math.random() * hints.length)] || 'SAMPLE TEXT';
      logOut(output, `[OCR] Recognized: ${S.ocr.text}`);
      return true;
    }
    case 'rc|scan': {
      const cards = ['card A', 'card B', 'card C', 'unknown'];
      S.rc.label = cards[Math.floor(Math.random() * cards.length)];
      logOut(output, `[RC] Card → ${S.rc.label}`);
      return true;
    }
    case 'chat|ask': {
      const q = parts.slice(2).join('|').trim() || 'Hello';
      const replies = [
        `Try breaking “${q.slice(0, 40)}” into smaller steps.`,
        `One idea: test with print() first, then add logic.`,
        `Check camera permissions if your project uses video.`,
      ];
      S.chat.lastReply = replies[Math.floor(Math.random() * replies.length)];
      logOut(output, `[CHAT] ${S.chat.lastReply.slice(0, 100)}`);
      return true;
    }
    default:
      return false;
  }
}

/** @param {Record<string, unknown>} S */
export function readAiMlExtensionKey(S, key) {
  switch (key) {
    case 'body.visible':
      return !!S.body.visible;
    case 'body.nose.x':
      return Math.round((S.body.noseNormX ?? 0.5) * 480 - 240);
    case 'body.nose.y':
      return Math.round(180 - (S.body.noseNormY ?? 0.4) * 360);
    case 'ml.ready':
      return !!S.ml.ready;
    case 'ml.topclass':
      return String(S.ml.topClass || 'none');
    case 'ml.confidence':
      return Number(S.ml.confidence) || 0;
    case 'txtml.label':
      return String(S.txtml.lastLabel || 'unknown');
    case 'txtml.confidence':
      return Number(S.txtml.lastScore) || 0;
    case 'imgml.class':
      return String(S.imgml.topClass || 'none');
    case 'imgml.confidence':
      return Number(S.imgml.confidence) || 0;
    case 'poseml.name':
      return String(S.poseml.label || 'none');
    case 'poseml.score':
      return Number(S.poseml.score) || 0;
    case 'audioml.label':
      return String(S.audioml.label || 'silence');
    case 'numml.prediction':
      return Number(S.numml.prediction) || 0;
    case 'nlp.sentiment':
      return Number(S.nlp.sentiment) || 0.5;
    case 'nlp.ispositive':
      return (S.nlp.sentiment ?? 0.5) >= 0.55;
    case 'tr.result':
      return String(S.tr.last || '');
    case 'ocr.text':
      return String(S.ocr.text || '');
    case 'rc.label':
      return String(S.rc.label || 'unknown');
    case 'chat.reply':
      return String(S.chat.lastReply || '');
    default:
      return null;
  }
}
