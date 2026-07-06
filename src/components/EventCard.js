import "../styles/EventCard.css";

function EventCard({ event }) {
  return (
    <div className="event-card">
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