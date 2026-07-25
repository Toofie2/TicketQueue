import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/Login.css';

function App() {
  const [username, setUsername] = useState('Guest');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [isInLine, setIsInLine] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [usersAhead, setUsersAhead] = useState(300);
  const [waitTime, setWaitTime] = useState("2 mins");
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const activeToastIdRef = useRef(null);

  const [activeTicket, setActiveTicket] = useState({
    eventTitle: "Standard Event Entry Pass",
    ticketQuantity: 1,
    finalPrice: 0
  });

  useEffect(() => {
    if (!isInLine || isTimeUp) return;

    const totalDurationSeconds = 90;

    const queueIntervalClock = setInterval(() => {
      setSecondsElapsed((prev) => {
        const nextSeconds = prev + 1;
        const progressRatio = nextSeconds / totalDurationSeconds;

        const nextUsers = Math.max(0, Math.floor(300 * (1 - progressRatio)));
        setUsersAhead(nextUsers);

        const remaining = totalDurationSeconds - nextSeconds;

        if (remaining > 60) {
          setWaitTime("2 mins");
        } else if (remaining === 60) {
          setWaitTime("1 min");
        } else if (remaining < 60 && remaining > 0) {
          setWaitTime("< 1 min");
        } else if (remaining <= 0) {
          setIsTimeUp(true);
          setWaitTime("0 mins");
          setUsersAhead(0);

          if (!activeToastIdRef.current) {
            activeToastIdRef.current = toast.success(
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span>🎉 Your turn has arrived for {activeTicket.eventTitle}!</span>
                <button 
                  onClick={() => {
                    toast.dismiss(activeToastIdRef.current);
                    activeToastIdRef.current = null;
                    navigate('/checkout');
                  }} 
                  style={{
                    backgroundColor: '#1b2b36',
                    color: '#c59648',
                    border: '1px solid #c59648',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    width: 'fit-content'
                  }}
                >
                  Go to Checkout 🛒
                </button>
              </div>,
              {
                position: "top-right",
                autoClose: false,
                closeOnClick: false 
              }
            );
          }

          clearInterval(queueIntervalClock);
          return prev;
        }
        return nextSeconds;
      });
    }, 1000);

    return () => clearInterval(queueIntervalClock);
  }, [isInLine, isTimeUp, activeTicket.eventTitle, navigate]);

  // Called after the backend confirms a successful login/registration.
  // The role comes from the backend response, never guessed on the client.
  const handleLogin = (userEmail, userRole = 'user') => {
    const nameFromEmail = userEmail.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    setUsername(formattedName);
    setEmail(userEmail);
    setRole(userRole);
    setIsLoggedIn(true);

    if (userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  // Function to run to fully log the user out
  const handleLogout = () => {
    setUsername(''); // This clears the name
    setEmail('');
    setRole('user');
    setIsLoggedIn(false); // This tells the Navbar to change back
    setIsInLine(false);
    if (activeToastIdRef.current) {
      toast.dismiss(activeToastIdRef.current);
      activeToastIdRef.current = null;
    }
    navigate('/login');
  };

  return (
    <div className="app-container">
      <ToastContainer position="top-right" autoClose={false} />
      {/* Pass onLogout to the Navbar */}
      <Navbar username={username} isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <div className="page-router-content">
        {/* Pass handleLogout down to the Dashboard via context */}
        <Outlet context={{ 
          handleLogin, handleLogout, username, email, role, isLoggedIn,
          isInLine, setIsInLine, isTimeUp, setIsTimeUp, usersAhead, 
          waitTime, activeTicket, setActiveTicket, secondsElapsed, setSecondsElapsed
        }} />
      </div>

    </div>
  );
}

export default App;