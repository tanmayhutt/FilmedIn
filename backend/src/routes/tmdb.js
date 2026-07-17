const express = require('express');
const router = express.Router();
const tmdbController = require('../controllers/tmdb.controller');

router.get('/trending/movie', tmdbController.getTrendingMovies);
router.get('/trending/tv', tmdbController.getTrendingTV);
router.get('/search', tmdbController.searchMedia);
router.get('/movie/:id', tmdbController.getMovieDetails);
router.get('/tv/:id/season/:season', tmdbController.getSeasonDetails);
router.get('/tv/:id', tmdbController.getTVDetails);
router.get('/discover', tmdbController.getByGenre);
router.get('/genres', tmdbController.getGenres);
router.get('/company', tmdbController.getByCompany);
router.get('/network', tmdbController.getByNetwork);

module.exports = router;
