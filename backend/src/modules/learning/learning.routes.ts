import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';
import { requireAuth } from '../../middleware/auth.middleware';
import { TaskStatus, TaskPriority } from '@prisma/client';

const router = Router();

// GET /api/v1/learning-plan
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    let plan = await prisma.learningPlan.findFirst({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
          include: { skill: true },
        },
      },
    });

    // If no plan exists, generate one automatically
    if (!plan) {
      const now = new Date();
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      plan = await prisma.learningPlan.create({
        data: {
          userId: req.user!.userId,
          targetRole: 'Software Engineer',
          weekStartDate: now,
          weekEndDate: weekEnd,
          summary: 'Foundation Placement Sprint: Close high-frequency algorithmic gaps and draft core STAR stories.',
          tasks: {
            create: [
              {
                title: 'Review B-Tree vs Hash Index Storage & Write Latency in PostgreSQL',
                explanation: 'Understand disk I/O, node splits, and how composite indexes work under high write loads.',
                estimatedMinutes: 45,
                priority: TaskPriority.HIGH,
                successCriteria: 'Explain index write penalties clearly in technical interviews.',
                status: TaskStatus.IN_PROGRESS,
              },
              {
                title: 'Solve 3 Array Two-Pointer & Hash Map Challenges in Python/JS',
                explanation: 'Practice Two Sum, 3Sum, and Container With Most Water with clean O(N) complexity.',
                estimatedMinutes: 60,
                priority: TaskPriority.HIGH,
                successCriteria: 'Write working solutions passing both sample and hidden edge cases without hints.',
                status: TaskStatus.PENDING,
              },
              {
                title: 'Structure 3 Behavioral Stories Using the STAR Methodology',
                explanation: 'Formulate stories for a technical conflict, a tight deadline, and a production bug with metrics.',
                estimatedMinutes: 35,
                priority: TaskPriority.MEDIUM,
                successCriteria: 'Deliver each story in under 2 minutes with quantifiable outcomes.',
                status: TaskStatus.PENDING,
              },
            ],
          },
        },
        include: {
          tasks: {
            include: { skill: true },
          },
        },
      });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// POST /api/v1/learning-plan/generate
router.post('/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
    });

    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const plan = await prisma.learningPlan.create({
      data: {
        userId: req.user!.userId,
        targetRole: profile?.targetRole || 'Software Engineer',
        weekStartDate: now,
        weekEndDate: weekEnd,
        summary: `Targeted weekly roadmap for ${profile?.targetRole || 'Software Engineer'} placement prep.`,
        tasks: {
          create: [
            {
              title: `Master ${profile?.programmingLanguages[0] || 'Python'} Memory Management & Concurrency`,
              explanation: 'Deep-dive into event loops, GIL, or thread scheduling to answer technical screening questions.',
              estimatedMinutes: profile?.dailyStudyMinutes || 60,
              priority: TaskPriority.HIGH,
              successCriteria: 'Confidently explain thread safety and memory leaks.',
              status: TaskStatus.PENDING,
            },
            {
              title: 'Complete 2 Simulated Mock Interviews on InterviewPilot',
              explanation: 'Take one HR behavioral mock and one Monaco coding challenge to assess progress.',
              estimatedMinutes: 45,
              priority: TaskPriority.HIGH,
              successCriteria: 'Achieve an overall score above 80% on both sessions.',
              status: TaskStatus.PENDING,
            },
          ],
        },
      },
      include: {
        tasks: true,
      },
    });

    res.status(201).json({ success: true, data: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PATCH /api/v1/learning-tasks/:id
router.patch('/tasks/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const task = await prisma.learningTask.update({
      where: { id: req.params.id },
      data: {
        status: status as TaskStatus,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    res.status(200).json({ success: true, data: task });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
