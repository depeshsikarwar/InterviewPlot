import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';
import { requireAuth } from '../../middleware/auth.middleware';
import { aiService } from '../../services/ai/ai.service';
import { InterviewType, InterviewStatus } from '@prisma/client';

const router = Router();

// Create new interview session
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, interviewType, mode, difficulty, targetRole, durationMinutes } = req.body;

    const interview = await prisma.interview.create({
      data: {
        userId: req.user!.userId,
        title: title || `${interviewType || 'HR'} Mock Session`,
        interviewType: (interviewType as InterviewType) || InterviewType.HR,
        mode: mode || 'TEXT',
        difficulty: difficulty || 'Medium',
        targetRole: targetRole || 'Software Engineer',
        durationMinutes: durationMinutes || 30,
        status: InterviewStatus.PENDING,
      },
    });

    res.status(201).json({ success: true, data: interview });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// List user interviews
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const interviews = await prisma.interview.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        evaluation: true,
        _count: { select: { questions: true } },
      },
    });

    res.status(200).json({ success: true, data: interviews });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// Get single interview
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { answer: true, codeSubmissions: true },
        },
        evaluation: true,
      },
    });

    if (!interview || interview.userId !== req.user!.userId) {
      return res.status(404).json({ success: false, error: { message: 'Interview not found' } });
    }

    res.status(200).json({ success: true, data: interview });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// Start interview session: generates first question
router.post('/:id/start', requireAuth, async (req: Request, res: Response) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: req.params.id },
      include: { questions: true },
    });

    if (!interview || interview.userId !== req.user!.userId) {
      return res.status(404).json({ success: false, error: { message: 'Interview not found' } });
    }

    await prisma.interview.update({
      where: { id: interview.id },
      data: {
        status: InterviewStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    // Check if initial question already created
    if (interview.questions.length === 0) {
      const q = await aiService.generateNextQuestion({
        targetRole: interview.targetRole,
        difficulty: interview.difficulty,
        conversationHistory: [],
      });

      const question = await prisma.interviewQuestion.create({
        data: {
          interviewId: interview.id,
          orderIndex: 0,
          questionText: q.questionText,
          category: q.category,
          difficulty: interview.difficulty,
          isFollowUp: false,
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          interview: { ...interview, status: InterviewStatus.IN_PROGRESS },
          currentQuestion: question,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        interview,
        currentQuestion: interview.questions[0],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// Submit answer and receive next question or follow-up
router.post('/:id/answers', requireAuth, async (req: Request, res: Response) => {
  try {
    const { questionId, answerText, speechDurationSeconds } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { answer: true },
        },
      },
    });

    if (!interview || interview.userId !== req.user!.userId) {
      return res.status(404).json({ success: false, error: { message: 'Interview not found' } });
    }

    // Save answer
    const savedAnswer = await prisma.answer.create({
      data: {
        interviewQuestionId: questionId,
        userId: req.user!.userId,
        answerText,
        speechDurationSeconds: speechDurationSeconds || null,
      },
    });

    // Construct conversation history
    const history: { role: 'interviewer' | 'candidate'; text: string }[] = [];
    for (const q of interview.questions) {
      history.push({ role: 'interviewer', text: q.questionText });
      if (q.id === questionId) {
        history.push({ role: 'candidate', text: answerText });
      } else if (q.answer) {
        history.push({ role: 'candidate', text: q.answer.answerText });
      }
    }

    // Check if interview limit reached (e.g. 5 questions)
    if (interview.questions.length >= 5) {
      return res.status(200).json({
        success: true,
        data: {
          answer: savedAnswer,
          isComplete: true,
        },
      });
    }

    // Generate next question
    const nextQ = await aiService.generateNextQuestion({
      targetRole: interview.targetRole,
      difficulty: interview.difficulty,
      conversationHistory: history,
    });

    const createdQuestion = await prisma.interviewQuestion.create({
      data: {
        interviewId: interview.id,
        orderIndex: interview.questions.length,
        questionText: nextQ.questionText,
        category: nextQ.category,
        difficulty: interview.difficulty,
        isFollowUp: nextQ.isFollowUp,
        parentQuestionId: nextQ.isFollowUp ? questionId : null,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        answer: savedAnswer,
        nextQuestion: createdQuestion,
        isComplete: false,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// Finish interview & generate evaluation report
router.post('/:id/finish', requireAuth, async (req: Request, res: Response) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          include: { answer: true },
        },
        evaluation: true,
      },
    });

    if (!interview || interview.userId !== req.user!.userId) {
      return res.status(404).json({ success: false, error: { message: 'Interview not found' } });
    }

    if (interview.evaluation) {
      return res.status(200).json({ success: true, data: interview.evaluation });
    }

    // Aggregate answers for evaluation
    const answered = interview.questions.filter((q) => q.answer);
    const combinedAnswers = answered.map((q) => q.answer!.answerText).join('\n\n');

    const evalResult = await aiService.evaluateHRAnswer(
      interview.questions[0]?.questionText || 'General interview',
      combinedAnswers || 'Candidate participated in mock interview.',
      interview.targetRole
    );

    // Save evaluation
    const evaluation = await prisma.evaluation.create({
      data: {
        interviewId: interview.id,
        overallScore: evalResult.overallScore,
        relevanceScore: evalResult.relevanceScore,
        structureScore: evalResult.structureScore,
        specificityScore: evalResult.specificityScore,
        ownershipScore: evalResult.ownershipScore,
        resultsScore: evalResult.resultsScore,
        strengths: evalResult.strengths,
        weaknesses: evalResult.weaknesses,
        evidenceQuotes: evalResult.evidenceQuotes,
        modelAnswerExample: evalResult.modelAnswerExample,
        revisionTopics: evalResult.revisionTopics,
        recommendedTasks: evalResult.recommendedTasks as any,
      },
    });

    await prisma.interview.update({
      where: { id: interview.id },
      data: {
        status: InterviewStatus.COMPLETED,
        completedAt: new Date(),
        overallScore: evalResult.overallScore,
        rubricScores: {
          relevance: evalResult.relevanceScore,
          structure: evalResult.structureScore,
          specificity: evalResult.specificityScore,
          ownership: evalResult.ownershipScore,
          results: evalResult.resultsScore,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// Get interview report
router.get('/:id/report', requireAuth, async (req: Request, res: Response) => {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          include: { answer: true },
        },
        evaluation: true,
      },
    });

    if (!interview || interview.userId !== req.user!.userId) {
      return res.status(404).json({ success: false, error: { message: 'Interview not found' } });
    }

    res.status(200).json({
      success: true,
      data: {
        interview,
        evaluation: interview.evaluation,
        questions: interview.questions,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
