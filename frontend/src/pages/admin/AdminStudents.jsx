import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, Search, Mail, Hash, Layers } from 'lucide-react';

export const AdminStudents = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStudents();
      if (res.success) {
        setStudents(res.data || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.fullName && s.fullName.toLowerCase().includes(q)) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.section && s.section.toLowerCase().includes(q))
    );
  });

  return (
    <div className="main-content admin-students">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Candidate Directory</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>All registered students across sections ({students.length} total)</p>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by student name, roll number, section..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <span className="loading-spinner" role="status" aria-label="Loading students" style={{ margin: '0 auto 1rem' }} />
            Loading student directory...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Student Name</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Roll Number</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Section</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Email Address</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#0f172a' }}>
                        {s.fullName || 'Student'}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>{s.rollNumber || 'N/A'}</td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>
                        <span className="badge badge-primary">{s.section || 'N/A'}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>{s.email}</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span className="badge badge-success">STUDENT</span>
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
