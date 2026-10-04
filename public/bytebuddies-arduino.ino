/* ============================================================
   ByteBuddies — Arduino robot controller   v2
   ============================================================
   SETUP (once):
     1. Check the pin numbers below match your robot's wiring
     2. Tools > Board: "Arduino Uno" (Nano / Mega also work)
     3. Upload, then in ByteBuddies Robot Lab: pick Arduino >
        Connect Robot > Run

   DEFAULT WIRING (change the numbers below to match yours):
     Motor driver (L298N / L293D / L9110 style):
       Left  motor: direction pin 2, speed (PWM) pin 3
       Right motor: direction pin 4, speed (PWM) pin 5
     LED: pin 13 (built in)          Buzzer: pin 8
     Ultrasonic HC-SR04: TRIG 12, ECHO 11
     Line sensors (IR): left A0, right A1  (LOW = line under sensor)
     Light sensor (LDR): A2           Buttons: A = 6, B = 7 (to GND)
     Servos: any pin you choose in the block

   PROTOCOL: one command per line, the robot replies ONE line when
   the command has finished:  "OK"  or  "V:<value>" for sensors.
   STP stops any move immediately.

   TIP: if Forward drives backward, set FLIP to -1 below.
   ============================================================ */

#include <Servo.h>

const int FLIP = 1;                        // -1 if the robot drives backwards
const int PIN_MA_DIR = 2, PIN_MA_PWM = 3;  // left motor
const int PIN_MB_DIR = 4, PIN_MB_PWM = 5;  // right motor
const int PIN_LED = 13, PIN_BUZZER = 8;
const int PIN_TRIG = 12, PIN_ECHO = 11;
const int PIN_LINE_L = A0, PIN_LINE_R = A1, PIN_LIGHT = A2;
const int PIN_BTN_A = 6, PIN_BTN_B = 7;
const bool LINE_ACTIVE_LOW = true;         // most IR modules read LOW over a black line

Servo servo;
int servoPin = -1;
int spd = 200;

// ── Motors ───────────────────────────────────────────────────
void driveL(int v) { v *= FLIP; digitalWrite(PIN_MA_DIR, v >= 0 ? HIGH : LOW); analogWrite(PIN_MA_PWM, constrain(abs(v), 0, 255)); }
void driveR(int v) { v *= FLIP; digitalWrite(PIN_MB_DIR, v >= 0 ? HIGH : LOW); analogWrite(PIN_MB_PWM, constrain(abs(v), 0, 255)); }
void motors(int l, int r) { driveL(l); driveR(r); }
void halt() { analogWrite(PIN_MA_PWM, 0); analogWrite(PIN_MB_PWM, 0); }

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
void timedMove(int l, int r, long ms) { motors(l, r); waitMs(ms > 0 ? ms : 0); halt(); }

// ── Parsing "CMD:a:b:c" ──────────────────────────────────────
String part(const String &s, int n) {
  int p = 0;
  for (int k = 0; k < n; k++) { p = s.indexOf(':', p) + 1; if (p == 0) return ""; }
  int e = s.indexOf(':', p);
  return e >= 0 ? s.substring(p, e) : s.substring(p);
}
long num(const String &s, int n) { return part(s, n).toInt(); }

long readCm() {
  digitalWrite(PIN_TRIG, LOW); delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long us = pulseIn(PIN_ECHO, HIGH, 30000UL);   // 30 ms ≈ 5 m
  return us == 0 ? 400 : (long)(us / 58);
}
int onLine(int pin) { int v = digitalRead(pin); return LINE_ACTIVE_LOW ? (v == LOW) : (v == HIGH); }

// tone() borrows Timer2, which also drives PWM on pin 3 (left motor speed on an Uno).
// Put Timer2 back to normal PWM after every beep so the motor keeps working.
void restorePwm() {
#if defined(TCCR2A) && defined(WGM20) && defined(CS22)
  TCCR2A = _BV(WGM20);
  TCCR2B = _BV(CS22);
#endif
}

void useServo(int pin) {
  if (servoPin != pin) { if (servoPin >= 0) servo.detach(); servo.attach(pin); servoPin = pin; }
}

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(50);
  pinMode(PIN_MA_DIR, OUTPUT); pinMode(PIN_MA_PWM, OUTPUT);
  pinMode(PIN_MB_DIR, OUTPUT); pinMode(PIN_MB_PWM, OUTPUT);
  pinMode(PIN_LED, OUTPUT); pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_TRIG, OUTPUT); pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_LINE_L, INPUT); pinMode(PIN_LINE_R, INPUT);
  pinMode(PIN_BTN_A, INPUT_PULLUP); pinMode(PIN_BTN_B, INPUT_PULLUP);
  halt();
  Serial.println("ByteBuddies Arduino ready");
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
  else if (c == "ML")  driveL(map(num(s, 1), -100, 100, -255, 255));
  else if (c == "MR")  driveR(map(num(s, 1), -100, 100, -255, 255));
  else if (c == "MV")  motors(map(num(s, 1), -100, 100, -255, 255), map(num(s, 2), -100, 100, -255, 255));
  else if (c == "DLY") waitMs(num(s, 1));

  // ── Lights & sound ──
  else if (c == "LED") digitalWrite(PIN_LED, part(s, 1) == "off" ? LOW : HIGH);
  else if (c == "LDC") digitalWrite(PIN_LED, (num(s, 1) + num(s, 2) + num(s, 3)) > 0 ? HIGH : LOW);
  else if (c == "LDB") analogWrite(PIN_LED, constrain(num(s, 1), 0, 100) * 255 / 100);
  else if (c == "BZZ") { tone(PIN_BUZZER, 440); waitMs(num(s, 1)); noTone(PIN_BUZZER); restorePwm(); }
  else if (c == "NTE") { tone(PIN_BUZZER, num(s, 1)); waitMs(num(s, 2)); noTone(PIN_BUZZER); restorePwm(); }

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
  else if (c == "QDS") { Serial.print("V:"); Serial.println(readCm()); return; }
  else if (c == "QLN") { Serial.print("V:"); Serial.print(onLine(PIN_LINE_L)); Serial.print(':'); Serial.println(onLine(PIN_LINE_R)); return; }
  else if (c == "QLT") { Serial.print("V:"); Serial.println(analogRead(PIN_LIGHT)); return; }
  else if (c == "QBA") { Serial.print("V:"); Serial.println(digitalRead(PIN_BTN_A) == LOW ? 1 : 0); return; }
  else if (c == "QBB") { Serial.print("V:"); Serial.println(digitalRead(PIN_BTN_B) == LOW ? 1 : 0); return; }
  else if (c == "QTP") { pinMode(num(s, 1), INPUT); Serial.print("V:"); Serial.println(digitalRead(num(s, 1))); return; }
  else if (c == "PNG") { Serial.println("V:arduino"); return; }

  Serial.println("OK");
}
