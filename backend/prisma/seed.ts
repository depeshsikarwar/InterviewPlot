import { PrismaClient, InterviewType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // 1. Core Skill Catalog
  const defaultSkills = [
    { name: 'Data Structures & Algorithms', category: 'DSA', description: 'Arrays, Trees, Graphs, DP, Sorting, Searching' },
    { name: 'Problem Solving & Optimization', category: 'DSA', description: 'Time/space complexity analysis and edge case reasoning' },
    { name: 'Object-Oriented Programming (OOP)', category: 'CS Fundamentals', description: 'Polymorphism, Inheritance, Encapsulation, Abstraction' },
    { name: 'Database Management Systems (DBMS)', category: 'CS Fundamentals', description: 'SQL, Indexing, ACID properties, Normalization' },
    { name: 'Operating Systems', category: 'CS Fundamentals', description: 'Concurrency, Threads, Deadlocks, Virtual Memory' },
    { name: 'Computer Networks', category: 'CS Fundamentals', description: 'TCP/IP, HTTP/HTTPS, DNS, WebSockets, REST' },
    { name: 'Frontend Architecture & React', category: 'Frontend', description: 'React hooks, State management, DOM performance, CSS' },
    { name: 'Backend Engineering & APIs', category: 'Backend', description: 'Express, RESTful standards, Auth, Caching, Middleware' },
    { name: 'System Design & Scalability', category: 'System Design', description: 'Load balancers, Microservices, Sharding, Message queues' },
    { name: 'Behavioral: STAR Communication', category: 'HR/Behavioral', description: 'Structured answers covering Situation, Task, Action, Result' },
    { name: 'Conflict Resolution & Teamwork', category: 'HR/Behavioral', description: 'Navigating disagreements, collaboration, empathy' },
    { name: 'Ownership & Accountability', category: 'HR/Behavioral', description: 'Taking responsibility for deliverables, admitting mistakes' },
  ];

  for (const skill of defaultSkills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }
  console.log(`✅ Seeded ${defaultSkills.length} default skills`);

  // 2. Real-World Question Bank Items (Coding, Technical, HR)
  const questionBankItems = [
    // ==========================================
    // CODING CHALLENGES (LeetCode / Placement Classics)
    // ==========================================
    {
      title: 'Two Sum Problem',
      category: InterviewType.CODING,
      topic: 'DSA: Arrays & Hash Maps',
      difficulty: 'Easy',
      promptText: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
      starterCode: {
        python: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass\n',
        javascript: 'function twoSum(nums, target) {\n    // Write your solution here\n    return [];\n}\n',
      },
      sampleAnswer: 'def twoSum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []',
      testCases: [
        { type: 'SAMPLE', input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]' },
        { type: 'SAMPLE', input: 'nums = [3,2,4], target = 6', expectedOutput: '[1, 2]' },
        { type: 'HIDDEN', input: 'nums = [3,3], target = 6', expectedOutput: '[0, 1]' },
        { type: 'HIDDEN', input: 'nums = [-1,-2,-3,-4,-5], target = -8', expectedOutput: '[2, 4]' },
      ],
      hints: ['A brute-force solution is O(N^2). Can you use a hash map to achieve O(N) time complexity?'],
    },
    {
      title: 'Valid Parentheses',
      category: InterviewType.CODING,
      topic: 'DSA: Stacks',
      difficulty: 'Easy',
      promptText: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
      starterCode: {
        python: 'def isValid(s: str) -> bool:\n    # Write your solution here\n    pass\n',
        javascript: 'function isValid(s) {\n    // Write your solution here\n    return false;\n}\n',
      },
      sampleAnswer: 'def isValid(s: str) -> bool:\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else "#"\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack',
      testCases: [
        { type: 'SAMPLE', input: 's = "()"', expectedOutput: 'true' },
        { type: 'SAMPLE', input: 's = "()[]{}"', expectedOutput: 'true' },
        { type: 'SAMPLE', input: 's = "(]"', expectedOutput: 'false' },
        { type: 'HIDDEN', input: 's = "([)]"', expectedOutput: 'false' },
        { type: 'HIDDEN', input: 's = "{[]}"', expectedOutput: 'true' },
      ],
      hints: ['Use a Last-In-First-Out (LIFO) stack to match opening and closing brackets.'],
    },
    {
      title: 'Best Time to Buy and Sell Stock',
      category: InterviewType.CODING,
      topic: 'DSA: Arrays & DP',
      difficulty: 'Easy',
      promptText: 'You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
      starterCode: {
        python: 'def maxProfit(prices: list[int]) -> int:\n    # Write your solution here\n    return 0\n',
        javascript: 'function maxProfit(prices) {\n    // Write your solution here\n    return 0;\n}\n',
      },
      sampleAnswer: 'def maxProfit(prices):\n    min_price = float("inf")\n    max_profit = 0\n    for p in prices:\n        if p < min_price:\n            min_price = p\n        elif p - min_price > max_profit:\n            max_profit = p - min_price\n    return max_profit',
      testCases: [
        { type: 'SAMPLE', input: 'prices = [7,1,5,3,6,4]', expectedOutput: '5' },
        { type: 'SAMPLE', input: 'prices = [7,6,4,3,1]', expectedOutput: '0' },
        { type: 'HIDDEN', input: 'prices = [2,4,1]', expectedOutput: '2' },
      ],
      hints: ['Track the minimum price seen so far as you iterate through the list.'],
    },
    {
      title: 'Maximum Subarray (Kadane\'s Algorithm)',
      category: InterviewType.CODING,
      topic: 'DSA: Dynamic Programming',
      difficulty: 'Medium',
      promptText: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nExample 1:\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.',
      starterCode: {
        python: 'def maxSubArray(nums: list[int]) -> int:\n    # Write Kadane\'s algorithm here\n    return 0\n',
        javascript: 'function maxSubArray(nums) {\n    // Write your solution here\n    return 0;\n}\n',
      },
      testCases: [
        { type: 'SAMPLE', input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
        { type: 'SAMPLE', input: 'nums = [1]', expectedOutput: '1' },
        { type: 'HIDDEN', input: 'nums = [5,4,-1,7,8]', expectedOutput: '23' },
      ],
      hints: ['At each step, decide whether to add current number to running sum or start a new subarray.'],
    },
    {
      title: 'Valid Palindrome',
      category: InterviewType.CODING,
      topic: 'DSA: Two Pointers',
      difficulty: 'Easy',
      promptText: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.',
      starterCode: {
        python: 'def isPalindrome(s: str) -> bool:\n    # Write your solution here\n    return True\n',
        javascript: 'function isPalindrome(s) {\n    // Write your solution here\n    return true;\n}\n',
      },
      testCases: [
        { type: 'SAMPLE', input: 's = "A man, a plan, a canal: Panama"', expectedOutput: 'true' },
        { type: 'SAMPLE', input: 's = "race a car"', expectedOutput: 'false' },
        { type: 'HIDDEN', input: 's = " "', expectedOutput: 'true' },
      ],
      hints: ['Use two pointers moving from both ends inward while skipping non-alphanumeric characters.'],
    },

    // ==========================================
    // TECHNICAL CS FUNDAMENTALS & SYSTEM DESIGN
    // ==========================================
    {
      title: 'Database Indexing Under the Hood',
      category: InterviewType.TECHNICAL,
      topic: 'DBMS: Indexing & Performance',
      difficulty: 'Medium',
      promptText: 'Explain how a B-Tree index improves query speed in a relational database like PostgreSQL. What are the trade-offs of having too many indexes on a table?',
      sampleAnswer: 'A B-Tree keeps data sorted in balanced hierarchical nodes, reducing search complexity from O(N) full table scans to O(log N). The trade-offs include increased storage overhead and write amplification, as every INSERT, UPDATE, or DELETE must also synchronously update corresponding B-Tree nodes.',
      hints: ['Think about both read operations and write/mutation operations.'],
    },
    {
      title: 'Difference Between Process and Thread',
      category: InterviewType.TECHNICAL,
      topic: 'Operating Systems: Concurrency',
      difficulty: 'Easy',
      promptText: 'What is the fundamental difference between a Process and a Thread? How do they share or isolate memory, and how does context switching compare between them?',
      sampleAnswer: 'A process is an independent execution unit with its own dedicated virtual address space and file descriptors. A thread is a lightweight execution flow within a process that shares the heap and memory space with other threads in the same process, but maintains its own program counter and stack.',
      hints: ['Address memory isolation, IPC vs shared memory, and context switching overhead.'],
    },
    {
      title: 'PostgreSQL MVCC & ACID Compliance',
      category: InterviewType.TECHNICAL,
      topic: 'DBMS: Transactions & Concurrency',
      difficulty: 'Hard',
      promptText: 'How does PostgreSQL achieve ACID transaction isolation without locking readers? Explain Multi-Version Concurrency Control (MVCC) and Write-Ahead Logging (WAL).',
      sampleAnswer: 'Postgres uses MVCC by maintaining multiple versions of row tuples with xmin and xmax transaction IDs. Readers never block writers and writers never block readers. WAL guarantees durability by writing transaction delta records sequentially to disk before flushing changes to data files.',
      hints: ['Mention transaction snapshots, xmin/xmax tuple headers, and crash recovery.'],
    },
    {
      title: 'TCP 3-Way Handshake vs UDP',
      category: InterviewType.TECHNICAL,
      topic: 'Networks: Transport Protocols',
      difficulty: 'Medium',
      promptText: 'Explain the sequence of packets in a TCP 3-way handshake (SYN, SYN-ACK, ACK). When would an engineering team choose UDP over TCP?',
      sampleAnswer: 'Client sends SYN, server responds with SYN-ACK, and client completes connection with ACK. UDP is preferred in latency-critical applications like live video streaming or gaming where packet loss is preferable to head-of-line blocking retransmission delays.',
      hints: ['Explain sequence numbers, connection state, and reliability vs throughput.'],
    },
    {
      title: 'System Design: Scaling to 1 Million Users',
      category: InterviewType.TECHNICAL,
      topic: 'System Design: Scalability',
      difficulty: 'Hard',
      promptText: 'Design a high-level architecture for a web application expected to grow from 1,000 to 1,000,000 daily active users. What bottlenecks arise and how do you address them?',
      sampleAnswer: '1. Introduce a load balancer (Nginx/ALB) and stateless application servers. 2. Implement a caching layer (Redis) for hot read queries. 3. Configure database read replicas and eventually shard horizontally. 4. Offload asynchronous tasks (emails, notifications) to message queues (RabbitMQ/Kafka). 5. Serve static assets via CDN.',
      hints: ['Start with monolithic database bottleneck, then cache, queues, read replicas, and CDN.'],
    },

    // ==========================================
    // HR BEHAVIORAL & STAR QUESTIONS
    // ==========================================
    {
      title: 'Facing a Significant Technical Obstacle',
      category: InterviewType.HR,
      topic: 'HR: Conflict & Obstacles',
      difficulty: 'Medium',
      promptText: 'Describe a situation in a past project or academic endeavor where you encountered a major unexpected obstacle. What was the situation, what action did you personally take to overcome it, and what was the outcome?',
      sampleAnswer: 'In my capstone project, our auth API changed contracts two weeks before launch. As backend lead, I wrote an adapter wrapper within 48 hours to translate payloads, preserving backwards compatibility and delivering on time.',
      hints: ['Focus on your specific actions rather than just complaining about the problem. Conclude with measurable results.'],
    },
    {
      title: 'Handling Technical Disagreements in a Team',
      category: InterviewType.HR,
      topic: 'HR: Teamwork & Communication',
      difficulty: 'Medium',
      promptText: 'Have you ever had a disagreement with a team member or mentor regarding a technical decision? How did you resolve it constructively?',
      sampleAnswer: 'During a hackathon, a teammate wanted MongoDB for graph-like recommendations, while I advocated for Postgres joins. I benchmarked query latency on sample data within 30 minutes, showing 4x faster results in Postgres, which convinced the team empirically.',
      hints: ['Highlight objective criteria (benchmarks, user experience) rather than personal ego.'],
    },
    {
      title: 'Learning from a Past Failure or Critical Bug',
      category: InterviewType.HR,
      topic: 'HR: Accountability & Learning',
      difficulty: 'Medium',
      promptText: 'Tell me about a time when a software bug you wrote made it past testing or caused a failure. How did you handle the situation and what did you learn?',
      sampleAnswer: 'I deployed a database migration that lacked a default value for a new non-null column, failing in staging. I immediately rolled back, wrote unit tests for migration scripts, and documented a migration checklist for our team.',
      hints: ['Acknowledge accountability without deflecting blame, and explain the preventative system you established.'],
    },
    {
      title: 'Delivering Under Tight Deadlines & Ambiguity',
      category: InterviewType.HR,
      topic: 'HR: Time Management & Prioritization',
      difficulty: 'Medium',
      promptText: 'Describe a project where requirements were ambiguous and the deadline was tight. How did you prioritize deliverables to ensure successful completion?',
      sampleAnswer: 'During our college semester project, client requirements changed 5 days before submission. I broke down deliverables into Must-Have (P0), Should-Have (P1), and Nice-to-Have (P2), focusing 100% of team effort on core user workflows.',
      hints: ['Explain your prioritization framework (e.g. MoSCoW, impact vs effort).'],
    },
  ];

  for (const item of questionBankItems) {
    const existing = await prisma.questionBankItem.findFirst({
      where: { title: item.title },
    });
    if (existing) {
      await prisma.questionBankItem.update({
        where: { id: existing.id },
        data: item,
      });
    } else {
      await prisma.questionBankItem.create({
        data: item,
      });
    }
  }
  console.log(`✅ Upserted ${questionBankItems.length} verified placement questions`);

  // 3. Demo Candidate Account Setup
  const demoEmail = 'candidate@interviewpilot.ai';
  const existingDemo = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!existingDemo) {
    const passwordHash = await bcrypt.hash('DemoPass123!', 10);
    const demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash,
        isVerified: true,
      },
    });

    await prisma.profile.create({
      data: {
        userId: demoUser.id,
        fullName: 'Alex Vance',
        education: 'University Institute of Technology',
        degree: 'B.Tech in Computer Science & Engineering',
        graduationYear: 2025,
        targetRole: 'Full Stack Engineer',
        experienceLevel: 'Fresher',
        programmingLanguages: ['Python', 'JavaScript', 'TypeScript', 'C++', 'SQL'],
        technicalSkills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'Git', 'DSA'],
        careerGoals: 'Crack tier-1 product software engineering placement interviews.',
        dailyStudyMinutes: 90,
      },
    });

    await prisma.userConsent.create({
      data: {
        userId: demoUser.id,
        audioConsent: true,
        termsAccepted: true,
        privacyAccepted: true,
      },
    });

    console.log(`✅ Seeded Demo candidate: ${demoEmail}`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
