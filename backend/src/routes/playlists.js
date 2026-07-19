const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const playlistController = require('../controllers/playlist.controller');

router.get('/', auth, playlistController.getPlaylists);
router.get('/public/user/:userId', playlistController.getPublicPlaylists);
router.post('/', auth, playlistController.createPlaylist);
router.delete('/:id', auth, playlistController.deletePlaylist);

router.post('/items', auth, playlistController.addItem);
router.delete('/:playlistId/items/:tmdbId', auth, playlistController.removeItem);
router.get('/:id/items', playlistController.getItems);
router.get('/:id', playlistController.getPlaylist);

module.exports = router;
