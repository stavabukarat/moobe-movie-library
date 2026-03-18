import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// All library routes require authentication
router.use(requireAuth);

// GET /library — fetch the authenticated user's saved items
router.get('/', async (req, res) => {
  const items = await prisma.watchedItem.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ items });
});

// POST /library — add a new item to the library
router.post('/', async (req, res) => {
  const { tmdbId, type, title, posterPath } = req.body;

  if (!tmdbId || !type || !title) {
    return res.status(400).json({ error: 'tmdbId, type, and title are required' });
  }
  if (type !== 'Movie' && type !== 'TV') {
    return res.status(400).json({ error: 'type must be "Movie" or "TV"' });
  }

  const existing = await prisma.watchedItem.findFirst({
    where: { userId: req.userId, tmdbId },
  });
  if (existing) {
    return res.status(409).json({ error: 'Item already in library' });
  }

  const item = await prisma.watchedItem.create({
    data: {
      userId: req.userId,
      tmdbId,
      type,
      title,
      posterPath: posterPath ?? null,
    },
  });
  res.status(201).json({ item });
});

// PATCH /library/:id — update isLiked or rating
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { isLiked, rating } = req.body;

  const item = await prisma.watchedItem.findUnique({ where: { id } });
  if (!item || item.userId !== req.userId) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
    return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
  }

  const updated = await prisma.watchedItem.update({
    where: { id },
    data: {
      ...(isLiked !== undefined && { isLiked }),
      ...(rating !== undefined && { rating }),
    },
  });
  res.json({ item: updated });
});

export default router;
