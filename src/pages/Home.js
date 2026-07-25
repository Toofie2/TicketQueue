import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import FeaturedBanner from "../components/FeaturedBanner";
import EventCard from "../components/EventCard";
import "../styles/Home.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Home() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data)) setEvents(data);
      })
      .catch(() => {
        if (active) setEvents([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const searchText = searchTerm.trim().toLowerCase();

  const filteredEvents = searchText
    ? events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchText) ||
          (event.category || "").toLowerCase().includes(searchText) ||
          event.location.toLowerCase().includes(searchText)
      )
    : Object.values(
        events.reduce((acc, event) => {
          const primary = (event.category || "").split(" ")[0];
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
