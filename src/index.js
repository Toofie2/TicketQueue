import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserQueue from './pages/UserQueue';
import './index.css';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/queue" element={<UserQueue />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
