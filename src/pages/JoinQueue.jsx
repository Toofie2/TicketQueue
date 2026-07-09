import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.js';
import '../styles/Navbar.css';
import '../styles/queue.css'; 

function JoinQueue() {
    const navigate = useNavigate();
    const isLoggedIn = true; 
    
    const handleJoinQueue = (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            alert("Redirecting you to the registration portal.");
            navigate('/register');
            return;
        }
        console.log("Fetching queue position using authenticated user token...");
        navigate('/queue');
    };

    return (
        <div className="queue-page-layout">
            <Navbar />
            <div className="queue-page-container" style={{ padding: '80px 0' }}>
                
                <div className="outer-box" style={{ maxWidth: '440px' }}>
                    <div className="inner-box" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                        <h2 className="queue-label" style={{ fontSize: '1.5rem' }}>
                            {isLoggedIn ? "Hello User2174! Ready to join the line?" : "The line is waiting for you, but you need to create an account to secure your tickets."}
                        </h2>
                    </div>

                    <form onSubmit={handleJoinQueue} style={{ display: 'flex', flexDirection: 'column' }}>
                        <button type="submit" className="success-checkout-btn" style={{ margin: 0 }}>
                            {isLoggedIn ? "Enter Queue" : "Register to Join Queue"}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}

export default JoinQueue;
