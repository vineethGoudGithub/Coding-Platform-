import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { testApi, codeApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Clock,
  Send,
  Play,
  RotateCcw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Check,
  X,
  Maximize2
} from 'lucide-react';

export const TestExamination = () => {
  const { id: attemptId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Test state
  const [attempt, setAttempt] = useState(null);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // User answers state: { [questionId]: { selectedOptionId, codingDraft, markedForReview, answered } }
  const [answers, setAnswers] = useState({});

  // Timer state (seconds)
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Coding execution state (scoped per question)
  const [customInputs, setCustomInputs] = useState({});
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);

  // Final submission confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittingFinal, setSubmittingFinal] = useState(false);

  // Ref to track latest answers for debounced autosave
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // 1. Initial Load of Attempt and Questions
  useEffect(() => {
    loadAttempt();
  }, [attemptId]);

  const loadAttempt = async () => {
    try {
      setLoading(true);
      const res = await testApi.getAttempt(attemptId);
      if (res.success && res.data) {
        const data = res.data;
        if (data.status === 'SUBMITTED') {
          navigate(`/student/result/${attemptId}`, { replace: true });
          return;
        }

        setAttempt(data);
        setTest(data.test);
        const qList = data.test?.questions || [];
        setQuestions(qList);

        // Populate answers map
        const ansMap = {};
        if (data.answers) {
          data.answers.forEach((ans) => {
            ansMap[ans.questionId] = {
              selectedOptionId: ans.selectedOptionId,
              codingDraft: ans.codingDraft,
              markedForReview: !!ans.markedForReview,
              answered: !!ans.answered
            };
          });
        }
        setAnswers(ansMap);

        // Initialize timer from server
        setRemainingSeconds(data.remainingSeconds || 0);
      }
    } catch (err) {
      showToast(err.message, 'error');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // 2. Countdown Timer
  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit('Time limit reached. Auto-submitting test.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds > 0]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 3. Browser Refresh / Leave Protection & Anti-Cheat Monitoring
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have an active test session in progress. Are you sure you want to leave?';
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        testApi.logAudit(attemptId, {
          eventType: 'TAB_SWITCH',
          eventData: 'Candidate navigated away from assessment tab'
        }).catch(() => {});
        showToast('Warning: Tab switch detected and logged for instructor review.', 'info', 4000);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [attemptId]);

  // Current Question
  const currentQuestion = questions[currentIndex];

  // Active custom input for the current coding question (defaults to sampleInput)
  const activeCustomInput =
    currentQuestion && currentQuestion.questionType === 'CODING'
      ? (customInputs[currentQuestion.id] !== undefined
          ? customInputs[currentQuestion.id]
          : (currentQuestion.codingQuestion?.sampleInput || ''))
      : '';

  // Clear execution panel outputs when switching questions
  useEffect(() => {
    setRunResult(null);
    setSubmitResult(null);
  }, [currentIndex]);

  // 4. MCQ Answer Selection
  const handleSelectOption = async (optionId) => {
    if (!currentQuestion) return;

    const updated = {
      ...answers,
      [currentQuestion.id]: {
        ...(answers[currentQuestion.id] || {}),
        selectedOptionId: optionId,
        answered: true
      }
    };
    setAnswers(updated);

    try {
      await testApi.saveAnswer(attemptId, {
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
        markedForReview: answers[currentQuestion.id]?.markedForReview || false
      });
    } catch (err) {
      console.warn('Autosave MCQ failed:', err.message);
    }
  };

  // 5. Coding Editor Draft Change (Debounced Save)
  const handleCodeChange = (newCode) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || {}),
        codingDraft: newCode,
        answered: !!newCode && newCode.trim().length > 0
      }
    }));
  };

  // Periodic autosave for coding draft
  useEffect(() => {
    if (!currentQuestion || currentQuestion.questionType !== 'CODING') return;

    const timer = setTimeout(() => {
      const currentDraft = answersRef.current[currentQuestion.id]?.codingDraft;
      if (currentDraft !== undefined) {
        testApi.saveAnswer(attemptId, {
          questionId: currentQuestion.id,
          codingDraft: currentDraft,
          markedForReview: answersRef.current[currentQuestion.id]?.markedForReview || false
        }).catch(() => {});
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [answers[currentQuestion?.id]?.codingDraft, currentIndex]);

  // 6. Toggle Marked For Review
  const handleToggleReview = async () => {
    if (!currentQuestion) return;

    const currentMarked = !!answers[currentQuestion.id]?.markedForReview;
    const updated = {
      ...answers,
      [currentQuestion.id]: {
        ...(answers[currentQuestion.id] || {}),
        markedForReview: !currentMarked
      }
    };
    setAnswers(updated);

    try {
      await testApi.saveAnswer(attemptId, {
        questionId: currentQuestion.id,
        selectedOptionId: answers[currentQuestion.id]?.selectedOptionId,
        codingDraft: answers[currentQuestion.id]?.codingDraft,
        markedForReview: !currentMarked
      });
    } catch (err) {
      console.warn('Save mark for review failed:', err.message);
    }
  };

  // 7. Run Code against Sample or Custom Input
  const handleRunCode = async () => {
    if (!currentQuestion) return;
    const sourceCode = answers[currentQuestion.id]?.codingDraft || currentQuestion.codingQuestion?.defaultTemplate || '';

    try {
      setExecuting(true);
      setRunResult(null);
      setSubmitResult(null);

      const stdin =
        (customInputs[currentQuestion.id] !== undefined
          ? customInputs[currentQuestion.id]
          : currentQuestion.codingQuestion?.sampleInput) || '';
      const res = await codeApi.runCode({
        sourceCode,
        language: 'java',
        stdin
      });

      if (res.success && res.data) {
        setRunResult(res.data);
        showToast('Code executed', 'info');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setExecuting(false);
    }
  };

  // 8. Submit Code against Hidden Test Cases
  const handleSubmitCode = async () => {
    if (!currentQuestion) return;
    const sourceCode = answers[currentQuestion.id]?.codingDraft || currentQuestion.codingQuestion?.defaultTemplate || '';

    try {
      setSubmittingCode(true);
      setSubmitResult(null);

      const res = await codeApi.submitCode({
        attemptId: Number(attemptId),
        questionId: currentQuestion.id,
        sourceCode,
        language: 'java'
      });

      if (res.success && res.data) {
        setSubmitResult(res.data);
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: {
            ...(prev[currentQuestion.id] || {}),
            answered: true
          }
        }));
        showToast(res.data.message || 'Code submitted', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingCode(false);
    }
  };

  // Reset to default template
  const handleResetTemplate = () => {
    if (!currentQuestion || !currentQuestion.codingQuestion) return;
    const template = currentQuestion.codingQuestion.defaultTemplate || '';
    handleCodeChange(template);
    showToast('Code reset to default template', 'info');
  };

  // 9. Final Test Submission
  const handleAutoSubmit = async (reason) => {
    showToast(reason, 'info');
    performFinalSubmit();
  };

  const performFinalSubmit = async () => {
    try {
      setSubmittingFinal(true);
      const res = await testApi.submitAttempt(attemptId);
      if (res.success) {
        showToast('Assessment submitted successfully!', 'success');
        navigate(`/student/result/${attemptId}`, { replace: true });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingFinal(false);
      setShowSubmitModal(false);
    }
  };

  // Count answered vs unanswered
  const answeredCount = questions.filter((q) => answers[q.id]?.answered).length;
  const unansweredCount = questions.length - answeredCount;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '0.75rem' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontWeight: 600, color: '#475569' }}>Loading assessment session...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* 1. Assessment Top Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Test Name & Student */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{test?.title || 'Java Test KU'}</h1>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Candidate: <strong>{user?.fullName || user?.email}</strong> | Roll: <strong>{user?.rollNumber || 'N/A'}</strong>
            </div>
          </div>
        </div>

        {/* Center: Prominent Timer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: remainingSeconds < 300 ? '#fef2f2' : '#f0fdf4',
          color: remainingSeconds < 300 ? '#b91c1c' : '#15803d',
          border: remainingSeconds < 300 ? '1px solid #fecaca' : '1px solid #bbf7d0',
          padding: '0.45rem 1.1rem',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '1.1rem',
          letterSpacing: '0.04em'
        }}>
          <Clock size={20} />
          <span>TIME REMAINING: {formatTimer(remainingSeconds)}</span>
        </div>

        {/* Right: Submit Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="btn btn-success"
            style={{ padding: '0.6rem 1.4rem', fontWeight: 600, fontSize: '0.9rem' }}
          >
            <Send size={16} /> SUBMIT TEST
          </button>
        </div>
      </header>

      {/* 2. Main Examination Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
        {/* Left: Active Question Area */}
        <div style={{ overflowY: 'auto', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column' }}>
          {currentQuestion && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Question Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e40af' }}>
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className={`badge ${currentQuestion.questionType === 'MCQ' ? 'badge-primary' : 'badge-success'}`}>
                    {currentQuestion.questionType}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                    ({currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`btn ${answers[currentQuestion.id]?.markedForReview ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{
                    color: answers[currentQuestion.id]?.markedForReview ? '#b45309' : '#64748b',
                    borderColor: answers[currentQuestion.id]?.markedForReview ? '#fde68a' : 'transparent',
                    background: answers[currentQuestion.id]?.markedForReview ? '#fffbeb' : 'transparent'
                  }}
                >
                  <Flag size={15} />
                  <span>{answers[currentQuestion.id]?.markedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* A. MCQ QUESTION VIEW */}
              {currentQuestion.questionType === 'MCQ' && (
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    {currentQuestion.problemStatement}
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '750px' }}>
                    {currentQuestion.options?.map((option) => {
                      const isSelected = answers[currentQuestion.id]?.selectedOptionId === option.id;
                      return (
                        <div
                          key={option.id}
                          onClick={() => handleSelectOption(option.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem 1.25rem',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 150ms ease'
                          }}
                        >
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: isSelected ? '6px solid #2563eb' : '2px solid #94a3b8',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }} />
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.95rem', color: '#1e293b' }}>
                            <strong style={{ color: isSelected ? '#1d4ed8' : '#64748b' }}>{option.optionKey}.</strong>
                            <span>{option.optionText}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* B. CODING QUESTION VIEW */}
              {currentQuestion.questionType === 'CODING' && (
                <div style={{ display: 'grid', gridTemplateColumns: '42% 58%', gap: '1.25rem', flex: 1, minHeight: '520px' }}>
                  {/* Left: Problem Specs */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                      {currentQuestion.title}
                    </h3>
                    <p style={{ color: '#334155', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.25rem', whiteSpace: 'pre-line' }}>
                      {currentQuestion.problemStatement}
                    </p>

                    {currentQuestion.codingQuestion?.inputFormat && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Input Format</h4>
                        <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.875rem', marginTop: '0.35rem', border: '1px solid #e2e8f0' }}>
                          {currentQuestion.codingQuestion.inputFormat}
                        </div>
                      </div>
                    )}

                    {currentQuestion.codingQuestion?.outputFormat && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Output Format</h4>
                        <div style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.875rem', marginTop: '0.35rem', border: '1px solid #e2e8f0' }}>
                          {currentQuestion.codingQuestion.outputFormat}
                        </div>
                      </div>
                    )}

                    {currentQuestion.codingQuestion?.sampleInput && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sample Input</h4>
                        <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                          {currentQuestion.codingQuestion.sampleInput}
                        </pre>
                      </div>
                    )}

                    {currentQuestion.codingQuestion?.sampleOutput && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expected Output</h4>
                        <pre style={{ background: '#0f172a', color: '#4ade80', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                          {currentQuestion.codingQuestion.sampleOutput}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Right: Monaco Code Editor & Execution Panel */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Editor Toolbar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', color: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '8px 8px 0 0', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileCode size={16} style={{ color: '#60a5fa' }} />
                        <span style={{ fontWeight: 600 }}>Main.java (OpenJDK 21)</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={handleResetTemplate}
                          className="btn btn-ghost"
                          style={{ color: '#cbd5e1', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          title="Reset to default template"
                        >
                          <RotateCcw size={13} /> Reset
                        </button>
                      </div>
                    </div>

                    {/* Monaco Editor Container */}
                    <div style={{ borderRadius: '0 0 8px 8px', overflow: 'hidden', border: '1px solid #334155', minHeight: '300px', flex: 1 }}>
                      <Editor
                        height="100%"
                        language="java"
                        theme="vs-dark"
                        value={
                          answers[currentQuestion.id]?.codingDraft !== undefined
                            ? answers[currentQuestion.id].codingDraft
                            : currentQuestion.codingQuestion?.defaultTemplate || ''
                        }
                        onChange={handleCodeChange}
                        options={{
                          fontSize: 14,
                          fontFamily: 'JetBrains Mono, monospace',
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 4,
                          lineNumbers: 'on',
                          formatOnPaste: true,
                          formatOnType: true
                        }}
                      />
                    </div>

                    {/* Action Buttons: RUN CODE & SUBMIT CODE */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Shortcut: Click Run or press Run Code
                      </span>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                          type="button"
                          onClick={handleRunCode}
                          className="btn btn-secondary"
                          disabled={executing || submittingCode}
                          style={{ padding: '0.55rem 1rem', fontWeight: 600 }}
                        >
                          <Play size={16} />
                          {executing ? 'Executing...' : 'RUN CODE'}
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitCode}
                          className="btn btn-primary"
                          disabled={executing || submittingCode}
                          style={{ padding: '0.55rem 1.25rem', fontWeight: 600 }}
                        >
                          <Check size={16} />
                          {submittingCode ? 'Evaluating...' : 'SUBMIT CODE'}
                        </button>
                      </div>
                    </div>

                    {/* Custom Stdin Input Drawer */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Custom Stdin (Input to Scanner):</label>
                        <button
                          type="button"
                          onClick={() => {
                            const sample = currentQuestion.codingQuestion?.sampleInput || '';
                            setCustomInputs((prev) => ({
                              ...prev,
                              [currentQuestion.id]: sample
                            }));
                            showToast('Loaded sample input into Stdin', 'info');
                          }}
                          style={{ fontSize: '0.75rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Use Sample Input
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        className="form-control"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                        placeholder="Provide test input lines here..."
                        value={activeCustomInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomInputs((prev) => ({
                            ...prev,
                            [currentQuestion.id]: val
                          }));
                        }}
                      />
                    </div>

                    {/* Execution / Evaluation Output Panel */}
                    {(runResult || submitResult) && (
                      <div style={{ background: '#0f172a', color: '#f8fafc', borderRadius: '8px', padding: '1rem', border: '1px solid #334155' }}>
                        {/* Sample Run Output */}
                        {runResult && (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#94a3b8' }}>Run Output:</span>
                              <span className={`badge ${runResult.status === 'Accepted' ? 'badge-success' : 'badge-danger'}`}>
                                {runResult.status}
                              </span>
                            </div>

                            {runResult.stdout && (
                              <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>STDOUT:</span>
                                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#38bdf8' }}>{runResult.stdout}</pre>
                              </div>
                            )}

                            {runResult.compileOutput && (
                              <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#f87171' }}>COMPILATION ERROR:</span>
                                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: '#fca5a5' }}>{runResult.compileOutput}</pre>
                              </div>
                            )}

                            {runResult.stderr && (
                              <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#fb923c' }}>RUNTIME ERROR (STDERR):</span>
                                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: '#fed7aa' }}>{runResult.stderr}</pre>
                              </div>
                            )}

                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
                              Execution Time: {runResult.executionTime}s {runResult.memory ? `| Memory: ${runResult.memory} KB` : ''}
                            </div>
                          </div>
                        )}

                        {/* Hidden Test Cases Submission Result */}
                        {submitResult && (
                          <div style={{ marginTop: runResult ? '0.75rem' : 0, paddingTop: runResult ? '0.75rem' : 0, borderTop: runResult ? '1px solid #334155' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: submitResult.scoreAwarded > 0 ? '#4ade80' : '#f87171' }}>
                                Hidden Test Cases: {submitResult.passedCount} / {submitResult.totalCount} passed
                              </span>
                              <span className={`badge ${submitResult.scoreAwarded > 0 ? 'badge-success' : 'badge-danger'}`}>
                                Coding Score: {submitResult.scoreAwarded} / {currentQuestion.marks}
                              </span>
                            </div>

                            {/* Safe Test Results Checklist */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                              {submitResult.testResults?.map((tr) => (
                                <div
                                  key={tr.testCaseNumber}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '4px',
                                    background: tr.passed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: tr.passed ? '#4ade80' : '#f87171',
                                    fontSize: '0.78rem',
                                    fontWeight: 600
                                  }}
                                >
                                  {tr.passed ? <Check size={12} /> : <X size={12} />}
                                  <span>Test Case {tr.testCaseNumber}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Footer (Previous / Next) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="btn btn-secondary"
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {answeredCount} of {questions.length} answered
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="btn btn-primary"
                  disabled={currentIndex === questions.length - 1}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Question Navigator Panel */}
        <aside style={{ background: '#ffffff', borderLeft: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              Question Navigator
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Jump directly to any question</p>
          </div>

          {/* Navigator Grid */}
          <div className="nav-grid">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isCurrent = idx === currentIndex;
              const isAnswered = !!ans?.answered;
              const isMarked = !!ans?.markedForReview;

              let btnClass = 'nav-btn';
              if (isCurrent) btnClass += ' active';
              if (isAnswered) btnClass += ' answered';
              if (isMarked) btnClass += ' marked';

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setRunResult(null);
                    setSubmitResult(null);
                  }}
                  className={btnClass}
                  title={`Question ${idx + 1} (${q.questionType})`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#dcfce7', border: '1px solid #86efac' }} />
              <span>Answered ({answeredCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#ffffff', border: '1px solid #cbd5e1' }} />
              <span>Not Answered ({unansweredCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#fef3c7', border: '1px solid #fcd34d' }} />
              <span>Marked for Review</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '3px', border: '2px solid #2563eb' }} />
              <span>Current Question</span>
            </div>
          </div>

          {/* Part A & Part B summary */}
          <div style={{ fontSize: '0.825rem', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Structure:</div>
            <div>• Part A: Q1 - Q8 (8 MCQs × 1M)</div>
            <div>• Part B: Q9 - Q10 (2 Coding × 1M)</div>
            <div style={{ marginTop: '0.4rem', fontWeight: 600 }}>Total: 10 Marks</div>
          </div>
        </aside>
      </div>

      {/* 3. Final Submit Confirmation Modal as required */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: unansweredCount > 0 ? '#b45309' : '#059669', marginBottom: '1rem' }}>
              <AlertTriangle size={28} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Submit Assessment?</h3>
            </div>

            {unansweredCount > 0 ? (
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                You still have <strong>{unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}</strong> out of {questions.length}.
                <br /><br />
                Once submitted, you cannot modify your answers or re-enter the test. Are you sure you want to proceed?
              </p>
            ) : (
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                You have answered all {questions.length} questions.
                <br /><br />
                Are you sure you want to submit your assessment and view your final score?
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="btn btn-secondary"
                disabled={submittingFinal}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performFinalSubmit}
                className="btn btn-success"
                style={{ padding: '0.65rem 1.4rem' }}
                disabled={submittingFinal}
              >
                {submittingFinal ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
