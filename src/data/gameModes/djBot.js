/** 🎵 DJ Bot — Beat Lab: sequences, loops and doing two things at once, with music. */
import * as B from './blocklyXml';
import { IMG, pad } from './art';
import { usesBlock } from './checks';

const { kick, snare, hihat, clap } = B.DRUMS;
const notes = (ctx) => ctx.probe.events.filter((e) => e.kind === 'note');
const drums = (ctx) => ctx.probe.events.filter((e) => e.kind === 'drum');

const djStarter = () => B.workspace(B.script([
  B.whenFlag(), B.tempo(120),
  B.drum(kick), B.drum(hihat), B.drum(snare), B.drum(hihat),
]));
const padScript = (d) => B.workspace(B.script([B.whenClicked(), B.drum(d)]));

/** Notes played, in order, contain `tune` back to back. */
const playedTune = (ctx, tune) => {
  const seq = notes(ctx).map((e) => e.value);
  for (let i = 0; i + tune.length <= seq.length; i++) {
    if (tune.every((n, k) => seq[i + k] === n)) return true;
  }
  return false;
};

const TWINKLE = [60, 60, 67, 67, 69, 69, 67];
const SCALE = [60, 62, 64, 65, 67, 69, 71, 72];

export const djBot = {
  id: 'dj-bot',
  title: 'DJ Bot',
  subtitle: 'Beat Lab',
  emoji: '🎵',
  color: '#ec4899',
  concept: 'Sequences & loops',
  blurb: 'Make beats, play tunes and run a whole band. Click the pads to jam live.',
  background: 'Neon City',
  extensions: ['music'],
  focus: 'DJ Bot',
  sprites: () => [
    { name: 'DJ Bot', img: IMG.bot, x: 0, y: -55, w: 66, h: 124, xml: djStarter() },
    { name: 'Kick Pad', img: pad('#f43f5e', 'KICK'), x: -165, y: 105, w: 64, h: 64, xml: padScript(kick) },
    { name: 'Snare Pad', img: pad('#f59e0b', 'SNARE'), x: -55, y: 105, w: 64, h: 64, xml: '' },
    { name: 'Hi-hat Pad', img: pad('#22d3ee', 'HI-HAT'), x: 55, y: 105, w: 64, h: 64, xml: '' },
    { name: 'Clap Pad', img: pad('#a3e635', 'CLAP'), x: 165, y: 105, w: 64, h: 64, xml: '' },
  ],
  challenges: [
    {
      id: 'loop-beat',
      title: 'Loop the beat',
      goal: 'Make a beat! Play 4 drums — kick, hi-hat, snare, hi-hat — and loop it 4 times: at least 16 drum hits.',
      hints: ['Under "when ▶ clicked" add "set tempo to 120", then 4 "play drum" blocks (Music).', 'Copying the drums 4 times works… but a loop is smarter.', 'Wrap the 4 drum blocks in "repeat 4".'],
      par: 7,
      check: (ctx) => {
        const n = drums(ctx).length;
        return n >= 16 ? { pass: true } : { pass: false, note: n ? `${n} drum hits — you need 16.` : 'Press ▶ Play to hear the beat.' };
      },
      solution: B.workspace(B.script([B.whenFlag(), B.tempo(120), B.repeat(4, B.drum(kick), B.drum(hihat), B.drum(snare), B.drum(hihat))])),
    },
    {
      id: 'twinkle',
      title: 'Twinkle, twinkle',
      goal: 'Play the start of "Twinkle Twinkle Little Star": notes 60, 60, 67, 67, 69, 69, then 67 for 1 beat.',
      hints: ['Use "play note" blocks — 60 is middle C.', 'Notes play one after another, top to bottom.', 'Try "set instrument" first to pick a sound you like.'],
      par: 10,
      star2: { label: 'Picked an instrument', test: (ctx) => usesBlock(ctx.xml('DJ Bot'), 'bb_music_instrument') },
      check: (ctx) => (playedTune(ctx, TWINKLE)
        ? { pass: true }
        : { pass: false, note: notes(ctx).length ? `Notes played: ${notes(ctx).map((e) => e.value).slice(-8).join(', ')}` : 'Add play note blocks under a "when flag clicked".' }),
      solution: B.workspace(B.script([B.whenFlag(), B.tempo(120), B.instrument(0), ...TWINKLE.map((n, i) => B.note(n, i === 6 ? 1 : 0.5))])),
    },
    {
      id: 'scale',
      title: 'Climb the scale',
      goal: 'Play the C major scale going up: 60, 62, 64, 65, 67, 69, 71, 72 (do, re, mi, fa, so, la, ti, do!).',
      hints: ['Each note is a "play note" block — 60 is the low C.', 'The notes go up, but not always by the same amount: 64 → 65 is only 1.', 'Pick an instrument first with "set instrument".'],
      par: 11,
      star2: { label: 'Picked an instrument', test: (ctx) => usesBlock(ctx.xml('DJ Bot'), 'bb_music_instrument') },
      check: (ctx) => (playedTune(ctx, SCALE)
        ? { pass: true }
        : { pass: false, note: notes(ctx).length ? `Notes played: ${notes(ctx).map((e) => e.value).slice(-8).join(', ')}` : 'Add "play note" blocks under "when ▶ clicked".' }),
      solution: B.workspace(B.script([B.whenFlag(), B.tempo(120), B.instrument(0), ...SCALE.map((n) => B.note(n, 0.5))])),
    },
    {
      id: 'band',
      title: 'Full band',
      goal: 'Play a beat AND a tune at the same time. Use two "when flag clicked" scripts.',
      hints: ['Every "when flag clicked" script starts at the same moment.', 'Script 1: repeat 4 drums. Script 2: play your tune.'],
      par: 16,
      check: (ctx) => {
        const d = drums(ctx); const n = notes(ctx);
        const together = n.some((x) => d.some((y) => Math.abs(x.t - y.t) < 120));
        if (d.length >= 4 && n.length >= 4 && together) return { pass: true };
        return { pass: false, note: `${d.length} drums and ${n.length} notes${d.length && n.length && !together ? ' — but not at the same time' : ''}.` };
      },
      solution: B.workspace(
        B.script([B.whenFlag(), B.tempo(120), B.repeat(4, B.drum(kick), B.drum(hihat), B.drum(snare), B.drum(hihat))]),
        B.script([B.whenFlag(), B.instrument(3), ...TWINKLE.map((n) => B.note(n, 0.5))], 24, 300),
      ),
    },
    {
      id: 'speed-up',
      title: 'Build it up',
      goal: 'Make a beat that gets faster each time round — like the build-up before a drop!',
      hints: ['Put "change tempo by 20" inside your repeat loop.', 'Play at least 12 drums so you can hear it speed up.'],
      par: 9,
      check: (ctx) => {
        const d = drums(ctx);
        if (d.length < 12) return { pass: false, note: `${d.length} drum hits — play at least 12.` };
        const gap = (i) => d[i + 1].t - d[i].t;
        const first = gap(0); const last = gap(d.length - 2);
        return last < first * 0.8 ? { pass: true } : { pass: false, note: 'The beat is not getting faster yet.' };
      },
      solution: B.workspace(B.script([B.whenFlag(), B.tempo(100), B.repeat(4, B.drum(kick), B.drum(hihat), B.drum(snare), B.drum(hihat), B.changeTempo(40))])),
    },
    {
      id: 'drop',
      title: 'The drop',
      goal: 'Build-up, then the DROP! DJ Bot plays 4 hi-hats, then broadcasts the message "drop". When the Kick Pad receives "drop", it plays 8 big kicks.',
      hints: ['DJ Bot: when ▶ clicked → repeat 4: play drum Hi-hat → then "broadcast drop" (Events).', 'Click the Kick Pad. Add "when I receive drop".', 'Under it: repeat 8 → play drum Kick.'],
      par: 6,
      check: (ctx) => {
        if (!usesBlock(ctx.xml('DJ Bot'), 'event_broadcast')) return { pass: false, note: 'DJ Bot needs a "broadcast" block.' };
        const pads = ['Kick Pad', 'Snare Pad', 'Hi-hat Pad', 'Clap Pad'];
        if (!pads.some((n) => usesBlock(ctx.xml(n), 'event_whenreceivemessage'))) return { pass: false, note: 'Give the Kick Pad a "when I receive drop" script.' };
        const kicks = drums(ctx).filter((e) => e.value === kick).length;
        return kicks >= 8 ? { pass: true } : { pass: false, note: `${kicks} kicks after the drop — you need 8.` };
      },
      solution: B.workspace(B.script([B.whenFlag(), B.tempo(120), B.repeat(4, B.drum(hihat)), B.broadcast('drop')])),
      solutionFor: { 'Kick Pad': B.workspace(B.script([B.whenClicked(), B.drum(kick)]), B.script([B.whenReceive('drop'), B.repeat(8, B.drum(kick, 0.25))], 24, 140)) },
    },
    {
      id: 'pads',
      title: 'Live pads',
      goal: 'The KICK pad plays when you click it. Make the other 3 pads play their drum too, then jam live!',
      hints: ['Click a pad sprite, then add "when this sprite clicked" + "play drum".', 'Snare = Snare Drum, Hi-hat = Hi-hat, Clap = Clap.', 'Press ▶ Play, then click the pads to play them.'],
      par: 8,
      star2: { label: 'Played all 4 pads', test: (ctx) => new Set(drums(ctx).map((e) => e.value)).size >= 4 },
      check: (ctx) => {
        const ready = ['Snare Pad', 'Hi-hat Pad', 'Clap Pad'].filter((n) => usesBlock(ctx.xml(n), 'event_whenthisspriteclicked') && usesBlock(ctx.xml(n), 'bb_music_drum'));
        const played = new Set(drums(ctx).map((e) => e.value)).size;
        if (ready.length === 3 && played >= 3) return { pass: true };
        if (ready.length < 3) return { pass: false, note: `${ready.length} of 3 pads have a script.` };
        return { pass: false, note: 'Now press ▶ Play and click the pads!' };
      },
      solutionFor: { 'Snare Pad': padScript(snare), 'Hi-hat Pad': padScript(hihat), 'Clap Pad': padScript(clap) },
    },
  ],
};
