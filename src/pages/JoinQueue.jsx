import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Navbar.css';
import '../styles/queue.css'; 

function JoinQueue() {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = true; 
    
    const handleJoinQueue = (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) {
            alert("Account required! Redirecting you to the registration portal.");
            navigate('/register');
            return;
        }
        navigate('/cart', {
            state: location.state
        });
    };

    return (
        <div className="queue-page-layout">
            <div className="queue-page-container" style={{ padding: '80px 0' }}>
                <div className="outer-box" style={{ maxWidth: '440px' }}>
                    <div className="inner-box" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                        <h2 className="queue-label" style={{ fontSize: '1.5rem' }}>
                            Ready to join the line?
                        </h2>
                    </div>

                    <form onSubmit={handleJoinQueue} style={{ display: 'flex', flexDirection: 'column' }}>
                        <button type="submit" className="success-checkout-btn" style={{ margin: 0 }}>
                            {isLoggedIn ? "Enter Queue with My Account" : "Register to Join Queue"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default JoinQueue;
