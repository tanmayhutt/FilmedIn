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
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');

// ─── Trust Proxy ──────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  // Google Identity Services completes sign-in through a popup/iframe that
  // must be able to communicate with the opener. Helmet's default
  // `same-origin` policy blocks that exchange in production.
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// ─── NoSQL Injection Sanitizer ────────────────────────────────────────────────
const sanitizeNoSql = (obj) => {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (key.startsWith('$')) { delete obj[key]; }
      else { sanitizeNoSql(obj[key]); }
    }
  }
};
// Express 5 re-parses req.query on every read and its simple parser never builds nested
// objects, so only the JSON body can carry operator keys.
app.use((req, res, next) => {
  if (req.body) sanitizeNoSql(req.body);
  next();
});

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') console.log(`[${req.method}] ${req.url}`);
  next();
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) ||
        (!isProduction && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')))) {
      return callback(null, true);
    }
    console.error(`[CORS REJECTED] Origin: '${origin}'`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ─── Body Limit ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiterOptions = (windowMs, max, error) => ({
  windowMs, max, standardHeaders: true, legacyHeaders: false, message: { error },
});
const authLimiter = rateLimit(limiterOptions(15*60*1000, 20, 'Too many sign-in attempts. Please wait a few minutes and try again.'));
const apiLimiter  = rateLimit(limiterOptions(15*60*1000, 2000, 'Too many requests. Please slow down and try again shortly.'));
// Every style or theme change renders a new preview, so the hourly budget must cover normal browsing.
const wallpaperLimiter = rateLimit(limiterOptions(60*60*1000, 60, 'Wallpaper limit reached. Please try again later this hour.'));

// ─── MongoDB — connection cached for serverless cold starts ───────────────────
let connectionPromise;
async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    })
      .then(() => {
        console.log('Connected to MongoDB Atlas');
        return mongoose.connection;
      })
      .catch(err => {
        connectionPromise = undefined;
        throw err;
      });
  }

  return connectionPromise;
}
connectDB().catch(err => console.error('MongoDB connection error:', err.message));

// ─── Health Check (uptime ping endpoint) ──────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Health check database error:', err.message);
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',       authLimiter, authRoutes);
app.use('/api/users',      apiLimiter,  userRoutes);
app.use('/api/playlists',  apiLimiter,  playlistRoutes);
app.use('/api/tmdb',       apiLimiter,  tmdbRoutes);
app.use('/api/wallpapers', wallpaperLimiter, apiLimiter, wallpaperRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ─── Static Frontend (SERVE_STATIC mode in Docker / production) ───────────────
if (process.env.SERVE_STATIC === 'true') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  // Vite assets are content-hashed, so they can be cached permanently.
  app.use('/assets', express.static(path.join(frontendDist, 'assets'), { immutable: true, maxAge: '1y', fallthrough: false }));
  app.use(express.static(frontendDist, { index: false }));
  app.get('/{*splat}', (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // A stale tab can request an asset hash that no longer exists after a deploy.
  if (err.status === 404 || err.statusCode === 404) return res.status(404).end();
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body must be valid JSON' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body is too large' });
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Image must be 5 MB or smaller' });
  if (err.message?.includes('Only JPG')) return res.status(415).json({ error: err.message });
  if (err.message === 'Not allowed by CORS') return res.status(403).json({ error: 'Origin is not allowed' });
  console.error(isProduction ? err.message : err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
