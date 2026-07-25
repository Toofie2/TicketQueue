import { useEffect, useState } from "react";
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
    isLoggedIn,
  } = useOutletContext();

  const purchaseData = location.state;
  const event = purchaseData?.event;

  const userId =
    purchaseData?.userId ||
    email ||
    username ||
    "guest";

  const [usersAhead, setUsersAhead] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isInLine, setIsInLine] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        const response = await fetch(
          `${API_BASE}/api/queue/status/${encodeURIComponent(
            userId
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Unable to retrieve queue status."
          );
        }

        if (!active) {
          return;
        }

        setUsersAhead(data.positionAhead);
        setWaitTime(data.waitTime);
        setError("");
        setLoading(false);

        if (data.positionAhead === 0) {
          setIsTimeUp(true);

          if (!notificationShown) {
            toast.success(
              "🎉 Your turn has arrived! Proceed to checkout.",
              {
                position: "top-right",
                autoClose: false,
              }
            );

            notificationShown = true;
          }
        } else {
          setIsTimeUp(false);
        }
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err.message);
        setLoading(false);
      }
    };

    loadQueueStatus();

    const interval = setInterval(loadQueueStatus, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isLoggedIn, isInLine, userId]);

  const handleLeaveQueue = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/queue/leave/${encodeURIComponent(
          userId
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to leave queue."
        );
      }

      toast.dismiss();
      setIsInLine(false);
      setIsTimeUp(false);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejoinQueue = () => {
    navigate("/join", {
      state: purchaseData,
    });
  };

  const handleCheckout = () => {
    toast.dismiss();

    navigate("/success", {
      state: purchaseData,
    });
  };

  let titleText =
    `🏆 Good news, ${currentUser.name}! ` +
    `You are in line for ${purchaseData?.quantity || 1} ` +
    `${event?.title || "event"} ticket(s). 🏆`;

  if (!isInLine) {
    titleText = "You are currently out of line.";
  } else if (isTimeUp) {
    titleText =
      `🛒 ${currentUser.name}, your ` +
      `${purchaseData?.quantity || 1} ticket(s) for ` +
      `${event?.title || "the event"} are ready!`;
  }

  if (!purchaseData || !event) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <h2>Queue information is missing.</h2>

        <button onClick={() => navigate("/events")}>
          Return to Events
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", padding: "60px" }}>
        Loading queue status...
      </h2>
    );
  }

  return (
    <div className="queue-page-layout">
      <ToastContainer
        position="top-right"
        autoClose={false}
      />

      {error && (
        <p
          style={{
            color: "red",
            textAlign: "center",
            paddingTop: "20px",
          }}
        >
          {error}
        </p>
      )}

      <Queue
        currentUser={currentUser}
        usersAhead={usersAhead}
        waitTime={waitTime}
        isTimeUp={isTimeUp}
        isInLine={isInLine}
        titleText={titleText}
        eventTitle={event.title}
        quantity={purchaseData.quantity}
        totalPrice={purchaseData.totalPrice}
        onLeaveQueue={handleLeaveQueue}
        onRejoinQueue={handleRejoinQueue}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default UserQueue;