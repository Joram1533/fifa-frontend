// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import './index.css'
import App from './App.jsx'
import MyTickets from './components/mytickets.jsx'
import Success from './components/success.jsx' // 🔥 Imported the new Success bridge

// ── ROUTER SETUP: Controls which page loads based on the URL ──
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Your main ticketing store
  },
  {
    path: "/my-tickets",
    element: <MyTickets />, // The new light-mode portal
  },
  {
    path: "/checkout/success", // 🔥 This perfectly matches your backend PayPal return URL
    element: <Success />, 
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)