#!/bin/bash
# ============================================
# FilmedIn — Nginx & SSL Setup Script
# ============================================

set -e

echo "========================================"
echo "  FilmedIn — Nginx & SSL Setup"
echo "========================================"

echo -e "\n[1/4] Installing Nginx and Certbot..."
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

echo -e "\n[2/4] Configuring Nginx..."
cat << 'EOF' | sudo tee /etc/nginx/sites-available/filmedin
server {
    listen 80;
    server_name filmedin.tanmaytiwari.me;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.filmedin.tanmaytiwari.me;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site and restart Nginx
sudo ln -sf /etc/nginx/sites-available/filmedin /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
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
