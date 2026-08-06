<div align="center">
  <h1>FilmedIn</h1>
  <p>A MERN-stack application for movie and TV enthusiasts to track their favorite media, generate wallpapers, and create custom playlists.</p>
</div>

---

## Architecture

- **Frontend**: React + Vite + TailwindCSS + Shadcn UI
- **Backend**: Node.js + Express (serverless on Vercel)
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary (avatars and media uploads)
- **Authentication**: JWT + Google OAuth
- **API Integration**: TMDB (The Movie Database)

## Deployment

The entire app (frontend + backend) is deployed as a **single Vercel project** at:
- `https://filmedin.tanmaytiwari.me` *(custom domain)*
- `https://filmedin.vercel.app` *(Vercel default)*

```
filmedin.tanmaytiwari.me
        │
        ├── /api/*   → Express serverless function (api/index.js)
        │               Routes: /api/auth, /api/users, /api/playlists,
        │                       /api/tmdb, /api/wallpapers
        │
        └── /*       → React SPA (Vite build, served as static files)
```

Vercel handles HTTPS, global CDN, and zero-config CI/CD on every `git push`.

### Production Configuration Notes
- **DNS (Cloudflare):** Ensure the Cloudflare proxy (orange cloud) is set to **"DNS only"**. If proxying is enabled, Vercel will trigger a "Proxy Detected" warning, which interferes with SSL certificate generation and DDoS protection.
- **Serverless Keep-Alive:** A cron job is configured via `cron-job.org` to ping the `/health` endpoint every 5 minutes. This prevents Vercel's serverless containers from going to sleep, eliminating "Cold Start" delays for end users.

## Local Development

### Prerequisites
- Node.js >= 18
- A TMDB API Key
- Cloudinary credentials
- MongoDB Atlas URI
- Google OAuth credentials

### 1. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Variables

**Backend** — create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
TMDB_API_KEY=your_tmdb_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ALLOWED_ORIGINS=http://localhost:5173
PORT=5000
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Locally
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

*Built with passion for movie lovers.*
