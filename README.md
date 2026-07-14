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

## How to Run (Docker)

The fastest and easiest way to spin up the entire application (MongoDB, Node.js Backend, and React Frontend) is using Docker.

1. Ensure Docker and Docker Compose are installed on your machine or Droplet.
2. In the root directory of the project, create a `.env` file with your TMDB key:
   ```bash
   VITE_TMDB_API_KEY=your_key_here
   ```
3. Run Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

- The **Frontend** will be running at `http://localhost:3000`
- The **Backend API** will be running at `http://localhost:5000`
- The **MongoDB** instance is running at `mongodb://localhost:27017`

*Note: If you are deploying on a DigitalOcean droplet, pass your droplet IP in the `.env` file so the frontend knows where to look:*
```bash
VITE_API_URL=http://YOUR_DROPLET_IP:5000/api
```
