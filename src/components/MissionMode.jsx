import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';

const CAMPAIGNS = [
  {
    id: 'space',
    title: 'Space Explorer',
    emoji: '🚀',
    tagline: 'Master sequences & loops across the galaxy',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.4)',
    bg: 'linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 50%, #0f0f3a 100%)',
    concept: 'Sequences & Loops',
    difficulty: 'Beginner',
    xpTotal: 500,
    missions: [
      { id: 'space-1', title: 'Launch Sequence', emoji: '🔥', story: 'Captain! The launch computer is offline. Mission control needs you to manually program the engine sequence before the window closes.', challenge: 'Create a sequence of at least 5 blocks that fires the rocket: countdown → ignite engines → release clamps → go!', xp: 75, hint: 'Use the "repeat" and "wait" blocks from Control to build your countdown.' },
      { id: 'space-2', title: 'Orbit Calculator', emoji: '🌍', story: 'You\'ve escaped Earth\'s atmosphere! Now you need to set the perfect orbit around the planet. Too fast and you fly off into space — too slow and you crash.', challenge: 'Use a loop to make your rocket orbit the planet exactly 3 times, adjusting speed at each pass.', xp: 100, hint: 'Use "repeat 3 times" with motion blocks inside it.' },
      { id: 'space-3', title: 'Asteroid Field', emoji: '☄️', story: 'Danger! A field of asteroids is dead ahead. Your AI scanner picks up rocks every few seconds. You\'ll need quick reactions to survive.', challenge: 'Write code that checks "if touching asteroid → dodge left, else → fly straight". Add a score counter for each asteroid dodged.', xp: 100, hint: 'Use if/else blocks from Control and a variable to track your score.' },
      { id: 'space-4', title: 'Space Beacon', emoji: '📡', story: 'You\'ve found a distress beacon from a lost probe! It repeats a signal pattern. You need to decode it and broadcast the reply.', challenge: 'Use events to listen for the beacon signal and broadcast a matching response. Trigger different actions on different signals.', xp: 125, hint: 'Use "on message" and "broadcast" blocks from Events.' },
      { id: 'space-5', title: 'Safe Landing', emoji: '🏆', story: 'You\'ve done it! The mission is complete. Now guide your ship through re-entry and land safely using everything you\'ve learned.', challenge: 'Build a full landing sequence using sequences, loops, conditions AND events — all four concepts in one program!', xp: 100, hint: 'Combine all the concepts from previous missions into one final program.' },
    ],
  },
  {
    id: 'ocean',
    title: 'Ocean Deep',
    emoji: '🌊',
    tagline: 'Explore the deep sea with conditions & events',
    color: '#0ea5e9',
    glow: 'rgba(14,165,233,0.4)',
    bg: 'linear-gradient(135deg, #001a2e 0%, #003a5c 50%, #001f3f 100%)',
    concept: 'Conditions & Events',
    difficulty: 'Intermediate',
    xpTotal: 600,
    missions: [
      { id: 'ocean-1', title: 'Dive Protocol', emoji: '🤿', story: 'The submarine systems are ready. But the dive computer needs programming before you can descend safely. Pressure increases with depth — your code must adapt.', challenge: 'Program the submarine to dive in stages: surface → 10m → 50m → 200m, checking pressure at each depth and adjusting life support.', xp: 80, hint: 'Use variables for depth and if/else to check thresholds.' },
      { id: 'ocean-2', title: 'Coral Maze', emoji: '🪸', story: 'The coral reef is beautiful — but deadly to your sub. You need to navigate through a maze of coral without touching the walls. One wrong move and you\'re stuck!', challenge: 'Use "if touching edge?" to detect coral and change direction. Make the sub navigate the whole maze without stopping.', xp: 120, hint: 'Use "bounce off edges" and "touching?" sensing blocks.' },
      { id: 'ocean-3', title: 'Shark Alert', emoji: '🦈', story: 'The sonar just lit up. Sharks in the area! Your shark-detection algorithm needs to trigger alarms, switch on lights, and radio the surface — all at the same time.', challenge: 'When a shark is detected, trigger 3 simultaneous events: sound the alarm, flash the lights, and send a radio message.', xp: 120, hint: 'Use "broadcast" to trigger multiple event handlers at once.' },
      { id: 'ocean-4', title: 'Treasure Grid', emoji: '💎', story: 'Ancient treasure is scattered across the ocean floor on an 8×8 grid. Your robot arm needs to scan every single square and pick up anything valuable.', challenge: 'Use nested loops to scan every square of an 8×8 grid. Count how many treasures you find using a variable.', xp: 150, hint: 'Use two "repeat" loops — one inside the other — to cover a grid.' },
      { id: 'ocean-5', title: 'Surface!', emoji: '🏆', story: 'The oxygen supply is running low. Emergency ascent! You need to navigate back through the coral, past the sharks, and surface before time runs out.', challenge: 'Build a full escape sequence — detect obstacles, avoid sharks, count remaining oxygen, and surface in under 60 "seconds" of code time.', xp: 130, hint: 'Use a timer variable that decreases each loop cycle.' },
    ],
  },
  {
    id: 'city',
    title: 'City Builder',
    emoji: '🏙️',
    tagline: 'Build a thriving city with variables & data',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.4)',
    bg: 'linear-gradient(135deg, #1a1200 0%, #3d2a00 50%, #1f1800 100%)',
    concept: 'Variables & Data',
    difficulty: 'Intermediate',
    xpTotal: 650,
    missions: [
      { id: 'city-1', title: 'Blueprint', emoji: '📐', story: 'You\'ve been appointed as the lead engineer of a brand-new city! Before anything can be built, you need to set up the variables: population, budget, happiness score.', challenge: 'Create 4 variables: population (start: 100), budget (start: 50000), happiness (start: 75), days (start: 0). Display them all on screen.', xp: 80, hint: 'Use "create variable" for each one, then "show variable" to display them.' },
      { id: 'city-2', title: 'Build the Roads', emoji: '🛣️', story: 'The citizens need roads to get around! Each road segment costs money but increases happiness. Spend wisely — you have a budget to stick to.', challenge: 'Loop 5 times: each iteration deduct 2000 from budget, add 3 to happiness, and print the new values. Stop if budget goes below 0.', xp: 120, hint: 'Use "change budget by -2000" inside a loop with an "if budget < 0" check.' },
      { id: 'city-3', title: 'Power Grid', emoji: '⚡', story: 'The city needs power! You\'re managing a grid across 4 districts. Each district has different energy needs. Underpowered districts lose happiness fast.', challenge: 'Create a list of 4 districts with power levels. Loop through the list: if power < 50 → add 20 power and deduct from budget. Report total cost.', xp: 130, hint: 'Use a list and "get item #" inside a loop to check each district.' },
      { id: 'city-4', title: 'Population Boom', emoji: '📈', story: 'Word is spreading — your city is amazing! Population is growing fast, but that also means more services are needed. Track growth and plan ahead.', challenge: 'Simulate 10 days of growth: each day population increases by 5% if happiness > 70, or by 1% if not. Display final population.', xp: 160, hint: 'Use "set population to population × 1.05" inside an if/else inside a loop.' },
      { id: 'city-5', title: 'Grand Opening', emoji: '🏆', story: 'The mayor is arriving for the grand opening ceremony! Show off all your city\'s stats in a final summary report and trigger the fireworks!', challenge: 'Build a report that displays all variables and calculates a "City Score" = (happiness × 10) + (population / 10). Trigger a celebration animation!', xp: 160, hint: 'Create a new variable cityScore and set it using a formula with other variables.' },
    ],
  },
  {
    id: 'cyber',
    title: 'Cyber Quest',
    emoji: '⚡',
    tagline: 'Master functions & AI to save the network',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.4)',
    bg: 'linear-gradient(135deg, #001a0e 0%, #003320 50%, #001a0e 100%)',
    concept: 'Functions & AI',
    difficulty: 'Advanced',
    xpTotal: 750,
    missions: [
      { id: 'cyber-1', title: 'Debug Protocol', emoji: '🐛', story: 'The network is riddled with bugs! Someone introduced errors into 5 critical systems. You need to identify each bug type and write a fix function for it.', challenge: 'Create a function called "fixBug" that takes a bug type as input and runs the correct repair code. Call it 5 times with different inputs.', xp: 100, hint: 'Use "define my block" with a parameter, then "call function" with arguments.' },
      { id: 'cyber-2', title: 'Pattern Lock', emoji: '🔐', story: 'The security vault uses a pattern lock. The pattern is generated by a mathematical function — crack the formula and unlock the door.', challenge: 'Write a function that generates the sequence: 2, 4, 8, 16, 32. The input is "steps" and output is the nth number in the sequence.', xp: 140, hint: 'Each step multiplies by 2. Use a loop inside your function and a variable to track the result.' },
      { id: 'cyber-3', title: 'Neural Guard', emoji: '🤖', story: 'The base AI has gone rogue! You need to train a new AI classifier to recognise "safe" vs "threat" signals and automatically respond.', challenge: 'Use the AI blocks to classify 5 different inputs as "safe" or "threat". For each "threat" trigger a lockdown function.', xp: 160, hint: 'Use "AI classify" with "if result = threat → call lockdown()" pattern.' },
      { id: 'cyber-4', title: 'Data Heist', emoji: '💾', story: 'The enemy has stolen the city\'s data! You have 60 seconds to intercept, decrypt and restore it — using a series of recursive function calls.', challenge: 'Write a recursive function "decrypt" that calls itself until it reaches the base case. Each call peels off one layer of encryption.', xp: 200, hint: 'Recursion: a function that calls itself. Use an "if count > 0 → call decrypt(count - 1)" pattern.' },
      { id: 'cyber-5', title: 'System Victory', emoji: '🏆', story: 'You did it! The network is secure. Run the final diagnostic — a function that calls all your previous functions to verify each system is working.', challenge: 'Write a "runDiagnostic" function that calls fixBug, decrypt, and lockdown in order. Return a score based on how many systems passed.', xp: 150, hint: 'Your final function should call all the functions you wrote in earlier missions.' },
    ],
  },
];

function CertificateModal({ campaign, studentName, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 800, H = 560;
    canvas.width = W; canvas.height = H;

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0f0f1a');
    bg.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = campaign.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.strokeStyle = campaign.color + '40';
    ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // Glow corners
    const corners = [[40,40],[W-40,40],[40,H-40],[W-40,H-40]];
    corners.forEach(([x,y]) => {
      const g = ctx.createRadialGradient(x,y,0,x,y,30);
      g.addColorStop(0, campaign.color + '60');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(x-30,y-30,60,60);
    });

    // ByteBuddies logo area
    ctx.fillStyle = campaign.color;
    ctx.font = 'bold 14px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BYTEBUDDIES', W / 2, 72);

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '11px Inter, Arial';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', W / 2, 92);

    // Divider line
    ctx.strokeStyle = campaign.color + '60';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(180, 105); ctx.lineTo(W - 180, 105); ctx.stroke();

    // "This certifies that"
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '15px Georgia, serif';
    ctx.fillText('This certifies that', W / 2, 145);

    // Student name
    const nameGrad = ctx.createLinearGradient(200, 0, W - 200, 0);
    nameGrad.addColorStop(0, '#818cf8');
    nameGrad.addColorStop(1, '#c084fc');
    ctx.fillStyle = nameGrad;
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText(studentName, W / 2, 205);

    // Underline
    const nameW = ctx.measureText(studentName).width;
    ctx.strokeStyle = campaign.color + '80';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W/2 - nameW/2, 215); ctx.lineTo(W/2 + nameW/2, 215); ctx.stroke();

    // "has successfully completed"
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '15px Georgia, serif';
    ctx.fillText('has successfully completed the', W / 2, 255);

    // Campaign name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px Inter, Arial';
    ctx.fillText(`${campaign.emoji}  ${campaign.title} Campaign`, W / 2, 295);

    ctx.fillStyle = campaign.color + 'cc';
    ctx.font = '13px Inter, Arial';
    ctx.fillText(`Mastering: ${campaign.concept}`, W / 2, 320);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(100, 345); ctx.lineTo(W - 100, 345); ctx.stroke();

    // Stats row
    const stats = [
      ['5 Missions', 'Completed'],
      [campaign.xpTotal + ' XP', 'Earned'],
      [new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'}), 'Date'],
    ];
    stats.forEach(([val, label], i) => {
      const x = 200 + i * 200;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Inter, Arial';
      ctx.fillText(val, x, 385);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px Inter, Arial';
      ctx.fillText(label, x, 402);
    });

    // Bottom seal
    ctx.fillStyle = campaign.color + '20';
    ctx.beginPath(); ctx.arc(W/2, 470, 44, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = campaign.color;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W/2, 470, 44, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '30px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('🏆', W/2, 482);

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '10px Inter, Arial';
    ctx.fillText('bytebuddies.technology', W / 2, 530);
  }, []);

  const download = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `ByteBuddies_${CAMPAIGNS.find(c=>c.id===campaign.id)?.title?.replace(/ /g,'_')}_Certificate.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 20, padding: 28, maxWidth: 860, width: '100%', border: `1px solid ${campaign.color}40` }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700 }}>🏆 Campaign Complete!</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 12, display: 'block' }} />
        <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Close</button>
          <button onClick={download} style={{ padding: '10px 24px', background: campaign.color, border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            ⬇️ Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MissionMode({ onNavigate }) {
  const { user, addXP } = useUser();
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bb-mission-progress') || '{}'); } catch { return {}; }
  });
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [activeMission, setActiveMission] = useState(null);
  const [showCert, setShowCert] = useState(null);
  const [justCompleted, setJustCompleted] = useState(null);

  const save = (newProgress) => {
    setProgress(newProgress);
    localStorage.setItem('bb-mission-progress', JSON.stringify(newProgress));
  };

  const getCampaignProgress = (cid) => progress[cid] || { completed: [] };
  const isMissionDone = (cid, mid) => getCampaignProgress(cid).completed.includes(mid);
  const isMissionUnlocked = (campaign, missionIdx) => {
    if (missionIdx === 0) return true;
    return isMissionDone(campaign.id, campaign.missions[missionIdx - 1].id);
  };

  const completeM = (campaign, mission) => {
    const cp = getCampaignProgress(campaign.id);
    if (cp.completed.includes(mission.id)) return;
    const newCompleted = [...cp.completed, mission.id];
    const campaignComplete = newCompleted.length >= campaign.missions.length;
    const updated = { ...progress, [campaign.id]: { completed: newCompleted, campaignComplete } };
    save(updated);
    addXP(mission.xp);
    setJustCompleted(mission.id);
    setTimeout(() => setJustCompleted(null), 2000);
    if (campaignComplete) setTimeout(() => setShowCert(campaign), 800);
  };

  const totalXP = CAMPAIGNS.reduce((sum, c) => {
    const cp = getCampaignProgress(c.id);
    return sum + c.missions.filter(m => cp.completed.includes(m.id)).reduce((s, m) => s + m.xp, 0);
  }, 0);
  const totalDone = CAMPAIGNS.reduce((sum, c) => sum + getCampaignProgress(c.id).completed.length, 0);
  const totalMissions = CAMPAIGNS.reduce((sum, c) => sum + c.missions.length, 0);

  // MISSION DETAIL VIEW
  if (activeMission && activeCampaign) {
    const camp = activeCampaign;
    const mission = activeMission;
    const mIdx = camp.missions.findIndex(m => m.id === mission.id);
    const done = isMissionDone(camp.id, mission.id);
    return (
      <div style={{ minHeight: '100vh', background: camp.bg, padding: '32px 24px', maxWidth: 800, margin: '0 auto' }}>
        <button onClick={() => setActiveMission(null)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', marginBottom: 24, fontSize: 13, fontWeight: 600 }}>
          ← Back to {camp.title}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ background: camp.color + '30', border: `1px solid ${camp.color}60`, borderRadius: 8, padding: '4px 12px', fontSize: 12, color: camp.color, fontWeight: 700 }}>
            Mission {mIdx + 1} of {camp.missions.length}
          </span>
          {done && <span style={{ background: '#10b98130', border: '1px solid #10b98160', borderRadius: 8, padding: '4px 12px', fontSize: 12, color: '#10b981', fontWeight: 700 }}>✅ Completed</span>}
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 36 }}>{mission.emoji}</span> {mission.title}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 28px' }}>+{mission.xp} XP on completion</p>

        {/* Story */}
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: camp.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>📖 Mission Briefing</div>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>{mission.story}</p>
        </div>

        {/* Challenge */}
        <div style={{ background: camp.color + '12', border: `1px solid ${camp.color}40`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: camp.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>🎯 Your Challenge</div>
          <p style={{ color: '#fff', fontSize: 15, lineHeight: 1.8, margin: 0 }}>{mission.challenge}</p>
        </div>

        {/* Hint */}
        <details style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 20px', marginBottom: 28, cursor: 'pointer' }}>
          <summary style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, listStyle: 'none', userSelect: 'none' }}>
            💡 Need a hint? (click to reveal)
          </summary>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 12, marginBottom: 0, lineHeight: 1.7 }}>{mission.hint}</p>
        </details>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => { onNavigate('gamebuilder'); }}
            style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}
          >
            🎮 Open Game Builder
          </button>
          <button
            onClick={() => { onNavigate('workspace'); }}
            style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
          >
            💻 Open Workspace
          </button>
          {!done ? (
            <button
              onClick={() => completeM(camp, mission)}
              style={{ padding: '14px 28px', background: camp.color, border: 'none', borderRadius: 12, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 15, boxShadow: `0 4px 20px ${camp.glow}`, marginLeft: 'auto' }}
            >
              ✅ Mark as Complete → +{mission.xp} XP
            </button>
          ) : (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 700, fontSize: 15 }}>
              🏅 Mission Complete!
            </div>
          )}
        </div>
      </div>
    );
  }

  // CAMPAIGN VIEW
  if (activeCampaign) {
    const camp = activeCampaign;
    const cp = getCampaignProgress(camp.id);
    const pct = Math.round((cp.completed.length / camp.missions.length) * 100);
    return (
      <div style={{ minHeight: '100vh', background: camp.bg, padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
        <button onClick={() => setActiveCampaign(null)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer', marginBottom: 24, fontSize: 13, fontWeight: 600 }}>
          ← All Campaigns
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 52, marginBottom: 8 }}>{camp.emoji}</div>
            <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>{camp.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, margin: '0 0 12px' }}>{camp.tagline}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ background: camp.color + '20', border: `1px solid ${camp.color}50`, borderRadius: 20, padding: '4px 12px', fontSize: 12, color: camp.color, fontWeight: 700 }}>{camp.concept}</span>
              <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>⚔️ {camp.difficulty}</span>
              <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>⭐ {camp.xpTotal} XP total</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: camp.color }}>{pct}%</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{cp.completed.length}/{camp.missions.length} done</div>
            <div style={{ width: 120, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
              <div style={{ width: `${pct}%`, height: '100%', background: camp.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
            </div>
            {cp.campaignComplete && (
              <button onClick={() => setShowCert(camp)} style={{ marginTop: 12, padding: '8px 14px', background: camp.color, border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                🏆 View Certificate
              </button>
            )}
          </div>
        </div>

        {/* Mission list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {camp.missions.map((mission, idx) => {
            const done = isMissionDone(camp.id, mission.id);
            const unlocked = isMissionUnlocked(camp, idx);
            return (
              <div
                key={mission.id}
                onClick={() => unlocked && setActiveMission(mission)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px',
                  background: done ? camp.color + '15' : unlocked ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.3)',
                  border: `1px solid ${done ? camp.color + '50' : unlocked ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: 14, cursor: unlocked ? 'pointer' : 'default',
                  opacity: unlocked ? 1 : 0.4,
                  transition: 'transform 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { if (unlocked) { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = camp.color + '70'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = done ? camp.color + '50' : unlocked ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: done ? camp.color : unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {done ? '✅' : unlocked ? mission.emoji : '🔒'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 3 }}>
                    Mission {idx + 1}: {mission.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{mission.story.slice(0, 80)}…</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: done ? '#10b981' : camp.color }}>+{mission.xp} XP</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{done ? 'Earned' : unlocked ? 'Available' : 'Locked'}</div>
                </div>
                {unlocked && !done && <div style={{ color: camp.color, fontSize: 18, flexShrink: 0 }}>→</div>}
              </div>
            );
          })}
        </div>

        {showCert && <CertificateModal campaign={showCert} studentName={user.name} onClose={() => setShowCert(null)} />}
      </div>
    );
  }

  // CAMPAIGN SELECTION (main view)
  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, padding: '6px 18px', fontSize: 13, color: '#818cf8', fontWeight: 600, marginBottom: 20 }}>
          🗺️ Story-Based Learning
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.1 }}>
          Mission Mode
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.7 }}>
          Go on epic coding adventures. Each campaign tells a story — you write the code that makes it happen. Unlock badges, earn XP, and collect certificates.
        </p>

        {/* Global progress */}
        <div style={{ display: 'inline-flex', gap: 32, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '14px 28px' }}>
          {[
            { val: totalDone, label: 'Missions Done', color: '#6366f1' },
            { val: `${totalMissions - totalDone}`, label: 'Remaining', color: '#f59e0b' },
            { val: `${totalXP.toLocaleString()} XP`, label: 'Total Earned', color: '#10b981' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 20 }}>
        {CAMPAIGNS.map(camp => {
          const cp = getCampaignProgress(camp.id);
          const pct = Math.round((cp.completed.length / camp.missions.length) * 100);
          return (
            <div
              key={camp.id}
              onClick={() => setActiveCampaign(camp)}
              style={{
                background: camp.bg, borderRadius: 20, padding: 28, cursor: 'pointer',
                border: `1px solid ${camp.color}30`, position: 'relative', overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${camp.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Decorative bg glow */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: camp.color + '15', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>{camp.emoji}</div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{camp.title}</h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{camp.tagline}</p>
                </div>
                {cp.campaignComplete && (
                  <div style={{ background: '#10b981', borderRadius: 12, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#fff' }}>🏆 Complete</div>
                )}
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ background: camp.color + '25', border: `1px solid ${camp.color}50`, borderRadius: 20, padding: '3px 10px', fontSize: 11, color: camp.color, fontWeight: 700 }}>{camp.concept}</span>
                <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{camp.difficulty}</span>
                <span style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>5 Missions · {camp.xpTotal} XP</span>
              </div>

              {/* Mission dots */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {camp.missions.map((m, i) => (
                  <div key={m.id} title={m.title} style={{ flex: 1, height: 4, borderRadius: 2, background: isMissionDone(camp.id, m.id) ? camp.color : 'rgba(255,255,255,0.15)', transition: 'background 0.3s' }} />
                ))}
              </div>

              {/* Progress */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{cp.completed.length}/{camp.missions.length} missions complete</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: camp.color }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {showCert && <CertificateModal campaign={showCert} studentName={user.name} onClose={() => setShowCert(null)} />}
    </div>
  );
}
