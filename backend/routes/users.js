import express from 'express';
import User from '../models/User.js';
import Cattle from '../models/Cattle.js';
import Transaction from '../models/Transaction.js';
import Inquiry from '../models/Inquiry.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/dashboard — protected, role-based dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const userId = req.user.userId;
    const role = user.role;

    let dashboardData = {
      user,
      stats: {},
      recentActivity: [],
    };

    // Role-specific data
    if (role === 'farmer' || role === 'trader') {
      // Seller dashboard data
      const myListings = await Cattle.find({ sellerId: userId }).sort({ createdAt: -1 });
      const totalViews = myListings.reduce((sum, c) => sum + (c.views || 0), 0);
      const totalInquiries = myListings.reduce((sum, c) => sum + (c.inquiries || 0), 0);

      dashboardData.listings = myListings;
      dashboardData.stats = {
        totalListings: myListings.length,
        available: myListings.filter(c => c.status === 'available').length,
        sold: myListings.filter(c => c.status === 'sold').length,
        reserved: myListings.filter(c => c.status === 'reserved').length,
        totalViews,
        totalInquiries,
        totalRevenue: myListings
          .filter(c => c.status === 'sold')
          .reduce((sum, c) => sum + (c.soldPrice || c.price), 0),
      };

      // Recent activity
      const recentSales = await Transaction.find({ sellerId: userId, status: 'completed' })
        .populate('cattleId', 'name breed')
        .sort({ createdAt: -1 })
        .limit(5);

      dashboardData.recentActivity = recentSales.map(t => ({
        type: 'sale',
        message: `Sold ${t.cattleId?.name || 'cattle'} for PKR ${t.price.toLocaleString()}`,
        timestamp: t.createdAt,
      }));

      // Pending inquiries
      const pendingInquiries = await Inquiry.find({ sellerId: userId, status: 'pending' })
        .populate('cattleId', 'name')
        .populate('buyerId', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

      dashboardData.pendingInquiries = pendingInquiries;

    } else if (role === 'buyer') {
      // Buyer dashboard data
      const myPurchases = await Transaction.find({ buyerId: userId, status: 'completed' })
        .populate('cattleId', 'name breed images')
        .sort({ createdAt: -1 });

      const myInquiries = await Inquiry.find({ buyerId: userId })
        .populate('cattleId', 'name breed images price status')
        .sort({ createdAt: -1 })
        .limit(10);

      dashboardData.purchases = myPurchases;
      dashboardData.inquiries = myInquiries;
      dashboardData.stats = {
        totalPurchases: myPurchases.length,
        totalSpent: myPurchases.reduce((sum, t) => sum + t.price, 0),
        pendingInquiries: await Inquiry.countDocuments({ buyerId: userId, status: 'pending' }),
      };

    } else if (role === 'vet') {
      // Vet dashboard data
      const pendingVerifications = await Cattle.find({
        'verification.status': 'pending'
      })
        .populate('sellerId', 'name location')
        .sort({ 'verification.submittedAt': -1 });

      const myVerifications = await Cattle.find({
        'verification.veterinarianId': userId
      })
        .populate('sellerId', 'name')
        .sort({ 'verification.verifiedAt': -1 });

      dashboardData.pendingVerifications = pendingVerifications;
      dashboardData.myVerifications = myVerifications;
      dashboardData.stats = {
        pendingCount: pendingVerifications.length,
        verifiedCount: await Cattle.countDocuments({ 'verification.veterinarianId': userId }),
      };
    }

    // Recent notifications (for all roles)
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    dashboardData.notifications = notifications;
    dashboardData.unreadNotifications = await Notification.countDocuments({ userId, isRead: false });

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error loading dashboard.' });
  }
});

// GET /api/users/:id/profile — public, seller profile
router.get('/:id/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -cnic');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const listings = await Cattle.find({ sellerId: req.params.id, status: 'available' })
      .sort({ createdAt: -1 });

    const soldCount = await Cattle.countDocuments({ sellerId: req.params.id, status: 'sold' });

    // Get reviews
    const reviews = await Review.find({ reviewedId: req.params.id })
      .populate('reviewerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user,
      listings,
      stats: {
        totalListings: listings.length,
        soldCount,
        reviewCount: reviews.length,
        averageRating: reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0,
      },
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/users/profile — protected, update own profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'location', 'tehsil', 'district', 'province', 'avatar', 'cnic'];
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

// GET /api/users/favorites — protected, get user's favorited cattle
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: 'favorites',
      populate: { path: 'sellerId', select: 'name email location rating verificationStatus avatar' }
    });

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching favorites.' });
  }
});

// POST /api/users/favorites/:cattleId — protected, toggle favorite status
router.post('/favorites/:cattleId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const index = user.favorites.indexOf(req.params.cattleId);
    let isFavorite = false;

    if (index === -1) {
      user.favorites.push(req.params.cattleId);
      isFavorite = true;
    } else {
      user.favorites.splice(index, 1);
    }

    await user.save();
    res.json({
      message: isFavorite ? 'Added to favorites' : 'Removed from favorites',
      isFavorite,
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error toggling favorite.' });
  }
});

// GET /api/users/notifications — protected, get user notifications
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/users/notifications/:id/read — protected, mark notification as read
router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/users/notifications/read-all — protected, mark all notifications as read
router.put('/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/users/inquiries — protected, create inquiry
router.post('/inquiries', authMiddleware, async (req, res) => {
  try {
    const { cattleId, message } = req.body;

    const cattle = await Cattle.findById(cattleId);
    if (!cattle) return res.status(404).json({ message: 'Cattle not found.' });

    const inquiry = new Inquiry({
      cattleId,
      buyerId: req.user.userId,
      sellerId: cattle.sellerId,
      message,
    });

    await inquiry.save();

    // Increment inquiries count
    await Cattle.findByIdAndUpdate(cattleId, { $inc: { inquiries: 1 } });

    // Create notification for seller
    await Notification.create({
      userId: cattle.sellerId,
      title: 'New Inquiry',
      message: `Someone inquired about your ${cattle.name}`,
      type: 'info',
      link: `/dashboard`,
    });

    res.status(201).json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/users/inquiries — protected, get user's inquiries
router.get('/inquiries', authMiddleware, async (req, res) => {
  try {
    const asSeller = await Inquiry.find({ sellerId: req.user.userId })
      .populate('cattleId', 'name images')
      .populate('buyerId', 'name phone')
      .sort({ createdAt: -1 });

    const asBuyer = await Inquiry.find({ buyerId: req.user.userId })
      .populate('cattleId', 'name images')
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 });

    res.json({ asSeller, asBuyer });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/users/inquiries/:id/respond — protected, respond to inquiry
router.put('/inquiries/:id/respond', authMiddleware, async (req, res) => {
  try {
    const { response } = req.body;

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found.' });

    if (inquiry.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    inquiry.response = response;
    inquiry.respondedAt = new Date();
    inquiry.status = 'responded';
    await inquiry.save();

    // Notify buyer
    await Notification.create({
      userId: inquiry.buyerId,
      title: 'Inquiry Response',
      message: 'Seller responded to your inquiry',
      type: 'success',
      link: `/dashboard`,
    });

    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
