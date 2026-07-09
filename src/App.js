import React, { useState } from 'react';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    
    // UI Validations Required by the Assignment
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
    
    // If validations pass
    setError('');
    alert(isLogin ? 'Login Successful! (Simulation)' : 'Registration Successful! (Simulation)');
  };

  return (
    <div style={{ fontFamily: 'Arial', display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <div style={{ width: '350px', padding: '30px', border: '1px solid #ccc', borderRadius: '10px', boxShadow: '0px 4px 6px rgba(0,0,0,0.1)' }}>
        
        <h2 style={{ textAlign: 'center' }}>
          {isLogin ? 'QueueSmart Login' : 'QueueSmart Registration'}
        </h2>
        
        {error && <p style={{ color: 'red', fontSize: '14px', fontWeight: 'bold' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>Email (Username):</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{ marginBottom: '15px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          
          <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{ marginBottom: '20px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          
          <button type="submit" style={{ padding: '12px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
            }}
            style={{ background: 'none', border: 'none', color: '#007BFF', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;