import { useNavigate } from "react-router-dom";
import "../styles/queue.css";

function KickedFromQueue() {
  const navigate = useNavigate();

  return (
    <div className="queue-page-layout">
      <div className="queue-page-container">
        <div className="queue-top-text">
          <h2>You have been removed from the queue.</h2>
        </div>

        <div className="outer-box">
          <div className="left-queue-state" style={{ padding: "20px 0" }}>
            <h2
              className="queue-subtitle"
              style={{ fontSize: "1.4rem", marginBottom: "25px" }}
            >
              An administrator removed you from this line. Your spot has been
              released.
            </h2>

            <button
              className="success-checkout-btn"
              style={{ margin: 0 }}
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <main className="content-spacer" />
        <div className="graphic-backdrop" />
      </div>
    </div>
  );
}

export default KickedFromQueue;
