import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import EventCard from "../components/EventCard";
import "../styles/Events.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setEvents(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setApiError(
          "Could not load events."
        );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = [
    "All",
    ...new Set(
      events.map((e) => (e.category || "").split(" ")[0]).filter(Boolean)
    ),
  ];

  const filteredEvents = events.filter((event) => {
    const text = searchTerm.trim().toLowerCase();
    const matchesSearch =
      event.title.toLowerCase().includes(text) ||
      event.category.toLowerCase().includes(text) ||
      event.location.toLowerCase().includes(text);
    const matchesCategory =
      activeCategory === "All" || event.category.startsWith(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="events-page">
      <header className="events-header">
        <h1>Browse Events</h1>
        <p>Find and queue up for your next experience</p>
      </header>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="category-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${
              activeCategory === cat ? "category-pill-active" : ""
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="events-content">
        {apiError && <p className="no-results">{apiError}</p>}

        {loading ? (
          <p className="events-count">Loading events…</p>
        ) : (
          <>
            <p className="events-count">
              {filteredEvents.length} event
              {filteredEvents.length !== 1 ? "s" : ""} found
            </p>

            {filteredEvents.length > 0 ? (
              <div className="event-grid">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="no-results">No events found.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Events;
