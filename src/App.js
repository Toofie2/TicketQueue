import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminNav from "./components/AdminNav";
import AdminDashboard from "./pages/AdminDashboard";
import ServiceManagement from "./pages/ServiceManagement";
import QueueManagement from "./pages/QueueManagement";
import { initialSales, initialQueue } from "./data/adminMockData";
import "./styles/Admin.css";

function App() {
  const [sales, setSales] = useState(initialSales);
  const [queue, setQueue] = useState(initialQueue);

  return (
    <BrowserRouter>
      <AdminNav />
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route
          path="/admin"
          element={<AdminDashboard sales={sales} queue={queue} />}
        />
        <Route
          path="/admin/services"
          element={<ServiceManagement sales={sales} setSales={setSales} />}
        />
        <Route
          path="/admin/queue"
          element={
            <QueueManagement sales={sales} queue={queue} setQueue={setQueue} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
