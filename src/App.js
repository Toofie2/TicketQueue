import React, { useState } from 'react';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeField, setActiveField] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); 
    
    if (!email || !password) {
      setError('Error: Email and Password are required fields.');
      return;
    }
    if (!email.includes('@')) {
      setError('Error: Please enter a proper email address.');
      return;
    }
    if (password.length < 6) {
      setError('Error: Password must be at least 6 characters long.');
      return;
    }
    
    setError('');
    alert(isLogin ? 'Login Successful! (Simulation)' : 'Registration Successful! (Simulation)');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '80px' }}>
      
      {/* TixQ Logo/Header Area */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#0B2046', fontSize: '3rem', margin: '0' }}>Tix<span style={{ color: '#F26122' }}>Q</span></h1>
        
      </div>

      {/* Main Form Card */}
      <div style={{ width: '350px', backgroundColor: 'white', padding: '40px 30px', borderRadius: '8px', boxShadow: '0px 10px 25px rgba(0,0,0,0.1)', borderTop: '5px solid #0B2046' }}>
        
        <h2 style={{ textAlign: 'center', color: '#0B2046', marginBottom: '20px' }}>
          {isLogin ? 'Account Login' : 'Create Account'}
        </h2>
        
        {error && <p style={{ color: '#D8000C', backgroundColor: '#FFD2D2', padding: '10px', borderRadius: '5px', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '8px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>Email Address</label>
          <input
            type="email"
            value={email}
            onFocus={() => setActiveField('email')}
            onBlur={() => setActiveField('')}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{ 
              marginBottom: '20px', padding: '12px', borderRadius: '5px', 
              border: activeField === 'email' ? '2px solid #F26122' : '1px solid #ccc',
              outline: 'none', transition: 'border 0.3s'
            }}
          />
          
          <label style={{ marginBottom: '8px', color: '#333', fontWeight: 'bold', fontSize: '14px' }}>Password</label>
          <input
            type="password"
            value={password}
            onFocus={() => setActiveField('password')}
            onBlur={() => setActiveField('')}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{ 
              marginBottom: '25px', padding: '12px', borderRadius: '5px', 
              border: activeField === 'password' ? '2px solid #F26122' : '1px solid #ccc',
              outline: 'none', transition: 'border 0.3s'
            }}
          />
          
          <button type="submit" style={{ padding: '14px', backgroundColor: '#0B2046', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'background 0.3s' }}>
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
            }}
            style={{ background: 'none', border: 'none', color: '#F26122', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
          >
            {isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;