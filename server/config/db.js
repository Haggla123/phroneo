import mongoose from 'mongoose';

export function requireMongoUri(env = process.env) {
  const uri = env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI must be configured before starting the API.');
  return uri;
}

export const connectDB = async () => {
  const uri = requireMongoUri();
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch {
    throw new Error('MongoDB connection failed. Check MONGODB_URI and database availability.');
  }
};
