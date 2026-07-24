import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import './styles/Login.css';

function App() {
  const [username, setUsername] = useState('Guest');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (email) => {
    const nameFromEmail = email.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    setUsername(formattedName);
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  // Function to run to fully log the user out
  const handleLogout = () => {
    setUsername(''); // This clears the name
    setIsLoggedIn(false); // This tells the Navbar to change back
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Pass onLogout to the Navbar */}
      <Navbar username={username} isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <div className="page-router-content">
        {/* Pass handleLogout down to the Dashboard via context */}
        <Outlet context={{ handleLogin, handleLogout, username, isLoggedIn }} />
      </div>

    </div>
  );
}

export default App;