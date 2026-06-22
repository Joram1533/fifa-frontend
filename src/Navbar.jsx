// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase'; // 🔥 Imported db for Firestore
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'; // 🔥 Added Firestore functions
import AuthModal from './AuthModal';

export default function Navbar({ search, onSearch }) {
  const [user,        setUser]        = useState(null);
  const [authReady,   setAuthReady]   = useState(false);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [transferOpen, setTransferOpen] = useState(false); 
  const menuRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut(auth);
  };

  const handleExploreClick = (e) => {
    e.preventDefault();
    const target = document.getElementById('explore');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSellClick = (e) => {
    e.preventDefault();
    if (!user) {
      alert("🔒 Please sign in to access your tickets for transfer.");
      setModalOpen(true);
    } else {
      setTransferOpen(true);
    }
  };

  const greeting = user
    ? (user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'You')
    : '';

  const avatarLetter = user
    ? (user.displayName?.[0] || user.email?.[0] || '?').toUpperCase()
    : '';

  return (
    <>
      <header style={s.header}>
        <div style={s.logo}>Fifa Tickets</div>

        <div style={s.searchWrap}>
          <span style={s.searchIcon}>⌕</span>
          <input
            type="text"
            style={s.searchInput}
            placeholder="Search teams, venues, cities…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <nav style={s.nav}>
          <a href="#explore" onClick={handleExploreClick} style={s.navLink}>Explore</a>
          <a href="#sell" onClick={handleSellClick} style={s.navLink}>Sell</a>

          {authReady && (
            user ? (
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  style={s.avatarBtn}
                  aria-label="Account menu"
                >
                  <span style={s.avatar}>{avatarLetter}</span>
                  <span style={s.avatarName}>{greeting}</span>
                  <span style={{ fontSize: 10, color: '#888', marginLeft: 2 }}>▾</span>
                </button>

                {menuOpen && (
                  <div style={s.dropdown}>
                    <div style={s.dropdownEmail}>{user.email}</div>
                    <hr style={s.dropdownDivider} />
                    <button style={s.dropdownItem} onClick={() => { setMenuOpen(false); setTransferOpen(true); }}>
                      My tickets
                    </button>
                    <button style={s.dropdownItem} onClick={() => setMenuOpen(false)}>
                      Account settings
                    </button>
                    <hr style={s.dropdownDivider} />
                    <button
                      style={{ ...s.dropdownItem, color: '#9b2626' }}
                      onClick={handleSignOut}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                style={s.signInBtn}
                onClick={() => setModalOpen(true)}
              >
                Sign in
              </button>
            )
          )}
        </nav>
      </header>

      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      
      {/* Transfer Portal */}
      <TransferModal isOpen={transferOpen} onClose={() => setTransferOpen(false)} user={user} />
    </>
  );
}

// ── TRANSFER MODAL (Sell / Transfer Portal) ──────────────────────────────────
function TransferModal({ isOpen, onClose, user }) {
  const [step, setStep] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: 'Kenya' });
  
  // 🔥 Real Firebase State
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 🔥 Fetch the user's actual paid tickets from Firestore when the modal opens
  useEffect(() => {
    const fetchTickets = async () => {
      if (!isOpen || !user?.email) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "orders"), 
          where("buyer.email", "==", user.email),
          where("status", "==", "paid") // Only show successfully paid tickets
        );
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMyTickets(fetched);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSelect = (ticket) => {
    setSelectedTicket(ticket);
    setStep(2);
  };

  // 🔥 Push the transfer update to Firestore
  const submitTransfer = async () => {
    if (!form.name || !form.email || !form.phone) {
      alert("Please fill out all fields.");
      return;
    }
    
    setProcessing(true);
    try {
      const ticketRef = doc(db, "orders", selectedTicket.id);
      
      await updateDoc(ticketRef, {
        status: "transferred",
        transferredTo: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          country: form.country,
          transferDate: new Date().toISOString()
        }
      });

      alert(`✅ Transfer successful! Ownership has been transferred to ${form.name}.`);
      setStep(1);
      setForm({ name: '', email: '', phone: '', country: 'Kenya' });
      onClose();
    } catch (err) {
      console.error("Transfer failed:", err);
      alert("❌ Transfer failed. Ensure your Firestore security rules allow updates.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#141622', border: '1px solid #23263b', borderRadius: 14, width: '100%', maxWidth: 480, padding: 24, color: '#fff', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#00d4ff', fontWeight: 700 }}>
            {step === 1 ? "My Tickets" : "Transfer Ticket"}
          </h2>
          <button onClick={() => { setStep(1); onClose(); }} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        {step === 1 && (
          <div>
            <p style={{ color: '#8b8e9f', fontSize: '0.9rem', marginBottom: 16 }}>Select a ticket to securely transfer ownership.</p>
            
            {/* 🔥 Real Data Rendering */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#00d4ff' }}>Loading your secure inventory...</div>
            ) : myTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#8b8e9f', border: '1px dashed #23263b', borderRadius: 8 }}>
                No active tickets found for {user.email}.
              </div>
            ) : (
              myTickets.map(t => (
                <div key={t.id} style={{ border: '1px solid #23263b', borderRadius: 8, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>Order: {t.internalOrderId}</div>
                    <div style={{ fontSize: '0.85rem', color: '#8b8e9f', textTransform: 'uppercase' }}>
                      {t.tierId} Ticket · Qty: {t.qty}
                    </div>
                  </div>
                  <button onClick={() => handleSelect(t)} style={{ background: '#4a00e0', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>
                    Transfer
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {step === 2 && selectedTicket && (
          <div>
            <div style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', padding: 12, borderRadius: 8, marginBottom: 20 }}>
              <div style={{ fontSize: '0.8rem', color: '#00d4ff', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Selected Ticket</div>
              <div style={{ fontWeight: 600 }}>Order ID: {selectedTicket.internalOrderId} ({selectedTicket.tierId} x{selectedTicket.qty})</div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b8e9f', marginBottom: 6 }}>Recipient Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #23263b', background: '#0a0b10', color: '#fff', boxSizing: 'border-box' }} />
            </div>
            
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b8e9f', marginBottom: 6 }}>Recipient Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #23263b', background: '#0a0b10', color: '#fff', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b8e9f', marginBottom: 6 }}>Country</label>
                <select value={form.country} onChange={e => setForm({...form, country: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #23263b', background: '#0a0b10', color: '#fff' }}>
                  {["Kenya", "United States", "Canada", "UK", "Brazil", "Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#8b8e9f', marginBottom: 6 }}>Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #23263b', background: '#0a0b10', color: '#fff', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} disabled={processing} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid #23263b', color: '#fff', borderRadius: 6, cursor: processing ? 'not-allowed' : 'pointer' }}>Back</button>
              <button onClick={submitTransfer} disabled={processing} style={{ flex: 2, padding: 12, background: '#4a00e0', border: 'none', color: '#fff', borderRadius: 6, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }}>
                {processing ? "Processing..." : "Confirm Transfer"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = {
  header: {
    position: 'sticky', top: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '12px 24px',
    background: '#fff', borderBottom: '1px solid #e0e0e0',
  },
  logo: {
    fontSize: '1.5rem', fontWeight: 900,
    color: '#00d4ff', flexShrink: 0, letterSpacing: '-1px',
  },
  searchWrap: {
    flex: 1, display: 'flex', alignItems: 'center',
    background: '#f5f5f5', border: '1px solid #e0e0e0',
    borderRadius: 20, padding: '0 14px', gap: 8,
  },
  searchIcon: { fontSize: '1.1rem', color: '#888', lineHeight: 1 },
  searchInput: {
    flex: 1, border: 'none', background: 'transparent',
    padding: '8px 0', fontSize: '0.85rem',
    color: '#121212', outline: 'none',
  },
  nav: { display: 'flex', gap: 20, flexShrink: 0, alignItems: 'center' },
  navLink: {
    fontSize: '0.85rem', fontWeight: 500,
    color: '#555', textDecoration: 'none', cursor: 'pointer'
  },
  signInBtn: {
    fontSize: '0.85rem', fontWeight: 600,
    color: '#fff', background: '#1a003d',
    border: 'none', borderRadius: 7,
    padding: '7px 14px', cursor: 'pointer',
  },
  avatarBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: 'none', border: '1px solid #e0e0e0',
    borderRadius: 20, padding: '5px 12px 5px 6px',
    cursor: 'pointer', fontSize: '0.85rem', color: '#121212',
  },
  avatar: {
    width: 26, height: 26, borderRadius: '50%',
    background: '#1a003d', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
  },
  avatarName: { fontWeight: 600, fontSize: '0.83rem', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: '#fff', border: '1px solid #e0e0e0',
    borderRadius: 10, minWidth: 200,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    zIndex: 200, overflow: 'hidden',
  },
  dropdownEmail: {
    padding: '12px 16px 8px',
    fontSize: '0.75rem', color: '#888',
    borderBottom: 'none', wordBreak: 'break-all',
  },
  dropdownDivider: { margin: 0, border: 'none', borderTop: '1px solid #f0f0f0' },
  dropdownItem: {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '10px 16px', background: 'none', border: 'none',
    fontSize: '0.85rem', color: '#121212', cursor: 'pointer',
    fontFamily: 'inherit',
  },
};