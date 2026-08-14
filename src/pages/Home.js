import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import EventCard from "../components/EventCard";
import "../styles/Home.css";
import worldCupBannerImage from "../assets/worldCup2026Banner.jpg"; 

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Home() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/api/events`)
      .then((res) => {
        if (!res.ok) throw new Error("API Route Failure");
        return res.json();
      })
      .then((data) => {
        if (active && Array.isArray(data)) setEvents(data);
      })
      .catch((err) => {
        console.error("Fetch events error:", err);
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
          (event.title || "").toLowerCase().includes(searchText) ||
          (event.category || "").toLowerCase().includes(searchText) ||
          (event.location || "").toLowerCase().includes(searchText)
      )
    : Object.values(
        events.reduce((acc, event) => {
          const primaryCategory = (event.category || "General").split(" ")[0];
          
          if (!acc[primaryCategory]) {
            acc[primaryCategory] = event;
          }
          return acc;
        }, {})
      );

  return (
    <div>
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <div className="world-cup-featured-banner" style={{ margin: "20px auto", maxWidth: "1200px", width: "95%", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
        <img 
          src={worldCupBannerImage} 
          alt="FIFA World Cup 2026 Secure Tickets Allocation Queue" 
          style={{ width: "100%", height: "auto", display: "block", objectFit: "cover", maxHeight: "360px" }}
        />
      </div>

      <main className="home-content">
        <h2 className="deals-title">Good deals just for you</h2>

        {filteredEvents.length > 0 ? (
          <div className="event-grid">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="no-results" style={{ textAlign: "center", padding: "40px", color: "#98a69d" }}>
            No events found.
          </p>
        )}
      </main>
    </div>
  );
}

export default Home;
