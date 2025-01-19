import React, { useState, useEffect } from 'react';

function Profile() {
  const path = 'http://192.168.0.105:5000';
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    async function fetchProfile() {
      const response = await fetch(`${path}/profile/${userId}`);
      const data = await response.json();
      setUsername(data.username);
      setAvatarUrl(data.avatar_url);
    }
    fetchProfile();
  }, [path, userId]);

  const updateProfile = async () => {
    const response = await fetch(`${path}/profile/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, username, avatar_url: avatarUrl }),
    });
    const data = await response.json();
    if (data.success) alert('Profile updated successfully!');
    else alert(data.message);
  };

  return (
    <div>
      <h1>Profile</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="text"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        placeholder="Avatar URL"
      />
      <button onClick={updateProfile}>Update Profile</button>
    </div>
  );
}

export default Profile;
