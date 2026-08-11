const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores']
  },
  passwordHash: {
    type: String,
    required: false
  },
  googleId: {
    type: String,
    default: null,
    unique: true,
    sparse: true
  },
  avatarUrl: {
    type: String,
    default: null
  },
  bannerUrl: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: '',
    maxlength: 280
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
