import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';
import { requireAuth } from '../../middleware/auth.middleware';
import { aiService } from '../../services/ai/ai.service';
import multer from 'multer';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

// POST /api/v1/resumes - Upload and analyze resume
router.post('/', requireAuth, upload.single('resume'), async (req: Request, res: Response) => {
  try {
    const rawText = req.body.resumeText || (req.file ? req.file.buffer.toString('utf-8') : '');

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please provide resume text or upload a valid file.' },
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
    });

    const analysis = await aiService.analyzeResume(rawText, profile?.targetRole || 'Software Engineer');

    const resume = await prisma.resume.create({
      data: {
        userId: req.user!.userId,
        fileName: req.file?.originalname || 'Resume.pdf',
        fileUrl: '/uploads/resumes/mock.pdf',
        fileSize: req.file?.size || rawText.length,
        mimeType: req.file?.mimetype || 'text/plain',
        parsedText: rawText,
        extractedSkills: analysis.extractedSkills,
        experienceHighlights: analysis.experienceHighlights,
        missingDetails: analysis.missingDetails,
        recommendations: {
          strengths: analysis.strengths,
          recommendations: analysis.recommendations,
          suggestedQuestions: analysis.suggestedQuestions,
          matchScore: analysis.matchScore,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        resume,
        analysis,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

// GET /api/v1/resumes - List resumes
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: resumes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
