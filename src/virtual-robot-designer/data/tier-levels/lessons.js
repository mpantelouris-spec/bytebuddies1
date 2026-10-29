/**
 * What each mode 11–50 teaches. Every lesson is worked out from that level's own
 * content — the repeat hiding in a flight path, the angles an arm job needs, the
 * maths in a race target — plus a real-world fact that fits the level's theme.
 */

const FACTS = {
  sky_rings: [
    'Drones stay up because spinning propellers push air down. That push is called thrust.',
    'To turn, a quadcopter spins some of its propellers faster than the others.',
    'Pilots plan a route as a list of waypoints, just like your list of blocks.',
    'Air gets thinner the higher you fly, so propellers have to work harder.',
  ],
  sky_deliver: [
    'Real delivery drones follow GPS waypoints to reach each address.',
    'A heavy parcel drains a drone’s battery faster, so engineers keep loads light.',
    'Medical drones in some countries fly blood and medicine to remote clinics.',
  ],
  sky_photo: [
    'Scientists use drones to count animals from the air without disturbing them.',
    'Mapping drones take hundreds of overlapping photos and join them into one big map.',
    'Farmers use drone photos to spot thirsty or sick crops.',
  ],
  sky_land: [
    'Helipads have a big H so pilots can find them from far away.',
    'A gentle landing means slowing down before touchdown. Engineers call it a controlled descent.',
    'Rescue helicopters land on tiny pads on mountains, ships and hospital roofs.',
  ],
  sky_lights: [
    'Drone light shows use hundreds of drones, each running its own program with exact timing.',
    'Every drone in a light show knows its position to within a few centimetres.',
  ],
  race: [
    'Racing drones can fly faster than 150 km/h. Pilots practise in simulators first, just like you.',
    'The fastest racing line is not always the shortest path: smooth turns keep your speed up.',
    'Race pilots wear goggles that show live video from a camera on the drone.',
  ],
  jet: [
    'Planes turn by banking: tilting their wings, like Bank left and Bank right.',
    'Aircraft carriers use catapults to launch jets from a short runway.',
    'Jets fly high where the air is thin, so they use less fuel.',
    'Wings are curved so air moving over them creates lift.',
  ],
  sea: [
    'Submarines dive by letting water into ballast tanks and rise by blowing it out.',
    'Sonar sends out a sound and listens for the echo to “see” in dark water.',
    'Coral reefs cover less than 1% of the sea floor but are home to about a quarter of sea life.',
    'Giant kelp can grow about half a metre in a single day.',
    'Sea turtles find their way across oceans using Earth’s magnetic field.',
    'Deep-sea vents support life without any sunlight at all.',
    'Water pressure doubles every 10 metres you dive, so deep robots need strong hulls.',
    'Ocean robots help scientists clean up plastic and map the sea floor.',
  ],
  arm: [
    'Factory robot arms repeat the same move thousands of times without getting tired.',
    'A full turn is 360°. A right angle is 90°, a quarter of a turn.',
    'Recycling plants use cameras and robot arms to sort paper, plastic and metal.',
    'Surgeons use robot arms for tiny, steady movements.',
    'Putting things in number order is called sorting. Computers do it billions of times a day.',
    'Robot arms in bakeries decorate cakes and pack biscuits.',
  ],
  walker: [
    'Humanoid robots balance by keeping their centre of mass over their feet.',
    'Robots use a sensor called a gyroscope to feel when they start to tip.',
    'Walking robots help in places with stairs and rubble where wheels get stuck.',
    'Some humanoid robots can dance, jump and even do backflips.',
  ],
  spider: [
    'Six- and eight-legged robots stay steady because some legs stay down while others step.',
    'Spider silk is stronger than a steel thread of the same thickness.',
    'Legged robots can climb rubble to search for people after earthquakes.',
    'Engineers copy animals to design robots. This is called biomimicry.',
  ],
  lego: [
    'Engineers build quick models called prototypes to test ideas before making the real thing.',
    'Gears can make a motor turn faster or push harder, but not both at once.',
    'Many engineers started out building with bricks as children.',
    'Robots in warehouses move shelves to people instead of people walking to shelves.',
  ],
  kart: [
    'Average speed = distance ÷ time.',
    'Tyres grip the road using friction. Too fast into a corner and the grip runs out.',
    'Racing teams test cars in computer simulations before real races.',
    'Self-driving cars use cameras, radar and code to stay in their lane.',
  ],
  football: [
    'Robots have played football in the RoboCup tournament since 1997.',
    'Aiming at the far post gives the goalkeeper more ground to cover.',
    'Robot players use sensors to track the ball many times every second.',
    'Passing works because the ball moves faster than any player can run.',
  ],
  boxing: [
    'Reaction time is how quickly you respond. Sensors let robots react in milliseconds.',
    'Every punch costs stamina. Good fighters manage their energy, just like a variable.',
    'Engineers test robot joints thousands of times so they don’t break.',
  ],
  flappy: [
    'Gravity pulls things down at the same rate. Each flap is an upward push.',
    'Birds flap to make lift and glide to save energy.',
    'Game physics uses simple rules for speed and gravity, run many times a second.',
  ],
  craft: [
    'A crafting recipe is an algorithm: inputs, then steps, then an output.',
    'Iron is made by heating iron ore with carbon in a furnace. This is called smelting.',
    'Diamonds form deep underground under huge heat and pressure.',
    'Bridges need support. Engineers check how much weight each part can hold.',
    'Planning which resources you need first saves time. Engineers call it a build order.',
  ],
};

/** Find a run of tokens that repeats back-to-back (e.g. F1 A R90 F1 A R90…). */
export function findRepeat(tokens) {
  let best = null;
  for (let len = 2; len <= 6; len++) {
    for (let start = 0; start + len * 2 <= tokens.length; start++) {
      const unit = tokens.slice(start, start + len).join(' ');
      let times = 1;
      while (tokens.slice(start + times * len, start + (times + 1) * len).join(' ') === unit) times++;
      const startsWithMove = !/^A/.test(tokens[start]);
      const worth = times * len + (startsWithMove ? 1 : 0) + (times >= 3 ? 2 : 0);
      if (times >= 2 && (times >= 3 || len >= 3) && (!best || worth > best.worth)) best = { start, len, times, unit, worth };
    }
  }
  return best;
}

const SKY_WORD = { U: 'Fly up', D: 'Fly down', F: 'Fly forward', R: 'Bank right', L: 'Bank left', A: 'action' };
const SEA_WORD = { D: 'Dive', F: 'Swim forward', R: 'Turn right', L: 'Turn left', A: 'action' };
const ACTION_NAME = { drop_package: 'Drop package', take_photo: 'Take photo', light_up: 'Light up', land: 'Land', scan_here: 'Scan here', pick_up: 'Pick up' };
const describe = (unit, words, action) => unit.split(' ').map((t) => (t === 'A' ? (ACTION_NAME[action] || 'your action') : `${words[t[0]]}${t.length > 1 ? ` ${t.slice(1)}` : ''}`)).join(', ');

const listJoin = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : xs[0]);

function pickFact(pool, level) {
  const list = FACTS[pool] || FACTS.sky_rings;
  return list[(Number(level.mode) - 11) % list.length];
}

function courseLesson(level, words, poolFor) {
  const tokens = level.program.split(' ');
  const rep = findRepeat(tokens);
  const turns = tokens.filter((t) => /^[RL]/.test(t));
  const angles = [...new Set(turns.map((t) => Number(t.slice(1))))];
  const climbs = tokens.filter((t, i) => i > 0 && /^[UD]/.test(t) && t !== 'U5').length;
  const fact = pickFact(poolFor(level), level);
  if (rep && level.tier !== 'Easy') {
    return {
      skill: 'Loops',
      concept: `Repeat ${rep.times}`,
      tryThis: `Spot the pattern: “${describe(rep.unit, words, level.action)}” happens ${rep.times} times in a row. Put it inside a Repeat ${rep.times} block.`,
      question: 'How many blocks did the Repeat save you?',
      fact,
    };
  }
  if (angles.length > 1) {
    return {
      skill: 'Angles',
      concept: 'Turning by degrees',
      tryThis: `This route mixes ${listJoin(angles.sort((a, b) => a - b).map((a) => `${a}°`))} turns. Two 45° turns make a 90° corner. Check each one as you build.`,
      question: 'Which turns face you back the way you started?',
      fact,
    };
  }
  if (climbs) {
    return {
      skill: 'Coordinates',
      concept: 'Height as well as distance',
      tryThis: `The route changes height ${climbs} time${climbs > 1 ? 's' : ''}. Watch the height number as well as the direction.`,
      question: 'What happens if you climb too early?',
      fact,
    };
  }
  const moves = tokens.filter((t) => t !== 'A').length - 1;
  const stops = tokens.filter((t) => t === 'A').length;
  const turnText = turns.length ? ` and ${turns.length === 1 ? `one ${Number(turns[0].slice(1))}° turn` : `${turns.length} turns`}` : '';
  return {
    skill: 'Sequencing',
    concept: 'Order matters',
    tryThis: `This route is ${moves} moves${turnText}${stops ? `, with ${stops} ${ACTION_NAME[level.action] || 'action'} stop${stops > 1 ? 's' : ''}` : ''}. Add the missing blocks in order, run it, then fix one block at a time.`,
    question: 'What happens if two blocks swap places?',
    fact,
  };
}

const skyPool = (chassisId) => (level) => (chassisId === 'racedrone' ? 'race' : chassisId === 'jetplane' ? 'jet' : `sky_${level.kind}`);

function armLesson(level) {
  const turns = new Set();
  const all = [...(level.task.items || []), ...(level.task.targets || []), ...(level.task.sources || []), ...(level.task.bells || [])];
  all.forEach((o) => turns.add(Math.abs(o.angle)));
  const odd = [...turns].filter((a) => a % 45 !== 0);
  const ARM_FACT = { bells: 4, recycle: 2, cherry: 5, sort: 0, tower: 0, paint: 3, seeds: 0, marble: 0, car: 0 };
  const firstJob = String(level.jobs || '').split('×')[0];
  const fact = odd => FACTS.arm[ARM_FACT[firstJob] ?? 1];
  if (level.task.sources?.length) {
    const src = level.task.sources[0];
    return { skill: 'Loops', concept: 'Repeat a job', tryThis: `Fetching from the ${src.kind === 'bowl' ? 'bowl' : src.kind === 'seedBag' ? 'seed bag' : 'cup'} is the same moves each time. Use a Repeat block.`, question: 'Which blocks change each time, and which stay the same?', fact: fact() };
  }
  if (level.task.bells?.length > 2) {
    return { skill: 'Sorting', concept: 'Put numbers in order', tryThis: 'Read the numbers on the bells and plan the order before you move the arm.', question: 'What is the smallest number of turns you need?', fact: fact() };
  }
  if (odd.length) {
    return { skill: 'Angles', concept: 'Precise degrees', tryThis: `Some things sit at ${odd.slice(0, 3).map((a) => `${a}°`).join(', ')}. Work out each turn: where you are now, minus where you need to be.`, question: 'How many degrees is a quarter turn? A half turn?', fact: FACTS.arm[1] };
  }
  return { skill: 'Sequencing', concept: 'Grip, lift, turn, release', tryThis: 'Every move is: lower, grip, raise, turn, release. Build one move, test it, then copy it.', question: 'What goes wrong if you turn before you lift?', fact: fact() };
}

function groundLesson(chassisId, level) {
  const pool = chassisId === 'spider' ? 'spider' : chassisId === 'legobot' ? 'lego' : 'walker';
  const fact = pickFact(pool, level);
  const corners = Math.max(0, (level.route?.length || 4) - 4) / 2;
  if (level.tier === 'Easy') return { skill: 'Sequencing', concept: 'Step by step', tryThis: `Walk, turn, walk. There ${corners === 1 ? 'is 1 corner' : `are ${Math.round(corners)} corners`} to plan for.`, question: 'How many steps to the first marker?', fact };
  if (level.tier === 'Medium') return { skill: 'Loops', concept: 'Repeat the same visit', tryThis: `Each of the ${level.markers} markers needs the same action. Move, then ${level.action ? 'act' : 'check'}: repeat that pattern.`, question: 'Which part of your program repeats?', fact };
  if (level.tier === 'Hard') return { skill: 'Debugging', concept: 'Test in parts', tryThis: 'Build to the first marker and run it. When that works, add the next part.', question: 'Where did the robot first go wrong, and why?', fact };
  return { skill: 'Decomposition', concept: 'Break the job up', tryThis: `Split the ${level.markers} markers into small jobs. Solve each one, then join them together.`, question: 'Which jobs look the same? Could one block of code do both?', fact };
}

export function getTierLesson(chassisId, engine, level) {
  if (!level) return null;
  if (engine === 'sky') return courseLesson(level, SKY_WORD, skyPool(chassisId));
  if (engine === 'sea') return courseLesson(level, SEA_WORD, () => 'sea');
  if (engine === 'arm') return armLesson(level);
  if (engine === 'ground') return groundLesson(chassisId, level);
  const fact = pickFact(engine, level);
  if (engine === 'kart') {
    const perLap = Math.round(level.targetTime / level.laps);
    return { skill: 'Maths & loops', concept: 'Speed, distance and time', tryThis: level.laps === 1 ? `Finish the lap in ${level.targetTime} seconds. Set your speed, then follow the track.` : `${level.laps} laps in ${level.targetTime} seconds means about ${perLap} seconds a lap. Code one lap well, then let it repeat.`, question: 'If you finish one lap faster, how much time do you save over the whole race?', fact };
  }
  if (engine === 'football') return { skill: level.tier === 'Easy' ? 'Events' : 'If / else', concept: level.tier === 'Easy' ? 'When this happens, do that' : 'Making decisions', tryThis: level.tier === 'Easy' ? 'Use When START, then Chase ball and Shoot.' : 'Use If: if you have the ball, dribble or shoot; else chase the ball.', question: 'What should your robot do when it doesn’t have the ball?', fact };
  if (engine === 'boxing') return { skill: level.tier === 'Easy' ? 'Sequencing' : 'Conditions', concept: level.tier === 'Easy' ? 'Combos in order' : 'React to your opponent', tryThis: level.tier === 'Easy' ? 'Build a combo: jab, jab, block. Order changes what happens.' : `Use If: if ${level.enemyType === 'tank' ? 'the Tank guards, wait' : 'the opponent is close, punch'}; else move in. Watch your stamina.`, question: 'What is the best thing to do when your stamina is low?', fact };
  if (engine === 'flappy') return { skill: level.tier === 'Easy' ? 'Loops' : 'Conditions', concept: level.tier === 'Easy' ? 'Repeat a flap' : 'Flap only when needed', tryThis: level.tier === 'Easy' ? 'Use Forever with Flap and Wait. Change the Wait until you stay in the air.' : `Use If: if you are below the gap, flap. You need ${level.target} pipes.`, question: 'What happens if you flap too often?', fact };
  if (engine === 'craft') {
    const CRAFT_FACT = { 1: 4, 2: 0, 3: 3, 4: 1, 5: 2, 6: 3, 7: 3, 8: 2, 9: 3, 10: 0 };
    level = { ...level, _fact: FACTS.craft[CRAFT_FACT[level.world] ?? 0] };
  }
  if (engine === 'craft') return { skill: level.tier === 'Easy' ? 'Sequencing' : level.tier === 'Medium' ? 'Loops' : 'Planning', concept: 'Algorithms in a voxel world', tryThis: level.tier === 'Easy' ? `${level.goal}. Do one job at a time: move, mine, collect.` : level.tier === 'Medium' ? `${level.goal}. Doing the same thing again? Use a Repeat block.` : `${level.goal}. List what you need first, then gather it in the right order.`, question: 'What do you need before you can make the next item?', fact: level._fact };
  return null;
}
