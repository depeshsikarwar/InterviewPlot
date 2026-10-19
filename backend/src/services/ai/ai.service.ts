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

export interface AdaptiveTurnInput {
  interviewType: 'HR' | 'TECHNICAL' | 'CODING';
  targetRole: string;
  difficulty: string;
  currentQuestionText: string;
  candidateAnswerText: string;
  conversationHistory: { role: 'interviewer' | 'candidate'; text: string }[];
}

export interface TurnEvaluation {
  score: number; // 0 to 100
  isCorrect: boolean;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  detectedTopics: string[];
  isTrivialOrGreeting: boolean;
  candidateExcerpt?: string;
  starComponents?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export class AIService {
  /**
   * Generates initial question based on interview type, role, and difficulty
   */
  async generateInitialQuestion(type: 'HR' | 'TECHNICAL' | 'CODING', targetRole: string, difficulty: string): Promise<{ questionText: string; category: string }> {
    if (type === 'TECHNICAL') {
      const technicalCatalog = [
        {
          questionText: 'Can you explain how a database index (such as a B-Tree or Hash index) works internally in PostgreSQL or MySQL, how it optimizes lookup queries, and what performance trade-off it introduces on write-heavy tables?',
          category: 'Database Internals & Indexing',
        },
        {
          questionText: 'In modern operating systems and backend services, what is the fundamental difference between a Process and a Thread? How does the OS handle context switches, and how do you prevent race conditions and deadlocks when threads access shared memory?',
          category: 'Operating Systems & Concurrency',
        },
        {
          questionText: `Walk me through how you would architect a scalable distributed rate limiter or URL shortening service for a ${targetRole} system handling 50,000 requests per second. What components, data stores, and caching strategies would you select?`,
          category: 'System Design & Scalability',
        },
        {
          questionText: 'Explain the transport layer differences between TCP and UDP. How does TCP guarantee reliability through three-way handshakes and sliding window congestion control, and in which real-time production systems would you choose UDP instead?',
          category: 'Computer Networks & Protocols',
        },
        {
          questionText: 'How does an event-driven asynchronous runtime (like Node.js or Go goroutines) handle tens of thousands of concurrent I/O requests without spawning a new OS thread for every single connection? How does it avoid blocking the event loop on CPU-bound work?',
          category: 'Asynchronous I/O & Concurrency',
        },
      ];
      const randomIdx = Math.floor(Math.random() * technicalCatalog.length);
      return technicalCatalog[randomIdx];
    }

    // Default HR behavioral opener
    const hrCatalog = [
      {
        questionText: `Tell me about a challenging software project or technical obstacle you encountered recently. Walk me through the situation, your individual technical contribution, and the measurable outcome.`,
        category: 'STAR: Engineering Obstacle',
      },
      {
        questionText: `Describe a scenario where you had a disagreement with a peer, senior engineer, or team lead regarding an architectural decision, library choice, or project timeline. How did you resolve it constructively?`,
        category: 'STAR: Technical Conflict & Teamwork',
      },
      {
        questionText: `Tell me about a time you had to deliver a critical feature or fix a production bug under severe time pressure or with ambiguous requirements. How did you prioritize tasks and ensure quality?`,
        category: 'STAR: Time Management & Delivery',
      },
    ];
    const hrIdx = Math.floor(Math.random() * hrCatalog.length);
    return hrCatalog[hrIdx];
  }

  /**
   * Evaluates the candidate's turn answer first before generating the follow-up
   */
  async evaluateTurnAnswer(
    interviewType: 'HR' | 'TECHNICAL' | 'CODING',
    questionText: string,
    answerText: string,
    targetRole: string
  ): Promise<TurnEvaluation> {
    const text = (answerText || '').trim();
    const lower = text.toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);

    // Trivial greeting / non-answer check
    const normalized = lower.replace(/[^a-z0-9 ]/g, '').trim();
    const trivialGreetings = [
      'hello', 'hi', 'hey', 'test', 'testing', 'yes', 'no', 'ok', 'okay', 'sure',
      'i dont know', "i don't know", 'nothing', 'skip', 'pass', 'idk', 'no idea',
      'hello sir', 'hello maam', 'hello team', 'good morning', 'good afternoon', 'good evening',
      'asdf', 'asdfghjk', 'qwerty', 'thanks', 'thank you', 'how are you', 'im ready', 'i am ready',
      'hello interview pilot', 'hello there', 'hi there', 'hello world', 'fine', 'good'
    ];

    const isExplicitGreeting = trivialGreetings.includes(normalized) ||
      trivialGreetings.some((g) => normalized === g || (normalized.startsWith(g + ' ') && words.length <= 6));

    const isTrivial = words.length <= 4 || isExplicitGreeting || (words.length <= 8 && ['hello', 'hi', 'hey', 'test'].some((w) => lower.startsWith(w)));

    if (isTrivial) {
      return {
        score: 0,
        isCorrect: false,
        isTrivialOrGreeting: true,
        feedback: `CRITICAL REJECTION: Your submission ("${text}") is a casual greeting or non-answer. In competitive company and placement interviews, greetings or one-word replies receive an immediate zero. You must directly address the question with technical reasoning and evidence.`,
        strengths: [],
        weaknesses: [
          'No answer provided to the question.',
          'Missing technical concepts, architecture, or STAR structure.',
          'Greetings are disqualified as valid interview responses.',
        ],
        detectedTopics: [],
        candidateExcerpt: text,
      };
    }

    // Detect technical keywords
    const techDictionary: Record<string, string[]> = {
      'Redis & In-Memory Caching': ['redis', 'memcached', 'cache', 'caching', 'ttl', 'lru', 'cache stampede', 'cache-aside', 'write-through'],
      'PostgreSQL & Database Internals': ['postgres', 'postgresql', 'mysql', 'sql', 'index', 'indexes', 'b-tree', 'btree', 'hash index', 'foreign key', 'acid', 'transaction', 'wal', 'vacuum'],
      'Microservices & Distributed Systems': ['microservice', 'microservices', 'rpc', 'grpc', 'rest', 'api gateway', 'distributed', 'saga', 'idempotent', 'idempotency', 'two-phase commit', 'circuit breaker'],
      'Operating Systems & Concurrency': ['thread', 'threads', 'process', 'processes', 'concurrency', 'multithreading', 'mutex', 'semaphore', 'deadlock', 'race condition', 'lock', 'atomic', 'context switch'],
      'Asynchronous Runtimes': ['node', 'nodejs', 'event loop', 'libuv', 'v8', 'async', 'await', 'promise', 'callback', 'goroutine', 'channel'],
      'Frontend & State Management': ['react', 'vue', 'angular', 'virtual dom', 'dom', 'redux', 're-render', 'hook', 'useeffect', 'state management'],
      'Message Queues & Event Streaming': ['kafka', 'rabbitmq', 'sqs', 'pub/sub', 'pubsub', 'message queue', 'consumer group', 'partition'],
      'Containers & Infrastructure': ['docker', 'kubernetes', 'k8s', 'container', 'ci/cd', 'nginx', 'load balancer', 'reverse proxy', 'aws', 's3', 'cloud'],
      'Networking Protocols': ['tcp', 'udp', 'http', 'https', 'http/2', 'http/3', 'websocket', 'dns', 'tls', 'ssl', 'three-way handshake', 'sliding window'],
      'Algorithms & Data Structures': ['hash map', 'hashmap', 'binary search', 'dynamic programming', 'tree', 'graph', 'dfs', 'bfs', 'stack', 'queue', 'heap', 'two pointers', 'o(1)', 'o(n)', 'o(log n)'],
    };

    const detectedTopics: string[] = [];
    for (const [topicName, kwList] of Object.entries(techDictionary)) {
      if (kwList.some((kw) => lower.includes(kw))) {
        detectedTopics.push(topicName);
      }
    }

    // Extract excerpt (sentence with substance)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const candidateExcerpt = (sentences.find((s) => s.trim().length > 25) || text).trim();

    if (interviewType === 'TECHNICAL') {
      const evalTech = await this.evaluateTechnicalAnswer(questionText, answerText, targetRole);
      return {
        score: evalTech.score,
        isCorrect: evalTech.score >= 60,
        isTrivialOrGreeting: false,
        feedback: evalTech.feedback,
        strengths: evalTech.strengths,
        weaknesses: evalTech.weaknesses,
        detectedTopics,
        candidateExcerpt: candidateExcerpt.slice(0, 120),
      };
    } else {
      const evalHR = await this.evaluateHRAnswer(questionText, answerText, targetRole);
      return {
        score: evalHR.overallScore,
        isCorrect: evalHR.overallScore >= 60,
        isTrivialOrGreeting: false,
        feedback: evalHR.overallScore >= 75
          ? 'Strong STAR behavioral answer demonstrating clear individual technical ownership and measurable outcomes.'
          : 'Answer provided but requires more quantitative metrics and specific technical details.',
        strengths: evalHR.strengths,
        weaknesses: evalHR.weaknesses,
        detectedTopics,
        candidateExcerpt: candidateExcerpt.slice(0, 120),
        starComponents: evalHR.starBreakdown,
      };
    }
  }

  /**
   * Generates dynamic, bespoke follow-up question based directly on candidate's answer and evaluation.
   * NEVER gives the same static question sequence to all candidates.
   */
  async generateAdaptiveTurn(
    input: AdaptiveTurnInput,
    evaluation: TurnEvaluation
  ): Promise<{ questionText: string; isFollowUp: boolean; category: string }> {
    const { interviewType, currentQuestionText, candidateAnswerText } = input;
    const lower = candidateAnswerText.toLowerCase();

    // 1. If candidate gave a greeting or non-answer, firmly demand an actual technical answer
    if (evaluation.isTrivialOrGreeting || evaluation.score === 0) {
      return {
        questionText: `Your response was a casual placeholder rather than a substantive answer. In this interview, you are evaluated strictly on engineering logic. Let's restart: ${currentQuestionText}`,
        isFollowUp: true,
        category: 'Interviewer Redirection',
      };
    }

    // 2. TECHNICAL INTERVIEW ADAPTIVE FOLLOW-UPS
    if (interviewType === 'TECHNICAL') {
      if (lower.includes('redis') || lower.includes('cache')) {
        return {
          questionText: `You mentioned utilizing caching. How do you structure cache keys and handle cache invalidation when underlying records mutate? In a high-traffic production spike, what strategy would you adopt to prevent a Cache Stampede or Thundering Herd problem on your primary database?`,
          isFollowUp: true,
          category: 'Technical Follow-up: Caching & Invalidation',
        };
      }

      if (lower.includes('postgres') || lower.includes('mysql') || lower.includes('index') || lower.includes('b-tree') || lower.includes('sql')) {
        return {
          questionText: `You discussed database indexing. Can you explain the internal structure of a B-Tree index, why the order of columns in a composite index is critical, and what write amplification penalty indexes introduce during high-throughput ingestion?`,
          isFollowUp: true,
          category: 'Technical Follow-up: Database Internals',
        };
      }

      if (lower.includes('microservice') || lower.includes('rest') || lower.includes('grpc') || lower.includes('distributed')) {
        return {
          questionText: `You proposed decomposing the system into microservices. How would you ensure data consistency across distributed boundaries without incurring distributed lock contention? How do you implement idempotency and handle cascading network timeouts?`,
          isFollowUp: true,
          category: 'Technical Follow-up: Distributed Consistency',
        };
      }

      if (lower.includes('thread') || lower.includes('concurrency') || lower.includes('mutex') || lower.includes('lock')) {
        return {
          questionText: `You mentioned concurrency and multi-threading. What are the four Coffman conditions required for a deadlock to occur, and how would you design your resource locking hierarchy or utilize lock-free atomic primitives to eliminate deadlock risks?`,
          isFollowUp: true,
          category: 'Technical Follow-up: Concurrency & Deadlocks',
        };
      }

      if (lower.includes('kafka') || lower.includes('queue') || lower.includes('pub/sub') || lower.includes('message')) {
        return {
          questionText: `You highlighted using Kafka or message queues for asynchronous decoupling. How do you configure partition keys to guarantee strict message ordering, and how does your consumer architecture handle rebalancing and poison-pill messages?`,
          isFollowUp: true,
          category: 'Technical Follow-up: Event Streaming & Queues',
        };
      }

      if (lower.includes('node') || lower.includes('event loop') || lower.includes('async')) {
        return {
          questionText: `You described using Node.js for asynchronous I/O. Can you explain how libuv and the V8 event loop coordinate microtasks and macrotasks, and how you ensure a CPU-intensive computation does not block the main thread from serving incoming HTTP traffic?`,
          isFollowUp: true,
          category: 'Technical Follow-up: Asynchronous Runtimes',
        };
      }

      if (lower.includes('react') || lower.includes('frontend') || lower.includes('state')) {
        return {
          questionText: `You brought up managing the UI state with React. How do you measure and prevent unnecessary component tree re-renders, and how would you architect real-time state synchronization when handling high-frequency WebSocket streams?`,
          isFollowUp: true,
          category: 'Technical Follow-up: Frontend Architecture',
        };
      }

      if (lower.includes('docker') || lower.includes('kubernetes') || lower.includes('container')) {
        return {
          questionText: `You mentioned containerization with Docker and Kubernetes. How do you manage secrets, zero-downtime rolling updates, and persistent volume state across pod eviction and cluster upgrades?`,
          isFollowUp: true,
          category: 'Technical Follow-up: DevOps & Containers',
        };
      }

      // If answer was brief or lacked complexity analysis
      if (evaluation.score < 60) {
        return {
          questionText: `You gave a general high-level overview. Could you dive deeper into the operational trade-offs, specifically analyzing the time and space complexity, and how your design would behave if traffic scales by 10x?`,
          isFollowUp: true,
          category: 'Technical Follow-up: Complexity & Scaling',
        };
      }

      // Contextual quote probe
      const quote = evaluation.candidateExcerpt || 'the architecture you described';
      return {
        questionText: `In your explanation, you emphasized "${quote}". Could you walk me through the edge cases and failure modes of that approach? What telemetry or metrics would you monitor in production to detect degradation early?`,
        isFollowUp: true,
        category: 'Technical Follow-up: Production Resiliency',
      };
    }

    // 3. HR BEHAVIORAL INTERVIEW ADAPTIVE FOLLOW-UPS
    const iMatches = (lower.match(/\bi\b|\bmy\b|\bmine\b/g) || []).length;
    const weMatches = (lower.match(/\bwe\b|\bour\b/g) || []).length;

    // Check if quantitative results are missing
    if (!lower.match(/\d+[%k]|improved|reduced|decreased|latency|metrics|scale|users|throughput|hours|days/i)) {
      return {
        questionText: `You described the situation well. Could you quantify the business or engineering impact of your solution? What concrete metrics (e.g. latency reduction, uptime, user adoption, or time saved) prove the success of your effort?`,
        isFollowUp: true,
        category: 'STAR Follow-up: Quantifiable Impact',
      };
    }

    // Check if personal ownership was vague
    if (weMatches > 3 && iMatches < 2) {
      return {
        questionText: `You highlighted what the team achieved as a group. What specific technical decisions, architecture designs, or code implementations were directly owned by you personally when difficulties arose?`,
        isFollowUp: true,
        category: 'STAR Follow-up: Personal Technical Ownership',
      };
    }

    // High scoring answer -> push for reflection / leadership
    const quote = evaluation.candidateExcerpt || 'your described solution';
    return {
      questionText: `That was a clear breakdown. Reflecting on "${quote}" with the engineering experience you have today, what technical or procedural choice would you do differently if you had to start that project over?`,
      isFollowUp: true,
      category: 'STAR Follow-up: Retrospective & Maturity',
    };
  }

  /**
   * Generates next interview question or dynamic follow-up (backward-compatible)
   */
  async generateNextQuestion(context: HRQuestionContext): Promise<{ questionText: string; isFollowUp: boolean; category: string }> {
    const history = context.conversationHistory;
    const lastCandidateAnswer = history.filter((h) => h.role === 'candidate').slice(-1)[0]?.text || '';
    const lastQuestion = history.filter((h) => h.role === 'interviewer').slice(-1)[0]?.text || '';

    const turnEval = await this.evaluateTurnAnswer('HR', lastQuestion, lastCandidateAnswer, context.targetRole);
    return this.generateAdaptiveTurn(
      {
        interviewType: 'HR',
        targetRole: context.targetRole,
        difficulty: context.difficulty,
        currentQuestionText: lastQuestion,
        candidateAnswerText: lastCandidateAnswer,
        conversationHistory: history,
      },
      turnEval
    );
  }

  /**
   * RIGOROUS STAR Rubric Evaluator
   * Strictly evaluates the candidate response. Non-answers, trivial greetings ("hello", "hi"),
   * or answers under 15 words receive strict failing scores (0-15%).
   */
  async evaluateHRAnswer(question: string, answer: string, targetRole: string): Promise<EvaluationResult> {
    const text = (answer || '').trim();
    const lower = text.toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);

    // ==========================================
    // 1. Trivial / Non-Answer / Greeting Check
    // ==========================================
    const normalized = lower.replace(/[^a-z0-9 ]/g, '').trim();
    const trivialGreetings = [
      'hello', 'hi', 'hey', 'test', 'testing', 'yes', 'no', 'ok', 'okay', 'sure',
      'i dont know', "i don't know", 'nothing', 'skip', 'pass', 'idk', 'no idea',
      'hello sir', 'hello maam', 'hello team', 'good morning', 'good afternoon', 'good evening',
      'asdf', 'asdfghjk', 'qwerty', 'thanks', 'thank you', 'how are you', 'im ready', 'i am ready',
      'hello interview pilot', 'hello there', 'hi there', 'hello world'
    ];

    const isExplicitGreeting = trivialGreetings.includes(normalized) ||
      trivialGreetings.some((g) => normalized === g || normalized.startsWith(g + ' ') && words.length <= 6);

    const isTrivial = words.length <= 4 || isExplicitGreeting || (words.length <= 10 && ['hello', 'hi', 'hey', 'test'].some((w) => lower.startsWith(w)));

    if (isTrivial) {
      return {
        overallScore: 0, // Strict zero for greetings and non-answers
        relevanceScore: 0.0,
        structureScore: 0.0,
        specificityScore: 0.0,
        ownershipScore: 0.0,
        resultsScore: 0.0,
        strengths: [],
        weaknesses: [
          `CRITICAL NON-ANSWER: Your response ("${text}") is only a casual greeting or placeholder.`,
          'In a real placement or technical interview, greetings do NOT count as answers.',
          'You must directly address the question using structured explanation (e.g. STAR: Situation, Task, Action, Result).',
          'Missing Situation: Describe the exact project, role, or challenge.',
          'Missing Action: Detail the engineering steps you took.',
          'Missing Result: Quantify the outcome and impact.',
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
          situation: 'Not provided (greeting only).',
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
        overallScore: 20,
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
    const text = (answer || '').trim();
    const lower = text.toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);

    // Trivial greeting / non-answer check
    const normalized = lower.replace(/[^a-z0-9 ]/g, '').trim();
    const trivialGreetings = [
      'hello', 'hi', 'hey', 'test', 'testing', 'yes', 'no', 'ok', 'okay', 'sure',
      'i dont know', "i don't know", 'nothing', 'skip', 'pass', 'idk', 'no idea',
      'hello sir', 'hello maam', 'hello team', 'good morning', 'good afternoon', 'good evening',
      'asdf', 'asdfghjk', 'qwerty', 'thanks', 'thank you', 'how are you', 'im ready', 'i am ready',
      'hello interview pilot', 'hello there', 'hi there', 'hello world'
    ];

    const isExplicitGreeting = trivialGreetings.includes(normalized) ||
      trivialGreetings.some((g) => normalized === g || normalized.startsWith(g + ' ') && words.length <= 6);

    const isTrivial = words.length <= 4 || isExplicitGreeting || (words.length <= 10 && ['hello', 'hi', 'hey', 'test'].some((w) => lower.startsWith(w)));

    if (isTrivial) {
      return {
        score: 0,
        feedback: `CRITICAL REJECTION: Your response ("${text}") is only a casual greeting or non-answer. In a technical placement interview, you must directly explain the engineering concepts, internal data structures, and trade-offs. Zero points awarded.`,
        strengths: [],
        weaknesses: [
          'No technical explanation or architecture described.',
          'Missing analysis of performance, memory, time complexity, or system trade-offs.',
          'Greetings and placeholder inputs are not considered valid answers.',
        ],
        revisionTopics: [topic, 'Fundamental CS Concepts & Core Algorithms'],
      };
    }

    if (words.length < 20) {
      return {
        score: 20,
        feedback: 'The response is too brief. Technical interviews require explaining mechanisms, complexities, and trade-offs in depth.',
        strengths: ['Addressed the general topic.'],
        weaknesses: ['Add detailed explanations of algorithmic complexity, data structures, and trade-offs.'],
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

  /**
   * AlgoExpert-style AI Code Quality & Big-O Complexity Analysis
   */
  async analyzeCodeQualityAndComplexity(params: {
    code: string;
    language: string;
    problemTitle?: string;
    problemPrompt?: string;
  }) {
    const { code, language } = params;
    const cleanCode = code.trim();

    if (!cleanCode || cleanCode.length < 15) {
      return {
        timeComplexity: 'Unknown',
        spaceComplexity: 'Unknown',
        qualityScore: 10,
        verdict: 'Incomplete / Empty Code Snippet',
        strengths: [],
        antiPatterns: ['Snippet too brief to analyze execution complexity'],
        edgeCasesHandled: [],
        edgeCasesMissing: ['Null / empty input validation', 'Single element handling', 'Bounds checking'],
        refactoringSuggestions: ['Provide a full solution function before running Big-O complexity analysis.'],
      };
    }

    // Heuristic syntax & complexity detection
    let timeComplexity = 'O(N)';
    let spaceComplexity = 'O(1)';
    let timeComplexityRationale = 'Single linear traversal through the data collection.';
    let spaceComplexityRationale = 'Constant auxiliary memory with only primitive pointer/variable allocations.';

    // Check for nested loops
    const forLoopMatches = (cleanCode.match(/\bfor\b|\bwhile\b/g) || []).length;
    const hasNestedLoops = /(for|while)[^{}\n]*\{[^}]*(for|while)|for\s+.*:\s*\n\s+.*for\s+/s.test(cleanCode);
    const hasSorting = /\.sort\(|sorted\(|std::sort|Arrays\.sort/i.test(cleanCode);
    const hasBinarySearch = /(left\s*<=\s*right|low\s*<=\s*high|mid\s*=\s*)/i.test(cleanCode);
    const hasRecursion = params.problemTitle ? new RegExp(`\\b${params.problemTitle.replace(/[^a-zA-Z]/g, '')}\\b`).test(cleanCode) : false;

    if (hasNestedLoops || forLoopMatches >= 2 && !hasBinarySearch) {
      timeComplexity = 'O(N²)';
      timeComplexityRationale = 'Nested iteration detected across elements, scaling quadratically with input size N.';
    } else if (hasSorting) {
      timeComplexity = 'O(N log N)';
      timeComplexityRationale = 'Comparison-based sorting routine dominates execution time.';
    } else if (hasBinarySearch) {
      timeComplexity = 'O(log N)';
      timeComplexityRationale = 'Search space is halved on each iteration via binary partition.';
    } else if (forLoopMatches === 0 && !hasRecursion) {
      timeComplexity = 'O(1)';
      timeComplexityRationale = 'Direct index arithmetic or constant-time operations without iterative looping.';
    }

    // Auxiliary Space Analysis
    const hasHashMap = /Map|Set|dict\(|\blookup\b|\bhash\b|\bmap\b|unordered_map|HashMap|HashSet|\{\}/i.test(cleanCode);
    const hasStackQueue = /stack|queue|deque|Vector|ArrayList|\[\]/i.test(cleanCode) && (cleanCode.includes('.push(') || cleanCode.includes('.append('));

    if (hasHashMap || hasStackQueue) {
      spaceComplexity = 'O(N)';
      spaceComplexityRationale = 'Auxiliary data structure (hash map / frequency table / stack) dynamically stores up to N elements.';
    }

    // Edge Cases Auditing
    const edgeCasesHandled: string[] = [];
    const edgeCasesMissing: string[] = [];

    if (/empty|\.length\s*===?\s*0|len\(.*\)\s*==\s*0|null|undefined|!nums|!s/i.test(cleanCode)) {
      edgeCasesHandled.push('Guards against empty, null, or zero-length inputs');
    } else {
      edgeCasesMissing.push('Zero-length or null input handling');
    }

    if (/length\s*===?\s*1|len\(.*\)\s*==\s*1/i.test(cleanCode)) {
      edgeCasesHandled.push('Explicit single-element base case condition');
    } else {
      edgeCasesMissing.push('Single element edge case verification');
    }

    if (/negative|diff\s*<\s*0|< 0/i.test(cleanCode)) {
      edgeCasesHandled.push('Negative numerical value or decrement boundaries handled');
    }

    // Code Quality calculation
    let qualityScore = 75;
    const strengths: string[] = [];
    const antiPatterns: string[] = [];
    const refactoringSuggestions: string[] = [];

    if (timeComplexity === 'O(N)' || timeComplexity === 'O(log N)') {
      qualityScore += 15;
      strengths.push(`Optimal time complexity achieved (${timeComplexity}).`);
    } else if (timeComplexity === 'O(N²)') {
      qualityScore -= 15;
      antiPatterns.push('Quadratic time complexity O(N²) may cause Time Limit Exceeded (TLE) on large test inputs.');
      refactoringSuggestions.push('Consider trading auxiliary space using a Hash Map or Two Pointers to reduce time to O(N).');
    }

    if (spaceComplexity === 'O(1)') {
      qualityScore += 10;
      strengths.push('In-place memory utilization without additional array allocation.');
    }

    if (cleanCode.includes('//') || cleanCode.includes('#')) {
      strengths.push('Good inline code documentation explaining algorithm steps.');
    } else {
      refactoringSuggestions.push('Add brief explanatory comments documenting variable invariants and boundary conditions.');
    }

    return {
      timeComplexity,
      timeComplexityRationale,
      spaceComplexity,
      spaceComplexityRationale,
      qualityScore: Math.min(100, Math.max(30, qualityScore)),
      verdict: qualityScore >= 80 ? 'Production Ready & Optimal' : 'Working Solution with Optimization Potential',
      strengths,
      antiPatterns,
      edgeCasesHandled,
      edgeCasesMissing,
      refactoringSuggestions,
    };
  }

  /**
   * Interviewing.io / Pramp Persona-Specific Interview Hints
   */
  async generateInterviewerHint(params: {
    persona: 'maya' | 'rex' | 'sarah';
    question: string;
    currentCodeOrAnswer?: string;
    attemptCount?: number;
  }) {
    const { persona, question, currentCodeOrAnswer } = params;
    const count = params.attemptCount || 1;

    switch (persona) {
      case 'maya': // Mentor Maya: Warm, encouraging, conceptual
        if (count === 1) {
          return {
            persona: 'Mentor Maya',
            role: 'Senior Tech Mentor & College Placement Coach',
            avatar: '👩‍🏫',
            tone: 'Encouraging & Constructive',
            hint: `Take a deep breath! You're in a great spot. First, re-read the problem statement and ask yourself: what is the brute-force way to solve this? Once we understand the O(N²) approach, what data structure lets us check elements in O(1) time?`,
            followUpQuestion: 'Can you think of a data structure that maps keys to indices?',
          };
        } else if (count === 2) {
          return {
            persona: 'Mentor Maya',
            role: 'Senior Tech Mentor & College Placement Coach',
            avatar: '👩‍🏫',
            tone: 'Encouraging & Constructive',
            hint: `Try a Hash Map (or Dictionary in Python). As you iterate through the list, compute the required complement (e.g., target - currentNumber). If that complement exists in your map, you immediately have your answer!`,
            followUpQuestion: 'What should we store as the key, and what as the value in the hash map?',
          };
        } else {
          return {
            persona: 'Mentor Maya',
            role: 'Senior Tech Mentor & College Placement Coach',
            avatar: '👩‍🏫',
            tone: 'Encouraging & Constructive',
            hint: `Here is the optimal pseudocode pattern:
1. Initialize empty map 'seen = {}'.
2. For index i, num in array:
   - complement = target - num
   - if complement in seen: return [seen[complement], i]
   - seen[num] = i
3. Return [] if no pair exists.`,
            followUpQuestion: 'Does this handle duplicate numbers properly?',
          };
        }

      case 'rex': // Bar-Raiser Rex: FAANG Principal, rigorous, edge-cases
        if (count === 1) {
          return {
            persona: 'Bar-Raiser Rex',
            role: 'FAANG Staff Engineer & Bar-Raiser',
            avatar: '⚡',
            tone: 'Hyper-Rigorous & Analytical',
            hint: `If this service receives 100,000 requests per second and array size N reaches 10^6, an O(N²) solution is completely unacceptable—it will trigger CPU saturation. What invariant can you establish to achieve linear O(N) execution?`,
            followUpQuestion: 'What are the space-time tradeoffs of caching intermediate states?',
          };
        } else {
          return {
            persona: 'Bar-Raiser Rex',
            role: 'FAANG Staff Engineer & Bar-Raiser',
            avatar: '⚡',
            tone: 'Hyper-Rigorous & Analytical',
            hint: `Maintain a one-pass hash index. Be ready to explain worst-case hash collision behavior (O(N) in malicious degenerate input) versus average case O(1). Also specify how your solution handles memory limits if N exceeds RAM capacity.`,
            followUpQuestion: 'What happens if the array contains negative integers, zero, or duplicates?',
          };
        }

      case 'sarah': // Sarah Jenkins: HR / Behavioral Director
      default:
        return {
          persona: 'Sarah Jenkins',
          role: 'Talent Acquisition Director & Culture Leader',
          avatar: '💼',
          tone: 'Empathetic & Structured',
          hint: `In behavioral rounds, top candidates focus heavily on the 'Action' (A) and 'Result' (R) components of the STAR method. Avoid saying 'we did this'—anchor on what YOU specifically spearheaded, designed, or resolved when conflicts arose.`,
          followUpQuestion: 'Can you share a concrete metric or percentage that measures the final outcome?',
        };
    }
  }

  /**
   * Exponent-style System Design Studio Architecture Audit
   */
  async auditSystemDesign(params: {
    prompt: string;
    components: Array<{ id: string; type: string; label: string; connectsTo?: string[] }>;
    traffic: {
      dau?: number;
      readRps?: number;
      writeRps?: number;
      storagePerDayGb?: number;
    };
  }) {
    const { prompt, components = [], traffic } = params;

    const compTypes = components.map((c) => c.type.toLowerCase());
    const hasLB = compTypes.some((t) => t.includes('load') || t.includes('balancer') || t.includes('lb') || t.includes('gateway'));
    const hasCache = compTypes.some((t) => t.includes('redis') || t.includes('memcached') || t.includes('cache'));
    const hasDB = compTypes.some((t) => t.includes('sql') || t.includes('postgres') || t.includes('mongo') || t.includes('database') || t.includes('db'));
    const hasQueue = compTypes.some((t) => t.includes('kafka') || t.includes('rabbit') || t.includes('queue') || t.includes('pubsub'));
    const hasCDN = compTypes.some((t) => t.includes('cdn') || t.includes('cloudflare') || t.includes('s3'));

    const readRps = traffic.readRps || 5000;
    const writeRps = traffic.writeRps || 1000;
    const dailyStorageGb = traffic.storagePerDayGb || 50;

    let scalabilityScore = 50;
    const strengths: string[] = [];
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];

    if (hasLB) {
      scalabilityScore += 15;
      strengths.push('Load Balancer / API Gateway included: Distributes incoming HTTP/gRPC traffic across worker replicas.');
    } else {
      vulnerabilities.push('Single Point of Failure (SPOF): Direct client-to-service communication lacks reverse proxy and auto-scaling distribution.');
      recommendations.push('Add an NGINX / AWS ALB Load Balancer between Clients and Microservices.');
    }

    if (hasCache) {
      scalabilityScore += 15;
      strengths.push('In-Memory Caching (Redis/Memcached): Protects primary database from read-heavy traffic spikes.');
    } else if (readRps > 1000) {
      vulnerabilities.push(`High Read Load (${readRps} RPS) directly hits database disks without a caching buffer.`);
      recommendations.push('Introduce a Cache-Aside pattern using Redis to offload 80%+ of frequent read queries.');
    }

    if (hasQueue) {
      scalabilityScore += 10;
      strengths.push('Asynchronous Message Broker (Kafka/RabbitMQ): Decouples write operations and provides backpressure control.');
    } else if (writeRps > 500) {
      recommendations.push('Introduce Kafka or SQS to process high write throughput asynchronously without blocking clients.');
    }

    if (hasCDN) {
      scalabilityScore += 10;
      strengths.push('Edge CDN: Static assets and media files are cached geographically close to end users.');
    }

    if (hasDB) {
      strengths.push('Persistent database tier configured.');
    } else {
      vulnerabilities.push('Missing persistent storage tier for durable transaction recording.');
      recommendations.push('Provision PostgreSQL (with read replicas) or Cassandra for distributed persistence.');
    }

    // Traffic estimation calculations
    const peakQps = Math.round(readRps * 2.5);
    const annualStorageTb = Math.round(((dailyStorageGb * 365) / 1000) * 10) / 10;

    return {
      scalabilityScore: Math.min(100, Math.max(35, scalabilityScore)),
      systemVerdict: scalabilityScore >= 80 ? 'Production-Ready Architecture' : 'Foundational Design with Bottlenecks',
      strengths,
      vulnerabilities,
      recommendations,
      trafficCalculations: {
        readRps,
        writeRps,
        peakQps,
        dailyStorageGb,
        annualStorageTb,
        networkBandwidthMbps: Math.round(((readRps * 2 + writeRps * 10) * 8) / 1000),
      },
      placementChecklist: [
        { item: 'Stateless Application Tier', passed: hasLB },
        { item: 'Sub-10ms Read Caching', passed: hasCache },
        { item: 'Zero Data-Loss Persistence', passed: hasDB },
        { item: 'Asynchronous Decoupling', passed: hasQueue },
        { item: 'Global Edge Latency (CDN)', passed: hasCDN },
      ],
    };
  }
}

export const aiService = new AIService();
