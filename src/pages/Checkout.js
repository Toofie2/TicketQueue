import React, { useState } from 'react';
import { logHistoryEvent } from '../api/historyApi';
import { useOutletContext, useNavigate } from 'react-router-dom';
import '../styles/queue.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Checkout() {
  const { email, activeTicket, setIsInLine, setIsTimeUp } = useOutletContext();
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [expiry, setExpiry] = useState('12/29');
  const [cvv, setCvv] = useState('123');

  const handleFinalPayment = (e) => {
    e.preventDefault();
    const userIdentifier = email || "harpreet@test.com";

    fetch(
      `${API_BASE}/api/queue/leave/${encodeURIComponent(userIdentifier)}` +
        (activeTicket?.eventTitle
          ? `?serviceId=${encodeURIComponent(activeTicket.eventTitle)}`
          : ""),
      { method: "DELETE" }
    ).catch(() => {});

    logHistoryEvent({ email: userIdentifier, event: activeTicket.eventTitle, outcome: 'Served' })
      .catch((err) => console.error('Failed to log "Served" history event:', err))
      .finally(() => {
        setIsInLine(false);
        setIsTimeUp(false);
        navigate('/success', { state: activeTicket });
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
          </form>

        </div>
      </div>
    </div>
  );
}

export default Checkout;
