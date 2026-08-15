const mongoose = require('mongoose');

const playlistItemSchema = new mongoose.Schema({
  playlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: true
  },
  tmdbId: {
    type: Number,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['movie', 'tv'],
    required: true
  }
}, { timestamps: true });

// Prevent duplicate items in the same playlist
playlistItemSchema.index({ playlistId: 1, tmdbId: 1, mediaType: 1 }, { unique: true });
playlistItemSchema.index({ playlistId: 1, createdAt: -1 });

module.exports = mongoose.model('PlaylistItem', playlistItemSchema);
