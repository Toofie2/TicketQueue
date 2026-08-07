import { useState, useEffect } from "react";
import { authHeaders } from "../api/authApi";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Reporting() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/reports/summary`, { headers: { ...authHeaders() } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setReport(data);
        else setError("Could not load the report.");
      })
      .catch(() => setError("Could not reach the server."));
  }, []);

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reports/summary.pdf`, {
        headers: { ...authHeaders() },
      });
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

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Reports</h1>
        <p>Queue activity and usage statistics</p>
      </header>

      {error && <p className="form-error">{error}</p>}

      {report && (
        <>
          <section className="stat-row">
            <div className="stat-card">
              <span className="stat-value">{report.totalServices}</span>
              <span className="stat-label">Events</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{report.totalInQueue}</span>
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
          </section>
        </>
      )}

      {!report && !error && <p className="sale-meta">Loading report…</p>}
    </div>
  );
}

export default Reporting;
