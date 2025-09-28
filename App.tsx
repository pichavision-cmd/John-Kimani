import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {isLoggedIn ? <Dashboard /> : <LoginScreen onLogin={handleLogin} />}
    </div>
  );
}

export default App;
