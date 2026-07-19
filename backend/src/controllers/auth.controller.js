const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Playlist = require('../models/Playlist');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});


const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

exports.signup = async (req, res) => {
  try {
    let { email, password, username } = req.body;
    email = String(email || '').trim();
    username = String(username || '').trim();

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

    // Create preset playlists for the new user
    await Playlist.insertMany([
      { userId: user._id, name: 'Watchlist', type: 'system' },
      { userId: user._id, name: 'Currently Watching', type: 'system' },
      { userId: user._id, name: 'Watched', type: 'system' }
    ]);

    // Generate and send OTP for 2FA/Verification
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: `FilmedIn <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: 'Your FilmedIn Verification Code',
          text: `Hello ${user.username},\n\nYour verification code is: ${otp}\n\nThis code will expire in 15 minutes. If you did not request this, please ignore this email.\n\n- The FilmedIn Team`,
        });
        console.log(`[EMAIL] Sent verification OTP via Nodemailer to ${user.email}`);
      } catch (err) {
        console.error('[EMAIL EXCEPTION]', err);
        console.log(`[DEV FALLBACK] Your verification OTP is: ${otp}`);
      }
    } else {
      console.log(`[EMAIL MOCK] Missing SMTP config. Mock verification OTP ${otp} to ${user.email}`);
    }

    res.status(201).json({ requireOtp: true, email: user.email, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = String(email || '').trim();
    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }]
    });
    if (!user) return res.status(400).json({ error: 'No account found with this email or username' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

    // Generate and send OTP for 2FA
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: `FilmedIn <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: 'Your FilmedIn Login Code',
          text: `Hello ${user.username},\n\nYour login code is: ${otp}\n\nThis code will expire in 15 minutes. If you did not request this, please ignore this email.\n\n- The FilmedIn Team`,
        });
        console.log(`[EMAIL] Sent login OTP via Nodemailer to ${user.email}`);
      } catch (err) {
        console.error('[EMAIL EXCEPTION]', err);
        console.log(`[DEV FALLBACK] Your login OTP is: ${otp}`);
      }
    } else {
      console.log(`[EMAIL MOCK] Missing SMTP config. Mock login OTP ${otp} to ${user.email}`);
    }

    res.json({ requireOtp: true, email: user.email, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = String(email || '').trim();
    otp = String(otp || '').trim();

    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }]
    });

    if (!user) return res.status(400).json({ error: 'Invalid Request' });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or Expired OTP' });
    }

    // Invalidate OTP immediately after successful verification
    user.otp = null;
    user.otpExpires = null;
    await user.save();

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
    email = String(email || '').trim();

    // Only search by email for reset flow
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(400).json({ error: 'No account found with this email address.' });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: `FilmedIn <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Your FilmedIn Password Reset Code',
          text: `Hello ${user.username},\n\nYour password reset code is: ${otp}\n\nThis code will expire in 15 minutes. If you did not request this, please ignore this email.\n\n- The FilmedIn Team`,
        });
        console.log(`[EMAIL] Sent real OTP via Nodemailer to ${email}`);
      } catch (err) {
        console.error('[EMAIL ERROR]', err);
        return res.status(500).json({ error: 'Server error while sending email' });
      }
    } else {
      console.log(`[EMAIL MOCK] Missing SMTP config. Mock OTP ${otp} to ${email}`);
    }

    res.json({ success: true, message: 'OTP Sent', username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while sending email' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = String(email || '').trim();
    otp = String(otp || '').trim();
    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }]
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
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (isMatch) {
      return res.status(400).json({ error: 'New password cannot be the same as the old password' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

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
