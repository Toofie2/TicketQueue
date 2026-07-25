import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/queue.css";

function CartView() {
  const navigate = useNavigate();

  const [cartItem, setCartItem] = useState(() => {
    const savedCartItem = localStorage.getItem("cartItem");

    if (!savedCartItem) {
      return null;
    }

    try {
      return JSON.parse(savedCartItem);
    } catch {
      localStorage.removeItem("cartItem");
      return null;
    }
  });

  const handleRemoveFromCart = () => {
    localStorage.removeItem("cartItem");
    setCartItem(null);
  };

  const handleProceedToQueue = () => {
    navigate("/join", {
      state: {
        event: cartItem.event,
        quantity: cartItem.quantity,
        totalPrice: cartItem.totalPrice,
      },
    });
  };

  if (!cartItem) {
    return (
      <div
        className="queue-page-container"
        style={{ padding: "100px 0" }}
      >
        <div className="outer-box" style={{ maxWidth: "460px" }}>
          <div
            className="inner-box"
            style={{ borderBottom: "none", paddingBottom: 0 }}
          >
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>
              🛒❌
            </div>

            <h2
              className="queue-label"
              style={{ fontSize: "1.6rem", color: "#ffffff" }}
            >
              Your Cart is Empty
            </h2>

            <p
              style={{
                color: "#98a69d",
                fontSize: "0.95rem",
                margin: "15px 0 25px 0",
                lineHeight: "1.5",
              }}
            >
              You haven't selected any tickets yet. Browse our event
              schedule to secure a spot.
            </p>
          </div>

          <button
            className="success-checkout-btn"
            style={{ margin: 0 }}
            onClick={() => navigate("/events")}
          >
            Explore Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="queue-page-container"
      style={{ padding: "100px 0" }}
    >
      <div className="outer-box" style={{ maxWidth: "520px" }}>
        <div className="inner-box">
          <div style={{ fontSize: "50px", marginBottom: "15px" }}>
            🛒
          </div>

          <h2
            className="queue-label"
            style={{ fontSize: "1.6rem", color: "#ffffff" }}
          >
            Your Cart
          </h2>

          <div
            style={{
              textAlign: "left",
              color: "#ffffff",
              marginTop: "25px",
              lineHeight: "1.8",
            }}
          >
            <p>
              <strong>Event:</strong> {cartItem.event.title}
            </p>

            <p>
              <strong>Date:</strong> {cartItem.event.date}
            </p>

            <p>
              <strong>Location:</strong> {cartItem.event.location}
            </p>

            <p>
              <strong>Ticket Quantity:</strong> {cartItem.quantity}
            </p>

            <p>
              <strong>Total:</strong> ${cartItem.totalPrice}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <button
            className="success-checkout-btn"
            style={{ margin: 0, flex: 1 }}
            onClick={handleRemoveFromCart}
          >
            Remove from Cart
          </button>

          <button
            className="success-checkout-btn"
            style={{ margin: 0, flex: 1 }}
            onClick={handleProceedToQueue}
          >
            Proceed to Queue
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartView;