# Google Classroom OAuth verification demo

## Before recording

Google's review email specifically requires a comprehensive demo that shows (1) the OAuth consent flow and permission screen, (2) every requested scope fully expanded and readable (click **Show all services** if needed), (3) that the scopes in the video exactly match the scopes configured and submitted in Google Cloud, and (4) the maximum extent of the user-facing ByteBuddies features that use those scopes. Keep the complete consent page on screen long enough to read every permission; do not blur, crop, scroll past, or cover scope names. Show each requested scope in the consent flow where it is requested, then show the corresponding feature working in ByteBuddies. Google's email asks you to reply directly to that email with an accessible video link after updating the demo and/or scope configuration.

Use a dedicated Google Classroom test teacher and test course with synthetic pupil accounts and test assignments. Do not expose real pupil names, emails, grades, or classwork in a video that may be publicly accessible. Set the eventual YouTube video to **Unlisted** and check the whole recording for personal data before sharing its link with Google.

**Scope matching must be checked before recording.** The current app requests the following scopes by role in `src/utils/googleClassroom.js`:

Teacher flow:

- `https://www.googleapis.com/auth/classroom.courses.readonly` — show ByteBuddies listing active courses taught by the signed-in teacher.
- `https://www.googleapis.com/auth/classroom.rosters.readonly` — show importing/updating that test course's pupil roster.
- `https://www.googleapis.com/auth/classroom.profile.emails` — explain that pupil email addresses let ByteBuddies match the imported Classroom roster to pupil accounts. Keep actual addresses out of the video.
- `https://www.googleapis.com/auth/classroom.coursework.students` — show a teacher setting a ByteBuddies task in the linked Google course and returning a ByteBuddies mark to a test pupil's submission.

Student flow:

- `https://www.googleapis.com/auth/classroom.courses.readonly` — show the pupil seeing their own active course.
- `https://www.googleapis.com/auth/classroom.coursework.me.readonly` — show the pupil seeing only their own published ByteBuddies assignment in that course.

The OAuth Data Access configuration and the submitted verification scope list must match the scopes shown by these two role-specific consent screens. If the Cloud Console list differs, reconcile the app and the submitted list first, then record again. Do not add a permission just to make the video look comprehensive.

## Important feature gap to resolve first

The teacher dashboard has an option to post a class announcement to Google Classroom (`createAnnouncement` in `src/utils/googleClassroom.js`, called from `src/components/TeacherDashboard.jsx`). Google's Classroom API requires `https://www.googleapis.com/auth/classroom.announcements` for that API call. The current teacher OAuth request does **not** request that scope. Therefore, do not claim or demonstrate that specific API action as working in this recording. Either remove/disable that optional API action for the verification build, or have the developer deliberately add and configure the additional scope, then include it in the verification request and record its use. The narrower option avoids requesting another sensitive permission.

## Recording plan and narration (about 3 minutes)

Record at 1080p landscape, with browser zoom at 100%, notifications silenced, and English selected at the bottom-left of Google's consent screen. Use a screen recorder that captures the browser popup. Move the pointer away from text before pausing on each important screen.

### 0:00–0:15 — Identify the app and its purpose

Show the real `bytebuddies.technology` site and its ByteBuddies branding, then open a teacher account's Classroom page.

Narration: “ByteBuddies is a coding and robotics learning platform for schools. Teachers can connect a Google Classroom course, bring its class list into ByteBuddies, set coding work, and return marks. Pupils can connect their own Classroom account to see their assigned work.”

### 0:15–0:55 — Teacher OAuth grant and complete permission list

Click **Connect Google Classroom**. Show the complete Google flow from account selection through the consent page. Make sure the account shown is the dedicated test teacher, not a personal or real school account. Expand **Show all services** (if shown); frame and pause on the full list so every permission is readable. If Google splits the list across screens, capture each part and keep the recording continuous. Do not edit, cover, blur, or crop out any requested permission. Continue only after the test account owner has reviewed and approved the displayed access.

Narration: “The teacher grants access only after choosing Connect. Read-only course access finds classes they teach. Read-only roster access imports the class list. The profile email permission is used to match roster members to their ByteBuddies accounts. Coursework access is used to publish a teacher-selected task and return marks for the coursework ByteBuddies created.”

### 0:55–1:35 — Show course and roster use

Back in ByteBuddies, show the connected test teacher, refresh the course list, import the named test course, then show its test roster in the matching ByteBuddies class. Keep test identities synthetic; do not expose real pupil email addresses.

Narration: “Here the teacher's active Google Classroom course is listed and imported. ByteBuddies uses the roster to populate this class and match pupils by their school Google email. The roster is used for this class-management feature only.”

### 1:35–2:10 — Show coursework and grade use

Set a clearly labelled test assignment in the imported course. Show it in Google Classroom. In ByteBuddies, open the corresponding test hand-in/mark and send that test mark back to the coursework created by ByteBuddies; show the result in Classroom. Do not modify a real student's grade.

Narration: “The teacher chooses a ByteBuddies task and publishes it to the linked course. After marking the test pupil's work in ByteBuddies, the teacher sends that mark to the matching ByteBuddies-created Classroom assignment. ByteBuddies does not edit unrelated coursework.”

### 2:10–2:45 — Student OAuth and pupil view

Use a separate browser profile/session and a synthetic test pupil. Open the student Classroom view and click its Google Classroom connect action. Show the full English student consent screen, expand all services if offered, and pause so every student permission is readable. Then show the pupil's own course and the published ByteBuddies assignment. Avoid exposing the teacher's roster or another pupil's information.

Narration: “Pupils connect their own Google account separately. Course access locates their enrolled class, and coursework access lets ByteBuddies display their own published assignments. The student view shows the work they need to complete.”

### 2:45–3:00 — Close

Return to the ByteBuddies pupil or teacher page and show the app name/branding.

Narration: “These are the Google Classroom features ByteBuddies uses. Users can disconnect Classroom from the app, and can also revoke access from their Google Account.”

## Final checks

- The recording is the actual production/staging ByteBuddies app with the same branding submitted to Google.
- Each actual teacher and student OAuth consent screen is shown from start to finish; all scopes are expanded, readable, and in English.
- Every OAuth consent page is fully expanded and readable; if Google splits permissions over more than one screen, show every screen.
- The scopes shown for each flow match the Google Cloud OAuth Data Access configuration and verification submission exactly, with no unexplained or extra scope.
- Every requested scope is connected in the narration to a feature that is shown working.
- Teacher and student grant flows are both included because the app requests scopes from both roles.
- The course, roster, assignment, hand-in, and mark used in demonstrations are test data only.
- Playback at normal speed confirms that no scope text, email, pupil name, or grade is unreadable or accidentally exposed.
- Upload as Unlisted, verify the review team can access the link, then reply directly to Google's verification email with that link.
