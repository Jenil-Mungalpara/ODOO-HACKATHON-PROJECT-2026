import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LOGIN_TITLE, LOGIN_SUBTITLE, EMAIL_LABEL, EMAIL_PLACEHOLDER,
  PASSWORD_LABEL, PASSWORD_PLACEHOLDER, BTN_SIGN_IN, FORGOT_LINK, SIGNUP_LINK, REMEMBER_ME
} from '../utils/copy';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 32 32" fill="none" width="48" height="48"><rect width="32" height="32" rx="8" fill="#1a73e8"/><path d="M8 16l4-6h8l4 6-4 6H12l-4-6z" fill="#fff" opacity="0.9"/><circle cx="16" cy="16" r="3" fill="#1a73e8"/></svg>
          <h1>FleetFlow</h1>
          <p>Modular Fleet &amp; Logistics Management</p>
        </div>
        <div className="auth-title">
          <h2>{LOGIN_TITLE}</h2>
          <p>{LOGIN_SUBTITLE}</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{EMAIL_LABEL}</label>
            <input type="email" className="form-input" placeholder={EMAIL_PLACEHOLDER} value={email} onChange={e => setEmail(e.target.value)} required aria-label={EMAIL_LABEL} />
          </div>
          <div className="form-group">
            <label className="form-label">{PASSWORD_LABEL}</label>
            <input type="password" className="form-input" placeholder={PASSWORD_PLACEHOLDER} value={password} onChange={e => setPassword(e.target.value)} required aria-label={PASSWORD_LABEL} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="rememberMe" checked={remember} onChange={e => setRemember(e.target.checked)} />
            <label htmlFor="rememberMe" className="text-sm">{REMEMBER_ME}</label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} aria-label={`Primary action: ${BTN_SIGN_IN}`}>
            {loading ? 'Signing in…' : BTN_SIGN_IN}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/forgot-password">{FORGOT_LINK}</Link>
          <span style={{ margin: '0 8px' }}>·</span>
          <Link to="/signup">{SIGNUP_LINK}</Link>
        </div>
        {/* <div style={{ marginTop: 24, padding: 16, background: '#f8f9fa', borderRadius: 8, fontSize: '0.75rem', color: '#5f6368' }}>
          <strong>Demo Accounts:</strong><br/>
          admin@fleetflow.com / admin123<br/>
          fleet@fleetflow.com / fleet123<br/>
          dispatch@fleetflow.com / dispatch123<br/>
          safety@fleetflow.com / safety123<br/>
          finance@fleetflow.com / finance123
        </div> */}
      </div>
    </div>
  );
}
