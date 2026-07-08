import '../styles/Queue.css';

function Queue({ positionNumber, waitTime, isTimeUp, onCheckout }) {
    return (
        <div className="queue-page-container">
            <div className="queue-top-text">
                <h2>🏆 Good news! You are now in line. 🏆</h2>
            </div>
            
            <div className="outer-box">
                <div className="inner-box">
                    <h1 className="queue-label">Your spot in line:</h1>
                    <h1 className="queue-position-number">#{positionNumber}</h1>
                    <h1 className="queue-subtitle">World Cup 2026: General Admission</h1>
                </div>
                
                <div className="wait-time-box">
                    <h3>Your estimated wait time: 
                        <span className="wait-time-minutes"> 
                            {waitTime > 0 ? `${waitTime} mins` : "0 mins!"}
                        </span>
                    </h3>
                </div>
                {isTimeUp && (
                    <button className="success-checkout-btn" onClick={onCheckout}>
                        Proceed to Checkout
                    </button>
                )}
            </div>
            
            <main className="content-spacer"></main>
            <div className="graphic-backdrop"></div>
        </div>
    );
}

export default Queue;
