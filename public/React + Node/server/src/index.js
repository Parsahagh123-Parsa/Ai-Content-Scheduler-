import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || '';

async function start() {
  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI);
      console.log('MongoDB connected');
    } else {
      console.warn('MONGO_URI not set - skipping DB connect');
    }
    app.listen(PORT, () => console.log(`Server running on :${PORT}`));
  } catch (err) {
    console.error('Server start error', err);
    process.exit(1);
  }
}

start();
