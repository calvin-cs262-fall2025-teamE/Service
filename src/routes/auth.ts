import { Router } from 'express';
import { z } from 'zod';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../config/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { uploadImageToAzure } from '../utils/imageUpload';

const router = Router();

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const { firstName, lastName, email, password, phone } = parsed.data;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, passwordHash, phone },
    });
    
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.status(201).json({ 
      user: { 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email, 
        phone: user.phone,
        profileImage: user.profileImage,
      }, 
      token 
    });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    res.json({ 
      user: { 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
      }, 
      token 
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ 
      user: { 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
      } 
    });
  } catch (err) {
    next(err);
  }
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

router.put('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: parsed.data,
    });
    
    res.json({ 
      user: { 
        id: updated.id, 
        firstName: updated.firstName, 
        lastName: updated.lastName, 
        email: updated.email,
        phone: updated.phone,
        profileImage: updated.profileImage,
      } 
    });
  } catch (err) {
    next(err);
  }
});

const photoSchema = z.object({
  image: z.string(), // base64 or URL
});

router.put('/photo', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const parsed = photoSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const imageUrl = await uploadImageToAzure(parsed.data.image);
    
    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { profileImage: imageUrl },
    });
    
    res.json({ url: updated.profileImage });
  } catch (err) {
    next(err);
  }
});

export default router;
