import express from 'express';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Cattle from '../models/Cattle.js';
import auth from '../middleware/auth.js'; // Assuming auth middleware exists

const router = express.Router();

// Create Auction
router.post('/', auth, async (req, res) => {
  try {
    const { cattleId, startingPrice, startTime, endTime } = req.body;
    
    const cattle = await Cattle.findById(cattleId);
    if (!cattle) return res.status(404).json({ message: 'Cattle not found' });
    
    // Check if seller is current owner
    if (cattle.sellerId.toString() !== req.user.id && cattle.currentOwnerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const auction = new Auction({
      cattleId,
      sellerId: req.user.id,
      startingPrice,
      currentHighestBid: startingPrice,
      startTime,
      endTime
    });

    await auction.save();
    
    cattle.auctionStatus = 'active';
    cattle.availability = 'In Auction';
    await cattle.save();

    res.status(201).json(auction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bid on Auction
router.post('/:id/bid', auth, async (req, res) => {
  try {
    const { bidAmount } = req.body;
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'active') return res.status(400).json({ message: 'Auction is not active' });
    if (new Date() > new Date(auction.endTime)) return res.status(400).json({ message: 'Auction has ended' });
    if (bidAmount <= auction.currentHighestBid) return res.status(400).json({ message: 'Bid amount must be higher than current highest bid' });
    if (auction.sellerId.toString() === req.user.id) return res.status(400).json({ message: 'Seller cannot bid on their own auction' });

    const bid = new Bid({
      auctionId: auction._id,
      bidderId: req.user.id,
      bidAmount
    });

    await bid.save();

    auction.currentHighestBid = bidAmount;
    auction.highestBidderId = req.user.id;
    await auction.save();

    res.status(201).json({ message: 'Bid placed successfully', bid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Auction Details (Polling Endpoint)
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('highestBidderId', 'name').populate('cattleId');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    
    const bids = await Bid.find({ auctionId: auction._id }).sort({ bidAmount: -1 }).populate('bidderId', 'name');
    
    // Optionally auto-close if time ended
    if (auction.status === 'active' && new Date() > new Date(auction.endTime)) {
      auction.status = 'ended';
      await auction.save();
      const cattle = await Cattle.findById(auction.cattleId);
      if (cattle) {
        cattle.auctionStatus = 'ended';
        if (auction.highestBidderId) {
          cattle.availability = 'Sold';
        } else {
          cattle.availability = 'For Sale';
        }
        await cattle.save();
      }
    }

    res.json({ auction, bids });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
