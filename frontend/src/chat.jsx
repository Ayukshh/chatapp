import React, { useState, useEffect, useRef } from 'react';
import './chat.css';

const WS_URL = 'ws://localhost:4000';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    if (!connected && username) {
      setError('');
      ws.current = new window.WebSocket(WS_URL);
      ws.current.onopen = () => setConnected(true);
      ws.current.onerror = () => {
        setError('Could not connect to chat server. Is the backend running?');
        setConnected(false);
      };
      ws.current.onclose = () => {
        setConnected(false);
        setError('Disconnected from chat server.');
      };
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'history') {
            setMessages(data.messages);
          } else if (data.type === 'message') {
            setMessages((prev) => [...prev, data.message]);
          } else if (data.type === 'error') {
            setError(data.error);
          }
        } catch {
          // fallback for plain string messages
          setMessages((prev) => [...prev, { username: 'Server', text: event.data }]);
        }
      };
      return () => ws.current && ws.current.close();
    }
  }, [username]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input && ws.current && connected) {
      ws.current.send(JSON.stringify({ username, text: input }));
      setInput('');
    }
  };

  if (!username) {
    return (
      <form className="username-form" onSubmit={e => { e.preventDefault(); if (input) { setUsername(input); setInput(''); } }}>
        <h2>Enter your username</h2>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && input) {
              setUsername(input);
              setInput('');
            }
          }}
          placeholder="Username"
        />
        <button type="submit" disabled={!input}>Join</button>
        {error && <div className="error-message">{error}</div>}
      </form>
    );
  }

  return (
    <div className="chat-container">
      <h2 className="chat-header">Chat Room</h2>
      <div style={{ marginBottom: 8 }}>
        <span className={connected ? 'status-online' : 'status-offline'}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
        {error && <span className="error-message" style={{ marginLeft: 12 }}>{error}</span>}
      </div>
      <div className="message-list">
        {messages.map((msg, idx) => (
          <div className="message" key={msg._id || idx}>
            <span className="username">{msg.username}:</span> {msg.text}
            {msg.timestamp && (
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        ))}
      </div>
      <form className="chat-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" disabled={!input || !connected}>Send</button>
      </form>
    </div>
  );
}
