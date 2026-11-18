import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const url = process.env.MONGODB_URL;

  if (!url) {
    throw new Error('MONGODB_URL not defined');
  }

  await mongoose.connect(url);
  console.info('MongoDB connected');
}
