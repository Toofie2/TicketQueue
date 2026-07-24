import { useOutletContext } from 'react-router-dom';
import { logHistoryEvent } from '../api/historyApi';
import '../styles/queue.css';

// Kept in sync with the event name logged when joining (pages/JoinQueue.jsx)
// until the queue flow is wired to a specific event.
const QUEUE_EVENT_NAME = 'World Cup 2026: General Admission';

function Queue({ currentUser, usersAhead, waitTime, isTimeUp, isInLine, titleText, setIsInLine, onCheckout }) {
    const { email } = useOutletContext();

    const totalCap = currentUser?.totalQueueCap || 1500;
    const peopleServed = totalCap - usersAhead;
    const progressPercent = Math.min(Math.floor((peopleServed / totalCap) * 100), 100);

    const handleLeaveQueue = () => {
        const confirmLeave = window.confirm("Are you sure you want to leave the queue? You will lose your spot!");
        if (confirmLeave) {
            // History Module: log that this user left the queue.
            logHistoryEvent({ email, event: QUEUE_EVENT_NAME, outcome: 'Left Queue' }).catch(() => {});
            setIsInLine(false);
        }
    };

    const handleCheckout = () => {
        // History Module: log that this user was served.
        logHistoryEvent({ email, event: QUEUE_EVENT_NAME, outcome: 'Served' }).catch(() => {});
        onCheckout();
    };

    return (
        <div className="queue-page-container">
            <div className="queue-top-text">
                <h2>{titleText}</h2>
                {isInLine && <p className="user-id-tag">Account ID: {currentUser.id}</p>}
            </div>
            
            <div className="outer-box">
                {isInLine ? (
                    <>
                        <div className="inner-box">
                            <h1 className="queue-label">People ahead of you:</h1>
                            <h1 className="queue-position-number">#{usersAhead}</h1>
                            <div className="progress-bar-container">
                                <div 
                                    className="progress-bar-fill" 
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <p className="progress-text">{progressPercent}% of the line processed</p>

                            <h1 className="queue-subtitle" style={{ marginTop: '15px' }}>
                                World Cup 2026: General Admission
                            </h1>
                        </div>
                        
                        <div className="wait-time-box">
                            <h3>Your estimated wait time: 
                                <span className="wait-time-minutes"> 
                                    {waitTime > 0 ? `${waitTime} mins` : "0 mins!"}
                                </span>
                            </h3>
                        </div>

                        {isTimeUp ? (
                            <button className="success-checkout-btn" onClick={handleCheckout}>
                                Proceed to Checkout
                            </button>
                        ) : (
                            <button className="success-checkout-btn" onClick={handleLeaveQueue}>
                                Leave Queue
                            </button>
                        )}
                    </>
                ) : (
                    <div className="left-queue-state" style={{ padding: '20px 0' }}>
                        <h2 className="queue-subtitle" style={{ fontSize: '1.4rem', marginBottom: '25px' }}>
                            You have left the line. Your spot was released.
                        </h2>
                        <button className="success-checkout-btn" style={{ margin: 0 }} onClick={() => setIsInLine(true)}>
                            Re-join Queue
                        </button>
                    </div>
                )}
            </div>
            
            <main className="content-spacer"></main>
            <div className="graphic-backdrop"></div>
        </div>
    );
}

export default Queue;
