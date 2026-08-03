require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const path     = require('path');

const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/users');
const playlistRoutes  = require('./routes/playlists');
const tmdbRoutes      = require('./routes/tmdb');
const wallpaperRoutes = require('./routes/wallpaper.routes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Trust Proxy ──────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ─── NoSQL Injection Sanitizer ────────────────────────────────────────────────
const sanitizeNoSql = (obj) => {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (key.startsWith('$')) { delete obj[key]; }
      else { sanitizeNoSql(obj[key]); }
    }
  }
};
app.use((req, res, next) => {
  if (req.body)   sanitizeNoSql(req.body);
  if (req.params) sanitizeNoSql(req.params);
  if (req.query)  sanitizeNoSql(req.query);
  next();
});

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    console.error(`[CORS REJECTED] Origin: '${origin}'`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── Body Limit ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '4mb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20, standardHeaders: true, legacyHeaders: false });
const apiLimiter  = rateLimit({ windowMs: 15*60*1000, max: 2000, standardHeaders: true, legacyHeaders: false });

// ─── MongoDB — connection cached for serverless cold starts ───────────────────
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log('Connected to MongoDB Atlas');
}
connectDB().catch(err => console.error('MongoDB connection error:', err));

// ─── Health Check (uptime ping endpoint) ──────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',       authLimiter, authRoutes);
app.use('/api/users',      apiLimiter,  userRoutes);
app.use('/api/playlists',  apiLimiter,  playlistRoutes);
app.use('/api/tmdb',       apiLimiter,  tmdbRoutes);
app.use('/api/wallpapers', apiLimiter,  wallpaperRoutes);

// ─── Static Frontend (only in local/Render mode, not on Vercel) ───────────────
if (process.env.SERVE_STATIC === 'true') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start server only when run directly (not when imported by Vercel) ────────
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
