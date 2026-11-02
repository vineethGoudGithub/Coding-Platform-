import React, { useState, useEffect } from 'react';
import { adminApi, testApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Download, Search, Filter, Eye, Award, CheckCircle2, XCircle, ArrowUpDown, X } from 'lucide-react';

export const AdminResults = () => {
  const { showToast } = useToast();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [direction, setDirection] = useState('desc');

  // Detail Modal
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [page, section, sortBy, direction]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getResults({
        search,
        section,
        page,
        size: 15,
        sortBy,
        direction
      });
      if (res.success && res.data) {
        setResults(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchResults();
  };

  const handleViewDetail = async (attemptId) => {
    setSelectedAttemptId(attemptId);
    try {
      setLoadingDetail(true);
      const res = await testApi.getResult(attemptId);
      if (res.success && res.data) {
        setAttemptDetail(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
      setSelectedAttemptId(null);
    } finally {
      setLoadingDetail(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Assessment Submissions &amp; Grades</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Comprehensive performance review for all students ({totalElements} total)</p>
        </div>

        <button onClick={handleExportCsv} className="btn btn-secondary">
          <Download size={16} /> Export Results as CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 120px', gap: '0.75rem', alignItems: 'center' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search candidate name, roll no, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <select
              className="form-control"
              value={section}
              onChange={(e) => { setSection(e.target.value); setPage(0); }}
            >
              <option value="">All Sections</option>
              <option value="CSE-A">Section CSE-A</option>
              <option value="CSE-B">Section CSE-B</option>
              <option value="CSE-C">Section CSE-C</option>
              <option value="IT-A">Section IT-A</option>
            </select>
          </div>

          <div>
            <select
              className="form-control"
              value={`${sortBy}-${direction}`}
              onChange={(e) => {
                const [sb, dir] = e.target.value.split('-');
                setSortBy(sb);
                setDirection(dir);
                setPage(0);
              }}
            >
              <option value="submittedAt-desc">Latest Submission</option>
              <option value="submittedAt-asc">Oldest Submission</option>
              <option value="totalScore-desc">Highest Score</option>
              <option value="totalScore-asc">Lowest Score</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>
            <Search size={15} /> Filter
          </button>
        </form>
      </div>

      {/* Results Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
            Loading submissions...
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Student Name</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Class</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Section</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Roll No</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Test</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>MCQ Score</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Coding Score</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Total</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Submitted At</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        No results matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    results.map((r) => (
                      <tr key={r.attemptId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#0f172a' }}>
                          {r.studentName}
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{r.email}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>{r.studentClass || 'N/A'}</td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>{r.section || 'N/A'}</td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>{r.rollNumber || 'N/A'}</td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#2563eb', fontWeight: 500 }}>{r.testTitle}</td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>{r.mcqScore} / 8</td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>{r.codingScore} / 2</td>
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
                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleViewDetail(r.attemptId)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          >
                            <Eye size={13} /> View Answers
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="btn btn-secondary"
                    disabled={page === 0}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    className="btn btn-secondary"
                    disabled={page >= totalPages - 1}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Candidate Submission Inspection Modal */}
      {selectedAttemptId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
          <div className="card" style={{ maxWidth: '850px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Submission Details: {attemptDetail?.studentName || 'Student'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Roll: {attemptDetail?.rollNumber} | Sec: {attemptDetail?.section} | Total: {attemptDetail?.totalScore} / {attemptDetail?.maxTotalScore} ({attemptDetail?.percentage}%)
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedAttemptId(null); setAttemptDetail(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  Loading candidate answer sheets...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {attemptDetail?.questionResults?.map((qr) => (
                    <div
                      key={qr.questionId}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '1rem',
                        background: qr.isCorrect ? '#f0fdf4' : '#fff',
                        borderLeft: qr.isCorrect ? '4px solid #10b981' : '4px solid #ef4444'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          Q{qr.questionOrder}. {qr.title} ({qr.questionType})
                        </span>
                        <span style={{ fontWeight: 700, color: qr.isCorrect ? '#166534' : '#991b1b' }}>
                          {qr.marksAwarded} / {qr.maxMarks} Mark{qr.maxMarks > 1 ? 's' : ''}
                        </span>
                      </div>

                      {qr.questionType === 'MCQ' && (
                        <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div>Candidate Choice: <strong>{qr.studentAnswer || 'Unanswered'}</strong></div>
                          <div>Correct Answer: <strong style={{ color: '#166534' }}>{qr.correctAnswer}</strong></div>
                        </div>
                      )}

                      {qr.questionType === 'CODING' && (
                        <div style={{ fontSize: '0.85rem' }}>
                          <div style={{ marginBottom: '0.35rem' }}>
                            Hidden Test Cases Passed: <strong>{qr.testCasesPassed} / {qr.totalTestCases}</strong>
                          </div>
                          {qr.studentAnswer && (
                            <div>
                              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Submitted Code:</span>
                              <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '0.85rem', borderRadius: '6px', marginTop: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', overflowX: 'auto' }}>
                                {qr.studentAnswer}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
