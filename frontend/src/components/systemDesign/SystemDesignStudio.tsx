import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import {
  Layers,
  Cpu,
  Database,
  Server,
  HardDrive,
  Network,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  Shield,
  Gauge,
  HelpCircle
} from 'lucide-react';

interface ComponentNode {
  id: string;
  type: string;
  label: string;
  category: 'gateway' | 'compute' | 'cache' | 'storage' | 'queue' | 'edge';
}

const PRESET_PROBLEMS = [
  {
    id: 'tinyurl',
    title: 'Design URL Shortener (TinyURL)',
    company: 'Google / Amazon',
    prompt: 'Design a highly available, low-latency URL shortening service like TinyURL with 100M daily active users and 10:1 read-to-write ratio.',
    traffic: { dau: 100000000, readRps: 12000, writeRps: 1200, storagePerDayGb: 50 },
  },
  {
    id: 'chat',
    title: 'Design Real-Time Chat (WhatsApp / Slack)',
    company: 'Meta / Microsoft',
    prompt: 'Design a scalable real-time messaging system supporting 50M concurrent connections with persistent message history and read receipts.',
    traffic: { dau: 50000000, readRps: 25000, writeRps: 20000, storagePerDayGb: 250 },
  },
  {
    id: 'streaming',
    title: 'Design Video Streaming Service (Netflix)',
    company: 'Netflix / Amazon Prime',
    prompt: 'Design global video transcoding, edge delivery, and personalized playback tracking for 200M subscribers worldwide.',
    traffic: { dau: 200000000, readRps: 50000, writeRps: 3000, storagePerDayGb: 5000 },
  },
];

const PALETTE_COMPONENTS: Array<{ type: string; label: string; category: ComponentNode['category'] }> = [
  { type: 'CDN', label: 'Edge CDN (Cloudflare)', category: 'edge' },
  { type: 'Load Balancer', label: 'AWS ALB / NGINX', category: 'gateway' },
  { type: 'API Gateway', label: 'API Gateway (Kong/Envoy)', category: 'gateway' },
  { type: 'Microservice', label: 'Application Service (Go/Node)', category: 'compute' },
  { type: 'Redis', label: 'Redis In-Memory Cache', category: 'cache' },
  { type: 'Postgres', label: 'PostgreSQL Primary (ACID)', category: 'storage' },
  { type: 'Read Replica', label: 'Postgres Read Replicas', category: 'storage' },
  { type: 'Kafka', label: 'Kafka Message Queue', category: 'queue' },
  { type: 'S3', label: 'S3 Object Storage', category: 'storage' },
];

export const SystemDesignStudio: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_PROBLEMS[0]);

  // Capacity Estimator inputs
  const [readRps, setReadRps] = useState<number>(selectedPreset.traffic.readRps);
  const [writeRps, setWriteRps] = useState<number>(selectedPreset.traffic.writeRps);
  const [storageGb, setStorageGb] = useState<number>(selectedPreset.traffic.storagePerDayGb);

  // Active Architecture Canvas Components
  const [architecture, setArchitecture] = useState<ComponentNode[]>([
    { id: '1', type: 'Load Balancer', label: 'AWS ALB / NGINX', category: 'gateway' },
    { id: '2', type: 'Microservice', label: 'Application Service (Go/Node)', category: 'compute' },
    { id: '3', type: 'Redis', label: 'Redis In-Memory Cache', category: 'cache' },
    { id: '4', type: 'Postgres', label: 'PostgreSQL Primary (ACID)', category: 'storage' },
  ]);

  // AI Audit State
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleSelectPreset = (p: typeof PRESET_PROBLEMS[0]) => {
    setSelectedPreset(p);
    setReadRps(p.traffic.readRps);
    setWriteRps(p.traffic.writeRps);
    setStorageGb(p.traffic.storagePerDayGb);
    setAuditResult(null);
  };

  const handleAddComponent = (comp: typeof PALETTE_COMPONENTS[0]) => {
    const newNode: ComponentNode = {
      id: String(Date.now()),
      type: comp.type,
      label: comp.label,
      category: comp.category,
    };
    setArchitecture((prev) => [...prev, newNode]);
    setAuditResult(null);
  };

  const handleRemoveComponent = (id: string) => {
    setArchitecture((prev) => prev.filter((c) => c.id !== id));
    setAuditResult(null);
  };

  const handleAuditArchitecture = async () => {
    setAuditing(true);
    try {
      const res = await api.post('/question-bank/system-design/audit', {
        prompt: selectedPreset.prompt,
        components: architecture,
        traffic: {
          readRps,
          writeRps,
          storagePerDayGb: storageGb,
        },
      });

      if (res.data.success) {
        setAuditResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuditing(false);
    }
  };

  // Calculations
  const peakQps = Math.round(readRps * 2.5);
  const annualStorageTb = Math.round(((storageGb * 365) / 1000) * 10) / 10;
  const bandwidthMbps = Math.round(((readRps * 2 + writeRps * 10) * 8) / 1000);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            Exponent-Style Interactive Studio
          </span>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" /> System Design & Scalability Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build distributed system architectures, calculate high-scale back-of-the-envelope estimations, and receive AI audits on SPOFs and bottlenecks.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_PROBLEMS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPreset.id === p.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {p.title.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 2 Columns (Estimations + Palette vs Visual Architecture Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Estimations Calculator & Component Palette (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Back-of-the-Envelope Calculations Card */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-400" /> Back-of-the-Envelope Estimations
              </span>
              <span className="text-[10px] text-slate-500">Live Computed</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400">Read QPS (Requests/sec)</label>
                <input
                  type="number"
                  className="w-full text-xs font-mono p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200 mt-1"
                  value={readRps}
                  onChange={(e) => setReadRps(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Write QPS (Writes/sec)</label>
                <input
                  type="number"
                  className="w-full text-xs font-mono p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200 mt-1"
                  value={writeRps}
                  onChange={(e) => setWriteRps(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Calculated Output Stats */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500">Peak QPS (2.5x)</span>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">{peakQps.toLocaleString()}</p>
              </div>

              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500">5-Yr Storage</span>
                <p className="text-xs font-bold text-cyan-400 mt-0.5">{(annualStorageTb * 5).toFixed(1)} TB</p>
              </div>

              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] uppercase text-slate-500">Bandwidth</span>
                <p className="text-xs font-bold text-purple-400 mt-0.5">{bandwidthMbps} Mbps</p>
              </div>
            </div>
          </Card>

          {/* Component Palette Card */}
          <Card className="p-4 space-y-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-brand-400" /> Component Palette (Click to Add to Canvas)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PALETTE_COMPONENTS.map((comp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddComponent(comp)}
                  className="flex items-center gap-2 p-2 rounded-lg text-left text-xs bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all group"
                >
                  <div className="p-1 rounded bg-slate-800 text-brand-400 group-hover:bg-brand-500/20">
                    {comp.category === 'gateway' ? <Network className="w-3.5 h-3.5" /> :
                     comp.category === 'cache' ? <Zap className="w-3.5 h-3.5 text-amber-400" /> :
                     comp.category === 'storage' ? <Database className="w-3.5 h-3.5 text-cyan-400" /> :
                     comp.category === 'queue' ? <Activity className="w-3.5 h-3.5 text-purple-400" /> :
                     <Server className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <span className="truncate text-[11px] font-medium">{comp.type}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Visual Architecture Topology & AI Audit (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">{selectedPreset.company} System Design</span>
                <h3 className="text-sm font-bold text-white">{selectedPreset.title}</h3>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={handleAuditArchitecture}
                isLoading={auditing}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Audit Architecture with AI
              </Button>
            </div>

            {/* Visual Canvas of Nodes */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 min-h-[220px] flex flex-col justify-center gap-3">
              <span className="text-[10px] font-mono text-slate-500">Configured Architecture Topology:</span>
              <div className="flex flex-wrap items-center gap-2">
                {architecture.map((node, idx) => (
                  <React.Fragment key={node.id}>
                    <div className="relative group p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs flex items-center gap-2 shadow-sm">
                      <span className="font-bold text-slate-200 text-[11px]">{node.label}</span>
                      <button
                        onClick={() => handleRemoveComponent(node.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove component"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {idx < architecture.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* AI Audit Feedback Results */}
            {auditResult && (
              <div className="space-y-4 pt-3 border-t border-slate-800 text-xs animate-fadeIn">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-slate-200">Architecture Scalability Score</span>
                  <span className={`text-base font-extrabold px-3 py-1 rounded-full ${
                    auditResult.scalabilityScore >= 75
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {auditResult.scalabilityScore} / 100 ({auditResult.systemVerdict})
                  </span>
                </div>

                {auditResult.vulnerabilities?.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" /> Single Points of Failure & Bottlenecks:
                    </span>
                    {auditResult.vulnerabilities.map((v: string, idx: number) => (
                      <p key={idx} className="text-[11px]">• {v}</p>
                    ))}
                  </div>
                )}

                {auditResult.strengths?.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-400">Architectural Strengths:</span>
                    {auditResult.strengths.map((s: string, idx: number) => (
                      <p key={idx} className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> {s}
                      </p>
                    ))}
                  </div>
                )}

                {/* Placement Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {auditResult.placementChecklist?.map((chk: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                        chk.passed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>{chk.item}</span>
                      {chk.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-[10px] text-amber-400">Missing</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
