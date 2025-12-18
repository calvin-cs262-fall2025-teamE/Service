import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { uploadImagesToAzure } from '../utils/imageUpload';

const router = Router();

/**
 * Transforms a Prisma Post object to match frontend expectations.
 * Ensures backward compatibility and correct field types.
 */
function transformPostResponse(post: any) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    authorId: post.authorId.toString(), // Frontend expects string
    timePosted: post.createdAt, // Frontend expects timePosted, not createdAt
    upvotes: post.upvotes,
    communityId: post.communityId,
    type: post.type,
    comments: post.replies || [], // Frontend expects comments array (always present)
    images: post.images?.map((img: any) => img.imageUrl) || [], // Include images if they exist
  };
}

router.get('/', async (_req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        images: true, // Include images
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts.map(transformPostResponse));
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
  images: z.array(z.string()).optional(), // Optional array of base64-encoded images
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    // Upload images to Azure Blob Storage if provided
    let imageUrls: string[] = [];
    if (parsed.data.images && parsed.data.images.length > 0) {
      try {
        imageUrls = await uploadImagesToAzure(parsed.data.images);
      } catch (uploadError) {
        return res.status(500).json({ 
          error: 'Failed to upload images', 
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error' 
        });
      }
    }
    
    // Create post and images in a transaction
    const { images: _, ...postData } = parsed.data;
    const newPost = await prisma.post.create({
      data: {
        ...postData,
        images: imageUrls.length > 0 ? {
          create: imageUrls.map(url => ({ imageUrl: url })),
        } : undefined,
      },
      include: {
        images: true,
      },
    });
    
    // Transform response to match frontend expectations
    res.status(201).json({
      id: newPost.id,
      title: newPost.title,
      content: newPost.content,
      authorId: newPost.authorId.toString(), // Convert to string for frontend
      timePosted: newPost.createdAt,
      upvotes: newPost.upvotes,
      communityId: newPost.communityId,
      type: newPost.type,
      comments: [], // Frontend expects comments array (always present)
      images: newPost.images.map(img => img.imageUrl), // Include image URLs
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
        images: true, // Include images
      },
    });
    if (!post) return res.status(404).json({ error: 'Not found' });
    
    // Transform response with replies included
    const response = transformPostResponse(post);
    res.json(response);
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
