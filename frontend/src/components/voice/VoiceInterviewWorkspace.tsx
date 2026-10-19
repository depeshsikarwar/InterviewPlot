import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Button } from '../common/Button';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Users,
  Code2,
  Clock,
  AlertTriangle,
  Building2,
  Send,
  PhoneOff,
  Award,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  Smile,
  Activity,
  Video,
  VideoOff,
  FileText,
  TrendingUp,
  Zap,
  HelpCircle,
  Eye,
  Check,
  BarChart3,
  Flame,
} from 'lucide-react';

interface InterviewerPersona {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  tone: string;
  focus: string;
  bio: string;
}

const PERSONAS: InterviewerPersona[] = [
  {
    id: 'maya',
    name: 'Maya Patel',
    role: 'Senior Staff Engineer',
    company: 'Google',
    avatar: '👩🏽‍💻',
    tone: 'Constructive & Analytical',
    focus: 'Distributed systems, caching, concurrency, and DB scalability',
    bio: '12+ years building high-throughput cloud infrastructure and evaluating L5/L6 bar-raiser rounds.',
  },
  {
    id: 'rex',
    name: 'Rex Vance',
    role: 'Staff Bar Raiser',
    company: 'Amazon',
    avatar: '👨🏻‍💻',
    tone: 'Rigorous & Direct',
    focus: 'Low-level trade-offs, indexing, failure modes, and leadership principles',
    bio: 'Conducted 350+ bar-raiser rounds across AWS EC2 and Core Distributed Data teams.',
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    role: 'Engineering Director',
    company: 'Stripe',
    avatar: '👩🏼‍💼',
    tone: 'Empathetic & Strategic',
    focus: 'STAR behavioral storytelling, cross-functional conflicts, and system design',
    bio: 'Passionate about engineering leadership, pragmatic architecture, and impactful storytelling.',
  },
];

interface ChatMessage {
  id: string;
  sender: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  turnEval?: {
    score: number;
    feedback: string;
    isTrivialOrGreeting?: boolean;
    weaknesses?: string[];
    detectedTopics?: string[];
  };
}

export const VoiceInterviewWorkspace: React.FC = () => {
  const [step, setStep] = useState<'setup' | 'interview' | 'report'>('setup');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [interviewType, setInterviewType] = useState<'HR' | 'TECHNICAL'>('TECHNICAL');
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [selectedPersona, setSelectedPersona] = useState<InterviewerPersona>(PERSONAS[0]);

  // Session State
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [evaluationReport, setEvaluationReport] = useState<any>(null);

  // interviewing.io Mode & Scratchpad
  const [activeRightTab, setActiveRightTab] = useState<'chat' | 'scratchpad'>('chat');
  const [scratchpadContent, setScratchpadContent] = useState<string>(
    `// ════════════════════════════════════════════════════════════
// Collaborative Architecture & Interview Scratchpad
// Jot down notes, schema design, or STAR points while speaking:
// ════════════════════════════════════════════════════════════

1. Requirements & Scale:
   - Read/Write Ratio: 10:1
   - Peak Latency: < 50ms p99

2. High-Level Flow:
   - Client -> CDN -> API Gateway -> Service Layer -> Redis Cache -> PostgreSQL (B-Tree indexed)

3. Key Trade-offs:
   - Cache Invalidation: Write-through vs Cache-aside with TTL
   - Concurrency: Distributed lock (Redlock) to prevent Thundering Herd`
  );

  // Video / Webcam State (Yoodli Style)
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 45:00 interviewing.io Countdown Timer
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // Yoodli Speech Telemetry State
  const [speechStartTime, setSpeechStartTime] = useState<number | null>(null);
  const [elapsedSpeechSeconds, setElapsedSpeechSeconds] = useState(0);
  const [sessionTotalFillers, setSessionTotalFillers] = useState(0);

  const recognitionRef = useRef<any>(null);
  const speechTimerRef = useRef<any>(null);
  const callDurationRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, submitting]);

  // 45:00 countdown clock
  useEffect(() => {
    if (step === 'interview' && timerRunning) {
      callDurationRef.current = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      if (callDurationRef.current) clearInterval(callDurationRef.current);
    }
    return () => {
      if (callDurationRef.current) clearInterval(callDurationRef.current);
    };
  }, [step, timerRunning]);

  // Turn speech duration timer
  useEffect(() => {
    if (isListening) {
      speechTimerRef.current = setInterval(() => {
        setElapsedSpeechSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
    }
    return () => {
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
    };
  }, [isListening]);

  // Handle webcam stream attachment
  useEffect(() => {
    if (isCameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOn]);

  // Toggle Camera
  const toggleCamera = async () => {
    if (isCameraOn) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        setIsCameraOn(true);
      } catch (err) {
        alert('Webcam permission was not granted or camera is in use. Continuing in Avatar mode.');
      }
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Yoodli Speech Analytics: Filler Word Detection
  const getFillerWordBreakdown = (text: string) => {
    const list = ['um', 'uh', 'like', 'you know', 'actually', 'basically'];
    const lower = text.toLowerCase();
    return list.map((word) => {
      const reg = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lower.match(reg);
      return { word, count: matches ? matches.length : 0 };
    });
  };

  const fillerBreakdown = getFillerWordBreakdown(transcript);
  const currentFillers = fillerBreakdown.reduce((sum, item) => sum + item.count, 0);
  const currentWordCount = transcript.trim() ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;
  const currentWPM = elapsedSpeechSeconds > 3 ? Math.round((currentWordCount / (elapsedSpeechSeconds / 60))) : 0;

  // Text-to-Speech
  const speakText = (text: string) => {
    if (isAudioMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeakingQuestion(true);
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);
    window.speechSynthesis.speak(utterance);
  };

  // Start Speech Recognition
  const startListening = () => {
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not available in this browser. You can type answers directly in the response box.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        if (!speechStartTime) setSpeechStartTime(Date.now());
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript((prev) => {
          const updated = (prev + ' ' + finalTranscript).trim();
          return updated || interimTranscript;
        });
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Start Session
  const handleStartSession = async () => {
    try {
      const createRes = await api.post('/interviews', {
        title: `1-on-1 Bar-Raiser Session with ${selectedPersona.name}`,
        interviewType,
        mode: 'VOICE',
        difficulty,
        targetRole,
      });

      const intId = createRes.data.data.id;
      setInterviewId(intId);

      const startRes = await api.post(`/interviews/${intId}/start`);
      const firstQ = startRes.data.data.currentQuestion;

      setCurrentQuestion(firstQ);
      setStep('interview');
      setTranscript('');
      setElapsedSpeechSeconds(0);
      setSessionTotalFillers(0);
      setSecondsRemaining(45 * 60);

      const welcomeText = `Hey Alex! I'm ${selectedPersona.name} from ${selectedPersona.company}. Great to meet you today. We have 45 minutes for this ${interviewType === 'TECHNICAL' ? 'technical architecture bar-raiser' : 'leadership and behavioral'} round. Let's dive right in. ${firstQ.questionText}`;

      setMessages([
        {
          id: 'welcome-msg',
          sender: 'interviewer',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setTimeout(() => speakText(welcomeText), 600);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) {
      alert('Please speak or type your answer before submitting.');
      return;
    }

    stopListening();
    setSubmitting(true);
    setSessionTotalFillers((prev) => prev + currentFillers);

    const candidateAnswerText = transcript.trim();
    const candidateMsgId = `cand-${Date.now()}`;
    const candidateMsg: ChatMessage = {
      id: candidateMsgId,
      sender: 'candidate',
      text: candidateAnswerText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, candidateMsg]);
    setTranscript('');

    try {
      const res = await api.post(`/interviews/${interviewId}/answers`, {
        questionId: currentQuestion.id,
        answerText: candidateAnswerText,
        speechDurationSeconds: elapsedSpeechSeconds || 30,
      });

      if (res.data.success) {
        const turnEval = res.data.data.turnEvaluation;

        // Attach turn evaluation
        setMessages((prev) =>
          prev.map((m) =>
            m.id === candidateMsgId
              ? {
                  ...m,
                  turnEval: {
                    score: turnEval.score,
                    feedback: turnEval.feedback,
                    isTrivialOrGreeting: turnEval.isTrivialOrGreeting,
                    weaknesses: turnEval.weaknesses,
                    detectedTopics: turnEval.detectedTopics,
                  },
                }
              : m
          )
        );

        if (res.data.data.isComplete) {
          const finishRes = await api.post(`/interviews/${interviewId}/finish`);
          setEvaluationReport(finishRes.data.data);
          setStep('report');
          speakText(`Thanks for your time today, Alex. That concludes our 45-minute bar-raiser round. Your full interview debrief scorecard has been compiled.`);
        } else {
          const nextQ = res.data.data.nextQuestion;
          setCurrentQuestion(nextQ);
          setQuestionIndex((prev) => prev + 1);
          setElapsedSpeechSeconds(0);

          const interviewerFollowUp = nextQ.questionText;
          setMessages((prev) => [
            ...prev,
            {
              id: `int-${Date.now()}`,
              sender: 'interviewer',
              text: interviewerFollowUp,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);

          speakText(interviewerFollowUp);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-3">
      {/* ======================================================== */}
      {/* 1. SETUP ROOM (interviewing.io + Yoodli Style)          */}
      {/* ======================================================== */}
      {step === 'setup' && (
        <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>interviewing.io & Yoodli Calibrated AI Studio</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              1-on-1 Bar-Raiser Mock Interview
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Experience the authentic atmosphere of an interviewing.io technical round combined with Yoodli's live speech telemetry (WPM pace gauge, filler words, and conciseness).
            </p>
          </div>

          {/* Track Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setInterviewType('TECHNICAL')}
              className={`p-5 rounded-2xl border text-left transition-all relative ${
                interviewType === 'TECHNICAL'
                  ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 shadow-md ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Systems & Architecture Bar-Raiser</h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">FAANG</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Database internals, B-Tree indexes, cache stampedes, microservice distributed locks, and concurrency.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setInterviewType('HR')}
              className={`p-5 rounded-2xl border text-left transition-all relative ${
                interviewType === 'HR'
                  ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 shadow-md ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">HR Behavioral Screening</h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">STAR</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Rigorous STAR storytelling, resolving architectural deadlocks with senior engineers, and ownership.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Select Persona */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Your Interviewer Persona
              </label>
              <span className="text-xs text-slate-400">Anonymous FAANG Profiles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {PERSONAS.map((p) => {
                const isSelected = selectedPersona.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPersona(p)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 shadow-md ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{p.avatar}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {p.company}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h4>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">{p.role}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {p.bio}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">{p.tone}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Settings */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Role</label>
              <input
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white mt-1.5 focus-ring"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Engineer, SDE-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rigor Level</label>
              <select
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white mt-1.5 focus-ring"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Medium">Standard Industry Bar</option>
                <option value="Hard">Staff / Senior Bar-Raiser</option>
                <option value="Easy">Foundational / Campus Placement</option>
              </select>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-2">
            <button
              onClick={handleStartSession}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Enter 45-Min Bar-Raiser Room with {selectedPersona.name}</span>
            </button>
            <p className="text-xs text-slate-400 mt-2">
              Audio + optional webcam video enabled. Microphone auto-transcribes answers in real-time.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. THE 1-ON-1 INTERVIEW ROOM (interviewing.io + Yoodli)  */}
      {/* ======================================================== */}
      {step === 'interview' && currentQuestion && (
        <div className="space-y-4 animate-fadeIn">
          {/* Top Stage Bar: interviewing.io Meeting Header */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>CONNECTED • 45-MIN ROUND</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div className="flex items-center gap-2">
                <span className="text-base">{selectedPersona.avatar}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedPersona.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  {selectedPersona.company} Bar
                </span>
              </div>
            </div>

            {/* Timer & Controls */}
            <div className="flex items-center gap-3">
              {/* interviewing.io 45-min Countdown */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border font-mono text-xs font-bold ${
                secondsRemaining <= 300
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              {/* Mute Interviewer Voice */}
              <button
                onClick={() => {
                  setIsAudioMuted(!isAudioMuted);
                  if (!isAudioMuted) window.speechSynthesis.cancel();
                }}
                className={`p-2 rounded-xl border transition-colors ${
                  isAudioMuted
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
                title={isAudioMuted ? 'Unmute Interviewer Voice' : 'Mute Interviewer Voice'}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* End Call */}
              <button
                onClick={() => setStep('setup')}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="End Interview"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Stage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT COLUMN: Dual Video Tiles (Interviewer & Candidate) + Yoodli Coach */}
            <div className="lg:col-span-5 space-y-4">
              {/* 1. Interviewer Video Tile */}
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-lg aspect-video flex flex-col items-center justify-center p-6 text-center">
                {isSpeakingQuestion && (
                  <div className="absolute inset-0 bg-brand-500/10 animate-pulse pointer-events-none" />
                )}

                <div className="relative mb-2">
                  <div className={`w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-4xl border-2 transition-all ${
                    isSpeakingQuestion ? 'border-brand-400 shadow-lg shadow-brand-500/20 scale-105' : 'border-slate-700'
                  }`}>
                    {selectedPersona.avatar}
                  </div>

                  {isSpeakingQuestion && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-brand-500 text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      Speaking
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white">{selectedPersona.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedPersona.role} @ {selectedPersona.company}</p>

                {/* Animated Sound Wave bars when speaking */}
                <div className="h-5 flex items-center gap-1 mt-2">
                  {isSpeakingQuestion ? (
                    <>
                      <span className="w-1 bg-brand-400 rounded-full animate-sound-wave" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 bg-brand-400 rounded-full animate-sound-wave" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 bg-brand-400 rounded-full animate-sound-wave" style={{ animationDelay: '300ms' }} />
                      <span className="w-1 bg-brand-400 rounded-full animate-sound-wave" style={{ animationDelay: '450ms' }} />
                      <span className="w-1 bg-brand-400 rounded-full animate-sound-wave" style={{ animationDelay: '600ms' }} />
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-500">Listening to your response</span>
                  )}
                </div>

                <button
                  onClick={() => speakText(currentQuestion.questionText)}
                  className="absolute bottom-2.5 right-2.5 text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg backdrop-blur"
                >
                  <RotateCcw className="w-3 h-3" /> Replay
                </button>
              </div>

              {/* 2. Candidate Tile (You) with optional Webcam Toggle (Yoodli Style) */}
              <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm aspect-video flex flex-col justify-between p-4">
                {/* Real Webcam Video or Avatar Placeholder */}
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950/80 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${
                      isListening
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md animate-pulse'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      👤
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">Alex Vance (You)</p>
                    <span className="text-[10px] text-slate-400">Avatar Mode (Camera Off)</span>
                  </div>
                )}

                {/* Candidate Tile Top Badges */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white drop-shadow bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                      You
                    </span>
                    {isListening && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        Mic Live
                      </span>
                    )}
                  </div>

                  {/* Camera Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors text-xs flex items-center gap-1"
                    title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
                  >
                    {isCameraOn ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5 text-slate-300" />}
                    <span className="text-[10px]">{isCameraOn ? 'Cam On' : 'Cam Off'}</span>
                  </button>
                </div>

                {/* Candidate Tile Bottom Action Controls */}
                <div className="relative z-10 flex items-center justify-between pt-2">
                  <div className="text-[11px] font-mono text-white drop-shadow bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                    {formatTimer(elapsedSpeechSeconds)}
                  </div>

                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      isListening
                        ? 'bg-rose-500 text-white hover:bg-rose-600 ring-2 ring-rose-500/20'
                        : 'bg-brand-600 text-white hover:bg-brand-500'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" /> Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" /> Speak
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3. YOODLI LIVE SPEECH COACH BAR */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3.5 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Yoodli Speech Telemetry
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Live Pacing & Fillers</span>
                </div>

                {/* Yoodli Pacing Speedometer Gauge */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-400">Speech Cadence</span>
                    <span className={`font-mono font-bold text-xs ${
                      currentWPM >= 120 && currentWPM <= 160
                        ? 'text-emerald-400'
                        : currentWPM === 0
                        ? 'text-slate-400'
                        : 'text-amber-400'
                    }`}>
                      {currentWPM || '--'} WPM
                    </span>
                  </div>

                  {/* Horizontal Pacing Bar with Target Zone */}
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden relative">
                    {/* Optimal 120-160 WPM Target Zone */}
                    <div className="absolute left-[40%] right-[35%] top-0 bottom-0 bg-emerald-500/30 border-x border-emerald-400/40" />
                    {/* Live Marker */}
                    <div
                      className={`h-full transition-all duration-300 ${
                        currentWPM >= 120 && currentWPM <= 160
                          ? 'bg-emerald-400'
                          : currentWPM > 160
                          ? 'bg-rose-400'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, (currentWPM / 200) * 100))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500">
                    <span>Slow (&lt;110)</span>
                    <span className="text-emerald-400 font-semibold">Sweet Spot (125-155 WPM)</span>
                    <span>Fast (&gt;165)</span>
                  </div>
                </div>

                {/* Yoodli Filler Words Breakdown Chips */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-400">Filler Word Counter</span>
                    <span className={`font-mono font-bold text-xs ${
                      currentFillers === 0 ? 'text-emerald-400' : currentFillers <= 2 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {currentFillers} Total
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {fillerBreakdown.map((item) => (
                      <span
                        key={item.word}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono border transition-colors ${
                          item.count > 0
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                            : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}
                      >
                        {item.word}: {item.count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: interviewing.io Dual Tab (Chat vs Architecture Scratchpad) */}
            <div className="lg:col-span-7 flex flex-col h-[670px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Top Tab Bar: Conversation vs Scratchpad */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveRightTab('chat')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeRightTab === 'chat'
                        ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Interview Dialogue ({messages.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveRightTab('scratchpad')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeRightTab === 'scratchpad'
                        ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Architecture Scratchpad</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  Question {questionIndex + 1} of 5
                </div>
              </div>

              {/* TAB 1: Chat Stream */}
              {activeRightTab === 'chat' && (
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((msg) => {
                    const isInterviewer = msg.sender === 'interviewer';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isInterviewer ? 'items-start' : 'items-end'} space-y-1`}
                      >
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[11px] font-bold text-slate-400">
                            {isInterviewer ? selectedPersona.name : 'You'}
                          </span>
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                        </div>

                        <div
                          className={`max-w-[88%] text-xs leading-relaxed ${
                            isInterviewer ? 'chat-bubble-interviewer' : 'chat-bubble-candidate'
                          }`}
                        >
                          {msg.text}
                        </div>

                        {/* In-Line Turn Evaluation Banner */}
                        {msg.turnEval && (
                          <div
                            className={`mt-2 max-w-[88%] p-3 rounded-xl border text-[11px] space-y-1.5 animate-fadeIn ${
                              msg.turnEval.score === 0
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                : msg.turnEval.score >= 70
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                {msg.turnEval.score === 0 ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                )}
                                Turn Score: {msg.turnEval.score} / 100
                              </span>
                              {msg.turnEval.isTrivialOrGreeting && (
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">
                                  Casual Greeting Flagged
                                </span>
                              )}
                            </div>
                            <p className="text-slate-300 leading-relaxed">{msg.turnEval.feedback}</p>
                            {msg.turnEval.detectedTopics && msg.turnEval.detectedTopics.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {msg.turnEval.detectedTopics.map((top) => (
                                  <span key={top} className="text-[9px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded">
                                    {top}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {submitting && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 animate-pulse">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce delay-100" />
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce delay-200" />
                      </div>
                      <span>{selectedPersona.name} is evaluating your claims and formulating next follow-up...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>
              )}

              {/* TAB 2: Architecture Scratchpad (interviewing.io Style) */}
              {activeRightTab === 'scratchpad' && (
                <div className="flex-1 p-4 bg-slate-950 font-mono text-xs flex flex-col">
                  <div className="flex items-center justify-between pb-2 text-[11px] text-slate-400 border-b border-slate-800 mb-2">
                    <span>Collaborative Technical Scratchpad</span>
                    <span>Live Shared Buffer</span>
                  </div>
                  <textarea
                    className="flex-1 w-full bg-transparent text-emerald-400 leading-relaxed resize-none focus:outline-none"
                    value={scratchpadContent}
                    onChange={(e) => setScratchpadContent(e.target.value)}
                  />
                </div>
              )}

              {/* Bottom Interactive Response Box */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus-ring leading-relaxed resize-none"
                    placeholder="Speak your answer into the microphone, or type your technical reasoning here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmitAnswer();
                      }
                    }}
                  />
                  {isListening && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Transcribing live...
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>Press <strong>⌘ + Enter</strong> to send</span>
                    <span>•</span>
                    <span>{currentWordCount} words</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`p-2 rounded-xl border transition-colors ${
                        isListening
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-500'
                      }`}
                      title={isListening ? 'Stop Mic' : 'Start Mic'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSubmitAnswer}
                      isLoading={submitting}
                      rightIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      {questionIndex < 4 ? 'Send Answer' : 'Finish & Scorecard'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. POST-INTERVIEW SCORECARD (interviewing.io + Yoodli)   */}
      {/* ======================================================== */}
      {step === 'report' && evaluationReport && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          {/* Header Bar: Hire Decision Banner (interviewing.io Style) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  evaluationReport.overallScore >= 75
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    : evaluationReport.overallScore === 0
                    ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                }`}>
                  {evaluationReport.overallScore >= 75
                    ? 'STRONG HIRE'
                    : evaluationReport.overallScore === 0
                    ? 'NON-ANSWER REJECT'
                    : 'LEAN HIRE / PRACTICE NEEDED'}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedPersona.company} Calibration
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                Interview Debrief with {selectedPersona.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Role: {targetRole} • 45-Minute Bar-Raiser Format
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Overall Score</span>
              <span className={`text-3xl font-extrabold ${
                evaluationReport.overallScore >= 75
                  ? 'text-emerald-500'
                  : evaluationReport.overallScore === 0
                  ? 'text-rose-500'
                  : 'text-amber-500'
              }`}>
                {evaluationReport.overallScore} / 100
              </span>
            </div>
          </div>

          {/* Yoodli Speech Telemetry Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 text-center">
            <div>
              <p className="text-xs text-slate-400">Total Filler Words</p>
              <p className="text-xl font-bold text-amber-400 font-mono mt-1">{sessionTotalFillers}</p>
              <span className="text-[10px] text-slate-500">Target: &lt; 4 fillers</span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Average Pacing</p>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-1">138 WPM</p>
              <span className="text-[10px] text-slate-500">Ideal range: 130-155 WPM</span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Speech Articulation</p>
              <p className="text-xl font-bold text-cyan-400 font-mono mt-1">89%</p>
              <span className="text-[10px] text-slate-500">Consistent clarity</span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Session Status</p>
              <p className="text-xl font-bold text-white font-mono mt-1">Completed</p>
              <span className="text-[10px] text-slate-500">Full 5 turns evaluated</span>
            </div>
          </div>

          {/* 5-Competency Rubric */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block">Relevance</span>
              <strong className="text-sm text-brand-600 dark:text-brand-400 mt-1 block">
                {evaluationReport.relevanceScore} / 5
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block">Technical Depth</span>
              <strong className="text-sm text-brand-600 dark:text-brand-400 mt-1 block">
                {evaluationReport.structureScore} / 5
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block">Specificity</span>
              <strong className="text-sm text-brand-600 dark:text-brand-400 mt-1 block">
                {evaluationReport.specificityScore} / 5
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block">Ownership</span>
              <strong className="text-sm text-brand-600 dark:text-brand-400 mt-1 block">
                {evaluationReport.ownershipScore} / 5
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block">Results & Impact</span>
              <strong className="text-sm text-brand-600 dark:text-brand-400 mt-1 block">
                {evaluationReport.resultsScore} / 5
              </strong>
            </div>
          </div>

          {/* Feedback Points (Strengths & Growth Areas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Demonstrated Strengths
              </h4>
              <div className="space-y-2 text-xs">
                {evaluationReport.strengths?.map((s: string, idx: number) => (
                  <p key={idx} className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{s}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Growth Areas for Next Round
              </h4>
              <div className="space-y-2 text-xs">
                {evaluationReport.weaknesses?.map((w: string, idx: number) => (
                  <p key={idx} className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{w}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Senior Staff Benchmark Model Answer */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
              Senior Staff Benchmark Answer
            </span>
            <p className="text-slate-300 italic leading-relaxed">
              "{evaluationReport.modelAnswerExample}"
            </p>
          </div>

          {/* Actions */}
          <div className="text-center pt-2">
            <Button onClick={() => setStep('setup')} variant="outline" size="md">
              Start Another Mock Interview Round
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
