<div align="center">
  <h1>FilmedIn</h1>
  <p>A MERN-stack application for movie and TV enthusiasts to track their favorite media, generate wallpapers, and create custom playlists.</p>
</div>

---

## Architecture

- **Frontend**: React + Vite + TailwindCSS + Shadcn UI
- **Backend**: Node.js + Express (serving React SPA & `/api` in container)
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary (avatars and media uploads)
- **Authentication**: JWT + Google OAuth
- **API Integration**: TMDB (The Movie Database)
- **Hosting**: Docker container + Caddy reverse proxy on Ubuntu (`15.206.247.203`)

## Deployment

The app is deployed on a self-hosted Ubuntu server:
- **Live URL**: `https://filmedin.tanmaytiwari.me`

```
filmedin.tanmaytiwari.me
        │
        ▼ (HTTPS / 443 via Caddy)
127.0.0.1:5050 (Docker: filmedin-app)
        │
        ├── /api/*   → Express REST API (/api/auth, /api/users, /api/playlists, /api/tmdb, etc.)
        │
        └── /*       → React SPA (Vite static build served by Express)
```

Automatic CI/CD is configured via **GitHub Actions** (`.github/workflows/deploy.yml`). On every push to `main`, the workflow connects to the server, pulls the commit, builds the Docker image, verifies container health, and verifies the public HTTPS endpoint with automatic rollback on failure.

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
