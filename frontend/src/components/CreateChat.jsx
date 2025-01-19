import React, { useState, useEffect } from 'react';

function CreateChat({ onClose, onChatCreated }) {
  const [chatName, setChatName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const path = 'http://192.168.0.105:5000';

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const response = await fetch(`${path}/users`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleCreateChat = async () => {
    if (!chatName.trim()) {
      alert('Please enter a chat name.');
      return;
    }
    if (selectedUserIds.length === 0) {
      alert('Please select at least one user.');
      return;
    }

    try {
      const response = await fetch(`${path}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_name: chatName,
          user_ids: selectedUserIds,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Chat created successfully.');
        onChatCreated();
        onClose();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create chat.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="create-chat-modal">
      <h2>Create Chat</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateChat();
        }}
      >
        <input
          type="text"
          placeholder="Enter chat name"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          required
        />
        <h3>Select Users:</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <label>
                <input
                  type="checkbox"
                  value={user.id}
                  onChange={() => handleCheckboxChange(user.id)}
                />
                {user.username}
              </label>
            </li>
          ))}
        </ul>
        <button type="submit">Create Chat</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default CreateChat;
