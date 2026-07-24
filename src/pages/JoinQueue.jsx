import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { logHistoryEvent } from '../api/historyApi';
import '../styles/queue.css';

// Kept in sync with the event name shown on the queue screen (components/Queue.jsx)
// until the queue flow is wired to a specific event.
const QUEUE_EVENT_NAME = 'World Cup 2026: General Admission';

function JoinQueue() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, email} = useOutletContext();
    const [queueSize, setQueueSize] = useState(1245); 
    const [estimatedWait, setEstimatedWait] = useState(25);
    const ticketInfo = location.state || {
        eventTitle: "Standard Event Entry Pass",
        ticketQuantity: 1,
        finalPrice: 0
    };
    useEffect(() => {
        fetch(`http://localhost:5000/api/queue/admin/current`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (Array.isArray(data)) {
                    setQueueSize(data.length + 1245);
                    setEstimatedWait((data.length + 1) * 15);
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

        // History Module: log that this user joined the queue.
        logHistoryEvent({ email, event: QUEUE_EVENT_NAME, outcome: 'Joined Queue' }).catch((err) =>
            console.error('Failed to log "Joined Queue" history event:', err)
        );

        navigate('/queue', {
            state: ticketInfo
        });
    };

    return (
        <div className="queue-page-layout">
            <div className="queue-page-container" style={{ padding: '60px 0' }}>
                <div className="outer-box" style={{ maxWidth: '460px', width: '90%' }}>
                    
                    <div className="inner-box" style={{ borderBottom: '1px solid rgba(197, 150, 72, 0.2)', paddingBottom: '20px' }}>
                        <h2 className="queue-label" style={{ fontSize: '1.6rem', color: '#c59648', margin: 0 }}>
                            Ticket Confirmation
                        </h2>
                    </div>
                    <div style={{ padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                            <span style={{ color: '#98a69d' }}>Selected Event:</span>
                            <strong style={{ color: '#ffffff', textAlign: 'right', maxWidth: '240px' }}>
                              {ticketInfo.eventTitle}
                            </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                            <span style={{ color: '#98a69d' }}>Ticket Quantity:</span>
                            <strong style={{ color: '#ffffff' }}>{ticketInfo.ticketQuantity}x Tickets</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                            <span style={{ color: '#98a69d' }}>Estimated Total:</span>
                            <strong style={{ color: '#c59648', fontSize: '1.1rem' }}>${ticketInfo.finalPrice}</strong>
                        </div>
                    </div>
                    <div style={{ padding: '15px 20px', margin: '0 20px 20px 20px', backgroundColor: '#12202a', borderRadius: '12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                            <span style={{ color: '#98a69d' }}>People in Line:</span>
                            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{queueSize} users ahead</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                            <span style={{ color: '#98a69d' }}>Expected Wait Time:</span>
                            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>~{estimatedWait} mins</span>
                        </div>
                    </div>
                    <form onSubmit={handleJoinQueue} style={{ display: 'flex', flexDirection: 'column', padding: '0 20px 20px 20px' }}>
                        <button type="submit" className="success-checkout-btn" style={{ margin: 0, width: '100%' }}>
                            {isLoggedIn ? "Secure Position in Line" : "Log In to Join Queue"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default JoinQueue;