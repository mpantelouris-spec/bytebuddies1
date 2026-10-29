/** Game Modes for the Game Builder: ready-made games with step-by-step challenges. */
import { penBot } from './penBot';
import { djBot } from './djBot';
import { jumpBot } from './jumpBot';
import { mazeBot } from './mazeBot';
import { launchBot } from './launchBot';
import { catchBot } from './catchBot';
import { pongBot } from './pongBot';
import { blasterBot } from './blasterBot';
import { flapBot } from './flapBot';
import { quizBot } from './quizBot';
import { chaseBot } from './chaseBot';

import * as B from './blocklyXml';

/**
 * Pupils write the code for the main sprite themselves: it starts with only a
 * "when ▶ clicked" hat. The rest of the game (falling apples, walls, meteors…)
 * keeps its own scripts — that's the game world, not the pupil's task.
 * Modes listed here keep their tiny setup (Blaster's laser just hides itself).
 */
const KEEP_FOCUS_SETUP = new Set(['blaster-bot']);
const EMPTY_START = B.workspace(B.script([B.whenFlag()]));
const pupilWritesFocus = (mode) => (KEEP_FOCUS_SETUP.has(mode.id) ? mode : {
  ...mode,
  sprites: () => mode.sprites().map((sp) => (sp.name === mode.focus ? { ...sp, xml: EMPTY_START } : sp)),
});

export const GAME_MODES = [penBot, mazeBot, djBot, jumpBot, catchBot, launchBot, pongBot, blasterBot, flapBot, chaseBot, quizBot].map(pupilWritesFocus);
export const findGameMode = (id) => GAME_MODES.find((m) => m.id === id) || null;
