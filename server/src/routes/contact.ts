import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const router = Router();

function createTransporter() {
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim();

  if (!user || !pass) {
    throw new Error('Missing Gmail SMTP credentials. Set GMAIL_USER and GMAIL_APP_PASSWORD in server .env');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

function getReceiverEmail() {
  return (process.env.CONTACT_RECEIVER_EMAIL || 'musketeerst687175@gmail.com').trim();
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const transporter = createTransporter();
    const { name, phone, email, subject, message } = req.body;

    const normalizedName = String(name || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPhone = String(phone || '').trim() || null;
    const normalizedSubject = String(subject || '').trim();
    const normalizedMessage = String(message || '').trim();

    // Validation
    if (!normalizedName || !normalizedEmail || !normalizedSubject || !normalizedMessage) {
      return res.status(400).json({ error: 'নাম, ইমেইল, বিষয় এবং বার্তা আবশ্যক।' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'সঠিক ইমেইল ঠিকানা দিন।' });
    }

    // Save contact submission in DB
    await db.contact.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        subject: normalizedSubject,
        message: normalizedMessage,
      },
    });

    // 1) Notification email → you (musketeerst687175@gmail.com)
    await transporter.sendMail({
      from: `"আপনখোঁজ Contact" <${process.env.GMAIL_USER}>`,
      to: getReceiverEmail(),
      replyTo: normalizedEmail,
      subject: `[আপনখোঁজ] ${normalizedSubject}`,
      text: `Name: ${normalizedName}\nEmail: ${normalizedEmail}\n${normalizedPhone ? `Phone: ${normalizedPhone}\n` : ''}Subject: ${normalizedSubject}\n\n${normalizedMessage}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: #1d4ed8; padding: 28px 32px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">আপনখোঁজ</h1>
            <p style="color: #bfdbfe; margin: 6px 0 0; font-size: 13px;">নতুন যোগাযোগ বার্তা</p>
          </div>
          <div style="padding: 32px; background: #ffffff;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 25%;">নাম</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">${normalizedName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">ইমেইল</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                  <a href="mailto:${normalizedEmail}" style="color: #1d4ed8;">${normalizedEmail}</a>
                </td>
              </tr>
              ${normalizedPhone ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">ফোন</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${normalizedPhone}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;">বিষয়</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">${normalizedSubject}</td>
              </tr>
            </table>
            <div style="margin-top: 24px;">
              <p style="color: #6b7280; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">বার্তা</p>
              <div style="background: #f9fafb; border-left: 4px solid #1d4ed8; padding: 16px; border-radius: 0 8px 8px 0; color: #374151; line-height: 1.7; font-size: 14px;">
                ${normalizedMessage.replace(/\n/g, '<br/>')}
              </div>
            </div>
          </div>
          <div style="padding: 16px 32px; background: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px;">
            আপনখোঁজ Contact Form — Reply directly to respond to ${normalizedName}
          </div>
        </div>
      `,
    });

    // 2) Auto-reply → sender
    await transporter.sendMail({
      from: `"আপনখোঁজ" <${process.env.GMAIL_USER}>`,
      to: normalizedEmail,
      subject: `আপনার বার্তা পেয়েছি — আপনখোঁজ`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: #1d4ed8; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0 0 6px; font-size: 26px; letter-spacing: 2px;">আপনখোঁজ</h1>
            <p style="color: #bfdbfe; margin: 0; font-size: 13px;">আমাদের সাথে যোগাযোগ করার জন্য ধন্যবাদ</p>
          </div>
          <div style="padding: 36px 32px; background: #ffffff;">
            <h2 style="color: #111827; margin: 0 0 12px; font-size: 18px;">প্রিয় ${normalizedName},</h2>
            <p style="color: #4b5563; line-height: 1.8; margin-bottom: 20px;">
              আপনার বার্তাটি আমরা সফলভাবে পেয়েছি। আমাদের টিম সাধারণত ২৪–৪৮ ঘণ্টার মধ্যে উত্তর দিয়ে থাকে।
            </p>
            <div style="background: #eff6ff; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px; border: 1px solid #dbeafe;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 1px;">আপনার বার্তা</p>
              <p style="color: #1e40af; margin: 0; font-style: italic; line-height: 1.7; font-size: 14px;">"${normalizedMessage.replace(/\n/g, '<br/>')}"</p>
            </div>
            <p style="color: #4b5563; line-height: 1.8; margin-bottom: 4px;">জরুরি বিষয়ে সরাসরি ফোন করুন: <strong>01842-685725</strong></p>
            <p style="color: #4b5563; line-height: 1.8;">এই ইমেইলে সরাসরি Reply করলেও আমরা পাব।</p>
            <p style="color: #374151; margin-top: 28px; margin-bottom: 0;">শুভেচ্ছায়,<br/><strong>আপনখোঁজ টিম</strong></p>
          </div>
          <div style="padding: 16px 32px; background: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px;">
            © 2026 আপনখোঁজ — সবার জন্য, সবসময়
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: 'বার্তা সফলভাবে পাঠানো হয়েছে।' });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'বার্তা পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' });
  }
});

export default router;