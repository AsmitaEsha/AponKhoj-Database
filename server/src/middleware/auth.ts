import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { validateEmail, validatePassword, validatePhone, validateName, validateLocation } from '../utils/validators.js';
import { isAdminCredential } from '../utils/adminConfig.js';

const router = Router();

// Admin emails that cannot be registered as regular users
const ADMIN_EMAILS = [
  'humayrabintekazal@gmail.com',
  'asmitaesha123@gmail.com',
  'jamilamuhammad18052000@gmail.com'
];

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, location, password, password_confirmation } = req.body;

    if (!firstName || !lastName || !email || !phone || !location || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailLower = email.toLowerCase();

    if (!validateEmail(emailLower)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // ✅ CHECK ADMIN EMAILS FIRST
    if (ADMIN_EMAILS.includes(emailLower)) {
      return res.status(409).json({ error: 'This email is reserved for admin use and cannot be registered' });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password too weak' });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: emailLower },
          { phone }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: emailLower,
        phone,
        location: location.trim(),
        password: hashedPassword,
        role: 'user'
      }
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ... rest of login code