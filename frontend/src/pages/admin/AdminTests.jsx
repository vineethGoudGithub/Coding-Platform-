import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit3, Copy, Trash2, CheckCircle, XCircle, Clock, Award, HelpCircle } from 'lucide-react';

export const AdminTests = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTests();
      if (res.success) {
        setTests(res.data || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await adminApi.togglePublish(id);
      if (res.success) {
        showToast('Test status updated', 'success');
        fetchTests();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await adminApi.duplicateTest(id);
      if (res.success) {
        showToast('Test duplicated successfully as draft', 'success');
        fetchTests();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? All questions and student attempts for this test will be removed.`)) {
      return;
    }
    try {
      const res = await adminApi.deleteTest(id);
      if (res.success) {
        showToast('Test deleted successfully', 'success');
        fetchTests();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Assessment Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Create, publish, edit, or duplicate programming tests</p>
        </div>

        <Link to="/admin/tests/create" className="btn btn-primary">
          <Plus size={16} /> Create New Test
        </Link>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
            Loading assessments...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Assessment Title</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Duration</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Total Marks</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Questions</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No assessments found. Click "Create New Test" to get started.
                    </td>
                  </tr>
                ) : (
                  tests.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.description}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                          <Clock size={14} style={{ color: '#2563eb' }} />
                          <span>{t.durationMinutes} Mins</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>{t.totalMarks} Marks</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>{t.questionCount || 0} Questions</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(t.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <span className={`badge ${t.active ? 'badge-success' : 'badge-warning'}`}>
                            {t.active ? 'Active / Published' : 'Draft / Unpublished'}
                          </span>
                        </button>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(t.id)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            title="Duplicate Assessment"
                          >
                            <Copy size={13} /> Duplicate
                          </button>
                          <Link
                            to={`/admin/tests/${t.id}/edit`}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            title="Edit Assessment"
                          >
                            <Edit3 size={13} /> Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id, t.title)}
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            title="Delete Assessment"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
