/** One worked answer per mission ("Show me" button). Each is tested against PLANS objectives. */
export const SOLUTIONS = {
  'space-1': `print("Systems check...")
print("Fuel loading...")
print("Engines ignite!")
print("Clamps released!")
print("LIFT OFF!")
`,
  'space-2': `for orbit in range(3):
    print(f"Orbit {orbit + 1} complete")
`,
  'space-3': `score = 0
for i in range(5):
    asteroid = True
    if asteroid:
        print(f"Asteroid {i + 1}! Dodging...")
        score += 1
print(f"Final score: {score}")
`,
  'space-4': `def respond_to_signal(signal):
    if signal == "SOS":
        print("SOS received - sending rescue coordinates!")
    elif signal == "PING":
        print("PONG!")
    else:
        print(f"Unknown signal: {signal}")

respond_to_signal("SOS")
respond_to_signal("PING")
respond_to_signal("DATA")
`,
  'space-5': `def check_altitude(alt):
    if alt > 1000:
        return "descending"
    return "landing"

altitude = 5000
for step in range(5):
    altitude -= 1000
    print(f"Altitude: {altitude}m | {check_altitude(altitude)}")
print("Touchdown!")
`,
  'ocean-1': `for depth in [10, 50, 200]:
    print(f"Depth: {depth}m")
    if depth > 100:
        print("Pressure warning!")
`,
  'ocean-2': `for step in range(8):
    if step == 3 or step == 6:
        print(f"Step {step + 1}: Coral! Dodging...")
    else:
        print(f"Step {step + 1}: Moving forward...")
print("Maze complete!")
`,
  'ocean-3': `def sound_alarm():
    print("ALARM SOUNDING!")

def flash_lights():
    print("LIGHTS FLASHING!")

def radio_surface():
    print("Radio: SHARK DETECTED!")

shark_detected = True
if shark_detected:
    sound_alarm()
    flash_lights()
    radio_surface()
`,
  'ocean-4': `treasure_count = 0
for row in range(8):
    for col in range(8):
        if (row + col) % 7 == 0:
            treasure_count += 1
            print(f"Treasure at ({row},{col})!")
print(f"Total treasures: {treasure_count}")
`,
  'ocean-5': `oxygen = 60
depth = 200
while depth > 0:
    depth -= 30
    oxygen -= 5
    if depth < 0:
        depth = 0
    print(f"Depth: {depth}m | Oxygen: {oxygen}")
print("SURFACED!")
`,
  'city-1': `population = 100
budget = 50000
happiness = 75
days = 0
print(f"Population: {population}")
print(f"Budget: {budget}")
print(f"Happiness: {happiness}")
print(f"Days: {days}")
`,
  'city-2': `budget = 50000
happiness = 75
for road in range(5):
    budget -= 2000
    happiness += 3
    print(f"Road {road + 1} built | Budget: {budget} | Happiness: {happiness}")
`,
  'city-3': `districts = [40, 80, 30, 90]
total_cost = 0
for i in range(len(districts)):
    print(f"District {i + 1}: power {districts[i]}")
    if districts[i] < 50:
        districts[i] += 20
        total_cost += 5000
        print(f"District {i + 1}: Powered up!")
print(f"Total cost: {total_cost}")
`,
  'city-4': `population = 100
happiness = 75
for day in range(10):
    if happiness > 70:
        population = int(population * 1.05)
    else:
        population = int(population * 1.01)
    print(f"Day {day + 1}: Population {population}")
`,
  'city-5': `population = 350
budget = 30000
happiness = 90
city_score = (happiness * 10) + (population // 10)
print("=== CITY REPORT ===")
print(f"Population: {population}")
print(f"Budget: {budget}")
print(f"Happiness: {happiness}")
print(f"CITY SCORE: {city_score}")
`,
  'cyber-1': `def fixBug(bug_type):
    print(f"{bug_type} bug fixed!")

fixBug("memory")
fixBug("network")
fixBug("syntax")
fixBug("logic")
fixBug("runtime")
`,
  'cyber-2': `def generate_sequence(steps):
    result = 1
    for i in range(steps):
        result = result * 2
        print(result)

generate_sequence(5)
`,
  'cyber-3': `def lockdown():
    print("LOCKDOWN!")

def classify(signal):
    if signal % 2 != 0:
        return "threat"
    return "safe"

for s in [10, 7, 4, 13, 6]:
    result = classify(s)
    print(f"Signal {s}: {result}")
    if result == "threat":
        lockdown()
`,
  'cyber-4': `def decrypt(count):
    if count == 0:
        print("Decryption complete! Data restored.")
        return
    print(f"Peeling layer {count}...")
    decrypt(count - 1)

decrypt(5)
`,
  'cyber-5': `def fixBug(t):
    print(f"Fixed {t} bug")

def lockdown():
    print("Lockdown cleared")

def runDiagnostic():
    score = 0
    print("Running diagnostic...")
    fixBug("memory")
    score += 1
    lockdown()
    score += 1
    print(f"Systems passed: {score}/2")
    if score == 2:
        print("ALL SYSTEMS GO!")

runDiagnostic()
`,
};
