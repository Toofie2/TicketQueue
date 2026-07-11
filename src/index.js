import Home from './pages/Home';
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
import JoinQueue from './pages/JoinQueue';
import UserQueueView from './pages/UserQueue';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="history" element={<History />} />
          <Route path="join" element={<JoinQueue />} />
          <Route path="queue" element={<UserQueueView />} />
          <Route index element={<Home />} />
          <Route path="event/:id" element={<EventDetails />} />
          <Route path="success" element={<PurchaseSuccess />} />
        </Route>
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
