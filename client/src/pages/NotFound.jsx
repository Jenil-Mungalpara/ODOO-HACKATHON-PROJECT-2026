import { Link } from 'react-router-dom';
import { NOT_FOUND_TITLE, NOT_FOUND_BODY } from '../utils/copy';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: '4rem', marginBottom: 16, opacity: 0.3 }}>404</div>
      <h1 style={{ marginBottom: 8 }}>{NOT_FOUND_TITLE}</h1>
      <p className="text-muted" style={{ marginBottom: 24 }}>{NOT_FOUND_BODY}</p>
      <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
    </div>
  );
}
