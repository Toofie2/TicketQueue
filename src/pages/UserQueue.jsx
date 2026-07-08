import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';
import Queue from '../components/Queue';

function UserQueueView() {
    const positionNumber = 12;
    const [waitTime, setWaitTime] = useState(1);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (waitTime <= 0) {
            setIsTimeUp(true);
            toast.success("🎉 Your turn has arrived! Proceed to checkout.", {
                position: "top-center",
                autoClose: false
            });
            return;
        }

        const timer = setInterval(() => {
            setWaitTime((prevTime) => prevTime - 1);
        }, 60000); 

        return () => clearInterval(timer);
    }, [waitTime]);

    return (
        <div className="queue-page-layout">
            <Navbar />
            <ToastContainer />
            <Queue 
                positionNumber={positionNumber} 
                waitTime={waitTime} 
                isTimeUp={isTimeUp} 
                onCheckout={() => navigate('/success')}
            />
        </div>
    );
}

export default UserQueueView;
