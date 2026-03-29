# Push & Deploy Commands

## How It Works

```
Your PC  ──git push──►  GitHub  ──git pull──►  VPS Server
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
# Frontend
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal"
git add -A && git commit -m "your message" && git push

# API (only if you changed API code)
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal-api"
git add -A && git commit -m "your message" && git push

# Chat (only if you changed chat code)
cd "/home/bishal-regmi/Desktop/Company Works/BrighterNepal/brighter-nepal-chat"
git add -A && git commit -m "your message" && git push
```

### Step 2: Redeploy on VPS

```bash
# Deploy all services
ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh all"

# Or deploy only what changed
ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh frontend"
ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh api"
ssh root@163.47.151.249 "bash /opt/brighternepal/brighter-nepal/deploy/redeploy.sh chat"
```

---

## What redeploy.sh Does Automatically

| Step | Frontend | API | Chat |
|------|----------|-----|------|
| 1 | `git pull` | `git pull` | `git pull` |
| 2 | `npm install` | `pip install -r requirements.txt` | `pip install -r requirements.txt` |
| 3 | `npm run build` | — | — |
| 4 | Copy static assets | — | — |
| 5 | `systemctl restart bn-frontend` | `systemctl restart bn-api` | `systemctl restart bn-chat` |

---

## Check Status After Deploy
```bash
ssh root@163.47.151.249 "systemctl status bn-api bn-chat bn-frontend --no-pager"
```

## View Logs If Something Fails
```bash
ssh root@163.47.151.249 "journalctl -u bn-frontend --no-pager -n 30"
ssh root@163.47.151.249 "journalctl -u bn-api --no-pager -n 30"
ssh root@163.47.151.249 "journalctl -u bn-chat --no-pager -n 30"
```
