import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Mail, Lock, User as UserIcon, Briefcase, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    targetRole: 'Full Stack Engineer',
    experienceLevel: 'Fresher',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Join thousands preparing for placements & top engineering interviews</p>
        </div>

        <Card className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="e.g. Alex Vance"
              leftIcon={<UserIcon className="w-4 h-4" />}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="alex@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Password (min 8 chars, 1 uppercase, 1 number)"
              type="password"
              required
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Target Role</label>
                <select
                  className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-sm py-2.5 px-3 text-slate-900 dark:text-slate-100 focus-ring"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Engineer">Full Stack Engineer</option>
                  <option value="Data Engineer">Data Engineer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Experience</label>
                <select
                  className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-sm py-2.5 px-3 text-slate-900 dark:text-slate-100 focus-ring"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                >
                  <option value="Fresher">Fresher (College)</option>
                  <option value="Junior">Junior (0-2 yrs)</option>
                  <option value="Mid">Mid-Level (2-5 yrs)</option>
                  <option value="Senior">Senior (5+ yrs)</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              Create Account & Start Preparing
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
