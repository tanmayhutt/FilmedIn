const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const playlistController = require('../controllers/playlist.controller');

router.get('/', auth, playlistController.getPlaylists);
router.post('/', auth, playlistController.createPlaylist);
router.delete('/:id', auth, playlistController.deletePlaylist);

router.post('/items', auth, playlistController.addItem);
router.get('/:id/items', auth, playlistController.getItems);
router.get('/:id', auth, playlistController.getPlaylist);

module.exports = router;
