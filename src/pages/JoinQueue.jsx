import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { notifyQueueJoin } from '../api/notificationsApi';
import '../styles/queue.css';

function JoinQueue() {
    const navigate = useNavigate();
    const location = useLocation();
    const { 
        isLoggedIn, 
        email, 
        username,
        setActiveTicket, 
        setIsTimeUp, 
        setSecondsElapsed, 
        setIsInLine 
    } = useOutletContext();
    
    const [queueSize, setQueueSize] = useState(300); 
    const [estimatedWait, setEstimatedWait] = useState("2 mins"); 
    
    const ticketInfo = location.state || {
        eventTitle: "Standard Event Entry Pass",
        ticketQuantity: 1,
        finalPrice: 0
    };
    
    useEffect(() => {
        fetch(`http://localhost:4000/api/queue/admin/current`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (Array.isArray(data)) {
                    setQueueSize(data.length + 300);
                    setEstimatedWait("2 mins"); 
                }
            })
            .catch(err => console.log("Backend offline, utilizing fallback defaults:", err));
    }, []);
    
    const handleJoinQueue = (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) {
            alert("Account required! Redirecting you to the login page.");
            navigate('/login');
            return;
        }
        
        setActiveTicket(ticketInfo);
        setIsTimeUp(false);
        setSecondsElapsed(0);
        setIsInLine(true);

        if (email && ticketInfo.eventId) {
            notifyQueueJoin({ userId: email, serviceId: ticketInfo.eventId }).catch(() => {});
        }

        fetch('http://localhost:4000/api/queue/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: email || "guest@tixq.com",
                serviceId: ticketInfo.eventTitle,
                priority: "Medium",
                name: username || "Demo User"
            })
        })
        .then((res) => {
            if (!res.ok) throw new Error("Join endpoint status error");
            return res.json();
        })
        .then(() => {
            navigate('/queue', { state: ticketInfo });
        })
        .catch((err) => {
            console.log("Backend offline, launching demo fallback lines:", err);
            navigate('/queue', { state: ticketInfo });
        });
    };

  return (
    <div className="queue-page-layout">
      <div className="queue-page-container" style={{ padding: '60px 0' }}>
        <div className="outer-box" style={{ maxWidth: '460px', width: '90%' }}>
          <div
            className="inner-box"
            style={{
              borderBottom: '1px solid rgba(197, 150, 72, 0.2)',
              paddingBottom: '20px',
            }}
          >
            <h2
              className="queue-label"
              style={{ fontSize: '1.6rem', color: '#c59648', margin: 0 }}
            >
              Ticket Confirmation
            </h2>
          </div>
          <div
            style={{
              padding: '20px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
              }}
            >
              <span style={{ color: '#98a69d' }}>Selected Event:</span>
              <strong
                style={{ color: '#ffffff', textAlign: 'right', maxWidth: '240px' }}
              >
                {ticketInfo.eventTitle}
              </strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
              }}
            >
              <span style={{ color: '#98a69d' }}>Ticket Quantity:</span>
              <strong style={{ color: '#ffffff' }}>
                {ticketInfo.ticketQuantity}x Tickets
              </strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
              }}
            >
              <span style={{ color: '#98a69d' }}>Estimated Total:</span>
              <strong style={{ color: '#c59648', fontSize: '1.1rem' }}>
                ${ticketInfo.finalPrice}
              </strong>
            </div>
          </div>
          <div
            style={{
              padding: '15px 20px',
              margin: '0 20px 20px 20px',
              backgroundColor: '#12202a',
              borderRadius: '12px',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '6px',
                fontSize: '0.88rem',
              }}
            >
              <span style={{ color: '#98a69d' }}>People in Line:</span>
              <span style={{ color: '#ffffff', fontWeight: 'bold' }}>
                {queueSize} users ahead
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.88rem',
              }}
            >
              <span style={{ color: '#98a69d' }}>Expected Wait Time:</span>
              <span style={{ color: '#ffffff', fontWeight: 'bold' }}>
                ~{estimatedWait}
              </span>
            </div>
          </div>
          <form
            onSubmit={handleJoinQueue}
            style={{ display: 'flex', flexDirection: 'column', padding: '0 20px 20px 20px' }}
          >
            <button
              type="submit"
              className="success-checkout-btn"
              style={{ margin: 0, width: '100%' }}
            >
              {isLoggedIn ? 'Secure Position in Line' : 'Log In to Join Queue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JoinQueue;