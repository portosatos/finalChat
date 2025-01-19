import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Welcome to Chat App</h1>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => navigate('/register')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Register
        </button>
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default HomePage;
