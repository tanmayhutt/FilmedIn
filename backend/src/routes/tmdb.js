const express = require('express');
const router = express.Router();
const tmdbController = require('../controllers/tmdb.controller');

router.get('/trending/movie', tmdbController.getTrendingMovies);
router.get('/trending/tv', tmdbController.getTrendingTV);
router.get('/search', tmdbController.searchMedia);
router.get('/movie/:id', tmdbController.getMovieDetails);
router.get('/tv/:id', tmdbController.getTVDetails);

module.exports = router;
