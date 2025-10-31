import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
