import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/v1/account/export
router.get('/export', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [user, profile, interviews, submissions, resumes, plans] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true, isVerified: true, createdAt: true },
      }),
      prisma.profile.findUnique({ where: { userId } }),
      prisma.interview.findMany({
        where: { userId },
        include: {
          questions: { include: { answer: true } },
          evaluation: true,
        },
      }),
      prisma.codeSubmission.findMany({ where: { userId } }),
      prisma.resume.findMany({ where: { userId } }),
      prisma.learningPlan.findMany({
        where: { userId },
        include: { tasks: true },
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      profile,
      interviews,
      codeSubmissions: submissions,
      resumes,
      learningPlans: plans,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="interviewpilot_export_${userId}.json"`);
    res.status(200).send(JSON.stringify(exportData, null, 2));
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// DELETE /api/v1/account
router.delete('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Cascade delete user and all associated data
    await prisma.user.delete({
      where: { id: userId },
    });

    res.clearCookie('jwt');
    res.status(200).json({
      success: true,
      message: 'Account and all associated interview recordings/data permanently deleted.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
