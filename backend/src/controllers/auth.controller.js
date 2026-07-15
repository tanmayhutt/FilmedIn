const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

exports.signup = async (req, res) => {
  try {
    let { email, password, username } = req.body;
    email = (email || '').trim();
    username = (username || '').trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!username || username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
    }

    let user = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (user) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      return res.status(400).json({ error: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ email, username, passwordHash });
    await user.save();

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = (email || '').trim();
    const user = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: email }]
    });
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
};

exports.sendOtp = async (req, res) => {
  try {
    let { email } = req.body;
    email = (email || '').trim();
    const user = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: email }]
    });
    if (!user) return res.status(400).json({ error: 'No user with this email' });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    console.log(`[EMAIL MOCK] Sending OTP ${otp} to ${email}`);
    res.json({ success: true, message: 'OTP Sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = (email || '').trim();
    otp = (otp || '').trim();
    const user = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: email }]
    });
    if (!user) return res.status(400).json({ error: 'Invalid Request' });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or Expired OTP' });
    }

    // Invalidate OTP immediately after successful verification to prevent replay attacks
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const payload = { user: { id: user.id, canResetPassword: true } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    if (!req.user.canResetPassword) return res.status(401).json({ error: 'Unauthorized' });
    
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
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
};
