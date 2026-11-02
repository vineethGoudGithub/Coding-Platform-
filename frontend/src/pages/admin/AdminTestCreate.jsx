import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, ArrowLeft, Save, HelpCircle, Code2, Check, AlertCircle } from 'lucide-react';

export const AdminTestCreate = () => {
  const { id: editTestId } = useParams();
  const isEdit = Boolean(editTestId);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [totalMarks, setTotalMarks] = useState(10);
  const [active, setActive] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadTestForEdit();
    }
  }, [editTestId]);

  const loadTestForEdit = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTestById(editTestId);
      if (res.success && res.data) {
        const t = res.data;
        setTitle(t.title || '');
        setDescription(t.description || '');
        setDurationMinutes(t.durationMinutes || 45);
        setTotalMarks(t.totalMarks || 10);
        setActive(t.active !== undefined ? t.active : true);
        setQuestions(t.questions || []);
      }
    } catch (err) {
      showToast(err.message, 'error');
      navigate('/admin/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMcq = () => {
    const newMcq = {
      questionType: 'MCQ',
      questionOrder: questions.length + 1,
      marks: 1,
      title: `MCQ Question ${questions.length + 1}`,
      problemStatement: '',
      options: [
        { optionKey: 'A', optionText: '', isCorrect: false },
        { optionKey: 'B', optionText: '', isCorrect: false },
        { optionKey: 'C', optionText: '', isCorrect: false },
        { optionKey: 'D', optionText: '', isCorrect: false }
      ]
    };
    setQuestions([...questions, newMcq]);
  };

  const handleAddCoding = () => {
    const newCoding = {
      questionType: 'CODING',
      questionOrder: questions.length + 1,
      marks: 1,
      title: `Coding Problem ${questions.length + 1}`,
      problemStatement: '',
      codingQuestion: {
        language: 'java',
        inputFormat: 'A single integer n',
        outputFormat: 'Print result',
        constraints: '',
        sampleInput: '10',
        sampleOutput: 'Even',
        defaultTemplate: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n    }\n}',
        testCases: [
          { inputData: '10', expectedOutput: 'Even', isHidden: false, testCaseOrder: 1 },
          { inputData: '7', expectedOutput: 'Odd', isHidden: true, testCaseOrder: 2 }
        ]
      }
    };
    setQuestions([...questions, newCoding]);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Test title is required', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title,
        description,
        durationMinutes: Number(durationMinutes),
        totalMarks: Number(totalMarks),
        active,
        questions
      };

      if (isEdit) {
        await adminApi.updateTest(editTestId, payload);
        showToast('Assessment updated successfully', 'success');
      } else {
        await adminApi.createTest(payload);
        showToast('Assessment created successfully', 'success');
      }
      navigate('/admin/tests');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '0.75rem' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontWeight: 600, color: '#475569' }}>Loading assessment editor...</span>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ maxWidth: '1020px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/admin/tests" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Tests
        </Link>
        <button type="button" onClick={handleSave} className="btn btn-primary" disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Assessment'}
        </button>
      </div>

      <form onSubmit={handleSave}>
        {/* Basic Configuration Card */}
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
            {isEdit ? 'Edit Assessment Settings' : 'Create New Assessment'}
          </h2>

          <div className="form-group">
            <label className="form-label">Assessment Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Java Programming Assessment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Instructions</label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="Part A: 8 MCQs (1 mark each)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                min={1}
                className="form-control"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Marks</label>
              <input
                type="number"
                min={1}
                className="form-control"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label className="form-label">Publish Status</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.4rem' }}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active (Visible to Students)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Assessment Questions ({questions.length})</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Configure MCQs and Coding problems with hidden evaluation cases</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={handleAddMcq} className="btn btn-secondary">
              <Plus size={15} /> Add MCQ
            </button>
            <button type="button" onClick={handleAddCoding} className="btn btn-secondary">
              <Plus size={15} /> Add Coding Problem
            </button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            <HelpCircle size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
            <p>No questions added yet. Use the buttons above to add MCQs or Coding questions.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {questions.map((q, idx) => (
              <div key={idx} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e40af' }}>
                      Question {idx + 1}
                    </span>
                    <span className={`badge ${q.questionType === 'MCQ' ? 'badge-primary' : 'badge-success'}`}>
                      {q.questionType}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                      <span>Marks:</span>
                      <input
                        type="number"
                        min={1}
                        style={{ width: '60px', padding: '0.2rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        value={q.marks || 1}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[idx].marks = Number(e.target.value);
                          setQuestions(updated);
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="btn btn-ghost"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Question Title / Problem Label</label>
                  <input
                    type="text"
                    className="form-control"
                    value={q.title || ''}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[idx].title = e.target.value;
                      setQuestions(updated);
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Problem Statement / Question Text</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={q.problemStatement || ''}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[idx].problemStatement = e.target.value;
                      setQuestions(updated);
                    }}
                    required
                  />
                </div>

                {/* MCQ Options Builder */}
                {q.questionType === 'MCQ' && (
                  <div>
                    <label className="form-label">Answer Options (Select the correct radio button):</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {q.options?.map((opt, oIdx) => (
                        <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="radio"
                            name={`mcq-correct-${idx}`}
                            checked={!!opt.isCorrect}
                            onChange={() => {
                              const updated = [...questions];
                              updated[idx].options.forEach((o, i) => {
                                o.isCorrect = i === oIdx;
                              });
                              setQuestions(updated);
                            }}
                            style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                            title="Mark as correct answer"
                          />
                          <span style={{ fontWeight: 700, width: '20px' }}>{opt.optionKey}.</span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`Option ${opt.optionKey} text`}
                            value={opt.optionText}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].options[oIdx].optionText = e.target.value;
                              setQuestions(updated);
                            }}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coding Details Builder */}
                {q.questionType === 'CODING' && q.codingQuestion && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Sample Input</label>
                        <textarea
                          rows={2}
                          className="form-control"
                          value={q.codingQuestion.sampleInput || ''}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[idx].codingQuestion.sampleInput = e.target.value;
                            setQuestions(updated);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Sample Output</label>
                        <textarea
                          rows={2}
                          className="form-control"
                          value={q.codingQuestion.sampleOutput || ''}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[idx].codingQuestion.sampleOutput = e.target.value;
                            setQuestions(updated);
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Default Starter Code Template</label>
                      <textarea
                        rows={4}
                        className="form-control"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                        value={q.codingQuestion.defaultTemplate || ''}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[idx].codingQuestion.defaultTemplate = e.target.value;
                          setQuestions(updated);
                        }}
                      />
                    </div>

                    {/* Test Cases List */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                          Test Cases ({q.codingQuestion.testCases?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...questions];
                            const tcs = updated[idx].codingQuestion.testCases || [];
                            tcs.push({ inputData: '', expectedOutput: '', isHidden: true, testCaseOrder: tcs.length + 1 });
                            updated[idx].codingQuestion.testCases = tcs;
                            setQuestions(updated);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <Plus size={13} /> Add Test Case
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {q.codingQuestion.testCases?.map((tc, tcIdx) => (
                          <div key={tcIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px 40px', gap: '0.5rem', alignItems: 'center', background: '#fff', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Input data"
                              value={tc.inputData}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[idx].codingQuestion.testCases[tcIdx].inputData = e.target.value;
                                setQuestions(updated);
                              }}
                            />
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Expected output"
                              value={tc.expectedOutput}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[idx].codingQuestion.testCases[tcIdx].expectedOutput = e.target.value;
                                setQuestions(updated);
                              }}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={!!tc.isHidden}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[idx].codingQuestion.testCases[tcIdx].isHidden = e.target.checked;
                                  setQuestions(updated);
                                }}
                              />
                              <span>Hidden Case</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...questions];
                                updated[idx].codingQuestion.testCases.splice(tcIdx, 1);
                                setQuestions(updated);
                              }}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/admin/tests" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Assessment'}
          </button>
        </div>
      </form>
    </div>
  );
};
