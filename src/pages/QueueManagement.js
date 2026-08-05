import { useState, useEffect, useCallback } from "react";
import QueueTable from "../components/QueueTable";
import { authHeaders } from "../api/authApi";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function QueueManagement() {
  const [services, setServices] = useState([]);
  const [queue, setQueue] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState("");

  const loadQueue = useCallback(() => {
    fetch(`${API_BASE}/api/queue/admin/current`, { headers: { ...authHeaders() } })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setQueue(
          data
            .map((q) => ({
              id: q.userId || q.email,
              name: q.name || q.userId || "Guest",
              serviceId: q.serviceId,
              priority: q.priority,
              tickets: q.tickets || 1,
              joinedAt: q.joinedAt,
            }))
            .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt))
        );
      })
      .catch(() => setError("Could not reach the queue API on port 4000."));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/services`, { headers: { ...authHeaders() } })
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
        setSelectedEvent((prev) => prev ?? data[0]?.name ?? null);
      })
      .catch(() => setError("Could not load services."));
  }, []);

  useEffect(() => {
    loadQueue();
    const timer = setInterval(loadQueue, 5000);
    return () => clearInterval(timer);
  }, [loadQueue]);

  const eventQueue = queue
    .filter((u) => u.serviceId === selectedEvent)
    .map((u, i) => ({ ...u, waitMinutes: i }));

  const kickUser = (id) => {
    fetch(`${API_BASE}/api/queue/leave/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
      .then(() => loadQueue())
      .catch(() => setError("Could not remove the user from the queue."));
  };

  const advanceQueue = () => {
    const front = eventQueue[0];
    if (front) kickUser(front.id);
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Queue Management</h1>
        <p>Pick an event to manage the queue</p>
      </header>

      {error && <p className="form-error">{error}</p>}

      <div className="event-tabs">
        {services.map((s) => {
          const count = queue.filter((u) => u.serviceId === s.name).length;
          return (
            <button
              key={s.id}
              className={`event-tab ${
                s.name === selectedEvent ? "event-tab-active" : ""
              }`}
              onClick={() => setSelectedEvent(s.name)}
            >
              {s.name}
              <span className="event-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>Live Queue ({eventQueue.length})</h2>
          <button
            className="primary-button"
            onClick={advanceQueue}
            disabled={eventQueue.length === 0}
          >
            Advance Queue
          </button>
        </div>
        <QueueTable queue={eventQueue} onKick={kickUser} />
      </section>
    </div>
  );
}

export default QueueManagement;
