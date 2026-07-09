import React, { useState } from 'react';
import '../Styles/Login.css';

function Login({ switchView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 0: Normal Login, 1: Forgot Password (Email), 2: Enter Validation Code
  const [forgotStage, setForgotStage] = useState(0); 
  const [validationCode, setValidationCode] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleLogin = (e) => {
    e.preventDefault(); 
    setError(''); setErrorField('');

    if (!email) {
      setErrorField('email'); return setError('Error: Email is required.');
    }
    if (!emailRegex.test(email)) {
      setErrorField('email'); return setError('Error: Please enter a valid email address (e.g., name@gmail.com).');
    }
    if (!password) {
      setErrorField('password'); return setError('Error: Password is required.');
    }
    
    alert('Login Successful! (Simulation)');
  };

  const handleSendCode = (e) => {
    e.preventDefault();
    setError(''); setErrorField('');
    if (!emailRegex.test(email)) {
      setErrorField('email'); return setError('Error: Enter a valid email first.');
    }
    setForgotStage(2);
    alert(`Validation code sent to ${email}`);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError(''); setErrorField('');
    if (!validationCode) {
      setErrorField('code'); return setError('Error: Validation code is required.');
    }
    if (!passwordRegex.test(password)) {
      setErrorField('password'); return setError('Error: Password must be at least 8 characters, and include an uppercase letter, lowercase letter, number, and special character.');
    }
    alert('Password Reset Successful! You can now log in.');
    setForgotStage(0);
    setPassword('');
  };

  // --- FORGOT PASSWORD VIEW ---
  if (forgotStage > 0) {
    return (
      <div className="auth-card">
        <h2 style={{ textAlign: 'center', color: '#2A3B4C', marginBottom: '20px' }}>Reset Password</h2>
        {error && <div className="auth-error-text">{error}</div>}
        
        {forgotStage === 1 ? (
          <form onSubmit={handleSendCode}>
            <div className="input-group">
              <label>Enter your Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`auth-input ${errorField === 'email' ? 'input-error' : ''}`} placeholder="name@example.com" />
            </div>
            <button type="submit" className="auth-button">Send Validation Code</button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="input-group">
              <label>Validation Code</label>
              <input type="text" value={validationCode} onChange={(e) => setValidationCode(e.target.value)} className={`auth-input ${errorField === 'code' ? 'input-error' : ''}`} placeholder="Enter 6-digit code" />
            </div>
            <div className="input-group">
              <label>New Password</label>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`auth-input ${errorField === 'password' ? 'input-error' : ''}`} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
            <button type="submit" className="auth-button">Reset Password</button>
          </form>
        )}
        <button onClick={() => setForgotStage(0)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#D4A373', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>Back to Login</button>
      </div>
    );
  }

  // --- NORMAL LOGIN VIEW ---
  return (
    <div className="auth-card">
      <h2 style={{ textAlign: 'center', color: '#2A3B4C', marginBottom: '20px' }}>Account Login</h2>
      {error && <div className="auth-error-text">{error}</div>}
      
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`auth-input ${errorField === 'email' ? 'input-error' : ''}`} placeholder="name@example.com" />
        </div>
        
        <div className="input-group">
          <label>Password</label>
          <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`auth-input ${errorField === 'password' ? 'input-error' : ''}`} />
          <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "HIDE" : "SHOW"}
          </button>
          <div style={{ textAlign: 'right', marginTop: '5px' }}>
            <button type="button" onClick={() => { setForgotStage(1); setError(''); }} style={{ background: 'none', border: 'none', color: '#2A3B4C', cursor: 'pointer', fontSize: '12px' }}>Forgot Password?</button>
          </div>
        </div>
        
        <button type="submit" className="auth-button">Sign In</button>
      </form>

      <div className="sso-divider">or continue with</div>
      <button className="sso-button" type="button" onClick={() => alert('OAuth logic here')}>
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
        Sign in with Google
      </button>
      <button className="sso-button" type="button" onClick={() => alert('OAuth logic here')}>
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.67 2.06-3.11 1.84-2.62 5.76.27 6.84-1.12 2.18-1.55 3.03-2.59 4.11zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000000"/></svg>
        Sign in with Apple
      </button>
      <button className="sso-button" type="button" onClick={() => alert('OAuth logic here')}>
        <svg viewBox="0 0 21 21" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>
        Sign in with Microsoft
      </button>
      
      <button onClick={switchView} style={{ marginTop: '25px', background: 'none', border: 'none', color: '#D4A373', cursor: 'pointer', width: '100%', textDecoration: 'underline', fontWeight: 'bold' }}>
        Don't have an account? Register here
      </button>
    </div>
  );
}

export default Login;