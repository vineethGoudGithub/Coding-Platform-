import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, LogOut, LayoutDashboard, FileText, Users, Award, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hide navbar on landing entry, admin login, and examination screen
  if (location.pathname === '/' || location.pathname === '/entry' || location.pathname === '/login' || location.pathname === '/admin/login' || location.pathname.startsWith('/student/test/')) {
    return null;
  }

  return (
    <header className="navbar">
      <Link to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} className="brand-badge">
        <span className="brand-icon">
          <Terminal size={20} />
        </span>
        <span>Java Test KU</span>
      </Link>

      {isAuthenticated && (
        <nav className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {isAdmin && (
            <div className="navbar-links" style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/admin/dashboard" className={`btn btn-ghost ${location.pathname === '/admin/dashboard' ? 'btn-primary' : ''}`}>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link to="/admin/tests" className={`btn btn-ghost ${location.pathname.startsWith('/admin/tests') ? 'btn-primary' : ''}`}>
                <FileText size={16} />
                <span>Manage Tests</span>
              </Link>
              <Link to="/admin/results" className={`btn btn-ghost ${location.pathname === '/admin/results' ? 'btn-primary' : ''}`}>
                <Award size={16} />
                <span>Results</span>
              </Link>
              <Link to="/admin/students" className={`btn btn-ghost ${location.pathname === '/admin/students' ? 'btn-primary' : ''}`}>
                <Users size={16} />
                <span>Students</span>
              </Link>
            </div>
          )}

          {isStudent && (
            <div className="navbar-links" style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/student/dashboard" className="btn btn-ghost">
                <LayoutDashboard size={16} />
                <span>My Tests</span>
              </Link>
            </div>
          )}

          <div className="navbar-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border-light)', paddingLeft: '1.25rem' }}>
            <div className="navbar-user-details" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                {user?.fullName || user?.email}
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '2px' }}>
                {isAdmin ? (
                  <span className="badge badge-primary">
                    <ShieldCheck size={12} /> ADMIN
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {user?.rollNumber && `Roll: ${user.rollNumber}`}
                    {user?.section && ` | Sec: ${user.section}`}
                  </span>
                )}
              </div>
            </div>

            <button onClick={handleLogout} className="btn btn-secondary" title="Sign Out">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
