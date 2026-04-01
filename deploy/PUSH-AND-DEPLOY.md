# Push & Deploy Commands

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Your Local PC                       │
│                                                       │
│  brighter-nepal/        → Next.js Frontend            │
│  brighter-nepal-api/    → Flask REST API              │
│  brighter-nepal-chat/   → Flask-SocketIO Chat Server  │
└──────────────┬───────────────────────────────────────┘
               │ git push
               ▼
┌──────────────────────────────────────────────────────┐
│                      GitHub                           │
│  bishalregmi105B/brighter-nepal                       │
│  bishalregmi105B/brighter-nepal-api                   │
│  bishalregmi105B/brighter-nepal-chat                  │
└──────────────┬───────────────────────────────────────┘
               │ git pull (via redeploy.sh)
               ▼
┌──────────────────────────────────────────────────────k┐
│              VPS Server (163.47.151.249)              │
│                                                       │
│  bn-frontend  → Next.js (port 3000)                  │
│  bn-api       → Flask REST API (Gunicorn, port 5000) │
│  bn-chat      → SocketIO Chat (Gunicorn, port 5001)  │
│  nginx        → Reverse proxy (ports 80/443)          │
│  postgresql   → Database                              │
│  redis        → Cache / message queue                 │
└──────────────────────────────────────────────────────┘
```

- You push code to GitHub from your local PC
- The VPS pulls from GitHub — you never upload files manually
- `redeploy.sh` handles git pull + install + build + restart automatically

---

## FIRST TIME ONLY — One-time setup sequence

### 1. Push this deploy folder to GitHub (local PC)
```bash
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal"
git add deploy/
git commit -m "add deploy configs"
git push
```

> Do this BEFORE anything on the VPS — the VPS needs to clone this from GitHub.

### 2. SSH into VPS and re-clone all repos fresh
```bash
ssh root@163.47.151.249
```

```bash
# Remove old copies (uploaded via rsync, no .git inside)
rm -rf /opt/brighternepal/brighter-nepal
rm -rf /opt/brighternepal/brighter-nepal-api
rm -rf /opt/brighternepal/brighter-nepal-chat

# Clone fresh from GitHub
git clone https://github.com/bishalregmi105B/brighter-nepal.git /opt/brighternepal/brighter-nepal
git clone https://github.com/bishalregmi105B/brighter-nepal-api.git /opt/brighternepal/brighter-nepal-api
git clone https://github.com/bishalregmi105B/brighter-nepal-chat.git /opt/brighternepal/brighter-nepal-chat
```

### 3. Run the full setup script
```bash
bash /opt/brighternepal/brighter-nepal/deploy/setup-server.sh
```

This installs everything: Nginx, PostgreSQL, Redis, Node.js, Python venvs, builds Next.js, sets up systemd services, configures firewall.

---

## EVERY TIME — Normal update workflow

### Step 1: Push your changes to GitHub (local PC)

```bash
# Frontend (Next.js)
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal"
git add -A && git commit -m "your message" && git push

# REST API (Flask — only if you changed API code)
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal-api"
git add -A && git commit -m "your message" && git push

# Chat/Socket Server (Flask-SocketIO — only if you changed chat code)
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal-chat"
git add -A && git commit -m "your message" && git push
```

### Step 2: Redeploy on VPS

```bash
# Deploy ALL three services at once
ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh all"

# Or deploy only what you changed:
ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh frontend"   # Next.js
ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh api"        # Flask REST API
ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh chat"       # Flask-SocketIO Chat
```

### Quick one-liners (push + deploy)

```bash
# Push & deploy frontend only
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal" && git add -A && git commit -m "update frontend" && git push && ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh frontend"

# Push & deploy API only
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal-api" && git add -A && git commit -m "update api" && git push && ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh api"

# Push & deploy chat/socket only
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal-chat" && git add -A && git commit -m "update chat" && git push && ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh chat"

# Push & deploy ALL three
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal" && git add -A && git commit -m "update" && git push && cd ../brighter-nepal-api && git add -A && git commit -m "update" && git push && cd ../brighter-nepal-chat && git add -A && git commit -m "update" && git push && ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh all"
```

---

## What redeploy.sh Does Automatically

| Step | Frontend (Next.js) | API (Flask) | Chat (Flask-SocketIO) |
|------|-------------------|-------------|----------------------|
| 1 | `git pull` | `git pull` | `git pull` |
| 2 | `npm install` | `pip install -r requirements.txt` | `pip install -r requirements.txt` |
| 3 | `npm run build` | — | — |
| 4 | Copy static assets | — | — |
| 5 | `systemctl restart bn-frontend` | `systemctl restart bn-api` | `systemctl restart bn-chat` |

---

## Which service to redeploy?

| What you changed | Service to deploy |
|---|---|
| Files in `brighter-nepal/` (app/, components/, hooks/, services/, lib/, public/) | `frontend` |
| Files in `brighter-nepal-api/` (app/routes/, app/models/, config.py) | `api` |
| Files in `brighter-nepal-chat/` (app.py, word filter, socket routing) | `chat` |
| All of the above | `all` |

---

## Check Status After Deploy
```bash
ssh root@163.47.151.249 "systemctl status bn-api bn-chat bn-frontend --no-pager"
```

## View Logs If Something Fails
```bash
# Frontend logs
ssh root@163.47.151.249 "journalctl -u bn-frontend --no-pager -n 30"

# REST API logs
ssh root@163.47.151.249 "journalctl -u bn-api --no-pager -n 30"

# Chat/Socket server logs
ssh root@163.47.151.249 "journalctl -u bn-chat --no-pager -n 30"

# All logs at once
ssh root@163.47.151.249 "journalctl -u bn-api -u bn-chat -u bn-frontend --no-pager -n 50"
```
