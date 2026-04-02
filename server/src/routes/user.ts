import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';

const router = Router();

// GET all users (public)
router.get('/', async (req, res) => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        location: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET user by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        location: true,
        role: true,
        createdAt: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET current user profile (protected)
router.get('/profile/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        location: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;