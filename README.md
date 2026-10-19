# InterviewPilot AI

> **Realistic, AI-Led Placement & Technical Interview Preparation Platform**

InterviewPilot AI is a comprehensive, production-ready interview training and skill assessment platform built for college students, fresh graduates, and active job seekers. It features adaptive conversational behavioral and technical interviews, an integrated coding execution workspace, resume and job description gap analysis, evidence-backed evaluation reports, and personalized weekly roadmaps.

---

## 🌟 Key Features

1. **AI HR Interviews**:
   - Behavioral questions mapped to core competencies (Leadership, Teamwork, Conflict, Problem-Solving, Motivation, etc.).
   - Conversational depth with dynamic follow-ups based on candidate responses.
   - Comprehensive STAR framework evaluation with 5-point rubrics.

2. **AI Technical Interviews**:
   - Dynamic questioning across DSA, OOP, DBMS, Operating Systems, Networks, System Design, and Modern Web Stacks.
   - Conceptual correctness, reasoning, complexity analysis, and edge-case probing.

3. **Monaco Coding Workspace**:
   - In-browser code editor with multi-language support (Python, JavaScript, TypeScript, C++, Java, SQL).
   - Real-time test-case execution (sample and hidden tests).
   - Time and space complexity checks with secure execution sandboxing.

4. **Speech & Voice Mode**:
   - Interactive voice interviews with real-time speech-to-text transcript and voice response.
   - Graceful fallback to text mode with mute and stop controls.

5. **Resume & Job Description Analysis**:
   - Upload PDF or DOCX resumes to extract skills, education, experience, and tailored questions.
   - Paste job descriptions to calculate match percentage, missing skills, and target preparation roadmaps.

6. **Granular Reports & Evidence-Based Feedback**:
   - Per-question scoring with specific quotes from answers as evidence.
   - Actionable suggestions, model answers (as examples), and revision topics.

7. **Skill Analytics & Visual Dashboards**:
   - Real-time calculation of overall score trends, radar charts of skill proficiency, and weakness tracking.

8. **Personalized Weekly Learning Roadmap**:
   - Automatically updated study tasks based on measured interview weaknesses and available daily study time.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, TanStack Query, Recharts, Monaco Editor, Lucide Icons, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Zod, Winston logger, REST APIs with strict input validation and rate limiting.
- **Database**: PostgreSQL with Prisma ORM, relations, migrations, transactions, and indexing.
- **AI Engine**: Backend AI service adapter supporting structured JSON responses with schema validation, configurable LLM providers (Gemini / OpenAI / Mock fallback).
- **Code Execution**: Isolated code execution engine supporting Judge0 API with a local sandboxed runner fallback.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 14
- npm or pnpm

### 1. Clone & Setup
```bash
git clone <repo-url>
cd INTERVIEWPILOT
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and AI keys
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`, with the backend API running on `http://localhost:5001`.

---

## 🔒 Security & Privacy

- Argon2id / bcrypt password hashing.
- HttpOnly, Secure, SameSite cookies / JWT with token expiration.
- Strict input sanitization protecting against prompt injection in resumes and transcripts.
- Strict user data isolation: all endpoints verify resource ownership to prevent horizontal privilege escalation.
- Account data export and deletion endpoints (GDPR compliance).

---

## 📋 Implementation Checklist & Status

See [`CHECKLIST.md`](./CHECKLIST.md) for detailed progress tracking across all 10 project phases.
