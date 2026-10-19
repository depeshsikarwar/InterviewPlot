import { env } from '../../config/env';
import { logger } from '../../config/logger';

export interface HRQuestionContext {
  targetRole: string;
  difficulty: string;
  conversationHistory: { role: 'interviewer' | 'candidate'; text: string }[];
}

export interface TechnicalQuestionContext {
  targetRole: string;
  topic: string;
  difficulty: string;
  conversationHistory: { role: 'interviewer' | 'candidate'; text: string }[];
}

export interface EvaluationResult {
  overallScore: number; // 0 - 100
  relevanceScore: number; // 1 - 5
  structureScore: number; // 1 - 5
  specificityScore: number; // 1 - 5
  ownershipScore: number; // 1 - 5
  resultsScore: number; // 1 - 5
  strengths: string[];
  weaknesses: string[];
  evidenceQuotes: string[];
  modelAnswerExample: string;
  revisionTopics: string[];
  recommendedTasks: { title: string; explanation: string; estimatedMinutes: number; priority: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  starBreakdown: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export class AIService {
  /**
   * Generates next interview question or dynamic follow-up
   */
  async generateNextQuestion(context: HRQuestionContext): Promise<{ questionText: string; isFollowUp: boolean; category: string }> {
    const history = context.conversationHistory;
    const lastCandidateAnswer = history.filter((h) => h.role === 'candidate').slice(-1)[0]?.text;

    // If candidate gave a short or non-answer like "hello", ask them directly to answer the question
    if (lastCandidateAnswer && lastCandidateAnswer.trim().split(/\s+/).length < 8) {
      return {
        questionText: `Your previous response was very brief. Could you elaborate with a specific real-world example from your academic or project experience where you faced a significant challenge?`,
        isFollowUp: true,
        category: 'Follow-up: Elaboration Request',
      };
    }

    // Dynamic follow-up if candidate missed quantitative results or ownership
    if (lastCandidateAnswer && history.length >= 2 && history.length % 2 === 0 && !history[history.length - 2]?.text?.includes('follow-up')) {
      const followUp = this.generateDynamicFollowUp(lastCandidateAnswer, context.targetRole);
      if (followUp) {
        return {
          questionText: followUp,
          isFollowUp: true,
          category: 'Behavioral Follow-up',
        };
      }
    }

    // Comprehensive Question Sequence
    const questionCatalog = [
      { text: `Tell me about a challenging technical or teamwork obstacle you encountered in a recent software project. What was the situation, what action did you personally lead, and what was the outcome?`, category: 'STAR: Conflict & Obstacles' },
      { text: `Describe a situation where you had a disagreement with a team member, peer, or mentor about a technical choice or project direction. How did you resolve it constructively?`, category: 'STAR: Teamwork & Conflict' },
      { text: `Tell me about a time you worked on a project with a very tight deadline or ambiguous requirements. How did you prioritize tasks and ensure delivery?`, category: 'STAR: Time Management & Delivery' },
      { text: `Can you share an instance where something you built failed in production or during testing? How did you debug the root cause and prevent it from recurring?`, category: 'STAR: Failure & Accountability' },
      { text: `What motivates you specifically about working as a ${context.targetRole}, and what technical area are you actively learning right now?`, category: 'Career Motivation & Growth' },
    ];

    const questionIndex = Math.floor(history.length / 2) % questionCatalog.length;
    const selected = questionCatalog[questionIndex];

    return {
      questionText: selected.text,
      isFollowUp: false,
      category: selected.category,
    };
  }

  private generateDynamicFollowUp(answer: string, role: string): string | null {
    const lower = answer.toLowerCase();

    // Check if quantitative results are missing
    if (!lower.match(/\d+[%k]|improved|reduced|decreased|latency|metrics|scale|users|throughput/i)) {
      return `That gives good context. Could you quantify the impact of your actions? What measurable results, performance numbers, or user feedback resulted from your solution?`;
    }

    // Check if personal ownership is vague
    const iMatches = (lower.match(/\bi\b|\bmy\b|\bmine\b/g) || []).length;
    const weMatches = (lower.match(/\bwe\b|\bour\b/g) || []).length;
    if (weMatches > 3 && iMatches < 2) {
      return `You mentioned what the group accomplished as a whole. What specific architectural or implementation decisions did you individually own and execute?`;
    }

    return null;
  }

  /**
   * RIGOROUS STAR Rubric Evaluator
   * Strictly evaluates the candidate response. Non-answers, trivial greetings ("hello", "hi"),
   * or answers under 15 words receive strict failing scores (0-15%).
   */
  async evaluateHRAnswer(question: string, answer: string, targetRole: string): Promise<EvaluationResult> {
    const text = answer.trim();
    const lower = text.toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);

    // ==========================================
    // 1. Trivial / Non-Answer / Greeting Check
    // ==========================================
    const trivialGreetings = ['hello', 'hi', 'hey', 'test', 'yes', 'no', 'ok', 'okay', 'i dont know', "i don't know", 'nothing', 'skip'];
    const isTrivial = words.length <= 4 || trivialGreetings.includes(lower.replace(/[^a-z ]/g, '').trim());

    if (isTrivial) {
      return {
        overallScore: Math.min(10, words.length * 2), // 0 to 8 out of 100!
        relevanceScore: 1.0,
        structureScore: 1.0,
        specificityScore: 1.0,
        ownershipScore: 1.0,
        resultsScore: 1.0,
        strengths: ['Candidate acknowledged the prompt.'],
        weaknesses: [
          `The response ("${text}") is a brief greeting/placeholder with zero substantive content.`,
          'In a placement interview, questions require structured answers describing a real project or situation using the STAR framework.',
          'Missing Situation: Describe the project, company, or course context.',
          'Missing Action: Describe the exact steps you personally took.',
          'Missing Result: Conclude with measurable impact or key lessons learned.',
        ],
        evidenceQuotes: [text],
        modelAnswerExample: `When working on our college portal project, the database crashed under concurrent login loads of 500 users (Situation). My task was to diagnose the bottleneck and stabilize the auth system within 48 hours (Task). I analyzed PostgreSQL slow query logs, identified unindexed user lookups, added composite B-Tree indexes, and configured Redis connection pooling (Action). As a result, response times dropped by 72% and subsequent peak loads operated with 100% uptime (Result).`,
        revisionTopics: [
          'STAR Framework Fundamentals for Campus Interviews',
          'Eliminating Casual Greetings in Behavioral Interviews',
          'Preparing 5 Core Behavioral Placement Stories',
        ],
        recommendedTasks: [
          {
            title: 'Draft 3 Core STAR Stories with Situation, Task, Action, and Result',
            explanation: 'Write out complete 150-word narratives for an obstacle, a team conflict, and a technical achievement.',
            estimatedMinutes: 45,
            priority: 'HIGH',
          },
        ],
        starBreakdown: {
          situation: 'Not provided in response.',
          task: 'Not provided in response.',
          action: 'Not provided in response.',
          result: 'Not provided in response.',
        },
      };
    }

    // ==========================================
    // 2. Short / Underdeveloped Answer Check (< 25 words)
    // ==========================================
    if (words.length < 25) {
      return {
        overallScore: 28,
        relevanceScore: 2.0,
        structureScore: 1.5,
        specificityScore: 1.5,
        ownershipScore: 1.5,
        resultsScore: 1.0,
        strengths: ['Identified a topic area, but lacks elaboration.'],
        weaknesses: [
          'Answer is severely underdeveloped (under 25 words). Technical interviews expect 1.5 to 2 minutes of detailed explanation (100-200 words).',
          'Lacks concrete technical tools, trade-offs, and metrics.',
          'No measurable outcome or lesson described.',
        ],
        evidenceQuotes: [text],
        modelAnswerExample: `In my capstone project, our backend experienced query timeouts (Situation). I was responsible for fixing the slow response times (Task). I profiled the SQL queries, added missing foreign key indexes, and cached static routes (Action), reducing latency from 1.2s to 120ms (Result).`,
        revisionTopics: ['Expanding Behavioral Answers', 'STAR Story Structuring'],
        recommendedTasks: [
          {
            title: 'Practice Speaking Answers for 90 Seconds',
            explanation: 'Practice narrating your project experience with rich technical details.',
            estimatedMinutes: 30,
            priority: 'HIGH',
          },
        ],
        starBreakdown: {
          situation: text,
          task: 'Partially implied.',
          action: 'Lacks technical detail.',
          result: 'Missing quantitative outcome.',
        },
      };
    }

    // ==========================================
    // 3. Substantive Answer Evaluation
    // ==========================================
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const evidenceQuotes = sentences
      .filter((s) => s.trim().length > 20)
      .slice(0, 3)
      .map((s) => s.trim());

    // Component detection
    let situation = '';
    let task = '';
    let action = '';
    let result = '';

    for (const s of sentences) {
      const sl = s.toLowerCase();
      if (!situation && (sl.includes('when') || sl.includes('project') || sl.includes('semester') || sl.includes('intern') || sl.includes('hackathon') || sl.includes('client'))) {
        situation = s.trim();
      } else if (!action && (sl.includes('i ') || sl.includes('implemented') || sl.includes('built') || sl.includes('designed') || sl.includes('refactored') || sl.includes('analyzed') || sl.includes('wrote') || sl.includes('solved'))) {
        action = s.trim();
      } else if (!result && (sl.includes('result') || sl.includes('outcome') || sl.includes('improved') || sl.includes('reduced') || sl.includes('%') || sl.includes('learned') || sl.includes('successful'))) {
        result = s.trim();
      } else if (!task && (sl.includes('task') || sl.includes('goal') || sl.includes('needed to') || sl.includes('responsible') || sl.includes('had to'))) {
        task = s.trim();
      }
    }

    // Specificity keywords
    const techKeywords = ['react', 'node', 'python', 'java', 'c++', 'sql', 'postgres', 'docker', 'api', 'cache', 'redis', 'git', 'database', 'latency', 'test', 'aws'];
    const matchedTech = techKeywords.filter((k) => lower.includes(k));

    // Rubric calculations
    // 1. Relevance (1 to 5)
    let relevanceScore = 3.0;
    if (words.length >= 60) relevanceScore += 0.8;
    if (words.length >= 100) relevanceScore += 0.4;
    if (matchedTech.length >= 2) relevanceScore += 0.5;
    relevanceScore = Math.min(5, Math.max(1, Math.round(relevanceScore * 10) / 10));

    // 2. Structure (1 to 5)
    let structureScore = 2.0;
    if (situation) structureScore += 0.8;
    if (action) structureScore += 1.0;
    if (result) structureScore += 1.0;
    structureScore = Math.min(5, Math.max(1, Math.round(structureScore * 10) / 10));

    // 3. Specificity (1 to 5)
    let specificityScore = 2.0;
    specificityScore += Math.min(1.5, matchedTech.length * 0.4);
    if (lower.match(/\d+/)) specificityScore += 0.8; // Contains numbers/metrics
    if (words.length >= 80) specificityScore += 0.5;
    specificityScore = Math.min(5, Math.max(1, Math.round(specificityScore * 10) / 10));

    // 4. Ownership (1 to 5)
    const iCount = (lower.match(/\bi\b|\bmy\b|\bmine\b|\bme\b/g) || []).length;
    const weCount = (lower.match(/\bwe\b|\bour\b/g) || []).length;
    let ownershipScore = 3.0;
    if (lower.includes('i personally') || lower.includes('my task') || lower.includes('i was tasked') || lower.includes('i led') || lower.includes('my responsibility') || lower.includes('i analyzed') || lower.includes('i implemented')) {
      ownershipScore += 1.0;
    }
    if (iCount >= 3) ownershipScore += 1.0;
    else if (iCount >= 1) ownershipScore += 0.5;
    if (weCount > iCount * 3) ownershipScore -= 0.5;
    ownershipScore = Math.min(5, Math.max(1, Math.round(ownershipScore * 10) / 10));

    // 5. Results (1 to 5)
    let resultsScore = 2.0;
    if (lower.match(/\d+[%k]|improved|reduced|increased|sped up|shipped|passed|awarded|uptime/i)) {
      resultsScore += 1.8;
    }
    if (lower.includes('as a result') || lower.includes('outcome') || lower.includes('consequently') || lower.includes('resulted in')) {
      resultsScore += 0.5;
    }
    if (lower.includes('learned') || lower.includes('takeaway')) {
      resultsScore += 0.5;
    }
    resultsScore = Math.min(5, Math.max(1, Math.round(resultsScore * 10) / 10));

    // Overall Score
    const overallScore = Math.round(
      ((relevanceScore * 0.25 + structureScore * 0.2 + specificityScore * 0.2 + ownershipScore * 0.15 + resultsScore * 0.2) / 5) * 100
    );

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (ownershipScore >= 3.8) strengths.push('Clear demonstration of personal technical ownership.');
    else weaknesses.push('Clarify your individual technical contribution vs what the team did as a whole.');

    if (specificityScore >= 3.8) strengths.push(`Strong technical grounding using specific tools (${matchedTech.slice(0, 3).join(', ')}).`);
    else weaknesses.push('Mention specific programming languages, frameworks, or architectural tools.');

    if (resultsScore >= 3.8) strengths.push('Solid quantitative results and measurable impact articulated.');
    else weaknesses.push('Conclude with measurable metrics (e.g., latency reduction, test pass rate, or user growth).');

    if (structureScore >= 3.8) strengths.push('Well-structured narrative following the STAR methodology.');
    else weaknesses.push('Structure your answer more clearly into Situation, Task, Action, and Result.');

    return {
      overallScore,
      relevanceScore,
      structureScore,
      specificityScore,
      ownershipScore,
      resultsScore,
      strengths: strengths.length ? strengths : ['Good initial attempt at addressing the question.'],
      weaknesses: weaknesses.length ? weaknesses : ['Practice delivering with even greater conciseness.'],
      evidenceQuotes: evidenceQuotes.length ? evidenceQuotes : [text.slice(0, 100)],
      modelAnswerExample: `In my 3rd year web engineering project, our team struggled with slow database response times exceeding 2 seconds under concurrent testing (Situation). As the backend lead, I was tasked with reducing query latency below 200ms before our final evaluation (Task). I profiled our PostgreSQL queries, created compound indexes on frequently joined columns, and introduced Redis caching for read-heavy routes (Action). Consequently, query latency dropped by 84% and the system handled 1,000 concurrent requests without failure (Result).`,
      revisionTopics: [
        'Quantifying Engineering Outcomes in Interviews',
        'STAR Behavioral Communication Polish',
        'Technical Ownership Articulation',
      ],
      recommendedTasks: [
        {
          title: 'Refine 3 Project Stories with Concrete Metrics',
          explanation: 'Add before/after numbers (e.g. % improvement, test coverage, uptime) to your project summaries.',
          estimatedMinutes: 45,
          priority: 'HIGH',
        },
      ],
      starBreakdown: {
        situation: situation || 'Implied project context.',
        task: task || 'Assumed project requirement.',
        action: action || 'General solution described.',
        result: result || 'Missing quantitative measurement.',
      },
    };
  }

  /**
   * Evaluates a technical answer rigorously
   */
  async evaluateTechnicalAnswer(question: string, answer: string, topic: string): Promise<{
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    revisionTopics: string[];
  }> {
    const text = answer.trim();
    const lower = text.toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);

    // Trivial greeting / non-answer check
    if (words.length <= 4 || ['hello', 'hi', 'test', 'yes', 'no'].includes(lower.replace(/[^a-z]/g, ''))) {
      return {
        score: 5,
        feedback: `Your response ("${text}") is a brief greeting with no technical reasoning. You must explain the underlying computer science concepts.`,
        strengths: [],
        weaknesses: [
          'No technical explanation provided.',
          'Missing analysis of performance, memory, or architectural trade-offs.',
        ],
        revisionTopics: [topic, 'Fundamental CS Concepts'],
      };
    }

    if (words.length < 20) {
      return {
        score: 25,
        feedback: 'The response is too brief. Technical interviews require explaining mechanisms, complexities, and trade-offs.',
        strengths: ['Identified the general subject.'],
        weaknesses: ['Add detailed explanations of algorithmic complexity and failure modes.'],
        revisionTopics: [topic],
      };
    }

    // Check relevant keywords
    const keywords = ['time complexity', 'space complexity', 'o(1)', 'o(n)', 'o(log n)', 'trade-off', 'memory', 'cpu', 'index', 'lock', 'acid', 'cache', 'b-tree', 'thread', 'process', 'hash'];
    const matched = keywords.filter((k) => lower.includes(k));

    let score = 40;
    if (words.length >= 50) score += 15;
    if (words.length >= 90) score += 15;
    score += Math.min(30, matched.length * 8);

    score = Math.min(100, Math.max(10, score));

    return {
      score,
      feedback: score >= 75
        ? 'Strong technical explanation demonstrating correct conceptual knowledge and understanding of trade-offs.'
        : 'Foundational explanation provided, but could demonstrate deeper mastery of edge cases and complexity trade-offs.',
      strengths: [
        'Directly addressed the question.',
        matched.length > 0 ? `Used appropriate technical terms (${matched.slice(0, 3).join(', ')}).` : 'Clear communication.',
      ],
      weaknesses: [
        score < 80 ? 'Explicitly state time and space complexity implications.' : 'Discuss operational trade-offs and edge cases.',
      ],
      revisionTopics: [topic, 'Complexity Analysis & Optimization'],
    };
  }

  /**
   * Resume analysis
   */
  async analyzeResume(resumeText: string, targetRole: string) {
    const lower = resumeText.toLowerCase();

    const skillDict = [
      'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 'Go', 'Rust',
      'React', 'Node.js', 'Express', 'Next.js', 'HTML', 'CSS', 'Tailwind',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
      'Docker', 'Kubernetes', 'AWS', 'Git', 'Linux', 'CI/CD',
      'DSA', 'OOP', 'REST APIs', 'GraphQL', 'Microservices', 'Kafka'
    ];

    const extractedSkills = skillDict.filter((s) => lower.includes(s.toLowerCase()));

    const missingDetails: string[] = [];
    if (!lower.includes('project')) missingDetails.push('Explicit Projects Section');
    if (!lower.includes('github') && !lower.includes('linkedin')) missingDetails.push('Portfolio links (GitHub, LinkedIn)');
    if (!lower.match(/\d+%/)) missingDetails.push('Quantified metric achievements (e.g., % improvement, users served)');
    if (!lower.includes('education') && !lower.includes('gpa') && !lower.includes('b.tech')) missingDetails.push('Clear educational degree & graduation year');

    const strengths: string[] = [];
    if (extractedSkills.length >= 5) strengths.push(`Strong core technical stack (${extractedSkills.slice(0, 5).join(', ')}).`);
    if (lower.includes('intern') || lower.includes('experience')) strengths.push('Prior internship or industry-adjacent project exposure.');
    if (lower.includes('lead') || lower.includes('club') || lower.includes('hackathon')) strengths.push('Demonstrated initiative through extracurriculars or hackathons.');

    const recommendations: string[] = [
      'Format project bullet points using Google XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]".',
      'Highlight testing frameworks (Jest, PyTest, Supertest) to demonstrate production code quality.',
      'Ensure graduation year and GPA are clearly visible for placement cell screening.',
    ];

    const suggestedQuestions = [
      `Walk me through the architecture and data model of your primary project.`,
      `How did you handle error recovery and edge cases in your ${extractedSkills[0] || 'core language'} services?`,
      `Describe a challenging performance or concurrency bug you solved in your projects.`,
    ];

    const matchScore = Math.min(95, Math.max(45, 45 + extractedSkills.length * 4));

    return {
      extractedSkills,
      experienceHighlights: [
        'Hands-on full stack application implementation.',
        'Database modeling and API design.',
      ],
      missingDetails,
      strengths: strengths.length ? strengths : ['Good baseline formatting.'],
      recommendations,
      suggestedQuestions,
      matchScore,
    };
  }

  /**
   * Job description matcher
   */
  async matchJobDescription(jdText: string, userProfileSkills: string[]) {
    const lower = jdText.toLowerCase();

    const techCatalog = [
      'React', 'Node.js', 'Python', 'Java', 'C++', 'PostgreSQL', 'SQL',
      'Docker', 'AWS', 'DSA', 'REST APIs', 'Git', 'System Design', 'Redis',
      'TypeScript', 'JavaScript', 'Kubernetes', 'MongoDB', 'GraphQL'
    ];

    const requiredSkills = techCatalog.filter((t) => lower.includes(t.toLowerCase())).slice(0, 8);
    const userSkillsNormalized = userProfileSkills.map((s) => s.toLowerCase());

    const matchingSkills = requiredSkills.filter((s) => userSkillsNormalized.includes(s.toLowerCase()));
    const missingSkills = requiredSkills.filter((s) => !userSkillsNormalized.includes(s.toLowerCase()));

    const matchScore = requiredSkills.length > 0
      ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
      : 70;

    return {
      title: 'Target Placement Role',
      requiredSkills,
      preferredSkills: ['Agile / Scrum', 'CI/CD Pipelines', 'Clean Architecture', 'Unit Testing'],
      matchScore,
      matchingSkills,
      missingSkills,
      suggestedTopics: missingSkills.concat(['DSA Mock Interviews', 'System Design Fundamentals']),
      preparationPlan: [
        {
          week: 1,
          focus: `Close Core Gaps (${missingSkills.slice(0, 2).join(', ') || 'DSA & DB'})`,
          tasks: [
            `Complete 5 targeted practice problems in ${missingSkills[0] || 'PostgreSQL'}`,
            'Take 1 full-length technical mock interview',
          ],
        },
        {
          week: 2,
          focus: 'Behavioral STAR Preparation & Full Mock Simulation',
          tasks: [
            'Prepare 3 STAR stories aligning with company culture',
            'Take 1 full voice-enabled HR behavioral interview',
          ],
        },
      ],
    };
  }
}

export const aiService = new AIService();
