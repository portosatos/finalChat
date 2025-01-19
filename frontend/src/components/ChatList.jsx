import React, { useEffect, useState } from 'react';

function ChatList({ onSelectChat }) {
  const path = 'http://192.168.0.105:5000';
  const [chats, setChats] = useState([]);

  useEffect(() => {
    async function fetchChats() {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${path}/user/${userId}/chats`);
      const data = await response.json();
      setChats(data);
    }
    fetchChats();
  }, [path]);

  return (
    <div>
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          style={{
            padding: '10px',
            cursor: 'pointer',
            borderBottom: '1px solid #ccc',
            background: '#2A2F33',
            color: '#fff',
          }}
        >
          {chat.name}
        </div>
      ))}
    </div>
  );
}

export default ChatList;
