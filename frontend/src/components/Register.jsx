import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const path = 'http://192.168.0.105:5000';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await fetch(`${path}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('userId', data.userId);
        navigate('/chats');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Error registering. Please try again.');
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
      <button onClick={() => navigate('/login')}>Login</button>
    </div>
  );
}

export default Register;
