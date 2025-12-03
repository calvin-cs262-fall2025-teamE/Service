import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  const q = String(req.query.query || '').toLowerCase();
  const communities = [
    { id: '1', name: 'Gaming Community', members: 1200 },
    { id: '2', name: 'Book Club', members: 500 },
    { id: '3', name: 'Tech Hub', members: 2500 },
  ].filter(c => c.name.toLowerCase().includes(q));

  const posts = [
    { id: '1', title: 'Latest Gaming News', community: 'Gaming Community', tag: 'news' },
    { id: '2', title: 'Book of the Month', community: 'Book Club', tag: 'discussion' },
    { id: '3', title: 'Tech Trends 2025', community: 'Tech Hub', tag: 'technology' },
  ].filter(p => p.title.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q) || p.community.toLowerCase().includes(q));

  res.json({ communities, posts });
});

export default router;
