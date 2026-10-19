import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';
import { aiService } from '../../services/ai/ai.service';
import { optionalAuth, requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/v1/question-bank/progress/summary - Summary readiness score & solved stats
router.get('/progress/summary', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const allQuestions = await prisma.questionBankItem.findMany({
      select: { id: true, difficulty: true, category: true },
    });

    const totalQuestions = allQuestions.length;
    let solvedCount = 0;
    let attemptedCount = 0;
    let bookmarkedCount = 0;

    const byDifficulty: Record<string, { total: number; solved: number }> = {
      Easy: { total: 0, solved: 0 },
      Medium: { total: 0, solved: 0 },
      Hard: { total: 0, solved: 0 },
    };

    allQuestions.forEach((q) => {
      const diff = q.difficulty || 'Medium';
      if (!byDifficulty[diff]) byDifficulty[diff] = { total: 0, solved: 0 };
      byDifficulty[diff].total++;
    });

    if (userId) {
      const userProgress = await prisma.userQuestionProgress.findMany({
        where: { userId },
      });

      const progressMap = new Map(userProgress.map((p) => [p.questionBankItemId, p]));

      allQuestions.forEach((q) => {
        const prog = progressMap.get(q.id);
        const diff = q.difficulty || 'Medium';
        if (prog) {
          if (prog.status === 'SOLVED') {
            solvedCount++;
            if (byDifficulty[diff]) byDifficulty[diff].solved++;
          } else if (prog.status === 'ATTEMPTED') {
            attemptedCount++;
          }
          if (prog.isBookmarked) {
            bookmarkedCount++;
          }
        }
      });
    }

    // Weighted readiness calculation: Easy * 1 + Med * 2 + Hard * 3
    const easyRatio = byDifficulty.Easy.total > 0 ? byDifficulty.Easy.solved / byDifficulty.Easy.total : 0;
    const medRatio = byDifficulty.Medium.total > 0 ? byDifficulty.Medium.solved / byDifficulty.Medium.total : 0;
    const hardRatio = byDifficulty.Hard.total > 0 ? byDifficulty.Hard.solved / byDifficulty.Hard.total : 0;

    const readinessScore = Math.round((easyRatio * 0.3 + medRatio * 0.5 + hardRatio * 0.2) * 100);

    res.status(200).json({
      success: true,
      data: {
        totalQuestions,
        solvedCount,
        attemptedCount,
        bookmarkedCount,
        byDifficulty,
        readinessScore,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/v1/question-bank - Fetch all questions categorized with user progress
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { category, difficulty, company, sheet, search } = req.query;

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (difficulty && difficulty !== 'ALL') where.difficulty = difficulty;
    if (company && company !== 'ALL') {
      where.companyTags = { has: String(company) };
    }
    if (sheet && sheet !== 'ALL') {
      where.sheetTags = { has: String(sheet) };
    }
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { topic: { contains: String(search), mode: 'insensitive' } },
        { promptText: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const items = await prisma.questionBankItem.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    const userId = req.user?.userId;
    let progressMap = new Map<string, any>();

    if (userId) {
      const userProgress = await prisma.userQuestionProgress.findMany({
        where: { userId },
      });
      progressMap = new Map(userProgress.map((p) => [p.questionBankItemId, p]));
    }

    const enrichedItems = items.map((item) => {
      const prog = progressMap.get(item.id);
      return {
        ...item,
        status: prog?.status || 'TODO',
        isBookmarked: prog?.isBookmarked || false,
        lastScore: prog?.lastScore ?? null,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedItems,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/v1/question-bank/mock-interviewer/hint - Interviewing.io style persona hints
router.post('/mock-interviewer/hint', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { persona = 'maya', question, currentCodeOrAnswer, attemptCount = 1 } = req.body;

    const hintData = await aiService.generateInterviewerHint({
      persona,
      question: question || 'Interview Problem',
      currentCodeOrAnswer,
      attemptCount,
    });

    res.status(200).json({
      success: true,
      data: hintData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/v1/question-bank/system-design/audit - Exponent style system design audit
router.post('/system-design/audit', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { prompt = 'System Architecture Design', components = [], traffic = {} } = req.body;

    const auditResult = await aiService.auditSystemDesign({
      prompt,
      components,
      traffic,
    });

    res.status(200).json({
      success: true,
      data: auditResult,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/v1/question-bank/:id - Fetch single question details
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const item = await prisma.questionBankItem.findUnique({
      where: { id: req.params.id },
    });

    if (!item) {
      return res.status(404).json({ success: false, error: { message: 'Question not found' } });
    }

    let status = 'TODO';
    let isBookmarked = false;
    let lastScore = null;

    if (req.user?.userId) {
      const prog = await prisma.userQuestionProgress.findUnique({
        where: {
          userId_questionBankItemId: {
            userId: req.user.userId,
            questionBankItemId: item.id,
          },
        },
      });
      if (prog) {
        status = prog.status;
        isBookmarked = prog.isBookmarked;
        lastScore = prog.lastScore;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...item,
        status,
        isBookmarked,
        lastScore,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/v1/question-bank/:id/progress - Toggle bookmark or mark status
router.post('/:id/progress', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const questionBankItemId = req.params.id;
    const { status, isBookmarked, notes } = req.body;

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'SOLVED') updateData.solvedAt = new Date();
    }
    if (isBookmarked !== undefined) updateData.isBookmarked = Boolean(isBookmarked);
    if (notes !== undefined) updateData.notes = String(notes);

    const progress = await prisma.userQuestionProgress.upsert({
      where: {
        userId_questionBankItemId: {
          userId,
          questionBankItemId,
        },
      },
      update: updateData,
      create: {
        userId,
        questionBankItemId,
        status: status || 'TODO',
        isBookmarked: isBookmarked !== undefined ? Boolean(isBookmarked) : false,
        notes: notes || null,
        solvedAt: status === 'SOLVED' ? new Date() : null,
      },
    });

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/v1/question-bank/:id/evaluate - Practice answer evaluation
router.post('/:id/evaluate', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { answer } = req.body;
    if (!answer || typeof answer !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'answer text is required.' },
      });
    }

    const item = await prisma.questionBankItem.findUnique({
      where: { id: req.params.id },
    });

    if (!item) {
      return res.status(404).json({ success: false, error: { message: 'Question not found' } });
    }

    let evaluation: any;

    if (item.category === 'HR') {
      evaluation = await aiService.evaluateHRAnswer(
        item.promptText,
        answer,
        'Software Engineer'
      );
    } else {
      // TECHNICAL or CODING conceptual answer
      evaluation = await aiService.evaluateTechnicalAnswer(
        item.promptText,
        answer,
        item.topic
      );
    }

    // If candidate passed with 70+, mark as SOLVED in user progress
    if (req.user?.userId) {
      const isSolved = evaluation.overallScore >= 70;
      await prisma.userQuestionProgress.upsert({
        where: {
          userId_questionBankItemId: {
            userId: req.user.userId,
            questionBankItemId: item.id,
          },
        },
        update: {
          status: isSolved ? 'SOLVED' : 'ATTEMPTED',
          lastScore: evaluation.overallScore,
          solvedAt: isSolved ? new Date() : undefined,
        },
        create: {
          userId: req.user.userId,
          questionBankItemId: item.id,
          status: isSolved ? 'SOLVED' : 'ATTEMPTED',
          lastScore: evaluation.overallScore,
          solvedAt: isSolved ? new Date() : null,
        },
      });
    }

    // Attach sample answer and optimal complexity for user learning comparison
    const result = {
      ...evaluation,
      sampleAnswer: item.sampleAnswer,
      hints: item.hints,
      optimalComplexity: item.optimalComplexity,
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
