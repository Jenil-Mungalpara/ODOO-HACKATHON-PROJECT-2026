import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdDashboard, MdDirectionsCar, MdPeople, MdLocalShipping, MdBuild, MdAttachMoney, MdBarChart, MdSettings, MdLogout } from 'react-icons/md';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <MdDashboard />, roles: ['Admin', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'] },
  { path: '/vehicles', label: 'Vehicles', icon: <MdDirectionsCar />, roles: ['Admin', 'Fleet Manager', 'Dispatcher'] },
  { path: '/drivers', label: 'Drivers', icon: <MdPeople />, roles: ['Admin', 'Safety Officer', 'Dispatcher'] },
  { path: '/trips', label: 'Trips', icon: <MdLocalShipping />, roles: ['Admin', 'Fleet Manager', 'Dispatcher'] },
  { path: '/maintenance', label: 'Maintenance', icon: <MdBuild />, roles: ['Admin', 'Fleet Manager'] },
  { path: '/expenses', label: 'Expenses', icon: <MdAttachMoney />, roles: ['Admin', 'Financial Analyst'] },
  { path: '/analytics', label: 'Analytics', icon: <MdBarChart />, roles: ['Admin', 'Fleet Manager', 'Financial Analyst'] },
  { path: '/settings', label: 'Settings', icon: <MdSettings />, roles: ['Admin'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleMenu = menuItems.filter(item =>
    user?.role === 'Admin' || item.roles.includes(user?.role)
  );

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="app-layout">
      <div className="topbar">
        <NavLink to="/dashboard" className="topbar-brand">
          <svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#1a73e8"/><path d="M8 16l4-6h8l4 6-4 6H12l-4-6z" fill="#fff" opacity="0.9"/><circle cx="16" cy="16" r="3" fill="#1a73e8"/></svg>
          FleetFlow
        </NavLink>
        <div className="topbar-spacer" />
        <div className="topbar-user" onClick={handleLogout} title="Click to logout">
          <div className="topbar-info">
            <div className="topbar-name">{user?.name}</div>
            <div className="topbar-role">{user?.role}</div>
          </div>
          <div className="topbar-avatar">{initials}</div>
        </div>
      </div>
      <nav className="sidebar">
        <div className="sidebar-section">Navigation</div>
        {visibleMenu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        <div className="sidebar-section" style={{ marginTop: 'auto' }}></div>
        <button className="sidebar-link" onClick={handleLogout} style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', font: 'inherit' }}>
          <span className="icon"><MdLogout /></span>
          Sign out
        </button>
      </nav>
      <main className="app-main">
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
