import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import PurchaseSuccess from './pages/PurchaseSuccess';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AdminApp from './AdminApp';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import CartView from './pages/CartView';
import Checkout from './pages/Checkout';
import UserQueueView from './pages/UserQueue';
import KickedFromQueue from './pages/KickedFromQueue';
import Help from './pages/Help';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="login" element={<Login />} />
          <Route path="help" element={<Help />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="history" element={<History />} />
          <Route path="cart" element={<CartView />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="queue" element={<UserQueueView />} />
          <Route path="kicked" element={<KickedFromQueue />} />
          <Route index element={<Home />} />
          <Route path="events" element={<Events />} />
          <Route path="event/:id" element={<EventDetails />} />
          <Route path="success" element={<PurchaseSuccess />} />
        </Route>
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
