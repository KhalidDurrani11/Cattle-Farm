import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  cattleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cattle', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true },
  response: { type: String, trim: true },
  respondedAt: { type: Date },
  status: { type: String, enum: ['pending', 'responded', 'closed'], default: 'pending' },
}, { timestamps: true });

inquirySchema.index({ sellerId: 1, status: 1 });
inquirySchema.index({ buyerId: 1 });
inquirySchema.index({ cattleId: 1 });

export default mongoose.model('Inquiry', inquirySchema);
