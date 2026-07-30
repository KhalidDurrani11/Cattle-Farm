import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
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
import auctionRoutes from './routes/auctionRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render load balancer
app.set('trust proxy', 1);

// Fully open CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

// Express Core Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security & Optimization
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

// Health check — always works, even before DB connects
app.get('/health', (_req, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  mongo_uri_set: !!process.env.MONGO_URI,
}));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/cattle', cattleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bookings', bookingRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: "AgriTradeX API - Pakistan's Premier Livestock Marketplace",
    version: '1.0.0',
    status: 'running',
  });
});

// 404
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

// ✅ IMPORTANT: Bind to port FIRST so Render detects it,
// then connect to MongoDB in the background
app.listen(PORT, () => {
  console.log(`🚀 AgriTradeX API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 MONGO_URI set: ${!!process.env.MONGO_URI}`);

  // Connect to DB after server starts
  connectDB().then(() => {
    console.log('✅ Database connected successfully');
  }).catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    // Don't exit — let the server keep running so Render doesn't kill it
  });
});

export default app;
