import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import "../styles/EventDetails.css";
import events from "../data/events";

function EventDetails() {
  const { id } = useParams();
  const event = events.find((event) => event.id === Number(id));
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const totalPrice = event ? event.price * quantity : 0;

  if (!event) return <h2 style={{ textAlign: 'center', padding: '50px' }}>Event not found.</h2>;

  return (
    <div className="event-details-page">
      <div className="event-details-card">
        <h1>{event.title}</h1>
        <p><strong>Category:</strong> {event.category}</p>
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Time:</strong> {event.time}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Price:</strong> ${event.price}</p>

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

        <button className="buy-button" onClick={() => navigate("/join")}>
          Buy Now
        </button>
      </div>
    </div>
  </div>
);
}

export default EventDetails;