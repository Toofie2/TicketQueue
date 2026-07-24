import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import './styles/Login.css';

function App() {
  const [username, setUsername] = useState('Guest');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Called after the backend confirms a successful login/registration.
  // The role comes from the backend response, never guessed on the client.
  const handleLogin = (userEmail, userRole = 'user') => {
    const nameFromEmail = userEmail.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    setUsername(formattedName);
    setEmail(userEmail);
    setRole(userRole);
    setIsLoggedIn(true);

    if (userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  // Function to run to fully log the user out
  const handleLogout = () => {
    setUsername(''); // This clears the name
    setEmail('');
    setRole('user');
    setIsLoggedIn(false); // This tells the Navbar to change back
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Pass onLogout to the Navbar */}
      <Navbar username={username} isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <div className="page-router-content">
        {/* Pass handleLogout down to the Dashboard via context */}
        <Outlet context={{ handleLogin, handleLogout, username, email, role, isLoggedIn }} />
      </div>

    </div>
  );
}

export default App;
