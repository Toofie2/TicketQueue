import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/EventDetails.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE}/api/events/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setEvent(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setEvent(null);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const totalPrice = event ? event.price * quantity : 0;

  if (loading)
    return (
      <h2 style={{ textAlign: "center", padding: "50px" }}>
        Loading...
      </h2>
    );

  if (!event)
    return (
      <h2 style={{ textAlign: "center", padding: "50px" }}>
        Event not found.
      </h2>
    );

  return (
    <div className="event-details-page">
      <div className="event-details-card">
        <h1>{event.title}</h1>

        <p>
          <strong>Category:</strong> {event.category}
        </p>

        <p>
          <strong>Date:</strong> {event.date}
        </p>

        <p>
          <strong>Time:</strong> {event.time}
        </p>

        <p>
          <strong>Location:</strong> {event.location}
        </p>

        <p>
          <strong>Price:</strong> ${event.price}
        </p>

        <div className="ticket-section">
          <label>
            Ticket Quantity:
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </label>

          <h3>Total: ${totalPrice}</h3>

          <button
            className="buy-button"
            onClick={() =>
              navigate("/join", {
                state: {
                  event,
                  quantity,
                  totalPrice,
                },
              })
            }
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;