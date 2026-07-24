import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Queue from '../components/Queue';  

function UserQueue() {
    const { username } = useOutletContext(); 
    const [currentUser] = useState({
        id: "USR-2026-X99B",
        name: username || "Guest Customer",
        totalQueueCap: 1500
    });

    const [usersAhead, setUsersAhead] = useState(1245);
    const [waitTime, setWaitTime] = useState(1);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isInLine, setIsInLine] = useState(true);
    const navigate = useNavigate();

    let titleText = `🏆 Good news, ${currentUser.name}! You are now in line. 🏆`;
    if (!isInLine) {
        titleText = "You are currently out of line.";
    } else if (isTimeUp) {
        titleText = `🛒 ${currentUser.name}, your turn has arrived!`;
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
            <Queue 
                currentUser={currentUser}
                usersAhead={usersAhead} 
                waitTime={waitTime} 
                isTimeUp={isTimeUp} 
                isInLine={isInLine}
                titleText={titleText}
                setIsInLine={setIsInLine}
                onCheckout={() => navigate('/success')}
            />
        </div>
    );
}

export default UserQueue;
