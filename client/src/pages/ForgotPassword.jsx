import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 32 32" fill="none" width="48" height="48"><rect width="32" height="32" rx="8" fill="#1a73e8"/><path d="M8 16l4-6h8l4 6-4 6H12l-4-6z" fill="#fff" opacity="0.9"/><circle cx="16" cy="16" r="3" fill="#1a73e8"/></svg>
          <h1>FleetFlow</h1>
        </div>
        <div className="auth-title">
          <h2>Reset Password</h2>
          <p>Enter your email to receive a reset link</p>
        </div>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✉️</div>
            <h3>Check your email</h3>
            <p className="text-muted" style={{ marginTop: 8 }}>We've sent password reset instructions to <strong>{email}</strong></p>
            <div className="auth-footer" style={{ marginTop: 24 }}><Link to="/login">Back to Sign in</Link></div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary">Send Reset Link</button>
            </form>
            <div className="auth-footer"><Link to="/login">Back to Sign in</Link></div>
          </>
        )}
      </div>
    </div>
  );
}
