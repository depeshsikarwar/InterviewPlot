import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import {
  Users,
  Code2,
  Terminal,
  Trophy,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  PlayCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DashboardMetrics {
  totalInterviews: number;
  hrInterviews: number;
  technicalInterviews: number;
  averageScore: number | null;
  weakestSkills: { name: string; score: number }[];
  recentInterviews: any[];
  currentTasks: any[];
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/analytics/overview');
        if (res.data.success) {
          setMetrics(res.data.data);
        }
      } catch {
        // Fallback to empty onboarding state
        setMetrics({
          totalInterviews: 0,
          hrInterviews: 0,
          technicalInterviews: 0,
          averageScore: null,
          weakestSkills: [],
          recentInterviews: [],
          currentTasks: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasInterviews = (metrics?.totalInterviews || 0) > 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-brand-900/40 via-indigo-900/20 to-slate-900/40 border border-brand-500/20">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Welcome back, {user?.profile?.fullName || user?.fullName || 'Candidate'}!
            <Sparkles className="w-5 h-5 text-brand-400" />
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Target Role: <strong className="text-slate-900 dark:text-slate-200">{user?.profile?.targetRole || 'Software Engineer'}</strong> ({user?.profile?.experienceLevel || 'Fresher'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/interviews/hr">
            <Button size="sm" variant="primary" leftIcon={<Users className="w-4 h-4" />}>
              Start HR Mock
            </Button>
          </Link>
          <Link to="/coding">
            <Button size="sm" variant="secondary" leftIcon={<Terminal className="w-4 h-4" />}>
              Code Sandbox
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-500/10 text-brand-500">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Completed Interviews</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics?.totalInterviews || 0}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">HR Behavioral Mocks</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics?.hrInterviews || 0}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-500">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Technical & Coding</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics?.technicalInterviews || 0}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Average Score</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics?.averageScore ? `${metrics.averageScore}%` : 'N/A'}
            </h3>
          </div>
        </Card>
      </div>

      {!hasInterviews ? (
        /* Empty / Onboarding State */
        <Card className="text-center py-12 px-4 space-y-4 border-dashed border-2">
          <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No interviews recorded yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Take your first AI interview to establish your baseline proficiency, discover skill gaps, and generate your custom roadmap.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/interviews/hr">
              <Button size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start First HR Interview
              </Button>
            </Link>
            <Link to="/practice">
              <Button variant="outline" size="md">
                Browse Questions
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Active User Dashboard Sections */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" /> Recent Interview History
            </h3>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {metrics?.recentInterviews.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-slate-400">{item.interviewType} • {item.difficulty}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-brand-500">{item.overallScore || '--'}%</span>
                    <p className="text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-semibold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Priority Weaknesses
            </h3>
            <div className="space-y-3">
              {metrics?.weakestSkills.map((s, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                  <span className="font-bold text-amber-500">{s.score}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
