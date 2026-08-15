const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const playlistController = require('../controllers/playlist.controller');

for (const paramName of ['id', 'playlistId', 'userId']) {
  router.param(paramName, (req, res, next, value) => {
    if (!mongoose.isValidObjectId(value)) return res.status(400).json({ error: `Invalid ${paramName}` });
    next();
  });
}

router.get('/', auth, playlistController.getPlaylists);
router.get('/saved-ids', auth, playlistController.getSavedIds);
router.get('/blend/:username', auth, playlistController.getTasteBlend);
router.get('/public/user/:userId', auth, playlistController.getPublicPlaylists);
router.post('/', auth, playlistController.createPlaylist);
router.delete('/:id', auth, playlistController.deletePlaylist);

router.post('/items', auth, playlistController.addItem);
router.delete('/:playlistId/items/:tmdbId', auth, playlistController.removeItem);
router.get('/:id/items', auth, playlistController.getItems);
router.get('/:id', auth, playlistController.getPlaylist);

module.exports = router;
