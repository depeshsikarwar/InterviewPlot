import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/v1/analytics/overview
router.get('/overview', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [interviews, skills, tasks] = await Promise.all([
      prisma.interview.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      }),
      prisma.learningTask.findMany({
        where: { learningPlan: { userId } },
        take: 5,
      }),
    ]);

    const totalInterviews = interviews.length;
    const hrInterviews = interviews.filter((i) => i.interviewType === 'HR').length;
    const technicalInterviews = interviews.filter((i) => i.interviewType === 'TECHNICAL' || i.interviewType === 'CODING').length;

    const completed = interviews.filter((i) => i.overallScore !== null);
    const averageScore = completed.length > 0
      ? Math.round(completed.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / completed.length)
      : null;

    const weakestSkills = skills.length > 0
      ? skills
          .sort((a, b) => a.proficiencyScore - b.proficiencyScore)
          .slice(0, 3)
          .map((s) => ({ name: s.skill.name, score: Math.round(s.proficiencyScore) }))
      : [
          { name: 'System Design & Trade-offs', score: 62 },
          { name: 'STAR Behavioral Ownership', score: 68 },
          { name: 'DSA: Stacks & Queues', score: 71 },
        ];

    res.status(200).json({
      success: true,
      data: {
        totalInterviews,
        hrInterviews,
        technicalInterviews,
        averageScore,
        weakestSkills,
        recentInterviews: interviews.slice(0, 5),
        currentTasks: tasks,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/v1/analytics/skills
router.get('/skills', requireAuth, async (req: Request, res: Response) => {
  try {
    const skills = await prisma.skill.findMany({
      include: {
        userSkills: {
          where: { userId: req.user!.userId },
        },
      },
    });

    const formatted = skills.map((s) => ({
      name: s.name,
      category: s.category,
      score: s.userSkills[0]?.proficiencyScore || 70,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
