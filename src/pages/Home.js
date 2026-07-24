import { useState } from "react";
import SearchBar from "../components/SearchBar";
import FeaturedBanner from "../components/FeaturedBanner";
import EventCard from "../components/EventCard";
import events from "../data/events";
import "../styles/Home.css";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  const searchText = searchTerm.trim().toLowerCase();

  // While searching, look across every event. With no search, show just one
  // event per primary category (Sports / Music / Comedy) as a preview.
  const filteredEvents = searchText
    ? events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchText) ||
          event.category.toLowerCase().includes(searchText) ||
          event.location.toLowerCase().includes(searchText)
      )
    : Object.values(
        events.reduce((acc, event) => {
          const primary = event.category.split(" ")[0];
          if (!acc[primary]) acc[primary] = event;
          return acc;
        }, {})
      );

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