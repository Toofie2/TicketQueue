import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import EventDetails from "./pages/EventDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/event/:id" element={<EventDetails />} />
      <Route path="/success" element={<PurchaseSuccess />} />
    </Routes>
  );
}

export default App;