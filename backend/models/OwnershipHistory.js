import mongoose from 'mongoose';

const ownershipHistorySchema = new mongoose.Schema({
  cattleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cattle', required: true },
  previousOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  newOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String },
  transferDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('OwnershipHistory', ownershipHistorySchema);
