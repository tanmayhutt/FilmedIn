require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes     = require('./routes/auth');
const userRoutes     = require('./routes/users');
const playlistRoutes = require('./routes/playlists');
const tmdbRoutes     = require('./routes/tmdb');
const wallpaperRoutes = require('./routes/wallpaper.routes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Trust Proxy (Vercel/Cloudflare) ──────────────────────────────────────────
app.set('trust proxy', 1);

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and explicitly allowed origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── Body Limit ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 requests per window per IP
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Database ─────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/users',     apiLimiter,  userRoutes);
app.use('/api/playlists', apiLimiter,  playlistRoutes);
app.use('/api/tmdb',      apiLimiter,  tmdbRoutes);
app.use('/api/wallpapers', apiLimiter,  wallpaperRoutes);

app.get('/', (req, res) => res.send('FilmedIn API is running'));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
