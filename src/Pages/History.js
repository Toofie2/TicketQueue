import React from 'react';
import '../Styles/Dashboard.css';
import { userData } from '../Data/userMockData.js'; // Importing your new data file!

function History({ switchView }) {
  return (
    <div className="dashboard-wrapper">
      
      <div className="profile-banner">
        <div>
          <h2>Your <span>Ticket History</span></h2>
          <p style={{ margin: 0, color: '#ccc' }}>A record of all your past events and queues.</p>
        </div>
        <div className="nav-buttons">
          <button onClick={() => switchView('dashboard')}>Back to Dashboard</button>
        </div>
      </div>

      <div className="dash-panel">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Service / Event Name</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {userData.ticketHistory.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td><strong>{item.event}</strong></td>
                <td>
                  <span className={`status-badge ${item.outcome === 'Served' ? 'status-served' : 'status-left'}`}>
                    {item.outcome}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}

export default History;