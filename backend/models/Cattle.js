import mongoose from 'mongoose';

const vaccinationRecordSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  nextDue: { type: Date },
  veterinarian: { type: String },
  certificateUrl: { type: String },
}, { _id: false });

const verificationSchema = new mongoose.Schema({
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['not_submitted', 'pending', 'verified', 'rejected'], default: 'not_submitted' },
  submittedAt: { type: Date },
  verifiedAt: { type: Date },
  veterinarianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  healthScore: { type: Number, min: 0, max: 100 },
  vaccinationRecords: [vaccinationRecordSchema],
  rejectionReason: { type: String },
  notes: { type: String },
}, { _id: false });

const cattleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  breed: { type: String, required: true, trim: true },
  category: { type: String, enum: ['Bull', 'Cow', 'Calf', 'Buffalo', 'Goat', 'Sheep', 'Other'], default: 'Bull' },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  age: { type: String, required: true },
  weight: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  location: { type: String, required: true, trim: true },
  tehsil: { type: String, trim: true, default: '' },
  district: { type: String, trim: true, default: '' },
  province: { type: String, enum: ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'Islamabad', ''], default: '' },
  description: { type: String, trim: true, default: '' },
  images: [{ type: String }],
  status: { type: String, enum: ['available', 'sold', 'reserved', 'pending', 'unavailable'], default: 'available' },
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  soldAt: { type: Date },
  soldPrice: { type: Number },
  verification: { type: verificationSchema, default: () => ({}) },
  healthNotes: { type: String, trim: true },
  tags: [{ type: String }],
}, { timestamps: true });

cattleSchema.index({ status: 1, createdAt: -1 });
cattleSchema.index({ sellerId: 1, status: 1 });
cattleSchema.index({ category: 1, breed: 1 });
cattleSchema.index({ price: 1 });
cattleSchema.index({ location: 'text', district: 'text', description: 'text' });
cattleSchema.index({ 'verification.status': 1 });
cattleSchema.index({ isFeatured: 1 });

export default mongoose.model('Cattle', cattleSchema);
