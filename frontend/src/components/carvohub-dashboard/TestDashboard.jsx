import React from 'react';
import { Dashboard } from './index';

const TestDashboard = () => {
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <div style={{ height: '100vh' }}>
      <Dashboard user={user} onLogout={handleLogout} />
    </div>
  );
};

export default TestDashboard;