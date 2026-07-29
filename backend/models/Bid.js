import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bidAmount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Bid', bidSchema);
