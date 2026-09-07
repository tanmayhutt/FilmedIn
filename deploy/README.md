# Ubuntu deployment

Project directory: `/home/ubuntu/tanmay/FilmedIn` on `ubuntu@15.206.247.203`.

The Docker image builds React and serves it with the Express API. Caddy terminates HTTPS and forwards requests to loopback port 5050. MongoDB Atlas, Cloudinary, TMDB, and Google remain external services.

Provision `.env` in the project directory with the existing production credentials and mode 600. Never include it in the image or Git. Compose sets the production runtime flags and allowed origin.

Run `docker compose up -d --build` from the project directory. Inspect `docker compose ps` and `curl -f http://127.0.0.1:5050/health` before changing DNS.

Import this directory's Caddyfile from the host Caddy configuration, validate the combined configuration, and reload Caddy. Preserve existing host sites. Point only `filmedin.tanmaytiwari.me` to `15.206.247.203`, replacing its Vercel CNAME. Ensure ports 80 and 443 are reachable. Caddy provisions HTTPS after DNS points here.

The domain and Google client ID remain unchanged. Google login requires HTTPS and must be verified after the DNS switch. Keep Vercel available until the new deployment is verified. Git pushes alone do not update this server; upload updated source and run the Compose build command.
