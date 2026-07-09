import React, { useState } from 'react';
import '../Styles/Login.css';

function Login({ switchView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault(); 
    if (!email || !password) return setError('Error: Email and Password are required.');
    if (!email.includes('@')) return setError('Error: Please enter a proper email address.');
    if (password.length < 6) return setError('Error: Password must be at least 6 characters.');
    
    setError('');
    alert('Login Successful! (Simulation)');
  };

  return (
    <div className="auth-card">
      <h2 style={{ textAlign: 'center', color: '#0B2046', marginBottom: '20px' }}>Account Login</h2>
      {error && <p className="auth-error">{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
        <label>Email Address</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" />
        
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" />
        
        <button type="submit" className="auth-button">Sign In</button>
      </form>

      <button onClick={switchView} style={{ marginTop: '25px', background: 'none', border: 'none', color: '#F26122', cursor: 'pointer', width: '100%' }}>
        Don't have an account? Register here
      </button>
    </div>
  );
}
export default Login;