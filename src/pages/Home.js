import events from "../data/events";

function Home() {
  return (
    <div>
      <h1>Welcome to TixQ</h1>
      <p>Browse upcoming events.</p>

      <h2>Upcoming Events</h2>

      {events.map((event) => (
        <div key={event.id}>
        <h3>{event.title}</h3>
        <p>
            {event.date} at {event.time}
        </p>
        <p>{event.location}</p>
        <p>${event.price}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;