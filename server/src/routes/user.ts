import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';
import { hashPassword, comparePassword } from '../utils/auth.js';

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

// PUT update current user profile
router.put('/profile/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, location } = req.body;
    
    // Disallow email/role updates here for security
    const user = await db.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(location && { location }),
      },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, location: true, role: true }
    });

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT change password
router.put('/profile/password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required' });
    }

    const user = await db.user.findUnique({
      where: { id: req.user!.userId }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) return res.status(400).json({ error: 'Incorrect current password' });

    const hashedPassword = await hashPassword(newPassword);

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;