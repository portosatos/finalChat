import React, { useState, useEffect } from 'react';

function CreateChatModal({ onClose }) {
  const path = 'http://192.168.0.105:5000';
  const [chatName, setChatName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch(`${path}/users`);
      const data = await response.json();
      setUsers(data);
    }
    fetchUsers();
  }, [path]);

  const createChat = async () => {
    if (!chatName.trim()) {
      alert('Chat name is required');
      return;
    }

    const response = await fetch(`${path}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_name: chatName, user_ids: selectedUserIds }),
    });
    const data = await response.json();
    if (data.success) {
      alert('Chat created successfully');
      onClose();
    } else {
      alert(data.message);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
      <div style={{ background: '#fff', margin: '100px auto', padding: '20px', width: '400px', borderRadius: '8px' }}>
        <h3>Create Chat</h3>
        <input
          type="text"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          placeholder="Enter chat name"
          style={{ marginBottom: '10px', width: '100%' }}
        />
        <div>
          <h4>Select Users:</h4>
          {users.map((user) => (
            <label key={user.id} style={{ display: 'block' }}>
              <input
                type="checkbox"
                value={user.id}
                onChange={() => toggleUserSelection(user.id)}
              />
              {user.username}
            </label>
          ))}
        </div>
        <button onClick={createChat} style={{ marginRight: '10px' }}>
          Create
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default CreateChatModal;
