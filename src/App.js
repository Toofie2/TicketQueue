import React, { useState } from 'react';
import Login from './Pages/Login';
import Register from './Pages/Register';
import './Styles/Login.css';

function App() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="app-container">
      {/* Top Blue Header */}
      <header className="header-bar">
        <h1 className="header-logo">Tix<span>Q</span></h1>
      </header>
      
      <div className="auth-wrapper">
        {isLoginView ? (
          <Login switchView={() => setIsLoginView(false)} />
        ) : (
          <Register switchView={() => setIsLoginView(true)} />
        )}
      </div>
    </div>
  );
}

export default App;