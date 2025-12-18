import { Router } from 'express';
import prisma from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const communities = await prisma.community.findMany({
      select: {
        id: true,
        communityName: true,
        description: true,
        bannerImage: true,
        createdAt: true,
      },
    });
    res.json(communities);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid community ID' });
    
    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        _count: {
          select: { memberships: true },
        },
      },
    });
    if (!community) return res.status(404).json({ error: 'Community not found' });
    res.json({
      id: community.id,
      communityName: community.communityName,
      description: community.description,
      bannerImage: community.bannerImage,
      createdAt: community.createdAt,
      memberCount: community._count.memberships,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/posts', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid community ID' });
    
    const posts = await prisma.post.findMany({
      where: { communityId: id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        images: true, // Include images
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Transform responses to match frontend expectations
    res.json(posts.map(p => ({
      id: p.id,
      title: p.title,
      content: p.content,
      type: p.type,
      authorId: p.authorId.toString(), // Frontend expects string
      communityId: p.communityId,
      upvotes: p.upvotes,
      timePosted: p.createdAt, // Frontend expects timePosted
      comments: [], // Frontend expects comments array (always present)
      images: p.images?.map(img => img.imageUrl) || [], // Include images if they exist
    })));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/join', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const communityId = Number(req.params.id);
    if (isNaN(communityId)) return res.status(400).json({ error: 'Invalid community ID' });
    
    const userId = req.userId!;
    
    const existing = await prisma.membership.findUnique({
      where: { userId_communityId: { userId, communityId } },
    });
    
    if (existing) return res.json({ status: 'already_joined' });
    
    await prisma.membership.create({
      data: { userId, communityId, role: 'member' },
    });
    
    res.json({ status: 'joined' });
  } catch (err) {
    next(err);
  }
});

router.get('/search/query', async (req, res, next) => {
  try {
    const q = String(req.query.query || '').toLowerCase();
    const communities = await prisma.community.findMany({
      where: {
        communityName: {
          contains: q,
          mode: 'insensitive',
        },
      },
    });
    res.json(communities);
  } catch (err) {
    next(err);
  }
});

export default router;
