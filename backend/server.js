import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import cattleRoutes from './routes/cattle.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Fully open CORS to allow any Netlify domain to connect
app.use(cors({
  origin: true, // This reflects the requested origin back
  credentials: true,
}));

// Express Core Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- SECURITY & OPTIMIZATION MIDDLEWARES ---
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(mongoSanitize());
app.use(compression());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many authentication attempts, please try again later.' }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});
app.use('/api', generalLimiter);

// Connect to Database
await connectDB();

// Health check endpoint
app.get('/health', (_req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/cattle', cattleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'AgriTradeX API - Pakistan\'s Premier Livestock Marketplace',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      cattle: '/api/cattle',
      users: '/api/users',
      upload: '/api/upload',
      admin: '/api/admin',
    },
  });
});

// Fallback logic
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    message: isProduction ? 'Internal server error.' : err.message || 'Internal server error.',
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// Export the app for Vercel
export default app;

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 AgriTradeX API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}
