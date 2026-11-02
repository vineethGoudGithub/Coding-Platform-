import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { testApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Award, CheckCircle2, XCircle, ArrowLeft, Clock, FileCode, Check, X, ShieldAlert } from 'lucide-react';

export const TestResult = () => {
  const { attemptId } = useParams();
  const { showToast } = useToast();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await testApi.getResult(attemptId);
      if (res.success && res.data) {
        setResult(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '0.75rem' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontWeight: 600, color: '#475569' }}>Calculating assessment score...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>Assessment Result Not Available</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const isPassed = result.status === 'PASSED';
  const questionResults = result.questionResults || [];
  const mcqQuestionCount = questionResults.filter((question) => question.questionType === 'MCQ').length;
  const codingQuestionCount = questionResults.filter((question) => question.questionType === 'CODING').length;

  return (
    <div className="main-content" style={{ maxWidth: '960px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>

      {/* Main Scorecard Card */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)' }}>
        {/* Banner */}
        <div style={{
          background: isPassed ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' : 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)',
          color: 'white',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9 }}>Official Scorecard</span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0.25rem 0' }}>{result.testTitle}</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.95rem', opacity: 0.95, marginTop: '0.5rem' }}>
              <span>Student: <strong>{result.studentName}</strong></span>
              {result.studentClass && <span>Class: <strong>{result.studentClass}</strong></span>}
              <span>Section: <strong>{result.section}</strong></span>
              {result.rollNumber && result.rollNumber !== 'N/A' && <span>Roll No: <strong>{result.rollNumber}</strong></span>}
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            padding: '1rem 1.75rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>STATUS</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '0.02em', marginTop: '2px' }}>
              {isPassed ? 'PASSED' : 'FAILED'}
            </div>
          </div>
        </div>

        {/* Detailed Marks Breakdown Cards */}
        <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {/* MCQ Score */}
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>PART A: MCQs</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e40af', margin: '0.35rem 0' }}>
              {result.mcqScore} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#64748b' }}>/ {result.maxMcqScore}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              {result.mcqsCorrect} of {mcqQuestionCount} correct
            </span>
          </div>

          {/* Coding Score */}
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>PART B: CODING</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed', margin: '0.35rem 0' }}>
              {result.codingScore} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#64748b' }}>/ {result.maxCodingScore}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              {result.codingProblemsSolved} of {codingQuestionCount} solved
            </span>
          </div>

          {/* Total Score */}
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderColor: '#bfdbfe', background: '#eff6ff' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>TOTAL SCORE</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1d4ed8', margin: '0.35rem 0' }}>
              {result.totalScore} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#64748b' }}>/ {result.maxTotalScore}</span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1d4ed8' }}>
              {result.percentage}% Score
            </span>
          </div>

          {/* Questions Attempted */}
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>ATTEMPT RATE</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0' }}>
              {result.questionsAttempted} <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#64748b' }}>/ {result.totalQuestions}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Questions attempted</span>
          </div>
        </div>

        {/* Question by Question Review */}
        <div style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
            Question Breakdown &amp; Evaluation
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {result.questionResults?.map((qr) => (
              <div
                key={qr.questionId}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  background: qr.isCorrect ? '#f0fdf4' : '#fff',
                  borderLeft: qr.isCorrect ? '5px solid #10b981' : '5px solid #ef4444'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Q{qr.questionOrder}. {qr.title}</span>
                    <span className={`badge ${qr.questionType === 'MCQ' ? 'badge-primary' : 'badge-success'}`}>
                      {qr.questionType}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: qr.isCorrect ? '#166534' : '#991b1b' }}>
                      {qr.marksAwarded} / {qr.maxMarks} Mark{qr.maxMarks > 1 ? 's' : ''}
                    </span>
                    {qr.isCorrect ? (
                      <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                    ) : (
                      <XCircle size={18} style={{ color: '#ef4444' }} />
                    )}
                  </div>
                </div>

                {qr.questionType === 'MCQ' && (
                  <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Your Choice: </span>
                      <strong style={{ color: qr.isCorrect ? '#166534' : '#991b1b' }}>
                        {qr.studentAnswer || 'Not answered'}
                      </strong>
                    </div>
                    {!qr.isCorrect && (
                      <div>
                        <span style={{ color: '#64748b' }}>Correct Answer: </span>
                        <strong style={{ color: '#166534' }}>{qr.correctAnswer}</strong>
                      </div>
                    )}
                  </div>
                )}

                {qr.questionType === 'CODING' && (
                  <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    <div style={{ marginBottom: '0.4rem' }}>
                      <span style={{ color: '#64748b' }}>Hidden Test Cases Passed: </span>
                      <strong>{qr.testCasesPassed} / {qr.totalTestCases}</strong>
                    </div>
                    {qr.studentAnswer && (
                      <details style={{ marginTop: '0.5rem' }}>
                        <summary style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 600 }}>
                          View Submitted Java Code
                        </summary>
                        <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '1rem', borderRadius: '6px', marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', overflowX: 'auto' }}>
                          {qr.studentAnswer}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
