// src/pages/CheckoutSuccess.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import './TicketSuccess.css'; // Make sure this CSS file is saved in the same folder!

// Helper to generate sequential seats and unique ticket IDs
const generateSeats = (qty) => {
  const baseSeat = Math.floor(Math.random() * 20) + 1;
  const baseTicketId = Math.floor(Math.random() * 1000000000) + 6000000000;
  
  return Array.from({ length: qty }).map((_, i) => ({
    tier: 'Main Stand Right - Lower Tier',
    section: '119',
    row: '18',
    seat: baseSeat + i,
    ticketId: (baseTicketId + i).toString(),
  }));
};

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [orderData, setOrderData] = useState({ orderId: "", total: 0 });
  const [seats, setSeats] = useState([]);

  // Fallback match data for the UI (Since capture-order only returns orderId/total right now)
  const matchData = {
    qty: 2, // Hardcoded to 2 for the UI example
    tier: 'Category 1',
    t1: 'England',
    t2: 'Ghana',
    date: 'Tuesday, 23 June 2026',
    time: '4:00 PM EDT',
    venue: 'Boston Stadium, Massachusetts'
  };

  useEffect(() => {
    const paypalOrderId = params.get("token"); 
    if (!paypalOrderId) { setStatus("error"); return; }

    // ── CAPTURE PAYMENT VIA YOUR BACKEND ─────────────────────────────────
    fetch("http://localhost:4000/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paypalOrderId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) { 
          setOrderData({ orderId: data.orderId, total: data.total });
          setSeats(generateSeats(matchData.qty)); // Generate the seats
          setStatus("success"); 
        }
        else setStatus("error");
      })
      .catch((err) => {
        console.error("Capture error:", err);
        setStatus("error");
      });
  }, [params]);

  // ── LOADING STATE ──────────────────────────────────────────────────────
  if (status === "processing") return (
    <div className="fifa-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: "center", padding: 60, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: 24, color: "#4a2b75", fontWeight: 'bold' }}>Processing Payment...</div>
        <div style={{ fontSize: 16, color: "#555", marginTop: 10 }}>Please do not close or refresh this window.</div>
      </div>
    </div>
  );

  // ── ERROR STATE ────────────────────────────────────────────────────────
  if (status === "error") return (
    <div className="fifa-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: "center", padding: 60, background: '#fff', borderRadius: 12, border: '2px solid #e24b4a' }}>
        <div style={{ fontSize: 24, color: "#e24b4a", fontWeight: 'bold' }}>Payment Failed</div>
        <div style={{ fontSize: 16, color: "#555", marginTop: 10 }}>Something went wrong. Please check your PayPal account or contact support.</div>
      </div>
    </div>
  );

  // ── SUCCESS STATE (FIFA DASHBOARD) ─────────────────────────────────────
  return (
    <div className="fifa-dashboard">
      <div className="fifa-container">
        
        {/* Left Column: Tickets */}
        <div className="fifa-main-content">
          <div className="fifa-alert-banner">
            <span className="fifa-icon-info">ⓘ</span>
            <p>Please find below the list of all your tickets. Order Ref: <strong>{orderData.orderId}</strong></p>
          </div>

          <div className="fifa-match-card">
            <div className="fifa-match-header">
              <div className="fifa-match-title-row">
                <h2>FIFA World Cup 2026™ - Group Stage Match - {matchData.t1} vs {matchData.t2}</h2>
                <button className="fifa-calendar-btn">
                  📅 Add to calendar <span>⌄</span>
                </button>
              </div>
              <div className="fifa-match-meta">
                <span>📅 {matchData.date}</span>
                <span>🕒 Kick-off {matchData.time}</span>
                <span>🏟️ {matchData.venue}</span>
              </div>
            </div>

            <div className="fifa-ticket-subheader">
              <strong>{matchData.qty} tickets - {matchData.tier} - USD</strong>
            </div>

            <div className="fifa-ticket-list">
              {seats.map((seat, index) => (
                <div key={index} className="fifa-ticket-item">
                  <div className="fifa-ticket-top">
                    <div className="fifa-ticket-left">
                      <span className="fifa-label">Ticket Price</span>
                      <strong className="fifa-seat-info">
                        {seat.tier} - Section {seat.section} - Row {seat.row} - Seat {seat.seat}
                      </strong>
                    </div>
                    <div className="fifa-ticket-right">
                      <span className="fifa-ticket-id">Ticket {seat.ticketId}</span>
                    </div>
                  </div>
                  <div className="fifa-ticket-bottom">
                    <span className="fifa-warning-dot"></span>
                    <span className="fifa-warning-text">This ticket is not printable</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="fifa-sidebar">
          <div className="fifa-user-avatar">
            <div className="fifa-avatar-circle">N</div>
          </div>

          <nav className="fifa-side-nav">
            <a href="#my-tickets" className="active">My tickets</a>
            <a href="#resell">Resell/Transfer Tickets</a>
            <a href="#summary">Ticket purchase summary</a>
            <a href="#settings">Account settings</a>
            <a href="#profile">Profile</a>
            <a href="#buy">Buy tickets</a>
          </nav>

          {/* Promo Banners */}
          <div className="fifa-promo visa-promo">
            <h3>VISA</h3>
            <p>The Official Way to Pay</p>
          </div>
          
          <div className="fifa-promo hospitality-promo">
             <div className="hospitality-content">
               <span className="hosp-logo">🏆 FIFA</span>
               <h4>EXPLORE TICKET-INCLUSIVE HOSPITALITY</h4>
             </div>
          </div>
        </aside>

      </div>
    </div>
  );
}