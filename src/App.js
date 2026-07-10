import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; 
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/Login.css';

function App() {
  const [currentView, setCurrentView] = useState('login'); 
  const [username, setUsername] = useState(''); 
  const navigate = useNavigate(); 

  const isLoggedIn = currentView === 'dashboard' || currentView === 'history';

  // Function to run when login is successful
  const handleLoginSuccess = (email) => {
    
    const nameFromEmail = email.split('@')[0];
    
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    
    setUsername(formattedName);
    setCurrentView('dashboard'); 
    navigate('/dashboard'); 
  };

  return (
    <div className="app-container">
      
      {/* Top Navigation Header */}
      <header className="header-bar">
        <div className="header-left">
          <span>🇺🇸 US</span>
        </div>
        
        <div className="header-center">
          <h1 className="header-logo" onClick={() => { setCurrentView(isLoggedIn ? 'dashboard' : 'login'); navigate(isLoggedIn ? '/dashboard' : '/login'); }}>
            Tix<span>Q</span>
          </h1>
        </div>

        <div className="header-right">
          <span className="nav-link" onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}>Home</span>
          <span className="nav-link">Events</span>
          <span className="nav-link">Help</span>
          <span className="nav-link" onClick={() => navigate(isLoggedIn ? '/queue' : '/login')}>My Cart</span> 
          <span className="nav-divider">|</span>
          
          {isLoggedIn ? (
            <span className="nav-link" onClick={() => { setCurrentView('dashboard'); navigate('/dashboard'); }}>
              Hello {username}!
              <div className="user-avatar">👤</div>
            </span>
          ) : (
            <span className="nav-link" onClick={() => { setCurrentView('login'); navigate('/login'); }}>
              Sign in/Register
              <div className="user-avatar" style={{ backgroundColor: '#444' }}>👤</div>
            </span>
          )}
        </div>
      </header>
      
      <div className="page-router-content">
        {window.location.pathname === '/' || window.location.pathname === '/login' ? (
          <div className="auth-wrapper">
            <Login switchView={() => navigate('/register')} onLoginSuccess={handleLoginSuccess} />
          </div>
        ) : window.location.pathname === '/register' ? (
          <div className="auth-wrapper">
            <Register switchView={() => navigate('/login')} />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
      
    </div>
  );
}

export default App;