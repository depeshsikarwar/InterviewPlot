import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/v1/profile
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
    });
    res.status(200).json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// PATCH /api/v1/profile
router.patch('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { fullName, targetRole, experienceLevel, dailyStudyMinutes, education, careerGoals, programmingLanguages, technicalSkills } = req.body;

    const updated = await prisma.profile.update({
      where: { userId: req.user!.userId },
      data: {
        ...(fullName ? { fullName } : {}),
        ...(targetRole ? { targetRole } : {}),
        ...(experienceLevel ? { experienceLevel } : {}),
        ...(dailyStudyMinutes ? { dailyStudyMinutes: Number(dailyStudyMinutes) } : {}),
        ...(education ? { education } : {}),
        ...(careerGoals ? { careerGoals } : {}),
        ...(programmingLanguages ? { programmingLanguages } : {}),
        ...(technicalSkills ? { technicalSkills } : {}),
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
