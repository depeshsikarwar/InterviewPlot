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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CodingWorkspace } from '../components/coding/CodingWorkspace';
import { VoiceInterviewWorkspace } from '../components/voice/VoiceInterviewWorkspace';
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
// 3. AI HR Interview Page (Full API Connected)
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

      if (res.data.data.isComplete) {
        const finishRes = await api.post(`/interviews/${interviewId}/finish`);
        setReport(finishRes.data.data);
        setStep('report');
      } else {
        setCurrentQuestion(res.data.data.nextQuestion);
        setQuestionIndex((prev) => prev + 1);
        setAnswer('');
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
            <p className="text-xs text-slate-400">STAR methodology assessment with conversational follow-up questions</p>
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
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Question {questionIndex + 1} of 5</span>
            <span className="font-mono bg-slate-800 px-2 py-1 rounded">Session Active</span>
          </div>

          <Card className="space-y-3 bg-brand-950/20 border-brand-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
              {currentQuestion.category} {currentQuestion.isFollowUp && '(Follow-up)'}
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
                {questionIndex < 4 ? 'Submit & Next Question' : 'Finish & Generate Report'}
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
              Overall Score: <strong className="text-emerald-400 text-sm">{report.overallScore} / 100</strong>
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
// 4. Technical Interview Page
// ==========================================
export const TechnicalInterviewPage: React.FC = () => {
  const [topic, setTopic] = useState('DBMS: Indexing');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sampleTechnicalQ = "Explain how a B-Tree index improves query speed in a relational database like PostgreSQL. What are the trade-offs of having too many indexes on a table?";

  const handleEvaluate = () => {
    setLoading(true);
    setTimeout(() => {
      setResult({
        score: answer.toLowerCase().includes('o(log n)') || answer.toLowerCase().includes('write') ? 85 : 70,
        feedback: 'Accurately articulated the tree search complexity and mentioned write amplification trade-offs.',
        strengths: ['Identified log N search optimization.', 'Addressed write latency overhead.'],
        weaknesses: ['Could mention composite index column ordering rules.'],
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Code2 className="w-5 h-5 text-cyan-400" /> AI Technical Interview Session
      </h1>
      <Card className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <span className="font-bold text-cyan-400">{topic}</span>
          <p className="text-sm font-semibold text-white leading-relaxed">{sampleTechnicalQ}</p>
        </div>
        <textarea
          rows={6}
          className="w-full text-xs p-3 rounded-lg border dark:bg-slate-900 border-slate-700 focus-ring leading-relaxed"
          placeholder="Explain the internal node hierarchy, logarithmic search time, and write amplification when rows are inserted or updated..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={handleEvaluate} isLoading={loading} size="sm">
            Evaluate Technical Response
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="space-y-4 border-cyan-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-cyan-400">Technical Evaluation</span>
            <span className="text-sm font-bold text-emerald-400">Score: {result.score} / 100</span>
          </div>
          <p className="text-xs text-slate-300">{result.feedback}</p>
          <div className="text-xs space-y-1">
            <p className="font-bold text-slate-200">Strengths:</p>
            {result.strengths.map((s: string, i: number) => (
              <p key={i} className="text-slate-400 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {s}</p>
            ))}
          </div>
        </Card>
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
  const radarData = [
    { subject: 'DSA', A: 85, fullMark: 100 },
    { subject: 'DBMS', A: 80, fullMark: 100 },
    { subject: 'OOP', A: 75, fullMark: 100 },
    { subject: 'OS', A: 70, fullMark: 100 },
    { subject: 'Networks', A: 68, fullMark: 100 },
    { subject: 'STAR HR', A: 88, fullMark: 100 },
  ];

  const trendData = [
    { name: 'Mock 1', score: 65 },
    { name: 'Mock 2', score: 72 },
    { name: 'Mock 3', score: 78 },
    { name: 'Mock 4', score: 84 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-brand-400" /> Placement Skill Analytics & History
      </h1>

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
// 9. Question Bank Page (Real-World Placement Bank)
// ==========================================
export const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get('/question-bank');
        if (res.data.success) {
          setQuestions(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const filtered = questions.filter((q) => {
    const matchCat = selectedCategory === 'ALL' || q.category === selectedCategory;
    const matchSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.topic.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" /> Verified Placement Question Library
          </h1>
          <p className="text-xs text-slate-400">
            Real questions curated from top tech company placements, Amazon leadership interviews, and Striver's SDE sheet.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search questions or topics..."
          className="text-xs px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 placeholder-slate-500 w-full sm:w-64 focus-ring"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { label: 'All Questions', value: 'ALL' },
          { label: 'Coding Challenges', value: 'CODING' },
          { label: 'Technical CS Fundamentals', value: 'TECHNICAL' },
          { label: 'HR Behavioral STAR', value: 'HR' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedCategory(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === tab.value
                ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Question List */}
      <div className="grid gap-3">
        {filtered.map((q) => (
          <Card key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs p-4 hover:border-slate-700 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  q.difficulty === 'Easy'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : q.difficulty === 'Medium'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                }`}>
                  {q.difficulty}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {q.topic}
                </span>
              </div>
              <h4 className="font-semibold text-slate-100 text-sm">{q.title}</h4>
              <p className="text-slate-400 line-clamp-1 text-[11px]">{q.promptText}</p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {q.category === 'CODING' ? (
                <a href="/coding">
                  <Button size="sm" variant="primary">Solve in Monaco</Button>
                </a>
              ) : q.category === 'TECHNICAL' ? (
                <a href="/interviews/technical">
                  <Button size="sm" variant="secondary">Practice Technical</Button>
                </a>
              ) : (
                <a href="/interviews/hr">
                  <Button size="sm" variant="outline">Practice STAR Answer</Button>
                </a>
              )}
            </div>
          </Card>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No questions found matching your filter criteria.
          </div>
        )}
      </div>
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
