import mongoose from 'mongoose';

const bookingMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['buyer', 'admin', 'system'], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String },
  text: { type: String, trim: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const bookingSchema = new mongoose.Schema({
  cattleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cattle', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'payment_submitted', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  paymentScreenshot: { type: String },
  paymentRef: { type: String, trim: true },
  paidAmount: { type: Number },
  adminNotes: { type: String, trim: true },
  messages: [bookingMessageSchema],
}, { timestamps: true });

bookingSchema.index({ buyerId: 1, createdAt: -1 });
bookingSchema.index({ cattleId: 1, buyerId: 1 });
bookingSchema.index({ status: 1 });

export default mongoose.model('Booking', bookingSchema);
