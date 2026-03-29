#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# BrighterNepal — Full VPS deployment script (Cloudflare + Origin Certificate)
# Target: Ubuntu 22.04 / 24.04 — 4 vCPU / 8 GB RAM
# Server: brighternepal.com (163.47.151.249)
#
# Prerequisites:
#   - Domain DNS on Cloudflare pointed to 163.47.151.249
#   - Cloudflare Origin Certificate created (see step 10 below)
#
# Usage:
#   1. SSH into your VPS:  ssh root@163.47.151.249
#   2. Run:  bash <(curl -s https://raw.githubusercontent.com/bishalregmi105B/brighter-nepal/main/deploy/setup-server.sh)
#   OR: git clone the repos first, then run this script
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_USER="brighternepal"
APP_DIR="/opt/brighternepal"
DOMAIN="brighternepal.com"

echo "═══════════════════════════════════════════════════════════"
echo "  BrighterNepal VPS Deployment — $DOMAIN"
echo "═══════════════════════════════════════════════════════════"

# ── 1. System packages ──────────────────────────────────────────────────────
echo "[1/10] Installing system packages..."
apt-get update -qq
apt-get install -y -qq \
    nginx \
    postgresql postgresql-contrib \
    redis-server \
    python3 python3-pip python3-venv \
    poppler-utils \
    curl git ufw fail2ban \
    > /dev/null

# Install Node.js 20 LTS
if ! command -v node &>/dev/null || [[ "$(node -v)" != v20* ]]; then
    echo "    Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt-get install -y -qq nodejs > /dev/null
fi

echo "    Node $(node -v) | npm $(npm -v) | Python $(python3 --version | awk '{print $2}')"

# ── 2. Create app user ──────────────────────────────────────────────────────
echo "[2/10] Setting up app user..."
if ! id "$APP_USER" &>/dev/null; then
    useradd --system --create-home --home-dir "$APP_DIR" --shell /bin/bash "$APP_USER"
fi
mkdir -p "$APP_DIR"

# ── 3. Clone application code ────────────────────────────────────────────────
echo "[3/10] Cloning application code from GitHub..."
GITHUB_USER="bishalregmi105B"

for project in brighter-nepal brighter-nepal-api brighter-nepal-chat; do
    if [ -d "$APP_DIR/$project/.git" ]; then
        echo "    $project — pulling latest..."
        cd "$APP_DIR/$project"
        git pull --ff-only
    else
        echo "    $project — cloning..."
        rm -rf "$APP_DIR/$project"
        git clone "https://github.com/$GITHUB_USER/$project.git" "$APP_DIR/$project"
    fi
done

# Set SCRIPT_DIR so later steps can find deploy/ configs
SCRIPT_DIR="$APP_DIR/brighter-nepal/deploy"

# ── 4. PostgreSQL setup ─────────────────────────────────────────────────────
echo "[4/10] Configuring PostgreSQL..."
# Apply tuning
PG_CONF_DIR=$(find /etc/postgresql -name "postgresql.conf" -path "*/main/*" | head -1 | xargs dirname)
if [ -n "$PG_CONF_DIR" ]; then
    cp "$SCRIPT_DIR/postgresql/postgresql-tuning.conf" "$PG_CONF_DIR/conf.d/99-brighternepal.conf" 2>/dev/null || \
    cp "$SCRIPT_DIR/postgresql/postgresql-tuning.conf" "$PG_CONF_DIR/postgresql-tuning.conf"
fi

# Create database and user (skip if exists)
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$APP_USER'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER $APP_USER WITH PASSWORD 'REPLACE_DB_PASSWORD';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$APP_USER'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE $APP_USER OWNER $APP_USER;"

systemctl restart postgresql

# ── 5. Redis setup ───────────────────────────────────────────────────────────
echo "[5/10] Configuring Redis..."
cp "$SCRIPT_DIR/redis/redis-brighter.conf" /etc/redis/conf.d/brighter.conf 2>/dev/null || true
# If conf.d doesn't exist, append to main config
if [ ! -d "/etc/redis/conf.d" ]; then
    mkdir -p /etc/redis/conf.d
    echo "include /etc/redis/conf.d/*.conf" >> /etc/redis/redis.conf 2>/dev/null || true
    cp "$SCRIPT_DIR/redis/redis-brighter.conf" /etc/redis/conf.d/brighter.conf
fi
systemctl restart redis-server
systemctl enable redis-server

# ── 6. Python environments ───────────────────────────────────────────────────
echo "[6/10] Setting up Python virtual environments..."

# API
cd "$APP_DIR/brighter-nepal-api"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
deactivate

# Chat
cd "$APP_DIR/brighter-nepal-chat"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
deactivate

# ── 7. Next.js build ────────────────────────────────────────────────────────
echo "[7/10] Building Next.js frontend (this takes a minute)..."
cd "$APP_DIR/brighter-nepal"
npm ci 2>/dev/null || npm install
npm run build

# Copy static + public into standalone (required by standalone output)
if [ -d ".next/standalone" ]; then
    cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
    cp -r public .next/standalone/public 2>/dev/null || true
fi

# ── 8. Environment file ─────────────────────────────────────────────────────
echo "[8/10] Setting up environment..."
if [ ! -f "$APP_DIR/.env" ]; then
    cp "$SCRIPT_DIR/.env.production" "$APP_DIR/.env"
    echo "    ⚠  IMPORTANT: Edit /opt/brighternepal/.env with real secrets!"
    echo "       Change: SECRET_KEY, JWT_SECRET_KEY, DATABASE_URI password"
fi
chmod 600 "$APP_DIR/.env"

# Fix ownership
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# ── 9. Systemd services ─────────────────────────────────────────────────────
echo "[9/10] Installing systemd services..."
cp "$SCRIPT_DIR/systemd/bn-api.service"      /etc/systemd/system/
cp "$SCRIPT_DIR/systemd/bn-chat.service"     /etc/systemd/system/
cp "$SCRIPT_DIR/systemd/bn-frontend.service" /etc/systemd/system/

systemctl daemon-reload
systemctl enable bn-api bn-chat bn-frontend

# Initialize database tables
echo "    Initialising database tables..."
cd "$APP_DIR/brighter-nepal-api"
sudo -u "$APP_USER" bash -c "source venv/bin/activate && source /opt/brighternepal/.env 2>/dev/null; python -c 'from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all(); print(\"    ✓ Database tables created\")'"

# Start services
systemctl start bn-api bn-chat bn-frontend

# ── 10. Nginx + Cloudflare Origin SSL ────────────────────────────────────────
echo "[10/10] Configuring Nginx + Cloudflare Origin Certificate..."
cp "$SCRIPT_DIR/nginx/brighternepal.conf" /etc/nginx/sites-available/brighternepal.conf
ln -sf /etc/nginx/sites-available/brighternepal.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Optimise nginx main config for 8 GB VPS
cp "$SCRIPT_DIR/nginx/nginx.conf" /etc/nginx/nginx.conf

# Create SSL directory for Cloudflare origin certs
mkdir -p /etc/ssl/cloudflare

# Check if origin cert already exists
if [ ! -f "/etc/ssl/cloudflare/brighternepal.com.pem" ]; then
    echo ""
    echo "    ╔═══════════════════════════════════════════════════════════════╗"
    echo "    ║  Cloudflare Origin Certificate needed!                       ║"
    echo "    ║                                                             ║"
    echo "    ║  1. Go to: Cloudflare → brighternepal.com → SSL/TLS        ║"
    echo "    ║     → Origin Server → Create Certificate                    ║"
    echo "    ║  2. Hostnames: brighternepal.com, *.brighternepal.com       ║"
    echo "    ║     (RSA 2048, 15 years)                                    ║"
    echo "    ║  3. Copy the CERTIFICATE to:                                ║"
    echo "    ║     /etc/ssl/cloudflare/brighternepal.com.pem               ║"
    echo "    ║  4. Copy the PRIVATE KEY to:                                ║"
    echo "    ║     /etc/ssl/cloudflare/brighternepal.com.key               ║"
    echo "    ║  5. Then run: systemctl reload nginx                        ║"
    echo "    ╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    # Create placeholder so nginx doesn't crash — will be replaced
    openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
        -keyout /etc/ssl/cloudflare/brighternepal.com.key \
        -out /etc/ssl/cloudflare/brighternepal.com.pem \
        -subj "/CN=brighternepal.com" 2>/dev/null
    echo "    (Created temporary self-signed cert so nginx can start)"
fi

chmod 600 /etc/ssl/cloudflare/brighternepal.com.key
chmod 644 /etc/ssl/cloudflare/brighternepal.com.pem

nginx -t && systemctl reload nginx

# ── Firewall ─────────────────────────────────────────────────────────────────
echo "    Configuring firewall..."
ufw --force reset > /dev/null 2>&1
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable > /dev/null 2>&1

# ── Sysctl tuning for high-connection servers ────────────────────────────────
cat > /etc/sysctl.d/99-brighternepal.conf << 'SYSCTL'
# Allow more open files / sockets
fs.file-max = 65535
# Reuse TIME_WAIT sockets
net.ipv4.tcp_tw_reuse = 1
# Increase connection backlog
net.core.somaxconn = 4096
net.core.netdev_max_backlog = 4096
# TCP buffer sizes
net.ipv4.tcp_rmem = 4096 87380 6291456
net.ipv4.tcp_wmem = 4096 16384 6291456
# Keepalive
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 5
SYSCTL
sysctl --system > /dev/null 2>&1

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✓ Deployment complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  Services:"
echo "    systemctl status bn-api bn-chat bn-frontend"
echo ""
echo "  Logs:"
echo "    journalctl -u bn-api -f"
echo "    journalctl -u bn-chat -f"
echo "    journalctl -u bn-frontend -f"
echo ""
echo "  ⚠  BEFORE GOING LIVE:"
echo "    1. Edit /opt/brighternepal/.env — set real secrets & DB password"
echo "    2. Update DB password: sudo -u postgres psql -c \"ALTER USER brighternepal PASSWORD 'your-real-password';\""
echo "    3. Paste Cloudflare Origin Cert (*.brighternepal.com) into /etc/ssl/cloudflare/"
echo "    4. Restart: systemctl restart bn-api bn-chat bn-frontend nginx"
echo "    5. In Cloudflare DNS: add A records for api + chat → 163.47.151.249 (proxied)"
echo "    6. In Cloudflare: SSL/TLS → set mode to 'Full (Strict)'"
echo "    7. In Cloudflare: Network → enable WebSockets"
echo "    8. Verify: curl -I https://$DOMAIN && curl -I https://api.$DOMAIN/api/health"
echo ""
