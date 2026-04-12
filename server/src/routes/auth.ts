import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { validateEmail, validatePassword, validatePhone, validateName, validateLocation, getPasswordValidationError } from '../utils/validators.js';
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
    const { firstName, lastName, email, phone, location, district, districtId, password, password_confirmation } = req.body;

    const trimmedFirstName = firstName?.trim?.();
    const trimmedLastName = lastName?.trim?.();
    const normalizedEmail = email?.toLowerCase?.();
    const normalizedPhone = phone?.replace?.(/\s+/g, '');
    
    // Support both districtId (new) and district string (legacy)
    let resolvedDistrictId: number | null = null;
    let resolvedDistrictName: string = '';

    if (districtId) {
      // New approach: districtId provided
      const districtRecord = await db.district.findUnique({
        where: { id: parseInt(districtId) }
      });

      if (!districtRecord) {
        return res.status(400).json({ error: 'Invalid district' });
      }

      resolvedDistrictId = districtRecord.id;
      resolvedDistrictName = districtRecord.name;
    } else {
      // Legacy approach: district or location string provided
      const normalizedDistrict = (district || location || '').trim();
      
      if (!normalizedDistrict) {
        return res.status(400).json({ error: 'District or location is required' });
      }

      if (!validateLocation(normalizedDistrict)) {
        return res.status(400).json({ error: 'Invalid district' });
      }

      // Try to find matching district in database
      const districtRecord = await db.district.findFirst({
        where: {
          OR: [
            { name: { contains: normalizedDistrict } },
            { bn: { contains: normalizedDistrict } }
          ]
        }
      });

      if (districtRecord) {
        resolvedDistrictId = districtRecord.id;
        resolvedDistrictName = districtRecord.name;
      } else {
        // If no match in database, keep the string as-is (backward compatibility)
        resolvedDistrictName = normalizedDistrict;
      }
    }

    if (!trimmedFirstName || !trimmedLastName || !normalizedEmail || !normalizedPhone || !resolvedDistrictName || !password) {
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

    // Check if email is an admin email
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
        location: resolvedDistrictName,
        district: resolvedDistrictName,
        districtId: resolvedDistrictId,
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
        phone: user.phone,
        district: user.district,
        districtId: user.districtId,
        location: user.location,
        avatarUrl: user.avatarUrl,
        role: user.role
      }
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
          districtId: adminUser.districtId,
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
        districtId: user.districtId,
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

export default router;