import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, ArrowLeft, Lock, Mail } from 'lucide-react';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        showToast('Admin authentication successful', 'success');
        navigate('/admin/dashboard');
      } else {
        showToast('Access denied: Account is not an administrator', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <Link to="/" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> Back to Student Assessment
          </Link>
        </div>

        <div className="card" style={{ padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', marginBottom: '0.75rem' }}>
              <ShieldCheck size={32} />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Java Test KU - Admin Portal</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>Sign in to manage tests and student results</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign in as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
