const express = require('express');
const router = express.Router();
const { generateWallpaper } = require('../controllers/wallpaper.controller');


// Route to generate AI wallpaper
router.post('/generate', generateWallpaper);

module.exports = router;
