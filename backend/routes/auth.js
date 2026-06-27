import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';
import authMiddleware from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const smtpEmail = process.env.SMTP_EMAIL ? process.env.SMTP_EMAIL.trim() : '';
const smtpPass = process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s+/g, '') : '';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: smtpEmail,
    pass: smtpPass,
  },
});

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'agritradex_jwt_super_secret_2024_pk_cattle_marketplace_khalid';

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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOtp = otp;
    user.loginOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    console.log(`[AUTH] 🔑 Login Verification Code for ${user.email} is: ${otp}`);

    // Send OTP via email asynchronously (fire-and-forget)
    const mailOptions = {
      from: `"Cattle Farm Trading" <${smtpEmail}>`,
      to: user.email,
      subject: 'Your Login Verification Code - Cattle Farm Trading',
      text: `Your login verification code is: ${otp}\nThis code is valid for 10 minutes.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;">
          <h2 style="color:#1E4620;margin-bottom:8px;">Login Verification</h2>
          <p style="color:#555;">Use the code below to complete your login to <strong>Cattle Farm Trading</strong>.</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1E4620;background:#f0f7f0;padding:20px;text-align:center;border-radius:8px;margin:24px 0;">${otp}</div>
          <p style="color:#888;font-size:13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#aaa;font-size:12px;">Cattle Farm Trading — Pakistan's Premier Livestock Exchange</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions).catch(emailError => {
      console.error('[AUTH] ⚠️ Email delivery failed:', emailError.message);
    });

    res.json({
      message: 'OTP verification code sent to your email.',
      requiresOtp: true,
      email: user.email,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// POST /api/auth/verify-login-otp
router.post('/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid request.' });

    if (!user.loginOtp || user.loginOtp !== otp) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    if (user.loginOtpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired.' });
    }

    // Clear OTP fields
    user.loginOtp = undefined;
    user.loginOtpExpiresAt = undefined;

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
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP verification.' });
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

router.post('/verification', authMiddleware, async (req, res) => {
  try {
    const { documents, cnic } = req.body; // Array of { type, url }, and string cnic

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ message: 'At least one document is required.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (cnic) {
      user.cnic = cnic;
    }

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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.loginOtp = otp; // Re-use the login OTP fields for password reset
    user.loginOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    console.log(`[AUTH] 🔑 Password Reset Code for ${user.email} is: ${otp}`);

    const mailOptions = {
      from: `"Cattle Farm Trading" <${smtpEmail}>`,
      to: user.email,
      subject: 'Password Reset Code - Cattle Farm Trading',
      text: `Your password reset code is: ${otp}\nThis code is valid for 15 minutes.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;">
          <h2 style="color:#1E4620;margin-bottom:8px;">Password Reset</h2>
          <p style="color:#555;">Use the code below to reset your password on <strong>Cattle Farm Trading</strong>.</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1E4620;background:#f0f7f0;padding:20px;text-align:center;border-radius:8px;margin:24px 0;">${otp}</div>
          <p style="color:#888;font-size:13px;">This code expires in <strong>15 minutes</strong>. If you did not request this, ignore this email.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#aaa;font-size:12px;">Cattle Farm Trading — Pakistan's Premier Livestock Exchange</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions).catch(emailError => {
      console.error('[AUTH] ⚠️ Email delivery failed:', emailError.message);
    });

    res.json({
      message: 'Password reset OTP sent to your email.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid request.' });

    if (!user.loginOtp || user.loginOtp !== otp) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    if (user.loginOtpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.loginOtp = undefined;
    user.loginOtpExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
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

// POST /api/auth/social-login
router.post('/social-login', async (req, res) => {
  try {
    const { token, provider } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required.' });
    }

    let email = '';
    let name = '';
    let picture = '';

    if (provider === 'Google') {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) return res.status(400).json({ message: 'Invalid Google token.' });
      
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else {
      return res.status(400).json({ message: 'Unsupported provider.' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Create user if not exists
      const randomPassword = Math.random().toString(36).substring(2, 15) + '!@#';
      const hashedPassword = await bcrypt.hash(randomPassword, 12);
      
      let role = 'buyer';
      let verificationStatus = 'not_submitted';
      
      if (email.toLowerCase().includes('admin')) {
        role = 'admin';
        verificationStatus = 'verified';
      } else if (email.toLowerCase().includes('farmer') || email.toLowerCase().includes('seller')) {
        role = 'farmer';
        verificationStatus = 'verified';
      }

      user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        verificationStatus,
        avatar: picture,
      });
      await user.save();
    } else if (!user.avatar && picture) {
      user.avatar = picture;
      await user.save();
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned. Contact support.' });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    const jwtToken = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token: jwtToken,
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
        joinedAt: user.joinedAt,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ message: 'Server error during social login.' });
  }
});

export default router;
