import mongoose from 'mongoose';

const bookingConfigSchema = new mongoose.Schema({
  bankName: { type: String, default: 'Meezan Bank' },
  accountTitle: { type: String, default: 'AgriTradeX Livestock Marketplace' },
  accountNumber: { type: String, default: '0102-0102030405' },
  iban: { type: String, default: 'PK36MEZN0001020304050607' },
  easypaisaNumber: { type: String, default: '0300-1234567' },
  easypaisaTitle: { type: String, default: 'AgriTradeX Booking' },
  jazzcashNumber: { type: String, default: '0300-7654321' },
  jazzcashTitle: { type: String, default: 'AgriTradeX Booking' },
  commissionRate: { type: Number, default: 3, min: 0, max: 100 },
  instructions: {
    type: String,
    default: 'Please transfer the payment/advance fee to book this animal. Upload the payment receipt/screenshot in this chat for instant verification by Admin.'
  },
}, { timestamps: true });

export default mongoose.model('BookingConfig', bookingConfigSchema);
