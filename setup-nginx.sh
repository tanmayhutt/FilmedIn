#!/bin/bash
# ============================================
# FilmedIn — Enterprise Nginx & SSL Setup
# ============================================

set -e

echo "========================================"
echo "  FilmedIn — Nginx & SSL Setup"
echo "========================================"

echo -e "\n[1/4] Installing Nginx and Certbot..."
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

echo -e "\n[2/4] Configuring Nginx Security & Performance..."
cat << 'EOF' | sudo tee /etc/nginx/sites-available/filmedin
# API Rate Limiting Zone (10 requests per second per IP)
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    listen 80;
    server_name filmedin.tanmaytiwari.me;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static Asset Caching (Frontend)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}

server {
    listen 80;
    server_name api.filmedin.tanmaytiwari.me;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        # Apply Rate Limiting (Burst 20, nodelay)
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site and restart Nginx
sudo ln -sf /etc/nginx/sites-available/filmedin /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo -e "\n[3/4] Obtaining Free SSL Certificates via Certbot..."
# Run certbot for both domains
sudo certbot --nginx -d filmedin.tanmaytiwari.me -d api.filmedin.tanmaytiwari.me --non-interactive --agree-tos -m tiwaritanmay1021@gmail.com --redirect

echo -e "\n[4/4] Restarting Nginx to apply SSL..."
sudo systemctl restart nginx

echo "========================================"
echo "✅ Nginx and SSL Setup Complete!"
echo "Frontend: https://filmedin.tanmaytiwari.me"
echo "API:      https://api.filmedin.tanmaytiwari.me"
echo "========================================"
