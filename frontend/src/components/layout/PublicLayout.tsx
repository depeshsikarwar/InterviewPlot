import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 bg-white/40 dark:bg-slate-900/40 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 InterviewPilot AI. Placement & Technical Preparation System.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:underline">Terms of Service</a>
            <a href="/pricing" className="hover:underline">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
