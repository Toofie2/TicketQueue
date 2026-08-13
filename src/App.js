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
  const [userId, setUserId] = useState(null);
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
    if (!isInLine || isTimeUp || !userId) return;

    const userIdentifier = userId;

    const syncDatabaseQueueState = () => {
      fetch(`http://localhost:4000/api/queue/status/${userIdentifier}`)
        .then((res) => {
          if (res.status === 404) {
            setIsTimeUp(true);
            setUsersAhead(0);
            setWaitTime("0 mins");
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (!data) return;

          setUsersAhead(data.positionAhead);

          if (data.positionAhead <= 0 && data.waitTime === 0) {

            setIsTimeUp(true);
            setWaitTime("0 mins");

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
                      backgroundColor: '#1b2b36', color: '#c59648', border: '1px solid #c59648',
                      padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                      fontSize: '0.85rem', fontWeight: 'bold', width: 'fit-content'
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
          } else if (data.positionAhead === 1 && data.waitTime === 1) {
            setWaitTime("Waiting for previous customer to pay...");
          } else {
            setWaitTime(data.positionAhead === 1 ? "< 1 min" : `${data.waitTime} mins`);
          }
        })
        .catch((err) => console.log("Database transaction polling connection inactive.", err));
    };
    syncDatabaseQueueState();
    const pollingInterval = setInterval(syncDatabaseQueueState, 3000);

    return () => {
      clearInterval(pollingInterval);
      if (activeToastIdRef.current) {
        toast.dismiss(activeToastIdRef.current);
        activeToastIdRef.current = null;
      }
    };
  }, [isInLine, isTimeUp, userId, activeTicket.eventTitle, navigate]);

  // Called after the backend confirms a successful login/registration.
  // The role comes from the backend response, never guessed on the client.
  const handleLogin = (userEmail, userRole = 'user', userToken, loggedInUserId) => {
    const nameFromEmail = userEmail.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    if (userToken) {
      localStorage.setItem('token', userToken);
    }
    setUsername(formattedName);
    setEmail(userEmail);
    setRole(userRole);
    setUserId(loggedInUserId);
    setIsLoggedIn(true);

    if (userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  // Function to run to fully log the user out
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsername(''); // This clears the name
    setEmail('');
    setRole('user');
    setUserId(null);
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
          handleLogin, handleLogout, username, email, role, userId, isLoggedIn,
          isInLine, setIsInLine, isTimeUp, setIsTimeUp, usersAhead, 
          waitTime, activeTicket, setActiveTicket, secondsElapsed, setSecondsElapsed
        }} />
      </div>

    </div>
  );
}

export default App;
