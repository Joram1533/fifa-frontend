// src/components/MyTickets.jsx
import React, { useEffect, useState } from 'react';

const PORTAL_STYLES = `
  .portal-body { background-color: #f5f5f4; color: #1f2937; font-family: 'Inter', sans-serif; min-height: 100vh; padding: 2rem; }
  .portal-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 300px; gap: 2rem; }
  .info-banner { background-color: #f3e8ff; color: #4c1d95; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; display: flex; align-items: center; gap: 10px; grid-column: 1 / -1; font-size: 0.95rem; }
  .ticket-group-card { background: #ffffff; border-radius: 12px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .ticket-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
  .ticket-title { font-size: 1.25rem; font-weight: 700; margin: 0; color: #111827; }
  .add-calendar-btn { background: white; border: 1px solid #d1d5db; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 6px; }
  .match-meta { display: flex; gap: 1.5rem; color: #4b5563; font-size: 0.9rem; margin-bottom: 1.5rem; }
  .ticket-count { font-weight: 700; font-size: 0.95rem; margin-bottom: 1rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; }
  .individual-ticket { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
  .ticket-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
  .ticket-label { color: #6b7280; font-size: 0.85rem; }
  .ticket-id { font-size: 0.85rem; color: #111827; }
  .ticket-seat { font-weight: 700; font-size: 0.95rem; color: #111827; margin-bottom: 1rem; }
  .unprintable-warning { display: flex; align-items: center; gap: 8px; color: #b45309; font-size: 0.85rem; font-weight: 600; }
  .warning-dot { width: 10px; height: 10px; background-color: #d97706; border-radius: 50%; }
  .sidebar { display: flex; flex-direction: column; gap: 1rem; }
  .user-avatar { width: 40px; height: 40px; background-color: #6b7280; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; align-self: flex-end; margin-bottom: 1rem; }
  .side-menu { list-style: none; padding: 0; margin: 0; }
  .side-menu li { padding: 12px 16px; font-size: 0.95rem; color: #374151; cursor: pointer; }
  .side-menu li.active { background-color: #e5e7eb; font-weight: 600; border-radius: 6px; }
  .promo-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 2rem; text-align: center; font-weight: bold; color: #1d4ed8; }
  .hospitality-box { background: #2e1065; color: white; border-radius: 8px; padding: 2rem 1rem; text-align: center; height: 300px; display: flex; flex-direction: column; justify-content: center; }
`;

export default function MyTickets() {
  const [purchaseData, setPurchaseData] = useState(null);

  // Grab the ticket data from local storage when the tab opens
  useEffect(() => {
    const savedData = localStorage.getItem('recentPurchase');
    if (savedData) {
      setPurchaseData(JSON.parse(savedData));
    }
  }, []);

  if (!purchaseData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>No recent purchases found.</h2>
      </div>
    );
  }

  return (
    <>
      <style>{PORTAL_STYLES}</style>
      <div className="portal-body">
        <div className="portal-container">
          
          <div className="info-banner">
            <span>ⓘ</span>
            Please find below the list of all your tickets. For more information, please check your ticket resale history.
          </div>

          <div>
            <div className="ticket-group-card">
              <div className="ticket-header">
                {/* 🛑 DYNAMIC TITLE */}
                <h2 className="ticket-title">
                  FIFA World Cup 2026™ - {purchaseData.team1} vs {purchaseData.team2}
                </h2>
                <button className="add-calendar-btn">📅 Add to calendar ⌄</button>
              </div>

              <div className="match-meta">
                {/* 🛑 DYNAMIC DETAILS */}
                <span>📅 {purchaseData.date}, 2026</span>
                <span>🏟️ {purchaseData.venue}, {purchaseData.city}</span>
              </div>

              <div className="ticket-count">
                {purchaseData.quantity} tickets - Category 1 - USD
              </div>

              {/* 🛑 DYNAMIC TICKET RENDERER based on quantity */}
              {Array.from({ length: purchaseData.quantity }).map((_, index) => (
                <div className="individual-ticket" key={index}>
                  <div className="ticket-row">
                    <span className="ticket-label">Ticket Price</span>
                    <span className="ticket-id">Ticket {purchaseData.ticketIds[index]}</span>
                  </div>
                  <div className="ticket-seat">
                    Main Stand Right - Lower Tier - Section 119 - Row 18 - Seat {index + 4}
                  </div>
                  <div className="unprintable-warning">
                    <span className="warning-dot"></span>
                    This ticket is not printable
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div className="user-avatar">N</div>
            <ul className="side-menu">
              <li className="active">My tickets</li>
              <li>Resell/Transfer Tickets</li>
              <li>Ticket purchase summary</li>
              <li>Account settings</li>
              <li>Profile</li>
              <li>Buy tickets</li>
            </ul>
            <div className="promo-box">
              <span style={{fontSize: '1.5rem', fontStyle: 'italic'}}>VISA</span>
              <div style={{fontSize: '0.75rem', color: '#6b7280'}}>The Official Way to Pay</div>
            </div>
            <div className="hospitality-box">
              <div style={{fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem'}}>
                EXPLORE<br/>TICKET-INCLUSIVE<br/>HOSPITALITY
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}