// src/components/Navbar.jsx
//
// Drop-in replacement for the <header> block inside App.jsx.
// Uses Firebase's onAuthStateChanged to react instantly when the user
// logs in or out from *any* tab — no polling, no stale state.
//
// Props:
//   search      {string}   — controlled search value (from App)
//   onSearch    {fn}       — setter passed down from App
//
// Usage in App.jsx:
//   import Navbar from './components/Navbar';
//   ...
//   <Navbar search={search} onSearch={setSearch} />

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AuthModal from './AuthModal';

export default function Navbar({ search, onSearch }) {
  const navigate = useNavigate();
  const [user,        setUser]        = useState(null);   // Firebase user object or null
  const [authReady,   setAuthReady]   = useState(false);  // hide nav until Firebase resolves
  const [modalOpen,   setModalOpen]   = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);  // user dropdown
  const menuRef = useRef(null);

  // ── Listen to Firebase auth state ────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return unsub; // cleanup on unmount
  }, []);

  // ── Close dropdown when clicking outside ────────────────────────────────
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

  // Derive a short greeting name: "John" from "John Doe", or first part of
  // the email if displayName is null (e.g. Google accounts always have it).
  const greeting = user
    ? (user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'You')
    : '';

  // Avatar: first letter of display name, or first letter of email
  const avatarLetter = user
    ? (user.displayName?.[0] || user.email?.[0] || '?').toUpperCase()
    : '';

  return (
    <>
      <header style={s.header}>

        {/* Logo */}
        <div style={s.logo}>viagogo</div>

        {/* Search bar */}
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

        {/* Nav links + auth */}
        <nav style={s.nav}>
          <a href="#explore" style={s.navLink}>Explore</a>
          <a href="#sell"    style={s.navLink}>Sell</a>

          {/* Only render the auth area once Firebase has resolved */}
          {authReady && (
            user ? (
              /* ── Logged-in: avatar + dropdown ─────────────────────────── */
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
                    <button style={s.dropdownItem} onClick={() => { setMenuOpen(false); navigate('/my-tickets'); }}>
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
              /* ── Logged-out: sign in button ────────────────────────────── */
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

      {/* Auth modal — controlled by this component */}
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

// ── Styles — mirror your existing App.css header exactly ─────────────────
const s = {
  header: {
    position: 'sticky', top: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '12px 24px',
    background: '#fff', borderBottom: '1px solid #e0e0e0',
  },
  logo: {
    fontSize: '1.2rem', fontWeight: 700,
    color: '#7ec23a', flexShrink: 0, letterSpacing: '-0.5px',
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
    color: '#555', textDecoration: 'none',
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
