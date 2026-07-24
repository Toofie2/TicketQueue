import {
  useNavigate,
  useLocation,
  useOutletContext,
} from "react-router-dom";
import { useState } from "react";
import "../styles/queue.css";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function JoinQueue() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, username } = useOutletContext();

  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const purchaseData = location.state;
  const event = purchaseData?.event;
  const userId = username || "guest";

  const handleJoinQueue = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      alert("Account required! Redirecting you to the login page.");
      navigate("/login");
      return;
    }

    if (!event) {
      setError("Event information is missing. Please select an event again.");
      return;
    }

    setJoining(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/queue/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          serviceId: event.id,
          priority: event.priority || "Medium",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to join queue."
        );
      }

      navigate("/queue", {
        state: {
          ...purchaseData,
          userId,
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="queue-page-layout">
      <div
        className="queue-page-container"
        style={{ padding: "80px 0" }}
      >
        <div className="outer-box" style={{ maxWidth: "440px" }}>
          <div
            className="inner-box"
            style={{ borderBottom: "none", paddingBottom: 0 }}
          >
            <h2
              className="queue-label"
              style={{ fontSize: "1.5rem" }}
            >
              Ready to join the line?
            </h2>

            {event && (
              <div
                style={{
                marginTop: "16px",
                textAlign: "center",
                color: "white",
            }}
>
                <p>
                  <strong>{event.title}</strong>
                </p>
                <p>Tickets: {purchaseData.quantity}</p>
                <p>Total: ${purchaseData.totalPrice}</p>
              </div>
            )}

            {error && (
              <p
                style={{
                  color: "red",
                  textAlign: "center",
                  marginTop: "12px",
                }}
              >
                {error}
              </p>
            )}
          </div>

          <form
            onSubmit={handleJoinQueue}
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <button
              type="submit"
              className="success-checkout-btn"
              style={{ margin: 0 }}
              disabled={joining}
            >
              {!isLoggedIn
                ? "Log In to Join Queue"
                : joining
                  ? "Joining Queue..."
                  : "Enter Queue with My Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JoinQueue;