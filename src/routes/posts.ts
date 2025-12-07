import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts.map(p => ({
      id: p.id,
      title: p.title,
      content: p.content,
      authorId: p.authorId,
      timePosted: p.createdAt,
      upvotes: p.upvotes,
      communityId: p.communityId,
      type: p.type,
    })));
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  type: z.enum(['question', 'advice']),
  title: z.string().min(1),
  content: z.string().min(1),
  authorId: z.number().int(),
  communityId: z.number().int(),
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const newPost = await prisma.post.create({
      data: parsed.data,
    });
    
    res.status(201).json({
      id: newPost.id,
      title: newPost.title,
      content: newPost.content,
      authorId: newPost.authorId,
      timePosted: newPost.createdAt,
      upvotes: newPost.upvotes,
      communityId: newPost.communityId,
      type: newPost.type,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid post ID' });
    
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        replies: {
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json({
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      timePosted: post.createdAt,
      upvotes: post.upvotes,
      communityId: post.communityId,
      type: post.type,
      replies: post.replies,
    });
  } catch (err) {
    next(err);
  }
});

const replySchema = z.object({
  content: z.string().min(1),
  authorId: z.number().int(),
});

router.post('/:id/reply', async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    if (isNaN(postId)) return res.status(400).json({ error: 'Invalid post ID' });
    
    const parsed = replySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const reply = await prisma.reply.create({
      data: {
        content: parsed.data.content,
        authorId: parsed.data.authorId,
        postId,
      },
    });
    
    res.status(201).json({ status: 'reply recorded', reply });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/upvote', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid post ID' });
    
    const post = await prisma.post.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
    });
    res.json({ upvotes: post.upvotes });
  } catch (err) {
    next(err);
  }
});

export default router;
// Legacy pg routes removed in favor of typed handlers above
