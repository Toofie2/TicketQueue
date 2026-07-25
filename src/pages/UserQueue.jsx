import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom'; 
import { logHistoryEvent } from '../api/historyApi';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import Queue from '../components/Queue';  

function UserQueue() {
    const navigate = useNavigate();
    const { 
        username, email, isLoggedIn, isInLine, setIsInLine, isTimeUp, setIsTimeUp,
        usersAhead, waitTime, activeTicket
    } = useOutletContext(); 

    const userIdentifier = email || "harpreet@test.com";

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    const handleLeaveLine = () => {
        toast.dismiss();
        // History Module: log that this user left the queue.
        logHistoryEvent({ email: userIdentifier, event: activeTicket.eventTitle, outcome: 'Left Queue' })
            .catch((err) => console.error('Failed to log "Left Queue" history event:', err))
            .finally(() => {
                setIsInLine(false);
                navigate('/dashboard');
            });
    };

    let titleText = `🏆 Good news, ${username}! You are in line for ${activeTicket.ticketQuantity} ${activeTicket.eventTitle} tickets. 🏆`;
    if (!isInLine) {
        titleText = "You are currently out of line.";
    } else if (isTimeUp) {
        titleText = `🛒 ${username}, your ${activeTicket.ticketQuantity} tickets for ${activeTicket.eventTitle} are ready!`;
    }

    return (
        <div className="queue-page-layout">
            <ToastContainer position="top-right" autoClose={false} />
            <style>{`
                .outer-box button, .inner-box button, .queue-page-container button {
                    display: none !important;
                }
            `}</style>
            
            <Queue 
                currentUser={{ id: userIdentifier, name: username, totalQueueCap: 300 }}
                usersAhead={usersAhead} 
                waitTime={waitTime} 
                isTimeUp={isTimeUp} 
                isInLine={isInLine}
                titleText={titleText}
                eventTitle={activeTicket.eventTitle}
                setIsInLine={setIsInLine}
            />
            
            {isInLine && (
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
                    {isTimeUp && (
                        <button 
                            className="success-checkout-btn"
                            style={{ margin: 0, padding: '12px 24px', backgroundColor: '#c59648', width: 'auto' }}
                            onClick={() => {
                                toast.dismiss();
                                setIsTimeUp(false);
                                navigate('/checkout');
                            }} 
                        >
                            Proceed to Checkout 🛒
                        </button>
                    )}
                    
                    <button 
                        className="success-checkout-btn" 
                        style={{ 
                            margin: 0, 
                            padding: '12px 24px', 
                            backgroundColor: 'transparent', 
                            border: '2px solid #d8000c', 
                            color: '#d8000c',
                            width: 'auto'
                        }}
                        onClick={handleLeaveLine} 
                    >
                        Leave Queue / Cancel
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserQueue;
