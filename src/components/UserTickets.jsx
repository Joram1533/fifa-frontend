// src/components/MyTickets.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import Navbar from "./Navbar";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getAvatarInitial() {
  const user = auth.currentUser;
  if (!user) return "?";
  if (user.displayName) return user.displayName.charAt(0).toUpperCase();
  if (user.email)       return user.email.charAt(0).toUpperCase();
  return "?";
}

function getAvatarColor() {
  const user   = auth.currentUser;
  const colors = ["#4a00e0", "#e0007a", "#007ae0", "#00a86b", "#e07a00"];
  if (!user?.email) return colors[0];
  return colors[user.email.charCodeAt(0) % colors.length];
}

// ── Purchase Summary Modal ────────────────────────────────────────────────────
function SummaryModal({ purchaseData, onClose }) {
  const FEES       = { service: 0.12, booking: 4.99 };
  const tierPrices = { cat1: 850, cat2: 520, cat3: 290, hospitality: 2200 };
  const basePrice  = tierPrices[purchaseData.tierId] || 520;
  const subtotal   = basePrice * purchaseData.quantity;
  const service    = subtotal * FEES.service;
  const total      = subtotal + service + FEES.booking;
  const fmt        = n => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>Purchase Summary</h2>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>
        <div style={{ background: "#f9fafb", borderRadius: 10, padding: "1rem", marginBottom: "1rem", fontSize: "0.9rem" }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: "#111827" }}>{purchaseData.team1} vs {purchaseData.team2}</div>
          <div style={{ color: "#6b7280" }}>{purchaseData.date}, 2026 · {purchaseData.venue}</div>
        </div>
        {[
          { label: `${purchaseData.tierLabel || "Category"} × ${purchaseData.quantity}`, value: fmt(subtotal) },
          { label: "Service fee (12%)",                                                   value: fmt(service)  },
          { label: "Booking fee",                                                          value: fmt(FEES.booking) },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: "0.9rem", color: "#374151" }}>
            <span>{row.label}</span><span>{row.value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
          <span>Total paid</span>
          <span style={{ color: "#4a00e0" }}>{fmt(total)}</span>
        </div>
        <div style={{ marginTop: "1rem", background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: "#166534" }}>
          ✅ Payment confirmed via PayPal · Order ID: {purchaseData.internalOrderId || "N/A"}
        </div>
        <button onClick={onClose} style={{ width: "100%", marginTop: "1.2rem", padding: "11px 0", background: "#4a00e0", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}>
          Close
        </button>
      </div>
    </div>
  );
}

// ── Profile Modal ─────────────────────────────────────────────────────────────
function ProfileModal({ onClose }) {
  const user    = auth.currentUser;
  const initial = getAvatarInitial();
  const color   = getAvatarColor();

  const handleSignOut = async () => {
    await auth.signOut();
    onClose();
    window.location.href = "/";
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 700, margin: "0 auto 1rem" }}>
          {initial}
        </div>
        <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#111827", marginBottom: 4 }}>{user?.displayName || "FIFA Account"}</div>
        <div style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.5rem" }}>{user?.email}</div>
        <div style={{ background: "#f9fafb", borderRadius: 10, padding: "1rem", fontSize: "0.85rem", color: "#374151", textAlign: "left", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "#6b7280" }}>Account ID</span>
            <span style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{user?.uid?.slice(0, 12)}…</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6b7280" }}>Member since</span>
            <span>{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}</span>
          </div>
        </div>
        <button onClick={handleSignOut} style={{ width: "100%", padding: "11px 0", background: "#fff", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MyTickets() {
  const [purchaseData,  setPurchaseData]  = useState(null);
  const [allTickets,    setAllTickets]    = useState([]);   // all Firestore orders
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState("tickets");
  const [showProfile,   setShowProfile]   = useState(false);
  const [copiedId,      setCopiedId]      = useState(null);
  const navigate      = useNavigate();
  const avatarInitial = getAvatarInitial();
  const avatarColor   = getAvatarColor();

  // ── Load data: merge localStorage + Firestore so TBD never shows ─────────
  useEffect(() => {
    let cancelled = false;

    // Read recentPurchase from localStorage (has real match data when fresh)
    const getLocalData = () => {
      try {
        const raw = localStorage.getItem("recentPurchase");
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    };

    const fetchAllFromFirestore = async () => {
      // Wait for Firebase auth if needed
      let email = auth.currentUser?.email;
      if (!email) {
        await new Promise(r => setTimeout(r, 1500));
        email = auth.currentUser?.email;
      }
      if (!email) return [];

      try {
        const q = query(
          collection(db, "orders"),
          where("buyer.email", "==", email),
          where("status", "==", "paid")
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => {
          const dd = d.data();
          return {
            id:              d.id,
            internalOrderId: dd.internalOrderId || d.id,
            team1:           dd.team1     || "TBD",
            team2:           dd.team2     || "TBD",
            date:            dd.date      || "Unknown date",
            venue:           dd.venue     || "Unknown venue",
            city:            dd.city      || "Unknown city",
            tierId:          dd.tierId    || "cat1",
            tierLabel:       dd.tierLabel || "Category 1",
            quantity:        dd.qty       || 1,
            ticketIds:       dd.ticketIds || [],
            buyer:           dd.buyer     || {},
            paypalOrderId:   dd.paypalOrderId || "",
          };
        });
      } catch (err) {
        console.error("Firestore fetch error:", err);
        return [];
      }
    };

    const load = async () => {
      const localData  = getLocalData();
      const firestoreOrders = await fetchAllFromFirestore();

      if (cancelled) return;

      // ── Merge: patch any Firestore order that has TBD with localStorage data ──
      // localStorage holds the most recently purchased ticket's real match data.
      const merged = firestoreOrders.map(order => {
        const hasTBD = order.team1 === "TBD" || order.team2 === "TBD" ||
                       order.venue === "Unknown venue";

        // If this order's ID matches localStorage, use local data for match fields
        if (hasTBD && localData &&
            (localData.internalOrderId === order.internalOrderId ||
             localData.paypalOrderId   === order.paypalOrderId)) {
          return {
            ...order,
            team1:    localData.team1  || order.team1,
            team2:    localData.team2  || order.team2,
            date:     localData.date   || order.date,
            venue:    localData.venue  || order.venue,
            city:     localData.city   || order.city,
          };
        }
        return order;
      });

      // Also prepend localStorage record if it doesn't exist in Firestore yet
      // (e.g. page opened before Firestore write completed)
      if (localData && localData.team1 !== "TBD") {
        const alreadyIn = merged.some(o =>
          o.internalOrderId === localData.internalOrderId ||
          o.paypalOrderId   === localData.paypalOrderId
        );
        if (!alreadyIn) {
          merged.unshift({ ...localData, id: localData.internalOrderId });
        }
      }

      // Filter out bad old records with TBD data
      const clean = merged.filter(o =>
        o.team1 !== "TBD" && o.team2 !== "TBD" && o.venue !== "Unknown venue"
      );
      setAllTickets(clean);

      // Primary display = most recently purchased (last in Firestore, or local)
      const primary = clean.length > 0
        ? clean[clean.length - 1]
        : localData;

      if (primary) setPurchaseData(primary);
      setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const STYLES = `
    * { box-sizing: border-box; }
    .portal-body { background: #fdf8f0; color: #1f2937; font-family: 'Inter', -apple-system, sans-serif; min-height: 100vh; }
    .portal-wrap { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .portal-grid { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; }
    @media (max-width: 768px) { .portal-grid { grid-template-columns: 1fr; } }
    .info-banner { background: #f3e8ff; color: #4c1d95; padding: 1rem 1.2rem; border-radius: 10px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px; grid-column: 1 / -1; font-size: 0.9rem; border: 1px solid #e9d5ff; }
    .ticket-card { background: #fffdf7; border-radius: 14px; padding: 2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #e8dfc8; transition: box-shadow 0.2s; animation: fadeIn 0.4s ease; }
    .ticket-card:hover { box-shadow: 0 4px 20px rgba(74,0,224,0.08); }
    .ticket-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; gap: 1rem; }
    .ticket-title { font-size: 1.15rem; font-weight: 700; margin: 0; color: #111827; line-height: 1.4; }
    .cal-btn { background: #fffdf7; border: 1px solid #d1c9b0; padding: 7px 13px; border-radius: 8px; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; transition: background 0.15s; color: #374151; font-family: inherit; }
    .cal-btn:hover { background: #f5efe0; }
    .match-meta { display: flex; gap: 1.5rem; color: #6b7280; font-size: 0.88rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .ticket-count-row { font-weight: 700; font-size: 0.95rem; margin-bottom: 1.2rem; padding-top: 1.2rem; border-top: 1px solid #e8dfc8; color: #374151; }
    .individual-ticket { border: 1px solid #e8dfc8; border-radius: 10px; padding: 1.5rem; margin-bottom: 1rem; background: #fdf6e8; transition: border-color 0.2s, background 0.2s; animation: slideUp 0.3s ease both; }
    .individual-ticket:hover { border-color: #c4b5fd; background: #fdf4ff; }
    .ticket-label { color: #9ca3af; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
    .ticket-id-text { font-size: 0.88rem; font-weight: 600; color: #111827; font-family: monospace; letter-spacing: 0.5px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .ticket-id-text:hover { color: #4a00e0; }
    .ticket-seat { font-weight: 700; font-size: 0.9rem; color: #111827; margin: 10px 0 8px; }
    .unprintable { display: flex; align-items: center; gap: 8px; color: #b45309; font-size: 0.82rem; font-weight: 600; }
    .warn-dot { width: 8px; height: 8px; background: #d97706; border-radius: 50%; flex-shrink: 0; }
    .copy-toast { font-size: 0.78rem; color: #059669; font-weight: 600; animation: fadeIn 0.2s ease; }
    .sidebar { display: flex; flex-direction: column; gap: 1rem; }
    .avatar-btn { width: 44px; height: 44px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; align-self: flex-end; font-size: 1rem; cursor: pointer; border: none; transition: transform 0.15s, box-shadow 0.15s; }
    .avatar-btn:hover { transform: scale(1.08); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .side-menu { list-style: none; padding: 0; margin: 0; background: #fffdf7; border-radius: 12px; border: 1px solid #e8dfc8; overflow: hidden; }
    .side-menu li { padding: 13px 18px; font-size: 0.92rem; color: #374151; cursor: pointer; transition: background 0.15s, color 0.15s; border-bottom: 1px solid #f0e8d8; display: flex; align-items: center; gap: 10px; }
    .side-menu li:last-child { border-bottom: none; }
    .side-menu li:hover { background: #f5f3ff; color: #4a00e0; }
    .side-menu li.active { background: #ede9fe; color: #4a00e0; font-weight: 700; }
    .promo-box { background: #fffdf7; border: 1px solid #e8dfc8; border-radius: 12px; padding: 1.5rem; text-align: center; font-weight: 800; color: #1d4ed8; font-size: 1.4rem; font-style: italic; }
    .hospitality-box { background: linear-gradient(160deg, #2e1065, #4a00e0); color: white; border-radius: 12px; padding: 2rem 1.5rem; text-align: center; display: flex; flex-direction: column; justify-content: center; min-height: 200px; cursor: pointer; transition: transform 0.2s; }
    .hospitality-box:hover { transform: translateY(-2px); }
    .back-bar { max-width: 1200px; margin: 0 auto; padding: 1.5rem 2rem 0; }
    .back-link { background: none; border: none; color: #6b7280; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 0; font-family: inherit; }
    .back-link:hover { color: #1f2937; }
    .loading-box { padding: 5rem; text-align: center; }
    .spinner { width: 40px; height: 40px; border: 4px solid #e8dfc8; border-top: 4px solid #4a00e0; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.2rem; }
    .all-orders-list { display: flex; flex-direction: column; gap: 1rem; }
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  `;

  // ── Tab content ───────────────────────────────────────────────────────────
  const renderTicketCard = (pd, idx = 0) => (
    <div className="ticket-card" key={pd.internalOrderId || idx} style={idx > 0 ? { marginTop: "1rem" } : {}}>
      <div className="ticket-header">
        <h2 className="ticket-title">
          FIFA World Cup 2026™ — {pd.team1} vs {pd.team2}
        </h2>
        <button
          className="cal-btn"
          onClick={() => {
            const dateStr = `${pd.date} 2026`;
            const d       = new Date(dateStr);
            const iso     = isNaN(d) ? "" : d.toISOString().replace(/-|:|\.\d+/g, "");
            window.open(
              `https://calendar.google.com/calendar/render?action=TEMPLATE` +
              `&text=FIFA+WC+${encodeURIComponent(pd.team1)}+vs+${encodeURIComponent(pd.team2)}` +
              `&dates=${iso}/${iso}` +
              `&location=${encodeURIComponent(pd.venue)}`,
              "_blank"
            );
          }}
        >
          📅 Add to calendar
        </button>
      </div>

      <div className="match-meta">
        <span>📅 {pd.date}{pd.date?.includes("2026") ? "" : ", 2026"}</span>
        <span>🏟️ {pd.venue}</span>
        <span>📍 {pd.city}</span>
      </div>

      <div className="ticket-count-row">
        {pd.quantity} ticket{pd.quantity !== 1 ? "s" : ""} · {pd.tierLabel || "Category 1"} · USD
      </div>

      {Array.from({ length: pd.quantity }).map((_, i) => {
        const ticketId = pd.ticketIds?.[i] ?? `TKT-${i}`;
        const isCopied = copiedId === ticketId;
        return (
          <div className="individual-ticket" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="ticket-label">Ticket ID</div>
            <div className="ticket-id-text" onClick={() => copyToClipboard(ticketId, ticketId)} title="Click to copy">
              {ticketId}
              {isCopied
                ? <span className="copy-toast">✓ Copied!</span>
                : <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>⎘</span>}
            </div>
            <div className="ticket-seat">Main Stand Right · Lower Tier · Section 119 · Row 18 · Seat {i + 4}</div>
            <div className="unprintable"><span className="warn-dot" />Not printable — mobile entry only</div>
          </div>
        );
      })}
    </div>
  );

  const renderMain = () => {
    // ── My Tickets tab ──────────────────────────────────────────────────────
    if (activeTab === "tickets") {
      // Show all Firestore orders if available, otherwise fall back to single purchaseData
      const list = allTickets.length > 0 ? allTickets : (purchaseData ? [purchaseData] : []);
      if (list.length === 0) return (
        <div className="ticket-card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎫</div>
          <h3 style={{ color: "#111827", margin: "0 0 8px" }}>No tickets yet</h3>
          <p style={{ color: "#6b7280" }}>Browse matches and buy your first ticket!</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "1rem", padding: "10px 24px", background: "#4a00e0", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
            Browse matches
          </button>
        </div>
      );
      return <div className="all-orders-list">{list.map((t, i) => renderTicketCard(t, i))}</div>;
    }

    // ── Resell / Transfer tab ───────────────────────────────────────────────
    if (activeTab === "resell") return (
      <div className="ticket-card" style={{ animation: "fadeIn 0.3s ease", textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔄</div>
        <h3 style={{ marginTop: 0, color: "#111827" }}>Resell or Transfer Tickets</h3>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          List your tickets on the official resale marketplace or transfer them to another fan.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{ padding: "12px 28px", background: "#4a00e0", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}
        >
          Go to Transfer Portal →
        </button>
      </div>
    );

    // ── Purchase Summary tab ────────────────────────────────────────────────
    if (activeTab === "summary") {
      const pd = purchaseData;
      if (!pd) return <div className="ticket-card" style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>No purchase data found.</div>;

      const FEES       = { service: 0.12, booking: 4.99 };
      const tierPrices = { cat1: 850, cat2: 520, cat3: 290, hospitality: 2200 };
      const basePrice  = tierPrices[pd.tierId] || 520;
      const subtotal   = basePrice * pd.quantity;
      const service    = subtotal * FEES.service;
      const total      = subtotal + service + FEES.booking;
      const fmt        = n => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

      return (
        <div className="ticket-card" style={{ animation: "fadeIn 0.3s ease" }}>
          <h3 style={{ marginTop: 0, color: "#111827" }}>Purchase Summary</h3>
          <div style={{ background: "#fdf6e8", borderRadius: 10, padding: "1rem", marginBottom: "1rem", fontSize: "0.9rem" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{pd.team1} vs {pd.team2}</div>
            <div style={{ color: "#6b7280" }}>{pd.date}, 2026 · {pd.venue}</div>
          </div>
          {[
            { label: `${pd.tierLabel || "Category"} × ${pd.quantity}`, value: fmt(subtotal) },
            { label: "Service fee (12%)",                               value: fmt(service)  },
            { label: "Booking fee",                                     value: fmt(FEES.booking) },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e8dfc8", fontSize: "0.9rem", color: "#374151" }}>
              <span>{row.label}</span><span>{row.value}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", fontWeight: 700, fontSize: "1.05rem", color: "#111827" }}>
            <span>Total paid</span>
            <span style={{ color: "#4a00e0" }}>{fmt(total)}</span>
          </div>
          <div style={{ marginTop: "1rem", background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem", color: "#166534" }}>
            ✅ Payment confirmed via PayPal · Order ID: {pd.internalOrderId || "N/A"}
          </div>
        </div>
      );
    }

    // ── Account Settings tab ────────────────────────────────────────────────
    if (activeTab === "settings") return (
      <div className="ticket-card" style={{ animation: "fadeIn 0.3s ease" }}>
        <h3 style={{ marginTop: 0, color: "#111827" }}>Account Settings</h3>
        <div style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Manage your FIFA account preferences.</div>
        {[
          { label: "Email notifications", desc: "Receive updates about your tickets",  checked: true  },
          { label: "SMS alerts",           desc: "Match day reminders via SMS",          checked: false },
          { label: "Marketing emails",     desc: "FIFA news and exclusive offers",       checked: false },
        ].map(setting => (
          <div key={setting.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid #e8dfc8" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>{setting.label}</div>
              <div style={{ fontSize: "0.82rem", color: "#9ca3af" }}>{setting.desc}</div>
            </div>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: setting.checked ? "#4a00e0" : "#d1d5db", position: "relative", cursor: "pointer" }}>
              <div style={{ position: "absolute", top: 3, left: setting.checked ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
          </div>
        ))}
      </div>
    );

    return null;
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{STYLES}</style>
      <div className="portal-body">
        <div className="back-bar">
          <button className="back-link" onClick={() => navigate("/")}>← Back to matches</button>
        </div>
        <div className="loading-box">
          <div className="spinner" />
          <p style={{ color: "#4a00e0", fontWeight: 600 }}>Loading your tickets...</p>
        </div>
      </div>
    </>
  );

  // ── No data state ─────────────────────────────────────────────────────────
  if (!purchaseData && allTickets.length === 0) return (
    <>
      <style>{STYLES}</style>
      <div className="portal-body">
        <div className="back-bar">
          <button className="back-link" onClick={() => navigate("/")}>← Back to matches</button>
        </div>
        <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎫</div>
          <h2 style={{ color: "#111827" }}>No purchases found</h2>
          <p style={{ color: "#6b7280" }}>If you just completed a purchase, please wait a moment and refresh.</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "1rem", padding: "12px 28px", background: "#4a00e0", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
            Browse matches
          </button>
        </div>
      </div>
    </>
  );

  // ── Full page ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      <div className="portal-body">
        <div className="back-bar">
          <button className="back-link" onClick={() => navigate("/")}>← Back to matches</button>
        </div>

        <div className="portal-wrap">
          <div className="portal-grid">
            <div className="info-banner">
              <span>ⓘ</span>
              Below are all your tickets. For transfers or resales, use the Resell / Transfer tab.
            </div>

            <div>{renderMain()}</div>

            <div className="sidebar">
              <button
                className="avatar-btn"
                style={{ background: avatarColor }}
                onClick={() => setShowProfile(true)}
                title="View profile"
              >
                {avatarInitial}
              </button>

              <ul className="side-menu">
                {[
                  { key: "tickets",  icon: "🎫", label: "My tickets"         },
                  { key: "resell",   icon: "🔄", label: "Resell / Transfer"  },
                  { key: "summary",  icon: "🧾", label: "Purchase summary"   },
                  { key: "settings", icon: "⚙️", label: "Account settings"   },
                  { key: "profile",  icon: "👤", label: "Profile"            },
                  { key: "buy",      icon: "➕", label: "Buy tickets"        },
                ].map(item => (
                  <li
                    key={item.key}
                    className={activeTab === item.key ? "active" : ""}
                    onClick={() => {
                      if      (item.key === "buy")     navigate("/");
                      else if (item.key === "profile") setShowProfile(true);
                      else                             setActiveTab(item.key);
                    }}
                  >
                    <span style={{ width: 20, textAlign: "center" }}>{item.icon}</span>
                    {item.label}
                  </li>
                ))}
              </ul>

              <div className="promo-box">
                <div>VISA</div>
                <div style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 400, fontStyle: "normal", marginTop: 4 }}>
                  The Official Way to Pay
                </div>
              </div>

              <div className="hospitality-box" onClick={() => alert("Hospitality packages coming soon!")}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: 2, opacity: 0.6, textTransform: "uppercase", marginBottom: 10 }}>
                  Upgrade your experience
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 900, lineHeight: 1.3 }}>
                  EXPLORE<br />TICKET-INCLUSIVE<br />HOSPITALITY
                </div>
                <div style={{ marginTop: 16, background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 16px", fontSize: "0.82rem", fontWeight: 600 }}>
                  Learn more →
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}