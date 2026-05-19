/* ============================================================
   ByteBuddies — Generic Arduino Robot Controller
   ============================================================
   SETUP:
     1. Adjust the 4 pin constants below to match your H-bridge wiring
     2. Board: Arduino Uno
     3. Upload this sketch to your Arduino
     4. In ByteBuddies, select "Arduino", connect via serial, press Run

   WIRING (L298N / L293D / similar dual H-bridge):
     PIN_MA_DIR (2) → Motor A direction   (IN1 or INA)
     PIN_MA_PWM (3) → Motor A speed PWM   (ENA or PWM_A)
     PIN_MB_DIR (4) → Motor B direction   (IN3 or INB)
     PIN_MB_PWM (5) → Motor B speed PWM   (ENB or PWM_B)

   TIP: If Forward goes BACKWARD, swap the signs on FWD & BWD:
        change drive(spd, spd, ...) to drive(-spd, -spd, ...)
   ============================================================ */

const int PIN_MA_DIR = 2;   // Left  motor direction
const int PIN_MA_PWM = 3;   // Left  motor speed (PWM)
const int PIN_MB_DIR = 4;   // Right motor direction
const int PIN_MB_PWM = 5;   // Right motor speed (PWM)

int spd = 200;               // Default speed 0–255
unsigned long stopAt = 0;    // Non-blocking auto-stop timer

// ── Motion helpers ──────────────────────────────────────────
void driveL(int v) { digitalWrite(PIN_MA_DIR, v >= 0 ? HIGH : LOW); analogWrite(PIN_MA_PWM, abs(v)); }
void driveR(int v) { digitalWrite(PIN_MB_DIR, v >= 0 ? HIGH : LOW); analogWrite(PIN_MB_PWM, abs(v)); }
void drive(int l, int r, long ms) { driveL(l); driveR(r); stopAt = ms > 0 ? millis() + ms : 0; }
void halt() { analogWrite(PIN_MA_PWM, 0); analogWrite(PIN_MB_PWM, 0); stopAt = 0; }

// ── Command parsing ─────────────────────────────────────────
String pCmd(String s) { int i = s.indexOf(':'); return i >= 0 ? s.substring(0, i) : s; }
long pVal(String s, int n) {
  int p = 0;
  for (int k = 0; k < n; k++) { p = s.indexOf(':', p) + 1; if (!p) return 0; }
  int e = s.indexOf(':', p);
  return e >= 0 ? s.substring(p, e).toInt() : s.substring(p).toInt();
}

// ── Arduino setup ────────────────────────────────────────────
void setup() {
  Serial.begin(9600);
  pinMode(PIN_MA_DIR, OUTPUT); pinMode(PIN_MA_PWM, OUTPUT);
  pinMode(PIN_MB_DIR, OUTPUT); pinMode(PIN_MB_PWM, OUTPUT);
  halt();
}

// ── Main loop ────────────────────────────────────────────────
void loop() {
  // Auto-stop when timed move expires (non-blocking — STP always works!)
  if (stopAt > 0 && millis() >= stopAt) halt();

  if (!Serial.available()) return;

  String s = Serial.readStringUntil('\n');
  s.trim();
  if (!s.length()) return;

  String c = pCmd(s);
  long   v = pVal(s, 1);

  if      (c == "STP" || c == "CST" || c == "END") halt();
  else if (c == "FWD") drive( spd,    spd,    v * 50);  // both wheels forward
  else if (c == "BWD") drive(-spd,   -spd,    v * 50);  // both wheels backward
  else if (c == "LFT") drive( spd/2,  spd,    v * 8 );  // arc left
  else if (c == "RGT") drive( spd,    spd/2,  v * 8 );  // arc right
  else if (c == "SPL") drive(-spd,    spd,    v * 5 );  // spin left in place
  else if (c == "SPR") drive( spd,   -spd,    v * 5 );  // spin right in place
  else if (c == "SPD") spd = map(v, 0, 100, 0, 255);
  else if (c == "ML")  driveL(map(v, -100, 100, -255, 255));
  else if (c == "MR")  driveR(map(v, -100, 100, -255, 255));
  else if (c == "MV") {
    long l = pVal(s, 1), r = pVal(s, 2);
    drive(map(l, -100, 100, -255, 255), map(r, -100, 100, -255, 255), 0);
  }
}
