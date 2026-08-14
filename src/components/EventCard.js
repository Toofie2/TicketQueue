import { useNavigate } from "react-router-dom";
import "../styles/EventCard.css";

function EventCard({ event }) {
  const navigate = useNavigate();
  const closed = event.queueOpen === false;
  const fallbackImage = "https://unsplash.com";
  const displayImage = event.image || fallbackImage;

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
      <div 
        className="event-image"
        style={{
          backgroundImage: `url(${displayImage})`
        }}
      >
      </div>

      <div className="event-info">
        <h3>{event.title}</h3>
        <p style={{ color: "#b6843c", textTransform: "uppercase", fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px", margin: "0 0 6px 0" }}>
          {event.category || "General"}
        </p>

        <p>{event.date} • {event.time}</p>
        <p>{event.location}</p>
        <p className="event-price">${event.price}</p>
      </div>
    </div>
  );
}

export default EventCard;
