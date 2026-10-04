/**
 * missionPlans.js — what each mission asks for and how it is checked.
 *
 * starter: an unfinished program for the pupil to complete
 * objectives: checked live after every run (code + printed output)
 * scene: which animation in MissionScenes.jsx the program drives
 * The full answers live in MISSION_CHECKS[id].starter (shown via "Show me").
 */
const L = (out) => out.split('\n').map((s) => s.trim()).filter(Boolean);
const has = (code, re) => re.test(code.replace(/#.*$/gm, ''));
const count = (code, re) => (code.replace(/#.*$/gm, '').match(re) || []).length;
const outHas = (out, re) => re.test(out);

export const PLANS = {
  // ── SPACE EXPLORER ────────────────────────────────────────────────────────
  'space-1': {
    scene: 'launch',
    action: 'Launch',
    starter: `# 🔥 Launch Sequence
# Print each step of the launch, in order.
print("Systems check...")
print("Fuel loading...")
# Add 3 more steps below, e.g. "Engines ignite!", "Clamps released!", "LIFT OFF!"
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
# The rocket must go round the planet exactly 3 times.
# Change the loop so it runs 3 times (not 1).
for orbit in range(1):
    print(f"Orbit {orbit + 1} complete")
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
score = 0
for i in range(5):
    asteroid = True
    if asteroid:
        print(f"Asteroid {i + 1}! Dodging...")
        # Add 1 to the score here
print(f"Final score: {score}")
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
def respond_to_signal(signal):
    if signal == "SOS":
        print("SOS received - sending rescue coordinates!")
    else:
        print(f"Unknown signal: {signal}")

respond_to_signal("SOS")
# Call the function again with "PING" and "DATA"
`,
    objectives: [
      { label: 'Define a function with def', test: (c) => has(c, /\bdef\s+\w+\s*\(\s*\w+/) },
      { label: 'Call it with 3 different signals', test: (c) => new Set((c.replace(/#.*$/gm, '').match(/respond_to_signal\(\s*["']([^"']+)["']\s*\)/g) || [])).size >= 3 },
      { label: 'Reply to PING with PONG (add an elif)', test: (c, o) => /pong/i.test(o) },
    ],
  },
  'space-5': {
    scene: 'landing',
    action: 'Land',
    starter: `# 🏆 Safe Landing — use a function, a loop and an if!
def check_altitude(alt):
    if alt > 1000:
        return "descending"
    return "landing"

altitude = 5000
# Loop 5 times: take 1000 off altitude and print it with its status
# Then print "Touchdown!"
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
for depth in [10, 50, 200]:
    print(f"Depth: {depth}m")
    # If depth is more than 100, print "Pressure warning!"
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
for step in range(8):
    if step == 3 or step == 6:
        print(f"Step {step + 1}: Coral! Dodging...")
    else:
        print(f"Step {step + 1}: Moving forward...")
# Print "Maze complete!" at the end
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
def sound_alarm():
    print("ALARM SOUNDING!")

def flash_lights():
    print("LIGHTS FLASHING!")

# Write a radio_surface() function that prints "Radio: SHARK DETECTED!"

shark_detected = True
if shark_detected:
    sound_alarm()
    # Call the other two functions here
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
    starter: `# 💎 Treasure Grid — scan every square of an 8 × 8 grid
treasure_count = 0
for row in range(8):
    # Add a second loop here: for col in range(8):
    if row % 7 == 0:
        treasure_count += 1
        print(f"Treasure at ({row},0)!")
print(f"Total treasures: {treasure_count}")
`,
    objectives: [
      { label: 'Use a loop inside a loop', test: (c) => /for[^\n]*:\s*\n\s+for\b/.test(c.replace(/#.*$/gm, '')) },
      { label: 'Find more than 5 treasures', test: (c, o) => L(o).filter((l) => /treasure at/i.test(l)).length > 5 },
      { label: 'Print the total', test: (c, o) => /total/i.test(o) },
    ],
  },
  'ocean-5': {
    scene: 'ascent',
    action: 'Ascend',
    starter: `# 🏆 Surface! Emergency ascent!
oxygen = 60
depth = 200
while depth > 0:
    depth -= 30
    # Use 5 oxygen each time round the loop
    if depth < 0:
        depth = 0
    print(f"Depth: {depth}m | Oxygen: {oxygen}")
# When depth is 0, print "SURFACED!"
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
    starter: `# 📐 City Blueprint — create the city's variables
population = 100
budget = 50000
# Make two more variables: happiness = 75 and days = 0

print(f"Population: {population}")
print(f"Budget: {budget}")
# Print happiness and days too
`,
    objectives: [
      { label: 'Create happiness and days', test: (c) => has(c, /\bhappiness\s*=/) && has(c, /\bdays\s*=/) },
      { label: 'Show all 4 values', test: (c, o) => ['population', 'budget', 'happiness', 'day'].every((k) => new RegExp(k, 'i').test(o)) },
    ],
  },
  'city-2': {
    scene: 'roads',
    action: 'Build',
    starter: `# 🛣️ Build the Roads — 5 roads, each costs 2000
budget = 50000
happiness = 75
for road in range(5):
    budget -= 2000
    # Add 3 to happiness
    print(f"Road {road + 1} built | Budget: {budget} | Happiness: {happiness}")
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
    starter: `# ⚡ Power Grid — 4 districts, power below 50 needs a boost
districts = [40, 80, 30, 90]
total_cost = 0
for i in range(len(districts)):
    print(f"District {i + 1}: power {districts[i]}")
    # If power is below 50: add 20 power, add 5000 to total_cost,
    # and print "District N: Powered up!"
print(f"Total cost: {total_cost}")
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
    starter: `# 📈 Population Boom — simulate 10 days
population = 100
happiness = 75
for day in range(10):
    # If happiness is over 70, grow by 5% (population * 1.05), else by 1%
    population = int(population * 1.01)
    print(f"Day {day + 1}: Population {population}")
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
population = 350
budget = 30000
happiness = 90
# city_score = (happiness × 10) + (population ÷ 10)
city_score = 0
print("=== CITY REPORT ===")
print(f"Population: {population}")
# Print budget, happiness and the CITY SCORE
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
    starter: `# 🐛 Debug Protocol — fix 5 bugs across the network
def fixBug(bug_type):
    print(f"{bug_type} bug fixed!")

fixBug("memory")
fixBug("network")
# Call fixBug 3 more times: "syntax", "logic", "runtime"
`,
    objectives: [
      { label: 'Write a function called fixBug', test: (c) => has(c, /def\s+fixBug\s*\(/) },
      { label: 'Fix 5 different bugs', test: (c, o) => new Set(L(o).filter((l) => /fixed/i.test(l))).size >= 5 },
    ],
  },
  'cyber-2': {
    scene: 'lock',
    action: 'Crack',
    starter: `# 🔐 Pattern Lock — the code is 2, 4, 8, 16, 32
def generate_sequence(steps):
    result = 1
    for i in range(steps):
        result = result + 2   # 🐞 this adds — the pattern doubles!
        print(result)

generate_sequence(5)
`,
    objectives: [
      { label: 'Use a loop inside a function', test: (c) => has(c, /\bdef\b/) && has(c, /\b(for|while)\b/) },
      { label: 'Print 2, 4, 8, 16, 32', test: (c, o) => L(o).filter((l) => /^\d+$/.test(l)).join(',').includes('2,4,8,16,32') },
    ],
  },
  'cyber-3': {
    scene: 'signals',
    action: 'Scan',
    starter: `# 🤖 Neural Guard — odd signals are threats
def lockdown():
    print("LOCKDOWN!")

def classify(signal):
    # Return "threat" if the signal is odd (signal % 2 != 0), otherwise "safe"
    return "safe"

for s in [10, 7, 4, 13, 6]:
    result = classify(s)
    print(f"Signal {s}: {result}")
    # If result is "threat", call lockdown()
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
    starter: `# 💾 Recursive Decryption — peel 5 layers
def decrypt(count):
    if count == 0:
        print("Decryption complete! Data restored.")
        return
    print(f"Peeling layer {count}...")
    # Call decrypt again with one less layer

decrypt(5)
`,
    objectives: [
      { label: 'decrypt calls itself (recursion)', test: (c) => /def decrypt[\s\S]*decrypt\(\s*count\s*-\s*1\s*\)/.test(c.replace(/#.*$/gm, '')) },
      { label: 'Peel all 5 layers', test: (c, o) => L(o).filter((l) => /layer/i.test(l)).length >= 5 },
      { label: 'Reach “Decryption complete”', test: (c, o) => /complete/i.test(o) },
    ],
  },
  'cyber-5': {
    scene: 'diagnostic',
    action: 'Run diagnostic',
    starter: `# 🏆 System Victory — one function that runs every check
def fixBug(t):
    print(f"Fixed {t} bug")

def lockdown():
    print("Lockdown cleared")

def runDiagnostic():
    score = 0
    print("Running diagnostic...")
    fixBug("memory")
    score += 1
    # Call lockdown() and add 1 to score
    print(f"Systems passed: {score}/2")
    # If score is 2, print "ALL SYSTEMS GO!"

runDiagnostic()
`,
    objectives: [
      { label: 'Write runDiagnostic()', test: (c) => has(c, /def\s+runDiagnostic\s*\(/) },
      { label: 'Pass every system', test: (c, o) => /passed\D*(\d+)\s*\/\s*\1/i.test(o) },
      { label: 'Print “ALL SYSTEMS GO!”', test: (c, o) => /all systems go/i.test(o) },
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
