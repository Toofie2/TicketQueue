import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminNav from "./components/AdminNav";
import AdminDashboard from "./pages/AdminDashboard";
import ServiceManagement from "./pages/ServiceManagement";
import QueueManagement from "./pages/QueueManagement";
import Reporting from "./pages/Reporting";
import { initialSales, initialQueue } from "./data/adminMockData";
import "./styles/Admin.css";

function isAdmin() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload.exp && payload.exp * 1000 < Date.now()) return false;
    return payload.role === "admin";
  } catch {
    return false;
  }
}

function AdminApp() {
  const [sales, setSales] = useState(initialSales);
  const [queue, setQueue] = useState(initialQueue);

  if (!isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <AdminNav />
      <Routes>
        <Route
          index
          element={
            <AdminDashboard sales={sales} setSales={setSales} queue={queue} />
          }
        />
        <Route
          path="services"
          element={<ServiceManagement sales={sales} setSales={setSales} />}
        />
        <Route
          path="queue"
          element={
            <QueueManagement sales={sales} queue={queue} setQueue={setQueue} />
          }
        />
        <Route path="reports" element={<Reporting />} />
      </Routes>
    </>
  );
}

export default AdminApp;
