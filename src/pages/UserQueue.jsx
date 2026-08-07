import { useEffect, useState, useRef } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Queue from "../components/Queue";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function UserQueue() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    username,
    email,
    userId: contextUserId,
    isLoggedIn,
    setIsInLine: setGlobalInLine,
    setIsTimeUp: setGlobalTimeUp,
  } = useOutletContext();

  const purchaseData = location.state;
  const event = purchaseData?.event;

  const userId = purchaseData?.userId || contextUserId || email || username || "guest";

  const [usersAhead, setUsersAhead] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [startAhead, setStartAhead] = useState(null);
  const [tickets, setTickets] = useState(purchaseData?.quantity || 1);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isInLine, setIsInLine] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const wasInLineRef = useRef(false);

  const currentUser = {
    id: userId,
    name: username || email || "Guest Customer",
    totalQueueCap: 1500,
  };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!isLoggedIn || !isInLine || !userId) {
      return;
    }

    let active = true;
    let notificationShown = false;

    const loadQueueStatus = async () => {
      try {
        const safeUserIdForQuery = (!userId || isNaN(Number(userId))) ? 1 : Number(userId);
        const safeServiceIdForQuery = (!event?.id || isNaN(Number(event.id))) ? 1 : Number(event.id);

        const response = await fetch(
          `${API_BASE}/api/queue/status/${encodeURIComponent(safeUserIdForQuery)}?serviceId=${encodeURIComponent(safeServiceIdForQuery)}`
        );

        if (response.status === 404) {
          if (!active) return;
          if (wasInLineRef.current) {
            navigate("/kicked");
          } else {
            setError("You are not currently in this queue.");
            setLoading(false);
          }
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.message || "Unable to retrieve queue status.");
        }

        if (!active) return;

        wasInLineRef.current = true;

        setUsersAhead(data.positionAhead);
        setStartAhead((prev) => (prev == null ? data.positionAhead : prev));
        setWaitTime(data.waitTime); 
        
        if (data.tickets) {
          setTickets(data.tickets);
        }
        
        setError(""); 
        setLoading(false);

        const currentPos = Number(data.positionAhead);
        const currentWait = Number(data.waitTime);

        if (currentPos === 0 && (currentWait === 0 || data.waitTime === "0 mins")) {
          setIsTimeUp(true);
          if (setGlobalTimeUp) setGlobalTimeUp(true);

          if (!notificationShown) {
            toast.dismiss();

            toast.success(
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span>🎉 Your turn has arrived! Your tickets are secured.</span>
                <button 
                  onClick={handleCheckout} 
                  style={{
                    backgroundColor: '#1b2b36',
                    color: '#c59648',
                    border: '1px solid #c59648',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    width: 'fit-content'
                  }}
                >
                  Go to Checkout 🛒
                </button>
              </div>,
              {
                position: "top-right",
                autoClose: false,
                closeOnClick: false 
              }
            );
            notificationShown = true;
          }
        } else {
          setIsTimeUp(false);
          if (setGlobalTimeUp) setGlobalTimeUp(false);
        }
      } catch (err) {
        if (!active) return;
        setError(err.message);
        setLoading(false);
      }
    };

    loadQueueStatus();
    const interval = setInterval(loadQueueStatus, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isLoggedIn, isInLine, userId, event, navigate, setGlobalTimeUp]);

  const handleAbandonQueue = async () => {
    const confirmAbandon = window.confirm("Are you sure you want to leave the queue? You will lose your spot in line!");
    if (!confirmAbandon) return;

    try {
      const numericUserId = isNaN(Number(userId)) ? 1 : Number(userId);
      const safeServiceIdForQuery = (!event?.id || isNaN(Number(event.id))) ? 1 : Number(event.id);
      await fetch(`${API_BASE}/api/queue/leave/${numericUserId}?serviceId=${safeServiceIdForQuery}`, {
        method: "DELETE",
      });

      await fetch(`${API_BASE}/api/queue/success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: numericUserId,
          serviceName: event?.title || "Event Pass",
          outcome: "Left Queue" 
        })
      });

      toast.dismiss();
      localStorage.removeItem("cartItem"); 
      if (setGlobalInLine) setGlobalInLine(false);
      if (setGlobalTimeUp) setGlobalTimeUp(false);
      
      setIsInLine(false);
      setIsTimeUp(false);
      setError("");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejoinQueue = () => {
    navigate("/join", { state: purchaseData });
  };

  const handleCheckout = () => {
    toast.dismiss();
    navigate("/checkout", { state: purchaseData });
  };

  let titleText =
    `🏆 Good news, ${currentUser.name}! ` +
    `You are in line for ${tickets} ` +
    `${event?.title || "event"} ticket(s). 🏆`;

  if (!isInLine) {
    titleText = "You are currently out of line.";
  } else if (isTimeUp) {
    titleText =
      `🛒 ${currentUser.name}, your ` +
      `${tickets} ticket(s) for ` +
      `${event?.title || "the event"} are ready!`;
  }

  if (!purchaseData || !event) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <h2>Queue information is missing.</h2>
        <button onClick={() => navigate("/events")}>Return to Events</button>
      </div>
    );
  }

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", padding: "60px" }}>Loading queue status...</h2>
    );
  }

  return (
    <div className="queue-page-layout">
      <style>{`
        .success-checkout-btn, .queue-page-layout button, button[class*="leave"] {
          border: 2px solid #c59648 !important;
          color: #c59648 !important;
          background: transparent !important;
          transition: all 0.2s ease-in-out;
        }
        .success-checkout-btn:hover, .queue-page-layout button:hover {
          background: #c59648 !important;
          color: #12202a !important;
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={false} />

      {error && (
        <p style={{ color: "red", textAlign: "center", paddingTop: "20px" }}>{error}</p>
      )}

      <Queue
        currentUser={currentUser}
        usersAhead={usersAhead}
        startAhead={startAhead}
        waitTime={waitTime}
        isTimeUp={isTimeUp}
        isInLine={isInLine}
        titleText={titleText}
        eventTitle={event.title}
        quantity={tickets}
        totalPrice={purchaseData.totalPrice}
        onLeaveQueue={handleAbandonQueue} 
        onRejoinQueue={handleRejoinQueue}
        onCheckout={handleCheckout}
      />
      {isInLine && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", paddingBottom: "40px" }}>
          <button
            type="button"
            onClick={handleAbandonQueue}
            style={{
              padding: "12px 30px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "0.95rem",
              cursor: "pointer",
              outline: "none"
            }}
          >
            Leave Queue
          </button>
        </div>
      )}
    </div>
  );
}

export default UserQueue;
