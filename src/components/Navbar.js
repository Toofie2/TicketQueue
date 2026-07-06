import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="country">US</span>
      </div>

      <div className="navbar-logo">TixQ</div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/help">Help</Link>
        <Link to="/cart">My Cart</Link>
        <span className="divider">|</span>
        <span>Hello User2174!</span>
        <span className="user-icon">👤</span>
      </div>
    </nav>
  );
}

export default Navbar;