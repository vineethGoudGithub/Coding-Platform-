import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Clock, HelpCircle, Award, Play, AlertCircle, FileCode, CheckCircle, Info } from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await testApi.getActiveTests();
      if (res.success) {
        setTests(res.data || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    if (!selectedTest) return;
    try {
      setStarting(true);
      const res = await testApi.startTest(selectedTest.id);
      if (res.success && res.data) {
        showToast('Assessment started! Good luck.', 'success');
        navigate(`/student/test/${res.data.id}`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="main-content">
      {/* Student Profile Overview Banner */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>Candidate Dashboard</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.2rem 0' }}>{user?.fullName || user?.email}</h1>
            <div style={{ display: 'flex', gap: '1.25rem', opacity: 0.9, fontSize: '0.9rem', marginTop: '0.4rem' }}>
              <span>Roll Number: <strong>{user?.rollNumber || 'N/A'}</strong></span>
              <span>Section: <strong>{user?.section || 'N/A'}</strong></span>
              <span>Account: <strong>{user?.email}</strong></span>
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.12)', padding: '0.75rem 1.25rem', borderRadius: '12px', backdropFilter: 'blur(8px)', textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Available Assessments</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{tests.length}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Available Assessments</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Select an active assessment to begin your test session</p>
        </div>
        <button onClick={fetchTests} className="btn btn-secondary">Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <span className="loading-spinner" role="status" aria-label="Loading tests" style={{ margin: '0 auto 1rem' }} />
          Loading assessments...
        </div>
      ) : tests.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Active Tests Available</h3>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Please contact your administrator or instructor to activate your test.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {tests.map((test) => (
            <div key={test.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header" style={{ alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{test.title}</h3>
                  <span className="badge badge-success" style={{ marginTop: '0.35rem' }}>Active Assessment</span>
                </div>
              </div>
              <div className="card-body" style={{ flex: 1 }}>
                <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.25rem', whiteSpace: 'pre-line' }}>
                  {test.description || 'Comprehensive programming & MCQ assessment.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                    <Clock size={16} style={{ color: '#2563eb' }} />
                    <span><strong>{test.durationMinutes}</strong> Minutes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                    <Award size={16} style={{ color: '#10b981' }} />
                    <span><strong>{test.totalMarks}</strong> Marks Total</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                    <HelpCircle size={16} style={{ color: '#f59e0b' }} />
                    <span><strong>{test.questionCount || 10}</strong> Questions</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                    <FileCode size={16} style={{ color: '#7c3aed' }} />
                    <span>Java Sandbox</span>
                  </div>
                </div>
              </div>
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#fafafa', borderRadius: '0 0 10px 10px' }}>
                <button
                  onClick={() => setSelectedTest(test)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.65rem' }}
                >
                  <Play size={16} /> Ready to Take Test
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pre-Test Modal as specified in user prompt */}
      {selectedTest && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '540px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ background: '#1e40af', color: 'white', padding: '1.25rem 1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Examination Candidate Verification</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '2px' }}>Please verify your credentials before initiating the timed session</p>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {/* Candidate Info Table */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b' }}>Student Name:</span>
                  <strong style={{ color: '#0f172a' }}>{user?.fullName || 'Student'}</strong>

                  <span style={{ color: '#64748b' }}>Roll Number:</span>
                  <strong style={{ color: '#0f172a' }}>{user?.rollNumber || 'N/A'}</strong>

                  <span style={{ color: '#64748b' }}>Section:</span>
                  <strong style={{ color: '#0f172a' }}>{user?.section || 'N/A'}</strong>

                  <span style={{ color: '#64748b' }}>Test Name:</span>
                  <strong style={{ color: '#2563eb' }}>{selectedTest.title}</strong>

                  <span style={{ color: '#64748b' }}>Total Marks:</span>
                  <strong>{selectedTest.totalMarks} Marks (Part A: 8 MCQs, Part B: 2 Coding)</strong>

                  <span style={{ color: '#64748b' }}>Duration:</span>
                  <strong>{selectedTest.durationMinutes} Minutes</strong>

                  <span style={{ color: '#64748b' }}>Question Count:</span>
                  <strong>{selectedTest.questionCount || 10} Questions</strong>
                </div>
              </div>

              {/* Rules & Warnings */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', fontSize: '0.825rem', color: '#92400e' }}>
                <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Important Instructions:</strong>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem', lineHeight: '1.4' }}>
                    <li>The countdown timer runs on the server and will not pause if you refresh.</li>
                    <li>MCQ answers autosave immediately. Coding questions can be run against sample tests and submitted against hidden test cases.</li>
                    <li>Ensure you click "SUBMIT TEST" before the timer expires.</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedTest(null)}
                  className="btn btn-secondary"
                  disabled={starting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartTest}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}
                  disabled={starting}
                >
                  {starting ? 'Starting Test...' : 'START TEST'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
