import React from 'react';
import '../Styles/Dashboard.css';
import { userData } from '../Data/userMockData.js';

function Dashboard({ switchView, username }) {
  return (
    <div className="dashboard-wrapper">
      
      {/* Sleek Profile Banner */}
      <div className="profile-banner">
        <div>
          <h2>Welcome back, <span>{username}!</span></h2>
          
        </div>
        <div className="nav-buttons">
          <button onClick={() => switchView('history')}>View Ticket History</button>
          <button onClick={() => switchView('login')} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid white' }}>Sign Out</button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        
        {/* Left Column: Notifications & Services */}
        <div className="left-column">
          <div className="dash-panel" style={{ marginBottom: '30px' }}>
            <h3>Recent Notifications</h3>
            {userData.notifications.map(note => (
              <div key={note.id} style={{ marginBottom: '15px', color: '#555', fontSize: '14px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                🔔 {note.message}
              </div>
            ))}
          </div>

          <div className="dash-panel">
            <h3>Featured Services</h3>
            {userData.activeServices.map(service => (
              <div key={service.id} className="list-item" style={{ borderLeftColor: '#2A3B4C' }}>
                <div><strong>{service.name}</strong><br/><span style={{ fontSize: '12px', color: '#888' }}>{service.status}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Queues */}
        <div className="right-column">
          <div className="dash-panel">
            <h3>Your Active Queues</h3>
            {userData.activeQueues.map(queue => (
              <div key={queue.id} className="list-item" style={{ padding: '25px 20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#2A3B4C', fontSize: '1.2rem' }}>{queue.event}</h4>
                  <span style={{ color: '#888', fontSize: '14px' }}>Estimated Wait: {queue.waitTime}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Position</div>
                  <div className="queue-highlight">#{queue.position}</div>
                </div>
              </div>
            ))}
            
            {userData.activeQueues.length === 0 && (
              <p style={{ color: '#888', fontStyle: 'italic' }}>You are not currently in any queues.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;