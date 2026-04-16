import mongoose from 'mongoose';

const verificationDocumentSchema = new mongoose.Schema({
  type: { type: String, enum: ['cnic', 'business_registration', 'farm_certificate', 'other'], required: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
  rejectionReason: { type: String },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  cnic: { type: String, trim: true, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'buyer', 'trader', 'vet', 'admin'], default: 'buyer' },
  location: { type: String, trim: true, default: '' },
  tehsil: { type: String, trim: true, default: '' },
  district: { type: String, trim: true, default: '' },
  province: { type: String, enum: ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'Islamabad', ''], default: '' },
  avatar: { type: String, default: '' },
  verificationStatus: { type: String, enum: ['not_submitted', 'pending', 'verified', 'rejected'], default: 'not_submitted' },
  verificationDocuments: [verificationDocumentSchema],
  verificationSubmittedAt: { type: Date },
  verificationVerifiedAt: { type: Date },
  verificationRejectedAt: { type: Date },
  verificationRejectionReason: { type: String },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cattle' }],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
  },
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ verificationStatus: 1 });
userSchema.index({ location: 'text', district: 'text', province: 'text' });

export default mongoose.model('User', userSchema);
