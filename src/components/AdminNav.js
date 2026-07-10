import { NavLink, useNavigate } from "react-router-dom";

function AdminNav() {
  const navigate = useNavigate();

  return (
    <nav className="admin-nav">
      <span className="admin-nav-logo">TixQ</span>
      <div className="admin-nav-links">
        <NavLink to="/admin" end>
          Dashboard
        </NavLink>
        <NavLink to="/admin/services">Event Management</NavLink>
        <NavLink to="/admin/queue">Queue Management</NavLink>
        <button className="admin-logout-btn" onClick={() => navigate("/login")}>
          Log Out
        </button>
      </div>
    </nav>
  );
}

export default AdminNav;
