import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://chat-app-backend-lz4d.onrender.com');

export default function App() {

  const [page,     setPage]     = useState('login');
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [user,     setUser]     = useState(null);
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState('');
  const [error,    setError]    = useState('');

  useEffect(() => {
    fetch('https://chat-app-backend-lz4d.onrender.com/messages')
      .then(res => res.json())
      .then(data => setMessages(data));

    socket.on('message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => socket.off('message');
  }, []);

  async function handleRegister() {
    const res  = await fetch('https://chat-app-backend-lz4d.onrender.com/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.error) return setError(data.error);
    setPage('login');
    setError('Account ban gaya! Ab login karo.');
  }

  async function handleLogin() {
    const res  = await fetch('https://chat-app-backend-lz4d.onrender.com/login', {
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
    if (!text) return;
    socket.emit('message', { name: user, text });
    setText('');
  }

  if (!user) return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <h2>{page === 'login' ? 'Login' : 'Register'}</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {page === 'register' && (
        <input
          placeholder="Naam"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
      )}
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
      />

      {page === 'login' ? (
        <>
          <button onClick={handleLogin} style={{ padding: '8px 20px', marginRight: '10px' }}>
            Login
          </button>
          <button onClick={() => setPage('register')}>
            Register karo
          </button>
        </>
      ) : (
        <>
          <button onClick={handleRegister} style={{ padding: '8px 20px', marginRight: '10px' }}>
            Register
          </button>
          <button onClick={() => setPage('login')}>
            Login karo
          </button>
        </>
      )}
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>💬 Chat App</h2>
      <p>Welcome, <strong>{user}</strong>!
        <button onClick={() => setUser(null)} style={{ marginLeft: '10px' }}>
          Logout
        </button>
      </p>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px', marginBottom: '20px', minHeight: '300px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{msg.name}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <input
        placeholder="Message likho..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
      />
      <button onClick={handleSend} style={{ padding: '8px 20px' }}>
        Send 🚀
      </button>
    </div>
  );
}