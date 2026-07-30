import express from 'express';
import Booking from '../models/Booking.js';
import BookingConfig from '../models/BookingConfig.js';
import Cattle from '../models/Cattle.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';
import { cattleCache } from '../utils/cache.js';

const router = express.Router();

// Helper middleware for Admin/Vet check
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'vet') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// GET default / get existing BookingConfig
const getOrCreateConfig = async () => {
  let config = await BookingConfig.findOne();
  if (!config) {
    config = await BookingConfig.create({});
  }
  return config;
};

// GET /api/bookings/config - Public/Buyer: Get admin bank details
// NOTE: Must be BEFORE /:id to prevent 'config' being matched as a booking id
router.get('/config', async (_req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bank configuration.' });
  }
});

// PUT /api/bookings/admin/config - Admin: Update bank details
// NOTE: Must be BEFORE /:id routes
router.put('/admin/config', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      bankName, accountTitle, accountNumber, iban,
      easypaisaNumber, easypaisaTitle, jazzcashNumber, jazzcashTitle,
      instructions, commissionRate
    } = req.body;

    let config = await getOrCreateConfig();
    if (bankName !== undefined) config.bankName = bankName;
    if (accountTitle !== undefined) config.accountTitle = accountTitle;
    if (accountNumber !== undefined) config.accountNumber = accountNumber;
    if (iban !== undefined) config.iban = iban;
    if (easypaisaNumber !== undefined) config.easypaisaNumber = easypaisaNumber;
    if (easypaisaTitle !== undefined) config.easypaisaTitle = easypaisaTitle;
    if (jazzcashNumber !== undefined) config.jazzcashNumber = jazzcashNumber;
    if (jazzcashTitle !== undefined) config.jazzcashTitle = jazzcashTitle;
    if (instructions !== undefined) config.instructions = instructions;
    if (commissionRate !== undefined) config.commissionRate = Number(commissionRate);

    await config.save();
    res.json({ message: 'Booking account configuration updated.', config });
  } catch (error) {
    res.status(500).json({ message: 'Error updating bank configuration.' });
  }
});

// GET /api/bookings/my-bookings - Protected (Buyer): Get buyer's bookings
// NOTE: Must be BEFORE /:id to prevent 'my-bookings' being matched as a booking id
router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ buyerId: req.user.userId })
      .populate('cattleId')
      .sort({ updatedAt: -1 })
      .lean();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings.' });
  }
});

// GET /api/bookings/admin/all - Admin: List all bookings
// NOTE: Must be BEFORE /:id to prevent 'admin' being matched as a booking id
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('cattleId')
      .populate('buyerId', 'name email phone avatar')
      .sort({ updatedAt: -1 })
      .lean();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin bookings.' });
  }
});

// PUT /api/bookings/admin/:id/approve - Admin: Approve payment & mark cattle as reserved/booked
// NOTE: Must be BEFORE /:id/messages etc. to prevent 'admin' being matched as booking id
router.put('/admin/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    booking.status = 'approved';
    if (adminNotes) booking.adminNotes = adminNotes;

    // Update Cattle status to reserved (Booked)
    const cattle = await Cattle.findById(booking.cattleId);
    if (cattle) {
      cattle.status = 'reserved';
      cattle.availability = 'Sold';
      cattle.buyerId = booking.buyerId;
      await cattle.save();
    }

    // Clear backend animal cache so marketplace updates instantly
    cattleCache.clear();

    booking.messages.push({
      sender: 'system',
      senderName: 'AgriTradeX System',
      text: '🎉 PAYMENT APPROVED! Your payment has been verified by Admin. This animal is now officially BOOKED for you!',
      createdAt: new Date(),
    });

    booking.updatedAt = new Date();
    await booking.save();

    // Notify Buyer
    await Notification.create({
      userId: booking.buyerId,
      title: 'Booking Payment Approved! 🐮',
      message: `Your payment for "${cattle?.name || 'Animal'}" has been approved by Admin! The animal is now booked.`,
      type: 'success',
    });

    res.json({ message: 'Payment approved successfully. Animal marked as booked.', booking, cattle });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ message: 'Error approving payment.' });
  }
});

// PUT /api/bookings/admin/:id/reject - Admin: Reject payment proof
router.put('/admin/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    booking.status = 'rejected';
    booking.adminNotes = reason || 'Invalid payment receipt.';

    const cattle = await Cattle.findById(booking.cattleId);

    booking.messages.push({
      sender: 'system',
      senderName: 'AgriTradeX System',
      text: `❌ PAYMENT REJECTED: ${reason || 'Receipt unverified or invalid'}. Please re-check payment details and upload a valid screenshot.`,
      createdAt: new Date(),
    });

    booking.updatedAt = new Date();
    await booking.save();

    // Notify Buyer
    await Notification.create({
      userId: booking.buyerId,
      title: 'Booking Payment Status',
      message: `Your booking payment proof for "${cattle?.name || 'Animal'}" was rejected: ${reason || 'Invalid screenshot'}.`,
      type: 'error',
    });

    res.json({ message: 'Payment rejected.', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting payment.' });
  }
});

// POST /api/bookings - Protected (Buyer): Initiate or retrieve booking chat
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { cattleId } = req.body;
    if (!cattleId) return res.status(400).json({ message: 'Cattle ID is required.' });

    const cattle = await Cattle.findById(cattleId);
    if (!cattle) return res.status(404).json({ message: 'Cattle listing not found.' });

    let booking = await Booking.findOne({ cattleId, buyerId: req.user.userId })
      .populate('cattleId')
      .populate('buyerId', 'name email phone avatar');

    if (!booking) {
      const config = await getOrCreateConfig();
      const buyer = await User.findById(req.user.userId);

      const commissionRate = config.commissionRate || 3;
      const commissionAmount = Math.ceil((cattle.price * commissionRate) / 100);

      const welcomeText =
        `Hello ${buyer?.name || 'Buyer'}! 👋 Welcome to the booking chat for "${cattle.name}".\n` +
        `\n📋 BOOKING TERMS — PLEASE READ CAREFULLY:\n` +
        `• Animal Price: PKR ${cattle.price.toLocaleString()}\n` +
        `• Platform Commission (${commissionRate}%): PKR ${commissionAmount.toLocaleString()}\n` +
        `• You only pay PKR ${commissionAmount.toLocaleString()} now to confirm your booking.\n` +
        `• The remaining balance (PKR ${(cattle.price - commissionAmount).toLocaleString()}) will be paid CASH ON DELIVERY when the animal is delivered to you.\n` +
        `\n✅ Transfer exactly PKR ${commissionAmount.toLocaleString()} to the Admin account details shown below, upload your payment receipt screenshot, and your booking will be confirmed!`;

      booking = new Booking({
        cattleId,
        buyerId: req.user.userId,
        sellerId: cattle.sellerId,
        status: 'pending',
        commissionRate,
        commissionAmount,
        animalPrice: cattle.price,
        messages: [{
          sender: 'system',
          senderName: 'AgriTradeX System',
          text: welcomeText,
          createdAt: new Date(),
        }]
      });

      await booking.save();

      booking = await Booking.findById(booking._id)
        .populate('cattleId')
        .populate('buyerId', 'name email phone avatar');
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error initiating booking.' });
  }
});

// GET /api/bookings/:id - Protected: Get single booking details & chat
// NOTE: This dynamic route must be AFTER all static routes (/config, /my-bookings, /admin/*)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('cattleId')
      .populate('buyerId', 'name email phone avatar')
      .lean();

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    // Ensure authorized (buyer or admin)
    if (booking.buyerId._id.toString() !== req.user.userId &&
        req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'vet') {
      return res.status(403).json({ message: 'Not authorized to view this booking.' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking details.' });
  }
});

// POST /api/bookings/:id/messages - Protected: Send chat message in booking session
router.post('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { text, image } = req.body;
    if (!text && !image) return res.status(400).json({ message: 'Message text or image is required.' });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.role === 'vet';
    if (!isAdmin && booking.buyerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to chat in this booking.' });
    }

    const senderRole = isAdmin ? 'admin' : 'buyer';
    const senderUser = isAdmin
      ? { name: 'AgriTradeX Admin' }
      : await User.findById(req.user.userId).select('name');

    booking.messages.push({
      sender: senderRole,
      senderId: req.user.userId,
      senderName: senderUser?.name || (isAdmin ? 'Admin' : 'Buyer'),
      text: text || '',
      image: image || undefined,
      createdAt: new Date(),
    });

    booking.updatedAt = new Date();
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message.' });
  }
});

// POST /api/bookings/:id/payment - Protected (Buyer): Upload payment screenshot
router.post('/:id/payment', authMiddleware, async (req, res) => {
  try {
    const { paymentScreenshot, paymentRef, paidAmount } = req.body;
    if (!paymentScreenshot) return res.status(400).json({ message: 'Payment screenshot image URL is required.' });

    const booking = await Booking.findById(req.params.id).populate('cattleId');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (booking.buyerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    booking.paymentScreenshot = paymentScreenshot;
    if (paymentRef) booking.paymentRef = paymentRef;
    if (paidAmount) booking.paidAmount = Number(paidAmount);
    booking.status = 'payment_submitted';

    // Add system & buyer message in chat
    const buyer = await User.findById(req.user.userId);
    booking.messages.push({
      sender: 'buyer',
      senderId: req.user.userId,
      senderName: buyer?.name || 'Buyer',
      text: paymentRef ? `Uploaded payment proof (Ref: ${paymentRef})` : 'Uploaded payment receipt screenshot.',
      image: paymentScreenshot,
      createdAt: new Date(),
    });

    booking.messages.push({
      sender: 'system',
      senderName: 'AgriTradeX System',
      text: '📸 Payment screenshot submitted successfully! Admin will verify your payment shortly.',
      createdAt: new Date(),
    });

    booking.updatedAt = new Date();
    await booking.save();

    res.json({ message: 'Payment proof submitted for verification.', booking });
  } catch (error) {
    console.error('Submit payment error:', error);
    res.status(500).json({ message: 'Error submitting payment screenshot.' });
  }
});

export default router;
