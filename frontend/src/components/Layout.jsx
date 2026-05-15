import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header = ({ user, onLogout }) => {
  const location = useLocation();
  const isAdmin = user?.role === 'admin' || user?.role === 'support_staff';

  return (
    <header className="top-nav">
      <div className="top-nav-emergency">
        <span role="img" aria-label="emergency">⚠️</span>
        {isAdmin ? 'SYSTEM ALERT: EMERGENCY PROTOCOLS ACTIVE' : 'EMERGENCY SUPPORT AVAILABLE 24/7'}
      </div>
      <div className="top-nav-links">
        <Link to="/" className={`top-nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
        <Link to="/support" className={`top-nav-link ${location.pathname === '/support' ? 'active' : ''}`}>Support Services</Link>
        {user ? (
          <>
            <Link to="/dashboard" className={`top-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
            <div className="user-profile-small">
              <span className="small">{user.full_name || user.name}</span>
              <button onClick={onLogout} className="btn-logout-small">Logout</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="top-nav-link">Login</Link>
            <Link to="/signup" className="btn-signup-nav">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
};

export const Sidebar = ({ user }) => {
  const location = useLocation();
  const role = user?.role;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['victim', 'support_staff', 'admin'] },
    { label: 'Report Incident', path: '/report', icon: '📄', roles: ['victim'] },
    { label: 'Resources', path: '/support', icon: '🧩', roles: ['victim', 'support_staff', 'admin'] },
    { label: 'Admin Panel', path: '/admin', icon: '👤', roles: ['admin'] },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">SafetyLink</div>
      <div className="small text-muted" style={{ marginBottom: '1.5rem', paddingLeft: '1rem' }}>Navigation</div>
      <nav className="nav-menu">
        {navItems.filter(item => item.roles.includes(role)).map((item) => (
          <li key={item.path} className="nav-item">
            <Link to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: '1rem' }}>
        <button className="btn-emergency-call">
          <span>📞</span> Emergency Call
        </button>
      </div>
    </aside>
  );
};

export const Footer = () => (
  <footer className="footer">
    <div className="footer-copyright">© 2024 SafetyLink Support. All rights reserved.</div>
    <div className="footer-links">
      <a href="#" className="footer-link">Contact Us</a>
      <a href="#" className="footer-link">Legal Disclaimers</a>
      <a href="#" className="footer-link">Privacy Policy</a>
      <a href="#" className="footer-link">Accessibility</a>
    </div>
  </footer>
);

export const Layout = ({ children, user, onLogout, showSidebar = true }) => (
  <div className="app-container">
    {showSidebar && user && <Sidebar user={user} />}
    <div className="main-content">
      <Header user={user} onLogout={onLogout} />
      <main className="page-container">
        {children}
      </main>
      <Footer />
    </div>
  </div>
);
