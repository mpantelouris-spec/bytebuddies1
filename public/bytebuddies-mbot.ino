/* ============================================================
   ByteBuddies — mBot (v1, mCore board) controller   v2
   ============================================================
   SETUP (once):
     1. Install the Makeblock library (it provides MeMCore.h):
        Arduino IDE > Tools > Manage Libraries > search "Makeblock",
        or download it from github.com/Makeblock-official/Makeblock-Libraries
     2. Tools > Board: "Arduino Uno"
     3. Plug in the mBot (USB cable, power switch ON) and Upload
     4. In ByteBuddies Robot Lab: pick mBot > Connect Robot > Run

   Default mBot wiring (as shipped):
     Motors M1 (left) / M2 (right)     Ultrasonic sensor: Port 3
     Line follower: Port 2             2 RGB LEDs + buzzer on board
     Light sensor on board (A6)        Button on board (A7)

   PROTOCOL: one command per line, the robot replies ONE line when
   the command has finished:  "OK"  or  "V:<value>" for sensors.
   STP stops any move immediately.

   TIP: if Forward drives backward, set FLIP to -1 below.
   ============================================================ */

#include <MeMCore.h>
#include <Servo.h>

const int FLIP = 1;               // set to -1 if the robot drives backwards

MeDCMotor motorL(M1);
MeDCMotor motorR(M2);
MeUltrasonicSensor sonar(PORT_3);
MeLineFollower lineSensor(PORT_2);
MeRGBLed rgb(0, 2);               // the two on-board LEDs
MeBuzzer buzzer;
Servo servo;
int servoPin = -1;

int spd = 200;                    // 0–255
int bright = 100;                 // LED brightness %

// ── Motors ───────────────────────────────────────────────────
void motors(int l, int r) {       // mBot M1 is mounted mirrored
  motorL.run(-l * FLIP);
  motorR.run(r * FLIP);
}
void halt() { motorL.stop(); motorR.stop(); }

// Wait while still listening for STP, so Stop always works.
// Any other line that arrives meanwhile is kept and run next.
String queued = "";
bool waitMs(unsigned long ms) {
  unsigned long start = millis();
  while (millis() - start < ms) {
    if (queued.length() == 0 && Serial.available()) {
      String s = Serial.readStringUntil('\n'); s.trim();
      if (s.startsWith("STP") || s.startsWith("END")) { halt(); return false; }
      queued = s;
    }
  }
  return true;
}
void timedMove(int l, int r, long ms) {
  motors(l, r);
  waitMs(ms > 0 ? ms : 0);
  halt();
}

// ── Parsing "CMD:a:b:c" ──────────────────────────────────────
String part(const String &s, int n) {
  int p = 0;
  for (int k = 0; k < n; k++) { p = s.indexOf(':', p) + 1; if (p == 0) return ""; }
  int e = s.indexOf(':', p);
  return e >= 0 ? s.substring(p, e) : s.substring(p);
}
long num(const String &s, int n) { return part(s, n).toInt(); }

// ── LEDs ─────────────────────────────────────────────────────
void setLeds(int r, int g, int b) {
  r = r * bright / 100; g = g * bright / 100; b = b * bright / 100;
  rgb.setColor(0, r, g, b);
  rgb.show();
}
void namedColour(const String &c) {
  if      (c == "red")     setLeds(255, 0, 0);
  else if (c == "green")   setLeds(0, 255, 0);
  else if (c == "blue")    setLeds(0, 0, 255);
  else if (c == "yellow")  setLeds(255, 255, 0);
  else if (c == "cyan")    setLeds(0, 255, 255);
  else if (c == "magenta") setLeds(255, 0, 255);
  else if (c == "white")   setLeds(255, 255, 255);
  else                     setLeds(0, 0, 0);
}

void useServo(int pin) {
  if (servoPin != pin) { if (servoPin >= 0) servo.detach(); servo.attach(pin); servoPin = pin; }
}

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(50);
  rgb.setpin(13);
  halt();
  setLeds(0, 40, 0); delay(150); setLeds(0, 0, 0);
  Serial.println("ByteBuddies mBot ready");
}

void loop() {
  String s;
  if (queued.length()) { s = queued; queued = ""; }
  else if (Serial.available()) s = Serial.readStringUntil('\n');
  else return;
  s.trim();
  if (!s.length()) return;
  String c = part(s, 0);

  // ── Movement ──
  if      (c == "STP" || c == "CST" || c == "END") halt();
  else if (c == "FWD") timedMove( spd,  spd, num(s, 1) * 10);
  else if (c == "BWD") timedMove(-spd, -spd, num(s, 1) * 10);
  else if (c == "LFT" || c == "SPL") timedMove(-spd * 3 / 4,  spd * 3 / 4, num(s, 1) * 5);
  else if (c == "RGT" || c == "SPR") timedMove( spd * 3 / 4, -spd * 3 / 4, num(s, 1) * 5);
  else if (c == "SPD") spd = constrain(map(num(s, 1), 0, 100, 0, 255), 0, 255);
  else if (c == "ML")  motorL.run(-constrain(map(num(s, 1), -100, 100, -255, 255), -255, 255) * FLIP);
  else if (c == "MR")  motorR.run( constrain(map(num(s, 1), -100, 100, -255, 255), -255, 255) * FLIP);
  else if (c == "MV")  motors(map(num(s, 1), -100, 100, -255, 255), map(num(s, 2), -100, 100, -255, 255));
  else if (c == "DLY") waitMs(num(s, 1));

  // ── Lights & sound ──
  else if (c == "LED") namedColour(part(s, 1));
  else if (c == "LDC") setLeds(num(s, 1), num(s, 2), num(s, 3));
  else if (c == "LDB") bright = constrain(num(s, 1), 0, 100);
  else if (c == "BZZ") { buzzer.tone(440, num(s, 1)); }
  else if (c == "NTE") { buzzer.tone(num(s, 1), num(s, 2)); }

  // ── Servos & pins ──
  else if (c == "SRV") { useServo(num(s, 1)); servo.write(constrain(num(s, 2), 0, 180)); waitMs(300); }
  else if (c == "SWP") {
    useServo(num(s, 1));
    int a = num(s, 2), b = num(s, 3), step = a <= b ? 2 : -2;
    for (int x = a; step > 0 ? x <= b : x >= b; x += step) { servo.write(x); if (!waitMs(15)) break; }
  }
  else if (c == "SRS") { if (servoPin >= 0) { servo.detach(); servoPin = -1; } }
  else if (c == "PHI") { pinMode(num(s, 1), OUTPUT); digitalWrite(num(s, 1), HIGH); }
  else if (c == "PLO") { pinMode(num(s, 1), OUTPUT); digitalWrite(num(s, 1), LOW); }
  else if (c == "PWM") { pinMode(num(s, 1), OUTPUT); analogWrite(num(s, 1), constrain(num(s, 2), 0, 255)); }

  // ── Sensors (reply with a value) ──
  else if (c == "QDS") { Serial.print("V:"); Serial.println((int)sonar.distanceCm()); return; }
  else if (c == "QLN") {
    // readSensors(): 0 = both on the line, 1 = left only, 2 = right only, 3 = neither
    int v = lineSensor.readSensors();
    Serial.print("V:"); Serial.print((v == 0 || v == 1) ? 1 : 0); Serial.print(':'); Serial.println((v == 0 || v == 2) ? 1 : 0);
    return;
  }
  else if (c == "QLT") { Serial.print("V:"); Serial.println(analogRead(A6)); return; }
  else if (c == "QBA") { Serial.print("V:"); Serial.println(analogRead(A7) < 100 ? 1 : 0); return; }
  else if (c == "QBB") { Serial.println("V:0"); return; }
  else if (c == "QTP") { pinMode(num(s, 1), INPUT); Serial.print("V:"); Serial.println(digitalRead(num(s, 1))); return; }
  else if (c == "PNG") { Serial.println("V:mbot"); return; }

  Serial.println("OK");
}
