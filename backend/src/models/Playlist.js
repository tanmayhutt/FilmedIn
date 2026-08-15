const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['system', 'custom'],
    default: 'custom'
  }
}, { timestamps: true });

playlistSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Playlist', playlistSchema);
