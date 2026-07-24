import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { logHistoryEvent } from '../api/historyApi';
import '../styles/queue.css';

// Kept in sync with the event name shown on the queue screen (components/Queue.jsx)
// until the queue flow is wired to a specific event.
const QUEUE_EVENT_NAME = 'World Cup 2026: General Admission';

function JoinQueue() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, email } = useOutletContext();

    const handleJoinQueue = (e) => {
        e.preventDefault();

        if (!isLoggedIn) {
            alert("Account required! Redirecting you to the login page.");
            navigate('/login');
            return;
        }

        // History Module: log that this user joined the queue.
        logHistoryEvent({ email, event: QUEUE_EVENT_NAME, outcome: 'Joined Queue' }).catch(() => {});

        navigate('/queue', {
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
                            {isLoggedIn ? "Enter Queue with My Account" : "Log In to Join Queue"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default JoinQueue;