import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Routes
import authRoutes from './routes/auth';
import communityRoutes from './routes/communities';
import postRoutes from './routes/posts';
import searchRoutes from './routes/search';
import { errorHandler } from './middleware/errorHandler';

app.use('/auth', authRoutes);
app.use('/communities', communityRoutes);
app.use('/posts', postRoutes);
app.use('/search', searchRoutes);

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Error handler
app.use(errorHandler);

export default app;
