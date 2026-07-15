<div align="center">
  <h1>🍿 FilmedIn</h1>
  <p>A custom MERN-stack application for movie and TV enthusiasts to track their favorite media, generate wallpapers, and create custom playlists.</p>
</div>

---

## ⚡ Architecture

- **Frontend**: React + Vite + TailwindCSS + Shadcn UI
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas (Cloud)
- **Storage**: Cloudinary (for avatars and media uploads)
- **Authentication**: Custom JWT Authentication with Bcrypt
- **API Integration**: TMDB (The Movie Database) for media metadata

## 🚀 Deployment & Infrastructure

The application uses a modern distributed architecture:

1. **Frontend Hosting (Vercel)**
   - The React frontend is deployed and served globally via Vercel.
   - Vercel also acts as a secure Reverse Proxy (`vercel.json`), routing API calls to the backend droplet to prevent Mixed Content (HTTP/HTTPS) errors and hide the backend IP.

2. **Backend Engine (DigitalOcean Droplet)**
   - Runs a lightweight Docker Compose setup containing the Node.js API.
   - Fully stateless (MongoDB and Cloudinary handle all state/storage).
   - Hardened with Helmet, CORS whitelisting, and rate limiting.

3. **CI/CD Pipeline (GitHub Actions)**
   - Pushing to the `main` branch automatically triggers a deployment workflow.
   - The workflow securely SSHs into the Droplet, pulls the latest code, and rebuilds the containers with zero manual intervention.

## 🛠️ Local Development

### 1. Prerequisites
- Docker and Docker Compose
- A TMDB API Key
- Cloudinary Credentials
- MongoDB Atlas URI

### 2. Environment Variables
Create a `.env` file in the root directory:
```bash
VITE_TMDB_API_KEY=your_tmdb_key
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
MONGODB_URI=your_mongodb_atlas_uri
ALLOWED_ORIGINS=http://localhost:3001,https://your-domain.com
```

### 3. Run Locally
Use Docker Compose to spin up the local development environment:
```bash
docker compose up -d --build
```

- **Frontend**: `http://localhost:3001`
- **Backend API**: `http://localhost:5000`

---
*Built with ❤️ for movie lovers.*
