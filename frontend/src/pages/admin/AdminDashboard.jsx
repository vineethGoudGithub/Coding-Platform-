import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, FileText, CheckCircle2, Award, TrendingUp, Plus, Download, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdminDashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboard();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      showToast('Preparing CSV download...', 'info');
      await adminApi.exportResults();
      showToast('Results CSV downloaded successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="main-content">
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-primary"><ShieldCheck size={12} /> Administrator Portal</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>Assessment Analytics Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time overview of tests, candidate attempts, and performance</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCsv} className="btn btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <Link to="/admin/tests/create" className="btn btn-primary">
            <Plus size={16} /> Create New Test
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
          Loading metrics...
        </div>
      ) : (
        <>
          {/* Top 5 Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {/* Total Students */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Students</span>
                <Users size={20} style={{ color: '#2563eb' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats?.totalStudents || 0}</div>
              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Registered Candidates</span>
            </div>

            {/* Total Tests */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Tests</span>
                <FileText size={20} style={{ color: '#7c3aed' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats?.totalTests || 0}</div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{stats?.activeTests || 0} Active Assessments</span>
            </div>

            {/* Completed Attempts */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Completed Attempts</span>
                <CheckCircle2 size={20} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats?.completedAttempts || 0}</div>
              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Evaluated Submissions</span>
            </div>

            {/* Average Score */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Average Score</span>
                <TrendingUp size={20} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                {stats?.averageScore || 0} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>/ 10</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>Cohort Performance</span>
            </div>
          </div>

          {/* Recent Results Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Recent Assessment Submissions</h3>
                <p style={{ fontSize: '0.825rem', color: '#64748b' }}>Latest evaluated tests from students</p>
              </div>
              <Link to="/admin/results" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
                View All Results <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Student Name</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Roll No</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Section</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Test</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>MCQ</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Coding</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Total Score</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {!stats?.recentResults || stats.recentResults.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        No completed student submissions yet.
                      </td>
                    </tr>
                  ) : (
                    stats.recentResults.map((r) => (
                      <tr key={r.attemptId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#0f172a' }}>
                          {r.studentName}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>{r.rollNumber || 'N/A'}</td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>{r.section || 'N/A'}</td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#2563eb', fontWeight: 500 }}>{r.testTitle}</td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>{r.mcqScore ?? 0} / {r.maxMcqScore ?? 0}</td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>{r.codingScore ?? 0} / {r.maxCodingScore ?? 0}</td>
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>
                          {r.totalScore} / {r.maxMarks} ({r.percentage}%)
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <span className={`badge ${r.percentage >= 40 ? 'badge-success' : 'badge-danger'}`}>
                            {r.percentage >= 40 ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#64748b', fontSize: '0.8rem' }}>
                          {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
