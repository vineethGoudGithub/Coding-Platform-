import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Terminal, Lock, Mail, User, Hash, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [mode, setMode] = useState('student-login'); // 'student-login', 'student-register', 'admin-login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [section, setSection] = useState('CSE-A');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'student-register') {
        const user = await register({
          fullName,
          email,
          password,
          rollNumber,
          section
        });
        showToast(`Welcome, ${user.fullName}! Registration successful.`, 'success');
        navigate('/student/dashboard');
      } else {
        const user = await login(email, password);
        showToast('Login successful', 'success');
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from);
        } else if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (type) => {
    if (type === 'admin') {
      setMode('admin-login');
      setEmail('admin@assessment.com');
      setPassword('Admin@123');
    } else if (type === 'student') {
      setMode('student-login');
      setEmail('student@assessment.com');
      setPassword('Student@123');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Header Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.25)', marginBottom: '1rem' }}>
            <Terminal size={32} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em' }}>
            Java Programming Assessment
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Secure Online Code Execution &amp; MCQ Platform
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => { setMode('student-login'); setEmail(''); setPassword(''); }}
              style={{
                flex: 1,
                padding: '0.65rem 0.25rem',
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: mode === 'student-login' ? 'var(--primary-600)' : 'var(--text-muted)',
                borderBottom: mode === 'student-login' ? '2px solid var(--primary-600)' : '2px solid transparent'
              }}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('student-register'); setEmail(''); setPassword(''); }}
              style={{
                flex: 1,
                padding: '0.65rem 0.25rem',
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: mode === 'student-register' ? 'var(--primary-600)' : 'var(--text-muted)',
                borderBottom: mode === 'student-register' ? '2px solid var(--primary-600)' : '2px solid transparent'
              }}
            >
              New Student
            </button>
            <button
              type="button"
              onClick={() => { setMode('admin-login'); setEmail(''); setPassword(''); }}
              style={{
                flex: 1,
                padding: '0.65rem 0.25rem',
                border: 'none',
                background: 'transparent',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: mode === 'admin-login' ? 'var(--primary-600)' : 'var(--text-muted)',
                borderBottom: mode === 'admin-login' ? '2px solid var(--primary-600)' : '2px solid transparent'
              }}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'student-register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rahul Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 12345"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. CSE-A"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder={mode === 'admin-login' ? 'admin@assessment.com' : 'student@assessment.com'}
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
              disabled={loading}
            >
              {loading ? (
                'Processing...'
              ) : mode === 'student-register' ? (
                <>Register &amp; Access Dashboard <ArrowRight size={16} /></>
              ) : mode === 'admin-login' ? (
                <>Sign in as Admin <ShieldCheck size={16} /></>
              ) : (
                <>Sign in to Test Portal <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Quick Fill Test Accounts:</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setPreset('admin')}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.78rem' }}
              >
                Fill Admin (Admin@123)
              </button>
              <button
                type="button"
                onClick={() => setPreset('student')}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.78rem' }}
              >
                Fill Student (Rahul)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
