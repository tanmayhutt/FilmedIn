const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ email, username, passwordHash });
    await user.save();

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, email: user.email, username: user.username, avatarUrl: user.avatarUrl } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'No user with this email' });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    // Mock sending email via Nodemailer
    console.log(`[EMAIL MOCK] Sending OTP ${otp} to ${email}`);
    
    // In production, configure nodemailer SMTP here:
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({ from: '...', to: email, subject: 'Your FilmedIn OTP', text: `Your code is ${otp}` });

    res.json({ success: true, message: 'OTP Sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid Request' });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or Expired OTP' });
    }

    // OTP matches! Generate a temporary token to allow resetting password
    const payload = { user: { id: user.id, canResetPassword: true } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password
const auth = require('../middleware/auth');
router.post('/reset-password', auth, async (req, res) => {
  try {
    if (!req.user.canResetPassword) return res.status(401).json({ error: 'Unauthorized' });
    
    const { password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.findById(req.user.id);
    user.passwordHash = passwordHash;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
