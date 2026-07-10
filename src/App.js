import React, { useState } from 'react';
import Login from './pages/Login';
import History from './pages/History';
import './styles/Login.css';

function App() {
  const [currentView, setCurrentView] = useState('login'); 
  const [username, setUsername] = useState(''); 

  const isLoggedIn = currentView === 'dashboard' || currentView === 'history';

  // Function to run when login is successful
  const handleLoginSuccess = (email) => {
    
    const nameFromEmail = email.split('@')[0];
    
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    
    setUsername(formattedName);
    setCurrentView('dashboard'); 
  };

  return (
    <div className="app-container">
      
      {/* Top Smart Navigation Header */}
      <header className="header-bar">
        <div className="header-left">
          <span>🇺🇸 US</span>
        </div>
        
        <div className="header-center">
          <h1 className="header-logo" onClick={() => setCurrentView(isLoggedIn ? 'dashboard' : 'login')}>
            Tix<span>Q</span>
          </h1>
        </div>

        <div className="header-right">
          <span className="nav-link">Home</span>
          <span className="nav-link">Events</span>
          <span className="nav-link">Help</span>
          <span className="nav-link">My Cart</span>
          <span className="nav-divider">|</span>
          
          {isLoggedIn ? (
            <span className="nav-link" onClick={() => setCurrentView('dashboard')}>
              Hello {username}!
              <div className="user-avatar">👤</div>
            </span>
          ) : (
            <span className="nav-link" onClick={() => setCurrentView('login')}>
              Sign in/Register
              <div className="user-avatar" style={{ backgroundColor: '#444' }}>👤</div>
            </span>
          )}
        </div>
      </header>
      
      {/* Page Routing */}
      {currentView === 'login' && <div className="auth-wrapper"><Login switchView={() => setCurrentView('register')} onLoginSuccess={handleLoginSuccess} /></div>}
      {currentView === 'register' && <div className="auth-wrapper"><Register switchView={() => setCurrentView('login')} /></div>}
      
      {/* Pass the username down to the Dashboard so it can say "Welcome back, {username}!" */}
      {currentView === 'dashboard' && <Dashboard switchView={setCurrentView} username={username} />}
      {currentView === 'history' && <History switchView={setCurrentView} />}
    </div>
  );
}

export default App;
