import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/EventDetails.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [recommendationData, setRecommendationData] = useState(null);

  useEffect(() => {
    let active = true;

    // Load the event details
    fetch(`${API_BASE}/api/events/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setEvent(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setEvent(null);
        setLoading(false);
      });

    // Load the smart shorter-wait recommendation
    fetch(`${API_BASE}/api/events/${id}/recommendation`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setRecommendationData(data);
      })
      .catch(() => {
        if (!active) return;
        setRecommendationData(null);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const totalPrice = event ? event.price * quantity : 0;

  const handleAddToCart = () => {
    const cartItem = { event, quantity, totalPrice };
    localStorage.setItem("cartItem", JSON.stringify(cartItem));
    navigate("/cart");
  };

  const handleBuyNow = () => {
    navigate("/join", {
      state: { event, quantity, totalPrice },
    });
  };

  if (loading) {
    return <h2 className="details-loading">Loading event catalog profiles...</h2>;
  }

  if (!event) {
    return <h2 className="details-error">Event not found inside database files.</h2>;
  }

  const displayImage = event.image || "https://unsplash.com";

  return (
    <div className="event-details-page">
      <div className="details-main-grid">
        <div className="details-image-hero">
          <img src={displayImage} alt={event.title} />
        </div>
        <div className="event-details-card">
          <span className="details-badge">{event.category || "General Admission"}</span>
          <h1>{event.title}</h1>

          <div className="meta-info-stack">
            <div className="meta-row">
              <span className="meta-label">🏟️ Venue</span>
              <span className="meta-value">{event.location}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">📅 Date</span>
              <span className="meta-value">{event.date}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Time</span>
              <span className="meta-value">{event.time}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Ticket Price</span>
              <span className="meta-value gold-text">${event.price}</span>
            </div>
          </div>
          {recommendationData?.recommendation && (
            <div className="smart-recommendation-alert">
              <div className="smart-header">
                <h3>🤖 QueueSmart Quick-Pass Insight</h3>
              </div>
              <p>
                Skip the line! <strong>{recommendationData.recommendation.title}</strong> currently has an estimated wait time of only <strong className="gold-text">{recommendationData.recommendation.estimatedWait} min(s)</strong>, saving you time compared with {recommendationData.currentEvent.estimatedWait} min(s) here.
              </p>
              <button
                className="alternative-action-btn"
                onClick={() => navigate(`/event/${recommendationData.recommendation.id}`)}
              >
                Switch to Alternative Event Line ⚡
              </button>
            </div>
          )}

          <div className="ticket-section-control">
            <div className="quantity-selector-box">
              <label htmlFor="quantity-dropdown">Ticket Quantity:</label>
              <select
                id="quantity-dropdown"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                <option value={1}>1 Ticket</option>
                <option value={2}>2 Tickets</option>
                <option value={3}>3 Tickets</option>
                <option value={4}>4 Tickets</option>
              </select>
            </div>

            <div className="total-display-bar">
              <span>Total Value:</span>
              <strong className="total-amount">${totalPrice}</strong>
            </div>

            <div className="action-buttons-wrapper">
              <button className="primary-buy-now-btn" onClick={handleBuyNow}>
                Secure Position in Line 🛒
              </button>
              <button className="secondary-cart-btn" onClick={handleAddToCart}>
                Save to Cart
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EventDetails;
