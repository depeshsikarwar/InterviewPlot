import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';
import { requireAuth } from '../../middleware/auth.middleware';
import { aiService } from '../../services/ai/ai.service';

const router = Router();

// POST /api/v1/job-descriptions/analyze
router.post('/analyze', requireAuth, async (req: Request, res: Response) => {
  try {
    const { rawText, title, company } = req.body;

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please provide a valid job description text.' },
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
    });

    const userSkills = profile?.technicalSkills || ['JavaScript', 'Python', 'SQL'];
    const analysis = await aiService.matchJobDescription(rawText, userSkills);

    const jd = await prisma.jobDescription.create({
      data: {
        userId: req.user!.userId,
        title: title || analysis.title,
        company: company || 'Target Company',
        rawText,
        requiredSkills: analysis.requiredSkills,
        preferredSkills: analysis.preferredSkills,
        responsibilities: ['Architect scalable services', 'Write maintainable code', 'Collaborate across teams'],
        matchScore: analysis.matchScore,
        missingSkills: analysis.missingSkills,
        suggestedTopics: analysis.suggestedTopics,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        jobDescription: jd,
        analysis,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
