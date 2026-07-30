import express from 'express';
import Cattle from '../models/Cattle.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import authMiddleware from '../middleware/auth.js';
import { cattleCache } from '../utils/cache.js';

const router = express.Router();

// GET /api/cattle — public, get all active listings
router.get('/', async (req, res) => {
  try {
    const cacheKey = `cattle:${JSON.stringify(req.query)}`;
    const cachedData = cattleCache.get(cacheKey);
    if (cachedData) {
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
      return res.json(cachedData);
    }

    const { breed, category, minPrice, maxPrice, location, province, status, verificationStatus, sortBy, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    // Status filter - default to available listings
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ['available', 'reserved'] };
    }

    // Other filters
    if (breed) filter.breed = { $regex: breed, $options: 'i' };
    if (category) filter.category = category;
    if (province) filter.province = province;
    if (location) {
      filter.$or = [
        { location: { $regex: location, $options: 'i' } },
        { district: { $regex: location, $options: 'i' } },
      ];
    }

    // Verification status filter
    if (verificationStatus === 'verified') {
      filter['verification.status'] = 'verified';
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (sortBy === 'price_asc') sort = { price: 1 };
    if (sortBy === 'price_desc') sort = { price: -1 };
    if (sortBy === 'views') sort = { views: -1 };
    if (sortBy === 'oldest') sort = { createdAt: 1 };

    const cattle = await Cattle.find(filter)
      .populate('sellerId', 'name avatar location district province verificationStatus rating ratingCount')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    let total;
    if (pageNum === 1 && cattle.length < limitNum) {
      total = cattle.length;
    } else {
      total = await Cattle.countDocuments(filter);
    }

    const responsePayload = {
      data: cattle,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        total,
      },
    };

    cattleCache.set(cacheKey, responsePayload, 30000);
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    res.json(responsePayload);
  } catch (error) {
    console.error('Get cattle error:', error);
    res.status(500).json({ message: 'Server error fetching listings.' });
  }
});

// GET /api/cattle/featured - Get featured listings
router.get('/featured', async (req, res) => {
  try {
    const cacheKey = 'cattle:featured';
    const cachedData = cattleCache.get(cacheKey);
    if (cachedData) {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
      return res.json(cachedData);
    }

    const cattle = await Cattle.find({
      status: { $in: ['available', 'reserved'] },
      isFeatured: true,
      'verification.status': 'verified'
    })
      .populate('sellerId', 'name location rating verificationStatus avatar')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    cattleCache.set(cacheKey, cattle, 60000);
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    res.json(cattle);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/cattle/my-listings — protected, get user's listings
router.get('/my-listings', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { sellerId: req.user.userId };
    if (status) filter.status = status;

    const cattle = await Cattle.find(filter)
      .populate('buyerId', 'name phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json(cattle);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching listings.' });
  }
});

// GET /api/cattle/stats — protected, get user's cattle stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await Cattle.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalListings: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          sold: { $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] } },
          reserved: { $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] } },
          totalViews: { $sum: '$views' },
          totalInquiries: { $sum: '$inquiries' },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'sold'] }, '$soldPrice', 0] } },
        }
      }
    ]);

    const monthlySales = await Cattle.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(userId), status: 'sold', soldAt: { $exists: true } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$soldAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$soldPrice' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    res.json({
      ...stats[0],
      monthlySales: monthlySales.map(s => ({ month: s._id, count: s.count, revenue: s.revenue })),
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/cattle/:id — public, single listing
router.get('/:id', async (req, res) => {
  try {
    const cattle = await Cattle.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('sellerId', 'name email phone location district province avatar verificationStatus rating ratingCount joinedAt')
      .lean();

    if (!cattle) return res.status(404).json({ message: 'Listing not found.' });

    res.json(cattle);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/cattle — protected, create listing
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name, breed, category, price, originalPrice, age, weight, gender,
      location, tehsil, district, province, description, images, healthNotes, tags
    } = req.body;

    if (!name || !breed || !price || !age || !weight || !location) {
      return res.status(400).json({ message: 'Name, breed, price, age, weight, and location are required.' });
    }

    const cattle = new Cattle({
      name, breed, category, price, originalPrice, age, weight, gender,
      location, tehsil, district, province, description, images, healthNotes, tags: tags || [],
      sellerId: req.user.userId,
      status: 'pending',
    });

    await cattle.save();

    // Update user's total listings count
    await User.findByIdAndUpdate(req.user.userId, { $inc: { totalListings: 1 } });

    cattleCache.clear();

    const populated = await cattle.populate('sellerId', 'name email location rating');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create cattle error:', error);
    res.status(500).json({ message: 'Server error creating listing.' });
  }
});

// PUT /api/cattle/:id — protected, update own listing
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const cattle = await Cattle.findById(req.params.id);
    if (!cattle) return res.status(404).json({ message: 'Listing not found.' });

    if (cattle.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this listing.' });
    }

    // Prevent editing if already sold
    if (cattle.status === 'sold') {
      return res.status(400).json({ message: 'Cannot edit a sold listing.' });
    }

    const allowed = [
      'name', 'breed', 'category', 'price', 'originalPrice', 'age', 'weight', 'gender',
      'location', 'tehsil', 'district', 'province', 'description', 'images',
      'status', 'healthNotes', 'tags', 'isFeatured'
    ];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) cattle[field] = req.body[field];
    });

    cattle.updatedAt = new Date();
    await cattle.save();

    cattleCache.clear();

    res.json(cattle);
  } catch (error) {
    console.error('Update cattle error:', error);
    res.status(500).json({ message: 'Server error updating listing.' });
  }
});

// DELETE /api/cattle/:id — protected, delete own listing
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const cattle = await Cattle.findById(req.params.id);
    if (!cattle) return res.status(404).json({ message: 'Listing not found.' });

    if (cattle.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this listing.' });
    }

    await cattle.deleteOne();
    cattleCache.clear();
    res.json({ message: 'Listing deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting listing.' });
  }
});

// POST /api/cattle/:id/mark-sold — protected, mark as sold
router.post('/:id/mark-sold', authMiddleware, async (req, res) => {
  try {
    const { soldPrice, buyerId } = req.body;
    const cattle = await Cattle.findById(req.params.id);

    if (!cattle) return res.status(404).json({ message: 'Listing not found.' });
    if (cattle.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    cattle.status = 'sold';
    cattle.soldAt = new Date();
    cattle.soldPrice = soldPrice || cattle.price;
    if (buyerId) cattle.buyerId = buyerId;

    await cattle.save();

    // Update user's total sales
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { totalSales: 1, totalRevenue: cattle.soldPrice || cattle.price }
    });

    cattleCache.clear();

    res.json({ message: 'Listing marked as sold.', cattle });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/cattle/:id/mark-available — protected, mark as available again
router.post('/:id/mark-available', authMiddleware, async (req, res) => {
  try {
    const cattle = await Cattle.findById(req.params.id);

    if (!cattle) return res.status(404).json({ message: 'Listing not found.' });
    if (cattle.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    cattle.status = 'available';
    cattle.soldAt = undefined;
    cattle.soldPrice = undefined;
    cattle.buyerId = undefined;

    await cattle.save();

    cattleCache.clear();

    res.json({ message: 'Listing marked as available.', cattle });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/cattle/:id/verification — protected, submit for verification
router.post('/:id/verification', authMiddleware, async (req, res) => {
  try {
    const { vaccinationRecords, healthNotes } = req.body;
    const cattle = await Cattle.findById(req.params.id);

    if (!cattle) return res.status(404).json({ message: 'Listing not found.' });
    if (cattle.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    cattle.verification = {
      ...cattle.verification,
      status: 'pending',
      submittedAt: new Date(),
      vaccinationRecords: vaccinationRecords || [],
    };

    if (healthNotes) cattle.healthNotes = healthNotes;

    await cattle.save();

    cattleCache.clear();

    res.json({ message: 'Verification request submitted.', cattle });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/cattle/:id/verification/status — get verification status
router.get('/:id/verification/status', async (req, res) => {
  try {
    const cattle = await Cattle.findById(req.params.id).select('verification').lean();
    if (!cattle) return res.status(404).json({ message: 'Listing not found.' });
    res.json(cattle.verification);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router;
