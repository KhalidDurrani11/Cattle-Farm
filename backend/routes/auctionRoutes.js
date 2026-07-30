import express from 'express';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Cattle from '../models/Cattle.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create Auction
router.post('/', auth, async (req, res) => {
  try {
    const { cattleId, startingPrice, startTime, endTime } = req.body;

    if (!cattleId || !startingPrice || !endTime) {
      return res.status(400).json({ message: 'cattleId, startingPrice, and endTime are required' });
    }

    const cattle = await Cattle.findById(cattleId);
    if (!cattle) return res.status(404).json({ message: 'Cattle not found' });

    // JWT stores userId (not id) — this was the core auth bug
    const requesterId = req.user.userId;
    if (cattle.sellerId.toString() !== requesterId) {
      return res.status(403).json({ message: 'Not authorized: you do not own this cattle' });
    }

    // Prevent duplicate active auctions
    const existingAuction = await Auction.findOne({ cattleId, status: 'active' });
    if (existingAuction) {
      return res.status(400).json({ message: 'An active auction already exists for this cattle' });
    }

    const auction = new Auction({
      cattleId,
      sellerId: requesterId,
      startingPrice,
      currentHighestBid: 0,
      startTime: startTime || new Date(),
      endTime,
    });

    await auction.save();

    cattle.auctionStatus = 'active';
    cattle.availability = 'In Auction';
    await cattle.save();

    res.status(201).json({ auction, message: 'Auction started successfully' });
  } catch (err) {
    console.error('Create auction error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Auction by Cattle ID — so frontend can load the auction for a cattle listing
router.get('/by-cattle/:cattleId', async (req, res) => {
  try {
    const auction = await Auction.findOne({ cattleId: req.params.cattleId, status: 'active' });
    if (!auction) return res.status(404).json({ message: 'No active auction for this cattle' });
    const bids = await Bid.find({ auctionId: auction._id }).sort({ bidAmount: -1 }).limit(10).populate('bidderId', 'name');
    res.json({ auction, bids });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bid on Auction
router.post('/:id/bid', auth, async (req, res) => {
  try {
    const { bidAmount } = req.body;
    if (!bidAmount || isNaN(bidAmount)) {
      return res.status(400).json({ message: 'A valid bid amount is required' });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'active') return res.status(400).json({ message: 'Auction is not active' });
    if (new Date() > new Date(auction.endTime)) return res.status(400).json({ message: 'Auction has ended' });

    const requesterId = req.user.userId;
    if (auction.sellerId.toString() === requesterId) {
      return res.status(400).json({ message: 'Seller cannot bid on their own auction' });
    }

    const minBid = auction.currentHighestBid > 0 ? auction.currentHighestBid : auction.startingPrice;
    if (Number(bidAmount) <= minBid) {
      return res.status(400).json({ message: `Bid must be higher than Rs. ${minBid.toLocaleString()}` });
    }

    const bid = new Bid({
      auctionId: auction._id,
      bidderId: requesterId,
      bidAmount: Number(bidAmount),
    });

    await bid.save();
    auction.currentHighestBid = Number(bidAmount);
    auction.highestBidderId = requesterId;
    await auction.save();

    res.status(201).json({ message: 'Bid placed successfully', bid, auction });
  } catch (err) {
    console.error('Bid error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Auction Details by Auction ID (Polling Endpoint)
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('highestBidderId', 'name')
      .populate('cattleId');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    const bids = await Bid.find({ auctionId: auction._id })
      .sort({ bidAmount: -1 })
      .populate('bidderId', 'name');

    // Auto-close if time ended
    if (auction.status === 'active' && new Date() > new Date(auction.endTime)) {
      auction.status = 'ended';
      await auction.save();
      const cattle = await Cattle.findById(auction.cattleId);
      if (cattle) {
        cattle.auctionStatus = 'ended';
        cattle.availability = auction.highestBidderId ? 'Sold' : 'For Sale';
        await cattle.save();
      }
    }

    res.json({ auction, bids });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
