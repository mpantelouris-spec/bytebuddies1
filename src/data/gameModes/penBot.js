/** 🖍️ Pen Bot — Art Studio: loops and angles by drawing shapes. */
import * as B from './blocklyXml';
import { IMG } from './art';
import { turtlePath, trailLines, matchDrawing, usesBlock } from './checks';

const START = [-60, 60];

const starter = (extra = []) => B.workspace(B.script([
  B.whenFlag(), B.eraseAll(), B.goTo(START[0], START[1]), B.pointIn(90),
  B.penColor('#7c3aed'), B.penSize(4), B.penDown(),
  ...extra,
]));

/** Pass when the drawing matches the dotted shape well enough. */
const shapeCheck = (ghostCmds) => (ctx) => {
  const bot = ctx.sprite('Pen Bot');
  const drawn = trailLines(bot?._pen?.trail);
  if (!drawn.length) return { pass: false, note: 'Press ▶ Play to draw.' };
  const { match, covered, extra } = matchDrawing(drawn, turtlePath(START, ghostCmds));
  if (match >= 0.86) return { pass: true };
  if (covered < 0.86) return { pass: false, note: `Your drawing covers ${Math.round(covered * 100)}% of the dotted shape.` };
  return { pass: false, note: `Close! ${Math.round(extra * 100)}% of your lines are outside the shape.` };
};

const SQUARE = [['repeat', 4, [['fd', 100], ['rt', 90]]]];
const HEXAGON = [['repeat', 6, [['fd', 70], ['rt', 60]]]];
const CIRCLE = [['repeat', 36, [['fd', 10], ['rt', 10]]]];
const TRIANGLE = [['repeat', 3, [['fd', 120], ['rt', 120]]]];
const STAR = [['repeat', 5, [['fd', 150], ['rt', 144]]]];
const FLOWER = [['repeat', 6, [['repeat', 6, [['fd', 40], ['rt', 60]]], ['rt', 60]]]];
const SPIRAL = Array.from({ length: 18 }, (_, i) => [['fd', 8 * (i + 1)], ['rt', 90]]).flat();

export const penBot = {
  id: 'pen-bot',
  title: 'Pen Bot',
  subtitle: 'Art Studio',
  emoji: '🖍️',
  color: '#7c3aed',
  concept: 'Loops & angles',
  blurb: 'Draw squares, stars and rainbow flowers. Match the dotted shape to win stars.',
  background: 'Art Studio',
  extensions: ['pen'],
  focus: 'Pen Bot',
  sprites: () => [
    { name: 'Pen Bot', img: IMG.robot, x: START[0], y: START[1], w: 30, h: 36, xml: starter([B.move(100), B.turnRight(90)]) },
  ],
  challenges: [
    {
      id: 'square',
      title: 'Perfect square',
      goal: 'Draw the dotted square. Pen Bot starts at the corner of the dotted square. A square has 4 equal sides of 100 steps and 4 turns of 90°.',
      hints: ['Under "when ▶ clicked": "erase all", then "pen down" (from Pen).', 'Use a "repeat 4" loop with "move 100 steps" and "turn ↻ 90 degrees" inside.', 'If Pen Bot has wandered off, start with "go to x: -60 y: 60" and "point in direction 90".'],
      par: 10,
      ghost: turtlePath(START, SQUARE),
      check: shapeCheck(SQUARE),
      solution: starter([B.repeat(4, B.move(100), B.turnRight(90))]),
    },
    {
      id: 'triangle',
      title: 'Triangle',
      goal: 'Draw the dotted triangle: 3 sides of 120 steps.',
      hints: ['A triangle has 3 sides — so repeat 3.', 'The robot has to turn the outside angle: 360 ÷ 3 = 120°.'],
      par: 10,
      ghost: turtlePath(START, TRIANGLE),
      check: shapeCheck(TRIANGLE),
      solution: starter([B.repeat(3, B.move(120), B.turnRight(120))]),
    },
    {
      id: 'hexagon',
      title: 'Honeycomb hexagon',
      goal: 'Bees build hexagons! Draw the dotted hexagon: 6 sides of 70 steps.',
      hints: ['A hexagon has 6 sides — so how many times should the loop repeat?', 'All the turns add up to one full turn: 360 ÷ 6 = 60°.', 'repeat 6: move 70 steps, turn ↻ 60 degrees.'],
      par: 10,
      ghost: turtlePath(START, HEXAGON),
      check: shapeCheck(HEXAGON),
      solution: starter([B.repeat(6, B.move(70), B.turnRight(60))]),
    },
    {
      id: 'star',
      title: 'Five-point star',
      goal: 'Draw the dotted star with 5 lines of 150 steps.',
      hints: ['A star is 5 lines — repeat 5.', 'Each turn is 144°. (Two full turns ÷ 5 points = 720 ÷ 5.)'],
      par: 10,
      ghost: turtlePath(START, STAR),
      check: shapeCheck(STAR),
      solution: starter([B.repeat(5, B.move(150), B.turnRight(144))]),
    },
    {
      id: 'circle',
      title: 'Round and round',
      goal: 'Draw the dotted circle. Computers draw circles as lots of tiny steps and tiny turns: 36 steps of 10, turning 10° each time.',
      hints: ['How many 10° turns make one full turn? 360 ÷ 10 = ?', 'repeat 36: move 10 steps, turn ↻ 10 degrees.', 'Want a bigger circle? Use longer steps — the turns stay the same.'],
      par: 10,
      ghost: turtlePath(START, CIRCLE),
      check: shapeCheck(CIRCLE),
      solution: starter([B.repeat(36, B.move(10), B.turnRight(10))]),
    },
    {
      id: 'flower',
      title: 'Rainbow flower',
      goal: 'Draw 6 hexagons in a circle to make a flower. Bonus: make every petal a new colour!',
      hints: ['One hexagon = repeat 6: move 40, turn 60.', 'Put the hexagon inside another "repeat 6", turning 60 after each one.', 'Add "change pen colour by 15" inside the big loop for a rainbow.'],
      par: 13,
      star2: { label: 'Rainbow colours', test: (ctx) => usesBlock(ctx.xml('Pen Bot'), 'bb_pen_change_color') },
      ghost: turtlePath(START, FLOWER),
      check: shapeCheck(FLOWER),
      solution: starter([B.repeat(6, B.repeat(6, B.move(40), B.turnRight(60)), B.turnRight(60), B.changePenColor(15))]),
    },
    {
      id: 'spiral',
      title: 'Square spiral',
      goal: 'Draw the dotted spiral. Each side is 8 steps longer than the last one.',
      hints: ['Start with "erase all", "go to x: -60 y: 60", "point in direction 90" and "pen down" so the spiral begins on the dot.', 'Make a variable called "side" and set it to 8.', 'Repeat 18: move (side) steps, turn 90, change side by 8.', 'Drag the orange "side" reporter into the move block\'s number.'],
      par: 13,
      star2: { label: 'Used a variable', test: (ctx) => usesBlock(ctx.xml('Pen Bot'), 'data_changevariableby') },
      ghost: turtlePath(START, SPIRAL),
      check: shapeCheck(SPIRAL),
      solution: starter([B.setVar('side', 8), B.repeat(18, B.moveBy(B.getVar('side')), B.turnRight(90), B.changeVar('side', 8))]),
    },
    {
      id: 'stamp-art',
      title: 'Stamp a pattern',
      goal: 'Free art! Use "stamp" in a loop to print Pen Bot at least 8 times in a pattern.',
      hints: ['Try: repeat 12 → stamp, move 60, turn 30.', 'Change the pen colour or size inside the loop to make it pop.'],
      par: 12,
      check: (ctx) => {
        const stamps = (ctx.sprite('Pen Bot')?._pen?.trail || []).filter((p) => p.stamp).length;
        if (stamps >= 8) return { pass: true };
        return { pass: false, note: stamps ? `${stamps} stamps so far — make at least 8.` : 'Use the ✏️ stamp block inside a loop.' };
      },
      solution: starter([B.penUp(), B.repeat(12, B.stamp(), B.move(60), B.turnRight(30))]),
    },
  ],
};
