import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  cattleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cattle', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled', 'disputed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'easypaisa', 'jazzcash', 'other'], default: 'cash' },
  deliveryAddress: { type: String },
  deliveryStatus: { type: String, enum: ['pending', 'in_transit', 'delivered'], default: 'pending' },
  notes: { type: String },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
}, { timestamps: true });

transactionSchema.index({ sellerId: 1, status: 1 });
transactionSchema.index({ buyerId: 1, status: 1 });
transactionSchema.index({ cattleId: 1 });

export default mongoose.model('Transaction', transactionSchema);
