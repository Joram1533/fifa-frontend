// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom'; // 🔥 IMPORT ROUTER HOOKS
import AuthModal from './AuthModal';

export default function Navbar({ search, onSearch }) {
  const [user,          setUser]          = useState(null);
  const [authReady,     setAuthReady]     = useState(false);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate(); // 🔥 Hook to programmatically change pages

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
    navigate('/'); // Kick them back to the home page if they sign out
  };

  // ── Sell Route Guard ─────────────────────────────────
  const handleSellClick = (e) => {
    e.preventDefault();
    if (!user) {
      alert("🔒 Please sign in to access your inventory and sell tickets.");
      setModalOpen(true);
    } else {
      navigate('/sell'); // 🔥 ROUTE DIRECTLY TO THE NEW SELL PAGE
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
        {/* 🔥 Logo now acts as a Home button */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={s.logo}>Fifa Tickets</div>
        </Link>

        {/* ── Search bar (fully wired to App.jsx via props) ── */}
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>⌕</span>
          <input
            type="text"
            style={s.searchInput}
            placeholder="Search teams, venues, cities…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              style={s.clearBtn}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <nav style={s.nav}>
          <Link to="/" style={s.navLink}>Explore</Link>
          {/* 🔥 Sell button now triggers the auth guard, then routes to /sell */}
          <a href="/sell" onClick={handleSellClick} style={s.navLink}>Sell</a>

          {authReady && (
            user ? (
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  style={s.avatarBtn}
                  aria-label="Account menu"
                >
                  <div style={s.avatar}>{avatarLetter}</div>
                  <span style={s.avatarName}>{greeting}</span>
                  <span style={{ fontSize: 10, color: '#888', marginLeft: 2 }}>▾</span>
                </button>

                {menuOpen && (
                  <div style={s.dropdown}>
                    <div style={s.dropdownEmail}>{user.email}</div>
                    <hr style={s.dropdownDivider} />
                    <button
                      style={s.dropdownItem}
                      onClick={() => { setMenuOpen(false); navigate('/my-tickets'); }}
                    >
                      My Tickets
                    </button>
                    <button
                      style={s.dropdownItem}
                      onClick={() => { setMenuOpen(false); navigate('/sell'); }}
                    >
                      Sell Dashboard
                    </button>
                    <button
                      style={s.dropdownItem}
                      onClick={() => setMenuOpen(false)}
                    >
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
              <button style={s.signInBtn} onClick={() => setModalOpen(true)}>
                Sign in
              </button>
            )
          )}
        </nav>
      </header>

      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
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
  searchIcon:  { fontSize: '1.1rem', color: '#888', lineHeight: 1 },
  searchInput: {
    flex: 1, border: 'none', background: 'transparent',
    padding: '8px 0', fontSize: '0.85rem',
    color: '#121212', outline: 'none',
  },
  clearBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#888', fontSize: '1.1rem', lineHeight: 1, padding: 0,
  },
  nav: { display: 'flex', gap: 20, flexShrink: 0, alignItems: 'center' },
  navLink: {
    fontSize: '0.85rem', fontWeight: 500,
    color: '#555', textDecoration: 'none', cursor: 'pointer',
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
  avatarName: {
    fontWeight: 600, fontSize: '0.83rem',
    maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: '#fff', border: '1px solid #e0e0e0',
    borderRadius: 10, minWidth: 200,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    zIndex: 200, overflow: 'hidden',
  },
  dropdownEmail: {
    padding: '12px 16px 8px',
    fontSize: '0.75rem', color: '#888', wordBreak: 'break-all',
  },
  dropdownDivider: { margin: 0, border: 'none', borderTop: '1px solid #f0f0f0' },
  dropdownItem: {
    display: 'block', width: '100%', textAlign: 'left',
    padding: '10px 16px', background: 'none', border: 'none',
    fontSize: '0.85rem', color: '#121212', cursor: 'pointer',
    fontFamily: 'inherit',
  }
};