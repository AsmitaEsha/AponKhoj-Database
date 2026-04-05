import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import missingPersonRouter from './routes/missingPersonReports.js';
import foundPersonRouter from './routes/foundPersonReports.js';
import reportRouter from './routes/reports.js';
import adminRouter from './routes/admin.js';
import notificationRouter from './routes/notifications.js';
import contactRouter from './routes/contact.js'; 
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', message: 'Database connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'আপনখোঁজ API Server', version: '2.0.0' });
});

// Routes
app.use('/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/missing-reports', missingPersonRouter);
app.use('/api/found-reports', foundPersonRouter);
app.use('/api/reports', reportRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/contact', contactRouter); 

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Missing/Found Reports API enabled`);
  console.log(`👨‍💼 Admin features enabled`);
  console.log(`✉️  Contact email API enabled`);
});