import express from 'express';
import User from '../models/User.js';
import Cattle from '../models/Cattle.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Middleware to check admin role
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vet') {
    return res.status(403).json({ message: 'Access denied. Admin/Vet only.' });
  }
  next();
};

// GET /api/admin/pending-verifications — get pending user verifications
router.get('/pending-verifications', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({
      verificationStatus: 'pending',
      verificationDocuments: { $exists: true, $ne: [] }
    }).select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/users/:id/verify — verify user
router.put('/users/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { documentType } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Update specific document status
    if (documentType) {
      const doc = user.verificationDocuments.find(d => d.type === documentType && d.status === 'pending');
      if (doc) {
        doc.status = 'verified';
        doc.verifiedAt = new Date();
      }
    }

    // Check if all documents are verified
    const allVerified = user.verificationDocuments.every(d => d.status === 'verified');
    if (allVerified && user.verificationDocuments.length > 0) {
      user.verificationStatus = 'verified';
      user.verificationVerifiedAt = new Date();
    }

    await user.save();
    res.json({ message: 'User verification updated.', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/users/:id/reject — reject user verification
router.put('/users/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { reason, documentType } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (documentType) {
      const doc = user.verificationDocuments.find(d => d.type === documentType);
      if (doc) {
        doc.status = 'rejected';
        doc.rejectionReason = reason;
      }
    }

    user.verificationStatus = 'rejected';
    user.verificationRejectedAt = new Date();
    user.verificationRejectionReason = reason;

    await user.save();
    res.json({ message: 'User verification rejected.', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/admin/pending-cattle-verifications — get pending cattle verifications
router.get('/pending-cattle-verifications', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cattle = await Cattle.find({
      'verification.status': 'pending'
    }).populate('sellerId', 'name phone location');

    res.json(cattle);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/cattle/:id/verify — verify cattle
router.put('/cattle/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { healthScore, notes } = req.body;

    const cattle = await Cattle.findById(req.params.id);
    if (!cattle) return res.status(404).json({ message: 'Cattle not found.' });

    cattle.verification.status = 'verified';
    cattle.verification.verifiedAt = new Date();
    cattle.verification.veterinarianId = req.user.userId;
    cattle.verification.healthScore = healthScore;
    cattle.verification.notes = notes;
    cattle.verification.isVerified = true;

    await cattle.save();

    // Notify seller
    const Notification = (await import('../models/Notification.js')).default;
    await Notification.create({
      userId: cattle.sellerId,
      title: 'Cattle Verified',
      message: `Your cattle "${cattle.name}" has been verified by a veterinarian.`,
      type: 'success',
    });

    res.json({ message: 'Cattle verified successfully.', cattle });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/cattle/:id/reject — reject cattle verification
router.put('/cattle/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;

    const cattle = await Cattle.findById(req.params.id);
    if (!cattle) return res.status(404).json({ message: 'Cattle not found.' });

    cattle.verification.status = 'rejected';
    cattle.verification.rejectionReason = reason;

    await cattle.save();

    // Notify seller
    const Notification = (await import('../models/Notification.js')).default;
    await Notification.create({
      userId: cattle.sellerId,
      title: 'Verification Rejected',
      message: `Your cattle "${cattle.name}" verification was rejected. Reason: ${reason}`,
      type: 'error',
    });

    res.json({ message: 'Cattle verification rejected.', cattle });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/admin/stats — get admin dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verificationStatus: 'verified' });
    const pendingUsers = await User.countDocuments({ verificationStatus: 'pending' });

    const totalCattle = await Cattle.countDocuments();
    const availableCattle = await Cattle.countDocuments({ status: 'available' });
    const soldCattle = await Cattle.countDocuments({ status: 'sold' });
    const verifiedCattle = await Cattle.countDocuments({ 'verification.status': 'verified' });
    const pendingCattle = await Cattle.countDocuments({ 'verification.status': 'pending' });

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const cattleByCategory = await Cattle.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const recentUsers = await User.find()
      .select('-password')
      .sort({ joinedAt: -1 })
      .limit(10);

    res.json({
      users: { total: totalUsers, verified: verifiedUsers, pending: pendingUsers, byRole: usersByRole },
      cattle: { total: totalCattle, available: availableCattle, sold: soldCattle, verified: verifiedCattle, pending: pendingCattle, byCategory: cattleByCategory },
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
});

// Middleware to check strictly admin role (Vets cannot ban/moderate users/delete listings)
const strictAdminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrator only.' });
  }
  next();
};

// GET /api/admin/pending-listings — get pending listings (status: 'pending')
router.get('/pending-listings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const listings = await Cattle.find({ status: 'pending' })
      .populate('sellerId', 'name email phone location');
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pending listings.' });
  }
});

// PUT /api/admin/listings/:id/approve — approve a listing (set status to available)
router.put('/listings/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cattle = await Cattle.findById(req.params.id);
    if (!cattle) return res.status(404).json({ message: 'Listing not found.' });

    cattle.status = 'available';
    await cattle.save();

    // Notify seller
    const Notification = (await import('../models/Notification.js')).default;
    await Notification.create({
      userId: cattle.sellerId,
      title: 'Listing Approved',
      message: `Your cattle listing "${cattle.name}" has been approved and is now live on the marketplace.`,
      type: 'success',
    });

    res.json({ message: 'Listing approved successfully.', cattle });
  } catch (error) {
    res.status(500).json({ message: 'Server error approving listing.' });
  }
});

// PUT /api/admin/listings/:id/reject — reject a listing (set status to unavailable)
router.put('/listings/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const cattle = await Cattle.findById(req.params.id);
    if (!cattle) return res.status(404).json({ message: 'Listing not found.' });

    cattle.status = 'unavailable';
    await cattle.save();

    // Notify seller
    const Notification = (await import('../models/Notification.js')).default;
    await Notification.create({
      userId: cattle.sellerId,
      title: 'Listing Moderation',
      message: `Your cattle listing "${cattle.name}" was rejected. Reason: ${reason || 'Inappropriate details.'}`,
      type: 'error',
    });

    res.json({ message: 'Listing rejected.', cattle });
  } catch (error) {
    res.status(500).json({ message: 'Server error rejecting listing.' });
  }
});

// GET /api/admin/users — list all users
router.get('/users', authMiddleware, strictAdminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ joinedAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// PUT /api/admin/users/:id/ban — ban user
router.put('/users/:id/ban', authMiddleware, strictAdminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban an admin user.' });
    }

    user.isBanned = true;
    user.banReason = reason || 'Violation of terms.';
    await user.save();

    res.json({ message: 'User banned successfully.', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error banning user.' });
  }
});

// PUT /api/admin/users/:id/unban — unban user
router.put('/users/:id/unban', authMiddleware, strictAdminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.isBanned = false;
    user.banReason = undefined;
    await user.save();

    res.json({ message: 'User unbanned successfully.', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error unbanning user.' });
  }
});

// DELETE /api/admin/listings/:id — admin force delete listing
router.delete('/listings/:id', authMiddleware, strictAdminMiddleware, async (req, res) => {
  try {
    const cattle = await Cattle.findById(req.params.id);
    if (!cattle) return res.status(404).json({ message: 'Listing not found.' });

    await cattle.deleteOne();
    res.json({ message: 'Listing deleted by admin successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting listing.' });
  }
});

export default router;
