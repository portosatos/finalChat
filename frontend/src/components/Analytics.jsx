import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

function Analytics() {
  const path = 'http://192.168.0.105:5000'; // Замените на ваш путь
  const [topUsers, setTopUsers] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [activityType, setActivityType] = useState('daily');

  // Fetch top users
  useEffect(() => {
    async function fetchTopUsers() {
      const response = await fetch(`${path}/analytics/top-users`);
      const data = await response.json();
      setTopUsers(data);
    }
    fetchTopUsers();
  }, [path]);

  // Fetch user activity
  useEffect(() => {
    async function fetchUserActivity() {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${path}/analytics/user-activity?user_id=${userId}&type=${activityType}`);
      const data = await response.json();
      setUserActivity(data);
    }
    fetchUserActivity();
  }, [path, activityType]);

  // Prepare chart data
  const chartData = {
    labels: userActivity.map((entry) => entry.time_group),
    datasets: [
      {
        label: 'Messages',
        data: userActivity.map((entry) => entry.message_count),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <h1>Analytics</h1>

      <div>
        <h2>Top Users</h2>
        <table border="1">
          <thead>
            <tr>
              <th>Username</th>
              <th>Messages</th>
            </tr>
          </thead>
          <tbody>
            {topUsers.map((user) => (
              <tr key={user.username}>
                <td>{user.username}</td>
                <td>{user.message_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2>Your Activity</h2>
        <div>
          <button onClick={() => setActivityType('daily')}>Daily</button>
          <button onClick={() => setActivityType('hourly')}>Hourly</button>
          <button onClick={() => setActivityType('minutely')}>Minutely</button>
        </div>
        <Line data={chartData} />
      </div>
    </div>
  );
}

export default Analytics;
