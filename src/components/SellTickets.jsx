import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import Navbar from './Navbar';

const SELL_STYLES = `
  :root {
    --fifa-bg: #0a0b10;
    --fifa-card: #141622;
    --fifa-border: #23263b;
    --fifa-neon-magenta: #ff004c;
    --fifa-neon-cyan: #00d4ff;
    --fifa-neon-green: #00ff87;
    --fifa-purple: #4a00e0;
    --fifa-text: #ffffff;
    --fifa-text-muted: #8b8e9f;
  }
  body { background-color: var(--fifa-bg); color: var(--fifa-text); margin: 0; font-family: 'Inter', sans-serif; }
  .sell-container { max-width: 1000px; margin: 0 auto; padding: 4rem 2rem; }
  .sell-header { font-size: 2.5rem; font-weight: 900; text-transform: uppercase; margin-bottom: 0.5rem; color: var(--fifa-text); }
  .sell-subtitle { color: var(--fifa-text-muted); margin-bottom: 3rem; font-size: 1.1rem; }
  .ticket-list { display: flex; flex-direction: column; gap: 1.5rem; }

  .ticket-card {
    background: var(--fifa-card);
    border: 1px solid var(--fifa-border);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    transition: border-color 0.3s;
  }
  .ticket-card:hover { border-color: var(--fifa-neon-magenta); }
  .ticket-card-top { display: flex; justify-content: space-between; align-items: center; }
  .ticket-main h2 { margin: 0 0 0.5rem 0; font-size: 1.3rem; color: var(--fifa-text); }
  .ticket-meta { color: var(--fifa-text-muted); font-size: 0.9rem; line-height: 1.8; }

  .action-tabs { display: flex; gap: 8px; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--fifa-border); }
  .tab-btn {
    flex: 1; padding: 10px; border-radius: 6px; font-size: 0.88rem; font-weight: 700;
    cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.2s;
    border: 1px solid var(--fifa-border); background: transparent; color: var(--fifa-text-muted);
  }
  .tab-btn:hover { border-color: var(--fifa-neon-cyan); color: var(--fifa-neon-cyan); }
  .tab-btn.active-sell { border-color: var(--fifa-neon-magenta); color: var(--fifa-neon-magenta); background: rgba(255,0,76,0.08); }
  .tab-btn.active-transfer { border-color: var(--fifa-neon-cyan); color: var(--fifa-neon-cyan); background: rgba(0,212,255,0.08); }

  .action-panel { margin-top: 1.2rem; padding: 1.2rem; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid var(--fifa-border); }
  .panel-label { font-size: 0.75rem; color: var(--fifa-text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }

  .sell-input-group { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .sell-input {
    background: var(--fifa-bg); border: 1px solid var(--fifa-border);
    color: white; padding: 10px 12px; border-radius: 6px;
    font-size: 1rem; font-family: inherit;
  }
  .sell-input:focus { outline: none; border-color: var(--fifa-neon-magenta); }
  .transfer-input {
    background: var(--fifa-bg); border: 1px solid var(--fifa-border);
    color: white; padding: 10px 12px; border-radius: 6px;
    font-size: 0.95rem; width: 260px; font-family: inherit;
  }
  .transfer-input:focus { outline: none; border-color: var(--fifa-neon-cyan); }

  .wc-btn-confirm-sell {
    background: var(--fifa-neon-magenta); color: white; border: none;
    padding: 11px 20px; border-radius: 6px; font-weight: 700;
    cursor: pointer; text-transform: uppercase; font-family: inherit;
    transition: background 0.2s;
  }
  .wc-btn-confirm-sell:hover { background: #d6003f; }
  .wc-btn-confirm-sell:disabled { background: #555; cursor: not-allowed; }

  .wc-btn-confirm-transfer {
    background: var(--fifa-neon-cyan); color: #0a0b10; border: none;
    padding: 11px 20px; border-radius: 6px; font-weight: 700;
    cursor: pointer; text-transform: uppercase; font-family: inherit;
    transition: background 0.2s;
  }
  .wc-btn-confirm-transfer:hover { background: #00b8d9; }
  .wc-btn-confirm-transfer:disabled { background: #555; color: #999; cursor: not-allowed; }

  .wc-btn-cancel {
    background: transparent; color: var(--fifa-text-muted); border: none;
    cursor: pointer; padding: 10px; font-family: inherit; font-size: 0.9rem;
  }
  .wc-btn-cancel:hover { color: var(--fifa-text); }

  .status-badge {
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
    padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px;
  }
  .badge-paid { background: rgba(0,255,135,0.1); color: var(--fifa-neon-green); border: 1px solid rgba(0,255,135,0.3); }
  .badge-listed { background: rgba(0,212,255,0.1); color: var(--fifa-neon-cyan); border: 1px solid rgba(0,212,255,0.3); }
  .badge-transferred { background: rgba(74,0,224,0.2); color: #a78bfa; border: 1px solid rgba(74,0,224,0.4); }

  .success-msg { color: var(--fifa-neon-green); font-size: 0.88rem; font-weight: 600; margin-top: 8px; }
  .error-msg { color: var(--fifa-neon-magenta); font-size: 0.88rem; margin-top: 8px; }
  .empty-state { text-align: center; padding: 5rem 0; color: var(--fifa-text-muted); font-size: 1.1rem; }
  .error-banner { background: rgba(255,0,76,0.1); border: 1px solid var(--fifa-neon-magenta); color: var(--fifa-neon-magenta); padding: 1rem 1.5rem; border-radius: 8px; margin-bottom: 2rem; font-size: 0.9rem; }
`;

export default function Sell() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Per-ticket UI state
  const [activePanel, setActivePanel] = useState({}); // { ticketId: 'sell' | 'transfer' | null }
  const [resalePrice, setResalePrice] = useState({});  // { ticketId: string }
  const [transferEmail, setTransferEmail] = useState({}); // { ticketId: string }
  const [actionLoading, setActionLoading] = useState({});
  const [actionMsg, setActionMsg] = useState({}); // { ticketId: { type: 'success'|'error', text } }

  useEffect(() => {
    const fetchEligibleTickets = async () => {
      const user = auth.currentUser;
      if (!user) { setLoading(false); return; }
      try {
        // Query by uid first (most reliable), fallback handled below
        const q = query(
          collection(db, "orders"),
          where("buyer.email", "==", user.email),
          where("status", "in", ["paid", "listed"])
        );
        const snap = await getDocs(q);
        const orders = [];
        snap.forEach(d => orders.push({ id: d.id, ...d.data() }));
        // Sort newest first
        orders.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setTickets(orders);
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.message?.includes('index')) {
          setFetchError("A Firestore composite index is needed. Check the browser console for a link to create it automatically — it takes 1 minute.");
        } else {
          setFetchError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchEligibleTickets();
      else setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const togglePanel = (ticketId, panel) => {
    setActivePanel(prev => ({ ...prev, [ticketId]: prev[ticketId] === panel ? null : panel }));
    setActionMsg(prev => ({ ...prev, [ticketId]: null }));
  };

  // ── List for resale ────────────────────────────────────────────────────────
  const handleSell = async (ticket) => {
    const price = parseFloat(resalePrice[ticket.id]);
    if (!price || price <= 0) {
      setActionMsg(prev => ({ ...prev, [ticket.id]: { type: 'error', text: 'Enter a valid price.' } }));
      return;
    }
    setActionLoading(prev => ({ ...prev, [ticket.id]: true }));
    try {
      await updateDoc(doc(db, "orders", ticket.id), {
        status: "listed",
        resalePrice: price,
        listedAt: new Date(),
      });
      setTickets(curr => curr.map(t => t.id === ticket.id ? { ...t, status: 'listed', resalePrice: price } : t));
      setActivePanel(prev => ({ ...prev, [ticket.id]: null }));
      setActionMsg(prev => ({ ...prev, [ticket.id]: { type: 'success', text: `Listed for $${price.toFixed(2)} ✓` } }));
    } catch (err) {
      setActionMsg(prev => ({ ...prev, [ticket.id]: { type: 'error', text: 'Failed to list. Try again.' } }));
    } finally {
      setActionLoading(prev => ({ ...prev, [ticket.id]: false }));
    }
  };

  // ── Transfer to another user ───────────────────────────────────────────────
  const handleTransfer = async (ticket) => {
    const email = (transferEmail[ticket.id] || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setActionMsg(prev => ({ ...prev, [ticket.id]: { type: 'error', text: 'Enter a valid email address.' } }));
      return;
    }
    if (email === auth.currentUser?.email?.toLowerCase()) {
      setActionMsg(prev => ({ ...prev, [ticket.id]: { type: 'error', text: "You can't transfer to yourself." } }));
      return;
    }
    if (!window.confirm(`Transfer this ticket to ${email}? This cannot be undone.`)) return;

    setActionLoading(prev => ({ ...prev, [ticket.id]: true }));
    try {
      await updateDoc(doc(db, "orders", ticket.id), {
        status: "transferred",
        transferredTo: email,
        transferredAt: new Date(),
        "buyer.email": email,
        "buyer.uid": "",
      });
      setTickets(curr => curr.filter(t => t.id !== ticket.id));
      setActionMsg(prev => ({ ...prev, [ticket.id]: { type: 'success', text: `Transferred to ${email} ✓` } }));
    } catch (err) {
      setActionMsg(prev => ({ ...prev, [ticket.id]: { type: 'error', text: 'Transfer failed. Try again.' } }));
    } finally {
      setActionLoading(prev => ({ ...prev, [ticket.id]: false }));
    }
  };

  const getTotal = (ticket) => {
    if (ticket.total != null && !isNaN(parseFloat(ticket.total))) return parseFloat(ticket.total).toFixed(2);
    const TIER_PRICES = { cat1: 850, cat2: 520, cat3: 290, hospitality: 2200 };
    const base = TIER_PRICES[ticket.tierId] || 0;
    const subtotal = base * (parseInt(ticket.qty) || 1);
    return (subtotal + subtotal * 0.12 + 4.99).toFixed(2);
  };

  return (
    <>
      <style>{SELL_STYLES}</style>
      <Navbar search="" onSearch={() => {}} />
      <div className="sell-container">
        <h1 className="sell-header">Sell Tickets</h1>
        <p className="sell-subtitle">Select a ticket from your inventory to list or transfer.</p>

        {fetchError && <div className="error-banner">⚠️ {fetchError}</div>}

        {loading ? (
          <div className="empty-state" style={{ color: 'var(--fifa-neon-cyan)' }}>
            Loading your inventory...
          </div>
        ) : !auth.currentUser ? (
          <div className="empty-state">🔒 Please log in to view and sell your tickets.</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            You don't have any available tickets to sell right now.<br />
            <span style={{ fontSize: '0.9rem', marginTop: 8, display: 'block' }}>
              Tickets appear here after a completed purchase.
            </span>
          </div>
        ) : (
          <div className="ticket-list">
            {tickets.map((ticket) => {
              const panel = activePanel[ticket.id];
              const msg = actionMsg[ticket.id];
              const busy = actionLoading[ticket.id];
              return (
                <div key={ticket.id} className="ticket-card">
                  <div className="ticket-card-top">
                    <div className="ticket-main">
                      <h2>
                        {ticket.team1 && ticket.team2
                          ? `${ticket.team1} vs ${ticket.team2}`
                          : 'FIFA World Cup 26™'}
                      </h2>
                      <div className="ticket-meta">
                        {ticket.date && <><strong>Date:</strong> {ticket.date}, 2026<br /></>}
                        {ticket.venue && <><strong>Venue:</strong> {ticket.venue}<br /></>}
                        <strong>Order ID:</strong> {ticket.internalOrderId || ticket.id}<br />
                        <strong>Category:</strong> {(ticket.tierId || 'N/A').toUpperCase()}<br />
                        <strong>Qty:</strong> {ticket.qty || 1} ticket(s)<br />
                        <strong>Paid:</strong> ${getTotal(ticket)}
                        {ticket.resalePrice != null && <><br /><strong>Listed at:</strong> ${parseFloat(ticket.resalePrice).toFixed(2)}</>}
                      </div>
                    </div>
                    <span className={`status-badge ${
                      ticket.status === 'listed' ? 'badge-listed' :
                      ticket.status === 'transferred' ? 'badge-transferred' : 'badge-paid'
                    }`}>
                      {ticket.status || 'paid'}
                    </span>
                  </div>

                  {/* ── Action tabs ── */}
                  <div className="action-tabs">
                    <button
                      className={`tab-btn ${panel === 'sell' ? 'active-sell' : ''}`}
                      onClick={() => togglePanel(ticket.id, 'sell')}
                    >
                      {ticket.status === 'listed' ? '✏️ Update price' : '💰 List for sale'}
                    </button>
                    <button
                      className={`tab-btn ${panel === 'transfer' ? 'active-transfer' : ''}`}
                      onClick={() => togglePanel(ticket.id, 'transfer')}
                    >
                      🔁 Transfer ticket
                    </button>
                  </div>

                  {/* ── Sell panel ── */}
                  {panel === 'sell' && (
                    <div className="action-panel">
                      <div className="panel-label">Set your resale price (USD)</div>
                      <div className="sell-input-group">
                        <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>$</span>
                        <input
                          type="number"
                          className="sell-input"
                          placeholder="0.00"
                          style={{ width: 110 }}
                          value={resalePrice[ticket.id] || ''}
                          onChange={e => setResalePrice(p => ({ ...p, [ticket.id]: e.target.value }))}
                          autoFocus
                        />
                        <button
                          className="wc-btn-confirm-sell"
                          onClick={() => handleSell(ticket)}
                          disabled={busy}
                        >
                          {busy ? 'Listing…' : 'Confirm listing'}
                        </button>
                        <button className="wc-btn-cancel" onClick={() => togglePanel(ticket.id, null)}>Cancel</button>
                      </div>
                      {msg && <div className={msg.type === 'success' ? 'success-msg' : 'error-msg'}>{msg.text}</div>}
                    </div>
                  )}

                  {/* ── Transfer panel ── */}
                  {panel === 'transfer' && (
                    <div className="action-panel">
                      <div className="panel-label">Transfer to another fan (enter their email)</div>
                      <div className="sell-input-group">
                        <input
                          type="email"
                          className="transfer-input"
                          placeholder="recipient@example.com"
                          value={transferEmail[ticket.id] || ''}
                          onChange={e => setTransferEmail(p => ({ ...p, [ticket.id]: e.target.value }))}
                          autoFocus
                        />
                        <button
                          className="wc-btn-confirm-transfer"
                          onClick={() => handleTransfer(ticket)}
                          disabled={busy}
                        >
                          {busy ? 'Transferring…' : 'Transfer now'}
                        </button>
                        <button className="wc-btn-cancel" onClick={() => togglePanel(ticket.id, null)}>Cancel</button>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--fifa-text-muted)', marginTop: 8 }}>
                        ⚠️ This is permanent. The ticket will move to the recipient's account.
                      </div>
                      {msg && <div className={msg.type === 'success' ? 'success-msg' : 'error-msg'}>{msg.text}</div>}
                    </div>
                  )}

                  {/* ── Standalone message (after panel closed) ── */}
                  {!panel && msg && (
                    <div className={`action-tabs ${msg.type === 'success' ? 'success-msg' : 'error-msg'}`} style={{ paddingTop: '1rem' }}>
                      {msg.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
