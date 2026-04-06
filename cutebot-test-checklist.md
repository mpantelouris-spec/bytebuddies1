# Cutebot Function Test Checklist

Use this checklist after connecting the Cutebot on ByteBuddies to verify all features work.

---

## Setup
- [ ] micro:bit connected via USB
- [ ] ByteBuddies shows "Connected"
- [ ] Cutebot powered on (switch at the back)
- [ ] Smiley face appears on micro:bit display after connecting

---

## Motors

| Test | Block to use | Expected result | Pass? |
|------|-------------|-----------------|-------|
| Forward | Forward (800ms) | Both wheels spin forward | [ ] |
| Backward | Backward (800ms) | Both wheels spin backward | [ ] |
| Turn left | Turn Left (500ms) | Robot turns left | [ ] |
| Turn right | Turn Right (500ms) | Robot turns right | [ ] |
| Stop | Stop | Both wheels stop immediately | [ ] |

**Notes:** _______________________________________________

---

## Headlights (Front LEDs)

| Test | Block to use | Expected result | Pass? |
|------|-------------|-----------------|-------|
| Both lights on (white) | Set Headlights → white (255,255,255) | Both LEDs glow white | [ ] |
| Both lights on (red) | Set Headlights → red (255,0,0) | Both LEDs glow red | [ ] |
| Left light only | Set Left Headlight → green (0,255,0) | Left LED only, green | [ ] |
| Right light only | Set Right Headlight → blue (0,0,255) | Right LED only, blue | [ ] |
| Lights off | Set Headlights → off (0,0,0) | Both LEDs off | [ ] |

**Notes:** _______________________________________________

---

## Ultrasonic Sensor (Sonar)

| Test | Block to use | Expected result | Pass? |
|------|-------------|-----------------|-------|
| Read distance | Read Sonar → show on display | Number shown on micro:bit display | [ ] |
| Close object | Hold hand 5cm away | Display shows ~5 | [ ] |
| Far object | Hold hand 30cm away | Display shows ~30 | [ ] |

**Notes:** _______________________________________________

---

## Line Sensors

| Test | Block to use | Expected result | Pass? |
|------|-------------|-----------------|-------|
| On white surface | Read Line Sensors | Returns (0, 0) — no line | [ ] |
| Left sensor on black | Place left sensor over black line | Left value = 1 | [ ] |
| Right sensor on black | Place right sensor over black line | Right value = 1 | [ ] |

**Notes:** _______________________________________________

---

## Overall Result

- [ ] All tests passed — Cutebot working correctly
- [ ] Some tests failed — see notes above

**Tested by:** _________________ **Date:** _________________
