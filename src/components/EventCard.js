import { useNavigate } from "react-router-dom";
import "../styles/EventCard.css";

function EventCard({ event }) {
  const navigate = useNavigate();
  const closed = event.queueOpen === false;

  return (
    <div
      className="event-card"
      onClick={() => !closed && navigate(`/event/${event.id}`)}
      style={{
        position: "relative",
        ...(closed
          ? { opacity: 0.6, filter: "grayscale(0.85)", cursor: "not-allowed" }
          : {}),
      }}
    >
      {closed && (
        <span
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "#2A3B4C",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "bold",
            zIndex: 2,
          }}
        >
          Closed
        </span>
      )}

      <div className="event-image">
        <span>{event.category}</span>
      </div>

      <div className="event-info">
        <h3>{event.title}</h3>
        <p>{event.date} • {event.time}</p>
        <p>{event.location}</p>
        <p className="event-price">${event.price}</p>
      </div>
    </div>
  );
}

export default EventCard;
