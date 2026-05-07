import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

/* ─── Socratic system prompt ─── */
const buildSystemPrompt = (language, moduleContext, code) => `You are CodeMentor, a Socratic coding tutor for UK primary school children aged 7-11 on the ByteBuddies platform.

STRICT RULES:
1. NEVER give direct answers or write complete working code for the student.
2. Ask ONE guiding question at a time to lead them toward the answer themselves.
3. Use simple, friendly language a child can understand. Avoid jargon.
4. If they are making progress, say "You're getting warm! 🔥" or similar encouragement.
5. Reference their current code to ask questions about it specifically.
6. Always end your response with a question mark OR "Try it! 🚀" to prompt action.
7. After 3 hints on the same problem, give the smallest possible nudge (one line maximum).
8. Use emoji occasionally to stay friendly and engaging.
9. Keep responses SHORT - 3-5 sentences maximum.

Current context:
- Language: ${language}
- Module/Topic: ${moduleContext || 'free coding'}
- Student's current code:
\`\`\`${language}
${code || '(empty)'}
\`\`\`

Remember: Guide, don't give answers. Make them think!`;

/* ─── Fallback mock responses (used if no API key) ─── */
const mockResponses = {
  debug: [
    "Hmm, interesting! What do you think the computer does when it reaches that line? 🤔",
    "Let's look at your loop carefully — what value does `i` start at, and what value should stop the loop?",
    "Before the error happens, what do you think the value of that variable is? Can you add a `print()` to check?",
  ],
  explain: [
    "Good question! Can you tell me what you think a **loop** is used for in real life? 🔄",
    "What do you notice happens each time the loop runs? Try adding a `print()` inside to see!",
    "Think about a recipe — how is that similar to a function? What are the 'ingredients'?",
  ],
  improve: [
    "Your code works! Now, if someone else read it, would they understand it? What could you add to help them?",
    "What would happen if the user typed something unexpected? How could you handle that?",
    "Can you spot any repeated code? What tool do we use to avoid repeating ourselves?",
  ],
  general: [
    "What part of your code are you most unsure about? Let's look at that together! 👀",
    "Have you tried running your code yet? What did you expect to happen?",
    "Great! What do you want your program to do next? Let's think through the steps.",
  ],
};

function getMockResponse(input) {
  const lower = input.toLowerCase();
  if (lower.match(/\b(bug|error|fix|wrong|broken|doesn'?t work|not working)\b/)) {
    return mockResponses.debug[Math.floor(Math.random() * mockResponses.debug.length)];
  }
  if (lower.match(/\b(explain|what is|what does|how does|teach|understand|mean)\b/)) {
    return mockResponses.explain[Math.floor(Math.random() * mockResponses.explain.length)];
  }
  if (lower.match(/\b(improve|better|optimize|suggest|refactor)\b/)) {
    return mockResponses.improve[Math.floor(Math.random() * mockResponses.improve.length)];
  }
  return mockResponses.general[Math.floor(Math.random() * mockResponses.general.length)];
}

/* ─── Groq API call ─── */
async function callClaude(messages, language, moduleContext, code) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      max_tokens: 300,
      messages: [
        { role: 'system', content: buildSystemPrompt(language, moduleContext, code) },
        ...messages.slice(-10).map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.content,
        })),
      ],
    }),
  });

  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

/* ─── Render markdown-ish message content ─── */
function MessageContent({ content }) {
  return (
    <>
      {content.split('\n').map((line, j, arr) => (
        <React.Fragment key={j}>
          {line.startsWith('```') ? (
            <code style={{
              display: 'block',
              background: 'var(--bg-primary)',
              padding: '8px 12px',
              borderRadius: 6,
              margin: '4px 0',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
            }}>
              {line.replace(/```\w*/, '')}
            </code>
          ) : (
            <span dangerouslySetInnerHTML={{
              __html: line
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.+?)`/g, '<code style="background:rgba(99,102,241,0.15);padding:1px 4px;border-radius:3px;font-size:12px">$1</code>')
            }} />
          )}
          {j < arr.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}

export default function AIAssistant({ code, language, moduleContext }) {
  const { user } = useUser();
  const hasApiKey = !!import.meta.env.VITE_GROQ_API_KEY;

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: hasApiKey
        ? `Hi ${user?.name || 'there'}! I'm **CodeMentor** 🤖 — your Socratic coding guide!\n\nI won't just give you answers — I'll ask questions to help YOU figure it out. That's how real programmers learn!\n\nWhat are you working on today?`
        : `Hi! I'm **CodeMentor** 🤖\n\nAsk me anything about your code and I'll guide you with questions!\n\n*(Tip: Add VITE_GROQ_API_KEY for full AI tutoring)*`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (userText) => {
    const msg = (userText || input).trim();
    if (!msg) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      let response;
      if (hasApiKey) {
        response = await callClaude(newMessages, language, moduleContext, code);
      }
      if (!response) {
        // Fallback to mock (also used when API key missing)
        await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
        response = getMockResponse(msg);
      }
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (err) {
      const fallback = getMockResponse(msg);
      setMessages(prev => [...prev, { role: 'ai', content: fallback }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    { label: "🤔 Why doesn't it work?", query: "My code doesn't work. Can you help me think about why?" },
    { label: '💡 What should I try?', query: "I'm stuck. What should I try next?" },
    { label: '🔍 Explain this part', query: "Can you help me understand what this part of my code does?" },
    { label: '✨ How to improve?', query: "What questions should I ask myself to make my code better?" },
  ];

  return (
    <div className="panel" style={{ width: 320, minWidth: 280, display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span>🤖 CodeMentor AI</span>
        <span
          className={`tag ${hasApiKey ? 'tag-success' : 'tag-warning'}`}
          style={{ marginLeft: 'auto', fontSize: 9 }}
        >
          {hasApiKey ? '✨ Claude AI' : 'Basic Mode'}
        </span>
      </div>

      {!hasApiKey && (
        <div style={{ padding: '6px 12px', background: 'rgba(245,158,11,0.1)', borderBottom: '1px solid var(--border-color)', fontSize: 11, color: '#f59e0b' }}>
          Add <code>VITE_GROQ_API_KEY</code> for full Socratic AI tutoring
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 4, borderBottom: '1px solid var(--border-color)' }}>
        {quickActions.map(action => (
          <button
            key={action.label}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: 10, padding: '3px 7px' }}
            onClick={() => handleSend(action.query)}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message chat-message-${msg.role === 'ai' ? 'ai' : 'user'}`}>
            {msg.role === 'ai' && (
              <div className="avatar avatar-sm" style={{ background: 'var(--gradient-success)', fontSize: 12 }}>🤖</div>
            )}
            <div className={`chat-bubble chat-bubble-${msg.role === 'ai' ? 'ai' : 'user'}`}>
              <MessageContent content={msg.content} />
            </div>
            {msg.role === 'user' && (
              <div className="avatar avatar-sm" style={{ fontSize: 12 }}>
                {user?.avatarEmoji || user?.avatar || 'You'}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="chat-message chat-message-ai">
            <div className="avatar avatar-sm" style={{ background: 'var(--gradient-success)', fontSize: 12 }}>🤖</div>
            <div className="chat-bubble chat-bubble-ai">
              <span className="animate-pulse">Thinking... 🤔</span>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <input
          className="input"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button className="btn btn-primary btn-icon" onClick={() => handleSend()} style={{ width: 36, height: 36 }}>
          ↑
        </button>
      </div>
    </div>
  );
}
