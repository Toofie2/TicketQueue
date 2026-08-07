import { useState } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { logHistoryEvent } from "../api/historyApi";
import { notifyQueueJoin } from "../api/notificationsApi";
import "../styles/queue.css";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function JoinQueue() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isLoggedIn,
    username,
    email,
    userId: contextUserId,
    setActiveTicket,
    setIsTimeUp,
    setSecondsElapsed,
    setIsInLine,
  } = useOutletContext();

  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const purchaseData = location.state;
  const event = purchaseData?.event;

  const quantity = purchaseData?.quantity || 1;
  const totalPrice = purchaseData?.totalPrice || 0;
  const dbUserId = contextUserId || 1; 
  const dbServiceId = event?.id || purchaseData?.id || 1; 

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
      const response = await fetch(
        `${API_BASE}/api/queue/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: Number(dbUserId),
            serviceId: Number(dbServiceId),
            priority: event.priority || "Medium",
            name: username || "Demo User",
            tickets: quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to join queue."
        );
      }

      const activeTicket = {
        event,
        eventTitle: event.title,
        quantity,
        ticketQuantity: quantity,
        totalPrice,
        finalPrice: totalPrice,
      };

      if (setActiveTicket) {
        setActiveTicket(activeTicket);
      }

      if (setIsTimeUp) {
        setIsTimeUp(false);
      }

      if (setSecondsElapsed) {
        setSecondsElapsed(0);
      }

      if (setIsInLine) {
        setIsInLine(true);
      }

      if (email && event.id) {
        notifyQueueJoin({ userId: dbUserId, serviceId: event.id }).catch(() => {});
      }

      logHistoryEvent({
        email,
        event: event.title,
        outcome: "Joined Queue",
      }).catch((err) =>
        console.error('Failed to log "Joined Queue" history event:', err)
      );

      navigate("/queue", {
        state: {
          ...purchaseData,
          userId: dbUserId,
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
        style={{ padding: "60px 0" }}
      >
        <div
          className="outer-box"
          style={{
            maxWidth: "460px",
            width: "90%",
          }}
        >
          <div
            className="inner-box"
            style={{
              borderBottom: "1px solid rgba(197, 150, 72, 0.2)",
              paddingBottom: "20px",
            }}
          >
            <h2
              className="queue-label"
              style={{
                fontSize: "1.6rem",
                color: "#c59648",
                margin: 0,
              }}
            >
              Ticket Confirmation
            </h2>
          </div>

          <div
            style={{
              padding: "20px",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.95rem",
              }}
            >
              <span style={{ color: "#98a69d" }}>
                Selected Event:
              </span>

              <strong
                style={{
                  color: "#ffffff",
                  textAlign: "right",
                  maxWidth: "240px",
                }}
              >
                {event?.title || "Event unavailable"}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.95rem",
              }}
            >
              <span style={{ color: "#98a69d" }}>
                Ticket Quantity:
              </span>

              <strong style={{ color: "#ffffff" }}>
                {quantity}x Tickets
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.95rem",
              }}
            >
              <span style={{ color: "#98a69d" }}>
                Estimated Total:
              </span>

              <strong
                style={{
                  color: "#c59648",
                  fontSize: "1.1rem",
                }}
              >
                ${totalPrice}
              </strong>
            </div>
          </div>

          {error && (
            <p
              style={{
                color: "red",
                textAlign: "center",
                margin: "0 20px 16px",
              }}
            >
              {error}
            </p>
          )}

          <form
            onSubmit={handleJoinQueue}
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "0 20px 20px",
            }}
          >
            <button
              type="submit"
              className="success-checkout-btn"
              style={{
                margin: 0,
                width: "100%",
              }}
              disabled={joining}
            >
              {!isLoggedIn
                ? "Log In to Join Queue"
                : joining
                  ? "Joining Queue..."
                  : "Secure Position in Line"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JoinQueue;
