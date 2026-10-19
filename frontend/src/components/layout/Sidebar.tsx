import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Code2,
  Terminal,
  Mic,
  FileText,
  Briefcase,
  BarChart3,
  CalendarCheck,
  BookOpen,
  User,
  Settings,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: SidebarItem[] = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'HR Interview', to: '/interviews/hr', icon: Users, badge: 'STAR' },
  { name: 'Technical Q&A', to: '/interviews/technical', icon: Code2 },
  { name: 'Coding Sandbox', to: '/coding', icon: Terminal },
  { name: 'Voice Mode', to: '/voice', icon: Mic },
  { name: 'Resume Review', to: '/resume', icon: FileText },
  { name: 'Job Matching', to: '/jobs', icon: Briefcase },
  { name: 'Skill Analytics', to: '/analytics', icon: BarChart3 },
  { name: 'Learning Roadmap', to: '/roadmap', icon: CalendarCheck },
  { name: 'Question Bank', to: '/practice', icon: BookOpen },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md hidden md:flex flex-col justify-between py-4 px-3 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          Interview Preparation
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-500 dark:text-brand-400 border border-brand-500/20">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-600/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`
          }
        >
          <User className="w-4 h-4 shrink-0" />
          <span>My Profile</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-600/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Account Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};
