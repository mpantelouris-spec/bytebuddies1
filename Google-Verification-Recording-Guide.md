# Google OAuth verification video — recording guide

Google asked for a video that shows (1) the consent screen with **every scope fully expanded**, and
(2) **each scope being used** in ByteBuddies. Record it in one take if you can (2–4 minutes is fine).

## The scopes ByteBuddies requests (must match Cloud Console exactly)

Check **Google Cloud Console → APIs & Services → OAuth consent screen → Data access (Scopes)**.
The list there must be exactly these five — no more, no fewer:

| Scope | What ByteBuddies uses it for | Where it's shown in the video |
|---|---|---|
| `classroom.courses.readonly` | List the teacher's Google Classroom classes (and a pupil's classes) | Step 4 |
| `classroom.rosters.readonly` | Import the pupils in a class | Step 5 |
| `classroom.profile.emails` | Match imported pupils to their ByteBuddies sign-in by email | Step 5 |
| `classroom.coursework.students` | Post a ByteBuddies assignment to Classroom, and send grades back | Steps 6 and 7 |
| `classroom.coursework.me.readonly` | A pupil sees the ByteBuddies work their teacher set in Classroom | Step 8 |

(Normal "Sign in with Google" only uses email/profile/openid — those don't need verification.)

## Before you record

- Use a **Google Workspace test account that is a teacher** in a Google Classroom class with at least
  2 test pupils, plus **one test pupil account**. Don't show real pupils' names or emails.
- In Google Account settings for the test account, **remove ByteBuddies' access** (myaccount.google.com →
  Security → Third-party apps) so the full consent screen appears again.
- Use Chrome, signed out of other Google accounts if possible. Zoom the page to 110–125% so text is readable.
- Record with **Cmd + Shift + 5 → Record Entire Screen** (or Record Selected Portion around the browser).
- Make sure the **address bar is visible** the whole time (Google checks the domain).

## What to do on camera

1. **Show the app and its URL.** Open `https://bytebuddies.technology`. Say/caption: *"ByteBuddies — a coding
   platform for primary schools."*
2. **Sign in to ByteBuddies as the teacher.** Open **Classroom** from the menu.
3. **Start the Classroom connection.** Press **Connect Google Classroom**.
4. **Consent screen — the important part.**
   - Choose the teacher account.
   - On the permissions screen, click **"Show all services"** / expand every item so **all five scopes are
     fully readable**. Pause 3–4 seconds on it. Scroll slowly if it's long.
   - Click **Continue / Allow**.
   - Back in ByteBuddies you'll see **"Your Google Classroom classes"** — this is `classroom.courses.readonly`.
5. **Import a class.** Press **⬇ Import class** on one class. Show the pupils appearing with their emails —
   this is `classroom.rosters.readonly` + `classroom.profile.emails`.
6. **Post an assignment.** Open the imported class → **Set work** → choose any lesson or mission → tick
   **Also post to Google Classroom** → set it. Then switch to the Google Classroom tab and show the new
   assignment there — this is `classroom.coursework.students`.
7. **Send grades back.** In ByteBuddies, open that assignment's marking view, give a test pupil a mark, press
   **Send grades to Google Classroom**. Show the grade in Google Classroom — also `classroom.coursework.students`.
8. **Pupil view.** Sign in to ByteBuddies as the test pupil (incognito window is easiest) → **Classroom** →
   connect Google Classroom (consent screen for the pupil scopes — expand it again) → show
   **"ByteBuddies work in Google Classroom"** listing the assignment — this is `classroom.coursework.me.readonly`.
9. End on the ByteBuddies dashboard.

## After recording

- Send me the recording file and I'll add clear captions naming each scope at the right moment, blur any
  personal details, and export an MP4 ready for YouTube.
- Upload to YouTube as **Unlisted** (not Private — reviewers must be able to open it).
- Reply **directly to Google's email** with the YouTube link, as they asked.
