import { NavLink } from "react-router-dom";

function AdminNav() {
  return (
    <nav className="admin-nav">
      <span className="admin-nav-logo">TixQ</span>
      <div className="admin-nav-links">
        <NavLink to="/admin" end>
          Dashboard
        </NavLink>
        <NavLink to="/admin/services">Event Management</NavLink>
        <NavLink to="/admin/queue">Queue Management</NavLink>
      </div>
    </nav>
  );
}

export default AdminNav;
