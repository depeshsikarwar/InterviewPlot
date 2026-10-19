import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../common/Button';
import {
  Clock,
  Pause,
  Play,
  Lightbulb,
  Sparkles,
  Volume2,
  AlertCircle,
  HelpCircle,
  Mic
} from 'lucide-react';

export type InterviewerPersona = 'maya' | 'rex' | 'sarah';

interface MockInterviewerBannerProps {
  currentQuestionText: string;
  candidateAnswerText?: string;
  isListening?: boolean;
}

export const MockInterviewerBanner: React.FC<MockInterviewerBannerProps> = ({
  currentQuestionText,
  candidateAnswerText,
  isListening = false,
}) => {
  const [persona, setPersona] = useState<InterviewerPersona>('maya');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60); // 45:00 countdown
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // In-Interview Persona Hint State
  const [requestingHint, setRequestingHint] = useState<boolean>(false);
  const [hintData, setHintData] = useState<any>(null);
  const [attemptCount, setAttemptCount] = useState<number>(1);

  // Timer interval
  useEffect(() => {
    if (!timerRunning || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, secondsRemaining]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRequestHint = async () => {
    setRequestingHint(true);
    try {
      const res = await api.post('/question-bank/mock-interviewer/hint', {
        persona,
        question: currentQuestionText,
        currentCodeOrAnswer: candidateAnswerText,
        attemptCount,
      });

      if (res.data.success) {
        setHintData(res.data.data);
        setAttemptCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRequestingHint(false);
    }
  };

  const isLowTime = secondsRemaining <= 300; // < 5 mins

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm">
      {/* Top Controls: Persona Selector, Waveform & 45:00 Countdown Clock */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Persona Selector (Interviewing.io / Pramp style) */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 font-semibold">AI Interviewer:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 gap-1">
            <button
              onClick={() => { setPersona('maya'); setHintData(null); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${persona === 'maya' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <span>👩🏽‍💻</span> Maya (Google)
            </button>

            <button
              onClick={() => { setPersona('rex'); setHintData(null); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${persona === 'rex' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <span>👨🏻‍💻</span> Rex (Amazon)
            </button>

            <button
              onClick={() => { setPersona('sarah'); setHintData(null); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${persona === 'sarah' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <span>👩🏼‍💼</span> Sarah (Stripe)
            </button>
          </div>
        </div>

        {/* Live Audio Waveform & Timer */}
        <div className="flex items-center gap-3">
          {/* Live Waveform */}
          {isListening && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-mono">LISTENING LIVE</span>
            </div>
          )}

          {/* 45:00 Live Countdown Timer */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono ${isLowTime
            ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 animate-pulse font-bold'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs">{formatTime(secondsRemaining)}</span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5"
              title={timerRunning ? 'Pause Clock' : 'Resume Clock'}
            >
              {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>

          {/* Request Hint Action Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRequestHint}
            isLoading={requestingHint}
            className="border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            leftIcon={<Lightbulb className="w-3.5 h-3.5 text-amber-500" />}
          >
            Ask for Hint
          </Button>
        </div>
      </div>

      {/* In-Character Persona Hint Bubble */}
      {hintData && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{hintData.avatar}</span>
              <div>
                <span className="font-bold text-white text-xs">{hintData.persona}</span>
                <span className="text-[10px] text-slate-400 ml-2">({hintData.role})</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              {hintData.tone}
            </span>
          </div>

          <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-line font-sans">
            "{hintData.hint}"
          </p>

          {hintData.followUpQuestion && (
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-cyan-300">
              <span className="font-bold text-cyan-400">Interviewer Probe:</span> {hintData.followUpQuestion}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
