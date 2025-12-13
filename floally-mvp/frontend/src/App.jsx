import React from 'react';
import CalmDashboard from './components/CalmDashboard';

function App() {
  const mockUser = { name: 'Test User', email: 'test@example.com' };
  return <CalmDashboard user={mockUser} />;
}

export default App;
