import "../styles/queue.css";

function Queue({
  currentUser,
  usersAhead,
  waitTime,
  isTimeUp,
  isInLine,
  titleText,
  eventTitle,
  quantity,
  totalPrice,
  onLeaveQueue,
  onRejoinQueue,
  onCheckout,
}) {
  const totalCap = currentUser?.totalQueueCap || 1500;
  const peopleServed = Math.max(totalCap - usersAhead, 0);

  const progressPercent = Math.min(
    Math.floor((peopleServed / totalCap) * 100),
    100
  );

  return (
    <div className="queue-page-container">
      <div className="queue-top-text">
        <h2>{titleText}</h2>

        {isInLine && (
          <p className="user-id-tag">
            Account ID: {currentUser.id}
          </p>
        )}
      </div>

      <div className="outer-box">
        {isInLine ? (
          <>
            <div className="inner-box">
              <h1 className="queue-label">People ahead of you:</h1>

              <h1 className="queue-position-number">
                #{usersAhead}
              </h1>

              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="progress-text">
                {progressPercent}% of the line processed
              </p>

              <h1
                className="queue-subtitle"
                style={{ marginTop: "15px" }}
              >
                {eventTitle}
              </h1>

                <p style={{ color: "white" }}>Tickets: {quantity}</p>
                <p style={{ color: "white" }}>Total: ${totalPrice}</p>
            </div>

            <div className="wait-time-box">
              <h3>
                Your estimated wait time:
                <span className="wait-time-minutes">
                  {" "}
                  {waitTime > 0
                    ? `${waitTime} mins`
                    : "0 mins!"}
                </span>
              </h3>
            </div>

            {isTimeUp ? (
              <button
                className="success-checkout-btn"
                onClick={onCheckout}
              >
                Proceed to Checkout
              </button>
            ) : (
              <button
                className="success-checkout-btn"
                onClick={onLeaveQueue}
              >
                Leave Queue
              </button>
            )}
          </>
        ) : (
          <div
            className="left-queue-state"
            style={{ padding: "20px 0" }}
          >
            <h2
              className="queue-subtitle"
              style={{
                fontSize: "1.4rem",
                marginBottom: "25px",
              }}
            >
              You have left the line. Your spot was released.
            </h2>

            <button
              className="success-checkout-btn"
              style={{ margin: 0 }}
              onClick={onRejoinQueue}
            >
              Rejoin Queue
            </button>
          </div>
        )}
      </div>

      <main className="content-spacer" />
      <div className="graphic-backdrop" />
    </div>
  );
}

export default Queue;