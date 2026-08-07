import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import EventCard from "../components/EventCard";
import "../styles/Events.css";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    let active = true;

    fetch(`${API_BASE}/api/events`)
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Could not load events."
          );
        }

        return data;
      })
      .then((data) => {
        if (!active) {
          return;
        }

        if (!Array.isArray(data)) {
          throw new Error("Invalid event data received.");
        }

        setEvents(data);
        setApiError("");
        setLoading(false);
      })
      .catch((err) => {
        if (!active) {
          return;
        }

        setEvents([]);
        setApiError(
          err.message || "Could not load events."
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
      events
        .map((e) => (e.category || "").split(" ")[0])
        .filter(Boolean)
    ),
  ];

  const filteredEvents = events.filter((event) => {
    const text = searchTerm.trim().toLowerCase();

    const title = event.title || "";
    const category = event.category || "";
    const location = event.location || "";

    const matchesSearch =
      title.toLowerCase().includes(text) ||
      category.toLowerCase().includes(text) ||
      location.toLowerCase().includes(text);

    const matchesCategory =
      activeCategory === "All" ||
      category.startsWith(activeCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="events-page">
      <section className="events-hero">
        <h1>Browse Events</h1>
        <p>Find and queue up for your next experience</p>
      </section>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="category-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${
              activeCategory === cat
                ? "category-pill-active"
                : ""
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="events-content">
        {apiError && (
          <p className="no-results">{apiError}</p>
        )}

        {loading ? (
          <p className="events-count">
            Loading events…
          </p>
        ) : (
          <>
            <p className="events-count">
              {filteredEvents.length} event
              {filteredEvents.length !== 1 ? "s" : ""} found
            </p>

            {filteredEvents.length > 0 ? (
              <div className="event-grid">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                  />
                ))}
              </div>
            ) : (
              !apiError && (
                <p className="no-results">
                  No events found.
                </p>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Events;