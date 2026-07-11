import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import AdminNav from "./components/AdminNav";
import AdminDashboard from "./pages/AdminDashboard";
import ServiceManagement from "./pages/ServiceManagement";
import QueueManagement from "./pages/QueueManagement";
import { initialSales, initialQueue } from "./data/adminMockData";
import "./styles/Admin.css";

function AdminApp() {
  const [sales, setSales] = useState(initialSales);
  const [queue, setQueue] = useState(initialQueue);

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
      </Routes>
    </>
  );
}

export default AdminApp;
