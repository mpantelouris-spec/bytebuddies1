# ByteBuddies Extension Testing Guide

**Status:** Comprehensive Testing Plan  
**Date:** May 3, 2026  
**Total Extensions:** 34

---

## ✅ Testing Checklist by Category

### 🎥 Camera & Detection (5 extensions)

#### 1. **Face Detection** 
- [ ] Turn video on (camera)
- [ ] Turn video on (mirrored)
- [ ] Turn video off
- [ ] Show/Hide bounding box
- [ ] Number of faces (returns count)
- [ ] Face visible? (returns true/false)
- [ ] Expression of face 1
- [ ] X/Y position of face 1
- [ ] Size of face 1
- [ ] Is face 1 happy?

**Test:** Click "Turn video on (camera)", allow camera access, should show preview bottom-left, draggable

---

#### 2. **Object Detection**
- [ ] Turn video on
- [ ] Turn video off
- [ ] Show/Hide bounding box
- [ ] Analyse image from camera
- [ ] Number of objects (returns count)
- [ ] Class of object 1
- [ ] Is person detected?
- [ ] Number of persons detected

**Test:** Click "Turn video on", camera shows bottom-right, click "Show bounding box" to see labels

---

#### 3. **Human Body Detection (Pose)**
- [ ] Analyse from face
- [ ] Body visible?
- [ ] Keypoint X/Y
- [ ] Nose X/Y

**Test:** Turn face detection on, then use body blocks to get pose data

---

#### 4. **Video Sensing (Motion Detection)**
- [ ] Motion amount (0-100)
- [ ] Motion direction

**Test:** Allow camera access, move in front of camera, check motion values change

---

#### 5. **Text Recognition (OCR)**
- [ ] Read text from image/camera
- [ ] OCR accuracy with printed text

**Test:** Point camera at printed text, should extract words

---

### 🧠 Machine Learning (9 extensions)

#### 6. **Machine Learning Environment**
- [ ] Training window opens
- [ ] Can add examples
- [ ] Can train classifier
- [ ] Top class returns value

**Test:** Open ML environment, add 2-3 examples of each class, train, test

---

#### 7. **Text Classifier**
- [ ] Train on sentence examples
- [ ] Classify new text
- [ ] Returns top label & confidence

**Test:** Train on "happy" vs "sad" sentences, test with new sentence

---

#### 8. **Image Classifier**
- [ ] Train on image examples
- [ ] Classify images
- [ ] Show top class & score

**Test:** Train on "cat" vs "dog" images, test classification

---

#### 9. **Pose Classifier**
- [ ] Train on body poses
- [ ] Recognize poses from camera
- [ ] Return pose name

**Test:** Train on "standing" vs "sitting", test with your pose

---

#### 10. **Audio Classifier**
- [ ] Train on sound examples
- [ ] Classify audio
- [ ] Return audio label

**Test:** Train on "clap" vs "snap", test audio classification

---

#### 11. **Numbers (Regression)**
- [ ] Train number examples
- [ ] Predict value from input
- [ ] Return prediction

**Test:** Train on X→Y pairs, predict new Y from X

---

#### 12. **Natural Language Processing**
- [ ] Sentiment analysis (returns -1 to 1)
- [ ] Text tokenization
- [ ] Word detection

**Test:** Check sentiment of "I love this" should be >0.5

---

#### 13. **Translate**
- [ ] Translate text between languages
- [ ] Support multiple language pairs

**Test:** Translate "Hello" to Spanish, French, etc.

---

#### 14. **Chat & Prompts**
- [ ] Send prompt to AI
- [ ] Get response
- [ ] Support follow-ups

**Test:** Ask a question, should get response in output

---

### 🔊 Audio & Speech (3 extensions)

#### 15. **Text to Speech**
- [ ] Speak text block
- [ ] Change voice
- [ ] Adjust speed

**Test:** Add block, type text, should hear audio output

---

#### 16. **Speech Recognition**
- [ ] Listen for words
- [ ] Record and transcribe
- [ ] Branch on recognized words

**Test:** Allow mic access, speak words, should recognize

---

### 📱 Hardware & Robotics (8 extensions)

#### 17. **Arduino**
- [ ] Digital write (sets pin HIGH/LOW)
- [ ] Analog read/write
- [ ] Pin mode (INPUT/OUTPUT)
- [ ] Timing (delay)

**Test:** Set pin 13 to HIGH, read analog pin, should show values

---

#### 18. **micro:bit**
- [ ] Button A/B detection
- [ ] LED display
- [ ] Accelerometer reading
- [ ] Radio messaging

**Test:** Check button pressed returns true, accelerometer X/Y/Z

---

#### 19. **evive/STEM Console**
- [ ] Motor control
- [ ] Potentiometer reading
- [ ] Switch detection

**Test:** Read pot slider, control motor speed

---

#### 20. **Robot: Line Follower**
- [ ] Read line sensors (left, center, right)
- [ ] Adjust motor speed

**Test:** Check sensor values update based on line position

---

#### 21. **Robot: Pick & Place Arm**
- [ ] Set joint angles
- [ ] Grip control (open/close)
- [ ] Move to coordinates

**Test:** Set angle to 90°, grip to grab position

---

#### 22. **Robot: Mecanum Drive**
- [ ] Strafe (move sideways)
- [ ] Spin in place
- [ ] Move forward/backward

**Test:** Set velocity X, Y, rotation - should move correctly

---

#### 23. **Robot: Humanoid Walk**
- [ ] Walk forward
- [ ] Walk backward
- [ ] Turn left/right
- [ ] Balance

**Test:** Set walk speed, gait should execute

---

#### 24. **Robot: Rover**
- [ ] Drive mode (forward, reverse, spin)
- [ ] Terrain handling
- [ ] Suspension simulation

**Test:** Set rover mode to forward, wheel speed updates

---

### ☁️ IoT & Cloud (5 extensions)

#### 25. **Internet of Things**
- [ ] Publish data to feed
- [ ] Subscribe to data
- [ ] Cloud dashboard

**Test:** Publish value, should appear in feed list

---

#### 26. **Weather Data**
- [ ] Get temperature
- [ ] Get conditions
- [ ] Get city forecast

**Test:** Query "London" temperature, should return number

---

#### 27. **IFTTT/Webhooks**
- [ ] Trigger applet
- [ ] Send HTTP request
- [ ] Get response

**Test:** Send webhook trigger, check IFTTT executes

---

#### 28. **QR & Barcodes**
- [ ] Scan QR code
- [ ] Read barcode
- [ ] Get payload

**Test:** Point camera at QR code, should extract data

---

#### 29. **Data Logger**
- [ ] Log values over time
- [ ] Export data
- [ ] Chart data

**Test:** Log 5 temperature samples, verify in log list

---

### 🎨 Creative & Media (4 extensions)

#### 30. **Pen** (Drawing)
- [ ] Draw trails
- [ ] Change color
- [ ] Set pen size
- [ ] Stamp shapes

**Test:** Draw on canvas, change color, should see trail

---

#### 31. **Music & Notes**
- [ ] Play note (1-127)
- [ ] Set tempo
- [ ] Stop sounds
- [ ] Set volume ✅ **FIXED**

**Test:** Play note 60, set volume 50, play another note

---

#### 32. **Video Player**
- [ ] Load video file
- [ ] Play/pause
- [ ] Seek to position
- [ ] Get video duration

**Test:** Load MP4, press play, should show video

---

### 💨 Physics (1 extension)

#### 33. **Physics Engine** ✅ **FIXED**
- [ ] Set velocity (vx, vy)
- [ ] Set gravity
- [ ] Set friction
- [ ] Set bounce
- [ ] Jump impulse
- [ ] Read position/velocity

**Test:** Create sprite, set gravity 0.5, jump 10, should fall

---

### 🔌 Utility (1 extension)

#### 34. **Motion Detection Video**
- [ ] Detect motion presence
- [ ] Get motion amount
- [ ] Get motion direction

**Test:** Move in front of camera, motion value should increase

---

## 📊 Testing Progress

### Recently Fixed ✅
- Face Detection (all blocks wired, camera working, draggable)
- Object Detection (all blocks wired, camera working)
- Physics Engine (velocity, gravity, bounce, jump all working)
- Music & Notes (set volume now functional)
- All read blocks (fixed Python handling for return values)
- All analyse blocks (fixed asynchronous execution)

### Need to Verify
- [ ] Text to Speech (web speech API)
- [ ] Speech Recognition (browser mic access)
- [ ] Translate (translation API)
- [ ] OCR (text recognition)
- [ ] Chat/Prompts (AI integration)
- [ ] Arduino/micro:bit/evive (simulation)
- [ ] All robot blocks (motor simulation)
- [ ] Weather data (API call)
- [ ] IFTTT webhooks (HTTP)
- [ ] QR code scanning
- [ ] Data logger (storage)
- [ ] Video player (playback)
- [ ] Other ML classifiers

---

## 🧪 Quick Test Steps

1. **Start Server:** `npm run dev`
2. **Open:** http://localhost:4200
3. **Test Face Detection:**
   - Drag `[Face] Turn video on (camera)` block to workspace
   - Allow camera permission
   - Should see preview in bottom-left corner
   - Preview should be draggable

4. **Test Object Detection:**
   - Drag `[Object] Turn video on (on) with transparency 0` block
   - Should see preview in bottom-right corner
   - Click `[Object] Show bounding box`
   - Should see object labels

5. **Test Music & Notes:**
   - Drag `[Music] Set volume to 50` block
   - Drag `[Music] Play note 60 for 1 beats` block
   - Click Run - should hear note at 50% volume

6. **Test Physics:**
   - Create sprite in game builder
   - Add `set gravity to 0.5` block
   - Add `set velocity to 5 on x, 0 on y` block
   - Sprite should move with gravity

---

## 🐛 Known Issues & Fixes

| Extension | Issue | Status |
|-----------|-------|--------|
| Face Detection | Blocks not wired | ✅ FIXED |
| Object Detection | Camera handlers missing | ✅ FIXED |
| Music & Notes | Set volume didn't work | ✅ FIXED |
| All read blocks | Python didn't return values | ✅ FIXED |
| Analyse blocks | Asynchronous output | ✅ FIXED |
| Physics Engine | Not implemented | ✅ FIXED |

---

## 📝 Notes

- **Camera blocks** (Face, Object, Body, Video): All require user permission
- **ML blocks**: Need training examples first
- **Hardware blocks**: Currently simulated (not real devices)
- **Web blocks**: Require HTTPS in production
- **API blocks**: May have rate limits or require keys

---

## Next Steps

1. Test each category in the app
2. Document any blocks that don't work
3. Report specific errors in output
4. Fix any remaining issues
5. Verify all 34 extensions functional

**Start with cameras (Face, Object, Body, Video) → ML classifiers → Hardware/Robots → Cloud/IoT → Media**

---

*Test systematically, one extension at a time. Most are working. Focus on the ones marked with "+" that need to be added.*
