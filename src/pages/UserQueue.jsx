import { useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Queue from '../components/Queue';
import { notifyReadyForCheckout } from '../api/notificationsApi';

function UserQueue() {
    const navigate = useNavigate();
    const { 
        username, email, isLoggedIn, isInLine, setIsInLine, isTimeUp, setIsTimeUp,
        usersAhead, waitTime, activeTicket
    } = useOutletContext(); 

    const userIdentifier = email || "harpreet@test.com";
    const wasInQueueRef = useRef(false);
    const leftRef = useRef(false);
    const servedRef = useRef(false);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        if (!isInLine) return;
        let active = true;
        const checkStatus = () => {
            fetch(`http://localhost:4000/api/queue/status/${encodeURIComponent(userIdentifier)}`)
                .then((res) => {
                    if (!active) return;
                    if (res.status === 404) {
                        if (wasInQueueRef.current && !leftRef.current && !servedRef.current) {
                            servedRef.current = true;
                            setIsTimeUp(true);
                            notifyReadyForCheckout({
                                userId: userIdentifier,
                                serviceId: activeTicket?.eventId,
                            }).catch(() => {});
                        }
                        return;
                    }
                    wasInQueueRef.current = true;
                })
                .catch(() => {});
        };
        checkStatus();
        const timer = setInterval(checkStatus, 3000);
        return () => {
            active = false;
            clearInterval(timer);
        };
    }, [isInLine, userIdentifier, setIsTimeUp, activeTicket]);

    const handleLeaveLine = () => {
        leftRef.current = true;
        toast.dismiss();
        fetch('http://localhost:4000/api/queue/success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: userIdentifier,
                eventTitle: activeTicket.eventTitle,
                ticketQuantity: activeTicket.ticketQuantity,
                outcome: "Left Queue" 
            })
        })
        .then(() => {
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
