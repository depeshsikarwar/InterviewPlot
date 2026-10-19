import React from 'react';
import { Card } from '../components/common/Card';
import { Sparkles, Users, Terminal, Mic, FileText, Briefcase, BarChart3, ShieldCheck } from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const features = [
    { title: 'AI HR & Behavioral Interviews', icon: Users, desc: 'Interactive interview sessions assessing STAR principles, ownership, impact, and communication clarity.' },
    { title: 'Technical Problem Solving', icon: Terminal, desc: 'Live DSA, OOP, DBMS, Networks, and Operating Systems questions with adaptive follow-ups.' },
    { title: 'Monaco Coding Sandbox', icon: Sparkles, desc: 'In-browser editor with multi-language execution, sample tests, and edge-case verification.' },
    { title: 'Voice-First Mode', icon: Mic, desc: 'Real-time speech-to-text transcript generation and voice response for realistic phone/video screening simulations.' },
    { title: 'Resume Parsing & Gap Audit', icon: FileText, desc: 'PDF and DOCX extraction identifying missing keywords, weak descriptions, and tailored questions.' },
    { title: 'Job Description Matching', icon: Briefcase, desc: 'Target company JD parser calculating exact skill overlaps and generating tailored interview prep plans.' },
    { title: 'Granular Skill Analytics', icon: BarChart3, desc: 'Radar charts and trend graphs tracking your improvement across all interview competencies.' },
    { title: 'Strict Privacy & Data Isolation', icon: ShieldCheck, desc: 'Your audio recordings and answers remain private. Full data deletion and export compliant with GDPR.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Comprehensive AI Interview Engineering
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Every tool you need to transition from campus placement anxious to confident offer-holder.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <Card key={i} className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <f.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">{f.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const HowItWorksPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">How InterviewPilot AI Works</h1>
      <p className="text-slate-400 text-sm">Three simple steps to placement mastery</p>
    </div>
    <div className="grid gap-6">
      {[
        { step: '01', title: 'Setup Your Target Profile', desc: 'Select your target job role (e.g. SDE-1), experience level, and preferred languages.' },
        { step: '02', title: 'Practice Simulated Interviews', desc: 'Answer conversational questions in text or voice mode, and solve live coding challenges in Monaco Editor.' },
        { step: '03', title: 'Review Reports & Follow Roadmap', desc: 'Inspect exact quote evidence, rubric scores, and complete weekly practice tasks to fix weak spots.' },
      ].map((item, idx) => (
        <Card key={idx} className="flex gap-6 items-start">
          <span className="text-2xl font-black text-brand-500/40">{item.step}</span>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export const PricingPage: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 py-16 space-y-12 text-center">
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Transparent, Student-Friendly Pricing</h1>
      <p className="text-slate-400 text-sm">Start for free during our campus launch preview</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      {[
        { name: 'Student Free', price: '$0', desc: 'Everything needed to practice campus interviews', features: ['5 HR Interviews / month', '5 Coding challenges', 'Basic STAR feedback', 'Community question bank'] },
        { name: 'Placement Pro', price: '$15', desc: 'For active placement and internship seekers', popular: true, features: ['Unlimited HR & Technical Mocks', 'Monaco Code execution sandbox', 'Resume & JD gap analysis', 'Personalized weekly roadmaps'] },
        { name: 'Campus Enterprise', price: 'Custom', desc: 'For university placement cells & colleges', features: ['Cohort analytics & leaderboards', 'Custom company question banks', 'Faculty monitoring dashboards', 'LMS integration'] },
      ].map((tier, idx) => (
        <Card key={idx} className={`space-y-5 relative ${tier.popular ? 'border-brand-500 shadow-brand-500/10 shadow-lg' : ''}`}>
          {tier.popular && (
            <span className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
              Most Popular
            </span>
          )}
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{tier.name}</h3>
            <p className="text-xs text-slate-400">{tier.desc}</p>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{tier.price} <span className="text-xs font-normal text-slate-500">/mo</span></div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            {tier.features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">✓ {f}</li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  </div>
);

export const PrivacyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-xs text-slate-600 dark:text-slate-400">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
    <p>Last updated: October 2026. We respect your confidentiality. Interview answers and resumes are processed solely for generating your feedback reports and roadmaps. We never sell your data.</p>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-16 space-y-6 text-xs text-slate-600 dark:text-slate-400">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Terms of Service</h1>
    <p>By using InterviewPilot AI, you agree that mock evaluations are intended as study aids and practice simulations, not legal hiring guarantees.</p>
  </div>
);

export const ForgotPasswordPage: React.FC = () => (
  <div className="max-w-md mx-auto px-4 py-16">
    <Card className="space-y-4">
      <h1 className="text-lg font-bold text-slate-900 dark:text-white">Reset Password</h1>
      <p className="text-xs text-slate-400">Enter your registered email and we will generate a recovery token.</p>
      <input className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-900 border-slate-700" placeholder="candidate@example.com" />
      <button className="w-full bg-brand-600 text-white text-xs font-semibold py-2.5 rounded-lg">Send Reset Link</button>
    </Card>
  </div>
);

export const ResetPasswordPage: React.FC = () => (
  <div className="max-w-md mx-auto px-4 py-16">
    <Card className="space-y-4">
      <h1 className="text-lg font-bold text-slate-900 dark:text-white">Set New Password</h1>
      <input className="w-full text-xs p-2.5 rounded-lg border dark:bg-slate-900 border-slate-700" type="password" placeholder="New Password" />
      <button className="w-full bg-brand-600 text-white text-xs font-semibold py-2.5 rounded-lg">Save Password</button>
    </Card>
  </div>
);
