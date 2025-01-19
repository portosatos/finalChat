import React, { useState, useEffect } from 'react';

function ChatWindow({ chatId }) {
  const path = 'http://192.168.0.105:5000';
  const userId = localStorage.getItem('userId');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    async function fetchMessages() {
      const response = await fetch(`${path}/chats/${chatId}/messages?user_id=${userId}`);
      const data = await response.json();
      setMessages(data);
    }
    fetchMessages();
  }, [chatId, path, userId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const response = await fetch(`${path}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, content: newMessage }),
    });
    const data = await response.json();
    if (data.success) {
      setMessages([...messages, { content: newMessage, username: 'You', avatar_url: '', timestamp: new Date() }]);
      setNewMessage('');
    }
  };

  return (
    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <img
              src={msg.avatar_url || 'default-avatar.png'}
              alt="avatar"
              style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
            />
            <div>
              <strong>{msg.username}</strong>: {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flexGrow: 1, padding: '10px' }}
        />
        <button onClick={sendMessage} style={{ padding: '10px' }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
