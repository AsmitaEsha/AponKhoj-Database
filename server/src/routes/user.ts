import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';
import { hashPassword, comparePassword } from '../utils/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { CloudinaryService } from '../services/cloudinaryService.js';
import { validateName, validatePhone, validateLocation, validatePassword, getPasswordValidationError } from '../utils/validators.js';

const router = Router();
const cloudinaryService = new CloudinaryService();

const profileAvatarUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadMiddleware.single('avatar')(req as any, res as any, (error: any) => {
    if (error) {
      return res.status(400).json({ error: error.message || 'Invalid image upload request' });
    }
    next();
  });
};

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
        district: true,
        location: true,
        avatarUrl: true,
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
router.put('/profile/me', requireAuth, profileAvatarUpload, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, district } = req.body;
    const userId = req.user!.userId;

    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, cloudinaryPublicId: true }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const trimmedFirstName = typeof firstName === 'string' ? firstName.trim() : undefined;
    const trimmedLastName = typeof lastName === 'string' ? lastName.trim() : undefined;
    const trimmedDistrict = typeof district === 'string' ? district.trim() : undefined;
    const normalizedPhone = typeof phone === 'string' ? phone.replace(/\s+/g, '') : undefined;

    if (trimmedFirstName !== undefined && !validateName(trimmedFirstName)) {
      return res.status(400).json({ error: 'Invalid first name' });
    }

    if (trimmedLastName !== undefined && !validateName(trimmedLastName)) {
      return res.status(400).json({ error: 'Invalid last name' });
    }

    if (normalizedPhone !== undefined && !validatePhone(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number. Use 01XXXXXXXXX format.' });
    }

    if (trimmedDistrict !== undefined && !validateLocation(trimmedDistrict)) {
      return res.status(400).json({ error: 'Invalid district' });
    }

    if (normalizedPhone && normalizedPhone !== currentUser.phone) {
      const existingPhone = await db.user.findUnique({
        where: { phone: normalizedPhone },
        select: { id: true }
      });

      if (existingPhone) {
        return res.status(409).json({ error: 'This phone number is already in use' });
      }
    }

    let avatarUrl = undefined as string | undefined;
    let cloudinaryPublicId = undefined as string | undefined;

    if (req.file) {
      const uploaded = await cloudinaryService.uploadImage(req.file, 'aponkhoj/profile');
      if (!uploaded.success || !uploaded.url || !uploaded.publicId) {
        return res.status(400).json({ error: uploaded.message || 'Avatar upload failed' });
      }

      avatarUrl = uploaded.url;
      cloudinaryPublicId = uploaded.publicId;

      if (currentUser.cloudinaryPublicId) {
        await cloudinaryService.deleteImage(currentUser.cloudinaryPublicId);
      }
    }

    const dataToUpdate = {
      ...(trimmedFirstName !== undefined && { firstName: trimmedFirstName }),
      ...(trimmedLastName !== undefined && { lastName: trimmedLastName }),
      ...(normalizedPhone !== undefined && { phone: normalizedPhone }),
      ...(trimmedDistrict !== undefined && {
        district: trimmedDistrict,
        location: trimmedDistrict,
      }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(cloudinaryPublicId !== undefined && { cloudinaryPublicId }),
    };

    const user = await db.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        district: true,
        location: true,
        avatarUrl: true,
        role: true,
      }
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

    const currentPasswordValue = typeof currentPassword === 'string' ? currentPassword : '';
    const newPasswordValue = typeof newPassword === 'string' ? newPassword : '';

    if (!currentPasswordValue || !newPasswordValue) {
      return res.status(400).json({ error: 'Both current and new passwords are required' });
    }

    if (currentPasswordValue === newPasswordValue) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    if (!validatePassword(newPasswordValue)) {
      const passwordError = getPasswordValidationError(newPasswordValue) || 'Password is too weak';
      return res.status(400).json({ error: passwordError });
    }

    const user = await db.user.findUnique({
      where: { id: req.user!.userId }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await comparePassword(currentPasswordValue, user.password);
    if (!isValid) return res.status(400).json({ error: 'Incorrect current password' });

    const hashedPassword = await hashPassword(newPasswordValue);

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