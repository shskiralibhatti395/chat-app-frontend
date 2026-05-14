import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://chat-app-backend-1z4d.onrender.com');
const BACKEND = 'https://chat-app-backend-1z4d.onrender.com';

export default function App() {
  const [page,     setPage]     = useState('login');
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [user,     setUser]     = useState(null);
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState('');
  const [error,    setError]    = useState('');
  const [menuId,   setMenuId]   = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch(`${BACKEND}/messages`)
      .then(res => res.json())
      .then(data => setMessages(data));

    socket.on('message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('messageDeleted', (id) => {
      setMessages(prev => prev.filter(msg => msg._id !== id));
    });

    return () => {
      socket.off('message');
      socket.off('messageDeleted');
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleRegister() {
    const res  = await fetch(`${BACKEND}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.error) return setError(data.error);
    setPage('login');
    setError('✅ Account ban gaya! Ab login karo.');
  }

  async function handleLogin() {
    const res  = await fetch(`${BACKEND}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.error) return setError(data.error);
    setUser(data.name);
    setError('');
  }

  function handleSend() {
    if (!text.trim()) return;
    socket.emit('message', { name: user, text });
    setText('');
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSend();
  }

  async function handleDeleteMe(id) {
    setMenuId(null);
    setMessages(prev => prev.filter(msg => msg._id !== id));
    await fetch(`${BACKEND}/messages/${id}`, { method: 'DELETE' });
  }

  async function handleDeleteEveryone(id) {
    setMenuId(null);
    await fetch(`${BACKEND}/messages/${id}`, { method: 'DELETE' });
  }

  if (!user) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: 'white', borderRadius: '20px',
        padding: '40px', width: '380px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>💬</div>
          <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>ChatApp</h1>
          <p style={{ color: '#888', margin: '5px 0 0' }}>
            {page === 'login' ? 'Apne account mein login karo' : 'Naya account banao'}
          </p>
        </div>

        {error && (
          <div style={{
            background: error.includes('✅') ? '#e8f5e9' : '#ffebee',
            color: error.includes('✅') ? '#2e7d32' : '#c62828',
            padding: '10px 15px', borderRadius: '10px',
            marginBottom: '15px', fontSize: '14px',
          }}>{error}</div>
        )}

        {page === 'register' && (
          <input placeholder="Naam" value={name}
            onChange={(e) => setName(e.target.value)} style={inputStyle} />
        )}
        <input placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <input placeholder="Password" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

        <button onClick={page === 'login' ? handleLogin : handleRegister} style={btnStyle}>
          {page === 'login' ? 'Login Karo' : 'Register Karo'}
        </button>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', marginTop: '20px' }}>
          {page === 'login' ? 'Account nahi hai? ' : 'Pehle se account hai? '}
          <span onClick={() => { setPage(page === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ color: '#667eea', cursor: 'pointer', fontWeight: '600' }}>
            {page === 'login' ? 'Register karo' : 'Login karo'}
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <div onClick={() => setMenuId(null)} style={{
      minHeight: '100vh', background: '#f0f2f5',
      fontFamily: "'Segoe UI', sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '15px 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'rgba(255,255,255,0.3)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          }}>💬</div>
          <div>
            <div style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>ChatApp</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>● Online</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'white', fontSize: '14px' }}>👤 {user}</span>
          <button onClick={() => setUser(null)} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
            padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px',
          }}>Logout</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        maxWidth: '800px', width: '100%', margin: '0 auto',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#aaa', marginTop: '50px' }}>
            <div style={{ fontSize: '50px' }}>💬</div>
            <p>Koi message nahi — pehla message bhejo!</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.name === user;
          return (
            <div key={index} style={{
              display: 'flex',
              justifyContent: isMe ? 'flex-end' : 'flex-start',
            }}>
              <div style={{ position: 'relative' }}>
                {/* Message bubble */}
                <div
                  onContextMenu={(e) => { e.preventDefault(); if (isMe) setMenuId(msg._id); }}
                  style={{
                    maxWidth: '400px',
                    background: isMe ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
                    color: isMe ? 'white' : '#333',
                    padding: '10px 15px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    cursor: isMe ? 'pointer' : 'default',
                  }}>
                  {!isMe && (
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#667eea', marginBottom: '4px' }}>
                      {msg.name}
                    </div>
                  )}
                  <div style={{ fontSize: '15px' }}>{msg.text}</div>
                </div>

                {/* Delete menu */}
                {isMe && menuId === msg._id && (
                  <div onClick={(e) => e.stopPropagation()} style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    zIndex: 100,
                    minWidth: '180px',
                    marginBottom: '5px',
                  }}>
                    <div onClick={() => handleDeleteMe(msg._id)} style={{
                      padding: '12px 16px', cursor: 'pointer', fontSize: '14px',
                      color: '#333', borderBottom: '1px solid #f0f0f0',
                    }}
                      onMouseEnter={e => e.target.style.background = '#f5f5f5'}
                      onMouseLeave={e => e.target.style.background = 'white'}
                    >
                      🙈 Delete for me
                    </div>
                    <div onClick={() => handleDeleteEveryone(msg._id)} style={{
                      padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: '#e53935',
                    }}
                      onMouseEnter={e => e.target.style.background = '#ffebee'}
                      onMouseLeave={e => e.target.style.background = 'white'}
                    >
                      🗑️ Delete for everyone
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        background: 'white', padding: '15px 20px',
        display: 'flex', gap: '10px',
        maxWidth: '800px', width: '100%',
        margin: '0 auto', boxSizing: 'border-box',
      }}>
        <input
          placeholder="Message likho..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          style={{
            flex: 1, padding: '12px 18px',
            borderRadius: '25px', border: '1.5px solid #e0e0e0',
            fontSize: '15px', outline: 'none',
          }}
        />
        <button onClick={handleSend} style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white', border: 'none',
          padding: '12px 25px', borderRadius: '25px',
          cursor: 'pointer', fontSize: '15px', fontWeight: '600',
        }}>Send 🚀</button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 15px',
  borderRadius: '10px', border: '1.5px solid #e0e0e0',
  fontSize: '15px', marginBottom: '12px',
  outline: 'none', boxSizing: 'border-box',
};

const btnStyle = {
  width: '100%', padding: '13px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white', border: 'none',
  borderRadius: '10px', fontSize: '16px',
  fontWeight: '600', cursor: 'pointer',
};