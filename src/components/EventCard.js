import { useNavigate } from "react-router-dom";
import "../styles/EventCard.css";

function EventCard({ event }) {
  const navigate = useNavigate();

  return (
    <div
      className="event-card"
      onClick={() => navigate(`/event/${event.id}`)}
    >
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