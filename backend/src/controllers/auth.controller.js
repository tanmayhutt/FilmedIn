const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
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
      $or: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }]
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
    
    // Only search by email for reset flow
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) return res.status(400).json({ error: 'No account found with this email address.' });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const { data, error } = await resend.emails.send({
        from: 'FilmedIn <onboarding@resend.dev>',
        to: email,
        subject: 'Your FilmedIn Password Reset Code',
        text: `Hello ${user.username},\n\nYour password reset code is: ${otp}\n\nThis code will expire in 15 minutes. If you did not request this, please ignore this email.\n\n- The FilmedIn Team`,
      });

      if (error) {
        console.error('[EMAIL ERROR]', error);
        return res.status(500).json({ error: 'Server error while sending email' });
      }

      console.log(`[EMAIL] Sent real OTP via Resend to ${email}`);
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
    email = (email || '').trim();
    otp = (otp || '').trim();
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
