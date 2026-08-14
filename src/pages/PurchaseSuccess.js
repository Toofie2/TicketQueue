import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/PurchaseSuccess.css';

function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTicket = location.state;

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon-badge">🎉</div>
        <h1>Tickets Secured!</h1>
        
        <div className="success-divider"></div>
        
        {activeTicket && (
          <div className="receipt-summary-box">
            <p><strong>Event:</strong> {activeTicket.eventTitle || "Standard Event Entry Pass"}</p>
            <p><strong>Quantity:</strong> {activeTicket.ticketQuantity || activeTicket.quantity || 1}x Ticket(s)</p>
            <p><strong>Total Paid:</strong> <span className="gold-accent-text">${activeTicket.finalPrice || activeTicket.totalPrice || 0}</span></p>
          </div>
        )}

        <button 
          className="return-dashboard-btn" 
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default SuccessPage;
