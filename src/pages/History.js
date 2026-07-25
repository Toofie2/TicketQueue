import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import '../styles/Dashboard.css';
import { fetchHistory } from '../api/historyApi';

function History() {
  const navigate = useNavigate();
  const { email, isLoggedIn } = useOutletContext();
  const [ticketHistory, setTicketHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (!isLoggedIn || !email) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setError('');

    // History Module: pull this user's queue participation history from the backend.
    fetchHistory(email)
      .then((records) => {
        if (!isCancelled) setTicketHistory(records);
      })
      .catch((err) => {
        if (!isCancelled) setError(err.message);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [email, isLoggedIn]);

  return (
    <div className="dashboard-wrapper">

      <div className="profile-banner">
        <div>
          <h2>Your <span>Ticket History</span></h2>
          <p style={{ margin: 0, color: '#ccc' }}>A record of all your past events and queues.</p>
        </div>
        <div className="nav-buttons">
          <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>

      <div className="dash-panel">
        {!isLoggedIn && <p style={{ color: '#888', fontStyle: 'italic' }}>Please log in to view your history.</p>}
        {isLoggedIn && isLoading && <p style={{ color: '#888', fontStyle: 'italic' }}>Loading history...</p>}
        {isLoggedIn && error && <p style={{ color: '#c0392b' }}>{error}</p>}

        {isLoggedIn && !isLoading && !error && ticketHistory.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              style={{ background: 'none', border: '1px solid #2A3B4C', color: '#2A3B4C', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}
            >
              Date: {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'} ⇅
            </button>
          </div>
        )}

        {isLoggedIn && !isLoading && !error && (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Service / Event Name</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {[...ticketHistory]
                .sort((a, b) =>
                  sortOrder === 'desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
                )
                .map((item) => (
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
              {ticketHistory.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>
                    No history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default History;