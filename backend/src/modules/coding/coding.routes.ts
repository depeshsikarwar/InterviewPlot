import { Router, Request, Response } from 'express';
import { codeSandbox, TestCase } from '../../services/codeExecution/sandbox';
import { prisma } from '../../prisma';
import { aiService } from '../../services/ai/ai.service';
import { optionalAuth, requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/v1/code/problems - Returns coding problems from verified question bank
router.get('/problems', optionalAuth, async (_req: Request, res: Response) => {
  try {
    const problems = await prisma.questionBankItem.findMany({
      where: { category: 'CODING' },
      select: {
        id: true,
        title: true,
        topic: true,
        difficulty: true,
        promptText: true,
        starterCode: true,
        hints: true,
        testCases: true,
        companyTags: true,
        sheetTags: true,
        optimalComplexity: true,
      },
    });

    res.status(200).json({
      success: true,
      data: problems,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/v1/code/run - Execute sample test cases or custom input
router.post('/run', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { language, sourceCode, problemId, customInput } = req.body;

    if (!language || !sourceCode) {
      return res.status(400).json({
        success: false,
        error: { message: 'language and sourceCode are required.' },
      });
    }

    let testCases: TestCase[] = [];

    if (customInput && typeof customInput === 'string' && customInput.trim().length > 0) {
      // Prioritize running user-provided custom test case (AlgoExpert style)
      testCases = [{
        type: 'SAMPLE',
        input: customInput.trim(),
        expectedOutput: '',
      }];
    } else if (problemId) {
      const problem = await prisma.questionBankItem.findUnique({
        where: { id: problemId },
      });

      if (problem && Array.isArray(problem.testCases)) {
        testCases = (problem.testCases as any[])
          .filter((tc: any) => tc.type !== 'HIDDEN')
          .map((tc: any) => ({
            type: 'SAMPLE',
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          }));
      }
    }

    const execution = await codeSandbox.runCode(language, sourceCode, testCases);

    res.status(200).json({
      success: true,
      data: execution,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/v1/code/submit - Authoritative run against ALL sample + hidden test cases
router.post('/submit', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { language, sourceCode, problemId, interviewQuestionId } = req.body;

    if (!language || !sourceCode) {
      return res.status(400).json({
        success: false,
        error: { message: 'language and sourceCode are required.' },
      });
    }

    let testCases: TestCase[] = [];

    if (problemId) {
      const problem = await prisma.questionBankItem.findUnique({
        where: { id: problemId },
      });

      if (problem && Array.isArray(problem.testCases)) {
        testCases = (problem.testCases as any[]).map((tc: any) => ({
          type: tc.type === 'HIDDEN' ? 'HIDDEN' : 'SAMPLE',
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        }));
      }
    }

    const execution = await codeSandbox.runCode(language, sourceCode, testCases);

    // If authenticated and tied to an interview question, persist submission
    if (req.user && interviewQuestionId) {
      await prisma.codeSubmission.create({
        data: {
          interviewQuestionId,
          userId: req.user.userId,
          language,
          sourceCode,
          status: execution.status,
          executionTimeMs: execution.executionTimeMs,
          sampleTestsPassed: execution.sampleTestsPassed,
          hiddenTestsPassed: execution.hiddenTestsPassed,
          totalTests: execution.totalTests,
          feedback: execution.status === 'ACCEPTED'
            ? 'All test cases passed. Excellent algorithmic implementation.'
            : `Failed on ${execution.totalTests - execution.passedTests} test cases. Review edge cases.`,
        },
      });
    }

    // LeetCode-style problem progress update for authenticated user
    if (req.user?.userId && problemId) {
      const isAccepted = execution.status === 'ACCEPTED';
      await prisma.userQuestionProgress.upsert({
        where: {
          userId_questionBankItemId: {
            userId: req.user.userId,
            questionBankItemId: problemId,
          },
        },
        update: {
          status: isAccepted ? 'SOLVED' : 'ATTEMPTED',
          lastScore: isAccepted ? 100 : Math.round((execution.passedTests / Math.max(1, execution.totalTests)) * 100),
          solvedAt: isAccepted ? new Date() : undefined,
        },
        create: {
          userId: req.user.userId,
          questionBankItemId: problemId,
          status: isAccepted ? 'SOLVED' : 'ATTEMPTED',
          lastScore: isAccepted ? 100 : Math.round((execution.passedTests / Math.max(1, execution.totalTests)) * 100),
          solvedAt: isAccepted ? new Date() : null,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: execution,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/v1/code/ai-review - AlgoExpert-style Time/Space complexity & code quality review
router.post('/ai-review', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { language = 'javascript', sourceCode, problemTitle, problemPrompt } = req.body;

    if (!sourceCode || typeof sourceCode !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'sourceCode is required.' },
      });
    }

    const review = await aiService.analyzeCodeQualityAndComplexity({
      code: sourceCode,
      language,
      problemTitle,
      problemPrompt,
    });

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
