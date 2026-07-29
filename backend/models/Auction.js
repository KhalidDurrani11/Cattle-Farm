import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  cattleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cattle', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startingPrice: { type: Number, required: true },
  currentHighestBid: { type: Number, default: 0 },
  highestBidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['active', 'ended', 'cancelled'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('Auction', auctionSchema);
