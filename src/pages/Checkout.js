import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import '../styles/queue.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Checkout() {
  const { email, userId, activeTicket, setIsInLine, setIsTimeUp } = useOutletContext();
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [expiry, setExpiry] = useState('12/29');
  const [cvv, setCvv] = useState('123');

  const handleFinalPayment = (e) => {
    e.preventDefault();
    const numericUserId = isNaN(Number(userId)) ? 1 : Number(userId);
    const serviceNameString = activeTicket?.eventTitle || "Event Admission Pass";

    fetch(`${API_BASE}/api/queue/success`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: Number(numericUserId),
        serviceName: serviceNameString,
        outcome: "Served"
      })
    })
    .finally(() => {
      localStorage.removeItem("cartItem"); 
      if (setIsInLine) setIsInLine(false);
      if (setIsTimeUp) setIsTimeUp(false);
      navigate('/success', { state: activeTicket });
    });
  };

  const handleAbandonFromCheckout = () => {
    const confirmCancel = window.confirm("Cancel this transaction and abandon your secured tickets?");
    if (!confirmCancel) return;
    const numericUserId = isNaN(Number(userId)) ? 1 : Number(userId);
    fetch(`${API_BASE}/api/queue/success`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: Number(numericUserId),
        serviceName: activeTicket?.eventTitle || "Event Pass",
        outcome: "Left Queue"
      })
    })
    .finally(() => {
      localStorage.removeItem("cartItem"); 
      if (setIsInLine) setIsInLine(false);
      if (setIsTimeUp) setIsTimeUp(false);
      navigate('/dashboard');
    });
  };

  return (
    <div className="queue-page-layout">
      <div className="queue-page-container" style={{ padding: '60px 0' }}>
        <div className="outer-box" style={{ maxWidth: '460px', width: '90%' }}>
          
          <div className="inner-box" style={{ borderBottom: '1px solid rgba(197, 150, 72, 0.2)', paddingBottom: '15px' }}>
            <h2 className="queue-label" style={{ color: '#c59648', margin: 0, fontSize: '1.5rem' }}>Secure Checkout</h2>
          </div>
          
          <div style={{ padding: '20px 20px 10px 20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', color: '#ffffff', fontSize: '0.92rem' }}>
            <div><span style={{ color: '#98a69d' }}>Allocation:</span> {activeTicket.ticketQuantity}x {activeTicket.eventTitle}</div>
            <div style={{ borderBottom: '1px solid #12202a', paddingBottom: '10px' }}><span style={{ color: '#98a69d' }}>Total Value:</span> <strong style={{ color: '#c59648' }}>${activeTicket.finalPrice}</strong></div>
          </div>

          <form onSubmit={handleFinalPayment} style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ color: '#98a69d', fontSize: '0.85rem' }}>Card Number</label>
              <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="auth-input" style={{ marginTop: '5px' }} required />
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="input-group" style={{ margin: 0, flex: 1 }}>
                <label style={{ color: '#98a69d', fontSize: '0.85rem' }}>Expiration</label>
                <input type="text" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="auth-input" style={{ marginTop: '5px' }} placeholder="MM/YY" required />
              </div>
              <div className="input-group" style={{ margin: 0, flex: 1 }}>
                <label style={{ color: '#98a69d', fontSize: '0.85rem' }}>CVV</label>
                <input type="password" value={cvv} onChange={(e) => setCvv(e.target.value)} className="auth-input" style={{ marginTop: '5px' }} placeholder="123" required />
              </div>
            </div>

            <button type="submit" className="success-checkout-btn" style={{ width: '100%', margin: '10px 0 0 0' }}>
              Authorize Payment (${activeTicket.finalPrice})
            </button>
            <button 
              type="button" 
              onClick={handleAbandonFromCheckout}
              style={{
                width: '100%', backgroundColor: 'transparent', border: '1px solid #d8000c',
                color: '#d8000c', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '0.95rem', marginTop: '5px'
              }}
            >
              Abandon Queue
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default Checkout;
