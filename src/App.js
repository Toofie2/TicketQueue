import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; 
import Navbar from './components/Navbar'; 
import './styles/Login.css';

function App() {
  const [username, setUsername] = useState('Guest');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="app-container">
      <Navbar username={username} isLoggedIn={isLoggedIn} />
      
      <div className="page-router-content">
        <Outlet context={{ username, setUsername, isLoggedIn, setIsLoggedIn }} />
      </div>
      
    </div>
  );
}

export default App;
