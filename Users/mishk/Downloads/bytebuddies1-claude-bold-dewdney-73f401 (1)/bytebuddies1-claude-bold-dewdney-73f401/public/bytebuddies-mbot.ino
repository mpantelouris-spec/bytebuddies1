/* ============================================================
   ByteBuddies — mBot v1 Controller
   ============================================================
   SETUP:
     1. Install Makeblock library: Arduino IDE > Sketch > Include Library
        > Manage Libraries > search "Makeblock" > Install
     2. Board: Arduino Uno
     3. Upload this sketch to your mBot
     4. In ByteBuddies, select "mBot", connect via serial, press Run

   TIP: If Forward goes BACKWARD, flip the signs on the
        FWD & BWD drive() calls (swap -spd ↔ spd).
   ============================================================ */

#include <MeMCore.h>

MeDCMotor motorL(M1);   // Left  motor (port M1)
MeDCMotor motorR(M2);   // Right motor (port M2)

int spd = 200;               // Default speed 0–255
unsigned long stopAt = 0;    // Non-blocking auto-stop timer

// ── Motion helpers ──────────────────────────────────────────
void drive(int l, int r, long ms) {
  motorL.run(l);
  motorR.run(r);
  stopAt = ms > 0 ? millis() + ms : 0;
}
void halt() {
  motorL.stop();
  motorR.stop();
  stopAt = 0;
}

// ── Command parsing ─────────────────────────────────────────
String pCmd(String s) {
  int i = s.indexOf(':');
  return i >= 0 ? s.substring(0, i) : s;
}
long pVal(String s, int n) {
  int p = 0;
  for (int k = 0; k < n; k++) {
    p = s.indexOf(':', p) + 1;
    if (!p) return 0;
  }
  int e = s.indexOf(':', p);
  return e >= 0 ? s.substring(p, e).toInt() : s.substring(p).toInt();
}

// ── Arduino setup ────────────────────────────────────────────
void setup() {
  Serial.begin(9600);
  halt();
}

// ── Main loop ────────────────────────────────────────────────
void loop() {
  // Auto-stop when a timed move expires (non-blocking — STP always works!)
  if (stopAt > 0 && millis() >= stopAt) halt();

  if (!Serial.available()) return;

  String s = Serial.readStringUntil('\n');
  s.trim();
  if (!s.length()) return;

  String c = pCmd(s);
  long   v = pVal(s, 1);

  if      (c == "STP" || c == "CST" || c == "END") halt();
  else if (c == "FWD") drive(-spd,    spd,    v * 50);  // both wheels forward
  else if (c == "BWD") drive( spd,   -spd,    v * 50);  // both wheels backward
  else if (c == "LFT") drive(-spd/2,  spd,    v * 8 );  // arc left
  else if (c == "RGT") drive(-spd,    spd/2,  v * 8 );  // arc right
  else if (c == "SPL") drive( spd/2,  spd/2,  v * 5 );  // spin left in place
  else if (c == "SPR") drive(-spd/2, -spd/2,  v * 5 );  // spin right in place
  else if (c == "SPD") spd = map(v, 0, 100, 0, 255);
  else if (c == "ML")  motorL.run(map(v, -100, 100, -255, 255));
  else if (c == "MR")  motorR.run(map(v, -100, 100, -255, 255));
  else if (c == "MV") {
    long l = pVal(s, 1), r = pVal(s, 2);
    drive(map(l, -100, 100, -255, 255), map(r, -100, 100, -255, 255), 0);
  }
}
