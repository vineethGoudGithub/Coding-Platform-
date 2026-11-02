import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { testApi } from '../services/api';
import { Terminal, Clock, Award, HelpCircle, FileCode, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CandidateDirectEntry = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentClass, setStudentClass] = useState('B.Tech CSE');
  const [section, setSection] = useState('CSE-A');
  const [rollNumber, setRollNumber] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { enterCandidate } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveTests();
  }, []);

  const fetchActiveTests = async () => {
    try {
      setLoadingTests(true);
      const res = await testApi.getActiveTests();
      if (res.success && res.data && res.data.length > 0) {
        setTests(res.data);
        setSelectedTest(res.data[0]); // default to first active test
      }
    } catch (err) {
      console.warn('Failed to fetch tests:', err.message);
    } finally {
      setLoadingTests(false);
    }
  };

  const handleStartTest = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !studentClass.trim() || !section.trim()) {
      showToast('Please fill in your Name, Email, Class, and Section.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      // 1. Direct candidate entry verification
      const candidate = await enterCandidate({
        fullName: fullName.trim(),
        email: email.trim(),
        studentClass: studentClass.trim(),
        section: section.trim(),
        rollNumber: rollNumber.trim() || 'N/A'
      });

      const testId = selectedTest ? selectedTest.id : 1;

      // 2. Direct test start
      const startRes = await testApi.startTest(testId);
      if (startRes.success && startRes.data) {
        showToast(`Welcome, ${candidate.fullName}! Starting your test session...`, 'success');
        navigate(`/student/test/${startRes.data.id}`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="entry-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      {/* Top Header */}
      <header className="entry-header" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, color: 'var(--primary-700)', fontSize: '1.15rem' }}>
          <span className="brand-icon">
            <Terminal size={20} />
          </span>
          <span>Java Test KU</span>
        </div>
      </header>

      {/* Main Form Centerpiece */}
      <div className="entry-main" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div className="entry-content" style={{ maxWidth: '780px', width: '100%' }}>
          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
              Java Test KU
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '0.35rem' }}>
              Candidate Registration &amp; Timed Examination Portal
            </p>
          </div>

          <div className="card entry-card" style={{ padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)' }}>
            {/* Assessment Structure Preview */}
            <div className="entry-test-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#1e293b' }}>
                <Clock size={16} style={{ color: '#2563eb' }} />
                <span>Duration: <strong>{selectedTest?.durationMinutes || 45} Mins</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#1e293b' }}>
                <Award size={16} style={{ color: '#10b981' }} />
                <span>Total: <strong>{selectedTest?.totalMarks || 10} Marks</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#1e293b' }}>
                <HelpCircle size={16} style={{ color: '#f59e0b' }} />
                <span>Part A: <strong>8 MCQs</strong> (8M)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#1e293b' }}>
                <FileCode size={16} style={{ color: '#7c3aed' }} />
                <span>Part B: <strong>2 Coding</strong> (2M)</span>
              </div>
            </div>

            {/* Candidate Details Form */}
            <form onSubmit={handleStartTest}>
              <div className="entry-form-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Enter Candidate Details</h2>
              </div>

              <div className="entry-primary-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="candidate-name">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    id="candidate-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rahul Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="candidate-email">Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    id="candidate-email"
                    type="email"
                    className="form-control"
                    placeholder="e.g. rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="entry-academic-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="candidate-class">Class / Grade <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    id="candidate-class"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Class 10 / B.Tech"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="candidate-section">Section <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    id="candidate-section"
                    type="text"
                    className="form-control"
                    placeholder="e.g. A, B, CSE-A"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="candidate-roll-number">Roll Number</label>
                  <input
                    id="candidate-roll-number"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 12345"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Instructions checklist */}
              <div className="entry-rules" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.825rem', color: '#1e40af' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Test Session Rules:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span>✓ The countdown timer begins immediately upon clicking "START TEST".</span>
                  <span>✓ MCQ answers autosave automatically as you click each option.</span>
                  <span>✓ Java code editor features syntax highlighting and tests against hidden cases.</span>
                  <span>✓ Fullscreen is required when supported; re-enter it if you exit during the test.</span>
                  <span>✓ Tab switches are logged. After 3 warnings, you may continue, but further switches are still recorded.</span>
                </div>
              </div>

              {/* Big START TEST Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.02em', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}
                disabled={submitting}
              >
                {submitting ? 'Preparing Test Session...' : (
                  <>START TEST <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
