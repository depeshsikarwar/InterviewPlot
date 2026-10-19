import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import {
  Users,
  Code2,
  Terminal,
  Mic,
  FileText,
  Briefcase,
  BarChart3,
  CalendarCheck,
  BookOpen,
  Settings,
  Play,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Sparkles,
  RefreshCw,
  Search,
  Building2,
  X,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Award,
  AlertTriangle,
  Star,
  Check,
  Layers,
  Clock,
  Zap,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CodingWorkspace } from '../components/coding/CodingWorkspace';
import { VoiceInterviewWorkspace } from '../components/voice/VoiceInterviewWorkspace';
import { MockInterviewerBanner } from '../components/interviews/MockInterviewerBanner';
import { SystemDesignStudio } from '../components/systemDesign/SystemDesignStudio';
import { CompanyPlacementKits } from '../components/placement/CompanyPlacementKits';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

// ==========================================
// 1. Coding Workspace Page
// ==========================================
export const CodingWorkspacePage: React.FC = () => {
  return <CodingWorkspace />;
};

// ==========================================
// 2. Voice Interview Page
// ==========================================
export const VoiceInterviewPage: React.FC = () => {
  return <VoiceInterviewWorkspace />;
};

// ==========================================
// 3. AI HR Interview Page (Full API Connected with Immediate Evaluation & Adaptive Follow-up)
// ==========================================
export const HRInterviewPage: React.FC = () => {
  const [step, setStep] = useState<'setup' | 'interview' | 'report'>('setup');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [lastTurnEval, setLastTurnEval] = useState<any>(null);

  const handleStart = async () => {
    try {
      const createRes = await api.post('/interviews', {
        title: `HR Behavioral: ${targetRole}`,
        interviewType: 'HR',
        mode: 'TEXT',
        difficulty,
        targetRole,
      });

      const intId = createRes.data.data.id;
      setInterviewId(intId);

      const startRes = await api.post(`/interviews/${intId}/start`);
      setCurrentQuestion(startRes.data.data.currentQuestion);
      setStep('interview');
      setAnswer('');
      setLastTurnEval(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/interviews/${interviewId}/answers`, {
        questionId: currentQuestion.id,
        answerText: answer.trim(),
      });

      if (res.data.success) {
        if (res.data.data.turnEvaluation) {
          setLastTurnEval(res.data.data.turnEvaluation);
        }

        if (res.data.data.isComplete) {
          const finishRes = await api.post(`/interviews/${interviewId}/finish`);
          setReport(finishRes.data.data);
          setStep('report');
        } else {
          setCurrentQuestion(res.data.data.nextQuestion);
          setQuestionIndex((prev) => prev + 1);
          setAnswer('');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {step === 'setup' && (
        <Card className="space-y-6 text-center py-12">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI HR Behavioral Interview</h1>
            <p className="text-xs text-slate-400">STAR methodology assessment with dynamic conversational follow-up questions</p>
          </div>
          <div className="max-w-md mx-auto grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-300">Target Role</label>
              <input
                className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-900 border-slate-700 mt-1"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300">Difficulty</label>
              <select
                className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-900 border-slate-700 mt-1"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <Button onClick={handleStart} size="lg" leftIcon={<Play className="w-4 h-4" />}>
            Start HR Interview
          </Button>
        </Card>
      )}

      {step === 'interview' && currentQuestion && (
        <div className="space-y-4">
          <MockInterviewerBanner
            currentQuestionText={currentQuestion.questionText}
            candidateAnswerText={answer}
          />

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Question {questionIndex + 1} of 5</span>
            <span className="font-mono bg-slate-800 px-2 py-1 rounded">Session Active</span>
          </div>

          {/* Turn Evaluation Feedback from Last Answer */}
          {lastTurnEval && (
            <div className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
              lastTurnEval.score === 0
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                : lastTurnEval.score >= 70
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  {lastTurnEval.score === 0 ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  Interviewer Assessment of Your Last Answer
                </span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                  lastTurnEval.score === 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-200'
                }`}>
                  Score: {lastTurnEval.score} / 100
                </span>
              </div>
              <p className="leading-relaxed">{lastTurnEval.feedback}</p>
              {lastTurnEval.weaknesses && lastTurnEval.weaknesses.length > 0 && (
                <div className="pt-1 space-y-1">
                  <p className="font-semibold text-slate-300">Critique & Improvement Areas:</p>
                  {lastTurnEval.weaknesses.slice(0, 2).map((w: string, i: number) => (
                    <p key={i} className="text-slate-400 flex items-start gap-1.5">
                      <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" /> {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <Card className="space-y-3 bg-brand-950/20 border-brand-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
              {currentQuestion.category} {currentQuestion.isFollowUp && '(Dynamic Follow-up)'}
            </span>
            <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
              "{currentQuestion.questionText}"
            </p>
          </Card>

          <Card className="space-y-3">
            <label className="text-xs font-semibold flex items-center justify-between">
              <span>Your Response (STAR: Situation, Task, Action, Result)</span>
              <span className="text-slate-400">{answer.split(/\s+/).filter(Boolean).length} words</span>
            </label>
            <textarea
              rows={6}
              className="w-full text-xs p-3 rounded-lg border dark:bg-slate-900 border-slate-700 focus-ring leading-relaxed"
              placeholder="Structure your answer with: Situation, your personal Action, and the quantifiable Result..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <div className="flex justify-end pt-2">
              <Button onClick={handleSubmitAnswer} isLoading={submitting} size="sm">
                {questionIndex < 4 ? 'Submit & Get Dynamic Follow-up' : 'Finish & Generate Report'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {step === 'report' && report && (
        <Card className="space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs text-brand-400 font-bold uppercase">Comprehensive Evaluation Report</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">HR Mock Performance Summary</h2>
            <p className="text-xs text-slate-400 mt-1">
              Overall Score:{' '}
              <strong className={`text-sm ${report.overallScore === 0 ? 'text-rose-400 font-extrabold' : report.overallScore >= 75 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}`}>
                {report.overallScore} / 100
              </strong>
              {report.overallScore === 0 && (
                <span className="ml-2 text-rose-400 text-[11px] font-semibold">(Non-Answer / Greeting Rejected)</span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 rounded bg-slate-800"><p className="text-slate-400">Relevance</p><p className="font-bold text-sm text-brand-400 mt-1">{report.relevanceScore} / 5</p></div>
            <div className="p-2.5 rounded bg-slate-800"><p className="text-slate-400">STAR Structure</p><p className="font-bold text-sm text-brand-400 mt-1">{report.structureScore} / 5</p></div>
            <div className="p-2.5 rounded bg-slate-800"><p className="text-slate-400">Specificity</p><p className="font-bold text-sm text-brand-400 mt-1">{report.specificityScore} / 5</p></div>
            <div className="p-2.5 rounded bg-slate-800"><p className="text-slate-400">Ownership</p><p className="font-bold text-sm text-brand-400 mt-1">{report.ownershipScore} / 5</p></div>
            <div className="p-2.5 rounded bg-slate-800"><p className="text-slate-400">Results/Impact</p><p className="font-bold text-sm text-brand-400 mt-1">{report.resultsScore} / 5</p></div>
          </div>
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-200">Demonstrated Strengths:</h4>
            {report.strengths?.map((s: string, idx: number) => (
              <p key={idx} className="text-slate-400 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {s}</p>
            ))}
          </div>
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-200">Key Weaknesses & Improvement Guidance:</h4>
            {report.weaknesses?.map((w: string, idx: number) => (
              <p key={idx} className="text-slate-400 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {w}</p>
            ))}
          </div>
          <Button onClick={() => setStep('setup')} variant="outline" size="sm">
            Start Another Session
          </Button>
        </Card>
      )}
    </div>
  );
};

// ==========================================
// 4. Technical Interview Page (Interviewing.io Style Multi-Turn & CS Drills)
// ==========================================
export const TechnicalInterviewPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'interview' | 'drills'>('interview');

  // Interactive Multi-Turn Technical Interview State
  const [step, setStep] = useState<'setup' | 'session' | 'report'>('setup');
  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [lastTurnEval, setLastTurnEval] = useState<any>(null);

  // CS Fundamentals Drills State
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [drillAnswer, setDrillAnswer] = useState('');
  const [drillResult, setDrillResult] = useState<any>(null);
  const [evaluatingDrill, setEvaluatingDrill] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  useEffect(() => {
    const fetchTechQuestions = async () => {
      try {
        const res = await api.get('/question-bank?category=TECHNICAL');
        if (res.data.success && res.data.data.length > 0) {
          setQuestions(res.data.data);
          const searchParams = new URLSearchParams(window.location.search);
          const targetId = searchParams.get('id');
          const matched = res.data.data.find((q: any) => q.id === targetId);
          setSelectedQuestion(matched || res.data.data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTechQuestions();
  }, []);

  // Start Interactive Multi-Turn Technical Session
  const handleStartTechnicalInterview = async () => {
    try {
      const createRes = await api.post('/interviews', {
        title: `Technical Bar-Raiser: ${targetRole}`,
        interviewType: 'TECHNICAL',
        mode: 'TEXT',
        difficulty,
        targetRole,
      });

      const intId = createRes.data.data.id;
      setInterviewId(intId);

      const startRes = await api.post(`/interviews/${intId}/start`);
      setCurrentQuestion(startRes.data.data.currentQuestion);
      setStep('session');
      setAnswer('');
      setLastTurnEval(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Answer to Multi-Turn Technical Session
  const handleSubmitTechnicalAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/interviews/${interviewId}/answers`, {
        questionId: currentQuestion.id,
        answerText: answer.trim(),
      });

      if (res.data.success) {
        if (res.data.data.turnEvaluation) {
          setLastTurnEval(res.data.data.turnEvaluation);
        }

        if (res.data.data.isComplete) {
          const finishRes = await api.post(`/interviews/${interviewId}/finish`);
          setReport(finishRes.data.data);
          setStep('report');
        } else {
          setCurrentQuestion(res.data.data.nextQuestion);
          setQuestionIndex((prev) => prev + 1);
          setAnswer('');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Single Question Drill Evaluation
  const handleEvaluateDrill = async () => {
    if (!drillAnswer.trim() || !selectedQuestion) return;
    setEvaluatingDrill(true);
    setDrillResult(null);
    try {
      const res = await api.post('/interviews/evaluate-technical', {
        question: selectedQuestion.promptText,
        answer: drillAnswer.trim(),
        topic: selectedQuestion.topic,
      });
      if (res.data.success) {
        setDrillResult(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setEvaluatingDrill(false);
    }
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).filter(Boolean).length : 0;
  const drillWordCount = drillAnswer.trim() ? drillAnswer.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top View Switcher: Interactive Bar-Raiser Session vs CS Drills Library */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" /> AI Technical & Systems Engineering Studio
          </h1>
          <p className="text-xs text-slate-400">
            Interviewing.io style rigorous technical grilling with adaptive follow-ups on database internals, concurrency, and architecture.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('interview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'interview'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Bar-Raiser Session
          </button>
          <button
            onClick={() => setViewMode('drills')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'drills'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CS Fundamentals Drills
          </button>
        </div>
      </div>

      {/* VIEW 1: LIVE INTERVIEWING.IO MULTI-TURN SESSION */}
      {viewMode === 'interview' && (
        <div className="space-y-4">
          {step === 'setup' && (
            <Card className="space-y-6 text-center py-10">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto ring-8 ring-cyan-500/5">
                <Code2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">Senior Technical Mock Interview</h2>
                <p className="text-xs text-slate-400">
                  Dynamic 5-round technical grilling. The interviewer evaluates your architectural claims and challenges your engineering trade-offs in real time.
                </p>
              </div>

              <div className="max-w-md mx-auto grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Target Role</label>
                  <input
                    className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-900 border-slate-700 mt-1"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Difficulty</label>
                  <select
                    className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-900 border-slate-700 mt-1"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleStartTechnicalInterview} size="lg" leftIcon={<Play className="w-4 h-4" />}>
                Launch Technical Bar-Raiser Session
              </Button>
            </Card>
          )}

          {step === 'session' && currentQuestion && (
            <div className="space-y-4">
              <MockInterviewerBanner
                currentQuestionText={currentQuestion.questionText}
                candidateAnswerText={answer}
              />

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Technical Round {questionIndex + 1} of 5</span>
                <span className="font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                  Live Grilling Active
                </span>
              </div>

              {/* Turn Evaluation Feedback from Last Answer */}
              {lastTurnEval && (
                <div className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                  lastTurnEval.score === 0
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                    : lastTurnEval.score >= 70
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      {lastTurnEval.score === 0 ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      Bar-Raiser Technical Critique of Last Answer
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                      lastTurnEval.score === 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-200'
                    }`}>
                      Score: {lastTurnEval.score} / 100
                    </span>
                  </div>
                  <p className="leading-relaxed">{lastTurnEval.feedback}</p>
                  {lastTurnEval.weaknesses && lastTurnEval.weaknesses.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <p className="font-semibold text-slate-300">Technical Trade-off Gaps:</p>
                      {lastTurnEval.weaknesses.slice(0, 2).map((w: string, i: number) => (
                        <p key={i} className="text-slate-400 flex items-start gap-1.5">
                          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" /> {w}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Card className="space-y-3 bg-cyan-950/20 border-cyan-500/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  {currentQuestion.category} {currentQuestion.isFollowUp && '(Dynamic Technical Follow-up)'}
                </span>
                <p className="text-base font-semibold text-white leading-relaxed">
                  "{currentQuestion.questionText}"
                </p>
              </Card>

              <Card className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Your Technical Architecture Explanation</span>
                  <span className={`font-mono ${wordCount < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {wordCount} words {wordCount < 20 && '(recommend 50-150 words)'}
                  </span>
                </div>
                <textarea
                  rows={7}
                  className="w-full text-xs p-3.5 rounded-xl border dark:bg-slate-900 border-slate-700 focus-ring leading-relaxed text-slate-100 placeholder-slate-500"
                  placeholder="Detail the internal data structures, algorithms, failure modes, concurrency guarantees, and system scaling trade-offs..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSubmitTechnicalAnswer} isLoading={submitting} size="sm" disabled={!answer.trim()}>
                    {questionIndex < 4 ? 'Submit & Receive Technical Follow-up' : 'Finish & Generate Scorecard'}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {step === 'report' && report && (
            <Card className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-cyan-400 font-bold uppercase">Senior Bar-Raiser Scorecard</span>
                  <h2 className="text-xl font-bold text-white mt-1">Technical Mock Performance Assessment</h2>
                </div>
                <span className={`text-xl font-bold px-3 py-1 rounded-full ${
                  report.overallScore === 0 ? 'bg-rose-500/20 text-rose-400' : report.overallScore >= 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  Score: {report.overallScore} / 100
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2.5 rounded bg-slate-800"><p className="text-slate-400">Architecture</p><p className="font-bold text-sm text-cyan-400 mt-1">{report.relevanceScore} / 5</p></div>
                <div className="p-2.5 rounded bg-slate-800"><p className="text-slate-400">Concurrency</p><p className="font-bold text-sm text-cyan-400 mt-1">{report.structureScore} / 5</p></div>
                <div className="p-2.5 rounded bg-slate-800"><p className="text-slate-400">Complexity Analysis</p><p className="font-bold text-sm text-cyan-400 mt-1">{report.specificityScore} / 5</p></div>
                <div className="p-2.5 rounded bg-slate-800"><p className="text-slate-400">Trade-offs</p><p className="font-bold text-sm text-cyan-400 mt-1">{report.ownershipScore} / 5</p></div>
                <div className="p-2.5 rounded bg-slate-800"><p className="text-slate-400">Resilience</p><p className="font-bold text-sm text-cyan-400 mt-1">{report.resultsScore} / 5</p></div>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-200">Demonstrated Strengths:</h4>
                {report.strengths?.map((s: string, idx: number) => (
                  <p key={idx} className="text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {s}
                  </p>
                ))}
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-200">Key Architectural Gaps & Guidance:</h4>
                {report.weaknesses?.map((w: string, idx: number) => (
                  <p key={idx} className="text-slate-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {w}
                  </p>
                ))}
              </div>

              <Button onClick={() => setStep('setup')} variant="outline" size="sm">
                Start Another Technical Session
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* VIEW 2: CS FUNDAMENTALS QUESTION LIBRARY DRILLS */}
      {viewMode === 'drills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Select a specific CS topic to drill:</span>
            {questions.length > 0 && (
              <select
                className="text-xs p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 focus-ring max-w-xs"
                value={selectedQuestion?.id || ''}
                onChange={(e) => {
                  const q = questions.find((item) => item.id === e.target.value);
                  if (q) {
                    setSelectedQuestion(q);
                    setDrillAnswer('');
                    setDrillResult(null);
                    setShowModelAnswer(false);
                  }
                }}
              >
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({q.difficulty})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedQuestion && (
            <Card className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-cyan-400 font-mono">{selectedQuestion.topic}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedQuestion.difficulty === 'Easy'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : selectedQuestion.difficulty === 'Medium'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}>
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">{selectedQuestion.promptText}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Your Technical Explanation</span>
                  <span className={`font-mono ${drillWordCount < 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {drillWordCount} words
                  </span>
                </div>
                <textarea
                  rows={7}
                  className="w-full text-xs p-3 rounded-lg border dark:bg-slate-900 border-slate-700 focus-ring leading-relaxed"
                  placeholder="Explain internal mechanisms, complexities, and operational trade-offs..."
                  value={drillAnswer}
                  onChange={(e) => setDrillAnswer(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  {showModelAnswer ? 'Hide Benchmark Answer' : 'View Benchmark Answer'}
                </button>
                <Button onClick={handleEvaluateDrill} isLoading={evaluatingDrill} size="sm" disabled={!drillAnswer.trim()}>
                  Evaluate Technical Response
                </Button>
              </div>

              {showModelAnswer && selectedQuestion.sampleAnswer && (
                <div className="p-3.5 rounded-lg bg-slate-900/90 border border-amber-500/20 text-xs space-y-1.5 animate-fadeIn">
                  <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ideal Placement Benchmark Answer
                  </span>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px]">{selectedQuestion.sampleAnswer}</p>
                </div>
              )}
            </Card>
          )}

          {drillResult && (
            <Card className={`space-y-4 border ${drillResult.score === 0 ? 'border-rose-500/50 bg-rose-950/10' : 'border-cyan-500/30'}`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-cyan-400">Engineering Drill Evaluation</span>
                <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${
                  drillResult.score === 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  Score: {drillResult.score} / 100
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{drillResult.feedback}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. Resume Analysis Page (Connected to API)
// ==========================================
export const ResumePage: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAudit = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/resumes', { resumeText });
      if (res.data.success) {
        setAnalysis(res.data.data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteSample = () => {
    setResumeText(`Alex Vance - Computer Science Graduate (2025)
Skills: Python, JavaScript, React, Node.js, PostgreSQL, Docker, Git, REST APIs, DSA
Experience: Full Stack Intern at Tech Corp. Built microservices in Node and React.
Projects: Distributed task scheduler using Redis and PostgreSQL. Handled 10k tasks/sec with 99.9% uptime.`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <FileText className="w-5 h-5 text-indigo-400" /> Resume Gap Analysis & Placement Audit
      </h1>
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Paste your resume text below for instant placement qualification analysis.</p>
          <button onClick={handlePasteSample} className="text-xs text-brand-400 hover:underline">
            Paste Sample Resume
          </button>
        </div>
        <textarea
          rows={6}
          className="w-full text-xs p-3 rounded-lg border dark:bg-slate-900 border-slate-700 focus-ring leading-relaxed"
          placeholder="Paste full resume content (education, skills, projects, experience)..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={handleAudit} isLoading={loading} size="sm">
            Analyze Resume & Extract Questions
          </Button>
        </div>
      </Card>

      {analysis && (
        <Card className="space-y-6 border-indigo-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white">Placement Readiness Score</h3>
            <span className="text-base font-extrabold text-emerald-400">{analysis.matchScore}%</span>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-200">Extracted Technical Skills:</h4>
            <div className="flex flex-wrap gap-1.5">
              {analysis.extractedSkills.map((s: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-brand-500/15 text-brand-400 border border-brand-500/20 font-mono text-[11px]">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-200">Audit Recommendations:</h4>
            {analysis.recommendations.map((rec: string, idx: number) => (
              <p key={idx} className="text-slate-400 flex items-start gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" /> {rec}</p>
            ))}
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-200">Tailored Interview Questions from Your Resume:</h4>
            {analysis.suggestedQuestions.map((q: string, idx: number) => (
              <p key={idx} className="text-slate-300 p-2 rounded bg-slate-800/60 border border-slate-700/60">"{q}"</p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ==========================================
// 6. Job Description Match Page (Connected)
// ==========================================
export const JobMatchPage: React.FC = () => {
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/job-descriptions/analyze', { rawText: jdText });
      if (res.data.success) {
        setMatchResult(res.data.data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteSampleJD = () => {
    setJdText(`Software Engineer (Campus Hiring) - Tech Solutions
Requirements:
- Strong knowledge of Data Structures and Algorithms (DSA)
- Proficiency in Python, JavaScript, and React
- Experience with PostgreSQL and REST APIs
- Familiarity with Docker and Git
- Strong verbal and written communication skills`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-amber-400" /> Job Description (JD) Skill Gap Analyzer
      </h1>
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Paste job posting requirements to compare against your skill profile.</p>
          <button onClick={handlePasteSampleJD} className="text-xs text-brand-400 hover:underline">
            Paste Sample JD
          </button>
        </div>
        <textarea
          rows={6}
          className="w-full text-xs p-3 rounded-lg border dark:bg-slate-900 border-slate-700 focus-ring leading-relaxed"
          placeholder="Paste requirements, responsibilities, and qualifications..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={handleAnalyze} isLoading={loading} size="sm">
            Analyze Match & Generate Targeted Plan
          </Button>
        </div>
      </Card>

      {matchResult && (
        <Card className="space-y-6 border-amber-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white">Role Match Percentage</h3>
            <span className="text-base font-extrabold text-emerald-400">{matchResult.matchScore}%</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-emerald-400 mb-1.5">Matching Skills Found:</p>
              <div className="flex flex-wrap gap-1">
                {matchResult.matchingSkills.map((s: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px]">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-rose-400 mb-1.5">Missing or Weak Skills:</p>
              <div className="flex flex-wrap gap-1">
                {matchResult.missingSkills.map((s: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 font-mono text-[10px]">
                    ✗ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// ==========================================
// 7. Skill Analytics Page (Connected to Recharts)
// ==========================================
export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/overview');
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Compute trend data from recent completed interviews
  const trendData = analytics?.recentInterviews && analytics.recentInterviews.length > 0
    ? analytics.recentInterviews
        .filter((i: any) => i.overallScore !== null)
        .reverse()
        .map((i: any, idx: number) => ({
          name: `Mock ${idx + 1}`,
          score: Math.round(i.overallScore),
        }))
    : [
        { name: 'Initial Diagnostic', score: 55 },
        { name: 'Mock 1 (Coding)', score: 72 },
        { name: 'Mock 2 (HR)', score: 80 },
        { name: 'Mock 3 (Technical)', score: 85 },
      ];

  const radarData = [
    { subject: 'DSA', A: 85, fullMark: 100 },
    { subject: 'DBMS', A: 82, fullMark: 100 },
    { subject: 'OOP', A: 78, fullMark: 100 },
    { subject: 'OS', A: 75, fullMark: 100 },
    { subject: 'Networks', A: 72, fullMark: 100 },
    { subject: 'STAR HR', A: 88, fullMark: 100 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-400" /> Placement Skill Analytics & History
          </h1>
          <p className="text-xs text-slate-400">
            Real-time competency radar and performance trajectory across your mock sessions.
          </p>
        </div>
        {analytics?.averageScore && (
          <div className="px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-xs">
            <span className="text-slate-400">Average Performance: </span>
            <strong className="text-brand-400 font-bold">{analytics.averageScore}%</strong>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center">
          <h3 className="text-xs font-bold text-slate-300 mb-2">Competency Radar Matrix</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis stroke="#475569" />
                <Radar name="Candidate" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col items-center">
          <h3 className="text-xs font-bold text-slate-300 mb-2">Interview Score Trajectory</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                <Bar dataKey="score" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ==========================================
// 8. Weekly Roadmap Page (Connected to API)
// ==========================================
export const RoadmapPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlan = async () => {
    try {
      const res = await api.get('/learning-plan');
      if (res.data.success) {
        setTasks(res.data.data.tasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.patch(`/learning-plan/tasks/${taskId}`, { status: nextStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/learning-plan/generate');
      if (res.data.success) {
        setTasks(res.data.data.tasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-emerald-400" /> Weekly Personalized Roadmap
        </h1>
        <Button size="sm" variant="outline" onClick={handleRegenerate} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Regenerate Roadmap
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="flex items-center justify-between text-xs p-4">
            <div className="space-y-1">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${task.priority === 'HIGH' ? 'bg-rose-500/15 text-rose-400' : 'bg-brand-500/15 text-brand-400'}`}>
                {task.priority} Priority
              </span>
              <h4 className={`font-semibold text-sm ${task.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                {task.title}
              </h4>
              <p className="text-slate-400">{task.explanation}</p>
            </div>
            <button
              onClick={() => handleToggleStatus(task.id, task.status)}
              className={`p-2 rounded-lg border transition-colors ${
                task.status === 'COMPLETED'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Toggle task completion"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 9. Question Bank Page (Real-World Placement Bank & Practice Studio)
// ==========================================
export const QuestionBankPage: React.FC = () => {
  // Top View Modes: Questions / Roadmaps, System Design Studio, Company Placement Kits
  const [activeView, setActiveView] = useState<'questions' | 'system-design' | 'placement-kits'>('questions');

  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [selectedSheet, setSelectedSheet] = useState<string>('ALL');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Progress summary (LeetCode / NeetCode style)
  const [progressSummary, setProgressSummary] = useState<any>({
    totalQuestions: 29,
    solvedCount: 0,
    attemptedCount: 0,
    bookmarkedCount: 0,
    byDifficulty: { Easy: { total: 10, solved: 0 }, Medium: { total: 17, solved: 0 }, Hard: { total: 2, solved: 0 } },
    readinessScore: 0,
  });

  // Active Practice Modal State
  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  const [practiceAnswer, setPracticeAnswer] = useState<string>('');
  const [practiceResult, setPracticeResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const fetchQuestionsAndProgress = async () => {
    try {
      const [qRes, pRes] = await Promise.all([
        api.get('/question-bank'),
        api.get('/question-bank/progress/summary'),
      ]);

      if (qRes.data.success) {
        setQuestions(qRes.data.data);
      }
      if (pRes.data.success) {
        setProgressSummary(pRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsAndProgress();
  }, []);

  // Toggle Bookmark
  const handleToggleBookmark = async (questionId: string, currentBookmarked: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Optimistic local state update
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, isBookmarked: !currentBookmarked } : q))
      );
      await api.post(`/question-bank/${questionId}/progress`, {
        isBookmarked: !currentBookmarked,
      });
      fetchQuestionsAndProgress();
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Solved Status (Mark as Solved / Todo)
  const handleToggleSolved = async (questionId: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'SOLVED' ? 'TODO' : 'SOLVED';
    try {
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, status: newStatus } : q))
      );
      await api.post(`/question-bank/${questionId}/progress`, {
        status: newStatus,
      });
      fetchQuestionsAndProgress();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter questions
  const filtered = questions.filter((q) => {
    const matchCat = selectedCategory === 'ALL' || q.category === selectedCategory;
    const matchDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    const matchComp =
      selectedCompany === 'ALL' ||
      (Array.isArray(q.companyTags) && q.companyTags.includes(selectedCompany));
    const matchSheet =
      selectedSheet === 'ALL' ||
      (Array.isArray(q.sheetTags) && q.sheetTags.includes(selectedSheet));
    const matchBookmarked = !onlyBookmarked || q.isBookmarked;
    const matchSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.topic.toLowerCase().includes(search.toLowerCase()) ||
      q.promptText.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(q.companyTags) && q.companyTags.some((c: string) => c.toLowerCase().includes(search.toLowerCase())));
    return matchCat && matchDiff && matchComp && matchSheet && matchBookmarked && matchSearch;
  });

  // Unique companies
  const companyOptions = Array.from(
    new Set(
      questions.flatMap((q) => (Array.isArray(q.companyTags) ? q.companyTags : []))
    )
  ).sort();

  // Open practice modal
  const openPractice = (q: any) => {
    setActiveQuestion(q);
    setPracticeAnswer('');
    setPracticeResult(null);
    setShowHints(false);
    setShowModelAnswer(false);
    setIsListening(false);
  };

  // Close practice modal
  const closePractice = () => {
    setActiveQuestion(null);
    setPracticeAnswer('');
    setPracticeResult(null);
    setIsListening(false);
  };

  // Toggle voice dictation
  const handleToggleVoice = () => {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        setPracticeAnswer(text.trim());
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Evaluate practice answer
  const handleEvaluatePractice = async () => {
    if (!practiceAnswer.trim() || !activeQuestion) return;
    setEvaluating(true);
    setPracticeResult(null);
    try {
      const res = await api.post(`/question-bank/${activeQuestion.id}/evaluate`, {
        answer: practiceAnswer.trim(),
      });
      if (res.data.success) {
        setPracticeResult(res.data.data);
        fetchQuestionsAndProgress();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const wordCount = practiceAnswer.trim() ? practiceAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* View Switcher: Placement Problems vs System Design Studio vs Company Hiring Kits */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveView('questions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === 'questions'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" /> LeetCode & NeetCode Placement Bank
          </button>

          <button
            onClick={() => setActiveView('system-design')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === 'system-design'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-400" /> System Design Studio (Exponent)
          </button>

          <button
            onClick={() => setActiveView('placement-kits')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === 'placement-kits'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4 text-cyan-400" /> Company Placement Kits (AmbitionBox)
          </button>
        </div>
      </div>

      {/* VIEW 2: SYSTEM DESIGN STUDIO */}
      {activeView === 'system-design' && <SystemDesignStudio />}

      {/* VIEW 3: COMPANY PLACEMENT KITS */}
      {activeView === 'placement-kits' && (
        <CompanyPlacementKits
          onSelectCompany={(company) => {
            setSelectedCompany(company);
            setActiveView('questions');
          }}
        />
      )}

      {/* VIEW 1: QUESTIONS & ROADMAPS */}
      {activeView === 'questions' && (
        <div className="space-y-6">
          {/* LeetCode / NeetCode Style Progress Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-md">
            {/* Left: Placement Readiness Gauge */}
            <div className="md:col-span-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-brand-500"
                    strokeDasharray={`${Math.max(8, progressSummary.readinessScore || 15)}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono font-bold text-sm text-white">
                  {progressSummary.readinessScore}%
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">Readiness Score</span>
                <h3 className="text-sm font-bold text-white">Campus Placement Meter</h3>
                <p className="text-[11px] text-slate-400">
                  {progressSummary.solvedCount} of {progressSummary.totalQuestions} problems solved
                </p>
              </div>
            </div>

            {/* Middle: Solved Breakdown by Difficulty */}
            <div className="md:col-span-5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold text-emerald-400">Easy</span>
                <p className="font-mono text-sm font-bold text-slate-100 mt-0.5">
                  {progressSummary.byDifficulty?.Easy?.solved || 0} / {progressSummary.byDifficulty?.Easy?.total || 10}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold text-amber-400">Medium</span>
                <p className="font-mono text-sm font-bold text-slate-100 mt-0.5">
                  {progressSummary.byDifficulty?.Medium?.solved || 0} / {progressSummary.byDifficulty?.Medium?.total || 17}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] font-bold text-rose-400">Hard</span>
                <p className="font-mono text-sm font-bold text-slate-100 mt-0.5">
                  {progressSummary.byDifficulty?.Hard?.solved || 0} / {progressSummary.byDifficulty?.Hard?.total || 2}
                </p>
              </div>
            </div>

            {/* Right: Bookmarks & Filter Pill */}
            <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
              <button
                onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  onlyBookmarked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{onlyBookmarked ? 'Showing Bookmarks' : `Bookmarks (${progressSummary.bookmarkedCount || 0})`}</span>
              </button>
            </div>
          </div>

          {/* Curated Sheet Roadmaps Filter Toolbar (Striver SDE / Blind 75 / NeetCode 150) */}
          <div className="space-y-3">
            {/* Sheet Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3">
              {[
                { label: 'All Problems', value: 'ALL' },
                { label: '🔥 Striver SDE 75', value: 'Striver SDE 75' },
                { label: '⚡ Blind 75', value: 'Blind 75' },
                { label: '🧠 NeetCode 150', value: 'NeetCode 150' },
                { label: '🚀 FAANG Fast-Track', value: 'FAANG Fast-Track' },
                { label: '🏢 TCS & Mass Recruiter', value: 'TCS & Mass Recruiter' },
              ].map((sheet) => (
                <button
                  key={sheet.value}
                  onClick={() => setSelectedSheet(sheet.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedSheet === sheet.value
                      ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {sheet.label}
                </button>
              ))}
            </div>

            {/* Category, Difficulty & Company Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: 'All', value: 'ALL' },
                  { label: 'Coding (DSA)', value: 'CODING' },
                  { label: 'CS Fundamentals', value: 'TECHNICAL' },
                  { label: 'HR Behavioral', value: 'HR' },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      selectedCategory === cat.value
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Company & Search */}
              <div className="flex items-center gap-2">
                <select
                  className="text-xs p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 focus-ring"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  <option value="ALL">All Companies</option>
                  {companyOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    className="text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 placeholder-slate-500 w-full focus-ring"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Question Cards Grid */}
          <div className="grid gap-2.5">
            {filtered.map((q) => {
              const isSolved = q.status === 'SOLVED';
              const isAttempted = q.status === 'ATTEMPTED';
              const isBookmarked = q.isBookmarked;

              return (
                <Card
                  key={q.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs p-4 transition-all hover:border-slate-700 ${
                    isSolved ? 'border-emerald-500/30 bg-emerald-950/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Mark / Checkbox */}
                    <button
                      onClick={(e) => handleToggleSolved(q.id, q.status, e)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSolved
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : isAttempted
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'border-slate-700 hover:border-slate-500 bg-slate-900 text-transparent'
                      }`}
                      title={isSolved ? 'Solved! Click to unmark' : 'Mark as Solved'}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Difficulty Pill */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.difficulty === 'Easy'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : q.difficulty === 'Medium'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        }`}>
                          {q.difficulty}
                        </span>

                        {/* Topic Pill */}
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                          {q.topic}
                        </span>

                        {/* Optimal Complexity Pill */}
                        {q.optimalComplexity && (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                            {q.optimalComplexity.time} • {q.optimalComplexity.space}
                          </span>
                        )}

                        {/* Company Tags */}
                        {Array.isArray(q.companyTags) && q.companyTags.slice(0, 3).map((comp: string) => (
                          <span key={comp} className="text-[9px] font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                            {comp}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-100 text-sm hover:text-brand-400 transition-colors">
                          {q.title}
                        </h4>
                      </div>

                      <p className="text-slate-400 line-clamp-1 text-[11px] leading-relaxed font-sans">{q.promptText}</p>
                    </div>
                  </div>

                  {/* Actions & Bookmark Star */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleBookmark(q.id, isBookmarked, e)}
                      className={`p-2 rounded-lg border transition-colors ${
                        isBookmarked
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                    </button>

                    {q.category === 'CODING' ? (
                      <>
                        <a href={`/coding?problemId=${q.id}`}>
                          <Button size="sm" variant="primary">Solve in Monaco</Button>
                        </a>
                        <Button size="sm" variant="outline" onClick={() => openPractice(q)}>
                          AI Practice
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => openPractice(q)}>
                        {q.category === 'HR' ? 'Practice STAR' : 'Practice Tech'}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}

            {filtered.length === 0 && !loading && (
              <div className="text-center py-12 text-slate-500 text-xs">
                No questions found matching your filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Interactive AI Practice Modal / Drawer     */}
      {/* ========================================== */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeQuestion.difficulty === 'Easy'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : activeQuestion.difficulty === 'Medium'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                  }`}>
                    {activeQuestion.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">{activeQuestion.topic}</span>
                  {activeQuestion.optimalComplexity && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                      {activeQuestion.optimalComplexity.time} • {activeQuestion.optimalComplexity.space}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white">{activeQuestion.title}</h2>
              </div>
              <button
                onClick={closePractice}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Modal Mock Interviewer Banner */}
            <MockInterviewerBanner
              currentQuestionText={activeQuestion.promptText}
              candidateAnswerText={practiceAnswer}
              isListening={isListening}
            />

            {/* Problem Statement Card */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Interview Prompt</span>
                <div className="flex gap-1">
                  {Array.isArray(activeQuestion.companyTags) && activeQuestion.companyTags.map((c: string) => (
                    <span key={c} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-line">{activeQuestion.promptText}</p>
            </div>

            {/* Answer Input Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  {activeQuestion.category === 'HR'
                    ? 'Your STAR Answer (Situation, Task, Action, Result)'
                    : 'Your Technical Response & Complexity Analysis'}
                </span>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[11px] ${wordCount < 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {wordCount} words {wordCount < 15 && '(min 20 words for evaluation)'}
                  </span>
                  <button
                    onClick={handleToggleVoice}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border transition-colors ${
                      isListening
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                    title="Dictate with voice"
                  >
                    <Mic className="w-3 h-3" />
                    {isListening ? 'Listening...' : 'Voice Input'}
                  </button>
                </div>
              </div>

              <textarea
                rows={6}
                className="w-full text-xs p-3 rounded-lg border dark:bg-slate-950 border-slate-700 focus-ring leading-relaxed"
                placeholder={
                  activeQuestion.category === 'HR'
                    ? 'Describe the Situation, your specific Task, the exact Action you took, and quantifiable Results achieved...'
                    : 'Explain the internal architecture, algorithmic time/space complexities, mechanisms, and operational trade-offs...'
                }
                value={practiceAnswer}
                onChange={(e) => setPracticeAnswer(e.target.value)}
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setShowModelAnswer(!showModelAnswer)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                {showModelAnswer ? 'Hide Model Benchmark' : 'View Model Benchmark'}
              </button>

              <Button
                onClick={handleEvaluatePractice}
                isLoading={evaluating}
                size="sm"
                disabled={!practiceAnswer.trim()}
              >
                Evaluate Answer with AI
              </Button>
            </div>

            {/* Model Benchmark Comparison */}
            {showModelAnswer && activeQuestion.sampleAnswer && (
              <div className="p-3.5 rounded-lg bg-slate-950 border border-amber-500/20 text-xs space-y-1.5 animate-fadeIn">
                <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ideal Placement Benchmark Answer
                </span>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px] whitespace-pre-line">{activeQuestion.sampleAnswer}</p>
              </div>
            )}

            {/* Real AI Evaluation Results */}
            {practiceResult && (
              <div className={`p-4 rounded-xl border space-y-3 animate-fadeIn ${
                practiceResult.overallScore === 0 || practiceResult.score === 0
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-950 border-cyan-500/30'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-cyan-400">AI Placement Evaluation</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    (practiceResult.overallScore ?? practiceResult.score) === 0
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : (practiceResult.overallScore ?? practiceResult.score) >= 75
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    Score: {practiceResult.overallScore ?? practiceResult.score} / 100
                  </span>
                </div>

                {/* Critical Greeting / Non-Answer Rejection */}
                {(practiceResult.overallScore ?? practiceResult.score) === 0 ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-rose-300 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{practiceResult.feedback || 'Casual greeting or non-answer rejected.'}</span>
                    </div>
                    <div className="space-y-1 text-slate-300">
                      {practiceResult.weaknesses?.map((w: string, idx: number) => (
                        <p key={idx} className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" /> {w}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-300 leading-relaxed text-[11px]">{practiceResult.feedback}</p>

                    {practiceResult.strengths?.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-200 text-[11px]">Key Strengths Demonstrated:</p>
                        {practiceResult.strengths.map((s: string, idx: number) => (
                          <p key={idx} className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {s}
                          </p>
                        ))}
                      </div>
                    )}

                    {practiceResult.weaknesses?.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-200 text-[11px]">Improvement Guidance:</p>
                        {practiceResult.weaknesses.map((w: string, idx: number) => (
                          <p key={idx} className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {w}
                          </p>
                        ))}
                      </div>
                    )}

                    {practiceResult.starBreakdown && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="font-bold text-brand-400">Situation:</span>
                          <p className="text-slate-300 mt-0.5">{practiceResult.starBreakdown.situation}</p>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="font-bold text-brand-400">Task:</span>
                          <p className="text-slate-300 mt-0.5">{practiceResult.starBreakdown.task}</p>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="font-bold text-brand-400">Action:</span>
                          <p className="text-slate-300 mt-0.5">{practiceResult.starBreakdown.action}</p>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="font-bold text-brand-400">Result:</span>
                          <p className="text-slate-300 mt-0.5">{practiceResult.starBreakdown.result}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 10. Profile Page
// ==========================================
export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.profile?.fullName || user?.fullName || '',
    targetRole: user?.profile?.targetRole || 'Full Stack Engineer',
    experienceLevel: user?.profile?.experienceLevel || 'Fresher',
    dailyStudyMinutes: user?.profile?.dailyStudyMinutes || 60,
    education: user?.profile?.education || 'B.Tech Computer Science',
    careerGoals: user?.profile?.careerGoals || 'Crack tier-1 placement technical interviews.',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/profile', formData);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Candidate Profile & Placement Goals</h1>
      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold">Target Job Role</label>
              <input
                className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-900 border-slate-700 mt-1"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Experience Level</label>
              <input
                className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-900 border-slate-700 mt-1"
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold">Daily Study Time (Minutes)</label>
            <input
              type="number"
              className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-900 border-slate-700 mt-1"
              value={formData.dailyStudyMinutes}
              onChange={(e) => setFormData({ ...formData, dailyStudyMinutes: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Career Goals</label>
            <textarea
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-900 border-slate-700 mt-1"
              value={formData.careerGoals}
              onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Button type="submit">Save Profile Changes</Button>
            {saved && <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Changes saved!</span>}
          </div>
        </form>
      </Card>
    </div>
  );
};

// ==========================================
// 11. Settings & GDPR Page
// ==========================================
export const SettingsPage: React.FC = () => {
  const { logout } = useAuth();

  const handleExport = () => {
    window.location.href = '/api/v1/account/export';
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete your account? All interview data and recordings will be permanently purged.')) {
      await api.delete('/account');
      await logout();
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Settings className="w-5 h-5 text-slate-400" /> Account & Privacy Settings
      </h1>
      <Card className="space-y-4 text-xs">
        <h3 className="font-bold text-slate-200">Data Portability & GDPR Compliance</h3>
        <p className="text-slate-400">
          Download a complete JSON export of all your profile attributes, interview question answers, speech durations, and code submissions.
        </p>
        <div className="flex gap-3 pt-2">
          <Button size="sm" variant="outline" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
            Export All My Data (JSON)
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete} leftIcon={<Trash2 className="w-4 h-4" />}>
            Delete Account & Purge Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
