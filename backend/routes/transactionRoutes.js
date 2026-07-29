import express from 'express';
import Cattle from '../models/Cattle.js';
import OwnershipHistory from '../models/OwnershipHistory.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Offline Payment - Confirm Transaction
router.post('/offline-payment', auth, async (req, res) => {
  try {
    const { cattleId, amount, transactionNotes } = req.body;
    
    const cattle = await Cattle.findById(cattleId);
    if (!cattle) return res.status(404).json({ message: 'Cattle not found' });
    
    // Check if seller is current owner
    if (cattle.sellerId.toString() !== req.user.id && cattle.currentOwnerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to sell this cattle' });
    }

    // In a real app, you would specify the buyer. For simplicity, we expect buyerId in body.
    const { buyerId } = req.body;
    if (!buyerId) return res.status(400).json({ message: 'Buyer ID is required' });

    // Update Cattle
    const previousOwnerId = cattle.currentOwnerId || cattle.sellerId;
    cattle.buyerId = buyerId;
    cattle.currentOwnerId = buyerId;
    cattle.availability = 'Sold';
    cattle.status = 'sold';
    cattle.soldAt = new Date();
    cattle.soldPrice = amount;
    
    await cattle.save();

    // Create Ownership History
    const history = new OwnershipHistory({
      cattleId: cattle._id,
      previousOwnerId: previousOwnerId,
      newOwnerId: buyerId,
      transactionId: `OFFLINE-${Date.now()}`
    });
    
    await history.save();

    res.json({ message: 'Offline payment recorded successfully', cattle, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
