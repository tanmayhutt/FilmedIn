const Playlist = require('../models/Playlist');
const PlaylistItem = require('../models/PlaylistItem');

exports.getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    for (let pl of playlists) {
      const count = await PlaylistItem.countDocuments({ playlistId: pl._id });
      pl.playlist_items = [{ count }];
      pl.id = pl._id.toString();
    }
    res.json(playlists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const newPlaylist = new Playlist({ userId: req.user.id, name, type: 'custom' });
    await newPlaylist.save();
    
    const plObj = newPlaylist.toObject();
    plObj.id = plObj._id.toString();
    plObj.playlist_items = [{ count: 0 }];

    res.status(201).json(plObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user.id) return res.status(401).json({ error: 'Unauthorized' });

    await PlaylistItem.deleteMany({ playlistId: req.params.id });
    await playlist.deleteOne();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { playlistId, tmdbId, mediaType } = req.body;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId.toString() !== req.user.id) return res.status(401).json({ error: 'Unauthorized' });

    const newItem = new PlaylistItem({ playlistId, tmdbId, mediaType });
    await newItem.save();
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Item already exists in playlist' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await PlaylistItem.find({ playlistId: req.params.id }).sort({ createdAt: -1 });
    const formatted = items.map(i => ({ ...i.toObject(), id: i._id.toString(), tmdb_id: i.tmdbId, media_type: i.mediaType }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    
    const formatted = playlist.toObject();
    formatted.id = formatted._id.toString();
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
