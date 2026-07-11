import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserQueueView from './UserQueue';
import '../styles/queue.css'; 

function CartView() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasClickedBuy = location.state?.hasClickedBuy || false;

  if (!hasClickedBuy) {
    return (
      <div className="queue-page-container" style={{ padding: '100px 0' }}>
        <div className="outer-box" style={{ maxWidth: '460px' }}>
          <div className="inner-box" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>🛒❌</div>
            <h2 className="queue-label" style={{ fontSize: '1.6rem', color: '#ffffff' }}>
              Your Cart is Empty
            </h2>
            <p style={{ color: '#98a69d', fontSize: '0.95rem', margin: '15px 0 25px 0', lineHeight: '1.5' }}>
              You haven't selected any tickets yet. Browse our matches schedule to secure a spot.
            </p>
          </div>
          <button className="success-checkout-btn" style={{ margin: 0 }} onClick={() => navigate('/events')}>
            Explore Events
          </button>
        </div>
      </div>
    );
  }
  return <UserQueueView eventData={location.state} />;
}

export default CartView;
