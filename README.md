# FilmedIn

A custom MERN-stack application for movie and TV enthusiasts to track their favorite media, generate wallpapers, and create custom playlists.

## Architecture
- **Frontend**: React + Vite + TailwindCSS + Shadcn UI
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: Custom JWT Authentication with Bcrypt
- **API Integration**: TMDB (The Movie Database) for media metadata

## Deployment
- **Frontend**: Hosted on Vercel
- **Backend**: Hosted on DigitalOcean Droplet
- **Database**: MongoDB

## How to Run Locally

### 1. Start the Backend
```bash
cd backend
npm install
# Create a .env with MONGODB_URI and JWT_SECRET
npm run dev
```

### 2. Start the Frontend
```bash
cd frontend
npm install
# Create a .env.local with VITE_TMDB_API_KEY
npm run dev
```
