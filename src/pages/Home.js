import { useState } from "react";
import SearchBar from "../components/SearchBar";
import FeaturedBanner from "../components/FeaturedBanner";
import EventCard from "../components/EventCard";
import events from "../data/events";
import "../styles/Home.css";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = events.filter((event) => {
  const searchText = searchTerm.trim().toLowerCase();

  return (
    event.title.toLowerCase().includes(searchText) ||
    event.category.toLowerCase().includes(searchText) ||
    event.location.toLowerCase().includes(searchText)
  );
});

  return (
    <div>
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <FeaturedBanner />

      <main className="home-content">
        <h2 className="deals-title">Good deals just for you</h2>

        {filteredEvents.length > 0 ? (
          <div className="event-grid">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="no-results">No events found.</p>
        )}
      </main>
    </div>
  );
}

export default Home;