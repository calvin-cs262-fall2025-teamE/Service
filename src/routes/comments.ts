import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

// Get all replies (comments)
router.get('/', async (_req, res, next) => {
  try {
    const replies = await prisma.reply.findMany({
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        post: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(replies);
  } catch (err: any) {
    next(err);
  }
});

// Get reply by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid reply ID' });
    
    const reply = await prisma.reply.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        post: {
          select: { id: true, title: true },
        },
      },
    });
    
    if (!reply) return res.status(404).json({ error: 'Reply not found' });
    res.json(reply);
  } catch (err: any) {
    next(err);
  }
});

export default router;
