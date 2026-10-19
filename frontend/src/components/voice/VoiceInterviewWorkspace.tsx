import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
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
} from 'lucide-react';

export const VoiceInterviewWorkspace: React.FC = () => {
  const [step, setStep] = useState<'setup' | 'interview' | 'report'>('setup');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('Medium');

  // Question & Session State
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluationReport, setEvaluationReport] = useState<any>(null);

  const recognitionRef = useRef<any>(null);

  // Check speech synthesis & recognition support
  useEffect(() => {
    const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const hasSynthesis = 'speechSynthesis' in window;
    if (!hasRecognition || !hasSynthesis) {
      setSpeechSupported(false);
    }
  }, []);

  // Text-to-Speech function for AI interviewer
  const speakText = (text: string) => {
    if (isAudioMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech
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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. You can type your answers directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
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

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Start interview session via API
  const handleStartSession = async () => {
    try {
      const createRes = await api.post('/interviews', {
        title: `Voice Interview: ${targetRole}`,
        interviewType: 'HR',
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

      // Speak welcome and first question
      const welcome = `Hello and welcome to your simulated interview for the ${targetRole} role. Here is your first question: ${firstQ.questionText}`;
      setTimeout(() => speakText(welcome), 400);
    } catch (err: any) {
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

    try {
      const res = await api.post(`/interviews/${interviewId}/answers`, {
        questionId: currentQuestion.id,
        answerText: transcript.trim(),
        speechDurationSeconds: 45,
      });

      if (res.data.data.isComplete) {
        // Finish session
        const finishRes = await api.post(`/interviews/${interviewId}/finish`);
        setEvaluationReport(finishRes.data.data);
        setStep('report');
        speakText('Thank you! Your interview is now complete. Your structured evaluation report has been generated.');
      } else {
        const nextQ = res.data.data.nextQuestion;
        setCurrentQuestion(nextQ);
        setQuestionIndex((prev) => prev + 1);
        setTranscript('');

        // Speak the next question
        const prompt = nextQ.isFollowUp
          ? `Follow up question: ${nextQ.questionText}`
          : `Next question: ${nextQ.questionText}`;
        speakText(prompt);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Setup Step */}
      {step === 'setup' && (
        <Card className="text-center py-12 px-6 space-y-6">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto ring-8 ring-brand-500/5 animate-pulse">
            <Mic className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Voice Interview Screening
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Practice realistic verbal screening interviews. The AI interviewer speaks questions aloud and transcribes your spoken answers in real time.
            </p>
          </div>

          {!speechSupported && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center gap-2 max-w-md mx-auto">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Web Speech API is limited in this browser. You can still type your responses.</span>
            </div>
          )}

          <div className="max-w-md mx-auto grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Role</label>
              <input
                className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-900 border-slate-700 mt-1"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Difficulty</label>
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

          <Button onClick={handleStartSession} size="lg" leftIcon={<Play className="w-4 h-4" />}>
            Grant Microphone & Begin Voice Interview
          </Button>
        </Card>
      )}

      {/* Active Voice Interview Step */}
      {step === 'interview' && currentQuestion && (
        <div className="space-y-5">
          {/* Status Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-300">Question {questionIndex + 1} of 5</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAudioMuted(!isAudioMuted);
                  if (!isAudioMuted) window.speechSynthesis.cancel();
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                title={isAudioMuted ? 'Unmute AI voice' : 'Mute AI voice'}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={() => speakText(currentQuestion.questionText)}
                className="text-[11px] text-brand-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Replay Question Audio
              </button>
            </div>
          </div>

          {/* AI Question Card with Speaking Indicator */}
          <Card className={`space-y-3 transition-all ${isSpeakingQuestion ? 'border-brand-500 shadow-lg shadow-brand-500/10' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Interviewer ({currentQuestion.category})
              </span>
              {isSpeakingQuestion && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold animate-pulse">
                  <Volume2 className="w-3.5 h-3.5" /> Speaking Question...
                </span>
              )}
            </div>
            <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
              "{currentQuestion.questionText}"
            </p>
          </Card>

          {/* Real-time Candidate Speech Card */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>Your Voice Transcript</span>
                {isListening && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> Listening & Transcribing...
                  </span>
                )}
              </label>

              {/* Speech Controls */}
              <div className="flex items-center gap-2">
                {!isListening ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={startListening}
                    leftIcon={<Mic className="w-3.5 h-3.5" />}
                  >
                    Start Speaking
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={stopListening}
                    leftIcon={<MicOff className="w-3.5 h-3.5" />}
                  >
                    Pause Microphone
                  </Button>
                )}
              </div>
            </div>

            {/* Transcript Textbox */}
            <div className="relative">
              <textarea
                rows={6}
                className="w-full text-xs p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring leading-relaxed"
                placeholder="Click 'Start Speaking' and state your answer. You can also edit or type directly here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>

            {/* Action Bottom Bar */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Word count: {transcript.split(/\s+/).filter(Boolean).length} words
              </span>
              <Button
                size="md"
                variant="primary"
                onClick={handleSubmitAnswer}
                isLoading={submitting}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Submit Voice Answer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Evaluation Report Step */}
      {step === 'report' && evaluationReport && (
        <Card className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <span className="text-xs text-brand-400 font-bold uppercase tracking-wider">Evaluation Report</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Voice Interview Assessment</h2>
            <p className="text-xs text-slate-400 mt-1">
              Overall Performance Score: <strong className="text-emerald-400 text-sm">{evaluationReport.overallScore} / 100</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80">
              <p className="text-slate-400">Relevance</p>
              <p className="font-bold text-sm text-brand-400 mt-1">{evaluationReport.relevanceScore} / 5</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80">
              <p className="text-slate-400">STAR Structure</p>
              <p className="font-bold text-sm text-brand-400 mt-1">{evaluationReport.structureScore} / 5</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80">
              <p className="text-slate-400">Specificity</p>
              <p className="font-bold text-sm text-brand-400 mt-1">{evaluationReport.specificityScore} / 5</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80">
              <p className="text-slate-400">Ownership</p>
              <p className="font-bold text-sm text-brand-400 mt-1">{evaluationReport.ownershipScore} / 5</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80">
              <p className="text-slate-400">Results/Impact</p>
              <p className="font-bold text-sm text-brand-400 mt-1">{evaluationReport.resultsScore} / 5</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Demonstrated Strengths:</h4>
            {evaluationReport.strengths?.map((s: string, idx: number) => (
              <p key={idx} className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{s}</span>
              </p>
            ))}
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Key Improvement Areas:</h4>
            {evaluationReport.weaknesses?.map((w: string, idx: number) => (
              <p key={idx} className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{w}</span>
              </p>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <h4 className="font-bold text-brand-400">Suggested Model Answer (Illustration):</h4>
            <p className="text-slate-400 italic leading-relaxed">{evaluationReport.modelAnswerExample}</p>
          </div>

          <Button onClick={() => setStep('setup')} variant="outline" size="sm">
            Practice Another Voice Session
          </Button>
        </Card>
      )}
    </div>
  );
};
