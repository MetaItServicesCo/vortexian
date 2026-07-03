#!/bin/bash
set -e

echo "================================================"
echo " Deploying vortexiantech.com"
echo "================================================"

# 1. Check Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker && systemctl start docker
fi

# 2. Ensure swap exists
if [ ! -f /swapfile ]; then
    echo "Creating 2GB swap..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 3. Generate NEXTAUTH_SECRET if still placeholder
if grep -q "REPLACE_WITH_GENERATED_SECRET" .env; then
    SECRET=$(openssl rand -base64 32)
    sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$SECRET|" .env
    echo "✅ Generated NEXTAUTH_SECRET"
fi

# 4. Build and start
echo "🔨 Building containers (5-10 min first time)..."
docker compose build

echo "🚀 Starting containers..."
docker compose up -d

# 5. Wait for things to come up
echo "⏳ Waiting 20s for services..."
sleep 20

# 6. Status
echo ""
echo "📊 Container status:"
docker compose ps

echo ""
echo "================================================"
echo "✅ Docker stack is up!"
echo "================================================"
echo ""
echo "Next steps (do manually):"
echo "  1. Copy nginx-host.conf to /etc/nginx/sites-available/vortexiantech.com"
echo "  2. ln -s /etc/nginx/sites-available/vortexiantech.com /etc/nginx/sites-enabled/"
echo "  3. nginx -t && systemctl reload nginx"
echo "  4. certbot --nginx -d vortexiantech.com -d www.vortexiantech.com"
echo ""
echo "Logs: docker compose logs -f"
