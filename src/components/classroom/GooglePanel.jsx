import React, { useEffect, useState } from 'react';
import { GoogleClassroomLogo, GoogleG, Avatar } from './ui.jsx';
import {
  connectGoogleClassroom, disconnectGoogleClassroom, getGcSession, listCourses, listStudents,
  openShareToClassroom, appLink,
} from '../../utils/googleClassroom.js';
import { EmojiIcon, IconText } from '../ui/Icon.jsx';

/** Explains a Google error in teacher-friendly words, with what to do next. */
export function GcErrorNote({ error }) {
  if (!error) return null;
  const extra = {
    'api-disabled': 'Share buttons still work right now. To import classes and send grades, the ByteBuddies admin needs to switch on the Google Classroom API (one-time setup).',
    admin: 'In the Google Admin console: Security → Access and data control → API controls → Manage third-party app access → add ByteBuddies as Trusted.',
    popup: 'Look for a blocked pop-up icon in the address bar.',
    cancelled: 'The Google window was closed before authorization finished. Reconnect and leave it open until it returns to ByteBuddies.',
    redirect: <>In Google Cloud project <b>connectr-5b7a4</b>, go to <b>APIs &amp; Services → Credentials</b>, open the OAuth web client used by Firebase Authentication, and add this Authorized redirect URI exactly: <code style={{ overflowWrap: 'anywhere' }}>https://connectr-5b7a4.firebaseapp.com/__/auth/handler</code>. Also check Firebase Console → Authentication → Settings → Authorized domains includes <code>connectr-5b7a4.firebaseapp.com</code>.</>,
  }[error.code];
  return (
    <div className="cr-note cr-note--err" style={{ marginTop: 12 }}>
      <b>{error.message}</b>
      {extra && <div style={{ marginTop: 4 }}>{extra}</div>}
    </div>
  );
}

export function useGcSession() {
  const [session, setSession] = useState(getGcSession);
  useEffect(() => {
    const t = setInterval(() => setSession(getGcSession()), 30_000);
    return () => clearInterval(t);
  }, []);
  return [session, setSession];
}

export default function GooglePanel({ cls, classes, onImport, onLink, onRefreshRoster, toast }) {
  const [session, setSession] = useGcSession();
  const [courses, setCourses] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    setBusy('courses');
    try { setCourses(await listCourses('teacher')); } catch (e) { setError(e); if (e.code === 'expired') setSession(null); }
    setBusy('');
  };

  useEffect(() => { if (session && !courses) load(); }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  const connect = async () => {
    setError(null);
    setBusy('connect');
    try { setSession(await connectGoogleClassroom('teacher')); } catch (e) { setError(e); }
    setBusy('');
  };

  const run = async (key, fn) => {
    setError(null);
    setBusy(key);
    try { await fn(); } catch (e) { setError(e); if (e.code === 'expired') setSession(null); }
    setBusy('');
  };

  const linkedIds = new Set(classes.map((c) => c.gcCourseId).filter(Boolean));

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="cr-card" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <GoogleClassroomLogo size={46} />
        <div className="cr-grow">
          <h3 style={{ fontSize: 18, fontWeight: 900 }}>Google Classroom</h3>
          <div className="cr-muted" style={{ fontSize: 13.5, marginTop: 3 }}>
            {session ? <>Connected as <b>{session.email}</b></> : 'Import your classes and pupils, post work and send grades back — no invite codes.'}
          </div>
        </div>
        {session ? (
          <div className="cr-row">
            <button className="cr-btn cr-btn--sm" onClick={load} disabled={busy === 'courses'}><IconText>{busy === 'courses' ? 'Loading…' : '🔄 Refresh'}</IconText></button>
            <button className="cr-btn cr-btn--sm cr-btn--ghost" onClick={() => { disconnectGoogleClassroom(); setSession(null); setCourses(null); }}>Disconnect</button>
          </div>
        ) : (
          <button className="cr-btn cr-btn--google cr-btn--lg" onClick={connect} disabled={busy === 'connect'}>
            <GoogleG /> {busy === 'connect' ? 'Waiting for Google…' : 'Connect Google Classroom'}
          </button>
        )}
      </div>

      {!session && (
        <div className="cr-note" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
          {busy === 'connect'
            ? <>If Google shows <b>hasn’t verified this app</b>, click <b>Advanced</b>, then <b>Go to ByteBuddies</b>. That screen is Google’s, not a ByteBuddies error — keep the window open until it finishes.</>
            : <>Press <b>Connect Google Classroom</b> and finish the Google consent screen. If Google reports <b>redirect_uri_mismatch</b>, the OAuth callback needs a one-time Google Cloud Console update; the exact URI will be shown with the error. You can still share work with the buttons below without connecting.</>}
        </div>
      )}

      <GcErrorNote error={error} />

      {session && courses && (
        <div className="cr-card">
          <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 12 }}>Your Google Classroom classes</h3>
          {courses.length === 0 && <div className="cr-muted">No active classes found where you are a teacher.</div>}
          <div style={{ display: 'grid', gap: 10 }}>
            {courses.map((c) => {
              const linked = classes.find((x) => x.gcCourseId === c.id);
              return (
                <div key={c.id} className="cr-sub cr-row" style={{ gap: 12 }}>
                  <GoogleClassroomLogo size={30} />
                  <div className="cr-grow">
                    <div style={{ fontWeight: 800 }}>{c.name}</div>
                    <div className="cr-muted" style={{ fontSize: 12.5 }}>{[c.section, c.room].filter(Boolean).join(' · ') || 'Google Classroom'}</div>
                  </div>
                  {linked ? (
                    <>
                      <span className="cr-chip" style={{ background: '#10b98122', color: '#10b981' }}>✓ Linked to {linked.name}</span>
                      <button className="cr-btn cr-btn--sm" disabled={busy === `r${c.id}`}
                        onClick={() => run(`r${c.id}`, async () => { const r = await onRefreshRoster(linked, await listStudents(c.id)); toast?.(`Pupil list updated — ${r?.count ?? r} pupils${r?.note ? ` · ${r.note}` : ''}`); })}>
                        <IconText>{busy === `r${c.id}` ? 'Updating…' : '👥 Update pupils'}</IconText>
                      </button>
                    </>
                  ) : (
                    <>
                      {cls && !cls.gcCourseId && (
                        <button className="cr-btn cr-btn--sm" disabled={!!busy}
                          onClick={() => run(`l${c.id}`, async () => { const note = await onLink(cls, c, await listStudents(c.id)); toast?.(`${cls.name} is now linked to ${c.name}${note ? ` · ${note}` : ''}`); })}>
                          <EmojiIcon e="🔗" style={{ marginRight: '0.35em' }} />Link to {cls.name}
                        </button>
                      )}
                      <button className="cr-btn cr-btn--sm cr-btn--primary" disabled={!!busy || linkedIds.has(c.id)}
                        onClick={() => run(`i${c.id}`, async () => { const note = await onImport(c, await listStudents(c.id)); toast?.(`Imported ${c.name}${note ? ` · ${note}` : ''}`); })}>
                        <IconText>{busy === `i${c.id}` ? 'Importing…' : '⬇ Import class'}</IconText>
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="cr-card">
        <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>Share anything to Google Classroom</h3>
        <p className="cr-muted" style={{ margin: '0 0 12px', fontSize: 13.5, lineHeight: 1.5 }}>
          Works with any Google account, no setup. Every piece of classwork has a <b>Share to Classroom</b> button — pupils click the link in Google Classroom and land straight in the work.
        </p>
        <div className="cr-row">
          {cls && (
            <button className="cr-btn cr-btn--google" onClick={() => openShareToClassroom({
              url: appLink(`classroom?join=${cls.inviteCode}`),
              title: `Join ${cls.name} on ByteBuddies`,
              body: `Click the link to join our ByteBuddies class. Class code: ${cls.inviteCode}`,
              itemtype: 'announcement',
            })}>
              <GoogleClassroomLogo size={18} /> Post the join link for {cls.name}
            </button>
          )}
          <button className="cr-btn" onClick={() => openShareToClassroom({ url: appLink('learn'), title: 'ByteBuddies computing lessons', itemtype: 'material' })}>
            <EmojiIcon e="📚" style={{ marginRight: '0.35em' }} />Share the lesson library
          </button>
          <button className="cr-btn" onClick={() => openShareToClassroom({ url: appLink('missions'), title: 'ByteBuddies coding missions', itemtype: 'material' })}>
            <EmojiIcon e="🚀" style={{ marginRight: '0.35em' }} />Share missions
          </button>
        </div>
      </div>

      <details className="cr-card">
        <summary style={{ cursor: 'pointer', fontWeight: 800 }}>How does it work for pupils?</summary>
        <div className="cr-steps" style={{ marginTop: 14 }}>
          <div className="cr-step"><i>1</i><span>Pupils open the ByteBuddies link in their Google Classroom stream or classwork.</span></div>
          <div className="cr-step"><i>2</i><span>They sign in with Google. If their email is on the imported list they join your class straight away.</span></div>
          <div className="cr-step"><i>3</i><span>The work opens. Lessons and missions tick off by themselves and you can send grades back to Google.</span></div>
        </div>
        {cls?.students?.length > 0 && (
          <div className="cr-row" style={{ marginTop: 14 }}>
            {cls.students.slice(0, 12).map((s) => <Avatar key={s.id || s.email} name={s.name} photo={s.photo} size={28} />)}
            {cls.students.length > 12 && <span className="cr-muted" style={{ fontSize: 12 }}>+{cls.students.length - 12} more</span>}
          </div>
        )}
      </details>
    </div>
  );
}
