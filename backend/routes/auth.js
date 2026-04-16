import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'agritradex_secret_key_change_in_production';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, location, cnic, tehsil, district, province } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'An account with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      cnic: cnic || '',
      password: hashedPassword,
      role: role || 'buyer',
      location: location || '',
      tehsil: tehsil || '',
      district: district || '',
      province: province || '',
    });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        tehsil: user.tehsil,
        district: user.district,
        province: user.province,
        cnic: user.cnic,
        verificationStatus: user.verificationStatus,
        rating: user.rating,
        ratingCount: user.ratingCount,
        totalSales: user.totalSales,
        totalPurchases: user.totalPurchases,
        avatar: user.avatar,
        joinedAt: user.joinedAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned. Contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password.' });

    // Update last active
    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        tehsil: user.tehsil,
        district: user.district,
        province: user.province,
        cnic: user.cnic,
        verificationStatus: user.verificationStatus,
        rating: user.rating,
        ratingCount: user.ratingCount,
        totalSales: user.totalSales,
        totalPurchases: user.totalPurchases,
        avatar: user.avatar,
        joinedAt: user.joinedAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/auth/profile - Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'location', 'tehsil', 'district', 'province', 'avatar'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/verification - Submit verification documents
router.post('/verification', authMiddleware, async (req, res) => {
  try {
    const { documents } = req.body; // Array of { type, url }

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ message: 'At least one document is required.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Add new documents
    documents.forEach(doc => {
      user.verificationDocuments.push({
        type: doc.type,
        url: doc.url,
        status: 'pending',
        uploadedAt: new Date(),
      });
    });

    user.verificationStatus = 'pending';
    user.verificationSubmittedAt = new Date();
    await user.save();

    res.json({ message: 'Verification documents submitted successfully.', user });
  } catch (error) {
    console.error('Verification submission error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/auth/verification/status - Get verification status
router.get('/verification/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('verificationStatus verificationDocuments verificationSubmittedAt verificationVerifiedAt verificationRejectedAt verificationRejectionReason');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
