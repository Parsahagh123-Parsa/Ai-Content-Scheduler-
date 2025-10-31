import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const isAkronEmail = (email) => email?.toLowerCase().endsWith('@uakron.edu');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!isAkronEmail(email)) return res.status(400).json({ error: 'Email must be @uakron.edu' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await User.create({ name, email, passwordHash, isVerified: false, verificationCode });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `Akron Marketplace <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Akron Marketplace verification code',
        text: `Your verification code is: ${verificationCode}`,
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function verify(req, res) {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (user.verificationCode !== code) return res.status(400).json({ error: 'Invalid code' });

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    return res.json({ verified: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ error: 'Email not verified' });

    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
