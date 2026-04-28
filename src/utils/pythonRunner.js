/**
 * Python subset interpreter for ByteBuddies.
 * Supports: variable assignment, print(), if/elif/else,
 * for i in range(n), while, def + calls, basic arithmetic, strings, lists.
 */
import { resolveExtensionDragToBlock, runExtensionCmd } from './extensionEngine';

export function runPython(code) {
  const output = [];
  const errors = [];
  const events = [];

  try {
    const lines = code.split('\n');
    const scope = {};
    const functions = {};
    let i = 0;

    function evalExpr(expr, localScope = {}) {
      expr = expr.trim();
      const env = { ...scope, ...localScope };

      // Strip wrapping parentheses: (x), ((a + b)), etc.
      const hasWrappedParens = (s) => {
        if (!(s.startsWith('(') && s.endsWith(')'))) return false;
        let depth = 0;
        for (let i = 0; i < s.length; i++) {
          const ch = s[i];
          if (ch === '(') depth++;
          else if (ch === ')') depth--;
          if (depth === 0 && i < s.length - 1) return false;
        }
        return depth === 0;
      };
      while (hasWrappedParens(expr)) {
        expr = expr.slice(1, -1).trim();
      }

      // String literals
      if ((expr.startsWith('"') && expr.endsWith('"')) ||
          (expr.startsWith("'") && expr.endsWith("'"))) {
        return expr.slice(1, -1);
      }

      // f-strings: f"..." or f'...'
      if ((expr.startsWith('f"') && expr.endsWith('"')) ||
          (expr.startsWith("f'") && expr.endsWith("'"))) {
        const template = expr.slice(2, -1);
        return template.replace(/\{([^}]+)\}/g, (_, e) => {
          try { return String(evalExpr(e, localScope)); } catch { return e; }
        });
      }

      // None/True/False
      if (expr === 'None') return null;
      if (expr === 'True') return true;
      if (expr === 'False') return false;

      // List literal
      if (expr.startsWith('[') && expr.endsWith(']')) {
        const inner = expr.slice(1, -1).trim();
        if (!inner) return [];
        return splitArgs(inner).map(e => evalExpr(e, localScope));
      }

      // range(n) or range(a,b)
      const rangeMatch = expr.match(/^range\((.+)\)$/);
      if (rangeMatch) {
        const args = splitArgs(rangeMatch[1]).map(a => Number(evalExpr(a, localScope)));
        const [start, end] = args.length === 1 ? [0, args[0]] : [args[0], args[1]];
        const result = [];
        for (let x = start; x < end; x++) result.push(x);
        return result;
      }

      // len()
      const lenMatch = expr.match(/^len\((.+)\)$/);
      if (lenMatch) {
        const val = evalExpr(lenMatch[1], localScope);
        return Array.isArray(val) ? val.length : String(val).length;
      }

      // str(), int(), float()
      const castMatch = expr.match(/^(str|int|float)\((.+)\)$/);
      if (castMatch) {
        const val = evalExpr(castMatch[2], localScope);
        if (castMatch[1] === 'str') return String(val);
        if (castMatch[1] === 'int') return Math.trunc(Number(val));
        if (castMatch[1] === 'float') return Number(val);
      }

      // input() — returns empty string
      if (expr.startsWith('input(')) return '';

      // abs(), round()
      const mathMatch = expr.match(/^(abs|round)\((.+)\)$/);
      if (mathMatch) {
        const val = Number(evalExpr(mathMatch[2], localScope));
        return mathMatch[1] === 'abs' ? Math.abs(val) : Math.round(val);
      }

      const rndMatch = expr.match(/^random_int\((.+)\)$/);
      if (rndMatch) {
        const args = splitArgs(rndMatch[1]).map((a) => Number(evalExpr(a, localScope)));
        const min = Number.isFinite(args[0]) ? args[0] : 1;
        const max = Number.isFinite(args[1]) ? args[1] : 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      // Function call
      const funcCallMatch = expr.match(/^([a-zA-Z_]\w*)\(([^)]*)\)$/);
      if (funcCallMatch && functions[funcCallMatch[1]]) {
        const fn = functions[funcCallMatch[1]];
        const callArgs = funcCallMatch[2].trim()
          ? splitArgs(funcCallMatch[2]).map(a => evalExpr(a, localScope))
          : [];
        const localEnv = {};
        fn.params.forEach((p, i) => { localEnv[p] = callArgs[i] ?? null; });
        return execBlock(fn.body, { ...env, ...localEnv });
      }

      // Comparison operators
      for (const op of ['==', '!=', '<=', '>=', '<', '>']) {
        const idx = expr.indexOf(op);
        if (idx > 0) {
          const left = evalExpr(expr.slice(0, idx), localScope);
          const right = evalExpr(expr.slice(idx + op.length), localScope);
          if (op === '==') return left == right;
          if (op === '!=') return left != right;
          if (op === '<=') return Number(left) <= Number(right);
          if (op === '>=') return Number(left) >= Number(right);
          if (op === '<') return Number(left) < Number(right);
          if (op === '>') return Number(left) > Number(right);
        }
      }

      // Boolean operators
      if (/\band\b/.test(expr)) {
        const parts = expr.split(/\band\b/);
        return parts.every(p => evalExpr(p, localScope));
      }
      if (/\bor\b/.test(expr)) {
        const parts = expr.split(/\bor\b/);
        return parts.some(p => evalExpr(p, localScope));
      }
      if (expr.startsWith('not ')) {
        return !evalExpr(expr.slice(4), localScope);
      }

      // Arithmetic: +, -, *, /, %, **
      // Simple left-to-right (handles basic cases)
      const arithMatch = expr.match(/^(.+?)\s*(\*\*|\+|\-|\*|\/\/|\/|\%)\s*(.+)$/);
      if (arithMatch) {
        const left = evalExpr(arithMatch[1], localScope);
        const right = evalExpr(arithMatch[3], localScope);
        const op = arithMatch[2];
        if (op === '+') return typeof left === 'string' || typeof right === 'string'
          ? String(left) + String(right) : Number(left) + Number(right);
        if (op === '-') return Number(left) - Number(right);
        if (op === '*') return typeof left === 'string'
          ? left.repeat(Number(right)) : Number(left) * Number(right);
        if (op === '/') return Number(left) / Number(right);
        if (op === '//') return Math.floor(Number(left) / Number(right));
        if (op === '%') return Number(left) % Number(right);
        if (op === '**') return Math.pow(Number(left), Number(right));
      }

      // Variable lookup
      if (/^[a-zA-Z_]\w*$/.test(expr) && expr in env) {
        return env[expr];
      }

      // Number literal
      const num = Number(expr);
      if (!isNaN(num) && expr !== '') return num;

      return expr;
    }

    function splitArgs(str) {
      const args = [];
      let depth = 0, current = '';
      for (const ch of str) {
        if (ch === '(' || ch === '[') depth++;
        else if (ch === ')' || ch === ']') depth--;
        if (ch === ',' && depth === 0) { args.push(current.trim()); current = ''; }
        else current += ch;
      }
      if (current.trim()) args.push(current.trim());
      return args;
    }

    function speakInlineTts(cmdLabel) {
      try {
        const raw = String(cmdLabel || '');
        const parts = raw.split('|').map((s) => String(s || '').trim());
        if (parts[0] !== 'tts' || parts[1] !== 'speak') return false;
        const voicePref = (parts[2] || 'auto').toLowerCase();
        const text = parts.slice(3).join('|') || 'Hello from ByteBuddies';
        const synth = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis : null;
        const Utter = (typeof window !== 'undefined' && window.SpeechSynthesisUtterance) ? window.SpeechSynthesisUtterance : null;
        if (!synth || !Utter) {
          output.push('[TTS] Speech synthesis unavailable.');
          return true;
        }
        const voices = synth.getVoices ? synth.getVoices() : [];
        const pick = () => {
          if (!voices.length) return null;
          const has = (needle) => voices.find((v) => String(v?.name || '').toLowerCase().includes(needle));
          if (voicePref === 'bella') return has('bella');
          if (voicePref === 'adam') return has('adam');
          if (voicePref === 'emma') return has('emma');
          if (voicePref === 'female') return voices.find((v) => /(female|woman|bella|nicole|sarah|sky|emma|isabella|alice)/i.test(String(v?.name || '')));
          if (voicePref === 'male') return voices.find((v) => /(male|man|adam|michael|liam|eric|george|daniel|lewis)/i.test(String(v?.name || '')));
          if (voicePref === 'uk') return voices.find((v) => String(v?.lang || '').toLowerCase().startsWith('en-gb'));
          if (voicePref === 'us') return voices.find((v) => String(v?.lang || '').toLowerCase().startsWith('en-us'));
          return voices.find((v) => /google/i.test(String(v?.name || ''))) || voices[0] || null;
        };
        const u = new Utter(text);
        const v = pick();
        if (v) u.voice = v;
        u.lang = v?.lang || 'en-US';
        u.rate = 1;
        u.pitch = 1;
        u.volume = 1;
        try { synth.resume?.(); } catch { /* ignore */ }
        try { synth.cancel(); } catch { /* ignore */ }
        synth.speak(u);
        output.push(`[TTS] Speaking (${voicePref})${v ? ` via ${v.name}` : ''}: ${text}`);
        return true;
      } catch (e) {
        output.push(`[TTS] Error: ${e?.message || 'unknown error'}`);
        return true;
      }
    }

    function execBlock(blockLines, localScope = {}) {
      let returnVal = null;
      let li = 0;
      const env = localScope;

      while (li < blockLines.length) {
        const line = blockLines[li];
        const stripped = line.trim();
        if (!stripped || stripped.startsWith('#')) { li++; continue; }

        // return statement
        if (stripped.startsWith('return ')) {
          return evalExpr(stripped.slice(7), env);
        }

        // print()
        const printMatch = stripped.match(/^print\((.*)\)$/);
        if (printMatch) {
          const args = splitArgs(printMatch[1]).map(a => evalExpr(a, env));
          output.push(args.join(' '));
          li++; continue;
        }

        // say("Hi", 2) -> preview text output
        const sayMatch = stripped.match(/^say\((.*)\)$/);
        if (sayMatch) {
          const args = splitArgs(sayMatch[1]).map(a => evalExpr(a, env));
          output.push(String(args[0] ?? ''));
          li++; continue;
        }

        // play_sound("pop")
        const soundMatch = stripped.match(/^play_sound\((.*)\)$/);
        if (soundMatch) {
          const args = splitArgs(soundMatch[1]).map(a => evalExpr(a, env));
          events.push({ type: 'sound', name: String(args[0] ?? 'pop') });
          li++; continue;
        }

        // stop_sounds()
        if (/^stop_sounds\(\)$/.test(stripped)) {
          events.push({ type: 'sound-stop' });
          li++; continue;
        }

        // Extension fallback block execution hook
        const extRun = stripped.match(/^run_extension_block\((.*)\)$/);
        if (extRun) {
          const args = splitArgs(extRun[1]).map(a => evalExpr(a, env));
          const label = String(args[0] ?? 'block');
          if (label.startsWith('tts|speak|') && speakInlineTts(label)) {
            li++; continue;
          }
          // Support both palette labels ("[TTS] Speak") and direct command strings
          // ("tts|speak|voice|text") produced by advanced extension blocks.
          if (label.includes('|')) {
            runExtensionCmd(label, output);
          } else {
            const mapped = resolveExtensionDragToBlock(label);
            if (mapped?.type === 'extension-run' && mapped?.params?.cmd) {
              runExtensionCmd(mapped.params.cmd, output);
            } else {
              output.push(`extension: ${label}`);
            }
          }
          li++; continue;
        }

        // Variable assignment: x = expr or x += expr etc
        const assignMatch = stripped.match(/^([a-zA-Z_]\w*)\s*(\+|-|\*|\/)?=\s*(.+)$/);
        if (assignMatch && !stripped.startsWith('if') && !stripped.startsWith('while')) {
          const [, varName, op, expr] = assignMatch;
          let val = evalExpr(expr, env);
          if (op) {
            const prev = env[varName] ?? scope[varName] ?? 0;
            if (op === '+') val = typeof prev === 'string' ? prev + String(val) : Number(prev) + Number(val);
            else if (op === '-') val = Number(prev) - Number(val);
            else if (op === '*') val = Number(prev) * Number(val);
            else if (op === '/') val = Number(prev) / Number(val);
          }
          env[varName] = val;
          scope[varName] = val;
          // Keep backward compatibility: older math blocks assign into _math.
          // Treat that as visible output so users see equation answers.
          if (varName === '_math') output.push(String(val));
          li++; continue;
        }

        // if / elif / else block
        if (stripped.startsWith('if ') && stripped.endsWith(':')) {
          const condition = stripped.slice(3, -1);
          const indent = line.match(/^(\s*)/)[1].length;
          li++;
          const ifBlock = [];
          while (li < blockLines.length) {
            const nextLine = blockLines[li];
            const nextIndent = nextLine.match(/^(\s*)/)[1].length;
            const nextStripped = nextLine.trim();
            if (nextStripped && nextIndent <= indent) break;
            ifBlock.push(nextLine.slice(indent + 2 < nextIndent ? indent + 2 : nextIndent));
            li++;
          }
          if (evalExpr(condition, env)) {
            execBlock(ifBlock, env);
          }
          // skip elif/else for now (basic support)
          continue;
        }

        // for i in range(n): or for i in list:
        const forMatch = stripped.match(/^for\s+(\w+)\s+in\s+(.+):$/);
        if (forMatch) {
          const iterVar = forMatch[1];
          const iterable = evalExpr(forMatch[2], env);
          const indent = line.match(/^(\s*)/)[1].length;
          li++;
          const forBlock = [];
          while (li < blockLines.length) {
            const nextLine = blockLines[li];
            const nextIndent = nextLine.match(/^(\s*)/)[1].length;
            const nextStripped = nextLine.trim();
            if (nextStripped && nextIndent <= indent) break;
            forBlock.push(nextLine);
            li++;
          }
          const items = Array.isArray(iterable) ? iterable : [];
          for (const item of items) {
            env[iterVar] = item;
            scope[iterVar] = item;
            execBlock(forBlock, env);
            if (output.length > 200) break; // safety limit
          }
          continue;
        }

        // while condition:
        const whileMatch = stripped.match(/^while\s+(.+):$/);
        if (whileMatch) {
          const condition = whileMatch[1];
          const indent = line.match(/^(\s*)/)[1].length;
          li++;
          const whileBlock = [];
          while (li < blockLines.length) {
            const nextLine = blockLines[li];
            const nextIndent = nextLine.match(/^(\s*)/)[1].length;
            const nextStripped = nextLine.trim();
            if (nextStripped && nextIndent <= indent) break;
            whileBlock.push(nextLine);
            li++;
          }
          let iterations = 0;
          while (evalExpr(condition, env) && iterations < 1000) {
            execBlock(whileBlock, env);
            iterations++;
          }
          continue;
        }

        // def function:
        const defMatch = stripped.match(/^def\s+(\w+)\(([^)]*)\)\s*:$/);
        if (defMatch) {
          const fnName = defMatch[1];
          const params = defMatch[2].split(',').map(p => p.trim()).filter(Boolean);
          const indent = line.match(/^(\s*)/)[1].length;
          li++;
          const fnBlock = [];
          while (li < blockLines.length) {
            const nextLine = blockLines[li];
            const nextIndent = nextLine.match(/^(\s*)/)[1].length;
            const nextStripped = nextLine.trim();
            if (nextStripped && nextIndent <= indent) break;
            fnBlock.push(nextLine);
            li++;
          }
          functions[fnName] = { params, body: fnBlock };
          continue;
        }

        // Function call (standalone, no assignment)
        const standaloneFnMatch = stripped.match(/^([a-zA-Z_]\w*)\(([^)]*)\)$/);
        if (standaloneFnMatch && functions[standaloneFnMatch[1]]) {
          evalExpr(stripped, env);
          li++; continue;
        }

        li++;
      }

      return returnVal;
    }

    execBlock(lines, scope);
  } catch (err) {
    errors.push(`Error: ${err.message}`);
  }

  return { output, errors, events };
}
