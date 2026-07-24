import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Queue from '../components/Queue';  

function UserQueue() {
    const { username } = useOutletContext(); 
    const navigate = useNavigate();
    const location = useLocation(); 

    const ticketInfo = location.state || {
        eventTitle: "Standard Event Entry Pass",
        ticketQuantity: 1,
        finalPrice: 0
    };

    const [currentUser] = useState({
        id: "USR-2026-X99B",
        name: username || "Guest Customer",
        totalQueueCap: 1500
    });

    const [usersAhead, setUsersAhead] = useState(1245);
    const [waitTime, setWaitTime] = useState(1);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isInLine, setIsInLine] = useState(true);

    const handleLeaveLine = () => {
        fetch(`http://localhost:5000/api/queue/leave/USR-2026-X99B`, {
            method: 'DELETE'
        })
        .then(() => {
            setIsInLine(false);
            navigate('/dashboard'); 
        })
        .catch(err => console.log("Backend offline, executing fallback route", err));
    };

    let titleText = `🏆 Good news, ${currentUser.name}! You are in line for ${ticketInfo.ticketQuantity}x ${ticketInfo.eventTitle}. 🏆`;
    if (!isInLine) {
        titleText = "You are currently out of line.";
    } else if (isTimeUp) {
        titleText = `🛒 ${currentUser.name}, your ${ticketInfo.ticketQuantity} tickets for ${ticketInfo.eventTitle} are ready!`;
    }

    useEffect(() => {
        if (!isInLine) return;

        if (waitTime <= 0) {
            setIsTimeUp(true);
            toast.success("🎉 Your turn has arrived! Proceed to checkout.", {
                position: "top-right",
                autoClose: false
            });
            return;
        }

        const timer = setInterval(() => {
            setWaitTime((prevTime) => prevTime - 1);
            setUsersAhead((prevAhead) => {
                const remaining = prevAhead - Math.floor(Math.random() * 50 + 20);
                return remaining > 0 ? remaining : 0;
            });
        }, 60000); 

        return () => clearInterval(timer);
    }, [waitTime, isInLine]);

    return (
        <div className="queue-page-layout">
            <ToastContainer position="top-right" autoClose={false} />
            <style>{`
                .outer-box button, .inner-box button, .queue-page-container button {
                    display: none !important;
                }
            `}</style>
            <Queue 
                currentUser={currentUser}
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
                            onClick={() => navigate('/success', { state: ticketInfo })}
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
