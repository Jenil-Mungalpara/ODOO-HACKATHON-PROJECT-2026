import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SIGNUP_TITLE, BTN_SIGNUP, SIGNUP_ROLE_LABEL, PASSWORD_RULES, EMAIL_LABEL, EMAIL_PLACEHOLDER, PASSWORD_LABEL, PASSWORD_PLACEHOLDER } from '../utils/copy';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Dispatcher', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 
                      err.response?.data?.errors?.[0]?.msg || 
                      'Registration failed. Check your connection or API URL.';
      setError(message);
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
        </div>
        <div className="auth-title">
          <h2>{SIGNUP_TITLE}</h2>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input type="text" className="form-input" placeholder="e.g., Rajesh Kumar" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">{EMAIL_LABEL}</label>
            <input type="email" className="form-input" placeholder={EMAIL_PLACEHOLDER} value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">{PASSWORD_LABEL}</label>
            <input type="password" className="form-input" placeholder={PASSWORD_PLACEHOLDER} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={8} />
            <div className="form-hint">{PASSWORD_RULES}</div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{SIGNUP_ROLE_LABEL}</label>
              <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option>Dispatcher</option>
                <option>Fleet Manager</option>
                <option>Safety Officer</option>
                <option>Financial Analyst</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" className="form-input" placeholder="+91-XXXXXXXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} aria-label={`Primary action: ${BTN_SIGNUP}`}>
            {loading ? 'Creating…' : BTN_SIGNUP}
          </button>
        </form>
        <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
