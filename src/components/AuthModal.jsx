// src/components/AuthModal.jsx
import { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';

export default function AuthModal({ isOpen, onClose }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [firstName,   setFirstName]   = useState('');
  const [lastName,    setLastName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setFirstName(''); setLastName(''); setEmail('');
    setPassword(''); setConfirm(''); setError('');
  };

  const switchView = () => { reset(); setIsLoginView(v => !v); };

  // Turns Firebase raw error codes into readable sentences
  const cleanError = (err) => {
    const msg = err.message || '';
    if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential'))
      return 'Incorrect email or password.';
    if (msg.includes('email-already-in-use'))
      return 'An account with this email already exists.';
    if (msg.includes('weak-password'))
      return 'Password must be at least 6 characters.';
    if (msg.includes('popup-closed-by-user'))
      return 'Google sign-in was cancelled.';
    if (msg.includes('network-request-failed'))
      return 'Network error — check your connection.';
    return msg.replace('Firebase: ', '').replace(/\s*\(auth\/[\w-]+\)\.?/, '');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLoginView) {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter your first and last name.'); return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.'); return;
      }
      if (password !== confirm) {
        setError('Passwords do not match.'); return;
      }
    }

    setLoading(true);
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        // Save display name so Navbar can greet user without a Firestore call
        await updateProfile(user, {
          displayName: `${firstName.trim()} ${lastName.trim()}`,
        });
      }
      reset();
      onClose();
    } catch (err) {
      setError(cleanError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      reset();
      onClose();
    } catch (err) {
      setError(cleanError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>

        <button style={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <div style={s.logo}>viagogo</div>

        <h2 style={s.title}>
          {isLoginView ? 'Welcome back' : 'Create your account'}
        </h2>
        <p style={s.subtitle}>
          {isLoginView
            ? 'Sign in to buy FIFA World Cup 2026 tickets'
            : 'Sign up to buy FIFA World Cup 2026 tickets'}
        </p>

        {error && <div style={s.errorBanner}>{error}</div>}

        {/* Google first — most users prefer it */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          style={{ ...s.googleBtn, opacity: loading ? 0.6 : 1 }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={s.dividerWrap}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or</span>
          <div style={s.dividerLine} />
        </div>

        <form onSubmit={handleEmailSubmit} style={s.form}>

          {!isLoginView && (
            <div style={s.nameRow}>
              <div style={s.fieldWrap}>
                <label style={s.label}>First name</label>
                <input type="text" placeholder="John" value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} style={s.input} required />
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Last name</label>
                <input type="text" placeholder="Doe" value={lastName}
                  onChange={(e) => setLastName(e.target.value)} style={s.input} required />
              </div>
            </div>
          )}

          <div style={s.fieldWrap}>
            <label style={s.label}>Email address</label>
            <input type="email" placeholder="john@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} style={s.input}
              autoComplete="email" required />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Password</label>
            <input type="password"
              placeholder={isLoginView ? 'Your password' : 'At least 6 characters'}
              value={password} onChange={(e) => setPassword(e.target.value)} style={s.input}
              autoComplete={isLoginView ? 'current-password' : 'new-password'} required />
          </div>

          {!isLoginView && (
            <div style={s.fieldWrap}>
              <label style={s.label}>Confirm password</label>
              <input type="password" placeholder="Re-enter password" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} style={s.input}
                autoComplete="new-password" required />
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading
              ? (isLoginView ? 'Signing in…' : 'Creating account…')
              : (isLoginView ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <p style={s.switchText}>
          {isLoginView ? "Don't have an account? " : 'Already have an account? '}
          <span style={s.switchLink} onClick={switchView}>
            {isLoginView ? 'Sign up' : 'Sign in'}
          </span>
        </p>

      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 16,
  },
  modal: {
    background: '#fff', borderRadius: 14,
    padding: '32px 28px', width: '100%', maxWidth: 420,
    position: 'relative', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
  },
  closeBtn: {
    position: 'absolute', top: 14, right: 16,
    background: 'none', border: 'none',
    fontSize: '1.1rem', color: '#888',
    cursor: 'pointer', lineHeight: 1, padding: 4,
  },
  logo: {
    fontSize: '1.1rem', fontWeight: 700,
    color: '#7ec23a', letterSpacing: '-0.5px', marginBottom: 16,
  },
  title: { fontSize: '1.35rem', fontWeight: 700, color: '#121212', margin: '0 0 4px' },
  subtitle: { fontSize: '0.83rem', color: '#888', margin: '0 0 20px' },
  errorBanner: {
    background: '#fdecea', border: '1px solid #f5b8b8',
    color: '#9b2626', fontSize: '0.82rem',
    borderRadius: 8, padding: '10px 12px', marginBottom: 16,
  },
  googleBtn: {
    width: '100%', padding: '11px 16px',
    border: '1px solid #e0e0e0', borderRadius: 8,
    background: '#fff', color: '#121212',
    fontWeight: 600, fontSize: '0.88rem',
    cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    gap: 10, fontFamily: 'inherit',
  },
  dividerWrap: {
    display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0',
  },
  dividerLine: { flex: 1, height: 1, background: '#e0e0e0' },
  dividerText: { fontSize: '0.78rem', color: '#aaa', flexShrink: 0 },
  form: { display: 'flex', flexDirection: 'column' },
  nameRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' },
  fieldWrap: { marginBottom: 14 },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#555', marginBottom: 4 },
  input: {
    width: '100%', padding: '10px 12px',
    border: '1px solid #e0e0e0', borderRadius: 7,
    fontSize: '0.88rem', fontFamily: 'inherit',
    color: '#121212', background: '#fff',
    outline: 'none', boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%', padding: '12px 0', marginTop: 4,
    background: '#1a003d', color: '#fff',
    border: 'none', borderRadius: 8,
    fontWeight: 700, fontSize: '0.92rem',
    fontFamily: 'inherit',
  },
  switchText: { textAlign: 'center', fontSize: '0.82rem', color: '#666', marginTop: 18, marginBottom: 0 },
  switchLink: { color: '#1a003d', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' },
};
