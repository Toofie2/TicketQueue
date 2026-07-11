import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ username, isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  return (
    <header className="header-bar">
      <div className="header-left">
        <span>🇺🇸 US</span>
      </div>
      <div className="header-center">
        <h1 className="header-logo" onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}>
          Tix<span>Q</span>
        </h1>
      </div>

      <div className="header-right">
        <span className="nav-link" onClick={() => navigate('/')}>Home</span>
        <span className="nav-link">Events</span>
        <span className="nav-link">Help</span>
        <span className="nav-link" onClick={() => navigate('/join')}>My Cart</span> 
        <span className="nav-divider">|</span>
        
        {isLoggedIn ? (
          <span className="nav-link" onClick={() => navigate('/dashboard')}>
            Hello {username}!
            <div className="user-avatar">👤</div>
          </span>
        ) : (
          <span className="nav-link" onClick={() => navigate('/login')}>
            Sign in/Register
            <div className="user-avatar" style={{ backgroundColor: '#444' }}>👤</div>
          </span>
        )}
      </div>
    </header>
  );
}

export default Navbar;