import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import {
  FeaturesPage,
  HowItWorksPage,
  PricingPage,
  PrivacyPage,
  TermsPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './pages/PublicPages';
import {
  ProfilePage,
  HRInterviewPage,
  TechnicalInterviewPage,
  CodingWorkspacePage,
  VoiceInterviewPage,
  ResumePage,
  JobMatchPage,
  AnalyticsPage,
  RoadmapPage,
  QuestionBankPage,
  SettingsPage,
} from './pages/WorkspacePages';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Authenticated Workspace Layout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/interviews/hr" element={<HRInterviewPage />} />
              <Route path="/interviews/technical" element={<TechnicalInterviewPage />} />
              <Route path="/coding" element={<CodingWorkspacePage />} />
              <Route path="/voice" element={<VoiceInterviewPage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/jobs" element={<JobMatchPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/practice" element={<QuestionBankPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};
