# InterviewPilot AI - Master Implementation Checklist

This checklist tracks implementation progress against the 10-phase master workflow.

---

### [x] Phase 1: Architecture, Planning & Repository Setup
- [x] Inspect existing workspace and environment.
- [x] Initialize Git repository.
- [x] Propose modular monolithic architecture (`architecture_plan.md`).
- [x] Author comprehensive project `README.md` and `CHECKLIST.md`.
- [x] Check PostgreSQL and core environment tools.

---

### [ ] Phase 2: Design System, Core Backend, Database & Authentication
- [ ] Initialize Backend project (TypeScript, Express, Prisma, Zod, Logger).
- [ ] Setup Prisma schema with PostgreSQL models (User, Profile, Skill, Interview, etc.).
- [ ] Create seed script with reviewed technical & behavioral questions.
- [ ] Implement Auth module (Register, Login, Logout, Forgot/Reset password, JWT/Cookie session).
- [ ] Add auth rate limiting and password hashing (bcrypt).
- [ ] Initialize Frontend project (Vite, React, TypeScript, Tailwind CSS, Lucide Icons, Router).
- [ ] Setup cohesive design system (Dark/Light mode, typography, tokens, components).
- [ ] Build reusable UI components (Navbar, Sidebar, Button, Card, Input, Modal, Toast).
- [ ] Implement Public pages (Landing, Login, Register, Forgot Password, Terms, Privacy).
- [ ] Verify Phase 2 with tests and integration checks.

---

### [ ] Phase 3: Profile Management & Real Data Dashboard
- [ ] Implement Profile API endpoints (`GET /api/v1/profile`, `PATCH /api/v1/profile`).
- [ ] Implement Profile management frontend with target roles, skills, and availability.
- [ ] Implement Dashboard API computing genuine metrics from database.
- [ ] Build Dashboard UI (Interview counts, recent scores, skill radar, weak skills, onboarding state).
- [ ] Verify Phase 3 with unit and integration tests.

---

### [ ] Phase 4: AI HR Interview Engine & Evidence-Based Reports
- [ ] Build AI Interviewer & Evaluator abstraction with schema validation.
- [ ] Implement HR Interview setup & session APIs (start, next question, follow-ups, submit answer, finish).
- [ ] Build HR Interview Workspace UI (Timer, question progression, STAR response input, speech controls).
- [ ] Implement STAR rubric evaluator (1-5 scoring for Relevance, Structure, Specificity, Ownership, Results).
- [ ] Build Comprehensive Interview Report UI (Per-question score, evidence quotes, suggestions, revision topics).
- [ ] Verify Phase 4 with tests.

---

### [ ] Phase 5: AI Technical Interview & Monaco Coding Workspace
- [ ] Implement Technical Interview question flow across DSA, CS Fundamentals, and Web Dev.
- [ ] Integrate Monaco Editor with multi-language syntax highlighting and theme matching.
- [ ] Implement isolated code execution service (Judge0 API + local sandboxed runner).
- [ ] Author test cases (sample and hidden edge cases) with authoritative backend execution.
- [ ] Build Coding Workspace UI (Problem statement, editor, run sample tests, submit, execution console).
- [ ] Verify Phase 5 with tests.

---

### [ ] Phase 6: AI Evaluation Reliability & Regression Test Suite
- [ ] Implement schema validation retries and fallback models.
- [ ] Add rules engine for score boundaries, question limits, and sanity checks.
- [ ] Write automated tests for evaluation boundaries and prompt-injection defense.
- [ ] Verify Phase 6 with test results.

---

### [ ] Phase 7: Skill Analytics & Personalized Learning Roadmaps
- [ ] Implement Skill Analytics API (`GET /api/v1/analytics/overview`, `/skills`, `/history`).
- [ ] Build Skill Analytics UI with Recharts (proficiency radar, score trends over time, repeated weaknesses).
- [ ] Implement Learning Roadmap Generator API creating prioritized weekly tasks from measured weaknesses.
- [ ] Build Learning Roadmap UI (Task cards, status toggles, due dates, resources, regeneration).
- [ ] Verify Phase 7 with tests.

---

### [ ] Phase 8: Resume Analysis & Job Description Matching
- [ ] Implement secure file upload for PDF/DOCX resumes with size & MIME validation.
- [ ] Build Resume extraction & gap analysis service.
- [ ] Implement Job Description matching API (extract requirements, calculate match %, generate roadmap).
- [ ] Build Resume Analysis & JD Analysis frontend pages.
- [ ] Verify Phase 8 with tests.

---

### [ ] Phase 9: Voice-Based Interview Mode
- [ ] Implement Web Speech API integration (Speech Recognition & Speech Synthesis).
- [ ] Build voice controls (microphone status, speech volume indicator, mute, transcript review).
- [ ] Add network/browser failure graceful fallback to text mode.
- [ ] Implement consent modal and recording policies.
- [ ] Verify Phase 9 with interactive testing.

---

### [ ] Phase 10: Security Hardening, Verification, Deployment & Documentation
- [ ] Implement CSRF, security headers (Helmet), CORS, and user data isolation tests.
- [ ] Verify account data export and deletion endpoints (GDPR).
- [ ] Create seed demo accounts and environment documentation.
- [ ] Run end-to-end integration tests across the complete user journey.
- [ ] Finalize deployment guides for Vercel (frontend) and Render/Railway (backend).
