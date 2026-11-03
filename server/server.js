import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import programsRoutes from './routes/programs.js';
import teamRoutes from './routes/team.js';
import submissionsRoutes from './routes/submissions.js';
import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';
import storiesRoutes from './routes/stories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root, server directory, or cwd
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });
const submissionLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false });
app.post('/api/auth/login', loginLimiter);
app.use('/api/submissions', (req, res, next) => req.method === 'POST' ? submissionLimiter(req, res, next) : next());

// Routes
app.use('/api/programs', programsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/stories', storiesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PHRONEO API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status === 413 ? 413 : 500).json({ message: err.status === 413 ? 'Request payload is too large' : 'Something went wrong' });
});

// Connect to MongoDB and start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  const shutdown = (signal) => {
    console.log(`${signal} received; closing API server`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
