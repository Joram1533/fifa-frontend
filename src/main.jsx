import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import App from './App.jsx'
import Sell from './components/Sell.jsx'
import MyTickets from './components/MyTickets.jsx'
import Success from './components/Success.jsx'  // ✅ ADDED

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"                 element={<App />} />
        <Route path="/sell"             element={<Sell />} />
        <Route path="/my-tickets"       element={<MyTickets />} />
        <Route path="/checkout/success" element={<Success />} />  {/* ✅ ADDED */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
