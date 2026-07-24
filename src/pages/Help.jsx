import React from 'react';
import '../styles/queue.css'; // Reuses your main layout tokens

function Help() {
  return (
    <div className="queue-page-container" style={{ padding: '40px 0', minHeight: '85vh' }}>
      
      {/* Header Intro Title */}
      <div className="queue-top-text" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1b2b36', fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>
          Support Center
        </h1>
        <p style={{ color: '#1b2b36', fontWeight: '800', marginTop: '5px', fontSize: '1rem', opacity: 0.8 }}>
          Frequently Asked Questions & Support Information
        </p>
      </div>

      {/* Main Container Card Frame */}
      <div className="outer-box" style={{ maxWidth: '600px', width: '90%' }}>
        
        {/* Help Content Informational Panel */}
        <div className="inner-box" style={{ borderBottom: '1px solid rgba(197, 150, 72, 0.3)', paddingBottom: '20px', textAlign: 'left' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            <div>
              <h4 style={{ color: '#c59648', margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '900' }}>
                Why am I in a queue?
              </h4>
              <p style={{ color: '#98a69d', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                For high-demand events like the World Cup 2026, we use a randomized queue system to manage heavy web traffic fairly and prevent ticket bots from purchasing all allocations instantly.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#c59648', margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '900' }}>
                Will I lose my spot if I refresh the page?
              </h4>
              <p style={{ color: '#98a69d', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                No. Your tracking position is safely attached to your authenticated account ID session. However, we recommend keeping the window open to ensure your browser updates instantly when your turn arrives.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#c59648', margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '900' }}>
                How long do I have to check out when my turn arrives?
              </h4>
              <p style={{ color: '#98a69d', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                Once your countdown hits 0 mins, a golden 'Proceed to Checkout' button appears. You will have exactly 10 minutes to secure your tickets and complete payment before your spot is released.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#c59648', margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '900' }}>
                Can I buy tickets for multiple events at once?
              </h4>
              <p style={{ color: '#98a69d', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                To ensure fair distribution, customers are limited to entering one ticket queue profile at a time per account session.
              </p>
            </div>

          </div>
        </div>

        {/* Contact Support Static Footer Info */}
        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <h4 style={{ color: '#d9d9d9', fontSize: '1rem', margin: '0 0 8px 0', fontWeight: '900' }}>
            Still Need Assistance?
          </h4>
          <p style={{ color: '#98a69d', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
            Please contact our administration desk directly at: <br />
            <strong style={{ color: '#c59648', fontSize: '1.05rem', display: 'inline-block', marginTop: '5px' }}>
              admin@tixq.com
            </strong>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Help;
