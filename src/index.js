import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import JoinQueue from './pages/JoinQueue';
import CartView from './pages/CartView';
import UserQueueView from './pages/UserQueue';
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
          <Route path="join" element={<JoinQueue />} />
          <Route path="queue" element={<UserQueueView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
