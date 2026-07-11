import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { isAdminEmail } from '../data/adminMockData';
import '../styles/Login.css';

function Login({ switchView, onLoginSuccess }) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [forgotStage, setForgotStage] = useState(0); 
  const [validationCode, setValidationCode] = useState('');
  const navigate = useNavigate();
  const { setUsername, setIsLoggedIn } = useOutletContext(); 

  const handleLogin = (e) => {
    e.preventDefault(); 
    setError(''); setErrorField('');

    if (isAdminEmail(email)) {
      navigate('/admin');
      return;
    }

    const nameString = email ? email.split('@')[0] : "DemoUser";
    const formattedName = nameString.charAt(0).toUpperCase() + nameString.slice(1);
    if (typeof setUsername === 'function') setUsername(formattedName);
    if (typeof setIsLoggedIn === 'function') setIsLoggedIn(true);
    navigate('/dashboard');
  };

  const handleSendCode = (e) => {
    e.preventDefault();
    setError(''); setErrorField('');
    
    // 🌟 Uses emailRegex safely now that it is declared above
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
      setErrorField('password'); return setError('Error: Invalid password requirements.');
    }
    alert('Password Reset Successful! You can now log in.');
    setForgotStage(0);
    setPassword('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {forgotStage > 0 ? (
          <>
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
          </>
        ) : (
          <>
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
            <button className="sso-button" type="button" onClick={() => alert('OAuth logic here')}>Sign in with Google</button>
            <button onClick={() => navigate('/register')} style={{ marginTop: '25px', background: 'none', border: 'none', color: '#D4A373', cursor: 'pointer', width: '100%', textDecoration: 'underline', fontWeight: 'bold' }}>
              Don't have an account? Register here
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
