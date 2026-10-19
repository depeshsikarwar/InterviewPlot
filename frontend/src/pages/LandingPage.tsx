import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import {
  Sparkles,
  Users,
  Terminal,
  Award,
  ArrowRight,
  CheckCircle2,
  Cpu,
  BarChart,
  ShieldCheck,
  Play,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-12 md:py-20 overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Placement & Tech Interview Preparation
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Master Tech & HR Interviews with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-indigo-400 to-cyan-400">
            Evidence-Based AI
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Simulate realistic conversational HR behavioral interviews, live Monaco coding assessments, and technical Q&A. Receive objective rubric scoring, actionable weakness roadmaps, and instant feedback.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link to="/register">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Start Free Practice Interview
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" leftIcon={<Play className="w-4 h-4" />}>
              Try Demo Account
            </Button>
          </Link>
        </div>

        {/* Demo Credentials Box */}
        <div className="max-w-md mx-auto p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
          <span>Demo login: <strong className="text-brand-500">candidate@interviewpilot.ai</strong></span>
          <span>Password: <strong className="text-brand-500">DemoPass123!</strong></span>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Built for Real College Placements & Job Readiness
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Not a generic chatbot. A multi-model interview platform providing rigorous evaluation across every dimension.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-4 hover:border-brand-500/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">AI HR & Behavioral Interview</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Conversational behavioral simulations evaluated against the 5-point STAR rubric (Situation, Task, Action, Result) with follow-ups.
            </p>
            <ul className="text-xs space-y-2 text-slate-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-500" /> Evidence quotes from your speech</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-500" /> Concrete suggestions & lessons</li>
            </ul>
          </Card>

          <Card className="space-y-4 hover:border-brand-500/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Monaco Coding Sandbox</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Real code editor with isolated backend execution. Tests run against visible sample cases and hidden edge cases.
            </p>
            <ul className="text-xs space-y-2 text-slate-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" /> Python, JavaScript, C++, Java</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" /> Algorithmic time & space complexity</li>
            </ul>
          </Card>

          <Card className="space-y-4 hover:border-brand-500/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <BarChart className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Weakness Tracking & Roadmaps</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Detailed skill radar charts and automatically generated weekly practice roadmaps tailored to your target company and available hours.
            </p>
            <ul className="text-xs space-y-2 text-slate-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Persistent historical trajectory</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Time-bounded study milestones</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Trust & Methodology Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-2xl p-8 bg-gradient-to-r from-brand-900/30 via-indigo-900/20 to-slate-900/40 border border-brand-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Objective Hiring Standards</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Zero Fake Metrics or Unjustified Praise</h3>
            <p className="text-sm text-slate-400 max-w-lg">
              InterviewPilot grounds every score in actual code outputs and direct candidate speech evidence.
            </p>
          </div>
          <Link to="/register">
            <Button variant="primary" size="md">
              Try It Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
