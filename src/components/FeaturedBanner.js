import "../styles/FeaturedBanner.css";

function FeaturedBanner() {
  return (
    <section className="featured-section">
      <h2>Featured</h2>

      <div className="featured-banner">
        <div className="featured-text">
          <p className="featured-small">World Cup 2026</p>
          <h1>FINAL</h1>
          <p className="featured-location">Houston • July 19, 2026</p>
        </div>
      </div>
    </section>
  );
}

export default FeaturedBanner;