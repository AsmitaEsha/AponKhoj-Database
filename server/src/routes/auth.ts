import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { validateEmail, validatePassword, validatePhone, validateName, validateLocation, getPasswordValidationError } from '../utils/validators.js';
import { isAdminCredential } from '../utils/adminConfig.js';
import { otpEmailHtml, verifyEmailHtml } from '../utils/emailTemplates.js';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

function createEmailTransporter() {
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim();
  if (!user || !pass) throw new Error('Missing Gmail SMTP credentials');
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
}

const router = Router();

// Admin emails that cannot be registered as regular users
const ADMIN_EMAILS = [
  'humayrabintekazal@gmail.com',
  'asmitaesha123@gmail.com',
  'jamilamuhammad18052000@gmail.com'
];

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, location, district, password, password_confirmation } = req.body;

    const trimmedFirstName = firstName?.trim?.();
    const trimmedLastName = lastName?.trim?.();
    const normalizedEmail = email?.toLowerCase?.();
    const normalizedPhone = phone?.replace?.(/\s+/g, '');
    const normalizedDistrict = (district || location || '').trim();

    if (!trimmedFirstName || !trimmedLastName || !normalizedEmail || !normalizedPhone || !normalizedDistrict || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateName(trimmedFirstName) || !validateName(trimmedLastName)) {
      return res.status(400).json({ error: 'Invalid name' });
    }

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePhone(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    if (!validateLocation(normalizedDistrict)) {
      return res.status(400).json({ error: 'Invalid district' });
    }

    // NEW: Check if email is an admin email
    if (ADMIN_EMAILS.includes(normalizedEmail)) {
      return res.status(409).json({ error: 'This email is reserved for admin use and cannot be registered' });
    }

    if (!validatePassword(password)) {
      const passwordError = getPasswordValidationError(password) || 'Password is too weak';
      return res.status(400).json({ error: passwordError });
    }

    if (password !== password_confirmation) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { phone: normalizedPhone }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: normalizedEmail,
        phone: normalizedPhone,
        location: normalizedDistrict,
        district: normalizedDistrict,
        password: hashedPassword,
        role: 'user'
      }
    });

    // Send email verification OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await db.passwordResetOTP.deleteMany({ where: { email: normalizedEmail } });
    await db.passwordResetOTP.create({ data: { email: normalizedEmail, otp, expiresAt } });

    try {
      const transporter = createEmailTransporter();
      await transporter.sendMail({
        from: `"আপনখোঁজ" <${process.env.GMAIL_USER}>`,
        to: normalizedEmail,
        subject: 'ইমেইল যাচাই কোড — আপনখোঁজ',
        html: verifyEmailHtml(trimmedFirstName, otp),
      });
      console.log(`[register] Verification OTP sent to ${normalizedEmail}`);
    } catch (emailErr) {
      console.error('[register] Failed to send verification email:', emailErr);
    }

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      requiresVerification: true,
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const isAdmin = isAdminCredential(email, password);

    if (isAdmin) {
      // ✅ Sync Admin with Database to get a real ID for relations
      let adminUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });
      
      if (!adminUser) {
        const adminIndex = Math.max(ADMIN_EMAILS.findIndex(adminEmail => adminEmail === email.toLowerCase()), 0);
        const adminPhone = `019${String(adminIndex + 1).padStart(8, '0')}`;

        // Create the admin record if it doesn't exist
        const hashedPassword = await hashPassword(password);
        adminUser = await db.user.create({
          data: {
            firstName: 'Admin',
            lastName: 'User',
            email: email.toLowerCase(),
            phone: adminPhone,
            location: 'System',
            district: 'System',
            password: hashedPassword,
            role: 'admin'
          }
        });
      }

      const adminToken = generateToken(adminUser.id, 'admin');
      return res.json({
        message: 'Admin login successful',
        token: adminToken,
        user: {
          id: adminUser.id,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          email: adminUser.email,
          phone: adminUser.phone,
          district: adminUser.district,
          location: adminUser.location,
          avatarUrl: adminUser.avatarUrl,
          role: 'admin'
        }
      });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'emailNotVerified', email: user.email });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        district: user.district,
        location: user.location,
        avatarUrl: user.avatarUrl,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/verify-email — confirm OTP and activate account
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const normalizedEmail = (email as string).toLowerCase().trim();

    const record = await db.passwordResetOTP.findFirst({
      where: { email: normalizedEmail, otp: otp.toString(), used: false, expiresAt: { gt: new Date() } },
    });

    if (!record) {
      return res.status(400).json({ error: 'কোডটি ভুল অথবা মেয়াদ শেষ হয়ে গেছে।' });
    }

    // Mark verified & mark OTP used
    await db.user.update({ where: { email: normalizedEmail }, data: { emailVerified: true } });
    await db.passwordResetOTP.update({ where: { id: record.id }, data: { used: true } });

    const user = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = generateToken(user.id, user.role);
    return res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        district: user.district,
        location: user.location,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/resend-verification — resend email verification OTP
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const normalizedEmail = (email as string).toLowerCase().trim();
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ error: 'Email already verified' });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await db.passwordResetOTP.deleteMany({ where: { email: normalizedEmail } });
    await db.passwordResetOTP.create({ data: { email: normalizedEmail, otp, expiresAt } });

    const transporter = createEmailTransporter();
    await transporter.sendMail({
      from: `"আপনখোঁজ" <${process.env.GMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'ইমেইল যাচাই কোড — আপনখোঁজ',
      html: verifyEmailHtml(user.firstName, otp),
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/forgot-password — generate & email a 4-digit OTP
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const normalizedEmail = (email as string).toLowerCase().trim();

    // Find user — don't reveal whether email exists (anti-enumeration)
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      console.log(`[forgot-password] No account found for: ${normalizedEmail}`);
      // Return success anyway so attackers can't enumerate valid emails
      return res.json({ success: true });
    }

    // Delete any existing unused OTPs for this email
    await db.passwordResetOTP.deleteMany({ where: { email: normalizedEmail } });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.passwordResetOTP.create({
      data: { email: normalizedEmail, otp, expiresAt },
    });

    // Send OTP email
    console.log(`[forgot-password] Sending OTP ${otp} to ${normalizedEmail}`);
    const transporter = createEmailTransporter();
    await transporter.sendMail({
      from: `"আপনখোঁজ" <${process.env.GMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'পাসওয়ার্ড রিসেট কোড — আপনখোঁজ',
      html: otpEmailHtml(user.firstName, otp),
    });
    console.log(`[forgot-password] Email sent successfully to ${normalizedEmail}`);

    return res.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/verify-otp — check the OTP is valid and not expired
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const normalizedEmail = (email as string).toLowerCase().trim();

    const record = await db.passwordResetOTP.findFirst({
      where: {
        email: normalizedEmail,
        otp: otp.toString(),
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return res.status(400).json({ error: 'কোডটি ভুল অথবা মেয়াদ শেষ হয়ে গেছে।' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/reset-password — verify OTP again then save new password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const normalizedEmail = (email as string).toLowerCase().trim();

    // Re-verify OTP (double check — prevents skipping the verify step)
    const record = await db.passwordResetOTP.findFirst({
      where: {
        email: normalizedEmail,
        otp: otp.toString(),
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return res.status(400).json({ error: 'কোডটি ভুল অথবা মেয়াদ শেষ হয়ে গেছে। নতুন কোডের জন্য আবার চেষ্টা করুন।' });
    }

    // Enforce password strength
    if (!validatePassword(newPassword)) {
      const passwordError = getPasswordValidationError(newPassword) || 'Password is too weak';
      return res.status(400).json({ error: passwordError });
    }

    // Hash and save new password
    const hashed = await hashPassword(newPassword);
    await db.user.update({
      where: { email: normalizedEmail },
      data: { password: hashed },
    });

    // Mark OTP as used so it can't be reused
    await db.passwordResetOTP.update({
      where: { id: record.id },
      data: { used: true },
    });

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;