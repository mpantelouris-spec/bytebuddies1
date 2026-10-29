/** ❓ Quiz Bot — Brain Teaser: asking questions, answers and if/else. */
import * as B from './blocklyXml';
import { IMG } from './art';
import { usesBlock } from './checks';

const QUESTIONS = [['What is 3 + 4?', 7], ['What is 6 × 2?', 12], ['How many legs does a spider have?', 8]];

const question = ([q, a], withElse, counter) => {
  const right = [B.say('Correct!', 1), B.addScore(1), counter && B.changeVar('right', 1)];
  return [B.ask(q), withElse ? B.ifElse(B.equals(B.answer(), a), right, [B.say('Not quite!', 1)]) : B.ifThen(B.equals(B.answer(), a), ...right)];
};

const hostScript = ({ withElse = false, count = 1, counter = false } = {}) => B.workspace(B.script([
  B.whenFlag(), B.setScore(0), counter && B.setVar('right', 0),
  ...QUESTIONS.slice(0, count).flatMap((q) => question(q, withElse, counter)),
  counter && B.ifThen(B.equals(B.getVar('right'), 3), B.say('You got them all!', 2), B.win()),
]));

/** Keep asking until the answer is right. */
const retryScript = () => B.workspace(B.script([
  B.whenFlag(), B.setScore(0),
  B.ask('What is 3 + 4?'),
  B.repeatUntil(B.equals(B.answer(), 7), B.say('Try again!', 1), B.ask('What is 3 + 4?')),
  B.say('Correct!', 1), B.addScore(1),
]));
/** Three lives: every wrong answer costs one. */
const strikesScript = () => B.workspace(B.script([
  B.whenFlag(), B.setScore(0), B.setLives(3),
  ...QUESTIONS.flatMap(([q, a]) => [B.ask(q), B.ifElse(B.equals(B.answer(), a), [B.say('Correct!', 1), B.addScore(1)], [B.say('Not quite!', 1), B.loseLife()])]),
]));

export const quizBot = {
  id: 'quiz-bot',
  title: 'Quiz Bot',
  subtitle: 'Brain Teaser',
  emoji: '❓',
  color: '#f59e0b',
  concept: 'Input & if / else',
  blurb: 'Build a quiz show! Ask questions, check the answers and keep score.',
  background: 'Classroom',
  extensions: [],
  focus: 'Host',
  sprites: () => [
    { name: 'Host', img: IMG.robot, x: 0, y: -30, w: 110, h: 132, xml: hostScript() },
  ],
  challenges: [
    {
      id: 'else',
      title: 'Wrong answers too',
      goal: 'Make the robot ask "What is 3 + 4?". If the answer is 7, say "Correct!" and add 1 to score. If not, say "Not quite!" — use if / else.',
      hints: ['Under "when ▶ clicked": "set score to 0", then "ask What is 3 + 4? and wait" (Sensing).', 'Use "if … then … else" with "(answer) = 7" as the question.', 'In the "then" part: "say Correct! for 1 seconds" and "add 1 to score".', 'In the "else" part: "say Not quite! for 1 seconds".'],
      par: 9,
      star2: { label: 'Tried a wrong answer', test: (ctx) => ctx.score === 0 },
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Host'), 'control_if_else')) return { pass: false, note: 'Use an "if … then … else" block.' };
        const h = ctx.sprite('Host');
        if (h?._sayText) ctx.memo.spoke = true;
        return ctx.memo.spoke ? { pass: true } : { pass: false, note: 'Press ▶ Play and answer the question.' };
      },
      solution: hostScript({ withElse: true }),
    },
    {
      id: 'retry',
      title: 'Try again',
      goal: 'Keep asking "What is 3 + 4?" until the player gets it right. Say "Try again!" after a wrong answer, then "Correct!" and add 1 to score.',
      hints: ['Ask the question once first.', 'Then "repeat until (answer) = 7" (Control): inside it, say "Try again!" and ask the question again.', 'After the loop the answer must be right: say "Correct!" and add 1 to score.'],
      par: 11,
      star2: { label: 'Tried a wrong answer first', test: (ctx) => ctx.memo.wrong === true },
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Host'), 'control_repeatuntil')) return { pass: false, note: 'Use a "repeat until" loop.' };
        const said = ctx.sprite('Host')?._sayText || '';
        if (/try again/i.test(said)) ctx.memo.wrong = true;
        return ctx.score >= 1 ? { pass: true } : { pass: false, note: 'Answer the question — try a wrong answer first!' };
      },
      solution: retryScript(),
    },
    {
      id: 'three',
      title: 'Three questions',
      goal: 'Add two more questions — "What is 6 × 2?" and "How many legs does a spider have?" — and score a point for each right answer.',
      hints: ['Right-click the ask block and Duplicate the whole question.', 'Change the question and the number in the = block.'],
      par: 23,
      star2: { label: 'Kept the else for every question', test: (ctx) => (ctx.xml('Host').match(/control_if_else/g) || []).length >= 3 },
      check: (ctx) => (ctx.score >= 3 ? { pass: true } : { pass: false, note: `Score: ${ctx.score} of 3. Answer all three questions right.` }),
      solution: hostScript({ withElse: true, count: 3 }),
    },
    {
      id: 'strikes',
      title: 'Three strikes',
      goal: 'Give the player 3 lives. Every wrong answer loses a life.',
      hints: ['At the start: set lives to 3 (Game).', 'In every "else" part, add "lose a life" under "say Not quite!".', 'Answer one question wrong to test it.'],
      par: 27,
      star2: { label: 'Kept all 3 lives', test: (ctx) => ctx.probe.count('lose-life') === 0 },
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Host'), 'bb_game_lose_life')) return { pass: false, note: 'Add "lose a life" for wrong answers.' };
        return ctx.probe.count('lose-life') > 0 || ctx.score >= 3 ? { pass: true } : { pass: false, note: 'Answer the questions — try one wrong.' };
      },
      solution: strikesScript(),
    },
    {
      id: 'champion',
      title: 'Quiz champion',
      goal: 'Count right answers in a variable "right". If right = 3 at the end, say "You got them all!" and win.',
      hints: [
        'Make a variable "right" and set it to 0 at the start.',
        'Change right by 1 inside each correct answer.',
        'At the end: if right = 3 then say … and 🏆 win.',
      ],
      par: 32,
      star2: { label: 'Perfect score', test: (ctx) => ctx.score >= 3 },
      check: (ctx) => {
        if (!usesBlock(ctx.xml('Host'), 'data_changevariableby')) return { pass: false, note: 'Use "change right by 1" for each correct answer.' };
        return ctx.probe.won ? { pass: true } : { pass: false, note: 'Get all three right to win.' };
      },
      solution: hostScript({ withElse: true, count: 3, counter: true }),
    },
  ],
};
