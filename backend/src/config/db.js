import mongoose from 'mongoose';

export async function connectDatabase(uri = process.env.MONGO_URI) {
  if (!uri) throw new Error('MONGO_URI is required.');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 10000),
    maxPoolSize: 10,
    autoIndex: process.env.NODE_ENV !== 'production',
  });
  return mongoose.connection;
}
