# BrighterNepal Deployment Guide

> **Server**: 4 vCPU / 8 GB RAM VPS  
> **IP**: `163.47.151.249`  
> **Domain**: `brighternepal.com` (Cloudflare)  
> **Nameservers**: `hope.ns.cloudflare.com`, `tate.ns.cloudflare.com`

---

## PART 1: Cloudflare Setup (in browser)

### Step 1.1 — Add DNS Records

Go to: **Cloudflare → brighternepal.com → DNS → Records → + Add record**

Add these 4 records one by one:

| Type | Name | Content | Proxy status | TTL |
|------|------|---------|-------------|-----|
| **A** | `@` | `163.47.151.249` | **Proxied** (orange cloud ON) | Auto |
| **A** | `api` | `163.47.151.249` | **Proxied** (orange cloud ON) | Auto |
| **A** | `chat` | `163.47.151.249` | **Proxied** (orange cloud ON) | Auto |
| **CNAME** | `www` | `brighternepal.com` | **Proxied** (orange cloud ON) | Auto |

After adding, your DNS page should show 4 records.

### Step 1.2 — SSL/TLS Mode

Go to: **SSL/TLS** (left sidebar) → **Overview**

- Set encryption mode to: **Full (strict)**

### Step 1.3 — Create Origin Certificate

Go to: **SSL/TLS** → **Origin Server** → **Create Certificate**

- Private key type: **RSA (2048)**
- Hostnames: make sure both are listed:
  - `brighternepal.com`
  - `*.brighternepal.com`
- Certificate validity: **15 years**
- Click **Create**

You'll see two text boxes:

1. **Origin Certificate** — starts with `-----BEGIN CERTIFICATE-----`
2. **Private Key** — starts with `-----BEGIN PRIVATE KEY-----`

**IMPORTANT: Copy both and save them to files on your computer:**

```
# Save Certificate as:
origin-cert.pem

# Save Private Key as:
origin-key.key
```

> ⚠️ The private key is shown ONLY ONCE. If you lose it, you must create a new certificate.

### Step 1.4 — Enable WebSockets

Go to: **Network** (left sidebar)

- Toggle **WebSockets** → **ON**

### Step 1.5 — Caching Settings (optional but recommended)

Go to: **Caching** → **Configuration**

- Browser Cache TTL: **Respect Existing Headers**

Go to: **Speed** → **Optimization** → **Content Optimization**

- Auto Minify: check **JavaScript**, **CSS**, **HTML**
- Brotli: **ON**

---

## PART 2: VPS Server Setup

### Step 2.1 — SSH into your server

Open a terminal on your local machine:

```bash
ssh root@163.47.151.249
```

Enter your VPS root password when prompted.

### Step 2.2 — Quick server health check

```bash
# Check OS version
cat /etc/os-release | head -3

# Check CPU and RAM
nproc && free -h

# Check disk space
df -h /
```

You should see 4 CPUs, ~8GB RAM, and enough disk space.

### Step 2.3 — Update the system

```bash
apt update && apt upgrade -y
```

### Step 2.4 — Exit SSH (back to local machine)

```bash
exit
```

---

## PART 3: Upload Code to VPS

### Step 3.1 — Clone repos on the VPS

SSH into the VPS first:

```bash
ssh root@163.47.151.249
```

Create the app directory and clone all 3 repos:

```bash
mkdir -p /opt/brighternepal
cd /opt/brighternepal

git clone https://github.com/bishalregmi105B/brighter-nepal.git
git clone https://github.com/bishalregmi105B/brighter-nepal-api.git
git clone https://github.com/bishalregmi105B/brighter-nepal-chat.git
```

Wait for all 3 clones to finish.

### Step 3.2 — Upload Cloudflare Origin Certificate

```bash
# Create the SSL directory on the server
ssh root@163.47.151.249 "mkdir -p /etc/ssl/cloudflare"

# Upload the certificate (adjust path to where you saved them)
scp /path/to/origin-cert.pem root@163.47.151.249:/etc/ssl/cloudflare/brighternepal.com.pem
scp /path/to/origin-key.key root@163.47.151.249:/etc/ssl/cloudflare/brighternepal.com.key

# Lock down the private key
ssh root@163.47.151.249 "chmod 600 /etc/ssl/cloudflare/brighternepal.com.key && chmod 644 /etc/ssl/cloudflare/brighternepal.com.pem"
```

---

## PART 4: Run the Deployment Script

### Step 4.1 — SSH back in and run setup

If you exited SSH after uploading the cert, reconnect:

```bash
ssh root@163.47.151.249
```

```bash
chmod +x /opt/brighternepal/brighter-nepal/deploy/setup-server.sh
bash /opt/brighternepal/brighter-nepal/deploy/setup-server.sh
```

This script will automatically:
- ✅ Install Nginx, PostgreSQL, Redis, Node.js 20, Python 3
- ✅ Create the `brighternepal` system user
- ✅ Copy application code to `/opt/brighternepal/`
- ✅ Configure PostgreSQL with optimized settings
- ✅ Configure Redis with 256MB memory limit
- ✅ Create Python virtual environments and install packages
- ✅ Build the Next.js frontend (standalone mode)
- ✅ Set up systemd services for all 3 apps
- ✅ Configure Nginx reverse proxy with Cloudflare settings
- ✅ Configure firewall (UFW)
- ✅ Apply kernel network tuning

Wait for it to finish. It will print status messages for each step.

---

## PART 5: Configure Secrets

### Step 5.1 — Generate secure secrets

```bash
# Generate values (still on the VPS)
echo "SECRET_KEY: $(openssl rand -hex 32)"
echo "JWT_SECRET_KEY: $(openssl rand -hex 32)"
echo "URL_CIPHER_KEY: $(openssl rand -hex 8)"
DB_PASS=$(openssl rand -base64 24 | tr -d '=/+' | head -c 32)
echo "DB_PASSWORD: $DB_PASS"
```

Copy all 4 values somewhere temporarily.

### Step 5.2 — Set the PostgreSQL password

```bash
sudo -u postgres psql -c "ALTER USER brighternepal PASSWORD '$DB_PASS';"
```

### Step 5.3 — Edit the environment file

```bash
nano /opt/brighternepal/.env
```

Replace these lines with the real values you generated:

```env
SECRET_KEY=<paste your SECRET_KEY here>
JWT_SECRET_KEY=<paste your JWT_SECRET_KEY here>
URL_CIPHER_KEY=<paste your URL_CIPHER_KEY here>
DATABASE_URI=postgresql://brighternepal:<paste DB_PASS here>@127.0.0.1:5432/brighternepal
```

Make sure these URLs are correct:
```env
FRONTEND_URL=https://brighternepal.com
NEXT_PUBLIC_API_URL=https://api.brighternepal.com
NEXT_PUBLIC_CHAT_URL=https://chat.brighternepal.com
```

Save: press `Ctrl+X`, then `Y`, then `Enter`.

### Step 5.4 — Rebuild frontend with the correct env vars

The Next.js frontend needs `NEXT_PUBLIC_*` vars at build time:

```bash
cd /opt/brighternepal/brighter-nepal
export NEXT_PUBLIC_API_URL=https://api.brighternepal.com
export NEXT_PUBLIC_CHAT_URL=https://chat.brighternepal.com
sudo -u brighternepal bash -c "export NEXT_PUBLIC_API_URL=https://api.brighternepal.com && export NEXT_PUBLIC_CHAT_URL=https://chat.brighternepal.com && npm run build"

# Copy static assets into standalone
cp -r .next/static .next/standalone/.next/static 2>/dev/null || true
cp -r public .next/standalone/public 2>/dev/null || true
chown -R brighternepal:brighternepal /opt/brighternepal
```

---

## PART 6: Start Everything

### Step 6.1 — Restart all services

```bash
systemctl restart bn-api bn-chat bn-frontend nginx
```

### Step 6.2 — Check all services are running

```bash
systemctl status bn-api bn-chat bn-frontend nginx --no-pager
```

All 4 should show **active (running)** in green.

### Step 6.3 — Test locally on the VPS

```bash
# Test API
curl -s http://127.0.0.1:5000/api/health
# Expected: {"status": "ok"} or similar JSON

# Test Frontend
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000
# Expected: HTTP 200

# Test Chat
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:5001
# Expected: HTTP 200 or 404 (both mean it's running)

# Test Redis
redis-cli ping
# Expected: PONG

# Test PostgreSQL
sudo -u brighternepal psql -d brighternepal -c "SELECT count(*) FROM information_schema.tables;"
# Expected: a count number
```

---

## PART 7: Verify Live Site

### Step 7.1 — Test through Cloudflare

```bash
# From the VPS (or your local machine)
curl -I https://brighternepal.com
# Expected: HTTP/2 200

curl -I https://api.brighternepal.com/api/health
# Expected: HTTP/2 200

curl -I https://chat.brighternepal.com
# Expected: HTTP/2 200 or 404
```

### Step 7.2 — Open in browser

Open these URLs in your browser:

1. **https://brighternepal.com** — should show the homepage
2. **https://api.brighternepal.com/api/health** — should show JSON health response

### Step 7.3 — Check SSL certificate

Click the lock icon in browser → the certificate should say **Cloudflare Inc** (Cloudflare's edge cert), and the connection to your origin uses the Origin Certificate.

---

## PART 8: Troubleshooting

### If a service won't start

```bash
# Check logs for each service
journalctl -u bn-api --no-pager -n 50
journalctl -u bn-chat --no-pager -n 50
journalctl -u bn-frontend --no-pager -n 50
```

### If Nginx won't start

```bash
nginx -t
# This will show the exact config error

journalctl -u nginx --no-pager -n 30
```

### If database connection fails

```bash
# Try connecting manually
sudo -u brighternepal psql -d brighternepal -c "SELECT 1;"

# Check PostgreSQL is running
systemctl status postgresql
```

### If site shows 502 Bad Gateway

```bash
# The backend isn't running. Check which one:
curl -s http://127.0.0.1:3000  # Frontend
curl -s http://127.0.0.1:5000  # API
curl -s http://127.0.0.1:5001  # Chat

# Restart the one that's down:
systemctl restart bn-frontend  # or bn-api or bn-chat
```

### If WebSocket chat doesn't connect

1. Make sure Cloudflare WebSockets is ON: **Network → WebSockets → ON**
2. Check chat service: `systemctl status bn-chat`
3. Check browser console for errors
4. Verify CORS: the chat service must allow `https://brighternepal.com`

### If site is slow

```bash
# Check CPU and RAM usage
htop

# Check which service uses most resources
ps aux --sort=-%mem | head -15

# Check PostgreSQL slow queries
sudo -u postgres psql -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC LIMIT 5;"
```

---

## PART 9: Future Code Updates

### When you make changes locally and want to deploy:

**Step 1: Push your changes to GitHub from your local machine:**

```bash
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal"
git add -A && git commit -m "your commit message" && git push

# Repeat for API and Chat if changed:
cd ../brighter-nepal-api
git add -A && git commit -m "your commit message" && git push

cd ../brighter-nepal-chat
git add -A && git commit -m "your commit message" && git push
```

**Step 2: SSH into VPS and redeploy:**

```bash
ssh root@163.47.151.249

# Redeploy everything
bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh all
```

The redeploy script will automatically `git pull` the latest code, install any new dependencies, rebuild if needed, and restart services.

### Deploy only specific services:

```bash
bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh api        # Just the API
bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh chat       # Just the chat
bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh frontend   # Just the frontend
```

---

## Architecture Summary

```
                    Internet
                       │
                 ┌─────┴─────┐
                 │ Cloudflare │  ← SSL termination, CDN, DDoS protection
                 └─────┬─────┘
                       │
              163.47.151.249 (VPS)
                       │
                 ┌─────┴─────┐
                 │   Nginx   │  ← Reverse proxy, rate limiting, static files
                 └─────┬─────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
   brighternepal.com  api.         chat.
          │        brighternepal   brighternepal
          │            │            │
    ┌─────┴─────┐ ┌───┴───┐  ┌────┴────┐
    │  Next.js  │ │ Flask │  │SocketIO │
    │  :3000    │ │ :5000 │  │  :5001  │
    └───────────┘ └───┬───┘  └────┬────┘
                      │           │
               ┌──────┴───────────┤
               │                  │
          ┌────┴─────┐      ┌────┴────┐
          │PostgreSQL │      │  Redis  │
          │  :5432   │      │  :6379  │
          └──────────┘      └─────────┘
```

---

## Service Ports (internal only — not exposed to internet)

| Service | Port | Process |
|---------|------|---------|
| Next.js Frontend | 3000 | `node server.js` |
| Flask API | 5000 | `gunicorn (gevent, 4 workers)` |
| Flask Chat | 5001 | `gunicorn (gevent-websocket, 2 workers)` |
| PostgreSQL | 5432 | `postgresql` |
| Redis | 6379 | `redis-server` |

Only ports **80** and **443** are exposed to the internet via Nginx + UFW firewall.
