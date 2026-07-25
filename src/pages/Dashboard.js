import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import '../styles/Dashboard.css';
import { userData } from '../data/userMockData.js';
import { fetchHistory } from '../api/historyApi';
import { fetchNotifications } from '../api/notificationsApi';

// A queue is "active" if the most recent history event for that event name
// is a join with no later leave/served event after it.
function deriveActiveQueues(historyRecords) {
  const sorted = [...historyRecords].sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    return dateDiff !== 0 ? dateDiff : b.id - a.id;
  });

  const seenEvents = new Set();
  const active = [];
  sorted.forEach((record) => {
    if (seenEvents.has(record.event)) return;
    seenEvents.add(record.event);
    if (record.outcome === 'Joined Queue') {
      active.push(record);
    }
  });
  return active;
}

function Dashboard() {
  // 1. Grab BOTH username and handleLogout from the router!
  const { username, email, isLoggedIn, handleLogout } = useOutletContext();
  const navigate = useNavigate();

  const [activeQueues, setActiveQueues] = useState([]);
  const [isLoadingQueues, setIsLoadingQueues] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [queuePositions, setQueuePositions] = useState({});

  useEffect(() => {
    if (!isLoggedIn || !email) {
      setNotifications([]);
      return;
    }
    let isCancelled = false;
    const load = () => {
      fetchNotifications(email)
        .then((items) => {
          if (!isCancelled) setNotifications(items);
        })
        .catch(() => {});
    };
    load();
    const timer = setInterval(load, 5000);
    return () => {
      isCancelled = true;
      clearInterval(timer);
    };
  }, [email, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !email) {
      setIsLoadingQueues(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingQueues(true);

    // Derive "currently active" queues from the History Module instead of
    // hardcoded data, since a joined-but-not-yet-left/served event is
    // exactly what "active" means.
    fetchHistory(email)
      .then((records) => {
        if (isCancelled) return;
        const active = deriveActiveQueues(records);
        setActiveQueues(active);
        active.forEach((q) => {
          fetch(
            `/api/queue/status/${encodeURIComponent(email)}?serviceId=${encodeURIComponent(q.event)}`
          )
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (!isCancelled && data) {
                setQueuePositions((prev) => ({
                  ...prev,
                  [q.event]: data.positionAhead,
                }));
              }
            })
            .catch(() => {});
        });
      })
      .catch(() => {
        if (!isCancelled) setActiveQueues([]);
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingQueues(false);
      });


    return () => {
      isCancelled = true;
    };
  }, [email, isLoggedIn]);

  return (
    <div className="dashboard-wrapper">
      
      {/* Sleek Profile Banner */}
      <div className="profile-banner">
        <div>
          {/* 2. Added a fallback here so it never just says "!" */}
          <h2>Welcome back, <span>{username || 'Guest'}!</span></h2>
        </div>
        <div className="nav-buttons">
          <button onClick={() => navigate('/history')}>View Ticket History</button>
          {/* 3. Changed this button to use handleLogout instead of just navigate */}
          <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: 'white', border: '1px solid white' }}>Sign Out</button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        
        {/* Left Column: Notifications & Services */}
        <div className="left-column">
          <div className="dash-panel" style={{ marginBottom: '30px' }}>
            <h3>Recent Notifications</h3>
            {notifications.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic', fontSize: '14px' }}>No notifications yet.</p>
            ) : (
              [...notifications].reverse().slice(0, 3).map(note => {
                const isCheckout = note.type === 'ready-checkout';
                return (
                  <div
                    key={note.id}
                    onClick={
                      isCheckout
                        ? () => {
                            fetch(`/api/events/${note.serviceId}`)
                              .then((res) => (res.ok ? res.json() : null))
                              .then((ev) =>
                                navigate('/queue', {
                                  state: ev ? { event: ev, userId: email } : undefined,
                                })
                              )
                              .catch(() => navigate('/queue'));
                          }
                        : undefined
                    }
                    style={{ marginBottom: '15px', color: '#555', fontSize: '14px', paddingBottom: '10px', borderBottom: '1px solid #eee', cursor: isCheckout ? 'pointer' : 'default' }}
                  >
                    🔔 {note.message}
                  </div>
                );
              })
            )}
          </div>

          <div className="dash-panel">
            <h3>Featured Services</h3>
            {userData.activeServices.map(service => (
              <div
                key={service.id}
                className="list-item"
                style={{ borderLeftColor: '#2A3B4C', cursor: service.eventId ? 'pointer' : 'default' }}
                onClick={() => service.eventId && navigate(`/event/${service.eventId}`)}
              >
                <div><strong>{service.name}</strong><br/><span style={{ fontSize: '12px', color: '#888' }}>{service.status}</span></div>
                {service.eventId && (
                  <span style={{ fontSize: '12px', color: '#2A3B4C', fontWeight: 'bold' }}>View →</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Queues */}
        <div className="right-column">
          <div className="dash-panel">
            <h3>Your Active Queues</h3>

            {isLoadingQueues && (
              <p style={{ color: '#888', fontStyle: 'italic' }}>Loading your queues...</p>
            )}

            {!isLoadingQueues && activeQueues.map(queue => (
              <div key={queue.id} className="list-item" style={{ padding: '25px 20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#2A3B4C', fontSize: '1.2rem' }}>{queue.event}</h4>
                  <span style={{ color: '#888', fontSize: '14px' }}>Joined on {queue.date}</span>
                  {queuePositions[queue.event] != null && (
                    <div style={{ color: '#2A3B4C', fontSize: '14px', marginTop: '4px', fontWeight: 'bold' }}>
                      {queuePositions[queue.event]} {queuePositions[queue.event] === 1 ? 'person' : 'people'} ahead of you
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() =>
                      navigate('/queue', {
                        state: {
                          event: { title: queue.event },
                          quantity: 1,
                          userId: email,
                        },
                      })
                    }
                    style={{ background: 'none', border: '1px solid #2A3B4C', color: '#2A3B4C', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer' }}
                  >
                    View Queue
                  </button>
                </div>
              </div>
            ))}

            {!isLoadingQueues && activeQueues.length === 0 && (
              <p style={{ color: '#888', fontStyle: 'italic' }}>You are not currently in any queues.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
