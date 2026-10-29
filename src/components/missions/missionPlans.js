/**
 * missionPlans.js — what each mission asks for and how it is checked.
 *
 * starter: the task, written as comments only — pupils write all the code themselves
 *          (Dino Park debugging missions start with broken code to fix)
 * objectives: checked live after every run (code + printed output)
 * scene: which animation in MissionScenes.jsx the program drives
 */
const L = (out) => out.split('\n').map((s) => s.trim()).filter(Boolean);
const has = (code, re) => re.test(code.replace(/#.*$/gm, ''));
const count = (code, re) => (code.replace(/#.*$/gm, '').match(re) || []).length;
const outHas = (out, re) => re.test(out);
/** Number of items written in the list literal assigned to `name`. */
const listLen = (code, name) => {
  const m = code.replace(/#.*$/gm, '').match(new RegExp(`${name}\\s*=\\s*\\[([^\\]]*)\\]`));
  return m ? m[1].split(',').filter((x) => x.trim()).length : 0;
};
const codeLines = (code) => code.replace(/#.*$/gm, '').split('\n').filter((l) => l.trim());
const indentOf = (l) => l.match(/^\s*/)[0].replace(/\t/g, '    ').length;
/** `want` appears in `nums` in order (other numbers may sit in between). */
const inOrder = (nums, want) => { let k = 0; for (const n of nums) if (n === want[k]) k++; return k === want.length; };
/** Names of the functions the pupil defined. */
const definedNames = (code) => [...code.replace(/#.*$/gm, '').matchAll(/def\s+(\w+)\s*\(/g)].map((m) => m[1]);
/** Distinct text arguments the pupil passed to any of those functions. */
const calledWith = (code, names) => {
  const args = new Set();
  for (const n of names) for (const m of code.replace(/#.*$/gm, '').matchAll(new RegExp(`(?<!def\\s)\\b${n}\\(\\s*["']([^"']+)["']`, 'g'))) args.add(m[1]);
  return args;
};
/** A for/while loop whose body contains another loop (any style). */
const hasNestedLoop = (code) => {
  const ls = codeLines(code); const open = [];
  for (const l of ls) {
    const ind = indentOf(l);
    while (open.length && ind <= open[open.length - 1]) open.pop();
    if (/^\s*(for|while)\b.*:\s*$/.test(l)) { if (open.length) return true; open.push(ind); }
  }
  return false;
};
/** Function `name` calls itself somewhere inside its own body. */
const callsItself = (code, name) => {
  const ls = codeLines(code); let inside = -1;
  for (const l of ls) {
    const ind = indentOf(l);
    if (inside >= 0 && ind <= inside) inside = -1;
    if (new RegExp(`^\\s*def\\s+${name}\\s*\\(`).test(l)) { inside = ind; continue; }
    if (inside >= 0 && new RegExp(`\\b${name}\\s*\\(`).test(l)) return true;
  }
  return false;
};

export const PLANS = {
  // ── SPACE EXPLORER ────────────────────────────────────────────────────────
  'space-1': {
    scene: 'launch',
    action: 'Launch',
    starter: `# 🔥 Launch Sequence
# Write the rocket's launch steps, one print for each
# step, in order.
# You need at least 5 steps, for example: systems check,
# fuel loading,
# engines ignite, clamps released...
# The very last step must say: LIFT OFF!
`,
    objectives: [
      { label: 'Print at least 5 launch steps', test: (c, o) => L(o).length >= 5 },
      { label: 'The last step says “LIFT OFF”', test: (c, o) => /lift\s*off/i.test(L(o).slice(-1)[0] || '') },
    ],
  },
  'space-2': {
    scene: 'orbit',
    action: 'Launch',
    starter: `# 🌍 Orbit Calculator
# Use a loop to send the rocket round the planet exactly
# 3 times.
# Each time round, print a line with the word "Orbit" in
# it,
# e.g. Orbit 1 complete, Orbit 2 complete...
`,
    objectives: [
      { label: 'Use a loop', test: (c) => has(c, /\b(for|while)\b/) },
      { label: 'Complete exactly 3 orbits', test: (c, o) => L(o).filter((l) => /orbit/i.test(l)).length === 3 },
    ],
  },
  'space-3': {
    scene: 'asteroids',
    action: 'Fly',
    starter: `# ☄️ Asteroid Field
# There are 5 asteroids. Make a score that starts at 0.
# Use a loop to meet each asteroid and an if to spot it.
# For each one, print a line saying you are "Dodging..."
# and add 1 to the score.
# At the end print the final score (it should be 5).
`,
    objectives: [
      { label: 'Use an if to spot asteroids', test: (c) => has(c, /\bif\b/) },
      { label: 'Dodge all 5 asteroids', test: (c, o) => L(o).filter((l) => /dodg/i.test(l)).length >= 5 },
      { label: 'Final score is 5', test: (c, o) => /score\D*5\b/i.test(o) },
    ],
  },
  'space-4': {
    scene: 'beacon',
    action: 'Transmit',
    starter: `# 📡 Space Beacon
# Write a function that takes a signal as its input.
# If the signal is "PING", print PONG!
# For any other signal, print what you received.
# Call your function 3 times with 3 different signals:
# "SOS", "PING" and "DATA".
`,
    objectives: [
      { label: 'Define a function with def', test: (c) => has(c, /\bdef\s+\w+\s*\(\s*\w+/) },
      { label: 'Call it with 3 different signals', test: (c) => calledWith(c, definedNames(c)).size >= 3 },
      { label: 'Reply to PING with PONG (add an elif)', test: (c, o) => /pong/i.test(o) },
    ],
  },
  'space-5': {
    scene: 'landing',
    action: 'Land',
    starter: `# 🏆 Safe Landing
# The ship starts at an altitude of 5000m and drops
# 1000m at a time.
# Use a loop to bring it down, printing the altitude
# each time
# (e.g. Altitude: 4000m).
# Write a function that uses an if to say "descending"
# or "landing"
# for the altitude, and use it inside your loop.
# Finish by printing: Touchdown!
`,
    objectives: [
      { label: 'Use a function, a loop and an if', test: (c) => has(c, /\bdef\b/) && has(c, /\b(for|while)\b/) && has(c, /\bif\b/) },
      { label: 'Print the altitude as you fall', test: (c, o) => L(o).filter((l) => /altitude\D*\d/i.test(l)).length >= 3 },
      { label: 'Finish with “Touchdown!”', test: (c, o) => /touchdown/i.test(o) },
    ],
  },

  // ── OCEAN DEEP ────────────────────────────────────────────────────────────
  'ocean-1': {
    scene: 'dive',
    action: 'Dive',
    starter: `# 🤿 Dive Protocol
# The sub dives to 3 depths: 10m, 50m and 200m.
# Print each depth as you reach it (e.g. Depth: 10m).
# Use an if: when the sub is deeper than 100m, print a
# pressure warning
# (your message must include the word "pressure").
`,
    objectives: [
      { label: 'Visit all 3 depths', test: (c, o) => [10, 50, 200].every((d) => new RegExp(`\\b${d}\\s*m`).test(o)) },
      { label: 'Use if to check the pressure', test: (c) => has(c, /\bif\b/) },
      { label: 'Warn about pressure deeper than 100m', test: (c, o) => /pressure/i.test(o) },
    ],
  },
  'ocean-2': {
    scene: 'maze',
    action: 'Navigate',
    starter: `# 🪸 Coral Maze
# The sub moves 8 steps through the maze.
# For each step print "Step 1", "Step 2" ... and what
# happens.
# There is coral on some steps (you choose which). Use
# an if: when there
# is coral, print a message with the word "Coral" and
# dodge it.
# When you reach the end, print: Maze complete!
`,
    objectives: [
      { label: 'Move through 8 steps', test: (c, o) => L(o).filter((l) => /step\s*\d/i.test(l)).length >= 8 },
      { label: 'Dodge the coral with an if', test: (c, o) => has(c, /\bif\b/) && /coral/i.test(o) },
      { label: 'Reach the end: “Maze complete!”', test: (c, o) => /maze complete/i.test(o) },
    ],
  },
  'ocean-3': {
    scene: 'shark',
    action: 'Respond',
    starter: `# 🦈 Shark Alert!
# Write 3 functions: one that sounds the alarm, one that
# flashes the lights
# and one that radios the surface. Each prints a message
# that says what it
# does (the words "alarm", "lights" and "radio" must
# appear).
# A shark has been detected: use an if to call all 3
# functions.
`,
    objectives: [
      { label: 'Write 3 functions', test: (c) => count(c, /\bdef\s+\w+/g) >= 3 },
      { label: 'Sound the alarm', test: (c, o) => /alarm/i.test(o) },
      { label: 'Flash the lights', test: (c, o) => /light/i.test(o) },
      { label: 'Radio the surface', test: (c, o) => /radio/i.test(o) },
    ],
  },
  'ocean-4': {
    scene: 'grid',
    action: 'Scan',
    starter: `# 💎 Treasure Grid
# Scan every square of an 8 x 8 grid using a loop inside
# another loop
# (one loop for the rows, one for the columns).
# A square has treasure when (row + column) divided by 7
# leaves no remainder.
# For each treasure print "Treasure at" and the square,
# e.g. Treasure at (0,0)
# Count the treasures, and at the end print the total.
`,
    objectives: [
      { label: 'Use a loop inside a loop', test: (c) => hasNestedLoop(c) },
      { label: 'Find more than 5 treasures', test: (c, o) => L(o).filter((l) => /treasure at/i.test(l)).length > 5 },
      { label: 'Print the total', test: (c, o) => /total/i.test(o) },
    ],
  },
  'ocean-5': {
    scene: 'ascent',
    action: 'Ascend',
    starter: `# 🏆 Surface! — Emergency ascent!
# The sub is 200m deep with 60 seconds of oxygen.
# Use a while loop: each time round, rise 30m and use 5
# oxygen.
# Print the depth and oxygen every time (e.g. Depth:
# 170m | Oxygen: 55).
# Don't go above 0m! When you reach the top, print:
# SURFACED!
`,
    objectives: [
      { label: 'Use a while loop', test: (c) => has(c, /\bwhile\b/) },
      { label: 'Oxygen goes down as you rise', test: (c, o) => { const v = [...o.matchAll(/oxygen\D*(\d+)/gi)].map((m) => +m[1]); return v.length > 2 && v[v.length - 1] < v[0]; } },
      { label: 'Reach the surface: “SURFACED!”', test: (c, o) => /surfaced/i.test(o) },
    ],
  },

  // ── CITY BUILDER ──────────────────────────────────────────────────────────
  'city-1': {
    scene: 'blueprint',
    action: 'Build',
    starter: `# 📐 City Blueprint
# Create 4 variables for your new city:
#   population is 100, budget is 50000, happiness is 75,
#   days is 0
# Print all 4, with their names, e.g. Population: 100
`,
    objectives: [
      { label: 'Create happiness and days', test: (c) => has(c, /\bhappiness\s*=/) && has(c, /\bdays\s*=/) },
      { label: 'Show all 4 values', test: (c, o) => ['population', 'budget', 'happiness', 'day'].every((k) => new RegExp(k, 'i').test(o)) },
    ],
  },
  'city-2': {
    scene: 'roads',
    action: 'Build',
    starter: `# 🛣️ Build the Roads
# The city starts with a budget of 50000 and happiness
# of 75.
# Use a loop to build 5 roads. Each road costs 2000 and
# adds 3 happiness.
# After each road print the road number, the budget and
# the happiness,
# e.g. Road 1 built | Budget: 48000 | Happiness: 78
`,
    objectives: [
      { label: 'Build 5 roads with a loop', test: (c, o) => has(c, /\b(for|while)\b/) && L(o).filter((l) => /road/i.test(l)).length >= 5 },
      { label: 'Budget ends at 40000', test: (c, o) => /budget\D*40000/i.test(L(o).slice(-1)[0] || '') },
      { label: 'Happiness ends at 90', test: (c, o) => /happiness\D*90/i.test(L(o).slice(-1)[0] || '') },
    ],
  },
  'city-3': {
    scene: 'power',
    action: 'Power up',
    starter: `# ⚡ Power Grid
# The 4 districts have power levels 40, 80, 30 and 90 —
# keep them in a list.
# Check each district. If its power is below 50, give it
# 20 more power,
# add 5000 to the total cost and print
# "District 2: Powered up!" (its number).
# At the end print the total cost.
`,
    objectives: [
      { label: 'Use a list of districts', test: (c) => has(c, /\[\s*\d/) },
      { label: 'Power up the weak districts with if', test: (c, o) => has(c, /\bif\b/) && L(o).filter((l) => /powered up/i.test(l)).length >= 2 },
      { label: 'Total cost is 10000', test: (c, o) => /total cost\D*10000/i.test(o) },
    ],
  },
  'city-4': {
    scene: 'growth',
    action: 'Simulate',
    starter: `# 📈 Population Boom
# Population starts at 100 and happiness at 75.
# Simulate 10 days with a loop. Each day:
#   if happiness is above 70 the population grows by 5%
#   (multiply by 1.05),
#   else it grows by 1% (multiply by 1.01). Keep it a
#   whole number with int().
# Print the day and the population each day, e.g. Day 1:
# Population 105
`,
    objectives: [
      { label: 'Simulate 10 days with a loop', test: (c, o) => L(o).filter((l) => /day\s*\d/i.test(l)).length >= 10 },
      { label: 'Use if / else for the growth rate', test: (c) => has(c, /\bif\b/) && has(c, /\belse\b/) },
      { label: 'Population passes 150', test: (c, o) => [...o.matchAll(/population\D*(\d+)/gi)].some((m) => +m[1] > 150) },
    ],
  },
  'city-5': {
    scene: 'opening',
    action: 'Open the city',
    starter: `# 🏆 Grand Opening — the mayor wants a report!
# The city now has population 350, budget 30000 and
# happiness 90.
# Work out city_score = (happiness x 10) + (population
# divided by 10, whole number //)
# Print a report showing the budget, the happiness and
# the CITY SCORE.
`,
    objectives: [
      { label: 'Calculate the city score', test: (c) => /city_score\s*=\s*[^0\n]/.test(c.replace(/#.*$/gm, '')) },
      { label: 'Report budget and happiness', test: (c, o) => /budget/i.test(o) && /happiness/i.test(o) },
      { label: 'CITY SCORE is 935', test: (c, o) => /score\D*935/i.test(o) },
    ],
  },

  // ── CYBER QUEST ───────────────────────────────────────────────────────────
  'cyber-1': {
    scene: 'nodes',
    action: 'Patch',
    starter: `# 🐛 Debug Protocol
# Write a function called fixBug that takes the type of
# bug as its input
# and prints that the bug was fixed, e.g. memory bug
# fixed!
# Call it 5 times to fix 5 different bugs:
#   memory, network, syntax, logic, runtime
`,
    objectives: [
      { label: 'Write a function called fixBug', test: (c) => has(c, /def\s+fixBug\s*\(/) },
      { label: 'Fix 5 different bugs', test: (c, o) => new Set(L(o).filter((l) => /fixed/i.test(l))).size >= 5 },
    ],
  },
  'cyber-2': {
    scene: 'lock',
    action: 'Crack',
    starter: `# 🔐 Pattern Lock
# The lock code is 2, 4, 8, 16, 32 — each number is
# double the one before.
# Write a function with a loop inside it that prints
# those 5 numbers.
# Then call your function.
`,
    objectives: [
      { label: 'Use a loop inside a function', test: (c) => has(c, /\bdef\b/) && has(c, /\b(for|while)\b/) },
      { label: 'Print 2, 4, 8, 16, 32', test: (c, o) => inOrder((o.match(/\d+/g) || []).map(Number), [2, 4, 8, 16, 32]) },
    ],
  },
  'cyber-3': {
    scene: 'signals',
    action: 'Scan',
    starter: `# 🤖 Neural Guard
# The signals are 10, 7, 4, 13 and 6. Odd signals are
# threats, even ones are safe.
# Write a function that classifies a signal as "threat"
# or "safe".
# Write a lockdown function that prints LOCKDOWN!
# For each signal print e.g. "Signal 7: threat", and
# call lockdown for every threat.
`,
    objectives: [
      { label: 'Classify all 5 signals', test: (c, o) => L(o).filter((l) => /signal \d+/i.test(l)).length >= 5 },
      { label: 'Spot the 2 threats (7 and 13)', test: (c, o) => /signal 7\D*threat/i.test(o) && /signal 13\D*threat/i.test(o) && !/signal 10\D*threat/i.test(o) },
      { label: 'Lock down for each threat', test: (c, o) => L(o).filter((l) => /lockdown/i.test(l)).length >= 2 },
    ],
  },
  'cyber-4': {
    scene: 'layers',
    action: 'Decrypt',
    starter: `# 💾 Data Heist
# Write a function called decrypt that peels one layer
# at a time.
# It prints the layer it is peeling (e.g. Peeling layer
# 5...) and then
# calls itself with one layer fewer — that's recursion!
# When it reaches 0 layers it prints
# "Decryption complete!" and stops.
# Start it with 5 layers.
`,
    objectives: [
      { label: 'decrypt calls itself (recursion)', test: (c) => callsItself(c, 'decrypt') },
      { label: 'Peel all 5 layers', test: (c, o) => L(o).filter((l) => /layer/i.test(l)).length >= 5 },
      { label: 'Reach “Decryption complete”', test: (c, o) => /complete/i.test(o) },
    ],
  },
  'cyber-5': {
    scene: 'diagnostic',
    action: 'Run diagnostic',
    starter: `# 🏆 System Victory
# Write a function called runDiagnostic that runs your
# checks
# (e.g. calls a fixBug function and a lockdown function
# you write too).
# Count every check that passes, then print e.g.
# "Systems passed: 2/2".
# If every check passed, print: ALL SYSTEMS GO!
`,
    objectives: [
      { label: 'Write runDiagnostic()', test: (c) => has(c, /def\s+runDiagnostic\s*\(/) },
      { label: 'Pass every system', test: (c, o) => /passed\D*(\d+)\s*\/\s*\1/i.test(o) },
      { label: 'Print “ALL SYSTEMS GO!”', test: (c, o) => /all systems go/i.test(o) },
    ],
  },

  // ── JUNGLE EXPEDITION (lists & strings) ──────────────────────────────────
  'jungle-1': {
    scene: 'pack',
    action: 'Pack',
    starter: `# 🎒 Supply Pack
# Make a list called supplies with 5 things for the
# expedition.
# Use a loop to print each one, e.g. Packed: map
# Finish by printing how many supplies there are — use
# len(supplies).
`,
    objectives: [
      { label: 'Keep the supplies in a list of 5', test: (c) => /supplies\s*=\s*\[/.test(c) && listLen(c, 'supplies') >= 5 },
      { label: 'Print each supply with a loop', test: (c, o) => has(c, /\bfor\b/) && L(o).filter((l) => /packed/i.test(l)).length >= 5 },
      { label: 'Print the total using len()', test: (c, o) => has(c, /len\s*\(\s*supplies\s*\)/) && /\b5\b/.test(L(o).slice(-1)[0] || '') },
    ],
  },
  'jungle-2': {
    scene: 'spotter',
    action: 'Spot',
    starter: `# 🦜 Animal Spotter
# Your notebook starts with 2 animals: parrot and
# monkey. Keep them in a list.
# You spot 3 more animals — add each one to the list
# with .append()
# Print the notebook list, then print e.g.
# "Spotted 5 animals" using len().
`,
    objectives: [
      { label: 'Use .append() 3 times', test: (c) => count(c, /\.append\s*\(/g) >= 3 },
      { label: 'Spot 5 animals in total', test: (c, o) => /spotted\D*5\b/i.test(o) },
      { label: 'Show the full notebook list', test: (c, o) => (o.match(/['"]\w+['"]/g) || []).length >= 2 },
    ],
  },
  'jungle-3': {
    scene: 'mapcode',
    action: 'Decode',
    starter: `# 🗺️ Secret Map Code
# The map says:  elpmet nedlog eht rednu
# It's written backwards in lowercase!
# Reverse the message, turn it into CAPITAL letters,
# then print where the treasure is (it's UNDER THE
# GOLDEN TEMPLE).
`,
    objectives: [
      { label: 'Reverse the message', test: (c) => has(c, /\[\s*::\s*-1\s*\]|reversed\s*\(/) },
      { label: 'Use .upper() for CAPITALS', test: (c) => has(c, /\.upper\s*\(/) },
      { label: 'Print “UNDER THE GOLDEN TEMPLE”', test: (c, o) => /UNDER THE GOLDEN TEMPLE/.test(o) },
    ],
  },
  'jungle-4': {
    scene: 'river',
    action: 'Hop',
    starter: `# 🪨 River Crossing
# The stepping stones have heights 3, 7, 2, 9, 4 and 6.
# Check every stone with a loop and print e.g.
# "Stone height: 3".
# Use an if to remember the highest stone you have seen
# so far.
# At the end print e.g. "Highest stone: 9".
`,
    objectives: [
      { label: 'Check every stone with a loop', test: (c, o) => L(o).filter((l) => /stone height/i.test(l)).length >= 6 },
      { label: 'Use if to compare the heights', test: (c) => has(c, /\bif\b[^\n]*[<>]/) },
      { label: 'Find the highest stone: 9', test: (c, o) => /highest\D*9\b/i.test(o) },
    ],
  },
  'jungle-5': {
    scene: 'log',
    action: 'Write',
    starter: `# 📓 Expedition Log
# Days:   Monday, Tuesday, Wednesday, Thursday
# Finds:  a red parrot, a giant leaf, frog footprints,
# the golden temple
# Keep each in its own list. Use one loop to go through
# both lists together
# and print a line for each day, e.g.
# "Monday: we found a red parrot".
# Finish with e.g. "Expedition complete! 4 finds".
`,
    objectives: [
      { label: 'Log all 4 days', test: (c, o) => ['monday', 'tuesday', 'wednesday', 'thursday'].every((d) => new RegExp(`${d}\\W+we found`, 'i').test(o)) },
      { label: 'Use the two lists together', test: (c) => has(c, /days\s*\[\s*\w+\s*\]/) && has(c, /finds\s*\[\s*\w+\s*\]/) },
      { label: 'Finish with “Expedition complete!”', test: (c, o) => /expedition complete\D*4/i.test(o) },
    ],
  },

  // ── DINO PARK RESCUE (debugging) ─────────────────────────────────────────
  'dino-1': {
    scene: 'gate',
    action: 'Open',
    starter: `# 🚧 Broken Gate — this code has 2 bugs. Press Run to see the error!
print("Checking the gate...")
prnt("Gate open")
print("Dinos safe)
`,
    objectives: [
      { label: 'Fix the bugs so the program runs', test: (c, o) => /checking the gate/i.test(o) && /dinos safe/i.test(o) },
      { label: 'Open the gate', test: (c, o) => /gate open/i.test(o) },
      { label: 'Print “Dinos safe” last', test: (c, o) => /dinos safe/i.test(L(o).slice(-1)[0] || '') },
    ],
  },
  'dino-2': {
    scene: 'feeding',
    action: 'Feed',
    starter: `# 🥬 Feeding Time — one dinosaur never gets fed. Why?
dinos = ["Stego", "Tricera", "Bronto"]

for i in range(2):
    print("Fed", dinos[i], "a big salad")

print("Feeding done!")
`,
    objectives: [
      { label: 'Feed Stego, Tricera and Bronto', test: (c, o) => ['stego', 'tricera', 'bronto'].every((d) => new RegExp(`fed\\s+${d}`, 'i').test(o)) },
      { label: 'Still use a loop', test: (c) => has(c, /\b(for|while)\b/) },
      { label: 'Finish with “Feeding done!”', test: (c, o) => /feeding done/i.test(o) },
    ],
  },
  'dino-3': {
    scene: 'hatch',
    action: 'Warm',
    starter: `# 🥚 Egg Hatchery — eggs at 30 degrees or more should hatch
temperatures = [25, 31, 30, 18, 34]
egg = 1

for temp in temperatures:
    if temp < 30:
        print("Egg", egg, "is hatching! (" + str(temp) + " degrees)")
    else:
        print("Egg", egg, "needs to stay warm")
    egg += 1
`,
    objectives: [
      { label: 'Eggs 2, 3 and 5 hatch', test: (c, o) => [2, 3, 5].every((n) => new RegExp(`egg ${n} is hatching`, 'i').test(o)) },
      { label: 'Cold eggs 1 and 4 stay warm', test: (c, o) => [1, 4].every((n) => new RegExp(`egg ${n} needs`, 'i').test(o)) && ![1, 4].some((n) => new RegExp(`egg ${n} is hatching`, 'i').test(o)) },
      { label: 'Use if to check the temperature', test: (c) => has(c, /\bif\b[^\n]*temp/) },
    ],
  },
  'dino-4': {
    scene: 'radio',
    action: 'Call',
    starter: `# 📻 Ranger Radio — this program crashes straight away. Read the error!
def call_ranger(zone):
    print("Ranger, go to the", zone, "zone!")

callRanger("North")
callRanger("Lake")
callRanger("Volcano")
print("All rangers called")
`,
    objectives: [
      { label: 'Fix the crash', test: (c, o) => /all rangers called/i.test(o) },
      { label: 'Call a ranger to all 3 zones', test: (c, o) => ['north', 'lake', 'volcano'].every((z) => new RegExp(`the\\W+${z}\\W+zone`, 'i').test(o)) },
      { label: 'Keep using the call_ranger function', test: (c) => count(c, /\bcall_ranger\s*\(/g) >= 2 },
    ],
  },
  'dino-5': {
    scene: 'report',
    action: 'Count',
    starter: `# 📋 Park Report — the total comes out wrong. Can you spot why?
pens = [4, 6, 2, 9]
total = 0

for count in pens:
    total = count
    print("This pen has", count, "dinos. Running total:", total)

print("Total dinos:", total)
`,
    objectives: [
      { label: 'Add up every pen', test: (c) => has(c, /total\s*\+=|total\s*=\s*total\s*\+/) },
      { label: 'The running total grows each time', test: (c, o) => { const v = [...o.matchAll(/running total\D*(\d+)/gi)].map((m) => +m[1]); return v.length >= 4 && v.every((x, k) => !k || x > v[k - 1]); } },
      { label: 'Report the right total: 21 dinos', test: (c, o) => /total dinos\D*21\b/i.test(o) },
    ],
  },
};

export function checkObjectives(id, code, out) {
  const plan = PLANS[id];
  if (!plan) return [];
  return plan.objectives.map((ob) => {
    let ok = false;
    try { ok = !!ob.test(code, out); } catch { ok = false; }
    return { label: ob.label, ok };
  });
}
