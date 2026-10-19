import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  Building2,
  CheckCircle2,
  Award,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  Code2,
  Users
} from 'lucide-react';

interface CompanyKitProps {
  onSelectCompany: (company: string) => void;
}

export const CompanyPlacementKits: React.FC<CompanyKitProps> = ({ onSelectCompany }) => {
  const KITS = [
    {
      company: 'Amazon',
      badge: 'FAANG / Tier 1',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
      textColor: 'text-amber-400',
      description: 'Bar-Raiser evaluation focused on the 16 Leadership Principles (STAR format) and medium-to-hard DSA questions.',
      rounds: [
        'Online Assessment: 2 DSA Problems + Work Style Assessment',
        'Technical Phone Screen: Live Coding in Shared Sandbox',
        'Onsite Loop: 4-5 Rounds with dedicated Bar-Raiser interview',
      ],
      mustKnows: [
        'Customer Obsession & Extreme Ownership',
        'Hash Maps, Two Pointers, Sliding Window, Monotonic Stack',
        'Quantifiable engineering results in STAR answers',
      ],
    },
    {
      company: 'Google',
      badge: 'FAANG / Tier 1',
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
      textColor: 'text-blue-400',
      description: 'Heavy emphasis on algorithmic asymptotic analysis (Big-O), graph theory, and navigating ambiguous specifications.',
      rounds: [
        'Technical Phone Screen: 45 min Google Meet Coding',
        'Virtual Onsite: 3-4 Coding Rounds + 1 "Googlyness" Behavioral Round',
      ],
      mustKnows: [
        'Time & Space complexity proof before writing code',
        'Binary Search variants, DFS/BFS, Dynamic Programming',
        'Edge case coverage (null, integer overflow, empty collections)',
      ],
    },
    {
      company: 'Microsoft',
      badge: 'Big Tech',
      color: 'from-cyan-500/20 to-emerald-500/10 border-cyan-500/30',
      textColor: 'text-cyan-400',
      description: 'Production-readiness, clean modular architecture, and fundamental computer science understanding (OS, Concurrency, DBMS).',
      rounds: [
        'Online Test: Codility 3 problems (70 min)',
        'Virtual Rounds: DSA, Low-Level System Design & Fundamentals',
      ],
      mustKnows: [
        'Clean variable naming and separation of concerns',
        'Thread safety, Locks, and Memory Management',
        'Linked Lists, Trees, String parsing, and DBMS transactions',
      ],
    },
    {
      company: 'TCS & Infosys',
      badge: 'Campus Mass Recruiter / Digital',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
      textColor: 'text-purple-400',
      description: 'Ninja & Digital hiring tracks focusing on core CS fundamentals, aptitude, SQL queries, and foundational DSA.',
      rounds: [
        'National Qualifier Test (NQT) / InfyTQ: Aptitude + Coding',
        'Technical Interview: OOPs, SQL, OS, Networking, Final Year Project',
        'HR / Managerial Round: Communication, relocation, situational queries',
      ],
      mustKnows: [
        'OOP Concepts (Polymorphism, Abstraction, Encapsulation, Inheritance)',
        'SQL Joins, Group By, Indexes, ACID properties',
        'Array manipulation, Palindromes, Fibonacci, Kadane algorithm',
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          AmbitionBox & PrepBytes Placement Patterns
        </span>
        <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-400" /> Company Placement Roadmaps & Hiring Kits
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tailored interview preparation tracks containing company-specific test formats, interview round breakdowns, and verified problem tags.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {KITS.map((kit, idx) => (
          <Card key={idx} className={`p-5 space-y-4 bg-gradient-to-br ${kit.color} border transition-all hover:scale-[1.01]`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                  {kit.badge}
                </span>
                <h3 className={`text-lg font-bold ${kit.textColor} mt-1`}>{kit.company} Placement Kit</h3>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectCompany(kit.company)}
                className="text-xs"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Problems
              </Button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {kit.description}
            </p>

            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-200">Interview Process Breakdown:</span>
              {kit.rounds.map((r, rIdx) => (
                <div key={rIdx} className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                  <span className="font-mono text-cyan-400 shrink-0">R{rIdx + 1}:</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
              <span className={`font-bold ${kit.textColor} flex items-center gap-1.5 text-[11px]`}>
                <Target className="w-3.5 h-3.5" /> High-Priority Focus Topics:
              </span>
              {kit.mustKnows.map((m, mIdx) => (
                <p key={mIdx} className="text-slate-300 text-[11px]">• {m}</p>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
