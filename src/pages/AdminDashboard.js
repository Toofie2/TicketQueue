import { useState, useEffect, useCallback } from "react";
import { mockRevenue } from "../data/adminMockData";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function AdminDashboard() {
  const [services, setServices] = useState([]);
  const [queue, setQueue] = useState([]);
  const [salesFilter, setSalesFilter] = useState("All");
  const [showAllSales, setShowAllSales] = useState(false);

  const loadQueue = useCallback(() => {
    fetch(`${API_BASE}/api/queue/admin/current`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setQueue(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/services`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadQueue();
    const timer = setInterval(loadQueue, 5000);
    return () => clearInterval(timer);
  }, [loadQueue]);

  const totalTickets = services.reduce(
    (sum, s) => sum + Number(s.quantity || 0),
    0
  );

  const queueFor = (name) => queue.filter((u) => u.serviceId === name);

  const isOpen = (s) => s.queueOpen !== false;

  const toggleQueue = (s) => {
    fetch(`${API_BASE}/api/services/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ queueOpen: !isOpen(s) }),
    })
      .then((res) => res.json())
      .then((data) => {
        setServices((prev) => prev.map((x) => (x.id === s.id ? data : x)));
      })
      .catch(() => {});
  };

  const busiestQueues = [...services]
    .sort((a, b) => queueFor(b.name).length - queueFor(a.name).length)
    .slice(0, 4);

  const categories = [
    "All",
    ...new Set(
      services.map((s) => (s.category || "").split(" ")[0]).filter(Boolean)
    ),
  ];

  const filteredSales = services.filter(
    (s) =>
      salesFilter === "All" ||
      (s.category || "").split(" ")[0] === salesFilter
  );
  const visibleSales = showAllSales ? filteredSales : filteredSales.slice(0, 3);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of sales and the live queues</p>
      </header>

      <section className="stat-row">
        <div className="stat-card">
          <span className="stat-value">{services.length}</span>
          <span className="stat-label">Active Sales</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalTickets.toLocaleString()}</span>
          <span className="stat-label">Tickets Available</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">${mockRevenue.toLocaleString()}</span>
          <span className="stat-label">Revenue</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{queue.length}</span>
          <span className="stat-label">Total In Queue</span>
        </div>
      </section>

      <div className="admin-grid">
        <section className="panel" style={{ alignSelf: "start" }}>
          <h2>Busiest Queues</h2>
          <ul className="item-list item-list--light">
            {busiestQueues.map((s) => {
              const q = queueFor(s.name);
              const open = isOpen(s);
              return (
                <li key={s.id} className={open ? "" : "queue-item-closed"}>
                  <div className="queue-item-info">
                    <strong>{s.name}</strong>
                    <span className="sale-meta">
                      {q.length > 0 ? `Next up: ${q[0].name}` : "No one waiting"}
                    </span>
                  </div>
                  <div className="item-actions">
                    {!open && <span className="closed-tag">Closed</span>}
                    <span className="count-badge">{q.length} waiting</span>
                    <button
                      className={open ? "kick-button" : "ghost-button"}
                      onClick={() => toggleQueue(s)}
                    >
                      {open ? "Close queue" : "Open queue"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="panel">
          <h2>Sales Overview</h2>
          <div className="event-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`event-tab ${
                  salesFilter === cat ? "event-tab-active" : ""
                }`}
                onClick={() => {
                  setSalesFilter(cat);
                  setShowAllSales(false);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <ul className="item-list item-list--light">
            {visibleSales.map((s) => (
              <li key={s.id}>
                <div>
                  <strong>{s.name}</strong>
                  <span className="sale-meta">
                    {s.venue} · {s.date}
                  </span>
                </div>
                <span className="count-badge">
                  ${s.price} · {Number(s.quantity).toLocaleString()} left
                </span>
              </li>
            ))}
          </ul>
          {filteredSales.length > 3 && (
            <button
              className="ghost-button"
              style={{ marginTop: "12px" }}
              onClick={() => setShowAllSales((v) => !v)}
            >
              {showAllSales
                ? "Show less"
                : `Show more (${filteredSales.length - 3})`}
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
