import React, { useEffect, useState } from 'react';

function Chat({ chatId }) {
  const path = 'http://192.168.0.105:5000';
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch(`${path}/chats/${chatId}/messages`);
        const data = await response.json();
        console.log('Fetched messages:', data); // Проверяем, что сообщения содержат avatar_url
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
    fetchMessages();
  }, [chatId]);

  const sendMessage = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch(`${path}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage, user_id: userId }),
      });
      const data = await response.json();

      if (data.success) {
        setMessages([
          ...messages,
          { username: 'You', avatar_url: localStorage.getItem('avatarUrl'), content: newMessage },
        ]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat-window" style={{ padding: '10px' }}>
      {messages.map((msg, index) => (
        <div key={index} className="message" style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Подставляем аватарку из avatar_url или используем фолбек */}
            <img
              src={msg.avatar_url || `https://ui-avatars.com/api/?name=${msg.username}`}
              alt="avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'default-avatar.png'; // Фолбек для несуществующих аватарок
              }}
              style={{
                borderRadius: '50%',
                marginRight: '10px',
                width: '40px',
                height: '40px',
              }}
            />
            <strong>{msg.username}</strong>
          </div>
          <div style={{ marginLeft: '50px', color: '#ccc' }}>{msg.content}</div>
        </div>
      ))}
      <div style={{ display: 'flex', marginTop: '20px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flexGrow: 1,
            marginRight: '10px',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '10px 20px',
            background: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
