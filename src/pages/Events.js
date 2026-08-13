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
  const [sortOption, setSortOption] = useState("default");
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

  const sortedEvents = [...filteredEvents].sort((a, b) => {
  if (sortOption === "date-asc") {
    return new Date(a.date) - new Date(b.date);
  }

  if (sortOption === "date-desc") {
    return new Date(b.date) - new Date(a.date);
  }

  if (sortOption === "price-asc") {
    return Number(a.price) - Number(b.price);
  }

  if (sortOption === "price-desc") {
    return Number(b.price) - Number(a.price);
  }

  return 0;
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

      <div className="sort-control">
        <label htmlFor="event-sort">Sort by: </label>
        <select
          id="event-sort"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="date-asc">Date: Soonest</option>
          <option value="date-desc">Date: Latest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
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
              {sortedEvents.length} event
              {sortedEvents.length !== 1 ? "s" : ""} found
            </p>

            {sortedEvents.length > 0 ? (
              <div className="event-grid">
                {sortedEvents.map((event) => (
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