import { useState, useEffect, useCallback } from "react";
import { authHeaders } from "../api/authApi";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function buildQuery({ from, to, serviceId }) {
  const p = new URLSearchParams();
  if (from) p.set("from", from);
  if (to) p.set("to", to);
  if (serviceId) p.set("serviceId", serviceId);
  const s = p.toString();
  return s ? `?${s}` : "";
}

function Reporting() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", serviceId: "" });

  const loadReport = useCallback((f) => {
    setError("");
    fetch(`${API_BASE}/api/reports/summary${buildQuery(f)}`, {
      headers: { ...authHeaders() },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setReport(data);
        else setError("Could not load the report.");
      })
      .catch(() => setError("Could not reach the server."));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/services`, { headers: { ...authHeaders() } })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => {});
    loadReport({ from: "", to: "", serviceId: "" });
  }, [loadReport]);

  const applyFilters = (e) => {
    e.preventDefault();
    loadReport(filters);
  };

  const clearFilters = () => {
    const cleared = { from: "", to: "", serviceId: "" };
    setFilters(cleared);
    loadReport(cleared);
  };

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/reports/summary.pdf${buildQuery(filters)}`,
        { headers: { ...authHeaders() } }
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "queuesmart-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not download the PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const activeFilterLabel = () => {
    const f = report?.filters || {};
    const parts = [];
    parts.push(f.serviceName ? f.serviceName : "All services");
    if (f.from || f.to) {
      parts.push(`${f.from || "start"} → ${f.to || "today"}`);
    } else {
      parts.push("all dates");
    }
    return parts.join(" · ");
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Reports</h1>
        <p>Queue activity and usage statistics</p>
      </header>

      {error && <p className="form-error">{error}</p>}

      <section className="panel">
        <h2>Filters</h2>
        <form className="sale-form" onSubmit={applyFilters}>
          <div className="form-row">
            <label>
              From
              <input
                type="date"
                value={filters.from}
                max={filters.to || undefined}
                onChange={(e) =>
                  setFilters({ ...filters, from: e.target.value })
                }
              />
            </label>
            <label>
              To
              <input
                type="date"
                value={filters.to}
                min={filters.from || undefined}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </label>
            <label>
              Service
              <select
                value={filters.serviceId}
                onChange={(e) =>
                  setFilters({ ...filters, serviceId: e.target.value })
                }
              >
                <option value="">All services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="primary-button">
              Apply Filters
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {report && (
        <>
          <p className="sale-meta" style={{ marginBottom: "16px" }}>
            Showing: <strong>{activeFilterLabel()}</strong>
          </p>

          <section className="stat-row">
            <div className="stat-card">
              <span className="stat-value">{report.totalServices}</span>
              <span className="stat-label">Events</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{report.totalWaiting}</span>
              <span className="stat-label">In Queue</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{report.served}</span>
              <span className="stat-label">Served</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{report.avgWait}</span>
              <span className="stat-label">Avg Wait (min)</span>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Service Details &amp; Queue Activity</h2>
              <button
                className="primary-button"
                onClick={downloadPdf}
                disabled={downloading}
              >
                {downloading ? "Preparing…" : "Download PDF"}
              </button>
            </div>
            {report.services.length === 0 ? (
              <p className="sale-meta">No services match these filters.</p>
            ) : (
              <ul className="item-list item-list--light">
                {report.services.map((s) => (
                  <li key={s.id}>
                    <div>
                      <strong>{s.name}</strong>
                      <span className="sale-meta">
                        {[
                          s.category,
                          `${s.priority} priority`,
                          `${s.expectedDuration} min`,
                          s.queueOpen ? "Open" : "Closed",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                    <span className="count-badge">{s.inQueue} in queue</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <h2>Customer Participation History</h2>
            {report.participation.length === 0 ? (
              <p className="sale-meta">
                No participation history for these filters.
              </p>
            ) : (
              <ul className="item-list item-list--light">
                {report.participation.map((u) => (
                  <li key={u.email} style={{ display: "block" }}>
                    <strong>{u.name || u.email}</strong>
                    <span className="sale-meta">{u.email}</span>
                    {u.records.map((r, i) => (
                      <span key={i} className="sale-meta">
                        {r.date} · {r.event} · {r.outcome}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {!report && !error && <p className="sale-meta">Loading report…</p>}
    </div>
  );
}

export default Reporting;
