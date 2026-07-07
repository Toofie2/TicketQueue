import { mockRevenue } from "../data/adminMockData";

function AdminDashboard({ sales, queue }) {
  const totalTickets = sales.reduce((sum, s) => sum + Number(s.quantity), 0);

  const queueFor = (eventId) => queue.filter((u) => u.eventId === eventId);
  const busiest = [...sales].sort(
    (a, b) => queueFor(b.id).length - queueFor(a.id).length
  )[0];

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of sales and the live queues</p>
      </header>

      <section className="stat-row">
        <div className="stat-card">
          <span className="stat-value">{sales.length}</span>
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
        <section className="panel">
          <h2>Queues by Event</h2>
          <ul className="item-list item-list--light">
            {sales.map((s) => {
              const q = queueFor(s.id);
              return (
                <li key={s.id}>
                  <div>
                    <strong>{s.event}</strong>
                    <span className="sale-meta">
                      {q.length > 0
                        ? `Next up: ${q[0].name}`
                        : "No one waiting"}
                    </span>
                  </div>
                  <span className="count-badge">{q.length} waiting</span>
                </li>
              );
            })}
          </ul>
          {busiest && (
            <p className="dash-note">
              Busiest queue: <strong>{busiest.event}</strong>
            </p>
          )}
        </section>

        <section className="panel">
          <h2>Sales Overview</h2>
          <ul className="item-list item-list--light">
            {sales.map((s) => (
              <li key={s.id}>
                <div>
                  <strong>{s.event}</strong>
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
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
