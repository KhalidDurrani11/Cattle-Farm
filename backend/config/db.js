import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI starts with:', process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 30) + '...' : 'NOT SET');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    // Throw instead of process.exit so the server can handle it
    throw error;
  }
};

export default connectDB;
