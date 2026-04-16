import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

reviewSchema.index({ reviewedId: 1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ transactionId: 1 });

export default mongoose.model('Review', reviewSchema);
