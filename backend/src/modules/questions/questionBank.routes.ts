import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';

const router = Router();

// GET /api/v1/question-bank - Fetch all questions categorized
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, difficulty, search } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
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

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

export default router;
